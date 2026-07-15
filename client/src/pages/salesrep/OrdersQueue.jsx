import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

const tabs = [
    { key: '', label: 'All', icon: Package },
    { key: 'assigned', label: 'New', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Clock },
];

const OrdersQueue = () => {
    const [activeTab, setActiveTab] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['sales-rep-orders', activeTab],
        queryFn: () => orderService.getAllOrders({ status: activeTab || undefined })
    });

    const statusMutation = useMutation({
        mutationFn: ({ orderId, status }) => orderService.updateOrderStatus(orderId, status),
        onSuccess: () => {
            toast.success('Order updated');
            queryClient.invalidateQueries(['sales-rep-orders']);
            setConfirmAction(null);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed')
    });

    const getNextAction = (status) => {
        switch (status) {
            case 'assigned': return { action: 'confirmed', label: 'Confirm Order', color: 'from-brand-700 to-brand-900' };
            case 'confirmed': return { action: 'processing', label: 'Start Processing', color: 'from-gold-500 to-gold-600' };
            default: return null;
        }
    };

    const orders = data?.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Orders Queue</h1>
                <p className="text-slate-500 mt-1">Manage and process your assigned orders</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/25' : 'bg-white dark:bg-brand-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-brand-700'
                            }`}>
                        <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-brand-900 rounded-2xl p-5">
                            <div className="flex gap-4"><div className="h-16 w-16 bg-slate-200 dark:bg-brand-700 rounded-xl" /><div className="flex-1 space-y-2"><div className="h-4 w-40 bg-slate-200 dark:bg-brand-700 rounded" /><div className="h-3 w-24 bg-slate-200 dark:bg-brand-700 rounded" /></div></div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <EmptyState icon={Package} title="No orders in queue" description={activeTab ? `No ${activeTab} orders found.` : 'No orders assigned yet.'} />
            ) : (
                <div className="space-y-4">
                    {orders.map((order, idx) => (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-brand-800 flex items-center justify-center overflow-hidden">
                                        {order.productImage ? <img src={order.productImage} alt={order.productName} className="h-full w-full object-cover" /> : <Package className="w-6 h-6 text-slate-400" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-brand-800 dark:text-white">{order.productName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={order.status} size="sm" />
                                            <span className="text-sm text-slate-500">Qty: {order.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                                            <MapPin className="h-3.5 w-3.5" />{order.customer?.city}, {order.customer?.state}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-brand-800 dark:text-white">${order.totalAmount?.toFixed(2)}</p>
                                    <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                {getNextAction(order.status) && (
                                    <button onClick={() => setConfirmAction({ orderId: order.id, ...getNextAction(order.status) })}
                                        className={`px-4 py-2 bg-gradient-to-r ${getNextAction(order.status).color} text-white rounded-xl font-medium text-sm`}>
                                        {getNextAction(order.status).label}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title="Update Order" size="sm"
                loading={statusMutation.isLoading}
                footer={<>
                    <button onClick={() => setConfirmAction(null)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                    <button onClick={() => statusMutation.mutate(confirmAction)} disabled={statusMutation.isLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold text-sm shadow-lg shadow-brand-500/25">
                        {statusMutation.isLoading ? 'Updating...' : confirmAction?.label}
                    </button>
                </>}>
                <p className="text-slate-600 dark:text-slate-400">Are you sure you want to <strong>{confirmAction?.label?.toLowerCase()}</strong>?</p>
            </Modal>
        </div>
    );
};

export default OrdersQueue;