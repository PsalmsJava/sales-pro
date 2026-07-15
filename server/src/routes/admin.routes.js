const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/sales-reps/performance', adminController.getSalesRepPerformance);

module.exports = router;