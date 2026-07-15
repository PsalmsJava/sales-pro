const db = require('../config/database');

class DispatchPartner {
    static tableName = 'dispatch_partners';

    static async findById(id) {
        return db(this.tableName)
            .join('users', 'dispatch_partners.user_id', 'users.id')
            .where('dispatch_partners.id', id)
            .select(
                'dispatch_partners.*',
                'users.email as user_email',
                'users.first_name',
                'users.last_name'
            )
            .first();
    }

    static async findByUserId(userId) {
        return db(this.tableName)
            .where({ user_id: userId })
            .first();
    }

    static async create(partnerData) {
        const [partner] = await db(this.tableName)
            .insert(partnerData)
            .returning('*');
        return partner;
    }

    static async findAll(filters = {}) {
        let query = db(this.tableName)
            .join('users', 'dispatch_partners.user_id', 'users.id')
            .select(
                'dispatch_partners.*',
                'users.email as user_email',
                'users.first_name',
                'users.last_name',
                'users.is_active as user_active'
            );

        if (filters.isVerified !== undefined) {
            query = query.where('dispatch_partners.is_verified', filters.isVerified);
        }

        if (filters.isActive !== undefined) {
            query = query.where('dispatch_partners.is_active', filters.isActive);
        }

        if (filters.city) {
            query = query.where('dispatch_partners.city', 'ilike', `%${filters.city}%`);
        }

        if (filters.state) {
            query = query.where('dispatch_partners.state', 'ilike', `%${filters.state}%`);
        }

        return query.orderBy('dispatch_partners.created_at', 'desc');
    }

    static async update(id, partnerData) {
        const [updated] = await db(this.tableName)
            .where({ id })
            .update({
                ...partnerData,
                updated_at: new Date()
            })
            .returning('*');
        return updated;
    }

    static async verify(id) {
        return this.update(id, { is_verified: true });
    }
}

module.exports = DispatchPartner;