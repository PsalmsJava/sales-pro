import api from './api';

const paymentService = {
    async initializePayment(orderId, provider) {
        const response = await api.post('/payments/initialize', { orderId, provider });
        return response.data.data;
    },

    async verifyPaystackPayment(reference) {
        const response = await api.get(`/payments/verify/paystack/${reference}`);
        return response.data.data;
    },

    async verifyFlutterwavePayment(transactionId, txRef) {
        const response = await api.get('/payments/verify/flutterwave', {
            params: { transactionId, txRef }
        });
        return response.data.data;
    },

    async getPaymentConfig() {
        const response = await api.get('/payments/config');
        return response.data.data;
    },

    async togglePaymentMethod(method, enabled) {
        const response = await api.post('/payments/toggle-method', { method, enabled });
        return response.data.data;
    },

    async getTransactionHistory(filters = {}) {
        const response = await api.get('/payments/transactions', { params: filters });
        return response.data;
    }
};

export default paymentService;