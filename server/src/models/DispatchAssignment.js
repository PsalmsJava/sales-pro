const db = require('../config/database');

class DispatchAssignment {
    static tableName = 'dispatch_assignments';

    static async findById(id) {
        return db(this.tableName)
            .join('orders', 'dispatch_assignments.order_id', 'orders.id')
            .join('dispatch_partners', 'dispatch_assignments.dispatch_partner_id', 'dispatch_partners.id')
            .join('products', 'orders.product_id', 'products.id')
            .join('customers', 'orders.customer_id', 'customers.id')
            .select(
                'dispatch_assignments.*',
                'orders.total_amount as order_amount',
                'orders.status as order_status',
                'products.name as product_name',
                'products.image_url as product_image',
                'dispatch_partners.company_name',
                'customers.first_name as customer_first_name',
                'customers.last_name as customer_last_name',
                'customers.address as customer_address',
                'customers.city as customer_city',
                'customers.state as customer_state',
                'customers.phone as customer_phone'
            )
            .first();
    }

    static async create(assignmentData) {
        const [assignment] = await db(this.tableName)
            .insert(assignmentData)
            .returning('*');
        return assignment;
    }

    static async findByDispatchPartner(partnerId, filters = {}) {
        let query = db(this.tableName)
            .join('orders', 'dispatch_assignments.order_id', 'orders.id')
            .join('products', 'orders.product_id', 'products.id')
            .join('customers', 'orders.customer_id', 'customers.id')
            .where('dispatch_assignments.dispatch_partner_id', partnerId)
            .select(
                'dispatch_assignments.*',
                'orders.total_amount as order_amount',
                'products.name as product_name',
                'products.image_url as product_image',
                'customers.first_name as customer_first_name',
                'customers.last_name as customer_last_name',
                'customers.address as customer_address',
                'customers.city as customer_city',
                'customers.state as customer_state',
                'customers.phone as customer_phone'
            );

        if (filters.status) {
            query = query.where('dispatch_assignments.status', filters.status);
        }

        return query.orderBy('dispatch_assignments.created_at', 'desc');
    }

    static async updateStatus(id, status, updateData = {}) {
        const data = {
            status,
            updated_at: new Date(),
            ...updateData
        };

        if (status === 'delivered') {
            data.delivery_time = new Date();
        }

        if (status === 'picked_up') {
            data.pickup_time = new Date();
        }

        const [updated] = await db(this.tableName)
            .where({ id })
            .update(data)
            .returning('*');
        return updated;
    }

    static async getActiveAssignments(partnerId) {
        return db(this.tableName)
            .where('dispatch_partner_id', partnerId)
            .whereIn('status', ['assigned', 'picked_up', 'in_transit'])
            .count()
            .first();
    }
}

module.exports = DispatchAssignment;