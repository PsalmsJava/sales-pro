import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Search, Filter, Download, Eye, Truck,
    CheckCircle, XCircle, Clock, Users, MoreHorizontal,
    MapPin, Phone, Mail, Package, ChevronDown, Calendar,
    SlidersHorizontal, RefreshCw, ArrowUpDown, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const statusTabs = [
    { key: '', label: 'All Orders', color: 'slate', icon: ShoppingCart },
    { key: 'pending', label: 'Pending', color: 'amber', icon: Clock },
    { key: 'assigned', label: 'Assigned', color: 'blue', icon: Users },
    { key: 'confirmed', label: 'Confirmed', color: 'indigo', icon: CheckCircle },
    { key: 'processing', label: 'Processing', color: 'cyan', icon: RefreshCw },
    { key: 'dispatched', label: 'Dispatched', color: 'orange', icon: Truck },
    { key: 'delivered', label: 'Delivered', color: 'emerald', icon: CheckCircle },
    { key: 'completed', label: 'Completed', color: 'teal', icon: CheckCircle },
    { key: 'cancelled', label: 'Cancelled', color: 'rose', icon: XCircle },
];

const OrderManagement = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [viewingOrder, setViewingOrder] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const queryClient = useQueryClient();

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['orders', { search, page, status: statusFilter, dateRange, paymentFilter }],
        queryFn: () => orderService.getAllOrders({ search, page, limit: 15, status: statusFilter })
    });

    const assignMutation = useMutation({
        mutationFn: () => orderService.assignOrders(),
        onSuccess: (data) => {
            toast.success(`${data.data?.length || 0} orders auto-assigned`);
            queryClient.invalidateQueries(['orders']);
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ orderId, status }) => orderService.updateOrderStatus(orderId, status),
        onSuccess: () => {
            toast.success('Order status updated');
            queryClient.invalidateQueries(['orders']);
            setViewingOrder(null);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update')
    });

    const orders = ordersData?.data || [];
    const pagination = ordersData?.pagination;

    const stats = useMemo(() => ({
        total: pagination?.total || 0,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => ['assigned', 'confirmed', 'processing'].includes(o.status)).length,
        completed: orders.filter(o => ['delivered', 'completed'].includes(o.status)).length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        revenue: orders.filter(o => ['delivered', 'completed'].includes(o.status)).reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    }), [orders]);

    const getStatusColor = (status) => {
        const tab = statusTabs.find(t => t.key === status);
        return tab?.color || 'slate';
    };

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <ShoppingCart className="w-8 h-8 text-gold-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold">Order Management</h1>
                            <p className="text-brand-200 text-sm mt-1">Track, manage, and fulfill customer orders</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition font-medium text-sm flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button onClick={() => assignMutation.mutate()} disabled={assignMutation.isLoading}
                            className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-brand-900 rounded-xl hover:from-gold-400 hover:to-gold-500 transition font-semibold text-sm shadow-lg shadow-gold-500/25 flex items-center gap-2">
                            <Users className="w-4 h-4" /> {assignMutation.isLoading ? 'Assigning...' : 'Auto-Assign'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Orders" value={stats.total} icon={ShoppingCart} color="navy" loading={isLoading} />
                <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" loading={isLoading} />
                <StatCard label="In Progress" value={stats.processing} icon={RefreshCw} color="blue" loading={isLoading} />
                <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="emerald" loading={isLoading} />
                <StatCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} color="gold" loading={isLoading} />
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card p-3 space-y-3">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search orders by ID, product, or customer..." value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-brand-800 border border-slate-200 dark:border-brand-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${showFilters ? 'bg-brand-100 text-brand-700 dark:bg-brand-800' : 'border border-slate-200 dark:border-brand-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                }`}>
                            <SlidersHorizontal className="w-4 h-4" /> Filters
                        </button>
                    </div>
                </div>

                {/* Extended Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-slate-200 dark:border-brand-700 flex flex-wrap gap-3">
                            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2.5 border border-slate-200 dark:border-brand-700 rounded-xl text-sm bg-white dark:bg-brand-900">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
                                className="px-4 py-2.5 border border-slate-200 dark:border-brand-700 rounded-xl text-sm bg-white dark:bg-brand-900">
                                <option value="all">All Payments</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {statusTabs.map((tab) => (
                    <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${statusFilter === tab.key
                                ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/25`
                                : 'bg-white dark:bg-brand-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-brand-700 hover:bg-slate-50'
                            }`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <SectionCard subtitle={`${pagination?.total || 0} orders found`}>
                {isLoading ? (
                    <div className="space-y-3">{[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 py-4">
                            <div className="h-12 w-12 bg-slate-200 dark:bg-brand-700 rounded-xl" />
                            <div className="flex-1 space-y-2"><div className="h-4 w-40 bg-slate-200 dark:bg-brand-700 rounded" /><div className="h-3 w-24 bg-slate-200 dark:bg-brand-700 rounded" /></div>
                            <div className="h-6 w-20 bg-slate-200 dark:bg-brand-700 rounded-full" />
                            <div className="h-4 w-16 bg-slate-200 dark:bg-brand-700 rounded" />
                        </div>
                    ))}</div>
                ) : orders.length === 0 ? (
                    <EmptyState icon={ShoppingCart} title="No orders found"
                        description={statusFilter ? `No ${statusFilter} orders. Try a different filter.` : 'Orders will appear here.'}
                        searchTerm={search || statusFilter} hasFilters={!!statusFilter}
                        onClear={() => { setStatusFilter(''); setSearch(''); }} />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-brand-700">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-brand-800/30">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Order</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Payment</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-brand-700">
                                    {orders.map((order, idx) => (
                                        <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-brand-50/30 dark:hover:bg-brand-800/20 transition-colors group cursor-pointer"
                                            onClick={() => setViewingOrder(order)}>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-mono text-brand-600 dark:text-gold-400 font-medium">#{order.id?.slice(0, 8)}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-brand-800 flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-brand-800 dark:text-white">{order.productName}</p>
                                                        <p className="text-xs text-slate-500">Qty: {order.quantity}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium text-brand-800 dark:text-white">{order.customer?.firstName} {order.customer?.lastName}</p>
                                                <p className="text-xs text-slate-500">{order.customer?.city}, {order.customer?.state}</p>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-right">${order.totalAmount?.toFixed(2)}</td>
                                            <td className="px-4 py-4 text-center"><StatusBadge status={order.status} size="sm" /></td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-500 text-center">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); setViewingOrder(order); }}
                                                    className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-800 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={setPage} />
                    </>
                )}
            </SectionCard>

            {/* Order Detail Slideover */}
            <AnimatePresence>
                {viewingOrder && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setViewingOrder(null)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}
                            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-brand-900 shadow-2xl z-50 overflow-y-auto">
                            <div className="sticky top-0 bg-white dark:bg-brand-900 z-10 border-b border-slate-200 dark:border-brand-700 p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-brand-800 dark:text-white">Order #{viewingOrder.id?.slice(0, 8)}</h2>
                                    <StatusBadge status={viewingOrder.status} />
                                </div>
                                <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-xl">
                                    <XCircle className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Product Info */}
                                <div className="bg-slate-50 dark:bg-brand-800/50 rounded-2xl p-5">
                                    <h3 className="text-sm font-semibold text-brand-800 dark:text-white mb-3 flex items-center gap-2">
                                        <Package className="w-4 h-4" /> Product Details
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-white dark:bg-brand-700 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-brand-800 dark:text-white">{viewingOrder.productName}</p>
                                            <p className="text-sm text-slate-500">Qty: {viewingOrder.quantity}</p>
                                            <p className="text-xl font-bold text-brand-800 dark:text-white mt-1">${viewingOrder.totalAmount?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                {viewingOrder.customer && (
                                    <div className="bg-slate-50 dark:bg-brand-800/50 rounded-2xl p-5">
                                        <h3 className="text-sm font-semibold text-brand-800 dark:text-white mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Customer
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="font-medium text-brand-800 dark:text-white">{viewingOrder.customer.firstName} {viewingOrder.customer.lastName}</p>
                                            <div className="flex items-center gap-2 text-sm text-slate-500"><Mail className="w-4 h-4" />{viewingOrder.customer.email}</div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500"><Phone className="w-4 h-4" />{viewingOrder.customer.phone}</div>
                                            <div className="flex items-start gap-2 text-sm text-slate-500"><MapPin className="w-4 h-4 mt-0.5" />{viewingOrder.customer.address}, {viewingOrder.customer.city}, {viewingOrder.customer.state}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-brand-800/50 rounded-2xl p-4">
                                        <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                                        <p className="font-semibold text-brand-800 dark:text-white capitalize">{viewingOrder.paymentMethod}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-brand-800/50 rounded-2xl p-4">
                                        <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${viewingOrder.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {viewingOrder.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-brand-800 dark:text-white">Update Status</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {statusTabs.filter(t => t.key && !['', 'cancelled', 'completed', 'delivered'].includes(t.key) && t.key !== viewingOrder.status).slice(0, 6).map(tab => (
                                            <button key={tab.key}
                                                onClick={() => statusMutation.mutate({ orderId: viewingOrder.id, status: tab.key })}
                                                className={`px-4 py-2.5 bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200 rounded-xl text-sm font-medium hover:bg-${tab.color}-100 transition-colors`}>
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    {viewingOrder.status !== 'cancelled' && (
                                        <button onClick={() => statusMutation.mutate({ orderId: viewingOrder.id, status: 'cancelled' })}
                                            className="w-full px-4 py-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors">
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderManagement;