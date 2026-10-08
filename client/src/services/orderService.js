import api from './api';

const orderService = {
    async getAllOrders(filters = {}) {
        const response = await api.get('/orders', { params: filters });
        return response.data;
    },
    async getOrder(id) {
        const response = await api.get(`/orders/${id}`);
        return response.data.data;
    },
    async updateOrderStatus(id, status) {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data.data;
    },
    async assignOrders() {
        const response = await api.post('/orders/assign');
        return response.data;
    },
    async rescheduleOrder(id, data) {
        const response = await api.put(`/orders/${id}/reschedule`, data);
        return response.data;
    },
    async scheduleCallback(id, data) {
        const response = await api.post(`/orders/${id}/callback`, data);
        return response.data;
    },
    async logIssue(id, type) {
        const response = await api.post(`/orders/${id}/log-issue`, { type });
        return response.data;
    },

    async getSalesRepStats() {
        const response = await api.get('/orders/stats');
        return response.data.data;
    }
};

export default orderService;
