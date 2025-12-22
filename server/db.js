const { Pool } = require('pg');

const createPool = (config) => {
    if (config.env.USE_IN_MEMORY_DB) {
        return null;
    }

    if (config.env.DATABASE_URL) {
        return new Pool({
            connectionString: config.env.DATABASE_URL,
        });
    }

    return new Pool({
        user: config.env.DB_USER,
        host: config.env.DB_HOST,
        database: config.env.DB_NAME,
        password: config.env.DB_PASSWORD,
        port: config.env.DB_PORT,
    });
};

module.exports = { createPool };
