const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const requestLogger = (req, res, next) => {
    const requestId = uuidv4();
    req.requestId = requestId;

    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            requestId,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip,
            userId: req.user?.id || 'anonymous'
        };

        if (res.statusCode >= 400) {
            logger.error('Request failed', logData);
        } else {
            logger.info('Request completed', logData);
        }
    });

    next();
};

module.exports = requestLogger;