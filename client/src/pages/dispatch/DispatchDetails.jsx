import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, Package, MapPin, Phone, User, Clock, CheckCircle,
    Navigation, Camera, ArrowLeft, ChevronRight, Star, Shield,
    AlertTriangle, X, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import dispatchService from '../../services/dispatchService';
import StatusBadge from '../../components/ui/StatusBadge';
import SectionCard from '../../components/ui/SectionCard';

const DispatchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [proofImage, setProofImage] = useState(null);
    const [recipientName, setRecipientName] = useState('');

    const { data: dashboard, isLoading } = useQuery({
        queryKey: ['dispatch-dashboard'],
        queryFn: dispatchService.getDashboard
    });

    const assignment = dashboard?.recentAssignments?.find(a => a.id === id);

    const statusMutation = useMutation({
        mutationFn: ({ id, data }) => dispatchService.updateDeliveryStatus(id, data),
        onSuccess: () => {
            toast.success('Delivery status updated!');
            queryClient.invalidateQueries(['dispatch-dashboard']);
            setShowCompleteModal(false);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Update failed')
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-xl border-4 border-teal-200 border-t-teal-600" />
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-brand-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-800 dark:text-white">Delivery Not Found</h3>
                    <p className="text-slate-500 mt-2">This delivery assignment doesn't exist or has been removed.</p>
                    <button onClick={() => navigate('/dispatch/dashboard/deliveries')}
                        className="mt-4 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition">
                        Back to Deliveries
                    </button>
                </div>
            </div>
        );
    }

    const getNextAction = (status) => {
        switch (status) {
            case 'assigned': return { action: 'picked_up', label: 'Pick Up Package', color: 'from-brand-700 to-brand-900', icon: Package };
            case 'picked_up': return { action: 'in_transit', label: 'Start Delivery', color: 'from-gold-500 to-gold-600', icon: Navigation };
            case 'in_transit': return { action: 'delivered', label: 'Complete Delivery', color: 'from-emerald-600 to-emerald-700', icon: CheckCircle };
            default: return null;
        }
    };

    const nextAction = getNextAction(assignment.status);

    const timeline = [
        { status: 'assigned', label: 'Assigned', icon: Package, done: true },
        { status: 'picked_up', label: 'Picked Up', icon: Truck, done: ['picked_up', 'in_transit', 'delivered'].includes(assignment.status) },
        { status: 'in_transit', label: 'In Transit', icon: Navigation, done: ['in_transit', 'delivered'].includes(assignment.status) },
        { status: 'delivered', label: 'Delivered', icon: CheckCircle, done: assignment.status === 'delivered' },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back Button */}
            <button onClick={() => navigate('/dispatch/dashboard/deliveries')}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-gold-400 transition-colors font-medium text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Deliveries
            </button>

            {/* Hero Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">Delivery #{assignment.id?.slice(0, 8)}</h2>
                        <StatusBadge status={assignment.status} />
                    </div>
                    <p className="text-teal-100">{assignment.productName}</p>
                </div>
            </motion.div>

            {/* Progress Timeline */}
            <SectionCard title="Delivery Progress">
                <div className="flex items-center justify-between py-4">
                    {timeline.map((step, index) => (
                        <React.Fragment key={step.status}>
                            <div className="flex flex-col items-center flex-1">
                                <motion.div
                                    animate={step.done ? { scale: [1, 1.2, 1] } : {}}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all ${step.done ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25' : 'bg-slate-100 dark:bg-brand-800 text-slate-400'
                                        }`}>
                                    <step.icon className="w-6 h-6" />
                                </motion.div>
                                <p className={`text-xs font-semibold text-center ${step.done ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>{step.label}</p>
                            </div>
                            {index < timeline.length - 1 && (
                                <div className={`flex-shrink-0 w-8 h-1 rounded-full ${timeline[index + 1].done ? 'bg-teal-500' : 'bg-slate-200 dark:bg-brand-700'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </SectionCard>

            {/* Customer & Product Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Customer Information" icon={User}>
                    <div className="space-y-3">
                        <InfoRow icon={User} label="Name" value={`${assignment.customerFirstName} ${assignment.customerLastName}`} />
                        <InfoRow icon={Phone} label="Phone" value={assignment.customerPhone} />
                        <InfoRow icon={MapPin} label="Address" value={`${assignment.customerAddress}, ${assignment.customerCity}, ${assignment.customerState}`} />
                    </div>
                </SectionCard>

                <SectionCard title="Order Details" icon={Package}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-14 w-14 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center overflow-hidden">
                                {assignment.productImage ? (
                                    <img src={assignment.productImage} alt={assignment.productName} className="h-full w-full object-cover" />
                                ) : (
                                    <Package className="w-7 h-7 text-teal-600" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-brand-800 dark:text-white">{assignment.productName}</p>
                                <p className="text-sm text-slate-500">Order value: ${assignment.orderAmount?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-brand-700">
                            <div className="bg-slate-50 dark:bg-brand-800/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-500 mb-1">Delivery Fee</p>
                                <p className="text-xl font-bold text-teal-600">${assignment.deliveryFee?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-brand-800/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-500 mb-1">Your Earnings</p>
                                <p className="text-xl font-bold text-emerald-600">${((assignment.deliveryFee || 0) * 0.8).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Time Information */}
            <SectionCard title="Timeline" icon={Clock}>
                <div className="space-y-3">
                    <TimelineItem label="Created" time={assignment.createdAt} done />
                    {assignment.pickupTime && <TimelineItem label="Picked Up" time={assignment.pickupTime} done />}
                    {assignment.deliveryTime && <TimelineItem label="Delivered" time={assignment.deliveryTime} done highlight />}
                </div>
            </SectionCard>

            {/* Action Button */}
            {nextAction && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <button
                        onClick={() => {
                            if (nextAction.action === 'delivered') {
                                setRecipientName(`${assignment.customerFirstName} ${assignment.customerLastName}`);
                                setShowCompleteModal(true);
                            } else {
                                statusMutation.mutate({ id: assignment.id, data: { status: nextAction.action } });
                            }
                        }}
                        className={`w-full py-4 bg-gradient-to-r ${nextAction.color} text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 hover:shadow-2xl transition-all`}>
                        <nextAction.icon className="w-6 h-6" /> {nextAction.label}
                    </button>
                </motion.div>
            )}

            {/* Complete Delivery Modal */}
            <AnimatePresence>
                {showCompleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)} />
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-brand-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold">Complete Delivery</h3>
                                    <button onClick={() => setShowCompleteModal(false)} className="p-1.5 bg-white/20 rounded-xl hover:bg-white/30">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-emerald-100 text-sm mt-1">Confirm successful delivery</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Recipient Name</label>
                                    <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Proof of Delivery (Optional)</label>
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-brand-700 rounded-xl cursor-pointer hover:border-teal-500 transition-colors">
                                        {proofImage ? (
                                            <img src={proofImage} alt="Proof" className="h-full w-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="text-center">
                                                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                                                <span className="text-xs text-slate-500">Click to upload photo</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => setProofImage(e.target.result);
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setShowCompleteModal(false)}
                                        className="flex-1 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors">Cancel</button>
                                    <button
                                        onClick={() => statusMutation.mutate({
                                            id: assignment.id,
                                            data: { status: 'delivered', recipientName, proofOfDeliveryUrl: proofImage }
                                        })}
                                        disabled={statusMutation.isLoading}
                                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {statusMutation.isLoading ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming...</>
                                        ) : (
                                            <><CheckCircle className="w-5 h-5" /> Confirm Delivery</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <div className="p-2 bg-slate-100 dark:bg-brand-800 rounded-lg">
            <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-medium text-brand-800 dark:text-white">{value || 'N/A'}</p>
        </div>
    </div>
);

const TimelineItem = ({ label, time, done, highlight }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${highlight ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-brand-800/50'}`}>
        <div className={`w-3 h-3 rounded-full ${done ? 'bg-teal-500' : 'bg-slate-300'}`} />
        <div className="flex-1">
            <p className="text-sm font-medium text-brand-800 dark:text-white">{label}</p>
            <p className="text-xs text-slate-500">{time ? new Date(time).toLocaleString() : 'Pending'}</p>
        </div>
        {done && <CheckCircle className={`w-4 h-4 ${highlight ? 'text-emerald-500' : 'text-teal-500'}`} />}
    </div>
);

export default DispatchDetails;