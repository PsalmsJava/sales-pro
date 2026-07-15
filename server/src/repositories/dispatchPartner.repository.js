const DispatchPartner = require('../models/DispatchPartner');
const logger = require('../utils/logger');

class DispatchPartnerRepository {
    async findById(id) {
        try {
            const partner = await DispatchPartner.findById(id);
            if (!partner) {
                throw new Error('Dispatch partner not found');
            }
            return partner;
        } catch (error) {
            logger.error('Error finding dispatch partner', { error: error.message, partnerId: id });
            throw error;
        }
    }

    async findByUserId(userId) {
        try {
            return await DispatchPartner.findByUserId(userId);
        } catch (error) {
            logger.error('Error finding partner by user ID', { error: error.message, userId });
            throw error;
        }
    }

    async create(partnerData) {
        try {
            return await DispatchPartner.create(partnerData);
        } catch (error) {
            logger.error('Error creating dispatch partner', { error: error.message });
            throw error;
        }
    }

    async findAll(filters) {
        try {
            return await DispatchPartner.findAll(filters);
        } catch (error) {
            logger.error('Error fetching dispatch partners', { error: error.message });
            throw error;
        }
    }

    async verify(id) {
        try {
            return await DispatchPartner.verify(id);
        } catch (error) {
            logger.error('Error verifying partner', { error: error.message, partnerId: id });
            throw error;
        }
    }
}

module.exports = new DispatchPartnerRepository();