import api from './api';

const productService = {
    async getAllProducts(filters = {}) {
        const response = await api.get('/products', { params: filters });
        return response.data;
    },

    async getProduct(id) {
        const response = await api.get(`/products/${id}`);
        return response.data.data;
    },

    async createProduct(productData) {
        const response = await api.post('/products', productData);
        return response.data.data;
    },

    async updateProduct(id, productData) {
        const response = await api.put(`/products/${id}`, productData);
        return response.data.data;
    },

    async deleteProduct(id) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    async updateStock(id, quantity, operation) {
        const response = await api.patch(`/products/${id}/stock`, { quantity, operation });
        return response.data.data;
    },

    async getProductsForAds(platform = null) {
        const response = await api.get('/products/ads', { params: { platform } });
        return response.data.data;
    }
};

export default productService;