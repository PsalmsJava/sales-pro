import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    TruckIcon, BuildingOffice2Icon, CheckBadgeIcon,
    XCircleIcon, MagnifyingGlassIcon, EyeIcon,
    MapPinIcon, PhoneIcon, EnvelopeIcon,
    ShieldCheckIcon, ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import dispatchService from '../../services/dispatchService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import { Truck, Building2, CheckCircle, Clock } from 'lucide-react';

const DispatchPartnerManagement = () => {
    const [search, setSearch] = useState('');
    const [viewingPartner, setViewingPartner] = useState(null);
    const [verifyPartner, setVerifyPartner] = useState(null);
    const queryClient = useQueryClient();

    const { data: partners, isLoading } = useQuery({
        queryKey: ['dispatch-partners'],
        queryFn: () => dispatchService.getPartners()
    });

    const verifyMutation = useMutation({
        mutationFn: (id) => dispatchService.verifyPartner(id),
        onSuccess: () => {
            toast.success('Partner verified successfully');
            queryClient.invalidateQueries(['dispatch-partners']);
            setVerifyPartner(null);
        },
        onError: () => toast.error('Verification failed')
    });

    const filteredPartners = partners?.filter(p => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            p.company_name?.toLowerCase().includes(term) ||
            p.contact_person?.toLowerCase().includes(term) ||
            p.city?.toLowerCase().includes(term)
        );
    }) || [];

    const stats = {
        total: filteredPartners.length,
        verified: filteredPartners.filter(p => p.is_verified).length,
        pending: filteredPartners.filter(p => !p.is_verified).length,
        active: filteredPartners.filter(p => p.is_active).length,
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon={TruckIcon}
                title="Dispatch Partners"
                description="Manage delivery partners and verify their accounts"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Partners" value={stats.total} icon={Truck} color="navy" loading={isLoading} />
                <StatCard label="Verified" value={stats.verified} icon={CheckCircle} color="emerald" loading={isLoading} />
                <StatCard label="Pending" value={stats.pending} icon={Clock} color="gold" loading={isLoading} />
                <StatCard label="Active" value={stats.active} icon={Building2} color="teal" loading={isLoading} />
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search partners by name, contact, or city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm shadow-card"
                />
            </div>

            {/* Partners Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 bg-slate-200 dark:bg-brand-700 rounded-xl" />
                                <div className="space-y-2">
                                    <div className="h-4 w-36 bg-slate-200 dark:bg-brand-700 rounded" />
                                    <div className="h-3 w-24 bg-slate-200 dark:bg-brand-700 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPartners.length === 0 ? (
                <EmptyState
                    icon={TruckIcon}
                    title="No dispatch partners found"
                    description={search ? 'Try adjusting your search.' : 'Dispatch partners will appear here after registration.'}
                    searchTerm={search}
                    onClear={() => setSearch('')}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPartners.map((partner, idx) => (
                        <motion.div
                            key={partner.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ y: -3 }}
                            className="group bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card overflow-hidden hover:shadow-elevated hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300"
                        >
                            <div className={`h-1.5 bg-gradient-to-r ${partner.is_verified ? 'from-teal-500 to-teal-700' : 'from-gold-400 to-gold-600'}`} />
                            <div className="p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${partner.is_verified
                                            ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'
                                            : 'bg-gold-100 dark:bg-gold-900/30 text-gold-600'
                                        }`}>
                                        <BuildingOffice2Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-brand-800 dark:text-white truncate">{partner.company_name}</p>
                                        <p className="text-xs text-slate-500">{partner.contact_person}</p>
                                    </div>
                                    <StatusBadge
                                        status={partner.is_verified ? 'active' : 'pending'}
                                        label={partner.is_verified ? 'Verified' : 'Pending'}
                                        size="sm"
                                    />
                                </div>

                                <div className="space-y-2 text-xs text-slate-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{partner.contact_email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{partner.contact_phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{partner.city}, {partner.state}</span>
                                    </div>
                                    {partner.vehicle_type && (
                                        <div className="flex items-center gap-2">
                                            <TruckIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>{partner.vehicle_type}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 pt-3 border-t border-slate-100 dark:border-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setViewingPartner(partner)}
                                        className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors flex-1 text-center text-sm font-medium"
                                    >
                                        <EyeIcon className="w-4 h-4 inline mr-1" />
                                        Details
                                    </button>
                                    {!partner.is_verified && (
                                        <button
                                            onClick={() => setVerifyPartner(partner)}
                                            className="p-2 text-teal-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors flex-1 text-center text-sm font-medium"
                                        >
                                            <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                                            Verify
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            <Modal isOpen={!!viewingPartner} onClose={() => setViewingPartner(null)} title="Partner Details" size="lg">
                {viewingPartner && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-brand-800/50 rounded-xl">
                            <div className="h-16 w-16 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                <BuildingOffice2Icon className="w-8 h-8 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-brand-800 dark:text-white">{viewingPartner.company_name}</h3>
                                <StatusBadge status={viewingPartner.is_verified ? 'active' : 'pending'} label={viewingPartner.is_verified ? 'Verified' : 'Pending'} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Contact Person" value={viewingPartner.contact_person} />
                            <DetailItem label="Phone" value={viewingPartner.contact_phone} />
                            <DetailItem label="Email" value={viewingPartner.contact_email} />
                            <DetailItem label="Vehicle Type" value={viewingPartner.vehicle_type || 'N/A'} />
                            <DetailItem label="License Number" value={viewingPartner.license_number || 'N/A'} />
                            <DetailItem label="City" value={viewingPartner.city} />
                            <DetailItem label="State" value={viewingPartner.state} />
                            <DetailItem label="Status" value={viewingPartner.is_active ? 'Active' : 'Inactive'} />
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-brand-800 dark:text-white mb-2">Address</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-brand-800/50 rounded-xl p-3">
                                {viewingPartner.address}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Verify Confirmation */}
            <Modal
                isOpen={!!verifyPartner}
                onClose={() => setVerifyPartner(null)}
                title="Verify Dispatch Partner"
                subtitle="This will approve the partner for deliveries"
                size="sm"
                loading={verifyMutation.isLoading}
                footer={
                    <>
                        <button onClick={() => setVerifyPartner(null)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                        <button onClick={() => verifyMutation.mutate(verifyPartner.id)} disabled={verifyMutation.isLoading}
                            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all font-semibold text-sm shadow-lg shadow-teal-500/25">
                            {verifyMutation.isLoading ? 'Verifying...' : 'Verify Partner'}
                        </button>
                    </>
                }
            >
                <p className="text-slate-600 dark:text-slate-400">
                    Verify <strong>{verifyPartner?.company_name}</strong> as a trusted dispatch partner? They will be able to receive delivery assignments.
                </p>
            </Modal>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="bg-slate-50 dark:bg-brand-800/50 rounded-xl p-3">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-brand-800 dark:text-white">{value}</p>
    </div>
);

export default DispatchPartnerManagement;