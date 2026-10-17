const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

class AuthService {
    async login(email, password) {
        try {
            const user = await userRepository.findByEmail(email);

            if (!user) {
                logger.warn('Login failed - user not found', { email });
                throw new Error('Invalid email or password');
            }

            if (!user.is_active) {
                logger.warn('Login failed - account deactivated', { email });
                throw new Error('Your account has been deactivated. Please contact administrator.');
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                logger.warn('Login failed - invalid password', { email });
                throw new Error('Invalid email or password');
            }

            const tokens = this.generateTokens(user);

            logger.info('Login successful', { userId: user.id, role: user.role });

            return {
                user: this.sanitizeUser(user),
                tokens
            };
        } catch (error) {
            logger.error('Login service error', { error: error.message, email });
            throw error;
        }
    }

    async createUser(userData, createdBy) {
        try {
            const existingUser = await userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('A user with this email already exists');
            }

            const passwordHash = await bcrypt.hash(userData.password, 12);

            const newUser = await userRepository.create({
                email: userData.email,
                password_hash: passwordHash,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone: userData.phone,
                role: userData.role,
                is_active: true
            });

            logger.info('User created successfully', {
                newUserId: newUser.id,
                role: newUser.role,
                createdBy
            });

            return this.sanitizeUser(newUser);
        } catch (error) {
            logger.error('Create user service error', { error: error.message });
            throw error;
        }
    }

    async listUsers() {
        try {
            const users = await userRepository.findAll({});
            return users.map(user => this.sanitizeUser(user));
        } catch (error) {
            logger.error('List users service error', { error: error.message });
            throw error;
        }
    }

    async updateUser(userId, updateData, actorId) {
        try {
            const user = await userRepository.findByIdAny(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Guard: admin cannot demote or deactivate themselves
            if (userId === actorId) {
                if (updateData.isActive === false) {
                    throw new Error('You cannot deactivate your own account');
                }
                if (updateData.role && updateData.role !== user.role) {
                    throw new Error('You cannot change your own role');
                }
            }

            const dbUpdate = {};
            if (updateData.firstName) dbUpdate.first_name = updateData.firstName;
            if (updateData.lastName) dbUpdate.last_name = updateData.lastName;
            if (updateData.phone !== undefined) dbUpdate.phone = updateData.phone;
            if (updateData.role) dbUpdate.role = updateData.role;
            if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive;

            if (Object.keys(dbUpdate).length === 0) {
                return this.sanitizeUser(user);
            }

            const updated = await userRepository.update(userId, dbUpdate);

            logger.info('User updated successfully', {
                userId,
                updatedBy: actorId,
                fields: Object.keys(dbUpdate)
            });

            return this.sanitizeUser(updated);
        } catch (error) {
            logger.error('Update user service error', { error: error.message, userId });
            throw error;
        }
    }

    async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await userRepository.findById(decoded.id);

            if (!user || !user.is_active) {
                throw new Error('Invalid refresh token');
            }

            const tokens = this.generateTokens(user);

            logger.info('Token refreshed', { userId: user.id });

            return tokens;
        } catch (error) {
            logger.error('Token refresh error', { error: error.message });
            throw new Error('Invalid or expired refresh token');
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await userRepository.findById(userId);

            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            const newPasswordHash = await bcrypt.hash(newPassword, 12);
            await userRepository.update(userId, { password_hash: newPasswordHash });

            logger.info('Password changed successfully', { userId });

            return true;
        } catch (error) {
            logger.error('Change password error', { error: error.message, userId });
            throw error;
        }
    }

    generateTokens(user) {
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );

        return { accessToken, refreshToken };
    }

    sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            role: user.role,
            isActive: user.is_active,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };
    }
}

module.exports = new AuthService();