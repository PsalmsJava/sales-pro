import api from './api';

const dispatchService = {
    async register(data) {
        const response = await api.post('/dispatch/register', data);
        return response.data;
    },
    async getDashboard() {
        const response = await api.get('/dispatch/dashboard');
        return response.data.data;
    },
    async updateDeliveryStatus(assignmentId, data) {
        const response = await api.patch(`/dispatch/delivery/${assignmentId}/status`, data);
        return response.data.data;
    },
    async getPartners(filters = {}) {
        const response = await api.get('/dispatch/partners', { params: filters });
        return response.data.data;
    },
    async verifyPartner(partnerId) {
        const response = await api.post(`/dispatch/partners/${partnerId}/verify`);
        return response.data.data;
    },
    async assignDelivery(data) {
        const response = await api.post('/dispatch/assign', data);
        return response.data.data;
    }
};

export default dispatchService;