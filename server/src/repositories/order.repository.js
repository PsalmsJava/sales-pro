const db = require('../config/database');
const logger = require('../utils/logger');

class OrderRepository {
    async findById(id) {
        const order = await db('orders')
            .join('products', 'orders.product_id', 'products.id')
            .join('customers', 'orders.customer_id', 'customers.id')
            .leftJoin('users as sales_rep', 'orders.sales_rep_id', 'sales_rep.id')
            .where('orders.id', id)
            .select(
                'orders.*',
                'products.name as product_name', 'products.sku as product_sku', 'products.image_url as product_image',
                'customers.first_name as customer_first_name', 'customers.last_name as customer_last_name',
                'customers.email as customer_email', 'customers.phone as customer_phone',
                'customers.address as customer_address', 'customers.city as customer_city', 'customers.state as customer_state',
                'sales_rep.first_name as sales_rep_first_name', 'sales_rep.last_name as sales_rep_last_name'
            )
            .first();
        if (!order) throw new Error('Order not found');
        return order;
    }

    async create(orderData) {
        const trx = await db.transaction();
        try {
            const [customer] = await trx('customers').insert({
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
            }).returning('*');

            const [order] = await trx('orders').insert({
                product_id: orderData.productId,
                customer_id: customer.id,
                quantity: orderData.quantity,
                total_amount: orderData.totalAmount,
                payment_method: orderData.paymentMethod,
                status: 'pending',
                is_paid: orderData.paymentMethod === 'online',
                notes: orderData.notes
            }).returning('*');

            await trx.commit();
            return { order, customer };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    async findAll(filters = {}) {
        let countQuery = db('orders')
            .join('customers', 'orders.customer_id', 'customers.id');

        let dataQuery = db('orders')
            .join('products', 'orders.product_id', 'products.id')
            .join('customers', 'orders.customer_id', 'customers.id')
            .leftJoin('users as sales_rep', 'orders.sales_rep_id', 'sales_rep.id')
            .select(
                'orders.*',
                'products.name as product_name', 'products.sku as product_sku', 'products.image_url as product_image',
                'customers.first_name as customer_first_name', 'customers.last_name as customer_last_name',
                'customers.city as customer_city', 'customers.state as customer_state',
                'sales_rep.first_name as sales_rep_first_name', 'sales_rep.last_name as sales_rep_last_name'
            );

        if (filters.status) {
            countQuery = countQuery.where('orders.status', filters.status);
            dataQuery = dataQuery.where('orders.status', filters.status);
        }
        if (filters.salesRepId) {
            countQuery = countQuery.where('orders.sales_rep_id', filters.salesRepId);
            dataQuery = dataQuery.where('orders.sales_rep_id', filters.salesRepId);
        }
        if (filters.paymentMethod) {
            countQuery = countQuery.where('orders.payment_method', filters.paymentMethod);
            dataQuery = dataQuery.where('orders.payment_method', filters.paymentMethod);
        }
        if (filters.search) {
            countQuery = countQuery.where(function () {
                this.where('customers.first_name', 'ilike', `%${filters.search}%`)
                    .orWhere('customers.last_name', 'ilike', `%${filters.search}%`)
                    .orWhere('customers.email', 'ilike', `%${filters.search}%`);
            });
            dataQuery = dataQuery.where(function () {
                this.where('customers.first_name', 'ilike', `%${filters.search}%`)
                    .orWhere('customers.last_name', 'ilike', `%${filters.search}%`)
                    .orWhere('customers.email', 'ilike', `%${filters.search}%`)
                    .orWhere('products.name', 'ilike', `%${filters.search}%`);
            });
        }

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;

        const [data, countResult] = await Promise.all([
            dataQuery.orderBy('orders.created_at', 'desc').limit(limit).offset(offset),
            countQuery.count('orders.id as count').first()
        ]);

        const total = parseInt(countResult?.count || 0);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateStatus(id, status) {
        const updateData = { status, updated_at: new Date() };
        if (status === 'delivered') {
            updateData.delivered_at = new Date();
            updateData.is_paid = true;
        }
        const [updated] = await db('orders').where({ id }).update(updateData).returning('*');
        return updated;
    }

    // ==========================================
    // RESCHEDULE
    // ==========================================
    async reschedule(id, { scheduledAt, reason, userId }) {
        const updateData = {
            scheduled_at: scheduledAt,
            reschedule_reason: reason || null,
            rescheduled_by: userId,
            updated_at: new Date()
        };

        // Move status back to 'assigned' if it was progressed, so rep can re-confirm
        // (optional — remove if you want to keep the current status)
        const [updated] = await db('orders')
            .where({ id })
            .update(updateData)
            .returning('*');

        if (!updated) throw new Error('Order not found');

        // Return with joined fields so the formatter has everything
        return this.findById(id);
    }

    // ==========================================
    // CALLBACK
    // ==========================================
    async scheduleCallback(id, { callbackAt, comment, userId }) {
        const updateData = {
            callback_at: callbackAt,
            callback_comment: comment,
            callback_set_by: userId,
            updated_at: new Date()
        };

        const [updated] = await db('orders')
            .where({ id })
            .update(updateData)
            .returning('*');

        if (!updated) throw new Error('Order not found');

        return this.findById(id);
    }

    async getUnassignedOrders() {
        return db('orders')
            .join('customers', 'orders.customer_id', 'customers.id')
            .where('orders.status', 'pending')
            .whereNull('orders.sales_rep_id')
            .select('orders.*', 'customers.city', 'customers.state')
            .orderBy('orders.created_at', 'asc');
    }

    async assignSalesRep(id, salesRepId) {
        const [updated] = await db('orders')
            .where({ id, status: 'pending' })
            .update({ sales_rep_id: salesRepId, status: 'assigned', updated_at: new Date() })
            .returning('*');
        return updated;
    }

    async getSalesRepOrderCount(salesRepId, status = null) {
        let query = db('orders').where('sales_rep_id', salesRepId);
        if (status) query = query.where('status', status);
        const result = await query.count('id as count').first();
        return parseInt(result?.count || 0);
    }

    async getSalesRepStats(salesRepId) {
        return db('orders')
            .where('sales_rep_id', salesRepId)
            .select(
                db.raw('COUNT(*)::int as total_orders'),
                db.raw("COUNT(*) FILTER (WHERE status IN ('delivered', 'completed'))::int as completed_orders"),
                db.raw("COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled_orders"),
                db.raw("COUNT(*) FILTER (WHERE status IN ('assigned', 'confirmed', 'processing', 'dispatched'))::int as active_orders"),
                db.raw("COALESCE(SUM(total_amount) FILTER (WHERE status IN ('delivered', 'completed')), 0)::float as total_revenue")
            )
            .first();
    }

    // ==========================================
    // CALLBACKS DUE (for dashboard widgets)
    // ==========================================
    async getDueCallbacks(salesRepId = null) {
        let query = db('orders')
            .join('customers', 'orders.customer_id', 'customers.id')
            .join('products', 'orders.product_id', 'products.id')
            .whereNotNull('orders.callback_at')
            .where('orders.callback_at', '<=', db.fn.now())
            .whereNotIn('orders.status', ['delivered', 'completed', 'cancelled'])
            .select(
                'orders.*',
                'products.name as product_name',
                'customers.first_name as customer_first_name',
                'customers.last_name as customer_last_name',
                'customers.phone as customer_phone'
            )
            .orderBy('orders.callback_at', 'asc');

        if (salesRepId) {
            query = query.where('orders.sales_rep_id', salesRepId);
        }

        return query;
    }
}

module.exports = new OrderRepository();