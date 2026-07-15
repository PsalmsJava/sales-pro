const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            if (error.message === 'Invalid email or password' ||
                error.message.includes('deactivated')) {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async createUser(req, res, next) {
        try {
            const user = await authService.createUser(req.body, req.user.id);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            const tokens = await authService.refreshToken(refreshToken);

            res.json({
                success: true,
                data: tokens
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            await authService.changePassword(req.user.id, currentPassword, newPassword);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            if (error.message === 'Current password is incorrect') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async getCurrentUser(req, res) {
        try {
            const user = await require('../repositories/user.repository').findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: authService.sanitizeUser(user)
            });
        } catch (error) {
            logger.error('Get current user error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user details'
            });
        }
    }
}

module.exports = new AuthController();