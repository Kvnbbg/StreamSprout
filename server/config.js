const dotenv = require('dotenv');

dotenv.config();

const parseNumber = (value, fallback) => {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

const parseBoolean = (value, fallback = false) => {
    if (value === undefined) return fallback;
    if (typeof value === 'boolean') return value;
    return value.toLowerCase() === 'true';
};

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseNumber(process.env.PORT, 5000),
    DATABASE_URL: process.env.DATABASE_URL || '',
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_NAME: process.env.DB_NAME,
    DB_PORT: parseNumber(process.env.DB_PORT, 5432),
    BEDROCK_API_KEY: process.env.BEDROCK_API_KEY,
    BEDROCK_API_ENDPOINT: process.env.BEDROCK_API_ENDPOINT,
    LLM_MOCK_RESPONSE: process.env.LLM_MOCK_RESPONSE,
    USE_IN_MEMORY_DB: parseBoolean(process.env.USE_IN_MEMORY_DB),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

if (!env.USE_IN_MEMORY_DB && !env.DATABASE_URL) {
    const missing = ['DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter((key) => !env[key]);
    if (missing.length) {
        throw new Error(
            `Missing database configuration. Provide DATABASE_URL or ${missing.join(', ')} in .env.`
        );
    }
}

module.exports = { env };
