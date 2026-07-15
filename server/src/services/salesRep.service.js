const authService = require('./auth.service');
const userRepository = require('../repositories/user.repository');
const commissionService = require('./commission.service');
const logger = require('../utils/logger');
const crypto = require('crypto');

class SalesRepService {
    async createSalesRep(salesRepData, adminId) {
        try {
            // Check if email already exists
            const existingUser = await userRepository.findByEmail(salesRepData.email);
            if (existingUser) {
                throw new Error('A user with this email already exists');
            }

            // Generate a secure random password
            const generatedPassword = this.generateSecurePassword();

            // Create user account
            const user = await authService.createUser({
                email: salesRepData.email,
                password: generatedPassword,
                firstName: salesRepData.firstName,
                lastName: salesRepData.lastName,
                phone: salesRepData.phone,
                role: 'sales_rep'
            }, adminId);

            // Set commission structure
            if (salesRepData.commissionStructure) {
                await commissionService.setUserCommission(user.id, {
                    structure: salesRepData.commissionStructure,
                    baseSalary: salesRepData.baseSalary || 0,
                    commissionPercentage: salesRepData.commissionPercentage || 0
                }, adminId);
            }

            logger.info('Sales rep created by admin', {
                salesRepId: user.id,
                adminId,
                email: salesRepData.email
            });

            return {
                user: user,
                generatedPassword: generatedPassword,
                message: 'Sales representative created successfully. Share these credentials securely.'
            };
        } catch (error) {
            logger.error('Create sales rep error', { error: error.message, adminId });
            throw error;
        }
    }

    async getAllSalesReps(filters = {}) {
        try {
            const salesReps = await userRepository.findAll({
                role: 'sales_rep',
                ...filters
            });

            // Get commission configs for all sales reps
            const salesRepsWithCommissions = await Promise.all(
                salesReps.map(async (rep) => {
                    const config = await commissionService.getUserCommissionConfig(rep.id);
                    const stats = await this.getSalesRepQuickStats(rep.id);

                    return {
                        id: rep.id,
                        email: rep.email,
                        firstName: rep.first_name,
                        lastName: rep.last_name,
                        phone: rep.phone,
                        isActive: rep.is_active,
                        createdAt: rep.created_at,
                        commission: config ? {
                            structure: config.structure,
                            baseSalary: parseFloat(config.base_salary),
                            commissionPercentage: parseFloat(config.commission_percentage)
                        } : null,
                        stats: stats
                    };
                })
            );

            return salesRepsWithCommissions;
        } catch (error) {
            logger.error('Get all sales reps error', { error: error.message });
            throw error;
        }
    }

    async getSalesRepDetails(salesRepId) {
        try {
            const user = await userRepository.findById(salesRepId);
            if (!user || user.role !== 'sales_rep') {
                throw new Error('Sales representative not found');
            }

            const config = await commissionService.getUserCommissionConfig(salesRepId);
            const earnings = await commissionService.getUserEarnings(salesRepId);
            const stats = await this.getSalesRepDetailedStats(salesRepId);

            return {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                isActive: user.is_active,
                createdAt: user.created_at,
                commission: config ? {
                    structure: config.structure,
                    baseSalary: parseFloat(config.base_salary),
                    commissionPercentage: parseFloat(config.commission_percentage)
                } : null,
                stats: stats,
                earnings: earnings
            };
        } catch (error) {
            logger.error('Get sales rep details error', { error: error.message, salesRepId });
            throw error;
        }
    }

    async updateSalesRep(salesRepId, updateData, adminId) {
        try {
            const user = await userRepository.findById(salesRepId);
            if (!user || user.role !== 'sales_rep') {
                throw new Error('Sales representative not found');
            }

            // Update basic info
            const userUpdateData = {};
            if (updateData.firstName) userUpdateData.first_name = updateData.firstName;
            if (updateData.lastName) userUpdateData.last_name = updateData.lastName;
            if (updateData.phone) userUpdateData.phone = updateData.phone;
            if (updateData.email) userUpdateData.email = updateData.email;
            if (updateData.isActive !== undefined) userUpdateData.is_active = updateData.isActive;

            if (Object.keys(userUpdateData).length > 0) {
                await userRepository.update(salesRepId, userUpdateData);
            }

            // Update commission structure if provided
            if (updateData.commissionStructure) {
                await commissionService.setUserCommission(salesRepId, {
                    structure: updateData.commissionStructure,
                    baseSalary: updateData.baseSalary || 0,
                    commissionPercentage: updateData.commissionPercentage || 0
                }, adminId);
            }

            logger.info('Sales rep updated by admin', {
                salesRepId,
                adminId,
                updates: Object.keys(updateData)
            });

            return await this.getSalesRepDetails(salesRepId);
        } catch (error) {
            logger.error('Update sales rep error', { error: error.message, salesRepId });
            throw error;
        }
    }

    async deactivateSalesRep(salesRepId, adminId) {
        try {
            const user = await userRepository.findById(salesRepId);
            if (!user || user.role !== 'sales_rep') {
                throw new Error('Sales representative not found');
            }

            await userRepository.update(salesRepId, { is_active: false });

            logger.info('Sales rep deactivated by admin', { salesRepId, adminId });

            return { message: 'Sales representative deactivated successfully' };
        } catch (error) {
            logger.error('Deactivate sales rep error', { error: error.message, salesRepId });
            throw error;
        }
    }

