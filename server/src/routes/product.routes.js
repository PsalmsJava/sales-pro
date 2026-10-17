const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

// Public route - allows customers from social media ad links to view product details
router.get('/:id', productController.getProduct);

// Protected routes below
router.use(authenticate);

// Admin & Inventory Manager product mutation routes
router.post(
    '/',
    authorize('admin', 'inventory_manager'),
    validate(productValidators.createProduct),
    auditLogger('CREATE', 'PRODUCT'),
    productController.createProduct
);

router.put(
    '/:id',
    authorize('admin', 'inventory_manager'),
    validate(productValidators.updateProduct),
    auditLogger('UPDATE', 'PRODUCT'),
    productController.updateProduct
);

// Soft delete - Admin & Inventory Manager
router.delete(
    '/:id',
    authorize('admin', 'inventory_manager'),
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
    authorize('admin', 'inventory_manager'),
    validate(productValidators.updateStock),
    auditLogger('UPDATE', 'PRODUCT_STOCK'),
    productController.updateStock
);

// Ad campaigns view
router.get(
    '/ads',
    authorize('admin', 'sales_rep', 'head_of_sales'),
    productController.getProductsForAds
);

// View all products
router.get(
    '/',
    authorize('admin', 'sales_rep', 'inventory_manager', 'head_of_sales'),
    productController.getAllProducts
);

module.exports = router;