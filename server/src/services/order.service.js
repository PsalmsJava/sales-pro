const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

class OrderService {
    async createOrder(orderData) {
        try {
            // Validate product exists and has stock
            const product = await productRepository.findById(orderData.productId);

            if (product.quantity < orderData.quantity) {
                throw new Error(`Only ${product.quantity} units available in stock`);
            }

            // Calculate total
            const totalAmount = product.price * orderData.quantity;

            // Create order with customer
            const result = await orderRepository.create({
                ...orderData,
                totalAmount
            });

            // Reserve stock
            await productRepository.updateQuantity(
                orderData.productId,
                orderData.quantity,
                'subtract'
            );

            logger.info('Order created successfully', {
                orderId: result.order.id,
                productId: orderData.productId,
                amount: totalAmount
            });

            return this.formatOrder({
                ...result.order,
                product_name: product.name,
                product_image: product.image_url,
                customer_first_name: result.customer.first_name,
                customer_last_name: result.customer.last_name
            });
        } catch (error) {
            logger.error('Create order service error', { error: error.message });
            throw error;
        }
    }

    async getOrder(id, userId, userRole) {
        try {
            const order = await orderRepository.findById(id);

            // Sales reps can only see their own orders
            if (userRole === 'sales_rep' && order.sales_rep_id !== userId) {
                throw new Error('You can only view your assigned orders');
            }

            // Sales reps cannot see full customer details
            if (userRole === 'sales_rep') {
                return this.formatOrderForSalesRep(order);
            }

            return this.formatOrder(order);
        } catch (error) {
            logger.error('Get order service error', { error: error.message, orderId: id });
            throw error;
        }
    }

    async getAllOrders(filters, userId, userRole) {
        try {
            // Sales reps can only see their orders
            if (userRole === 'sales_rep') {
                filters.salesRepId = userId;
            }

            const result = await orderRepository.findAll(filters);

            const formattedData = result.data.map(order =>
                userRole === 'sales_rep'
                    ? this.formatOrderForSalesRep(order)
                    : this.formatOrder(order)
            );

            return {
                data: formattedData,
                pagination: result.pagination
            };
        } catch (error) {
            logger.error('Get all orders service error', { error: error.message });
            throw error;
        }
    }

    async updateOrderStatus(id, status, userId, userRole) {
        try {
            const order = await orderRepository.findById(id);

            // Validate status transitions
            this.validateStatusTransition(order.status, status, userRole);

            // If cancelling, restore stock
            if (status === 'cancelled' && order.status !== 'cancelled') {
                await productRepository.updateQuantity(
                    order.product_id,
                    order.quantity,
                    'add'
                );
            }

            const updatedOrder = await orderRepository.updateStatus(id, status, userId);

            logger.info('Order status updated', {
                orderId: id,
                oldStatus: order.status,
                newStatus: status,
                updatedBy: userId
            });

            return this.formatOrder(updatedOrder);
        } catch (error) {
            logger.error('Update order status error', { error: error.message, orderId: id });
            throw error;
        }
    }

    async assignOrdersToSalesReps() {
        try {
            // Get all unassigned orders
            const unassignedOrders = await orderRepository.getUnassignedOrders();

            if (unassignedOrders.length === 0) return [];

            // Get all active sales reps
            const salesReps = await userRepository.findAll({
                role: 'sales_rep',
                isActive: true
            });

            if (salesReps.length === 0) {
                logger.warn('No active sales reps available for assignment');
                return [];
            }

            // Get current order counts for each rep
            const repOrderCounts = await Promise.all(
                salesReps.map(async (rep) => ({
                    repId: rep.id,
                    activeOrders: await orderRepository.getSalesRepOrderCount(rep.id, 'assigned')
                }))
            );

            const assignments = [];

            // Round-robin assignment with equal distribution
            for (const order of unassignedOrders) {
                // Find rep with fewest active orders
                const sortedReps = repOrderCounts.sort((a, b) => a.activeOrders - b.activeOrders);
                const selectedRep = sortedReps[0];

                // Assign order
                await orderRepository.assignSalesRep(order.id, selectedRep.repId);

                // Update count
                selectedRep.activeOrders++;

                assignments.push({
                    orderId: order.id,
                    salesRepId: selectedRep.repId
                });
            }

            logger.info('Orders assigned to sales reps', {
                totalAssigned: assignments.length,
                repsInvolved: new Set(assignments.map(a => a.salesRepId)).size
            });

            return assignments;
        } catch (error) {
            logger.error('Assign orders error', { error: error.message });
            throw error;
        }
    }

    async getSalesRepStats(salesRepId) {
        try {
            const stats = await orderRepository.getSalesRepStats(salesRepId);
            return {
                totalOrders: parseInt(stats.total_orders) || 0,
                completedOrders: parseInt(stats.completed_orders) || 0,
                cancelledOrders: parseInt(stats.cancelled_orders) || 0,
                activeOrders: parseInt(stats.active_orders) || 0,
                totalRevenue: parseFloat(stats.total_revenue) || 0,
                completionRate: stats.total_orders > 0
                    ? ((stats.completed_orders / stats.total_orders) * 100).toFixed(1)
                    : 0
            };
        } catch (error) {
            logger.error('Get sales rep stats error', { error: error.message, salesRepId });
            throw error;
        }
    }

    validateStatusTransition(currentStatus, newStatus, userRole) {
        const validTransitions = {
            pending: ['assigned', 'cancelled'],
            assigned: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['dispatched', 'cancelled'],
            dispatched: ['delivered', 'cancelled'],
            delivered: ['completed'],
            completed: [],
            cancelled: []
        };

        const roleTransitions = {
            admin: ['pending', 'assigned', 'confirmed', 'processing', 'dispatched', 'delivered', 'completed', 'cancelled'],
            sales_rep: ['confirmed', 'processing', 'cancelled'],
            dispatch_partner: ['dispatched', 'delivered']
        };

        // Check if role can make this transition
        if (roleTransitions[userRole] && !roleTransitions[userRole].includes(newStatus)) {
            throw new Error('You do not have permission to change order to this status');
        }

        // Check if transition is valid
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new Error(`Cannot change order status from ${currentStatus} to ${newStatus}`);
        }
    }

    formatOrder(order) {
        return {
            id: order.id,
            productId: order.product_id,
            productName: order.product_name,
            productSku: order.product_sku,
            productImage: order.product_image,
            quantity: order.quantity,
            totalAmount: parseFloat(order.total_amount),
            paymentMethod: order.payment_method,
            isPaid: order.is_paid,
            status: order.status,
            notes: order.notes,
            customer: {
                firstName: order.customer_first_name,
                lastName: order.customer_last_name,
                email: order.customer_email,
                phone: order.customer_phone,
                address: order.customer_address,
                city: order.customer_city,
                state: order.customer_state
            },
            salesRep: order.sales_rep_first_name ? {
                firstName: order.sales_rep_first_name,
                lastName: order.sales_rep_last_name
            } : null,
            deliveredAt: order.delivered_at,
            createdAt: order.created_at,
            updatedAt: order.updated_at
        };
    }

    formatOrderForSalesRep(order) {
        return {
            id: order.id,
            productName: order.product_name,
            productImage: order.product_image,
            quantity: order.quantity,
            totalAmount: parseFloat(order.total_amount),
            paymentMethod: order.payment_method,
            isPaid: order.is_paid,
            status: order.status,
            customer: {
                city: order.customer_city,
                state: order.customer_state
            },
            createdAt: order.created_at,
            updatedAt: order.updated_at
        };
    }
}

module.exports = new OrderService();