const db = require('../config/database');

class Order {
    static tableName = 'orders';

    static async findById(id) {
        return db(this.tableName)
            .join('products', 'orders.product_id', 'products.id')
            .join('customers', 'orders.customer_id', 'customers.id')
            .leftJoin('users as sales_rep', 'orders.sales_rep_id', 'sales_rep.id')
            .select(
                'orders.*',
                'products.name as product_name',
                'products.sku as product_sku',
                'products.image_url as product_image',
                'customers.first_name as customer_first_name',
                'customers.last_name as customer_last_name',
                'customers.email as customer_email',
                'customers.phone as customer_phone',
                'customers.address as customer_address',
                'customers.city as customer_city',
                'customers.state as customer_state',
                'sales_rep.first_name as sales_rep_first_name',
                'sales_rep.last_name as sales_rep_last_name'
            )
            .where('orders.id', id)
            .first();
    }

    static async create(orderData) {
        const trx = await db.transaction();

        try {
            // Create customer first
            const [customer] = await trx('customers')
                .insert({
                    first_name: orderData.customer.firstName,
                    last_name: orderData.customer.lastName,
                    email: orderData.customer.email,
                    phone: orderData.customer.phone,
                    address: orderData.customer.address,
                    city: orderData.customer.city,
                    state: orderData.customer.state,
                    utm_source: orderData.utmSource,
                    utm_medium: orderData.utmMedium,
                    utm_campaign: orderData.utmCampaign
                })
                .returning('*');

            // Create order
            const [order] = await trx(this.tableName)
                .insert({
                    product_id: orderData.productId,
                    customer_id: customer.id,
                    quantity: orderData.quantity,
                    total_amount: orderData.totalAmount,
                    payment_method: orderData.paymentMethod,
                    status: 'pending',
                    is_paid: orderData.paymentMethod === 'online' ? true : false,
                    notes: orderData.notes
                })
                .returning('*');

            await trx.commit();

            return { order, customer };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    static async findAll(filters = {}) {
        let query = db(this.tableName)
            .join('products', 'orders.product_id', 'products.id')
            .join('customers', 'orders.customer_id', 'customers.id')
            .leftJoin('users as sales_rep', 'orders.sales_rep_id', 'sales_rep.id')
            .select(
                'orders.*',
                'products.name as product_name',
                'products.sku as product_sku',
                'products.image_url as product_image',
                'customers.first_name as customer_first_name',
                'customers.last_name as customer_last_name',
                'customers.city as customer_city',
                'customers.state as customer_state',
                'sales_rep.first_name as sales_rep_first_name',
                'sales_rep.last_name as sales_rep_last_name'
            );

        if (filters.status) {
            query = query.where('orders.status', filters.status);
        }

        if (filters.salesRepId) {
            query = query.where('orders.sales_rep_id', filters.salesRepId);
        }

        if (filters.paymentMethod) {
            query = query.where('orders.payment_method', filters.paymentMethod);
        }

        if (filters.customerCity) {
            query = query.where('customers.city', 'ilike', `%${filters.customerCity}%`);
        }

        if (filters.customerState) {
            query = query.where('customers.state', 'ilike', `%${filters.customerState}%`);
        }

        if (filters.dateFrom) {
            query = query.where('orders.created_at', '>=', filters.dateFrom);
        }

        if (filters.dateTo) {
            query = query.where('orders.created_at', '<=', filters.dateTo);
        }

        if (filters.search) {
            query = query.where(function () {
                this.where('products.name', 'ilike', `%${filters.search}%`)
                    .orWhere('customers.first_name', 'ilike', `%${filters.search}%`)
                    .orWhere('customers.last_name', 'ilike', `%${filters.search}%`)
                    .orWhere('customers.email', 'ilike', `%${filters.search}%`);
            });
        }

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;

        const [data, [{ count }]] = await Promise.all([
            query.clone().orderBy('orders.created_at', 'desc').limit(limit).offset(offset),
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

    static async updateStatus(id, status, userId) {
        const updateData = {
            status,
            updated_at: new Date()
        };

        if (status === 'delivered') {
            updateData.delivered_at = new Date();
            updateData.is_paid = true;
        }

        const [updated] = await db(this.tableName)
            .where({ id })
            .update(updateData)
            .returning('*');

        return updated;
    }

    static async assignSalesRep(id, salesRepId) {
        const [updated] = await db(this.tableName)
            .where({ id, status: 'pending' })
            .update({
                sales_rep_id: salesRepId,
                status: 'assigned',
                updated_at: new Date()
            })
            .returning('*');

        return updated;
    }

    static async getUnassignedOrders(city = null) {
        let query = db(this.tableName)
            .join('customers', 'orders.customer_id', 'customers.id')
            .where('orders.status', 'pending')
            .whereNull('orders.sales_rep_id');

        if (city) {
            query = query.where('customers.city', 'ilike', `%${city}%`);
        }

        return query.select('orders.*', 'customers.city', 'customers.state')
            .orderBy('orders.created_at', 'asc');
    }

    static async getSalesRepOrderCount(salesRepId, status = null) {
        let query = db(this.tableName)
            .where('sales_rep_id', salesRepId);

        if (status) {
            query = query.where('status', status);
        }

        const [{ count }] = await query.count();
        return parseInt(count);
    }

    static async getSalesRepStats(salesRepId) {
        const stats = await db(this.tableName)
            .where('sales_rep_id', salesRepId)
            .select(
                db.raw('COUNT(*) as total_orders'),
                db.raw('SUM(CASE WHEN status = \'delivered\' OR status = \'completed\' THEN 1 ELSE 0 END) as completed_orders'),
                db.raw('SUM(CASE WHEN status = \'cancelled\' THEN 1 ELSE 0 END) as cancelled_orders'),
                db.raw('SUM(CASE WHEN status IN (\'assigned\', \'confirmed\', \'processing\', \'dispatched\') THEN 1 ELSE 0 END) as active_orders'),
                db.raw('SUM(CASE WHEN status = \'delivered\' OR status = \'completed\' THEN total_amount ELSE 0 END) as total_revenue')
            )
            .first();

        return stats;
    }
}

module.exports = Order;