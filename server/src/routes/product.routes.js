const router = require('express').Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

// All routes require authentication
router.use(authenticate);

// Admin routes
router.post(
    '/',
    authorize('admin'),
    validate(productValidators.createProduct),
    auditLogger('CREATE', 'PRODUCT'),
    productController.createProduct
);

router.put(
    '/:id',
    authorize('admin'),
    validate(productValidators.updateProduct),
    auditLogger('UPDATE', 'PRODUCT'),
    productController.updateProduct
);

router.delete(
    '/:id',
    authorize('admin'),
    auditLogger('DELETE', 'PRODUCT'),
    productController.deleteProduct
);

router.patch(
    '/:id/stock',
    authorize('admin'),
    validate(productValidators.updateStock),
    auditLogger('UPDATE', 'PRODUCT_STOCK'),
    productController.updateStock
);

// Admin and Sales Rep can view products
router.get(
    '/ads',
    authorize('admin', 'sales_rep'),
    productController.getProductsForAds
);

router.get(
    '/',
    authorize('admin', 'sales_rep'),
    productController.getAllProducts
);

router.get(
    '/:id',
    authorize('admin', 'sales_rep'),
    productController.getProduct
);

module.exports = router;