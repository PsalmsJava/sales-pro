const Product = require('../models/Product');
const logger = require('../utils/logger');

class ProductRepository {
    async findById(id) {
        try {
            const product = await Product.findById(id);
            if (!product) {
                logger.warn('Product not found', { productId: id });
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            logger.error('Error finding product by ID', { error: error.message, productId: id });
            throw error;
        }
    }

    async findAll(filters) {
        try {
            return await Product.findAll(filters);
        } catch (error) {
            logger.error('Error fetching products', { error: error.message, filters });
            throw error;
        }
    }

    async create(productData) {
        try {
            return await Product.create(productData);
        } catch (error) {
            logger.error('Error creating product', { error: error.message });
            throw error;
        }
    }

    async update(id, productData) {
        try {
            const product = await Product.update(id, productData);
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            logger.error('Error updating product', { error: error.message, productId: id });
            throw error;
        }
    }

    async updateQuantity(id, quantity, operation) {
        try {
            return await Product.updateQuantity(id, quantity, operation);
        } catch (error) {
            logger.error('Error updating product quantity', { error: error.message, productId: id });
            throw error;
        }
    }

    async softDelete(id) {
        try {
            await Product.softDelete(id);
        } catch (error) {
            logger.error('Error deleting product', { error: error.message, productId: id });
            throw error;
        }
    }

    async bulkUpdateQuantity(items) {
        try {
            return await Product.bulkUpdateQuantity(items);
        } catch (error) {
            logger.error('Error bulk updating quantities', { error: error.message });
            throw error;
        }
    }
}

module.exports = new ProductRepository();