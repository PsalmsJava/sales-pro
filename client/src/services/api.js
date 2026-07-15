import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        const message = error.response?.data?.message || 'An unexpected error occurred';
        toast.error(message);

        return Promise.reject(error);
    }
);

export default api;