const axios = require('axios');
const crypto = require('crypto');
const orderRepository = require('../repositories/order.repository');
const logger = require('../utils/logger');

class PaymentService {
    constructor() {
        this.paystackSecret = process.env.PAYSTACK_SECRET_KEY;
        this.flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_KEY;
        this.paymentConfig = {
            onlineEnabled: true, // Can be toggled by admin
            deliveryEnabled: true,
            providers: ['paystack', 'flutterwave']
        };
    }

    async initializePayment(orderId, provider, userId) {
        try {
            const order = await orderRepository.findById(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            if (order.is_paid) {
                throw new Error('Order has already been paid');
            }

            if (!this.paymentConfig.onlineEnabled) {
                throw new Error('Online payments are currently disabled');
            }

            switch (provider) {
                case 'paystack':
                    return await this.initializePaystackPayment(order, userId);
                case 'flutterwave':
                    return await this.initializeFlutterwavePayment(order, userId);
                default:
                    throw new Error('Invalid payment provider');
            }
        } catch (error) {
            logger.error('Initialize payment error', { error: error.message, orderId });
            throw error;
        }
    }

    async initializePaystackPayment(order, userId) {
        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email: order.customer_email,
                    amount: Math.round(order.total_amount * 100), // Paystack uses kobo
                    reference: this.generateReference('PS'),
                    metadata: {
                        order_id: order.id,
                        user_id: userId,
                        custom_fields: [
                            {
                                display_name: "Order ID",
                                variable_name: "order_id",
                                value: order.id
                            }
                        ]
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecret}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Save transaction reference
            await this.saveTransaction({
                order_id: order.id,
                reference: response.data.data.reference,
                provider: 'paystack',
                amount: order.total_amount,
                status: 'pending',
                metadata: response.data.data
            });

            logger.info('Paystack payment initialized', {
                orderId: order.id,
                reference: response.data.data.reference
            });

            return {
                authorizationUrl: response.data.data.authorization_url,
                reference: response.data.data.reference,
                accessCode: response.data.data.access_code
            };
        } catch (error) {
            logger.error('Paystack initialization error', {
                error: error.response?.data || error.message,
                orderId: order.id
            });
            throw new Error('Failed to initialize payment with Paystack');
        }
    }

