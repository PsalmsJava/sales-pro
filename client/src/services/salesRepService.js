import api from './api';

const salesRepService = {
    async createSalesRep(data) {
        const response = await api.post('/sales-reps', data);
        return response.data;
    },
    async getAllSalesReps(filters = {}) {
        const response = await api.get('/sales-reps', { params: filters });
        return response.data.data;
    },
    async getSalesRepDetails(id) {
        const response = await api.get(`/sales-reps/${id}`);
        return response.data.data;
    },
    async updateSalesRep(id, data) {
        const response = await api.put(`/sales-reps/${id}`, data);
        return response.data.data;
    },
    async toggleActive(id, action) {
        const response = await api.patch(`/sales-reps/${id}/toggle-active`, { action });
        return response.data;
    },
    async resetPassword(id) {
        const response = await api.post(`/sales-reps/${id}/reset-password`);
        return response.data;
    }
};

export default salesRepService;