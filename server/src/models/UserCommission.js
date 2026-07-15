const db = require('../config/database');

class UserCommission {
    static tableName = 'user_commissions';

    static async findByUserId(userId) {
        return db(this.tableName)
            .where({ user_id: userId, is_active: true })
            .first();
    }

    static async upsert(userId, data) {
        const existing = await this.findByUserId(userId);

        if (existing) {
            const [updated] = await db(this.tableName)
                .where({ user_id: userId })
                .update({
                    structure: data.structure,
                    base_salary: data.baseSalary || 0,
                    commission_percentage: data.commissionPercentage || 0,
                    updated_at: new Date()
                })
                .returning('*');
            return updated;
        }

        const [created] = await db(this.tableName)
            .insert({
                user_id: userId,
                structure: data.structure,
                base_salary: data.baseSalary || 0,
                commission_percentage: data.commissionPercentage || 0
            })
            .returning('*');
        return created;
    }
}

module.exports = UserCommission;