const db = require('../config/database');
const logger = require('../utils/logger');

class DispatchEarningRepository {
    async create(earningData) {
        try {
            const [earning] = await db('dispatch_earnings')
                .insert(earningData)
                .returning('*');
            return earning;
        } catch (error) {
            logger.error('Error creating dispatch earning', { error: error.message });
            throw error;
        }
    }

    async getPartnerEarnings(partnerId) {
        try {
            const earnings = await db('dispatch_earnings')
                .where('dispatch_partner_id', partnerId)
                .select(
                    db.raw('SUM(amount) as total_earnings'),
                    db.raw('SUM(CASE WHEN status = \'pending\' THEN amount ELSE 0 END) as pending_earnings'),
                    db.raw('SUM(CASE WHEN status = \'paid\' THEN amount ELSE 0 END) as paid_earnings'),
                    db.raw('COUNT(*) as total_deliveries')
                )
                .first();

            return {
                total_earnings: earnings.total_earnings || 0,
                pending_earnings: earnings.pending_earnings || 0,
                paid_earnings: earnings.paid_earnings || 0,
                total_deliveries: parseInt(earnings.total_deliveries) || 0
            };
        } catch (error) {
            logger.error('Error getting partner earnings', { error: error.message, partnerId });
            throw error;
        }
    }
}

module.exports = new DispatchEarningRepository();