    async reactivateSalesRep(salesRepId, adminId) {
        try {
            const user = await userRepository.findById(salesRepId);
            if (!user || user.role !== 'sales_rep') {
                throw new Error('Sales representative not found');
            }

            await userRepository.update(salesRepId, { is_active: true });

            logger.info('Sales rep reactivated by admin', { salesRepId, adminId });

            return { message: 'Sales representative reactivated successfully' };
        } catch (error) {
            logger.error('Reactivate sales rep error', { error: error.message, salesRepId });
            throw error;
        }
    }

    async resetPassword(salesRepId, adminId) {
        try {
            const user = await userRepository.findById(salesRepId);
            if (!user || user.role !== 'sales_rep') {
                throw new Error('Sales representative not found');
            }

            const newPassword = this.generateSecurePassword();
            const bcrypt = require('bcryptjs');
            const passwordHash = await bcrypt.hash(newPassword, 12);

            await userRepository.update(salesRepId, { password_hash: passwordHash });

            logger.info('Password reset for sales rep by admin', {
                salesRepId,
                adminId
            });

            return {
                salesRepId: salesRepId,
                email: user.email,
                newPassword: newPassword,
                message: 'Password has been reset successfully. Share the new password securely.'
            };
        } catch (error) {
            logger.error('Reset password error', { error: error.message, salesRepId });
            throw error;
        }
    }

    async getSalesRepQuickStats(salesRepId) {
        try {
            const db = require('../config/database');

            const stats = await db('orders')
                .where('sales_rep_id', salesRepId)
                .select(
                    db.raw('COUNT(*) as total_orders'),
                    db.raw('SUM(CASE WHEN status IN (\'delivered\', \'completed\') THEN 1 ELSE 0 END) as completed_orders'),
                    db.raw('SUM(CASE WHEN status IN (\'assigned\', \'confirmed\', \'processing\', \'dispatched\') THEN 1 ELSE 0 END) as active_orders'),
                    db.raw('COALESCE(SUM(CASE WHEN status IN (\'delivered\', \'completed\') THEN total_amount ELSE 0 END), 0) as total_revenue')
                )
                .first();

            return {
                totalOrders: parseInt(stats.total_orders) || 0,
                completedOrders: parseInt(stats.completed_orders) || 0,
                activeOrders: parseInt(stats.active_orders) || 0,
                totalRevenue: parseFloat(stats.total_revenue) || 0
            };
        } catch (error) {
            logger.error('Get quick stats error', { error: error.message, salesRepId });
            return null;
        }
    }

    async getSalesRepDetailedStats(salesRepId) {
        try {
            const db = require('../config/database');

            const [orderStats, monthlyStats, productStats] = await Promise.all([
                // Overall stats
                db('orders')
                    .where('sales_rep_id', salesRepId)
                    .select(
                        db.raw('COUNT(*) as total_orders'),
                        db.raw('COUNT(DISTINCT DATE(created_at)) as active_days'),
                        db.raw('COALESCE(SUM(total_amount), 0) as total_value'),
                        db.raw('AVG(total_amount)::numeric(10,2) as average_order_value')
                    )
                    .first(),

                // Monthly breakdown
                db('orders')
                    .where('sales_rep_id', salesRepId)
                    .whereRaw('created_at >= NOW() - INTERVAL \'6 months\'')
                    .select(
                        db.raw("DATE_TRUNC('month', created_at) as month"),
                        db.raw('COUNT(*) as orders'),
                        db.raw('COALESCE(SUM(total_amount), 0) as revenue')
                    )
                    .groupBy(db.raw("DATE_TRUNC('month', created_at)"))
                    .orderBy('month', 'asc'),

                // Top products
                db('orders')
                    .join('products', 'orders.product_id', 'products.id')
                    .where('orders.sales_rep_id', salesRepId)
                    .whereIn('orders.status', ['delivered', 'completed'])
                    .select(
                        'products.id',
                        'products.name',
                        db.raw('COUNT(*) as count'),
                        db.raw('COALESCE(SUM(orders.total_amount), 0) as revenue')
                    )
                    .groupBy('products.id', 'products.name')
                    .orderBy('count', 'desc')
                    .limit(5)
            ]);

            return {
                overview: {
                    totalOrders: parseInt(orderStats.total_orders) || 0,
                    activeDays: parseInt(orderStats.active_days) || 0,
                    totalValue: parseFloat(orderStats.total_value) || 0,
                    averageOrderValue: parseFloat(orderStats.average_order_value) || 0
                },
                monthlyStats: monthlyStats.map(m => ({
                    month: m.month,
                    orders: parseInt(m.orders),
                    revenue: parseFloat(m.revenue)
                })),
                topProducts: productStats.map(p => ({
                    id: p.id,
                    name: p.name,
                    count: parseInt(p.count),
                    revenue: parseFloat(p.revenue)
                }))
            };
        } catch (error) {
            logger.error('Get detailed stats error', { error: error.message, salesRepId });
            return null;
        }
    }

    generateSecurePassword() {
        // Generate a 12-character password with mixed characters
        const length = 12;
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '@$!%*?&#';

        const all = lowercase + uppercase + numbers + symbols;

        // Ensure at least one of each type
        let password = '';
        password += lowercase[crypto.randomInt(lowercase.length)];
        password += uppercase[crypto.randomInt(uppercase.length)];
        password += numbers[crypto.randomInt(numbers.length)];
        password += symbols[crypto.randomInt(symbols.length)];

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += all[crypto.randomInt(all.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => crypto.randomInt(-1, 1)).join('');
    }
}

module.exports = new SalesRepService();