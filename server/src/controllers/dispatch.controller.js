const dispatchService = require('../services/dispatch.service');
const logger = require('../utils/logger');

class DispatchController {
    // Public - Register dispatch partner
    async registerPartner(req, res, next) {
        try {
            const result = await dispatchService.registerPartner(req.body);

            res.status(201).json({
                success: true,
                message: result.message,
                data: result.partner
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

    // Admin - Verify dispatch partner
    async verifyPartner(req, res, next) {
        try {
            const partner = await dispatchService.verifyPartner(req.params.id, req.user.id);

            res.json({
                success: true,
                message: 'Dispatch partner verified successfully',
                data: partner
            });
        } catch (error) {
            next(error);
        }
    }

    // Admin - Assign delivery
    async assignDelivery(req, res, next) {
        try {
            const result = await dispatchService.assignDelivery(
                req.body.orderId,
                req.body.dispatchPartnerId,
                req.body.deliveryFee,
                req.user.id
            );

            res.status(201).json({
                success: true,
                message: result.message,
                data: result.assignment
            });
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('status')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // Dispatch partner - Update delivery status
    async updateDeliveryStatus(req, res, next) {
        try {
            const assignment = await dispatchService.updateDeliveryStatus(
                req.params.id,
                req.body.status,
                {
                    delivery_notes: req.body.notes,
                    recipient_name: req.body.recipientName,
                    recipient_signature: req.body.signature,
                    proof_of_delivery_url: req.body.proofOfDeliveryUrl
                },
                req.user.id
            );

            res.json({
                success: true,
                message: `Delivery status updated to ${req.body.status}`,
                data: assignment
            });
        } catch (error) {
            if (error.message.includes('Cannot change')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // Get partner dashboard
    async getPartnerDashboard(req, res, next) {
        try {
            const dashboard = await dispatchService.getPartnerDashboard(req.user.id);

            res.json({
                success: true,
                data: dashboard
            });
        } catch (error) {
            next(error);
        }
    }

    // Admin - Get all partners
    async getAllPartners(req, res, next) {
        try {
            const filters = {
                isVerified: req.query.isVerified,
                city: req.query.city,
                state: req.query.state
            };

            const partners = await dispatchService.getAllPartners(filters);

            res.json({
                success: true,
                data: partners
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DispatchController();