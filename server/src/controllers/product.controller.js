const productService = require('../services/product.service');
const logger = require('../utils/logger');

class ProductController {
    async createProduct(req, res, next) {
        try {
            const product = await productService.createProduct(req.body, req.user.id);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
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

    async getProduct(req, res, next) {
        try {
            const product = await productService.getProduct(req.params.id);

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            next(error);
        }
    }

    async getAllProducts(req, res, next) {
        try {
            const filters = {
                search: req.query.search,
                minPrice: req.query.minPrice,
                maxPrice: req.query.maxPrice,
                lowStock: req.query.lowStock === 'true',
                outOfStock: req.query.outOfStock === 'true',
                page: req.query.page || 1,
                limit: req.query.limit || 20
            };

            const result = await productService.getAllProducts(filters);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const product = await productService.updateProduct(req.params.id, req.body, req.user.id);

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error) {
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            await productService.deleteProduct(req.params.id, req.user.id);

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            next(error);
        }
    }

    async updateStock(req, res, next) {
        try {
            const { quantity, operation } = req.body;
            const product = await productService.updateStock(
                req.params.id,
                quantity,
                operation,
                req.user.id
            );

            res.json({
                success: true,
                message: 'Stock updated successfully',
                data: product
            });
        } catch (error) {
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            if (error.message === 'Insufficient stock') {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock to complete this operation'
                });
            }
            next(error);
        }
    }

    async getProductsForAds(req, res, next) {
        try {
            const platform = req.query.platform;
            const products = await productService.getProductsForAds(platform);

            res.json({
                success: true,
                data: {
                    products,
                    platform: platform || 'all',
                    instructions: this.getAdInstructions(platform)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    getAdInstructions(platform) {
        const instructions = {
            facebook: 'Copy the product link and use it in your Facebook Ads Manager. Add UTM parameters for tracking.',
            instagram: 'Use the product link in your Instagram bio or Story ads. Swipe-up links work best.',
            twitter: 'Use the product link in your Twitter Ads campaigns. Best for Promoted Tweets.',
            all: 'Select a platform above to get specific instructions.'
        };
        return platform ? (instructions[platform] || instructions.all) : instructions.all;
    }
}

module.exports = new ProductController();