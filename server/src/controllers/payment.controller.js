const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');

class PaymentController {
    async initializePayment(req, res, next) {
        try {
            const { orderId, provider } = req.body;
            const result = await paymentService.initializePayment(orderId, provider, req.user?.id);

            res.json({
                success: true,
                message: 'Payment initialized',
                data: result
            });
        } catch (error) {
            if (error.message.includes('disabled') || error.message.includes('already paid')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async verifyPaystackPayment(req, res, next) {
        try {
            const { reference } = req.params;
            const result = await paymentService.verifyPaystackPayment(reference);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyFlutterwavePayment(req, res, next) {
        try {
            const { transactionId, txRef } = req.query;
            const result = await paymentService.verifyFlutterwavePayment(transactionId, txRef);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async togglePaymentMethod(req, res, next) {
        try {
            const { method, enabled } = req.body;
            const config = await paymentService.togglePaymentMethod(method, enabled, req.user.id);

            res.json({
                success: true,
                message: `Payment method ${method} ${enabled ? 'enabled' : 'disabled'}`,
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    async getPaymentConfig(req, res, next) {
        try {
            const config = await paymentService.getPaymentConfig();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            next(error);
        }
    }

    async getTransactionHistory(req, res, next) {
        try {
            const filters = {
                status: req.query.status,
                provider: req.query.provider,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                page: req.query.page,
                limit: req.query.limit
            };

            const result = await paymentService.getTransactionHistory(filters);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    // Webhook handlers for payment providers
    async paystackWebhook(req, res) {
        try {
            const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (hash !== req.headers['x-paystack-signature']) {
                return res.status(401).json({ message: 'Invalid signature' });
            }

            const event = req.body;

            if (event.event === 'charge.success') {
                await paymentService.confirmPayment(event.data.reference, 'paystack');
            }

            res.json({ received: true });
        } catch (error) {
            logger.error('Paystack webhook error', { error: error.message });
            res.status(500).json({ message: 'Webhook processing failed' });
        }
    }

    async flutterwaveWebhook(req, res) {
        try {
            const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
            const signature = req.headers['verif-hash'];

            if (!signature || signature !== secretHash) {
                return res.status(401).json({ message: 'Invalid signature' });
            }

            const payload = req.body;

            if (payload.status === 'successful') {
                await paymentService.confirmPayment(payload.txRef, 'flutterwave');
            }

            res.json({ received: true });
        } catch (error) {
            logger.error('Flutterwave webhook error', { error: error.message });
            res.status(500).json({ message: 'Webhook processing failed' });
        }
    }
}

module.exports = new PaymentController();