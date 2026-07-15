const productRepository = require('../repositories/product.repository');
const logger = require('../utils/logger');

class ProductService {
    async createProduct(productData, userId) {
        try {
            // Check SKU uniqueness if provided
            if (productData.sku) {
                const existingProducts = await productRepository.findAll({
                    search: productData.sku
                });

                if (existingProducts.data.some(p => p.sku === productData.sku)) {
                    throw new Error('A product with this SKU already exists');
                }
            }

            const product = await productRepository.create({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                quantity: productData.quantity,
                sku: productData.sku || this.generateSKU(),
                image_url: productData.imageUrl,
                is_active: productData.isActive !== undefined ? productData.isActive : true
            });

            logger.info('Product created successfully', {
                productId: product.id,
                sku: product.sku,
                createdBy: userId
            });

            return this.formatProduct(product);
        } catch (error) {
            logger.error('Create product service error', { error: error.message });
            throw error;
        }
    }

    async updateProduct(id, productData, userId) {
        try {
            const existingProduct = await productRepository.findById(id);

            if (productData.sku && productData.sku !== existingProduct.sku) {
                const products = await productRepository.findAll({ search: productData.sku });
                if (products.data.some(p => p.sku === productData.sku)) {
                    throw new Error('A product with this SKU already exists');
                }
            }

            const updateData = {};
            if (productData.name) updateData.name = productData.name;
            if (productData.description !== undefined) updateData.description = productData.description;
            if (productData.price !== undefined) updateData.price = productData.price;
            if (productData.quantity !== undefined) updateData.quantity = productData.quantity;
            if (productData.sku) updateData.sku = productData.sku;
            if (productData.imageUrl) updateData.image_url = productData.imageUrl;
            if (productData.isActive !== undefined) updateData.is_active = productData.isActive;

            const updatedProduct = await productRepository.update(id, updateData);

            logger.info('Product updated successfully', {
                productId: id,
                updatedBy: userId
            });

            return this.formatProduct(updatedProduct);
        } catch (error) {
            logger.error('Update product service error', { error: error.message, productId: id });
            throw error;
        }
    }

    async getProduct(id) {
        try {
            const product = await productRepository.findById(id);
            return this.formatProduct(product);
        } catch (error) {
            logger.error('Get product service error', { error: error.message, productId: id });
            throw error;
        }
    }

    async getAllProducts(filters) {
        try {
            const result = await productRepository.findAll(filters);

            return {
                data: result.data.map(product => this.formatProduct(product)),
                pagination: result.pagination
            };
        } catch (error) {
            logger.error('Get all products service error', { error: error.message, filters });
            throw error;
        }
    }

    async deleteProduct(id, userId) {
        try {
            await productRepository.findById(id); // Check if exists
            await productRepository.softDelete(id);

            logger.info('Product deleted successfully', {
                productId: id,
                deletedBy: userId
            });

            return true;
        } catch (error) {
            logger.error('Delete product service error', { error: error.message, productId: id });
            throw error;
        }
    }

    async updateStock(id, quantity, operation, userId) {
        try {
            const product = await productRepository.updateQuantity(id, quantity, operation);

            logger.info('Product stock updated', {
                productId: id,
                quantity,
                operation,
                updatedBy: userId
            });

            return this.formatProduct(product);
        } catch (error) {
            logger.error('Update stock service error', { error: error.message, productId: id });
            throw error;
        }
    }

    async getProductsForAds(platform = null) {
        try {
            const products = await productRepository.findAll({
                isActive: true,
                limit: 100
            });

            return products.data.map(product => ({
                ...this.formatProduct(product),
                adUrl: this.generateAdUrl(product.id, platform),
                utmParams: this.generateUTMParams(product.id, platform)
            }));
        } catch (error) {
            logger.error('Get products for ads error', { error: error.message });
            throw error;
        }
    }

    generateSKU() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `SKU-${timestamp}-${random}`;
    }

    generateAdUrl(productId, platform) {
        const baseUrl = process.env.CLIENT_URL;
        const urls = {
            facebook: `${baseUrl}/order/${productId}?utm_source=facebook&utm_medium=cpc&utm_campaign=fb_ads`,
            instagram: `${baseUrl}/order/${productId}?utm_source=instagram&utm_medium=cpc&utm_campaign=ig_ads`,
            twitter: `${baseUrl}/order/${productId}?utm_source=twitter&utm_medium=cpc&utm_campaign=tw_ads`
        };

        return platform ? urls[platform] : urls;
    }

    generateUTMParams(productId, platform) {
        return {
            utm_source: platform,
            utm_medium: 'cpc',
            utm_campaign: `${platform}_ads`,
            utm_content: productId,
            utm_term: 'order_now'
        };
    }

    formatProduct(product) {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            quantity: parseInt(product.quantity),
            sku: product.sku,
            imageUrl: product.image_url,
            isActive: product.is_active,
            stockStatus: this.getStockStatus(parseInt(product.quantity)),
            createdAt: product.created_at,
            updatedAt: product.updated_at
        };
    }

    getStockStatus(quantity) {
        if (quantity === 0) return { status: 'out_of_stock', label: 'Out of Stock', color: 'rose' };
        if (quantity <= 5) return { status: 'low_stock', label: 'Low Stock', color: 'amber' };
        if (quantity <= 20) return { status: 'limited', label: 'Limited Stock', color: 'yellow' };
        return { status: 'in_stock', label: 'In Stock', color: 'emerald' };
    }
}

module.exports = new ProductService();