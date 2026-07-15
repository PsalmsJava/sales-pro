import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    UsersIcon, PlusIcon, PencilIcon, KeyIcon,
    EyeIcon, UserMinusIcon, UserPlusIcon,
    MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon,
    CheckCircleIcon, XCircleIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import salesRepService from '../../services/salesRepService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import { DollarSign, TrendingUp, UserCheck, UserX } from 'lucide-react';

const SalesRepManagement = () => {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingRep, setEditingRep] = useState(null);
    const [viewingRep, setViewingRep] = useState(null);
    const [resetPasswordRep, setResetPasswordRep] = useState(null);
    const [toggleRep, setToggleRep] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const queryClient = useQueryClient();

    const { data: salesReps, isLoading } = useQuery({
        queryKey: ['sales-reps', { search }],
        queryFn: () => salesRepService.getAllSalesReps()
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, action }) => salesRepService.toggleActive(id, action),
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries(['sales-reps']);
            setToggleRep(null);
        },
    });

    const resetMutation = useMutation({
        mutationFn: (id) => salesRepService.resetPassword(id),
        onSuccess: (data) => {
            setCredentials({ email: data.data.email, password: data.data.newPassword });
            setResetPasswordRep(null);
            toast.success('Password reset successfully');
        },
    });

    const filteredReps = salesReps?.filter(rep => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            rep.firstName?.toLowerCase().includes(term) ||
            rep.lastName?.toLowerCase().includes(term) ||
            rep.email?.toLowerCase().includes(term)
        );
    }) || [];

    const stats = {
        total: filteredReps.length,
        active: filteredReps.filter(r => r.isActive).length,
        inactive: filteredReps.filter(r => !r.isActive).length,
        withCommission: filteredReps.filter(r => r.commission).length,
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon={UsersIcon}
                title="Sales Representatives"
                description="Manage your sales team and their commission structures"
                actions={
                    <button
                        onClick={() => { setEditingRep(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold shadow-lg shadow-brand-500/25 text-sm"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Sales Rep
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Reps" value={stats.total} icon={UsersIcon} color="navy" loading={isLoading} />
                <StatCard label="Active" value={stats.active} icon={UserCheck} color="emerald" loading={isLoading} />
                <StatCard label="Inactive" value={stats.inactive} icon={UserX} color="rose" loading={isLoading} />
                <StatCard label="With Commission" value={stats.withCommission} icon={DollarSign} color="gold" loading={isLoading} />
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search sales reps..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm shadow-card"
                />
            </div>

            {/* Reps Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 bg-slate-200 dark:bg-brand-700 rounded-full" />
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-slate-200 dark:bg-brand-700 rounded" />
                                    <div className="h-3 w-24 bg-slate-200 dark:bg-brand-700 rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-16 bg-slate-200 dark:bg-brand-700 rounded-full" />
                        </div>
                    ))}
                </div>
            ) : filteredReps.length === 0 ? (
                <EmptyState
                    icon={UsersIcon}
                    title="No sales reps found"
                    description={search ? 'Try adjusting your search.' : 'Add your first sales representative.'}
                    searchTerm={search}
                    onClear={() => setSearch('')}
                    action={() => { setEditingRep(null); setShowForm(true); }}
                    actionLabel="Add Sales Rep"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReps.map((rep, idx) => (
                        <motion.div
                            key={rep.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ y: -3 }}
                            className="group bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card overflow-hidden hover:shadow-elevated hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300"
                        >
                            <div className="h-1.5 bg-gradient-to-r from-brand-600 to-brand-800" />
                            <div className="p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center flex-shrink-0">
                                        <span className="text-brand-700 dark:text-brand-200 font-bold text-lg">
                                            {rep.firstName?.[0]}{rep.lastName?.[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-brand-800 dark:text-white truncate">
                                            {rep.firstName} {rep.lastName}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                            <EnvelopeIcon className="w-3 h-3" />
                                            <span className="truncate">{rep.email}</span>
                                        </div>
                                        {rep.phone && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <PhoneIcon className="w-3 h-3" />
                                                {rep.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <StatusBadge status={rep.isActive ? 'active' : 'inactive'} size="sm" />
                                    {rep.commission && (
                                        <span className="text-xs font-medium text-slate-500">
                                            {rep.commission.structure?.replace(/_/g, ' ')}
                                            {rep.commission.commissionPercentage > 0 && ` • ${rep.commission.commissionPercentage}%`}
                                        </span>
                                    )}
                                </div>

                                {rep.stats && (
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 p-2 bg-slate-50 dark:bg-brand-800/30 rounded-lg">
                                        <span>{rep.stats.totalOrders || 0} orders</span>
                                        <span>•</span>
                                        <span>${(rep.stats.totalRevenue || 0).toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 pt-3 border-t border-slate-100 dark:border-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setViewingRep(rep)} className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors" title="View">
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setEditingRep(rep); setShowForm(true); }} className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors" title="Edit">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setResetPasswordRep(rep)} className="p-2 text-slate-400 hover:text-gold-600 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors" title="Reset Password">
                                        <KeyIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setToggleRep({ id: rep.id, action: rep.isActive ? 'deactivate' : 'reactivate', name: `${rep.firstName} ${rep.lastName}` })}
                                        className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors ${rep.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                        title={rep.isActive ? 'Deactivate' : 'Reactivate'}
                                    >
                                        {rep.isActive ? <UserMinusIcon className="w-4 h-4" /> : <UserPlusIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <SalesRepFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingRep(null); }}
                rep={editingRep}
                onSuccess={(data) => {
                    queryClient.invalidateQueries(['sales-reps']);
                    setShowForm(false);
                    setEditingRep(null);
                    if (data?.data?.generatedPassword) {
                        setCredentials({ email: data.data.user.email, password: data.data.generatedPassword });
                    }
                }}
            />

            {/* View Details Modal */}
            <Modal isOpen={!!viewingRep} onClose={() => setViewingRep(null)} title="Sales Rep Details" size="md">
                {viewingRep && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center">
                                <span className="text-brand-700 dark:text-brand-200 font-bold text-2xl">{viewingRep.firstName?.[0]}{viewingRep.lastName?.[0]}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-brand-800 dark:text-white">{viewingRep.firstName} {viewingRep.lastName}</h3>
                                <StatusBadge status={viewingRep.isActive ? 'active' : 'inactive'} size="sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-slate-500">Email:</span> <span className="font-medium">{viewingRep.email}</span></div>
                            <div><span className="text-slate-500">Phone:</span> <span className="font-medium">{viewingRep.phone || 'N/A'}</span></div>
                            {viewingRep.commission && (
                                <>
                                    <div><span className="text-slate-500">Structure:</span> <span className="font-medium capitalize">{viewingRep.commission.structure?.replace(/_/g, ' ')}</span></div>
                                    {viewingRep.commission.baseSalary > 0 && <div><span className="text-slate-500">Salary:</span> <span className="font-medium">${viewingRep.commission.baseSalary}/mo</span></div>}
                                    {viewingRep.commission.commissionPercentage > 0 && <div><span className="text-slate-500">Commission:</span> <span className="font-medium">{viewingRep.commission.commissionPercentage}%</span></div>}
                                </>
                            )}
                            {viewingRep.stats && (
                                <>
                                    <div><span className="text-slate-500">Total Orders:</span> <span className="font-medium">{viewingRep.stats.totalOrders || 0}</span></div>
                                    <div><span className="text-slate-500">Revenue:</span> <span className="font-medium">${(viewingRep.stats.totalRevenue || 0).toLocaleString()}</span></div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Credentials Modal */}
            <CredentialsModal isOpen={!!credentials} onClose={() => setCredentials(null)} credentials={credentials} />

            {/* Reset Password Confirmation */}
            <Modal
                isOpen={!!resetPasswordRep}
                onClose={() => setResetPasswordRep(null)}
                title="Reset Password"
                subtitle={`Generate new password for ${resetPasswordRep?.firstName} ${resetPasswordRep?.lastName}`}
                size="sm"
                loading={resetMutation.isLoading}
                footer={
                    <>
                        <button onClick={() => setResetPasswordRep(null)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                        <button onClick={() => resetMutation.mutate(resetPasswordRep.id)} disabled={resetMutation.isLoading}
                            className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all font-semibold text-sm shadow-lg shadow-gold-500/25">
                            {resetMutation.isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </>
                }
            >
                <p className="text-slate-600 dark:text-slate-400">The old password will no longer work. A new secure password will be generated.</p>
            </Modal>

            {/* Toggle Active Confirmation */}
            <Modal
                isOpen={!!toggleRep}
                onClose={() => setToggleRep(null)}
                title={toggleRep?.action === 'deactivate' ? 'Deactivate Sales Rep' : 'Reactivate Sales Rep'}
                size="sm"
                loading={deleteMutation.isLoading}
                footer={
                    <>
                        <button onClick={() => setToggleRep(null)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                        <button onClick={() => deleteMutation.mutate(toggleRep)} disabled={deleteMutation.isLoading}
                            className={`px-6 py-2.5 text-white rounded-xl transition-all font-semibold text-sm shadow-lg ${toggleRep?.action === 'deactivate'
                                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-rose-500/25'
                                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/25'
                                }`}>
                            {deleteMutation.isLoading ? 'Processing...' : toggleRep?.action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
                        </button>
                    </>
                }
            >
                <p className="text-slate-600 dark:text-slate-400">
                    Are you sure you want to {toggleRep?.action} <strong>{toggleRep?.name}</strong>?
                </p>
            </Modal>
        </div>
    );
};

// Sales Rep Form Modal
const SalesRepFormModal = ({ isOpen, onClose, rep, onSuccess }) => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', commissionStructure: '', baseSalary: '', commissionPercentage: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (rep) {
            setForm({
                firstName: rep.firstName || '',
                lastName: rep.lastName || '',
                email: rep.email || '',
                phone: rep.phone || '',
                commissionStructure: rep.commission?.structure || '',
                baseSalary: rep.commission?.baseSalary?.toString() || '',
                commissionPercentage: rep.commission?.commissionPercentage?.toString() || '',
            });
        } else {
            setForm({ firstName: '', lastName: '', email: '', phone: '', commissionStructure: '', baseSalary: '', commissionPercentage: '' });
        }
        setErrors({});
    }, [rep, isOpen]);

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.lastName.trim()) errs.lastName = 'Required';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
        if (['salary_only', 'salary_plus_commission'].includes(form.commissionStructure) && (!form.baseSalary || parseFloat(form.baseSalary) <= 0)) errs.baseSalary = 'Required';
        if (['commission_only', 'salary_plus_commission'].includes(form.commissionStructure) && (!form.commissionPercentage || parseFloat(form.commissionPercentage) <= 0)) errs.commissionPercentage = 'Required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = {
                ...form,
                baseSalary: form.baseSalary ? parseFloat(form.baseSalary) : 0,
                commissionPercentage: form.commissionPercentage ? parseFloat(form.commissionPercentage) : 0,
            };
            const result = rep
                ? await salesRepService.updateSalesRep(rep.id, payload)
                : await salesRepService.createSalesRep(payload);
            onSuccess(result);
            toast.success(rep ? 'Updated successfully' : 'Created successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={rep ? 'Edit Sales Rep' : 'Add Sales Rep'}
            subtitle="Fill in the details below"
            loading={loading}
            footer={
                <>
                    <button onClick={onClose} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold text-sm shadow-lg shadow-brand-500/25 disabled:opacity-50">
                        {loading ? 'Saving...' : rep ? 'Update' : 'Create'}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="First Name" required error={errors.firstName}>
                        <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.firstName ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                    </FormField>
                    <FormField label="Last Name" required error={errors.lastName}>
                        <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.lastName ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                    </FormField>
                </div>
                <FormField label="Email" required error={errors.email}>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                </FormField>
                <FormField label="Phone">
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20" />
                </FormField>
                {!rep && (
                    <div className="p-4 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl">
                        <p className="text-sm text-gold-800 dark:text-gold-400">A secure password will be auto-generated. Share it securely with the rep.</p>
                    </div>
                )}
                <FormField label="Commission Structure">
                    <select value={form.commissionStructure} onChange={(e) => setForm({ ...form, commissionStructure: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white">
                        <option value="">None</option>
                        <option value="commission_only">Commission Only</option>
                        <option value="salary_only">Salary Only</option>
                        <option value="salary_plus_commission">Salary + Commission</option>
                    </select>
                </FormField>
                {['salary_only', 'salary_plus_commission'].includes(form.commissionStructure) && (
                    <FormField label="Base Salary ($/mo)" required error={errors.baseSalary}>
                        <input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.baseSalary ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                    </FormField>
                )}
                {['commission_only', 'salary_plus_commission'].includes(form.commissionStructure) && (
                    <FormField label="Commission %" required error={errors.commissionPercentage}>
                        <input type="number" step="0.1" value={form.commissionPercentage} onChange={(e) => setForm({ ...form, commissionPercentage: e.target.value })} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.commissionPercentage ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                    </FormField>
                )}
            </form>
        </Modal>
    );
};

// Form Field Helper
const FormField = ({ label, required, error, children }) => (
    <div>
        <label className="block text-xs font-semibold text-brand-800 dark:text-slate-200 mb-1.5">{label} {required && <span className="text-rose-500">*</span>}</label>
        {children}
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
);

// Credentials Modal
const CredentialsModal = ({ isOpen, onClose, credentials }) => {
    const [copied, setCopied] = useState({});

    const copy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [field]: true });
        setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Account Credentials" subtitle="Save these now - they won't be shown again" size="sm">
            {credentials && (
                <div className="space-y-4">
                    <div className="p-4 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl">
                        <p className="text-sm text-gold-800 dark:text-gold-400">⚠️ These credentials are shown only once.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-brand-800 rounded-xl">
                            <div>
                                <p className="text-xs text-slate-500">Email</p>
                                <p className="font-mono font-semibold text-brand-800 dark:text-white">{credentials.email}</p>
                            </div>
                            <button onClick={() => copy(credentials.email, 'email')} className="p-2 text-slate-400 hover:text-brand-600">
                                {copied.email ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> : <PencilIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-brand-800 rounded-xl">
                            <div>
                                <p className="text-xs text-slate-500">Password</p>
                                <p className="font-mono font-semibold text-brand-800 dark:text-white">{credentials.password}</p>
                            </div>
                            <button onClick={() => copy(credentials.password, 'password')} className="p-2 text-slate-400 hover:text-brand-600">
                                {copied.password ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> : <PencilIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default SalesRepManagement;