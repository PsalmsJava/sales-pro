const db = require('../config/database');
const logger = require('../utils/logger');

const auditLogger = (action, entity) => {
    return async (req, res, next) => {
        const originalJson = res.json;

        res.json = async function (data) {
            try {
                const auditEntry = {
                    id: require('uuid').v4(),
                    user_id: req.user?.id || null,
                    user_role: req.user?.role || 'system',
                    action: action,
                    entity: entity,
                    entity_id: req.params.id || data?.id || null,
                    old_values: req.oldValues || null,
                    new_values: action !== 'DELETE' ? req.body : null,
                    ip_address: req.ip,
                    user_agent: req.get('user-agent'),
                    endpoint: req.originalUrl,
                    method: req.method,
                    timestamp: new Date()
                };

                await db('audit_logs').insert(auditEntry);
                logger.info('Audit log created', {
                    action,
                    entity,
                    userId: req.user?.id,
                    endpoint: req.originalUrl
                });
            } catch (error) {
                logger.error('Failed to create audit log', error);
            }

            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = auditLogger;