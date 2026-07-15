import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Package, CheckCircle, Clock, TrendingUp, DollarSign,
    Target, Star, Zap, ArrowRight, Award, BarChart3,
    ShoppingCart, AlertTriangle
} from 'lucide-react';
import orderService from '../../services/orderService';
import commissionService from '../../services/commissionService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const Overview = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['sales-rep-stats'],
        queryFn: orderService.getSalesRepStats
    });

    const { data: earnings } = useQuery({
        queryKey: ['my-earnings'],
        queryFn: commissionService.getMyEarnings
    });

    const completionRate = parseFloat(stats?.completionRate || 0);
    const totalOrders = stats?.totalOrders || 0;

    const insights = [
        {
            type: totalOrders > 0 ? 'success' : 'info',
            icon: totalOrders > 0 ? Star : Target,
            title: totalOrders > 0 ? 'Great Progress!' : 'Getting Started',
            message: totalOrders > 0 ? `You've completed ${stats?.completedOrders || 0} orders with a ${completionRate}% completion rate.` : 'Orders assigned to you will appear here.',
        },
        {
            type: completionRate >= 70 ? 'success' : completionRate > 0 ? 'warning' : 'info',
            icon: completionRate >= 70 ? Award : AlertTriangle,
            title: completionRate >= 70 ? 'Top Performer' : 'Room for Growth',
            message: completionRate >= 70 ? 'Your completion rate is excellent!' : 'Focus on confirming and processing orders quickly.',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-gold-500 via-gold-600 to-amber-600 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-900/20 rounded-full blur-3xl" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                        <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl">💪</motion.span>
                        <h2 className="text-2xl lg:text-3xl font-bold">Let's Crush It Today!</h2>
                    </div>
                    <p className="text-gold-100 max-w-lg">
                        {totalOrders > 0 ? `You have ${stats?.activeOrders || 0} active orders. Keep up the great work!` : 'Ready to start processing orders and earning commissions.'}
                    </p>
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => navigate('/sales-rep/dashboard/queue')}
                            className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition font-semibold text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" /> View Queue
                        </button>
                        <button onClick={() => navigate('/sales-rep/dashboard/earnings')}
                            className="px-5 py-2.5 bg-white text-brand-900 rounded-xl hover:bg-gold-50 transition font-semibold text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> My Earnings
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -2 }}
                        className={`rounded-2xl border p-5 ${insight.type === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200' :
                                insight.type === 'warning' ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200' :
                                    'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200'
                            }`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${insight.type === 'success' ? 'bg-emerald-100 text-emerald-600' : insight.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                <insight.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-brand-800 dark:text-white text-sm">{insight.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{insight.message}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Orders" value={totalOrders} icon={Package} color="navy" loading={statsLoading} />
                <StatCard label="Completed" value={stats?.completedOrders || 0} icon={CheckCircle} color="emerald" loading={statsLoading} subtitle={`${completionRate}% rate`} />
                <StatCard label="Active Orders" value={stats?.activeOrders || 0} icon={Clock} color="gold" loading={statsLoading} />
                <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="teal" loading={statsLoading} />
            </div>

            {/* Commission Summary */}
            <SectionCard title="My Earnings Summary" subtitle="Current commission structure">
                {earnings?.config ? (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-900/10 rounded-2xl border border-gold-200">
                            <p className="text-xs text-slate-500 mb-1">Structure</p>
                            <p className="font-bold text-brand-800 dark:text-white capitalize">{earnings.config.structure?.replace(/_/g, ' ')}</p>
                        </div>
                        {earnings.config.baseSalary > 0 && (
                            <div className="text-center p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl">
                                <p className="text-xs text-slate-500 mb-1">Base Salary</p>
                                <p className="font-bold text-brand-800 dark:text-white">${earnings.config.baseSalary}/mo</p>
                            </div>
                        )}
                        {earnings.config.commissionPercentage > 0 && (
                            <div className="text-center p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl">
                                <p className="text-xs text-slate-500 mb-1">Commission Rate</p>
                                <p className="font-bold text-brand-800 dark:text-white">{earnings.config.commissionPercentage}%</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">No commission structure configured yet.</p>
                )}
            </SectionCard>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Recent Activity">
                    <div className="space-y-3">
                        {stats?.totalOrders > 0 ? (
                            <>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-slate-100 dark:bg-brand-800 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                                        </div>
                                        <span className="text-sm font-bold">{completionRate}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Cancellation Rate</span>
                                    <span className="text-sm font-bold">{stats?.totalOrders > 0 ? (((stats?.cancelledOrders || 0) / stats.totalOrders) * 100).toFixed(1) : 0}%</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-slate-500 text-center py-4">No activity yet.</p>
                        )}
                    </div>
                </SectionCard>

                <SectionCard title="Top Products" subtitle="By commission earned">
                    {earnings?.topProducts?.length > 0 ? (
                        <div className="space-y-3">
                            {earnings.topProducts.slice(0, 5).map((product, i) => (
                                <div key={i} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-xs font-bold text-gold-700">#{i + 1}</div>
                                        <div>
                                            <p className="text-sm font-medium text-brand-800 dark:text-white">{product.productName}</p>
                                            <p className="text-xs text-slate-500">{product.orderCount} orders</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm">${product.totalEarnings?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">Complete orders to see top products.</p>
                    )}
                </SectionCard>
            </div>
        </div>
    );
};

export default Overview;