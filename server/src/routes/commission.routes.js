const router = require('express').Router();
const commissionController = require('../controllers/commission.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { commissionValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

router.use(authenticate);

// Admin routes
router.post(
    '/set/:userId',
    authorize('admin'),
    validate(commissionValidators.setCommission),
    auditLogger('UPDATE', 'COMMISSION_CONFIG'),
    commissionController.setCommission
);

router.post(
    '/process-salaries',
    authorize('admin'),
    auditLogger('PROCESS', 'SALARIES'),
    commissionController.processSalaries
);

router.get(
    '/user/:userId',
    authorize('admin'),
    commissionController.getUserEarnings
);

// Sales rep routes
router.get(
    '/my-earnings',
    authorize('sales_rep', 'admin'),
    commissionController.getMyEarnings
);

module.exports = router;