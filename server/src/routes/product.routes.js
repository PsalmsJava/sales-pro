const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

// Ad campaigns view - MUST be registered before the public /:id route,
// otherwise GET /products/ads matches /:id with id="ads" and 500s.
router.get(
    '/ads',
    authenticate,
    authorize('admin', 'manager', 'sales_rep', 'head_of_sales'),
    productController.getProductsForAds
);

// Public route - allows customers from social media ad links to view product details
router.get('/:id', productController.getProduct);

// Protected routes below
router.use(authenticate);

// Admin, Manager & Inventory Manager product mutation routes
router.post(
    '/',
    authorize('admin', 'manager', 'inventory_manager'),
    validate(productValidators.createProduct),
    auditLogger('CREATE', 'PRODUCT'),
    productController.createProduct
);

router.put(
    '/:id',
    authorize('admin', 'manager', 'inventory_manager'),
    validate(productValidators.updateProduct),
    auditLogger('UPDATE', 'PRODUCT'),
    productController.updateProduct
);

// Soft delete - Admin, Manager & Inventory Manager
router.delete(
    '/:id',
    authorize('admin', 'manager', 'inventory_manager'),
    auditLogger('DELETE', 'PRODUCT'),
    productController.deleteProduct
);

// Permanent delete - Admin only
router.delete(
    '/:id/permanent',
    authorize('admin'),
    auditLogger('PERMANENT_DELETE', 'PRODUCT'),
    productController.permanentDeleteProduct
);

router.patch(
    '/:id/stock',
    authorize('admin', 'manager', 'inventory_manager'),
    validate(productValidators.updateStock),
    auditLogger('UPDATE', 'PRODUCT_STOCK'),
    productController.updateStock
);

// View all products
router.get(
    '/',
    authorize('admin', 'manager', 'sales_rep', 'inventory_manager', 'head_of_sales'),
    productController.getAllProducts
);

module.exports = router;