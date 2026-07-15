const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

// Public route - Customer creates order
router.post(
    '/',
    validate(orderValidators.createOrder),
    orderController.createOrder
);

// Protected routes
router.use(authenticate);

// Admin routes
router.post(
    '/assign',
    authorize('admin'),
    auditLogger('ASSIGN', 'ORDER'),
    orderController.assignOrders
);

// All authenticated users can view orders
router.get('/', orderController.getAllOrders);
router.get('/stats', authorize('sales_rep'), orderController.getSalesRepStats);
router.get('/:id', orderController.getOrder);

// Status updates
router.patch(
    '/:id/status',
    validate(orderValidators.updateStatus),
    auditLogger('UPDATE', 'ORDER_STATUS'),
    orderController.updateOrderStatus
);

module.exports = router;