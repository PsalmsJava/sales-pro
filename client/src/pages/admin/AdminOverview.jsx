import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, DollarSign, Package, Users, Truck,
    Clock, TrendingUp, CheckCircle, AlertTriangle,
    ArrowRight, Target, Zap, Star, TrendingDown,
    Activity, BarChart3, PieChart, Eye
} from 'lucide-react';
import adminService from '../../services/adminService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const AdminOverview = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: adminService.getDashboardStats,
    });

    const stats = data?.stats || {};
    const recentOrders = data?.recentOrders || [];
    const ordersByStatus = data?.ordersByStatus || [];

    // KPI calculations for decision intelligence
    const conversionRate = parseFloat(stats.conversionRate || 0);
    const pendingOrders = stats.pendingOrders || 0;
    const todayOrders = stats.todayOrders || 0;
    const lowStockProducts = stats.lowStockProducts || 0;

    const insights = [
        {
            type: pendingOrders > 10 ? 'warning' : 'success',
            icon: pendingOrders > 10 ? AlertTriangle : CheckCircle,
            title: pendingOrders > 10 ? 'Attention Needed' : 'All Clear',
            message: pendingOrders > 10 ? `${pendingOrders} pending orders require assignment` : 'Order queue is manageable',
            action: pendingOrders > 10 ? 'Assign Orders' : null,
            actionPath: '/admin/dashboard/orders',
        },
        {
            type: lowStockProducts > 0 ? 'warning' : 'info',
            icon: lowStockProducts > 0 ? TrendingDown : TrendingUp,
            title: lowStockProducts > 0 ? 'Inventory Alert' : 'Stock Healthy',
            message: lowStockProducts > 0 ? `${lowStockProducts} products running low on stock` : 'All products well stocked',
            action: lowStockProducts > 0 ? 'View Products' : null,
            actionPath: '/admin/dashboard/products',
        },
        {
            type: todayOrders > 5 ? 'success' : 'info',
            icon: todayOrders > 5 ? Zap : Activity,
            title: todayOrders > 5 ? 'Strong Day' : 'Steady Flow',
            message: `${todayOrders} orders received today`,
        },
    ];

    const statCards = [
        { label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald', trend: 8.2 },
        { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingCart, color: 'navy', trend: 12.5 },
        { label: 'Active Products', value: stats.totalProducts || 0, icon: Package, color: 'teal', subtitle: `${lowStockProducts} low stock` },
        { label: 'Sales Reps', value: stats.totalSalesReps || 0, icon: Users, color: 'gold', trend: 5.1 },
        { label: 'Dispatch Partners', value: stats.totalDispatchPartners || 0, icon: Truck, color: 'purple' },
        { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: pendingOrders > 10 ? 'rose' : 'gold' },
        { label: "Today's Orders", value: todayOrders, icon: Target, color: 'blue' },
        { label: 'Conversion Rate', value: `${conversionRate}%`, icon: PieChart, color: 'navy', trend: 2.3 },
    ];

    return (
        <div className="space-y-6">
            {/* Hero Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                    className="text-3xl">👋</motion.div>
                                <h2 className="text-2xl lg:text-3xl font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</h2>
                            </div>
                            <p className="text-brand-200 max-w-lg">
                                {pendingOrders > 10
                                    ? `You have ${pendingOrders} orders waiting. Let's get them assigned and moving!`
                                    : `Your business is running smoothly. ${todayOrders} orders processed today.`}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => navigate('/admin/dashboard/orders')}
                                className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition font-semibold text-sm flex items-center gap-2">
                                <Eye className="w-4 h-4" /> View Orders
                            </button>
                            <button onClick={() => navigate('/admin/dashboard/products')}
                                className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-brand-900 rounded-xl hover:from-gold-400 hover:to-gold-500 transition font-semibold text-sm shadow-lg shadow-gold-500/25 flex items-center gap-2">
                                <Package className="w-4 h-4" /> Products
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Intelligent Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -2 }}
                        className={`relative overflow-hidden rounded-2xl border p-5 ${insight.type === 'warning' ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                                insight.type === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
                                    'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                            }`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${insight.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                    insight.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                }`}>
                                <insight.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-brand-800 dark:text-white text-sm">{insight.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{insight.message}</p>
                                {insight.action && (
                                    <button onClick={() => navigate(insight.actionPath)}
                                        className="mt-2 text-xs font-medium text-brand-600 dark:text-gold-400 hover:underline flex items-center gap-1">
                                        {insight.action} <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <StatCard key={card.label} {...card} loading={isLoading} />
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <SectionCard title="Recent Orders" subtitle="Latest transactions" className="lg:col-span-2"
                    actions={<button onClick={() => navigate('/admin/dashboard/orders')} className="text-sm text-brand-600 dark:text-gold-400 font-medium flex items-center gap-1 hover:underline">View All <ArrowRight className="w-4 h-4" /></button>}>
                    {isLoading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="animate-pulse flex items-center gap-4 py-3"><div className="h-10 w-10 bg-slate-200 dark:bg-brand-700 rounded-xl" /><div className="flex-1 space-y-2"><div className="h-4 w-40 bg-slate-200 dark:bg-brand-700 rounded" /><div className="h-3 w-24 bg-slate-200 dark:bg-brand-700 rounded" /></div><div className="h-6 w-16 bg-slate-200 dark:bg-brand-700 rounded-full" /></div>)}</div>
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-12"><ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No orders yet</p></div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-brand-700">
                            {recentOrders.slice(0, 6).map(order => (
                                <motion.div key={order.id} whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                    onClick={() => navigate('/admin/dashboard/orders')}
                                    className="flex items-center justify-between py-3 px-2 -mx-2 rounded-xl transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-brand-800 dark:text-white">{order.productName}</p>
                                            <p className="text-xs text-slate-500">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-brand-800 dark:text-white">${order.totalAmount?.toFixed(2)}</span>
                                        <StatusBadge status={order.status} size="sm" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Order Status Distribution */}
                <SectionCard title="Order Status">
                    {isLoading ? (
                        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="animate-pulse flex items-center gap-3"><div className="h-3 w-3 bg-slate-200 dark:bg-brand-700 rounded-full" /><div className="flex-1 h-4 bg-slate-200 dark:bg-brand-700 rounded" /><div className="h-4 w-8 bg-slate-200 dark:bg-brand-700 rounded" /></div>)}</div>
                    ) : ordersByStatus.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No data available</p>
                    ) : (
                        <div className="space-y-2">
                            {ordersByStatus.map((item) => (
                                <div key={item.status} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-brand-800/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={item.status} size="sm" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-slate-100 dark:bg-brand-800 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / Math.max(...ordersByStatus.map(o => o.count))) * 100}%` }}
                                                className={`h-full rounded-full ${item.status === 'delivered' ? 'bg-emerald-500' :
                                                        item.status === 'cancelled' ? 'bg-rose-500' :
                                                            item.status === 'pending' ? 'bg-amber-500' : 'bg-brand-500'
                                                    }`} />
                                        </div>
                                        <span className="text-sm font-bold text-brand-800 dark:text-white w-8 text-right">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
};

export default AdminOverview;