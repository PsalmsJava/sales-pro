const commissionService = require('../services/commission.service');
const logger = require('../utils/logger');

class CommissionController {
    async setCommission(req, res, next) {
        try {
            const config = await commissionService.setUserCommission(
                req.params.userId,
                req.body,
                req.user.id
            );

            res.json({
                success: true,
                message: 'Commission structure set successfully',
                data: config
            });
        } catch (error) {
            if (error.message.includes('required')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async getMyEarnings(req, res, next) {
        try {
            const filters = {
                type: req.query.type,
                status: req.query.status,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo
            };

            const earnings = await commissionService.getUserEarnings(req.user.id, filters);

            res.json({
                success: true,
                data: earnings
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserEarnings(req, res, next) {
        try {
            const filters = {
                type: req.query.type,
                status: req.query.status,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo
            };

            const earnings = await commissionService.getUserEarnings(req.params.userId, filters);

            res.json({
                success: true,
                data: earnings
            });
        } catch (error) {
            next(error);
        }
    }

    async processSalaries(req, res, next) {
        try {
            const result = await commissionService.processSalaryPayments();

            res.json({
                success: true,
                message: `Processed ${result.length} salary payments`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CommissionController();