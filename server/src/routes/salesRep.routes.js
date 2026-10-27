const router = require('express').Router();
const salesRepController = require('../controllers/salesRep.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { salesRepValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

router.use(authenticate);
router.use(authorize('admin', 'manager', 'head_of_sales'));

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

// Soft delete - Only Head of Sales can delete sales reps
router.delete(
    '/:id',
    authorize('head_of_sales'),
    auditLogger('SOFT_DELETE', 'SALES_REP'),
    salesRepController.softDeleteSalesRep
);

// Final / Permanent delete - Only Admin
router.delete(
    '/:id/permanent',
    authorize('admin'),
    auditLogger('PERMANENT_DELETE', 'SALES_REP'),
    salesRepController.permanentDeleteSalesRep
);

module.exports = router;