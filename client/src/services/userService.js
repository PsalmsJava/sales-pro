import api from './api';

const userService = {
    async getAllUsers() {
        const response = await api.get('/auth/users');
        return response.data.data;
    },

    async createUser(userData) {
        const response = await api.post('/auth/users', userData);
        return response.data.data;
    },

    async updateUser(id, userData) {
        const response = await api.patch(`/auth/users/${id}`, userData);
        return response.data.data;
    }
};

export default userService;
