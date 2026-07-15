import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Truck, DollarSign, Clock, CheckCircle, Package, MapPin, Phone, User, ArrowRight } from 'lucide-react';
import dispatchService from '../../services/dispatchService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const DispatchOverview = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({
        queryKey: ['dispatch-dashboard'],
        queryFn: dispatchService.getDashboard
    });

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative">
                    <h2 className="text-2xl lg:text-3xl font-bold">Ready to Deliver!</h2>
                    <p className="text-teal-100 mt-2">You have {data?.activeDeliveries || 0} active deliveries.</p>
                    <button onClick={() => navigate('/dispatch/dashboard/deliveries')}
                        className="mt-4 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition font-semibold text-sm flex items-center gap-2 inline-flex">
                        View Deliveries <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active" value={data?.activeDeliveries || 0} icon={Truck} color="teal" loading={isLoading} />
                <StatCard label="Earnings" value={`$${(data?.totalEarnings || 0).toLocaleString()}`} icon={DollarSign} color="emerald" loading={isLoading} />
                <StatCard label="Pending" value={`$${(data?.pendingEarnings || 0).toLocaleString()}`} icon={Clock} color="gold" loading={isLoading} />
                <StatCard label="Paid" value={`$${(data?.paidEarnings || 0).toLocaleString()}`} icon={CheckCircle} color="navy" loading={isLoading} />
            </div>

            <SectionCard title="Recent Assignments" subtitle="Latest delivery tasks">
                {isLoading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse h-20 bg-slate-200 dark:bg-brand-700 rounded-xl" />)}</div>
                ) : (
                    <div className="space-y-3">
                        {data?.recentAssignments?.slice(0, 8).map((a, i) => (
                            <motion.div key={a.id || i} whileHover={{ y: -1 }}
                                onClick={() => navigate(`/dispatch/dashboard/deliveries`)}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brand-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-teal-500" />
                                    <div>
                                        <p className="font-medium text-brand-800 dark:text-white text-sm">{a.productName}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3 h-3" />{a.customerCity}, {a.customerState}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {a.deliveryFee > 0 && <span className="text-sm font-bold">${a.deliveryFee?.toFixed(2)}</span>}
                                    <StatusBadge status={a.status} size="sm" />
                                </div>
                            </motion.div>
                        ))}
                        {(!data?.recentAssignments || data.recentAssignments.length === 0) && (
                            <p className="text-center text-slate-500 py-8">No deliveries assigned yet.</p>
                        )}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default DispatchOverview;