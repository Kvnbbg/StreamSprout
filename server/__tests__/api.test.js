const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');
const { createInMemoryPlayerRepository } = require('../repositories/playerRepository');
const { createLlmClient } = require('../llmClient');
const { createLogger } = require('../logger');

let server;
let baseUrl;

const startServer = (app) =>
    new Promise((resolve) => {
        const instance = app.listen(0, () => {
            const { port } = instance.address();
            resolve({ instance, url: `http://localhost:${port}` });
        });
    });

beforeEach(async () => {
    const logger = createLogger({ level: 'error' });
    const playerRepository = createInMemoryPlayerRepository();
    const llmClient = createLlmClient({ mockResponse: 'Mocked LLM response', logger });
    const app = createApp({ playerRepository, llmClient, logger });

    const started = await startServer(app);
    server = started.instance;
    baseUrl = started.url;
});

afterEach(() => {
    if (server) {
        server.close();
    }
});

test('returns health status', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
});

test('creates and lists players', async () => {
    const createResponse = await fetch(`${baseUrl}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Jett Ace',
            role: 'Duelist',
            rank: 'Radiant',
            agent: 'Jett',
        }),
    });

    assert.equal(createResponse.status, 201);

    const listResponse = await fetch(`${baseUrl}/players`);
    const players = await listResponse.json();
    assert.equal(listResponse.status, 200);
    assert.equal(players.length, 1);
});

test('searches players by name', async () => {
    await fetch(`${baseUrl}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Sage Support',
            role: 'Sentinel',
            rank: 'Immortal',
            agent: 'Sage',
        }),
    });

    const searchResponse = await fetch(`${baseUrl}/search-players?name=Sage`);
    const results = await searchResponse.json();
    assert.equal(searchResponse.status, 200);
    assert.equal(results[0].name, 'Sage Support');
});

test('returns a mocked LLM response', async () => {
    const response = await fetch(`${baseUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'Who should I scout?' }),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.answer, 'Mocked LLM response');
});
