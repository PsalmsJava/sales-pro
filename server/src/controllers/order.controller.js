const orderService = require('../services/order.service');
const logger = require('../utils/logger');

class OrderController {
    // Public - Customer creates order
    async createOrder(req, res, next) {
        try {
            const order = await orderService.createOrder({
                ...req.body,
                utmSource: req.body.utm_source,
                utmMedium: req.body.utm_medium,
                utmCampaign: req.body.utm_campaign
            });

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        } catch (error) {
            if (error.message.includes('stock')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // Get single order
    async getOrder(req, res, next) {
        try {
            const order = await orderService.getOrder(
                req.params.id,
                req.user?.id,
                req.user?.role
            );

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }
            if (error.message.includes('only view your')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // Get all orders with filters
    async getAllOrders(req, res, next) {
        try {
            const filters = {
                status: req.query.status,
                paymentMethod: req.query.paymentMethod,
                customerCity: req.query.city,
                customerState: req.query.state,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                search: req.query.search,
                page: req.query.page || 1,
                limit: req.query.limit || 20
            };

            const result = await orderService.getAllOrders(
                filters,
                req.user.id,
                req.user.role
            );

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Update order status
    async updateOrderStatus(req, res, next) {
        try {
            const order = await orderService.updateOrderStatus(
                req.params.id,
                req.body.status,
                req.user.id,
                req.user.role
            );

            res.json({
                success: true,
                message: `Order status updated to ${req.body.status}`,
                data: order
            });
        } catch (error) {
            if (error.message.includes('permission')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('Cannot change')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // ==========================================
    // RESCHEDULE
    // ==========================================
    async rescheduleOrder(req, res, next) {
        try {
            const { scheduledAt, reason } = req.body;

            const order = await orderService.rescheduleOrder(
                req.params.id,
                { scheduledAt, reason },
                req.user.id,
                req.user.role
            );

            res.json({
                success: true,
                message: 'Order rescheduled successfully',
                data: order
            });
        } catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('only reschedule your')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            if (
                error.message.includes('Cannot reschedule') ||
                error.message.includes('required') ||
                error.message.includes('Invalid') ||
                error.message.includes('must be in the future')
            ) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    // ==========================================
    // CALLBACK
    // ==========================================
    async scheduleCallback(req, res, next) {
        try {
            const { callbackAt, comment } = req.body;

            const order = await orderService.scheduleCallback(
                req.params.id,
                { callbackAt, comment },
                req.user.id,
                req.user.role
            );

            res.json({
                success: true,
                message: 'Callback scheduled successfully',
                data: order
            });
        } catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('only schedule callbacks for your')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            if (
                error.message.includes('Cannot schedule') ||
                error.message.includes('required') ||
                error.message.includes('Invalid') ||
                error.message.includes('must be in the future') ||
                error.message.includes('1000 characters')
            ) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    // ==========================================
    // LOG ISSUE (Switched Off / Not Answering)
    // ==========================================
    async logIssue(req, res, next) {
        try {
            const { type } = req.body;
            const order = await orderService.logIssue(
                req.params.id,
                type,
                req.user.id,
                req.user.role
            );
            res.json({
                success: true,
                message: `Logged ${type} successfully`,
                data: order
            });
        } catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('only log issues for your')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            if (error.message.includes('Invalid issue type')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    // Sales reps: get their own due callbacks
    async getMyCallbacks(req, res, next) {
        try {
            const callbacks = await orderService.getCallbacks(
                req.user.id,
                req.user.role
            );

            res.json({
                success: true,
                data: callbacks
            });
        } catch (error) {
            next(error);
        }
    }

    // Admin - Assign orders to sales reps
    async assignOrders(req, res, next) {
        try {
            const assignments = await orderService.assignOrdersToSalesReps();

            res.json({
                success: true,
                message: `${assignments.length} orders assigned successfully`,
                data: assignments
            });
        } catch (error) {
            next(error);
        }
    }

    // Sales rep stats
    async getSalesRepStats(req, res, next) {
        try {
            const stats = await orderService.getSalesRepStats(req.user.id);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();