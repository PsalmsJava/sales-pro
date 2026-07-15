const Earning = require('../models/Earning');
const logger = require('../utils/logger');

class EarningRepository {
    async findByUser(userId, filters) {
        try {
            return await Earning.findByUser(userId, filters);
        } catch (error) {
            logger.error('Error finding earnings', { error: error.message, userId });
            throw error;
        }
    }

    async getEarningsSummary(userId) {
        try {
            return await Earning.getEarningsSummary(userId);
        } catch (error) {
            logger.error('Error getting earnings summary', { error: error.message, userId });
            throw error;
        }
    }

    async getTopProductsByEarnings(userId, limit) {
        try {
            return await Earning.getTopProductsByEarnings(userId, limit);
        } catch (error) {
            logger.error('Error getting top products', { error: error.message, userId });
            throw error;
        }
    }

    async getMonthlyEarnings(userId, months) {
        try {
            return await Earning.getMonthlyEarnings(userId, months);
        } catch (error) {
            logger.error('Error getting monthly earnings', { error: error.message, userId });
            throw error;
        }
    }

    async create(earningData) {
        try {
            return await Earning.create(earningData);
        } catch (error) {
            logger.error('Error creating earning', { error: error.message });
            throw error;
        }
    }

    async updateStatus(id, status) {
        try {
            return await Earning.updateStatus(id, status);
        } catch (error) {
            logger.error('Error updating earning status', { error: error.message, earningId: id });
            throw error;
        }
    }

    async bulkCreate(earningsData) {
        try {
            return await Earning.bulkCreate(earningsData);
        } catch (error) {
            logger.error('Error bulk creating earnings', { error: error.message });
            throw error;
        }
    }
}

module.exports = new EarningRepository();