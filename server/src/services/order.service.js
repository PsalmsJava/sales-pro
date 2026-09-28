const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

class OrderService {
    async createOrder(orderData) {
        try {
            const product = await productRepository.findById(orderData.productId);

            if (product.quantity < orderData.quantity) {
                throw new Error(`Only ${product.quantity} units available in stock`);
            }

            const totalAmount = product.price * orderData.quantity;

            const result = await orderRepository.create({
                ...orderData,
                totalAmount
            });

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

            if (userRole === 'sales_rep' && order.sales_rep_id !== userId) {
                throw new Error('You can only view your assigned orders');
            }

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

            this.validateStatusTransition(order.status, status, userRole);

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

    // ==========================================
    // RESCHEDULE
    // ==========================================
    async rescheduleOrder(id, { scheduledAt, reason }, userId, userRole) {
        try {
            const order = await orderRepository.findById(id);

            if (!order) {
                throw new Error('Order not found');
            }

            // Sales reps can only reschedule their own orders
            if (userRole === 'sales_rep' && order.sales_rep_id !== userId) {
                throw new Error('You can only reschedule your assigned orders');
            }

            // Only non-terminal orders can be rescheduled
            const terminalStatuses = ['delivered', 'completed', 'cancelled'];
            if (terminalStatuses.includes(order.status)) {
                throw new Error(`Cannot reschedule an order with status "${order.status}"`);
            }

            // Validate scheduledAt
            if (!scheduledAt) {
                throw new Error('A new scheduled date is required');
            }

            const parsed = new Date(scheduledAt);
            if (isNaN(parsed.getTime())) {
                throw new Error('Invalid scheduled date');
            }

            if (parsed.getTime() <= Date.now()) {
                throw new Error('Scheduled date must be in the future');
            }

            const updated = await orderRepository.reschedule(id, {
                scheduledAt: parsed,
                reason: reason || null,
                userId
            });

            logger.info('Order rescheduled', {
                orderId: id,
                scheduledAt: parsed.toISOString(),
                reason,
                updatedBy: userId
            });

            return userRole === 'sales_rep'
                ? this.formatOrderForSalesRep(updated)
                : this.formatOrder(updated);
        } catch (error) {
            logger.error('Reschedule order service error', { error: error.message, orderId: id });
            throw error;
        }
    }

    // ==========================================
    // CALLBACK
    // ==========================================
    async scheduleCallback(id, { callbackAt, comment }, userId, userRole) {
        try {
            const order = await orderRepository.findById(id);

            if (!order) {
                throw new Error('Order not found');
            }

            if (userRole === 'sales_rep' && order.sales_rep_id !== userId) {
                throw new Error('You can only schedule callbacks for your assigned orders');
            }

            const terminalStatuses = ['delivered', 'completed', 'cancelled'];
            if (terminalStatuses.includes(order.status)) {
                throw new Error(`Cannot schedule a callback for an order with status "${order.status}"`);
            }

            if (!callbackAt) {
                throw new Error('A callback date and time is required');
            }

            const parsed = new Date(callbackAt);
            if (isNaN(parsed.getTime())) {
                throw new Error('Invalid callback date');
            }

            if (parsed.getTime() <= Date.now()) {
                throw new Error('Callback date must be in the future');
            }

            if (!comment || !comment.trim()) {
                throw new Error('A callback comment is required');
            }

            if (comment.length > 1000) {
                throw new Error('Callback comment must be 1000 characters or fewer');
            }

            const updated = await orderRepository.scheduleCallback(id, {
                callbackAt: parsed,
                comment: comment.trim(),
                userId
            });

            logger.info('Callback scheduled', {
                orderId: id,
                callbackAt: parsed.toISOString(),
                updatedBy: userId
            });

            return userRole === 'sales_rep'
                ? this.formatOrderForSalesRep(updated)
                : this.formatOrder(updated);
        } catch (error) {
            logger.error('Schedule callback service error', { error: error.message, orderId: id });
            throw error;
        }
    }

    async assignOrdersToSalesReps() {
        try {
            const unassignedOrders = await orderRepository.getUnassignedOrders();

            if (unassignedOrders.length === 0) return [];

            const salesReps = await userRepository.findAll({
                role: 'sales_rep',
                isActive: true
            });

            if (salesReps.length === 0) {
                logger.warn('No active sales reps available for assignment');
                return [];
            }

            const repOrderCounts = await Promise.all(
                salesReps.map(async (rep) => ({
                    repId: rep.id,
                    activeOrders: await orderRepository.getSalesRepOrderCount(rep.id, 'assigned')
                }))
            );

            const assignments = [];

            for (const order of unassignedOrders) {
                const sortedReps = repOrderCounts.sort((a, b) => a.activeOrders - b.activeOrders);
                const selectedRep = sortedReps[0];

                await orderRepository.assignSalesRep(order.id, selectedRep.repId);
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

    async getCallbacks(userId, userRole) {
        try {
            const salesRepId = userRole === 'sales_rep' ? userId : null;
            const rows = await orderRepository.getDueCallbacks(salesRepId);

            return rows.map((row) => ({
                id: row.id,
                productName: row.product_name,
                status: row.status,
                callbackAt: row.callback_at,
                callbackComment: row.callback_comment,
                customer: {
                    firstName: row.customer_first_name,
                    lastName: row.customer_last_name,
                    phone: row.customer_phone
                }
            }));
        } catch (error) {
            logger.error('Get callbacks error', { error: error.message, userId });
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

        if (roleTransitions[userRole] && !roleTransitions[userRole].includes(newStatus)) {
            throw new Error('You do not have permission to change order to this status');
        }

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
            // NEW
            scheduledAt: order.scheduled_at,
            rescheduleReason: order.reschedule_reason,
            callbackAt: order.callback_at,
            callbackComment: order.callback_comment,
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
            // NEW
            scheduledAt: order.scheduled_at,
            rescheduleReason: order.reschedule_reason,
            callbackAt: order.callback_at,
            callbackComment: order.callback_comment,
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