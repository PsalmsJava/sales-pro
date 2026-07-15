const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;

class ClientLogger {
    constructor(context = 'App') {
        this.context = context;
    }

    formatMessage(level, message, data = {}) {
        return {
            timestamp: new Date().toISOString(),
            level,
            context: this.context,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }

    debug(message, data) {
        if (currentLevel <= LOG_LEVELS.DEBUG) {
            const log = this.formatMessage('DEBUG', message, data);
            console.debug(`[${log.timestamp}] [DEBUG] [${this.context}]`, message, data);
        }
    }

    info(message, data) {
        if (currentLevel <= LOG_LEVELS.INFO) {
            const log = this.formatMessage('INFO', message, data);
            console.info(`[${log.timestamp}] [INFO] [${this.context}]`, message, data);
        }
    }

    warn(message, data) {
        if (currentLevel <= LOG_LEVELS.WARN) {
            const log = this.formatMessage('WARN', message, data);
            console.warn(`[${log.timestamp}] [WARN] [${this.context}]`, message, data);
        }
    }

    error(message, error) {
        if (currentLevel <= LOG_LEVELS.ERROR) {
            const log = this.formatMessage('ERROR', message, {
                error: error?.message,
                stack: error?.stack
            });
            console.error(`[${log.timestamp}] [ERROR] [${this.context}]`, message, error);
        }
    }
}

export default ClientLogger;