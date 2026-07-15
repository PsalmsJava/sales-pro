const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { paymentValidators } = require('../utils/validators');

// Public webhook routes (no auth required)
router.post('/webhook/paystack', paymentController.paystackWebhook);
router.post('/webhook/flutterwave', paymentController.flutterwaveWebhook);

// Payment verification (can be public)
router.get('/verify/paystack/:reference', paymentController.verifyPaystackPayment);
router.get('/verify/flutterwave', paymentController.verifyFlutterwavePayment);

// Protected routes
router.use(authenticate);

// Initialize payment
router.post(
    '/initialize',
    validate(paymentValidators.initializePayment),
    paymentController.initializePayment
);

// Admin routes
router.get('/config', authorize('admin'), paymentController.getPaymentConfig);
router.post(
    '/toggle-method',
    authorize('admin'),
    validate(paymentValidators.toggleMethod),
    paymentController.togglePaymentMethod
);
router.get('/transactions', authorize('admin'), paymentController.getTransactionHistory);

module.exports = router;