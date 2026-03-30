const express = require('express');
const cors = require('cors');
const path = require('path');
const { AppError, errorHandler } = require('./errors');

const { GameEngine } = require('./game/GameEngine');
const { GameStateStore } = require('./game/GameStateStore');
const { AIDecisionGateway } = require('./game/AIDecisionGateway');
const { RenderAdapter } = require('./game/RenderAdapter');
const { Telemetry } = require('./game/Telemetry');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const requestLogger = (logger) => (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const durationMs = Date.now() - start;
        logger.info(
            {
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                durationMs,
            },
            'request'
        );
    });
    next();
};

const getRequiredString = (value, field) => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new AppError(`${field} is required.`, 400);
    }
    return value.trim();
};

const parsePositiveInt = (value, field) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError(`${field} must be a positive integer.`, 400);
    }
    return parsed;
};

const parseEnum = (value, field, allowedValues) => {
    const normalized = getRequiredString(value, field);
    if (!allowedValues.includes(normalized)) {
        throw new AppError(`${field} must be one of: ${allowedValues.join(', ')}.`, 400);
    }
    return normalized;
};

const extractLlmAnswer = (result) => {
    if (typeof result === 'string' && result.trim()) {
        return result;
    }

    if (result && typeof result.answer === 'string' && result.answer.trim()) {
        return result.answer;
    }

    throw new AppError('LLM response format is invalid.', 502);
};

const createSimpleLimiter = ({ windowMs, max }) => {
    const hits = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key = req.ip;
        const entry = hits.get(key) || { count: 0, start: now };

        if (now - entry.start > windowMs) {
            entry.count = 0;
            entry.start = now;
        }

        entry.count += 1;
        hits.set(key, entry);

        if (entry.count > max) {
            return next(new AppError('Too many requests, please try again later.', 429));
        }

        return next();
    };
};

const createApp = ({ playerRepository, llmClient, logger }) => {
    const app = express();
    const gameStateStore = new GameStateStore();
    const telemetry = new Telemetry();
    const gameEngine = new GameEngine({ detectionRadius: 72 });
    const renderAdapter = new RenderAdapter();
    const aiGateway = new AIDecisionGateway({
        telemetry,
        policyClient: async (input) => {
            const answer = await llmClient.ask(`Return JSON only for game policy. Input: ${JSON.stringify(input)}`);
            if (answer && answer.answer) {
                return JSON.parse(answer.answer);
            }
            return JSON.parse(answer);
        },
    });

    app.use(requestLogger(logger));
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    const indexLimiter = createSimpleLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });

    app.get('/', indexLimiter, (req, res) =>
        res.sendFile(path.join(__dirname, '../public/index.html'))
    );

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.get(
        '/players',
        asyncHandler(async (req, res) => {
            const players = await playerRepository.getAll();
            res.status(200).json(players);
        })
    );

    app.get(
        '/players/:id',
        asyncHandler(async (req, res) => {
            const id = parsePositiveInt(req.params.id, 'Player id');
            const player = await playerRepository.getById(id);
            if (!player) {
                throw new AppError('Player not found.', 404);
            }
            res.status(200).json(player);
        })
    );

    app.post(
        '/players',
        asyncHandler(async (req, res) => {
            const payload = {
                name: getRequiredString(req.body.name, 'Name'),
                role: getRequiredString(req.body.role, 'Role'),
                rank: getRequiredString(req.body.rank, 'Rank'),
                agent: getRequiredString(req.body.agent, 'Agent'),
            };
            const newPlayer = await playerRepository.create(payload);
            res.status(201).json(newPlayer);
        })
    );

    app.get(
        '/search-players',
        asyncHandler(async (req, res) => {
            const name = getRequiredString(req.query.name, 'Search term');
            const players = await playerRepository.searchByName(name);
            res.status(200).json(players);
        })
    );

    app.post(
        '/build-team',
        asyncHandler(async (req, res) => {
            const payload = {
                role: getRequiredString(req.body.role, 'Role'),
                agent: getRequiredString(req.body.agent, 'Agent'),
            };
            const players = await playerRepository.buildTeam(payload);
            res.status(200).json(players);
        })
    );

    app.post(
        '/ask',
        asyncHandler(async (req, res) => {
            const question = getRequiredString(req.body.question, 'Question');
            const llmResult = await llmClient.ask(question);
            const answer = extractLlmAnswer(llmResult);
            res.status(200).json({ answer });
        })
    );

    app.post(
        '/create-team',
        asyncHandler(async (req, res) => {
            const type = getRequiredString(req.body.type, 'Team type');
            const prompts = {
                'Professional Team Submission': 'Build a team using only players from VCT International.',
                'Content Creator Squad': 'Build a team using streamers who are active in the VALORANT community.',
                'Analyst-Driven Team': 'Build a team using players with high clutch statistics and strong strategic play.',
            };
            const prompt = prompts[type];
            if (!prompt) {
                throw new AppError('Invalid team type.', 400);
            }
            const response = await llmClient.ask(prompt);
            res.status(200).json(response);
        })
    );


    app.post(
        '/v1/simulation/tick',
        asyncHandler(async (req, res) => {
            const sessionId = getRequiredString(req.body.session_id, 'session_id');
            const dtMs = parsePositiveInt(req.body.dt_ms, 'dt_ms');
            if (dtMs < 8 || dtMs > 100) {
                throw new AppError('dt_ms must be between 8 and 100.', 400);
            }

            const state = gameStateStore.getOrCreate(sessionId);
            if (Array.isArray(req.body.entities) && req.body.entities.length > 0) {
                state.entities = req.body.entities;
            }
            const next = gameEngine.tick(state, dtMs);
            gameStateStore.save(sessionId, next);
            telemetry.inc('ticks');
            res.status(200).json({
                state: renderAdapter.toClientState(next),
                events: [],
                server_time_ms: Date.now(),
            });
        })
    );

    app.post(
        '/v1/ai/decision',
        asyncHandler(async (req, res) => {
            const body = req.body || {};
            const required = ['player_state', 'nearby_entities_summary', 'difficulty', 'latency_budget_ms'];
            for (const k of required) {
                if (body[k] === undefined) {
                    throw new AppError(`Missing field: ${k}`, 400);
                }
            }

            if (typeof body.player_state !== 'object' || body.player_state === null || Array.isArray(body.player_state)) {
                throw new AppError('player_state must be an object.', 400);
            }

            if (!Array.isArray(body.nearby_entities_summary)) {
                throw new AppError('nearby_entities_summary must be an array.', 400);
            }

            body.difficulty = parseEnum(body.difficulty, 'difficulty', ['easy', 'normal', 'hard']);
            body.latency_budget_ms = parsePositiveInt(body.latency_budget_ms, 'latency_budget_ms');
            const decision = await aiGateway.decide(body);
            res.status(200).json(decision);
        })
    );

    app.get('/v1/telemetry', (req, res) => {
        res.status(200).json(telemetry.counters);
    });
    app.use((req, res, next) => next(new AppError('Route not found.', 404)));
    app.use(errorHandler(logger));

    return app;
};

module.exports = { createApp };
