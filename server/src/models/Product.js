const db = require('../config/database');

class Product {
    static tableName = 'products';

    static async findById(id) {
        return db(this.tableName)
            .where({ id, is_active: true })
            .first();
    }

    static async findAll(filters = {}) {
        let query = db(this.tableName).where({ is_active: true });

        if (filters.search) {
            query = query.where(function () {
                this.where('name', 'ilike', `%${filters.search}%`)
                    .orWhere('sku', 'ilike', `%${filters.search}%`)
                    .orWhere('description', 'ilike', `%${filters.search}%`);
            });
        }

        if (filters.minPrice) {
            query = query.where('price', '>=', filters.minPrice);
        }

        if (filters.maxPrice) {
            query = query.where('price', '<=', filters.maxPrice);
        }

        if (filters.lowStock) {
            query = query.where('quantity', '<=', 10);
        }

        if (filters.outOfStock) {
            query = query.where('quantity', 0);
        }

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;

        const [data, [{ count }]] = await Promise.all([
            query.clone().orderBy('created_at', 'desc').limit(limit).offset(offset),
            query.clone().count()
        ]);

        return {
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(count),
                totalPages: Math.ceil(parseInt(count) / limit)
            }
        };
    }

    static async create(productData) {
        const [product] = await db(this.tableName)
            .insert(productData)
            .returning('*');
        return product;
    }

    static async update(id, productData) {
        const [updated] = await db(this.tableName)
            .where({ id })
            .update({
                ...productData,
                updated_at: new Date()
            })
            .returning('*');
        return updated;
    }

    static async updateQuantity(id, quantity, operation = 'subtract') {
        const product = await this.findById(id);
        if (!product) throw new Error('Product not found');

        const newQuantity = operation === 'subtract'
            ? product.quantity - quantity
            : product.quantity + quantity;

        if (newQuantity < 0) throw new Error('Insufficient stock');

        const [updated] = await db(this.tableName)
            .where({ id })
            .update({
                quantity: newQuantity,
                updated_at: new Date()
            })
            .returning('*');
        return updated;
    }

    static async softDelete(id) {
        return db(this.tableName)
            .where({ id })
            .update({
                is_active: false,
                updated_at: new Date()
            });
    }

    static async bulkUpdateQuantity(items) {
        const trx = await db.transaction();

        try {
            const updates = items.map(async (item) => {
                const product = await trx(this.tableName)
                    .where({ id: item.id, is_active: true })
                    .first();

                if (!product) throw new Error(`Product ${item.id} not found`);

                const newQuantity = product.quantity - item.quantity;
                if (newQuantity < 0) throw new Error(`Insufficient stock for product ${product.name}`);

                return trx(this.tableName)
                    .where({ id: item.id })
                    .update({
                        quantity: newQuantity,
                        updated_at: new Date()
                    });
            });

            await Promise.all(updates);
            await trx.commit();
            return true;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}

module.exports = Product;