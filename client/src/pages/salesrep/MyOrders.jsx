import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Calendar, Phone, Clock, Filter } from 'lucide-react';
import orderService from '../../services/orderService';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const filters = [
    { key: 'all', label: 'All Orders' },
    { key: 'callbacks', label: 'Callbacks', icon: Phone },
    { key: 'rescheduled', label: 'Rescheduled', icon: Calendar },
];

const MyOrders = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['my-orders-all'],
        queryFn: () => orderService.getAllOrders()
    });

    const allOrders = data?.data || [];

    const orders = useMemo(() => {
        if (activeFilter === 'callbacks') {
            return allOrders.filter(o => o.callbackAt);
        }
        if (activeFilter === 'rescheduled') {
            return allOrders.filter(o => o.scheduledAt);
        }
        return allOrders;
    }, [allOrders, activeFilter]);

    const callbackCount = allOrders.filter(o => o.callbackAt).length;
    const rescheduledCount = allOrders.filter(o => o.scheduledAt).length;

    const formatDateTime = (value) => {
        if (!value) return '';
        const d = new Date(value);
        return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isCallbackDue = (callbackAt) => {
        if (!callbackAt) return false;
        return new Date(callbackAt).getTime() <= Date.now();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-800 dark:text-white">My Orders</h1>
                <p className="text-slate-500 mt-1">View all your assigned orders</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {filters.map(f => {
                    const count = f.key === 'callbacks' ? callbackCount
                        : f.key === 'rescheduled' ? rescheduledCount
                            : allOrders.length;
                    const Icon = f.icon;
                    return (
                        <button key={f.key} onClick={() => setActiveFilter(f.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeFilter === f.key
                                ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/25'
                                : 'bg-white dark:bg-brand-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-brand-700 hover:bg-slate-50 dark:hover:bg-brand-800'
                                }`}>
                            {Icon && <Icon className="w-4 h-4" />}
                            {f.label}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === f.key
                                ? 'bg-white/25 text-white'
                                : 'bg-slate-100 dark:bg-brand-800 text-slate-600 dark:text-slate-400'
                                }`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-brand-900 rounded-2xl p-5">
                            <div className="h-4 w-48 bg-slate-200 dark:bg-brand-700 rounded" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <EmptyState
                    icon={activeFilter === 'callbacks' ? Phone : activeFilter === 'rescheduled' ? Calendar : Package}
                    title={
                        activeFilter === 'callbacks' ? 'No callbacks scheduled'
                            : activeFilter === 'rescheduled' ? 'No rescheduled orders'
                                : 'No orders yet'
                    }
                    description={
                        activeFilter === 'callbacks' ? 'Orders with a scheduled callback will appear here.'
                            : activeFilter === 'rescheduled' ? 'Orders you reschedule will appear here.'
                                : 'Orders assigned to you will appear here.'
                    }
                />
            ) : (
                <div className="space-y-3">
                    {orders.map((order, idx) => {
                        const hasCallback = !!order.callbackAt;
                        const hasReschedule = !!order.scheduledAt;
                        const callbackDue = isCallbackDue(order.callbackAt);

                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-brand-800 flex items-center justify-center flex-shrink-0">
                                            <Package className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-brand-800 dark:text-white truncate">{order.productName}</p>
                                            <p className="text-sm text-slate-500">Qty: {order.quantity} • {order.customer?.city}</p>

                                            {/* Alert chips for callback / reschedule */}
                                            {(hasCallback || hasReschedule) && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {hasCallback && (
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${callbackDue
                                                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 animate-pulse'
                                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                                                            }`}>
                                                            <Phone className="w-3 h-3" />
                                                            <span>
                                                                {callbackDue ? 'Callback due' : 'Callback'}: {formatDateTime(order.callbackAt)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {hasReschedule && (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-gold-50 dark:bg-gold-900/20 border-gold-200 dark:border-gold-800 text-gold-700 dark:text-gold-400">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Rescheduled: {formatDateTime(order.scheduledAt)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Callback comment preview */}
                                            {hasCallback && order.callbackComment && (
                                                <p className="text-xs text-slate-500 mt-1.5 italic line-clamp-1">
                                                    "{order.callbackComment}"
                                                </p>
                                            )}

                                            {/* Reschedule reason preview */}
                                            {hasReschedule && order.rescheduleReason && (
                                                <p className="text-xs text-slate-500 mt-1.5 italic line-clamp-1">
                                                    Reason: {order.rescheduleReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className="font-bold text-brand-800 dark:text-white">${order.totalAmount?.toFixed(2)}</span>
                                        <StatusBadge status={order.status} size="sm" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;