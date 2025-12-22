const express = require('express');
const cors = require('cors');
const path = require('path');
const { AppError, errorHandler } = require('./errors');

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
            const answer = await llmClient.ask(question);
            res.status(200).json({ answer: answer.answer });
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

    app.use((req, res, next) => next(new AppError('Route not found.', 404)));
    app.use(errorHandler(logger));

    return app;
};

module.exports = { createApp };
