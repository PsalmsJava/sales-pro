import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, TrendingUp, Package } from 'lucide-react';
import dispatchService from '../../services/dispatchService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const DispatchEarnings = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dispatch-dashboard'],
        queryFn: dispatchService.getDashboard
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Dispatch Earnings</h1>
                <p className="text-slate-500 mt-1">Track your delivery income</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Earnings" value={`$${(data?.totalEarnings || 0).toLocaleString()}`} icon={DollarSign} color="emerald" loading={isLoading} />
                <StatCard label="Pending" value={`$${(data?.pendingEarnings || 0).toLocaleString()}`} icon={Clock} color="gold" loading={isLoading} />
                <StatCard label="Paid" value={`$${(data?.paidEarnings || 0).toLocaleString()}`} icon={CheckCircle} color="navy" loading={isLoading} />
                <StatCard label="Deliveries" value={data?.recentAssignments?.filter(a => a.status === 'delivered').length || 0} icon={Package} color="teal" loading={isLoading} />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-6 text-white">
                <h3 className="font-bold text-lg mb-1">How You Earn</h3>
                <p className="text-teal-100 text-sm">You earn <strong>80%</strong> of the delivery fee for each successful delivery. Payouts are processed regularly.</p>
            </motion.div>

            <SectionCard title="Recent Earnings" subtitle="Per-delivery breakdown">
                {data?.recentAssignments?.filter(a => a.status === 'delivered').map((d, i) => (
                    <div key={d.id || i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-brand-700 last:border-0">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-teal-500" />
                            <div>
                                <p className="font-medium text-brand-800 dark:text-white text-sm">{d.productName}</p>
                                <p className="text-xs text-slate-500">{d.customerCity}</p>
                            </div>
                        </div>
                        <span className="font-bold text-emerald-600">${((d.deliveryFee || 0) * 0.8).toFixed(2)}</span>
                    </div>
                ))}
                {(!data?.recentAssignments || data.recentAssignments.filter(a => a.status === 'delivered').length === 0) && (
                    <p className="text-center text-slate-500 py-8">Complete deliveries to see earnings.</p>
                )}
            </SectionCard>
        </div>
    );
};

export default DispatchEarnings;