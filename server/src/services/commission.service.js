const userRepository = require('../repositories/user.repository');
const earningRepository = require('../repositories/earning.repository');
const orderRepository = require('../repositories/order.repository');
const logger = require('../utils/logger');

class CommissionService {
    async setUserCommission(userId, commissionData, adminId) {
        try {
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Validate structure
            this.validateCommissionStructure(commissionData);

            // Upsert commission config
            const config = await this.upsertCommissionConfig(userId, commissionData);

            logger.info('Commission structure set for user', {
                userId,
                structure: commissionData.structure,
                setBy: adminId
            });

            return config;
        } catch (error) {
            logger.error('Set commission error', { error: error.message, userId });
            throw error;
        }
    }

    async calculateCommission(userId, orderId) {
        try {
            const order = await orderRepository.findById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Get user's commission config
            const config = await this.getUserCommissionConfig(userId);
            if (!config) {
                throw new Error('No commission structure set for this user');
            }

            let earnings = [];

            // Calculate commission based on structure
            if (config.structure === 'commission_only') {
                const commissionAmount = (order.total_amount * config.commission_percentage) / 100;
                earnings.push({
                    user_id: userId,
                    order_id: orderId,
                    type: 'commission',
                    amount: commissionAmount,
                    description: `Commission (${config.commission_percentage}%) on order ${orderId}`
                });
            } else if (config.structure === 'salary_plus_commission') {
                const commissionAmount = (order.total_amount * config.commission_percentage) / 100;
                earnings.push({
                    user_id: userId,
                    order_id: orderId,
                    type: 'commission',
                    amount: commissionAmount,
                    description: `Commission (${config.commission_percentage}%) on order ${orderId}`
                });
            }
            // salary_only has no per-order earnings

            // Create earnings records
            if (earnings.length > 0) {
                await earningRepository.bulkCreate(earnings);
            }

            logger.info('Commission calculated for order', {
                userId,
                orderId,
                structure: config.structure,
                earnings
            });

            return earnings;
        } catch (error) {
            logger.error('Calculate commission error', { error: error.message, userId, orderId });
            throw error;
        }
    }

    async processSalaryPayments() {
        try {
            const users = await userRepository.findAll({
                role: 'sales_rep',
                isActive: true
            });

            const salaryEarnings = [];

            for (const user of users) {
                const config = await this.getUserCommissionConfig(user.id);

                if (config && (config.structure === 'salary_only' || config.structure === 'salary_plus_commission')) {
                    salaryEarnings.push({
                        user_id: user.id,
                        order_id: null, // Salary is not tied to a specific order
                        type: 'salary',
                        amount: config.base_salary,
                        status: 'pending',
                        description: `Monthly salary - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                        earned_at: new Date()
                    });
                }
            }

            if (salaryEarnings.length > 0) {
                await earningRepository.bulkCreate(salaryEarnings);
            }

            logger.info('Salary payments processed', {
                count: salaryEarnings.length
            });

            return salaryEarnings;
        } catch (error) {
            logger.error('Process salary error', { error: error.message });
            throw error;
        }
    }

    async getUserEarnings(userId, filters = {}) {
        try {
            const [earnings, summary, topProducts, monthlyEarnings] = await Promise.all([
                earningRepository.findByUser(userId, filters),
                earningRepository.getEarningsSummary(userId),
                earningRepository.getTopProductsByEarnings(userId),
                earningRepository.getMonthlyEarnings(userId)
            ]);

            const config = await this.getUserCommissionConfig(userId);

            return {
                config: config ? {
                    structure: config.structure,
                    baseSalary: parseFloat(config.base_salary),
                    commissionPercentage: parseFloat(config.commission_percentage)
                } : null,
                summary: {
                    totalEarnings: parseFloat(summary.total_earnings) || 0,
                    totalCommission: parseFloat(summary.total_commission) || 0,
                    totalSalary: parseFloat(summary.total_salary) || 0,
                    totalBonus: parseFloat(summary.total_bonus) || 0,
                    pendingEarnings: parseFloat(summary.pending_earnings) || 0,
                    paidEarnings: parseFloat(summary.paid_earnings) || 0,
                    totalOrders: parseInt(summary.total_orders_with_earnings) || 0
                },
                topProducts: topProducts.map(p => ({
                    productId: p.product_id,
                    productName: p.product_name,
                    productImage: p.product_image,
                    totalEarnings: parseFloat(p.total_earnings),
                    orderCount: parseInt(p.order_count)
                })),
                monthlyEarnings: monthlyEarnings.map(m => ({
                    month: m.month,
                    total: parseFloat(m.total),
                    commission: parseFloat(m.commission),
                    salary: parseFloat(m.salary)
                })),
                recentEarnings: earnings.slice(0, 20)
            };
        } catch (error) {
            logger.error('Get user earnings error', { error: error.message, userId });
            throw error;
        }
    }

    async getUserCommissionConfig(userId) {
        try {
            const config = await require('../models/UserCommission').findByUserId(userId);
            return config;
        } catch (error) {
            logger.error('Get commission config error', { error: error.message, userId });
            return null;
        }
    }

    async upsertCommissionConfig(userId, configData) {
        try {
            return await require('../models/UserCommission').upsert(userId, configData);
        } catch (error) {
            logger.error('Upsert commission config error', { error: error.message });
            throw error;
        }
    }

    validateCommissionStructure(data) {
        if (data.structure === 'commission_only' && (!data.commissionPercentage || data.commissionPercentage <= 0)) {
            throw new Error('Commission percentage is required for commission-only structure');
        }

        if ((data.structure === 'salary_only' || data.structure === 'salary_plus_commission') &&
            (!data.baseSalary || data.baseSalary <= 0)) {
            throw new Error('Base salary is required for salary-based structures');
        }

        if (data.structure === 'salary_plus_commission' &&
            (!data.commissionPercentage || data.commissionPercentage <= 0)) {
            throw new Error('Commission percentage is required for salary plus commission structure');
        }
    }
}

module.exports = new CommissionService();