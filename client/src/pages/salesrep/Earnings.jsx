import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import commissionService from '../../services/commissionService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const Earnings = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['my-earnings-full'],
        queryFn: () => commissionService.getMyEarnings()
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-800 dark:text-white">My Earnings</h1>
                <p className="text-slate-500 mt-1">Track your commissions and earnings</p>
            </div>

            {data?.config && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-6 text-white shadow-lg shadow-gold-500/25">
                    <h3 className="font-semibold mb-3">Your Commission Structure</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/20 rounded-xl p-3">
                            <p className="text-sm text-gold-100">Structure</p>
                            <p className="text-lg font-bold capitalize">{data.config.structure?.replace(/_/g, ' ')}</p>
                        </div>
                        {data.config.baseSalary > 0 && (
                            <div className="bg-white/20 rounded-xl p-3">
                                <p className="text-sm text-gold-100">Base Salary</p>
                                <p className="text-lg font-bold">${data.config.baseSalary}/mo</p>
                            </div>
                        )}
                        {data.config.commissionPercentage > 0 && (
                            <div className="bg-white/20 rounded-xl p-3">
                                <p className="text-sm text-gold-100">Commission Rate</p>
                                <p className="text-lg font-bold">{data.config.commissionPercentage}%</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Earnings" value={`$${(data?.summary?.totalEarnings || 0).toLocaleString()}`} icon={DollarSign} color="gold" loading={isLoading} />
                <StatCard label="Commission" value={`$${(data?.summary?.totalCommission || 0).toLocaleString()}`} icon={TrendingUp} color="navy" loading={isLoading} />
                <StatCard label="Pending" value={`$${(data?.summary?.pendingEarnings || 0).toLocaleString()}`} icon={Clock} color="gold" loading={isLoading} />
                <StatCard label="Paid" value={`$${(data?.summary?.paidEarnings || 0).toLocaleString()}`} icon={CheckCircle} color="emerald" loading={isLoading} />
            </div>

            <SectionCard title="Recent Earnings">
                {isLoading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="animate-pulse h-12 bg-slate-200 dark:bg-brand-700 rounded-xl" />)}</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-brand-700">
                        {data?.recentEarnings?.map(earning => (
                            <div key={earning.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${earning.type === 'commission' ? 'bg-gold-100 text-gold-600' : 'bg-teal-100 text-teal-600'}`}>
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium capitalize text-brand-800 dark:text-white">{earning.type}</p>
                                        <p className="text-xs text-slate-500">{earning.description || earning.productName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-brand-800 dark:text-white">${earning.amount?.toFixed(2)}</p>
                                    <StatusBadge status={earning.status} size="sm" />
                                </div>
                            </div>
                        ))}
                        {(!data?.recentEarnings || data.recentEarnings.length === 0) && (
                            <p className="text-center text-slate-500 py-8">No earnings yet</p>
                        )}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default Earnings;