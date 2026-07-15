const DispatchAssignment = require('../models/DispatchAssignment');
const logger = require('../utils/logger');

class DispatchAssignmentRepository {
    async findById(id) {
        try {
            const assignment = await DispatchAssignment.findById(id);
            if (!assignment) {
                throw new Error('Dispatch assignment not found');
            }
            return assignment;
        } catch (error) {
            logger.error('Error finding dispatch assignment', { error: error.message, assignmentId: id });
            throw error;
        }
    }

    async create(assignmentData) {
        try {
            return await DispatchAssignment.create(assignmentData);
        } catch (error) {
            logger.error('Error creating dispatch assignment', { error: error.message });
            throw error;
        }
    }

    async findByDispatchPartner(partnerId, filters = {}) {
        try {
            return await DispatchAssignment.findByDispatchPartner(partnerId, filters);
        } catch (error) {
            logger.error('Error finding partner assignments', { error: error.message, partnerId });
            throw error;
        }
    }

    async updateStatus(id, status, updateData = {}) {
        try {
            const assignment = await DispatchAssignment.updateStatus(id, status, updateData);
            if (!assignment) {
                throw new Error('Assignment not found');
            }
            return assignment;
        } catch (error) {
            logger.error('Error updating assignment status', { error: error.message, assignmentId: id });
            throw error;
        }
    }

    async findByOrderId(orderId) {
        try {
            return await require('../config/database')('dispatch_assignments')
                .where({ order_id: orderId })
                .first();
        } catch (error) {
            logger.error('Error finding assignment by order', { error: error.message, orderId });
            throw error;
        }
    }

    async getActiveAssignments(partnerId) {
        try {
            return await DispatchAssignment.getActiveAssignments(partnerId);
        } catch (error) {
            logger.error('Error getting active assignments', { error: error.message, partnerId });
            throw error;
        }
    }
}

module.exports = new DispatchAssignmentRepository();