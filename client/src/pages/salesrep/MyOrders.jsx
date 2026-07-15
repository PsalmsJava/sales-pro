import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import orderService from '../../services/orderService';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const MyOrders = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['my-orders-all'],
        queryFn: () => orderService.getAllOrders()
    });

    const orders = data?.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-800 dark:text-white">My Orders</h1>
                <p className="text-slate-500 mt-1">View all your assigned orders</p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-brand-900 rounded-2xl p-5"><div className="h-4 w-48 bg-slate-200 dark:bg-brand-700 rounded" /></div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <EmptyState icon={Package} title="No orders yet" description="Orders assigned to you will appear here." />
            ) : (
                <div className="space-y-3">
                    {orders.map((order, idx) => (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                            className="bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-brand-800 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-brand-800 dark:text-white">{order.productName}</p>
                                    <p className="text-sm text-slate-500">Qty: {order.quantity} • {order.customer?.city}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-brand-800 dark:text-white">${order.totalAmount?.toFixed(2)}</span>
                                <StatusBadge status={order.status} size="sm" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;