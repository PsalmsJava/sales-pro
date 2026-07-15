const User = require('../models/User');
const logger = require('../utils/logger');

class UserRepository {
    async findById(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                logger.warn('User not found', { userId: id });
            }
            return user;
        } catch (error) {
            logger.error('Error finding user by ID', { error: error.message, userId: id });
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            return await User.findByEmail(email);
        } catch (error) {
            logger.error('Error finding user by email', { error: error.message, email });
            throw error;
        }
    }

    async create(userData) {
        try {
            return await User.create(userData);
        } catch (error) {
            logger.error('Error creating user', { error: error.message });
            throw error;
        }
    }

    async update(id, userData) {
        try {
            const user = await User.update(id, userData);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            logger.error('Error updating user', { error: error.message, userId: id });
            throw error;
        }
    }

    async findAll(filters) {
        try {
            return await User.findAll(filters);
        } catch (error) {
            logger.error('Error fetching users', { error: error.message, filters });
            throw error;
        }
    }

    async softDelete(id) {
        try {
            await User.softDelete(id);
        } catch (error) {
            logger.error('Error deleting user', { error: error.message, userId: id });
            throw error;
        }
    }
}

module.exports = new UserRepository();