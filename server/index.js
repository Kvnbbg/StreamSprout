const { env } = require('./config');
const { createLogger } = require('./logger');
const { createPool } = require('./db');
const { createPlayerRepository, createInMemoryPlayerRepository } = require('./repositories/playerRepository');
const { createLlmClient } = require('./llmClient');
const { createApp } = require('./app');

const logger = createLogger();

const pool = createPool({ env });
const playerRepository = env.USE_IN_MEMORY_DB
    ? createInMemoryPlayerRepository()
    : createPlayerRepository({ pool });

const llmClient = createLlmClient({
    endpoint: env.BEDROCK_API_ENDPOINT,
    apiKey: env.BEDROCK_API_KEY,
    mockResponse: env.LLM_MOCK_RESPONSE,
    logger,
});

const app = createApp({ playerRepository, llmClient, logger });

const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`Server is running on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
    logger.info('Shutting down server...');
    if (pool) {
        await pool.end();
    }
    server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { app };
