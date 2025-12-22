const createLogger = (options = {}) => {
    const level = options.level || process.env.LOG_LEVEL || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(level);

    const log = (logLevel, message, meta = {}) => {
        if (levels.indexOf(logLevel) < currentLevelIndex) return;
        const payload = {
            level: logLevel,
            message,
            time: new Date().toISOString(),
            ...meta,
        };
        const output = JSON.stringify(payload);
        if (logLevel === 'error') {
            console.error(output);
        } else {
            console.log(output);
        }
    };

    const normalize = (meta, message, fallback) => {
        if (typeof meta === 'string') {
            return { meta: {}, message: meta };
        }
        return { meta: meta || {}, message: message || fallback };
    };

    return {
        debug: (meta, message) => {
            const normalized = normalize(meta, message, 'debug');
            log('debug', normalized.message, normalized.meta);
        },
        info: (meta, message) => {
            const normalized = normalize(meta, message, 'info');
            log('info', normalized.message, normalized.meta);
        },
        warn: (meta, message) => {
            const normalized = normalize(meta, message, 'warn');
            log('warn', normalized.message, normalized.meta);
        },
        error: (meta, message) => {
            const normalized = normalize(meta, message, 'error');
            log('error', normalized.message, normalized.meta);
        },
    };
};

module.exports = { createLogger };
