const router = require('express').Router();
const dispatchController = require('../controllers/dispatch.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { dispatchValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

// Public route - Registration
router.post(
    '/register',
    validate(dispatchValidators.registerPartner),
    dispatchController.registerPartner
);

// Protected routes
router.use(authenticate);

// Dispatch partner routes
router.get('/dashboard', authorize('dispatch_partner'), dispatchController.getPartnerDashboard);
router.patch(
    '/delivery/:id/status',
    authorize('dispatch_partner'),
    validate(dispatchValidators.updateDeliveryStatus),
    auditLogger('UPDATE', 'DISPATCH_STATUS'),
    dispatchController.updateDeliveryStatus
);

// Admin routes
router.get('/partners', authorize('admin'), dispatchController.getAllPartners);
router.post(
    '/partners/:id/verify',
    authorize('admin'),
    auditLogger('VERIFY', 'DISPATCH_PARTNER'),
    dispatchController.verifyPartner
);
router.post(
    '/assign',
    authorize('admin'),
    validate(dispatchValidators.assignDelivery),
    auditLogger('ASSIGN', 'DISPATCH'),
    dispatchController.assignDelivery
);

module.exports = router;