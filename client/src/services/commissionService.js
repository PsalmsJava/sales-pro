import api from './api';

const commissionService = {
    async getMyEarnings(filters = {}) {
        const response = await api.get('/commissions/my-earnings', { params: filters });
        return response.data.data;
    },
    async setCommission(userId, data) {
        const response = await api.post(`/commissions/set/${userId}`, data);
        return response.data.data;
    },
    async getUserEarnings(userId, filters = {}) {
        const response = await api.get(`/commissions/user/${userId}`, { params: filters });
        return response.data.data;
    },
    async processSalaries() {
        const response = await api.post('/commissions/process-salaries');
        return response.data;
    }
};

export default commissionService;