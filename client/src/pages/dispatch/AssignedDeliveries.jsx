import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Truck, Package, MapPin, Phone, User, Navigation, CheckCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import dispatchService from '../../services/dispatchService';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const AssignedDeliveries = () => {
    const [completingDelivery, setCompletingDelivery] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['dispatch-dashboard'],
        queryFn: dispatchService.getDashboard
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, data }) => dispatchService.updateDeliveryStatus(id, data),
        onSuccess: () => {
            toast.success('Delivery status updated!');
            queryClient.invalidateQueries(['dispatch-dashboard']);
            setCompletingDelivery(null);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Update failed')
    });

    const activeDeliveries = data?.recentAssignments?.filter(a =>
        ['assigned', 'picked_up', 'in_transit'].includes(a.status)
    ) || [];

    const getNextAction = (status) => {
        switch (status) {
            case 'assigned': return { action: 'picked_up', label: 'Pick Up', color: 'from-brand-700 to-brand-900' };
            case 'picked_up': return { action: 'in_transit', label: 'Start Delivery', color: 'from-gold-500 to-gold-600' };
            case 'in_transit': return { action: 'delivered', label: 'Complete', color: 'from-emerald-600 to-emerald-700' };
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-800 dark:text-white">My Deliveries</h1>
                <p className="text-slate-500 mt-1">Manage your active delivery assignments</p>
            </div>

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse h-32 bg-slate-200 dark:bg-brand-700 rounded-2xl" />)}</div>
            ) : activeDeliveries.length === 0 ? (
                <EmptyState icon={Truck} title="No active deliveries" description="New delivery assignments will appear here." />
            ) : (
                <div className="space-y-4">
                    {activeDeliveries.map((delivery, idx) => (
                        <motion.div key={delivery.id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card overflow-hidden">
                            <div className={`h-1.5 bg-gradient-to-r ${delivery.status === 'assigned' ? 'from-brand-600 to-brand-800' :
                                    delivery.status === 'picked_up' ? 'from-gold-400 to-gold-600' :
                                        'from-teal-500 to-teal-700'
                                }`} />
                            <div className="p-5">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Package className="w-5 h-5 text-teal-500" />
                                            <div>
                                                <p className="font-semibold text-brand-800 dark:text-white">{delivery.productName}</p>
                                                <StatusBadge status={delivery.status} size="sm" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500"><User className="w-4 h-4" />{delivery.customerFirstName} {delivery.customerLastName}</div>
                                            <div className="flex items-center gap-2 text-slate-500"><Phone className="w-4 h-4" />{delivery.customerPhone}</div>
                                            <div className="flex items-start gap-2 text-slate-500 col-span-2"><MapPin className="w-4 h-4 mt-0.5" />{delivery.customerAddress}, {delivery.customerCity}, {delivery.customerState}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3">
                                        {delivery.deliveryFee > 0 && (
                                            <span className="text-xl font-bold text-brand-800 dark:text-white">${delivery.deliveryFee?.toFixed(2)}</span>
                                        )}
                                        {getNextAction(delivery.status) && (
                                            <button
                                                onClick={() => {
                                                    if (getNextAction(delivery.status).action === 'delivered') {
                                                        setCompletingDelivery(delivery);
                                                    } else {
                                                        statusMutation.mutate({ id: delivery.id, data: { status: getNextAction(delivery.status).action } });
                                                    }
                                                }}
                                                className={`px-5 py-2.5 bg-gradient-to-r ${getNextAction(delivery.status).color} text-white rounded-xl font-semibold text-sm shadow-lg whitespace-nowrap`}>
                                                {getNextAction(delivery.status).label}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Complete Delivery Modal */}
            {completingDelivery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-brand-900 rounded-3xl shadow-2xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold text-brand-800 dark:text-white mb-2">Complete Delivery</h3>
                        <p className="text-slate-500 mb-6">Confirm that you've delivered this order successfully.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setCompletingDelivery(null)} className="flex-1 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl font-medium">Cancel</button>
                            <button
                                onClick={() => statusMutation.mutate({ id: completingDelivery.id, data: { status: 'delivered', recipientName: `${completingDelivery.customerFirstName} ${completingDelivery.customerLastName}` } })}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg">
                                <CheckCircle className="w-5 h-5 inline mr-2" />Confirm Delivery
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AssignedDeliveries;