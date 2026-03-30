const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const ORIGINAL_ENV = { ...process.env };

const loadEnv = () => {
    delete require.cache[require.resolve('../config')];
    return require('../config').env;
};

afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete require.cache[require.resolve('../config')];
});

test('falls back to in-memory database in development when no db config is provided', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.USE_IN_MEMORY_DB;
    delete process.env.DATABASE_URL;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;

    const env = loadEnv();
    assert.equal(env.USE_IN_MEMORY_DB, true);
});

test('throws in production when db config is missing and in-memory mode is disabled', () => {
    process.env.NODE_ENV = 'production';
    process.env.USE_IN_MEMORY_DB = 'false';
    delete process.env.DATABASE_URL;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;

    assert.throws(
        () => loadEnv(),
        /Missing database configuration\. Provide DATABASE_URL or DB_USER, DB_PASSWORD, DB_NAME in \.env\./
    );
});
