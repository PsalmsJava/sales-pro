const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const dispatchPartnerRepository = require('../repositories/dispatchPartner.repository');
const earningRepository = require('../repositories/earning.repository');
const logger = require('../utils/logger');

class AdminService {
    async getDashboardStats() {
        try {
            const db = require('../config/database');

            // Get all stats in parallel
            const [
                totalOrders,
                totalRevenue,
                totalProducts,
                lowStockProducts,
                totalSalesReps,
                totalDispatchPartners,
                pendingOrders,
                todayOrders,
                monthlyRevenue,
                ordersByStatus,
                topSellingProducts,
                recentOrders
            ] = await Promise.all([
                // Total orders
                db('orders').count().first(),

                // Total revenue (completed/delivered orders)
                db('orders')
                    .whereIn('status', ['delivered', 'completed'])
                    .sum('total_amount as total')
                    .first(),

                // Total active products
                db('products').where('is_active', true).count().first(),

                // Low stock products
                db('products')
                    .where('is_active', true)
                    .where('quantity', '<=', 5)
                    .count()
                    .first(),

                // Total sales reps
                db('users').where({ role: 'sales_rep', is_active: true }).count().first(),

                // Total dispatch partners
                db('dispatch_partners').where({ is_verified: true, is_active: true }).count().first(),

                // Pending orders
                db('orders').where('status', 'pending').count().first(),

                // Today's orders
                db('orders')
                    .whereRaw('DATE(created_at) = CURRENT_DATE')
                    .count()
                    .first(),

                // Monthly revenue
                db('orders')
                    .whereIn('status', ['delivered', 'completed'])
                    .whereRaw('DATE_TRUNC(\'month\', created_at) = DATE_TRUNC(\'month\', CURRENT_DATE)')
                    .sum('total_amount as total')
                    .first(),

                // Orders by status
                db('orders')
                    .select('status', db.raw('COUNT(*) as count'))
                    .groupBy('status'),

                // Top selling products
                db('orders')
                    .join('products', 'orders.product_id', 'products.id')
                    .whereIn('orders.status', ['delivered', 'completed'])
                    .select(
                        'products.id',
                        'products.name',
                        'products.image_url',
                        db.raw('COUNT(orders.id) as order_count'),
                        db.raw('SUM(orders.total_amount) as total_revenue')
                    )
                    .groupBy('products.id', 'products.name', 'products.image_url')
                    .orderBy('order_count', 'desc')
                    .limit(5),

                // Recent orders
                db('orders')
                    .join('products', 'orders.product_id', 'products.id')
                    .join('customers', 'orders.customer_id', 'customers.id')
                    .select(
                        'orders.id',
                        'orders.status',
                        'orders.total_amount',
                        'orders.created_at',
                        'products.name as product_name',
                        'customers.first_name as customer_first_name',
                        'customers.last_name as customer_last_name'
                    )
                    .orderBy('orders.created_at', 'desc')
                    .limit(10)
            ]);

            return {
                stats: {
                    totalOrders: parseInt(totalOrders.count),
                    totalRevenue: parseFloat(totalRevenue.total) || 0,
                    totalProducts: parseInt(totalProducts.count),
                    lowStockProducts: parseInt(lowStockProducts.count),
                    totalSalesReps: parseInt(totalSalesReps.count),
                    totalDispatchPartners: parseInt(totalDispatchPartners.count),
                    pendingOrders: parseInt(pendingOrders.count),
                    todayOrders: parseInt(todayOrders.count),
                    monthlyRevenue: parseFloat(monthlyRevenue.total) || 0,
                    conversionRate: totalOrders.count > 0
                        ? ((ordersByStatus.filter(o => ['delivered', 'completed'].includes(o.status))
                            .reduce((sum, o) => sum + parseInt(o.count), 0) / parseInt(totalOrders.count)) * 100).toFixed(1)
                        : 0
                },
                ordersByStatus: ordersByStatus.map(o => ({
                    status: o.status,
                    count: parseInt(o.count)
                })),
                topSellingProducts: topSellingProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    imageUrl: p.image_url,
                    orderCount: parseInt(p.order_count),
                    totalRevenue: parseFloat(p.total_revenue)
                })),
                recentOrders: recentOrders.map(o => ({
                    id: o.id,
                    productName: o.product_name,
                    customerName: `${o.customer_first_name} ${o.customer_last_name}`,
                    status: o.status,
                    totalAmount: parseFloat(o.total_amount),
                    createdAt: o.created_at
                }))
            };
        } catch (error) {
            logger.error('Get dashboard stats error', { error: error.message });
            throw error;
        }
    }

    async getSalesRepPerformance() {
        try {
            const db = require('../config/database');

            const performance = await db('users')
                .where('users.role', 'sales_rep')
                .leftJoin('orders', 'users.id', 'orders.sales_rep_id')
                .leftJoin('earnings', function () {
                    this.on('orders.id', 'earnings.order_id')
                        .on('earnings.user_id', 'users.id');
                })
                .select(
                    'users.id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    db.raw('COUNT(DISTINCT orders.id) as total_orders'),
                    db.raw('SUM(CASE WHEN orders.status IN (\'delivered\', \'completed\') THEN 1 ELSE 0 END) as completed_orders'),
                    db.raw('SUM(CASE WHEN orders.status = \'cancelled\' THEN 1 ELSE 0 END) as cancelled_orders'),
                    db.raw('COALESCE(SUM(earnings.amount), 0) as total_earnings'),
                    db.raw('COALESCE(SUM(orders.total_amount), 0) as total_revenue')
                )
                .groupBy('users.id', 'users.first_name', 'users.last_name', 'users.email')
                .orderBy('total_revenue', 'desc');

            return performance.map(rep => ({
                id: rep.id,
                name: `${rep.first_name} ${rep.last_name}`,
                email: rep.email,
                totalOrders: parseInt(rep.total_orders),
                completedOrders: parseInt(rep.completed_orders),
                cancelledOrders: parseInt(rep.cancelled_orders),
                totalEarnings: parseFloat(rep.total_earnings),
                totalRevenue: parseFloat(rep.total_revenue),
                completionRate: rep.total_orders > 0
                    ? ((rep.completed_orders / rep.total_orders) * 100).toFixed(1)
                    : 0
            }));
        } catch (error) {
            logger.error('Get sales rep performance error', { error: error.message });
            throw error;
        }
    }
}

module.exports = new AdminService();