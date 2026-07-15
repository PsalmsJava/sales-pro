import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PageLoader from './components/feedback/PageLoader';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import SalesRepLayout from './components/layout/SalesRepLayout';
import DispatchLayout from './components/layout/DispatchLayout';

// Lazy loaded pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const OrderManagement = lazy(() => import('./pages/admin/OrderManagement'));
const AdSetup = lazy(() => import('./pages/admin/AdSetup'));
const SalesRepManagement = lazy(() => import('./pages/admin/SalesRepManagement'));
const DispatchPartnerManagement = lazy(() => import('./pages/admin/DispatchPartnerManagement'));
const PaymentSettings = lazy(() => import('./pages/admin/PaymentSettings'));
const CommissionSettings = lazy(() => import('./pages/admin/CommissionSettings'));
const SalesRepOverview = lazy(() => import('./pages/salesrep/Overview'));
const OrdersQueue = lazy(() => import('./pages/salesrep/OrdersQueue'));
const MyOrders = lazy(() => import('./pages/salesrep/MyOrders'));
const Earnings = lazy(() => import('./pages/salesrep/Earnings'));
const DispatchOverview = lazy(() => import('./pages/dispatch/DispatchOverview'));
const AssignedDeliveries = lazy(() => import('./pages/dispatch/AssignedDeliveries'));
const DeliveryHistory = lazy(() => import('./pages/dispatch/DeliveryHistory'));
const DispatchEarnings = lazy(() => import('./pages/dispatch/DispatchEarnings'));
const DispatchDetails = lazy(() => import('./pages/dispatch/DispatchDetails'));
const CustomerOrderPage = lazy(() => import('./pages/customer/OrderPage'));
const DispatchRegisterPage = lazy(() => import('./pages/dispatch/RegisterPage'));
const ProductDetail = lazy(() => import('./pages/admin/ProductDetail'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

// Quick placeholder components
const AnalyticsPlaceholder = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-100 to-gold-100 dark:from-brand-800 dark:to-gold-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-brand-800 dark:text-white mb-2">Advanced Analytics</h3>
            <p className="text-slate-500 max-w-md mx-auto">Coming soon with predictive insights and trend analysis.</p>
        </div>
    </div>
);

const SettingsPlaceholder = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-800 dark:to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">⚙️</span>
            </div>
            <h3 className="text-2xl font-bold text-brand-800 dark:text-white mb-2">System Settings</h3>
            <p className="text-slate-500 max-w-md mx-auto">Application configuration coming soon.</p>
        </div>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        <Router>
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    {/* Public Routes - No authentication required */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/order/:productId" element={<CustomerOrderPage />} />
                                    <Route path="/dispatch/register" element={<DispatchRegisterPage />} />
                                    <Route path="/" element={<Navigate to="/login" replace />} />

                                    {/* Admin Routes - Requires authentication + admin role */}
                                    <Route path="/admin/dashboard" element={
                                        <ProtectedRoute roles={['admin']}>
                                            <AdminLayout />
                                        </ProtectedRoute>
                                    }>
                                        <Route index element={<AdminOverview />} />
                                        <Route path="analytics" element={<AnalyticsPlaceholder />} />
                                        <Route path="products" element={<ProductManagement />} />
                                        <Route path="orders" element={<OrderManagement />} />
                                        <Route path="ads" element={<AdSetup />} />
                                        <Route path="sales-reps" element={<SalesRepManagement />} />
                                        <Route path="dispatch" element={<DispatchPartnerManagement />} />
                                        <Route path="commissions" element={<CommissionSettings />} />
                                        <Route path="payments" element={<PaymentSettings />} />
                                        <Route path="products/:id" element={<ProductDetail />} />
                                        <Route path="settings" element={<SettingsPlaceholder />} />
                                    </Route>

                                    {/* Sales Rep Routes - Requires authentication + sales_rep role */}
                                    <Route path="/sales-rep/dashboard" element={
                                        <ProtectedRoute roles={['sales_rep', 'admin']}>
                                            <SalesRepLayout />
                                        </ProtectedRoute>
                                    }>
                                        <Route index element={<SalesRepOverview />} />
                                        <Route path="queue" element={<OrdersQueue />} />
                                        <Route path="my-orders" element={<MyOrders />} />
                                        <Route path="earnings" element={<Earnings />} />
                                    </Route>

                                    {/* Dispatch Routes - Requires authentication + dispatch_partner role */}
                                    <Route path="/dispatch/dashboard" element={
                                        <ProtectedRoute roles={['dispatch_partner', 'admin']}>
                                            <DispatchLayout />
                                        </ProtectedRoute>
                                    }>
                                        <Route index element={<DispatchOverview />} />
                                        <Route path="deliveries" element={<AssignedDeliveries />} />
                                        <Route path="deliveries/:id" element={<DispatchDetails />} />
                                        <Route path="history" element={<DeliveryHistory />} />
                                        <Route path="earnings" element={<DispatchEarnings />} />
                                    </Route>

                                    {/* Catch-all redirect */}
                                    <Route path="*" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </Suspense>
                        </Router>
                        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', padding: '12px 16px' } }} />
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;