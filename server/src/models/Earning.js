const db = require('../config/database');

class Earning {
    static tableName = 'earnings';

    static async findByUser(userId, filters = {}) {
        let query = db(this.tableName)
            .join('orders', 'earnings.order_id', 'orders.id')
            .join('products', 'orders.product_id', 'products.id')
            .where('earnings.user_id', userId)
            .select(
                'earnings.*',
                'orders.total_amount as order_amount',
                'orders.status as order_status',
                'products.name as product_name',
                'products.image_url as product_image'
            );

        if (filters.type) {
            query = query.where('earnings.type', filters.type);
        }

        if (filters.status) {
            query = query.where('earnings.status', filters.status);
        }

        if (filters.dateFrom) {
            query = query.where('earnings.earned_at', '>=', filters.dateFrom);
        }

        if (filters.dateTo) {
            query = query.where('earnings.earned_at', '<=', filters.dateTo);
        }

        return query.orderBy('earnings.created_at', 'desc');
    }

    static async getEarningsSummary(userId) {
        const summary = await db(this.tableName)
            .where('user_id', userId)
            .select(
                db.raw('SUM(CASE WHEN type = \'commission\' THEN amount ELSE 0 END) as total_commission'),
                db.raw('SUM(CASE WHEN type = \'salary\' THEN amount ELSE 0 END) as total_salary'),
                db.raw('SUM(CASE WHEN type = \'bonus\' THEN amount ELSE 0 END) as total_bonus'),
                db.raw('SUM(CASE WHEN status = \'pending\' THEN amount ELSE 0 END) as pending_earnings'),
                db.raw('SUM(CASE WHEN status = \'paid\' THEN amount ELSE 0 END) as paid_earnings'),
                db.raw('SUM(amount) as total_earnings'),
                db.raw('COUNT(DISTINCT order_id) as total_orders_with_earnings')
            )
            .first();

        return summary;
    }

    static async getTopProductsByEarnings(userId, limit = 5) {
        return db(this.tableName)
            .join('orders', 'earnings.order_id', 'orders.id')
            .join('products', 'orders.product_id', 'products.id')
            .where('earnings.user_id', userId)
            .where('earnings.type', 'commission')
            .select(
                'products.id as product_id',
                'products.name as product_name',
                'products.image_url as product_image',
                db.raw('SUM(earnings.amount) as total_earnings'),
                db.raw('COUNT(*) as order_count')
            )
            .groupBy('products.id', 'products.name', 'products.image_url')
            .orderBy('total_earnings', 'desc')
            .limit(limit);
    }

    static async getMonthlyEarnings(userId, months = 6) {
        return db(this.tableName)
            .where('user_id', userId)
            .where('earned_at', '>=', db.raw(`NOW() - INTERVAL '${months} months'`))
            .select(
                db.raw("DATE_TRUNC('month', earned_at) as month"),
                db.raw('SUM(amount) as total'),
                db.raw('SUM(CASE WHEN type = \'commission\' THEN amount ELSE 0 END) as commission'),
                db.raw('SUM(CASE WHEN type = \'salary\' THEN amount ELSE 0 END) as salary')
            )
            .groupBy(db.raw("DATE_TRUNC('month', earned_at)"))
            .orderBy('month', 'asc');
    }

    static async create(earningData) {
        const [earning] = await db(this.tableName)
            .insert(earningData)
            .returning('*');
        return earning;
    }

    static async updateStatus(id, status) {
        const [updated] = await db(this.tableName)
            .where({ id })
            .update({ status, updated_at: new Date() })
            .returning('*');
        return updated;
    }

    static async bulkCreate(earningsData) {
        const trx = await db.transaction();

        try {
            const earnings = await trx(this.tableName)
                .insert(earningsData)
                .returning('*');

            await trx.commit();
            return earnings;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}

module.exports = Earning;