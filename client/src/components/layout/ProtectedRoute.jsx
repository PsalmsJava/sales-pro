import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../feedback/PageLoader';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show full page loader while checking auth
    if (loading) {
        return <PageLoader />;
    }

    // Not logged in - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role permissions
    if (roles.length > 0 && !roles.includes(user?.role)) {
        // Redirect to appropriate dashboard based on role
        const roleRoutes = {
            admin: '/admin/dashboard',
            sales_rep: '/sales-rep/dashboard',
            dispatch_partner: '/dispatch/dashboard',
        };
        const redirectPath = roleRoutes[user?.role] || '/login';
        return <Navigate to={redirectPath} replace />;
    }

    // Authorized - render children
    return children;
};

export default ProtectedRoute;