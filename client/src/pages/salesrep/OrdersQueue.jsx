import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock, MapPin, Calendar, Phone } from 'lucide-react';
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
    const [rescheduleOrder, setRescheduleOrder] = useState(null);
    const [callbackOrder, setCallbackOrder] = useState(null);

    // Reschedule form
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');

    // Callback form
    const [callbackDate, setCallbackDate] = useState('');
    const [callbackTime, setCallbackTime] = useState('');
    const [callbackComment, setCallbackComment] = useState('');

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

    const rescheduleMutation = useMutation({
        mutationFn: ({ orderId, scheduledAt, reason }) =>
            orderService.rescheduleOrder(orderId, { scheduledAt, reason }),
        onSuccess: () => {
            toast.success('Order rescheduled successfully');
            queryClient.invalidateQueries(['sales-rep-orders']);
            closeReschedule();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to reschedule')
    });

    const callbackMutation = useMutation({
        mutationFn: ({ orderId, callbackAt, comment }) =>
            orderService.scheduleCallback(orderId, { callbackAt, comment }),
        onSuccess: () => {
            toast.success('Callback scheduled successfully');
            queryClient.invalidateQueries(['sales-rep-orders']);
            closeCallback();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to schedule callback')
    });

    const issueMutation = useMutation({
        mutationFn: ({ orderId, type }) =>
            orderService.logIssue(orderId, type),
        onSuccess: () => {
            toast.success('Issue logged successfully');
            queryClient.invalidateQueries(['sales-rep-orders']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to log issue')
    });

    const openReschedule = (order) => {
        setRescheduleOrder(order);
        setRescheduleDate('');
        setRescheduleTime('');
        setRescheduleReason('');
    };
    const closeReschedule = () => {
        setRescheduleOrder(null);
        setRescheduleDate('');
        setRescheduleTime('');
        setRescheduleReason('');
    };

    const openCallback = (order) => {
        setCallbackOrder(order);
        setCallbackDate('');
        setCallbackTime('');
        setCallbackComment('');
    };
    const closeCallback = () => {
        setCallbackOrder(null);
        setCallbackDate('');
        setCallbackTime('');
        setCallbackComment('');
    };

    const handleRescheduleSubmit = () => {
        if (!rescheduleDate || !rescheduleTime) {
            toast.error('Please select a date and time');
            return;
        }
        const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
        rescheduleMutation.mutate({
            orderId: rescheduleOrder.id,
            scheduledAt,
            reason: rescheduleReason.trim() || undefined
        });
    };

    const handleCallbackSubmit = () => {
        if (!callbackDate || !callbackTime) {
            toast.error('Please select a callback date and time');
            return;
        }
        if (!callbackComment.trim()) {
            toast.error('Please add a comment describing the callback');
            return;
        }
        const callbackAt = new Date(`${callbackDate}T${callbackTime}`).toISOString();
        callbackMutation.mutate({
            orderId: callbackOrder.id,
            callbackAt,
            comment: callbackComment.trim()
        });
    };

    const getNextAction = (status) => {
        switch (status) {
            case 'assigned': return { action: 'confirmed', label: 'Confirm Order', color: 'from-brand-700 to-brand-900' };
            case 'confirmed': return { action: 'processing', label: 'Start Processing', color: 'from-gold-500 to-gold-600' };
            default: return null;
        }
    };

    const orders = data?.data || [];
    const today = new Date().toISOString().split('T')[0];

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
                                    <p className="text-2xl font-bold text-brand-800 dark:text-white">₦{order.totalAmount?.toFixed(2)}</p>
                                    <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {getNextAction(order.status) && (
                                        <button onClick={() => setConfirmAction({ orderId: order.id, ...getNextAction(order.status) })}
                                            className={`px-4 py-2 bg-gradient-to-r ${getNextAction(order.status).color} text-white rounded-xl font-medium text-sm`}>
                                            {getNextAction(order.status).label}
                                        </button>
                                    )}
                                    <button onClick={() => openReschedule(order)}
                                        className="px-4 py-2 bg-white dark:bg-brand-800 border border-slate-300 dark:border-brand-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-brand-700 transition">
                                        <Calendar className="w-4 h-4" /> Reschedule
                                    </button>
                                    <button onClick={() => openCallback(order)}
                                        className="px-4 py-2 bg-white dark:bg-brand-800 border border-slate-300 dark:border-brand-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-brand-700 transition">
                                        <Phone className="w-4 h-4" /> Callback
                                    </button>
                                    <button onClick={() => issueMutation.mutate({ orderId: order.id, type: 'switched_off' })}
                                        disabled={issueMutation.isLoading}
                                        className="px-4 py-2 bg-white dark:bg-brand-800 border border-slate-300 dark:border-brand-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-brand-700 transition">
                                        Switched Off
                                    </button>
                                    <button onClick={() => issueMutation.mutate({ orderId: order.id, type: 'not_answering' })}
                                        disabled={issueMutation.isLoading}
                                        className="px-4 py-2 bg-white dark:bg-brand-800 border border-slate-300 dark:border-brand-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-brand-700 transition">
                                        Not Answering
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Confirm status modal (existing) */}
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

            {/* RESCHEDULE MODAL */}
            <Modal isOpen={!!rescheduleOrder} onClose={closeReschedule} title="Reschedule Order" size="md"
                loading={rescheduleMutation.isLoading}
                footer={<>
                    <button onClick={closeReschedule} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                    <button onClick={handleRescheduleSubmit} disabled={rescheduleMutation.isLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all font-semibold text-sm shadow-lg shadow-gold-500/25 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {rescheduleMutation.isLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </button>
                </>}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Choose a new date and time for <strong>{rescheduleOrder?.productName}</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-brand-800 dark:text-slate-300 mb-1.5">
                                <Calendar className="inline w-3.5 h-3.5 mr-1" /> Date
                            </label>
                            <input type="date" value={rescheduleDate} min={today}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-brand-600 bg-white dark:bg-brand-900 text-brand-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-800 dark:text-slate-300 mb-1.5">
                                <Clock className="inline w-3.5 h-3.5 mr-1" /> Time
                            </label>
                            <input type="time" value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-brand-600 bg-white dark:bg-brand-900 text-brand-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-800 dark:text-slate-300 mb-1.5">Reason (optional)</label>
                        <textarea rows={3} value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            placeholder="e.g. Customer requested a later delivery date"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-brand-600 bg-white dark:bg-brand-900 text-brand-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 resize-none" />
                    </div>
                    {rescheduleDate && rescheduleTime && (
                        <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl p-3 text-sm text-brand-800 dark:text-slate-300">
                            <Calendar className="inline w-3.5 h-3.5 mr-1" />
                            New schedule: <strong>{new Date(`${rescheduleDate}T${rescheduleTime}`).toLocaleString()}</strong>
                        </div>
                    )}
                </div>
            </Modal>

            {/* CALLBACK MODAL */}
            <Modal isOpen={!!callbackOrder} onClose={closeCallback} title="Schedule Callback" size="md"
                loading={callbackMutation.isLoading}
                footer={<>
                    <button onClick={closeCallback} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                    <button onClick={handleCallbackSubmit} disabled={callbackMutation.isLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {callbackMutation.isLoading ? 'Scheduling...' : 'Schedule Callback'}
                    </button>
                </>}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Specify when to call the customer back for <strong>{callbackOrder?.productName}</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-brand-800 dark:text-slate-300 mb-1.5">
                                <Calendar className="inline w-3.5 h-3.5 mr-1" /> Callback Date
                            </label>
                            <input type="date" value={callbackDate} min={today}
                                onChange={(e) => setCallbackDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-brand-600 bg-white dark:bg-brand-900 text-brand-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-800 dark:text-slate-300 mb-1.5">
                                <Clock className="inline w-3.5 h-3.5 mr-1" /> Callback Time
                            </label>
                            <input type="time" value={callbackTime}
                                onChange={(e) => setCallbackTime(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-brand-600 bg-white dark:bg-brand-900 text-brand-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-800 dark:text-slate-300 mb-1.5">
                            Comment <span className="text-rose-500">*</span>
                        </label>
                        <textarea rows={4} value={callbackComment}
                            onChange={(e) => setCallbackComment(e.target.value)}
                            placeholder="Describe what to discuss on the callback (e.g. confirm delivery address and payment method)."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-brand-600 bg-white dark:bg-brand-900 text-brand-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 resize-none" />
                        <p className="text-xs text-slate-500 mt-1">{callbackComment.length} characters</p>
                    </div>
                    {callbackDate && callbackTime && (
                        <div className="bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 rounded-xl p-3 text-sm text-brand-800 dark:text-slate-300">
                            <Phone className="inline w-3.5 h-3.5 mr-1" />
                            Callback: <strong>{new Date(`${callbackDate}T${callbackTime}`).toLocaleString()}</strong>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default OrdersQueue;