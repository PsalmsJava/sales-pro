const db = require('../config/database');

class User {
    static tableName = 'users';

    static async findById(id) {
        return db(this.tableName)
            .where({ id, is_active: true })
            .first();
    }

    static async findByEmail(email) {
        if (!email) return null;
        const normalized = email.toLowerCase().trim();
        let user = await db(this.tableName)
            .whereRaw('LOWER(email) = ?', [normalized])
            .first();

        if (!user) {
            let alternateEmail = null;
            if (normalized.endsWith('@sales-pro.com')) {
                alternateEmail = normalized.replace('@sales-pro.com', '@salespro.com');
            } else if (normalized.endsWith('@salespro.com')) {
                alternateEmail = normalized.replace('@salespro.com', '@sales-pro.com');
            }

            if (alternateEmail) {
                user = await db(this.tableName)
                    .whereRaw('LOWER(email) = ?', [alternateEmail])
                    .first();
            }
        }

        return user;
    }

    static async create(userData) {
        const [user] = await db(this.tableName)
            .insert(userData)
            .returning('*');
        return user;
    }

    static async update(id, userData) {
        const [updated] = await db(this.tableName)
            .where({ id })
            .update(userData)
            .returning('*');
        return updated;
    }

    static async findAll(filters = {}) {
        let query = db(this.tableName);

        if (filters.role) {
            query = query.where({ role: filters.role });
        }

        if (filters.isActive !== undefined) {
            query = query.where({ is_active: filters.isActive });
        }

        return query.orderBy('created_at', 'desc');
    }

    static async softDelete(id) {
        return db(this.tableName)
            .where({ id })
            .update({ is_active: false });
    }
}

module.exports = User;