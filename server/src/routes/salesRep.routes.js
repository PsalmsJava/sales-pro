const router = require('express').Router();
const salesRepController = require('../controllers/salesRep.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { salesRepValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

router.use(authenticate);
router.use(authorize('admin'));

// Create sales rep
router.post(
    '/',
    validate(salesRepValidators.createSalesRep),
    auditLogger('CREATE', 'SALES_REP'),
    salesRepController.createSalesRep
);

// Get all sales reps
router.get('/', salesRepController.getAllSalesReps);

// Get single sales rep details
router.get('/:id', salesRepController.getSalesRepDetails);

// Update sales rep
router.put(
    '/:id',
    validate(salesRepValidators.updateSalesRep),
    auditLogger('UPDATE', 'SALES_REP'),
    salesRepController.updateSalesRep
);

// Toggle active/deactivate
router.patch(
    '/:id/toggle-active',
    validate(salesRepValidators.toggleActive),
    auditLogger('UPDATE', 'SALES_REP_STATUS'),
    salesRepController.toggleActive
);

// Reset password
router.post(
    '/:id/reset-password',
    auditLogger('RESET_PASSWORD', 'SALES_REP'),
    salesRepController.resetPassword
);

module.exports = router;