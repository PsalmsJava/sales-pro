const salesRepService = require('../services/salesRep.service');
const logger = require('../utils/logger');

class SalesRepController {
    async createSalesRep(req, res, next) {
        try {
            const result = await salesRepService.createSalesRep(req.body, req.user.id);

            res.status(201).json({
                success: true,
                message: result.message,
                data: {
                    user: result.user,
                    generatedPassword: result.generatedPassword // Only shown once
                }
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async getAllSalesReps(req, res, next) {
        try {
            const filters = {
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
            };

            const salesReps = await salesRepService.getAllSalesReps(filters);

            res.json({
                success: true,
                data: salesReps
            });
        } catch (error) {
            next(error);
        }
    }

    async getSalesRepDetails(req, res, next) {
        try {
            const details = await salesRepService.getSalesRepDetails(req.params.id);

            res.json({
                success: true,
                data: details
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async updateSalesRep(req, res, next) {
        try {
            const updated = await salesRepService.updateSalesRep(
                req.params.id,
                req.body,
                req.user.id
            );

            res.json({
                success: true,
                message: 'Sales representative updated successfully',
                data: updated
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async toggleActive(req, res, next) {
        try {
            const { action } = req.body;

            let result;
            if (action === 'deactivate') {
                result = await salesRepService.deactivateSalesRep(req.params.id, req.user.id);
            } else if (action === 'reactivate') {
                result = await salesRepService.reactivateSalesRep(req.params.id, req.user.id);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action. Use "deactivate" or "reactivate"'
                });
            }

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const result = await salesRepService.resetPassword(req.params.id, req.user.id);

            res.json({
                success: true,
                message: result.message,
                data: {
                    email: result.email,
                    newPassword: result.newPassword
                }
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new SalesRepController();