    async initializeFlutterwavePayment(order, userId) {
        try {
            const reference = this.generateReference('FLW');

            const response = await axios.post(
                'https://api.flutterwave.com/v3/payments',
                {
                    tx_ref: reference,
                    amount: order.total_amount,
                    currency: 'NGN',
                    redirect_url: `${process.env.CLIENT_URL}/payment/callback`,
                    customer: {
                        email: order.customer_email,
                        name: `${order.customer_first_name} ${order.customer_last_name}`,
                        phonenumber: order.customer_phone
                    },
                    meta: {
                        order_id: order.id,
                        user_id: userId
                    },
                    customizations: {
                        title: 'Product Payment',
                        description: `Payment for Order #${order.id.slice(0, 8)}`,
                        logo: `${process.env.CLIENT_URL}/logo.png`
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.flutterwaveSecret}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Save transaction reference
            await this.saveTransaction({
                order_id: order.id,
                reference: reference,
                provider: 'flutterwave',
                amount: order.total_amount,
                status: 'pending',
                metadata: response.data.data
            });

            logger.info('Flutterwave payment initialized', {
                orderId: order.id,
                reference
            });

            return {
                authorizationUrl: response.data.data.link,
                reference: reference
            };
        } catch (error) {
            logger.error('Flutterwave initialization error', {
                error: error.response?.data || error.message,
                orderId: order.id
            });
            throw new Error('Failed to initialize payment with Flutterwave');
        }
    }

    async verifyPaystackPayment(reference) {
        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.paystackSecret}`
                    }
                }
            );

            const { status, data } = response.data;

            if (status && data.status === 'success') {
                await this.confirmPayment(reference, 'paystack');

                logger.info('Paystack payment verified successfully', { reference });

                return {
                    success: true,
                    message: 'Payment verified successfully',
                    data: {
                        amount: data.amount / 100,
                        reference: data.reference,
                        paidAt: data.paid_at
                    }
                };
            }

            throw new Error('Payment verification failed');
        } catch (error) {
            logger.error('Paystack verification error', {
                error: error.response?.data || error.message,
                reference
            });
            throw new Error('Failed to verify payment');
        }
    }

    async verifyFlutterwavePayment(transactionId, txRef) {
        try {
            const response = await axios.get(
                `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${this.flutterwaveSecret}`
                    }
                }
            );

            const { status, data } = response.data;

            if (status === 'success' && data.status === 'successful') {
                await this.confirmPayment(txRef, 'flutterwave');

                logger.info('Flutterwave payment verified successfully', {
                    transactionId,
                    txRef
                });

                return {
                    success: true,
                    message: 'Payment verified successfully',
                    data: {
                        amount: data.amount,
                        reference: txRef,
                        paidAt: data.created_at
                    }
                };
            }

            throw new Error('Payment verification failed');
        } catch (error) {
            logger.error('Flutterwave verification error', {
                error: error.response?.data || error.message,
                transactionId
            });
            throw new Error('Failed to verify payment');
        }
    }

    async confirmPayment(reference, provider) {
        try {
            // Update transaction status
            await this.updateTransactionStatus(reference, 'successful');

            // Get transaction details
            const transaction = await this.getTransactionByReference(reference);

            // Update order payment status
            await orderRepository.update(transaction.order_id, {
                is_paid: true,
                payment_method: 'online'
            });

            logger.info('Payment confirmed and order updated', {
                reference,
                orderId: transaction.order_id
            });
        } catch (error) {
            logger.error('Confirm payment error', { error: error.message, reference });
            throw error;
        }
    }

    async saveTransaction(data) {
        try {
            const db = require('../config/database');
            const [transaction] = await db('payment_transactions')
                .insert(data)
                .returning('*');
            return transaction;
        } catch (error) {
            logger.error('Save transaction error', { error: error.message });
            throw error;
        }
    }

    async updateTransactionStatus(reference, status) {
        try {
            const db = require('../config/database');
            await db('payment_transactions')
                .where({ reference })
                .update({
                    status,
                    updated_at: new Date()
                });
        } catch (error) {
            logger.error('Update transaction error', { error: error.message, reference });
            throw error;
        }
    }

    async getTransactionByReference(reference) {
        try {
            const db = require('../config/database');
            const transaction = await db('payment_transactions')
                .where({ reference })
                .first();

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            return transaction;
        } catch (error) {
            logger.error('Get transaction error', { error: error.message, reference });
            throw error;
        }
    }

    async togglePaymentMethod(method, enabled, adminId) {
        try {
            if (method === 'online') {
                this.paymentConfig.onlineEnabled = enabled;
            } else if (method === 'delivery') {
                this.paymentConfig.deliveryEnabled = enabled;
            }

            logger.info('Payment method toggled', {
                method,
                enabled,
                adminId
            });

            return this.paymentConfig;
        } catch (error) {
            logger.error('Toggle payment method error', { error: error.message });
            throw error;
        }
    }

    async getPaymentConfig() {
        return this.paymentConfig;
    }

    async getTransactionHistory(filters = {}) {
        try {
            const db = require('../config/database');
            let query = db('payment_transactions')
                .join('orders', 'payment_transactions.order_id', 'orders.id')
                .select(
                    'payment_transactions.*',
                    'orders.total_amount as order_amount'
                );

            if (filters.status) {
                query = query.where('payment_transactions.status', filters.status);
            }

            if (filters.provider) {
                query = query.where('payment_transactions.provider', filters.provider);
            }

            if (filters.dateFrom) {
                query = query.where('payment_transactions.created_at', '>=', filters.dateFrom);
            }

            if (filters.dateTo) {
                query = query.where('payment_transactions.created_at', '<=', filters.dateTo);
            }

            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const offset = (page - 1) * limit;

            const [data, [{ count }]] = await Promise.all([
                query.clone().orderBy('payment_transactions.created_at', 'desc').limit(limit).offset(offset),
                query.clone().count()
            ]);

            return {
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(count),
                    totalPages: Math.ceil(parseInt(count) / limit)
                }
            };
        } catch (error) {
            logger.error('Get transaction history error', { error: error.message });
            throw error;
        }
    }

    generateReference(prefix) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}

module.exports = new PaymentService();