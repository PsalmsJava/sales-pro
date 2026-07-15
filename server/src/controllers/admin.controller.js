const adminService = require('../services/admin.service');
const logger = require('../utils/logger');

class AdminController {
    async getDashboardStats(req, res, next) {
        try {
            const stats = await adminService.getDashboardStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async getSalesRepPerformance(req, res, next) {
        try {
            const performance = await adminService.getSalesRepPerformance();

            res.json({
                success: true,
                data: performance
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();