import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign, Users, Percent, Briefcase, CheckCircle,
    AlertTriangle, RefreshCw, Settings, TrendingUp,
    FileText, Clock, Cog
} from 'lucide-react';
import toast from 'react-hot-toast';
import salesRepService from '../../services/salesRepService';
import commissionService from '../../services/commissionService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

const structureInfo = {
    commission_only: {
        title: 'Commission Only',
        description: 'Earns a percentage on each completed order. No base salary.',
        icon: Percent,
        color: 'gold',
        bgClass: 'from-gold-50 to-gold-100 dark:from-gold-900/10 dark:to-gold-900/20',
        borderClass: 'border-gold-200 dark:border-gold-800',
        textColor: 'text-gold-600',
        badgeClass: 'bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400',
    },
    salary_only: {
        title: 'Salary Only',
        description: 'Fixed monthly salary. No per-order commission.',
        icon: Briefcase,
        color: 'teal',
        bgClass: 'from-teal-50 to-teal-100 dark:from-teal-900/10 dark:to-teal-900/20',
        borderClass: 'border-teal-200 dark:border-teal-800',
        textColor: 'text-teal-600',
        badgeClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    },
    salary_plus_commission: {
        title: 'Salary + Commission',
        description: 'Base salary plus a percentage on each completed order.',
        icon: TrendingUp,
        color: 'navy',
        bgClass: 'from-brand-50 to-brand-100 dark:from-brand-800/20 dark:to-brand-900/20',
        borderClass: 'border-brand-200 dark:border-brand-700',
        textColor: 'text-brand-600',
        badgeClass: 'bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-300',
    },
};

