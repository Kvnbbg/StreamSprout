class AppError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

const errorHandler = (logger) => (err, req, res, next) => {
    const status = err.statusCode || 500;
    const payload = {
        error: err.message || 'Internal Server Error',
    };

    if (err.details) {
        payload.details = err.details;
    }

    if (logger) {
        logger.error({ err, status, path: req.path }, 'Request failed');
    }

    res.status(status).json(payload);
};

module.exports = { AppError, errorHandler };
