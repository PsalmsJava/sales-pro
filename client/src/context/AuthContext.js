import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.get('/auth/me');
            setUser(response.data.data);
            setIsAuthenticated(true);
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { user: userData, tokens } = response.data.data;

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    const hasPermission = (roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            login,
            logout,
            hasPermission,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};