const CommissionSettings = () => {
    const [selectedRep, setSelectedRep] = useState(null);
    const [structure, setStructure] = useState('');
    const [baseSalary, setBaseSalary] = useState('');
    const [commissionPercentage, setCommissionPercentage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const queryClient = useQueryClient();

    const { data: salesReps, isLoading } = useQuery({
        queryKey: ['sales-reps-commission'],
        queryFn: () => salesRepService.getAllSalesReps()
    });

    const updateMutation = useMutation({
        mutationFn: (data) => commissionService.setCommission(data.userId, data),
        onSuccess: () => {
            toast.success('Commission structure updated successfully');
            queryClient.invalidateQueries(['sales-reps-commission']);
            queryClient.invalidateQueries(['sales-reps']);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            resetForm();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update commission')
    });

    const processSalaryMutation = useMutation({
        mutationFn: () => commissionService.processSalaries(),
        onSuccess: (data) => {
            toast.success(`Successfully processed ${data.data?.length || 0} salary payments`);
            queryClient.invalidateQueries(['sales-reps-commission']);
        },
        onError: () => toast.error('Failed to process salaries')
    });

    const resetForm = () => {
        setSelectedRep(null);
        setStructure('');
        setBaseSalary('');
        setCommissionPercentage('');
    };

    const handleSelectRep = (rep) => {
        if (selectedRep?.id === rep.id) {
            resetForm();
            return;
        }
        setSelectedRep(rep);
        setStructure(rep.commission?.structure || '');
        setBaseSalary(rep.commission?.baseSalary?.toString() || '');
        setCommissionPercentage(rep.commission?.commissionPercentage?.toString() || '');
        setShowSuccess(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedRep || !structure) {
            toast.error('Please select a rep and commission structure');
            return;
        }

        if (['salary_only', 'salary_plus_commission'].includes(structure) && (!baseSalary || parseFloat(baseSalary) <= 0)) {
            toast.error('Please enter a valid base salary');
            return;
        }
        if (['commission_only', 'salary_plus_commission'].includes(structure) && (!commissionPercentage || parseFloat(commissionPercentage) <= 0)) {
            toast.error('Please enter a valid commission percentage');
            return;
        }

        updateMutation.mutate({
            userId: selectedRep.id,
            structure,
            baseSalary: parseFloat(baseSalary) || 0,
            commissionPercentage: parseFloat(commissionPercentage) || 0,
        });
    };

    const structureCounts = {
        commission_only: salesReps?.filter(r => r.commission?.structure === 'commission_only').length || 0,
        salary_only: salesReps?.filter(r => r.commission?.structure === 'salary_only').length || 0,
        salary_plus_commission: salesReps?.filter(r => r.commission?.structure === 'salary_plus_commission').length || 0,
        none: salesReps?.filter(r => !r.commission).length || 0,
    };

    const hasValidStructure = structure && (
        (structure === 'commission_only' && commissionPercentage && parseFloat(commissionPercentage) > 0) ||
        (structure === 'salary_only' && baseSalary && parseFloat(baseSalary) > 0) ||
        (structure === 'salary_plus_commission' && baseSalary && parseFloat(baseSalary) > 0 && commissionPercentage && parseFloat(commissionPercentage) > 0)
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <DollarSign className="w-8 h-8 text-gold-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold">Commission Settings</h1>
                            <p className="text-brand-200 text-sm mt-1">Configure earning structures for your sales team</p>
                        </div>
                    </div>
                    <button
                        onClick={() => processSalaryMutation.mutate()}
                        disabled={processSalaryMutation.isLoading}
                        className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-brand-900 rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all font-semibold text-sm shadow-lg shadow-gold-500/25 flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${processSalaryMutation.isLoading ? 'animate-spin' : ''}`} />
                        Process Monthly Salaries
                    </button>
                </div>
            </motion.div>

            {/* Success Banner */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-emerald-800 dark:text-emerald-300">Commission Updated!</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                {selectedRep?.firstName} {selectedRep?.lastName}'s commission structure has been saved.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Commission Only" value={structureCounts.commission_only} icon={Percent} color="gold" loading={isLoading} />
                <StatCard label="Salary Only" value={structureCounts.salary_only} icon={DollarSign} color="teal" loading={isLoading} />
                <StatCard label="Salary + Commission" value={structureCounts.salary_plus_commission} icon={TrendingUp} color="navy" loading={isLoading} />
                <StatCard label="Not Configured" value={structureCounts.none} icon={Users} color="rose" loading={isLoading}
                    subtitle={structureCounts.none > 0 ? 'Needs attention' : undefined} />
            </div>

            {/* Structure Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(structureInfo).map(([key, info]) => (
                    <motion.div key={key} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }}
                        className={`bg-gradient-to-br ${info.bgClass} border ${info.borderClass} rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-shadow`}
                        onClick={() => { if (selectedRep) setStructure(key); }}>
                        <div className="flex items-center gap-3 mb-3">
                            <info.icon className={`w-6 h-6 ${info.textColor}`} />
                            <h3 className="font-bold text-brand-800 dark:text-white">{info.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{info.description}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-bold text-brand-800 dark:text-white">{structureCounts[key]}</p>
                                <p className="text-xs text-slate-500">reps assigned</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.badgeClass}`}>
                                {structureCounts[key]} reps
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Configuration Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Reps List */}
                <SectionCard
                    title="Sales Representatives"
                    subtitle={`${salesReps?.length || 0} total reps`}
                    icon={Users}
                    className="lg:col-span-1"
                >
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                                    <div className="h-10 w-10 bg-slate-200 dark:bg-brand-700 rounded-full" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-4 w-28 bg-slate-200 dark:bg-brand-700 rounded" />
                                        <div className="h-3 w-20 bg-slate-200 dark:bg-brand-700 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                            {salesReps?.map(rep => (
                                <motion.button
                                    key={rep.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectRep(rep)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedRep?.id === rep.id
                                            ? 'bg-brand-50 dark:bg-brand-800/50 border-2 border-brand-300 dark:border-brand-600 shadow-sm'
                                            : 'hover:bg-slate-50 dark:hover:bg-brand-800/30 border-2 border-transparent'
                                        }`}
                                >
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all ${selectedRep?.id === rep.id
                                            ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md'
                                            : 'bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-700 text-brand-700 dark:text-brand-200'
                                        }`}>
                                        {rep.firstName?.[0]}{rep.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-brand-800 dark:text-white truncate">
                                            {rep.firstName} {rep.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{rep.email}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {rep.commission ? (
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${rep.commission.structure === 'commission_only'
                                                    ? 'bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400'
                                                    : rep.commission.structure === 'salary_only'
                                                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                                        : 'bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-300'
                                                }`}>
                                                {rep.commission.structure === 'commission_only'
                                                    ? `${rep.commission.commissionPercentage}%`
                                                    : rep.commission.structure === 'salary_only'
                                                        ? `$${rep.commission.baseSalary}`
                                                        : `${rep.commission.commissionPercentage}% + $${rep.commission.baseSalary}`
                                                }
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                Not Set
                                            </span>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                            {(!salesReps || salesReps.length === 0) && (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No sales representatives found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </SectionCard>

                {/* Right: Configuration Form */}
                <SectionCard
                    title={selectedRep ? `${selectedRep.firstName} ${selectedRep.lastName}` : 'Commission Configuration'}
                    subtitle={selectedRep ? 'Set earning structure' : 'Select a rep to begin'}
                    icon={Cog}
                    className="lg:col-span-2"
                >
                    {!selectedRep ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-brand-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <Cog className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-brand-800 dark:text-white mb-2">No Rep Selected</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Select a sales representative from the list to configure their commission structure.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Current Structure */}
                            {selectedRep.commission && (
                                <div className="p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl border border-slate-200 dark:border-brand-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Current Structure</p>
                                            <p className="font-bold text-brand-800 dark:text-white capitalize text-lg">
                                                {selectedRep.commission.structure?.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {selectedRep.commission.baseSalary > 0 && (
                                                <p className="text-sm font-semibold text-brand-800 dark:text-white">${selectedRep.commission.baseSalary}/mo</p>
                                            )}
                                            {selectedRep.commission.commissionPercentage > 0 && (
                                                <p className="text-sm font-semibold text-brand-800 dark:text-white">{selectedRep.commission.commissionPercentage}%</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Structure Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                    Select Commission Structure <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(structureInfo).map(([key, info]) => (
                                        <motion.button
                                            key={key}
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setStructure(key)}
                                            className={`p-4 rounded-2xl border-2 text-center transition-all ${structure === key
                                                    ? `border-${info.color}-400 bg-${info.color}-50 dark:bg-${info.color}-900/20 shadow-md`
                                                    : 'border-slate-200 dark:border-brand-700 hover:border-slate-300 dark:hover:border-brand-600'
                                                }`}
                                        >
                                            <info.icon className={`w-7 h-7 mx-auto mb-2 ${structure === key ? info.textColor : 'text-slate-400'}`} />
                                            <p className="text-xs font-bold text-brand-800 dark:text-white">{info.title}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            <AnimatePresence>
                                {['salary_only', 'salary_plus_commission'].includes(structure) && (
                                    <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Base Salary ($/month) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                                placeholder="e.g., 50000" min="0" step="100" />
                                        </div>
                                        {baseSalary && parseFloat(baseSalary) > 0 && (
                                            <p className="text-xs text-slate-500 mt-1.5">
                                                Monthly salary: <span className="font-bold text-brand-800 dark:text-white">${parseFloat(baseSalary).toLocaleString()}</span>
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {['commission_only', 'salary_plus_commission'].includes(structure) && (
                                    <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Commission Percentage (%) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input type="number" step="0.1" min="0" max="100" value={commissionPercentage} onChange={(e) => setCommissionPercentage(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                                placeholder="e.g., 10" />
                                        </div>
                                        {commissionPercentage && parseFloat(commissionPercentage) > 0 && (
                                            <div className="mt-2">
                                                <div className="h-2 bg-slate-200 dark:bg-brand-700 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(parseFloat(commissionPercentage), 100)}%` }}
                                                        className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full" transition={{ duration: 0.5 }} />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Commission rate: <span className="font-bold text-brand-800 dark:text-white">{commissionPercentage}%</span> per order
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Earnings Summary */}
                            <AnimatePresence>
                                {hasValidStructure && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-800/30 dark:to-brand-900/30 rounded-2xl border border-brand-200 dark:border-brand-700">
                                        <h4 className="font-bold text-brand-800 dark:text-white mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-emerald-500" /> Earnings Summary
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            {structure === 'commission_only' && (
                                                <div className="flex items-center gap-2">
                                                    <Percent className="w-4 h-4 text-gold-500" />
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        Earns <strong className="text-brand-800 dark:text-white">{commissionPercentage}%</strong> commission on each completed order
                                                    </p>
                                                </div>
                                            )}
                                            {structure === 'salary_only' && (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-teal-500" />
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        Earns <strong className="text-brand-800 dark:text-white">${parseFloat(baseSalary).toLocaleString()}/month</strong> fixed salary
                                                    </p>
                                                </div>
                                            )}
                                            {structure === 'salary_plus_commission' && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-teal-500" />
                                                        <p className="text-slate-600 dark:text-slate-400">
                                                            Base salary: <strong className="text-brand-800 dark:text-white">${parseFloat(baseSalary).toLocaleString()}/month</strong>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Percent className="w-4 h-4 text-gold-500" />
                                                        <p className="text-slate-600 dark:text-slate-400">
                                                            Commission: <strong className="text-brand-800 dark:text-white">{commissionPercentage}%</strong> per order
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {commissionPercentage && parseFloat(commissionPercentage) > 0 && (
                                            <div className="mt-4 p-3 bg-white/50 dark:bg-brand-800/50 rounded-xl">
                                                <p className="text-xs text-slate-500 mb-2">Example: On a $100 order</p>
                                                <p className="text-lg font-bold text-gold-600">
                                                    ${((100 * parseFloat(commissionPercentage)) / 100).toFixed(2)} commission
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-brand-700">
                                <button type="button" onClick={resetForm}
                                    className="flex-1 py-3 border-2 border-slate-300 dark:border-brand-600 rounded-xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors">
                                    Clear
                                </button>
                                <button type="submit" disabled={updateMutation.isLoading || !hasValidStructure}
                                    className="flex-[2] py-3 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl font-bold text-sm hover:from-brand-800 hover:to-brand-950 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {updateMutation.isLoading ? (
                                        <><RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...</>
                                    ) : (
                                        <><CheckCircle className="w-5 h-5" /> Save Commission Structure</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </SectionCard>
            </div>

            {/* Salary Processing History */}
            <SectionCard title="Salary Processing History" subtitle="Monthly salary payouts" icon={FileText}>
                <div className="space-y-3">
                    {[
                        { month: 'June 2026', date: '2 days ago', reps: 35, amount: '$142,500.00' },
                        { month: 'May 2026', date: '33 days ago', reps: 34, amount: '$138,000.00' },
                        { month: 'April 2026', date: '61 days ago', reps: 32, amount: '$129,500.00' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl border border-slate-200 dark:border-brand-700 hover:border-slate-300 dark:hover:border-brand-600 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                                    <RefreshCw className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-brand-800 dark:text-white">{item.month} Salaries</p>
                                    <p className="text-xs text-slate-500">Processed {item.date} • {item.reps} sales reps</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-brand-800 dark:text-white">{item.amount}</p>
                                <StatusBadge status="paid" label="Processed" size="sm" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <button className="text-sm text-brand-600 dark:text-gold-400 font-medium hover:underline">
                        View Full History →
                    </button>
                </div>
            </SectionCard>
        </div>
    );
};

export default CommissionSettings;