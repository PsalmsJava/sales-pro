import api from './api';

const adminService = {
    async getDashboardStats() {
        const response = await api.get('/admin/dashboard');
        return response.data.data;
    },
    async getSalesRepPerformance() {
        const response = await api.get('/admin/sales-reps/performance');
        return response.data.data;
    }
};

export default adminService;
