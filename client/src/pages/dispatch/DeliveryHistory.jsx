import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Package, MapPin } from 'lucide-react';
import dispatchService from '../../services/dispatchService';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const DeliveryHistory = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dispatch-dashboard'],
        queryFn: dispatchService.getDashboard
    });

    const completedDeliveries = data?.recentAssignments?.filter(a =>
        ['delivered', 'completed'].includes(a.status)
    ) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-800 dark:text-white">Delivery History</h1>
                <p className="text-slate-500 mt-1">Completed deliveries and earnings</p>
            </div>

            <SectionCard subtitle={`${completedDeliveries.length} completed deliveries`}>
                {isLoading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse h-16 bg-slate-200 dark:bg-brand-700 rounded-xl" />)}</div>
                ) : completedDeliveries.length === 0 ? (
                    <div className="text-center py-12"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No completed deliveries yet.</p></div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-brand-700">
                        {completedDeliveries.map((d, i) => (
                            <div key={d.id || i} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="font-medium text-brand-800 dark:text-white text-sm">{d.productName}</p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3 h-3" />{d.customerCity}, {d.customerState}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-sm">${d.deliveryFee?.toFixed(2)}</span>
                                    <StatusBadge status={d.status} size="sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default DeliveryHistory;