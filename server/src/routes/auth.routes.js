const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authValidators, userValidators } = require('../utils/validators');
const auditLogger = require('../middleware/auditLogger');

// Public routes
router.post('/login', validate(authValidators.login), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/change-password', authenticate, validate(authValidators.changePassword), authController.changePassword);

// Admin only - manage users
router.get(
    '/users',
    authenticate,
    authorize('admin'),
    authController.getUsers
);

router.post(
    '/users',
    authenticate,
    authorize('admin'),
    validate(userValidators.createUser),
    auditLogger('CREATE', 'USER'),
    authController.createUser
);

router.patch(
    '/users/:id',
    authenticate,
    authorize('admin'),
    validate(userValidators.updateUser),
    auditLogger('UPDATE', 'USER'),
    authController.updateUser
);

module.exports = router;