import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    UsersIcon, PlusIcon, PencilIcon, MagnifyingGlassIcon,
    EnvelopeIcon, PhoneIcon, CheckCircleIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { UserPlus, UserX, UserCheck, Shield, Eye, Crown, Package, Truck, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';

export const ROLES = [
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Platform admin. Full access including user management and permanent deletes.' },
    { value: 'manager', label: 'Manager', icon: Crown, description: 'General Manager. Second only to admin — full access except managing users and permanent deletes.' },
    { value: 'head_of_sales', label: 'Head of Sales', icon: ShoppingCart, description: 'Manages sales reps, views and assigns all orders. No product management.' },
    { value: 'inventory_manager', label: 'Inventory Manager', icon: Package, description: 'Handles products only — create, edit, and soft-delete. No permanent deletes.' },
    { value: 'sales_rep', label: 'Sales Rep', icon: UserCheck, description: 'Sales representative. Works assigned orders and earns commissions.' },
    { value: 'dispatch_partner', label: 'Logistics (Dispatch)', icon: Truck, description: 'Dispatch partner. Handles deliveries.' },
];

const roleMeta = (role) => ROLES.find(r => r.value === role) || { label: role, icon: Shield, description: '' };

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [toggleUser, setToggleUser] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => userService.getAllUsers()
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }) => userService.updateUser(id, { isActive }),
        onSuccess: () => {
            toast.success('User status updated');
            queryClient.invalidateQueries(['users']);
            setToggleUser(null);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update status'),
    });

    const filteredUsers = (users || []).filter(u => {
        const matchesSearch = !search || [u.firstName, u.lastName, u.email]
            .some(f => f?.toLowerCase().includes(search.toLowerCase()));
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: (users || []).length,
        active: (users || []).filter(u => u.isActive).length,
        inactive: (users || []).filter(u => !u.isActive).length,
        admins: (users || []).filter(u => ['admin', 'manager'].includes(u.role)).length,
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon={ShieldCheckIcon}
                title="User Management"
                description="Create accounts and assign roles — Admin, Manager, Head of Sales, Inventory Manager, and more"
                actions={
                    <button
                        onClick={() => { setEditingUser(null); setShowForm(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold shadow-lg shadow-brand-500/25 text-sm"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add User
                    </button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.total} icon={UsersIcon} color="navy" loading={isLoading} />
                <StatCard label="Active" value={stats.active} icon={UserCheck} color="emerald" loading={isLoading} />
                <StatCard label="Inactive" value={stats.inactive} icon={UserX} color="rose" loading={isLoading} />
                <StatCard label="Admins & Managers" value={stats.admins} icon={Shield} color="gold" loading={isLoading} />
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-900 border border-slate-200 dark:border-brand-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm shadow-card"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 border border-slate-200 dark:border-brand-700 rounded-2xl text-sm bg-white dark:bg-brand-900 text-slate-600 dark:text-slate-400 shadow-card"
                >
                    <option value="all">All Roles</option>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
            </div>

            {/* Users Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 p-5 h-48" />
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <EmptyState
                    icon={UsersIcon}
                    title="No users found"
                    description={search || roleFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first team member.'}
                    searchTerm={search}
                    onClear={() => { setSearch(''); setRoleFilter('all'); }}
                    action={() => { setEditingUser(null); setShowForm(true); }}
                    actionLabel="Add User"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((u, idx) => {
                        const meta = roleMeta(u.role);
                        const RoleIcon = meta.icon;
                        const isSelf = u.id === currentUser?.id;
                        return (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                whileHover={{ y: -3 }}
                                className="group bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card overflow-hidden hover:shadow-elevated hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300"
                            >
                                <div className={`h-1.5 ${u.role === 'admin' ? 'bg-gradient-to-r from-gold-500 to-gold-600' : u.role === 'manager' ? 'bg-gradient-to-r from-brand-600 to-brand-800' : 'bg-gradient-to-r from-teal-500 to-teal-700'}`} />
                                <div className="p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center flex-shrink-0">
                                            <span className="text-brand-700 dark:text-brand-200 font-bold text-lg">
                                                {u.firstName?.[0]}{u.lastName?.[0]}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-brand-800 dark:text-white truncate">
                                                {u.firstName} {u.lastName} {isSelf && <span className="text-xs text-gold-500 font-normal">(You)</span>}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                <EnvelopeIcon className="w-3 h-3" />
                                                <span className="truncate">{u.email}</span>
                                            </div>
                                            {u.phone && (
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <PhoneIcon className="w-3 h-3" />
                                                    {u.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 dark:bg-brand-800 text-brand-700 dark:text-gold-300">
                                            <RoleIcon className="w-3.5 h-3.5" /> {meta.label}
                                        </span>
                                        <StatusBadge status={u.isActive ? 'active' : 'inactive'} size="sm" />
                                    </div>

                                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{meta.description}</p>

                                    <div className="flex items-center gap-1 pt-3 border-t border-slate-100 dark:border-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingUser(u); setShowForm(true); }}
                                            className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors"
                                            title="Edit User"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        {!isSelf && (
                                            <button
                                                onClick={() => setToggleUser({ id: u.id, isActive: u.isActive, name: `${u.firstName} ${u.lastName}` })}
                                                className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors ${u.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                                title={u.isActive ? 'Deactivate' : 'Reactivate'}
                                            >
                                                {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            <UserFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingUser(null); }}
                user={editingUser}
                isSelf={editingUser?.id === currentUser?.id}
                onSuccess={(data, isNew) => {
                    queryClient.invalidateQueries(['users']);
                    setShowForm(false);
                    setEditingUser(null);
                    if (isNew && data?.email) {
                        setCredentials(data);
                    }
                }}
            />

            {/* Toggle Confirmation */}
            <Modal
                isOpen={!!toggleUser}
                onClose={() => setToggleUser(null)}
                title={toggleUser?.isActive ? 'Deactivate User' : 'Reactivate User'}
                size="sm"
                loading={toggleMutation.isLoading}
                footer={
                    <>
                        <button onClick={() => setToggleUser(null)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                        <button
                            onClick={() => toggleMutation.mutate({ id: toggleUser.id, isActive: !toggleUser.isActive })}
                            disabled={toggleMutation.isLoading}
                            className={`px-6 py-2.5 text-white rounded-xl transition-all font-semibold text-sm shadow-lg ${toggleUser?.isActive
                                ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-rose-500/25'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/25'
                                }`}>
                            {toggleMutation.isLoading ? 'Processing...' : toggleUser?.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                    </>
                }
            >
                <p className="text-slate-600 dark:text-slate-400">
                    Are you sure you want to {toggleUser?.isActive ? 'deactivate' : 'reactivate'} <strong>{toggleUser?.name}</strong>?
                    {toggleUser?.isActive && ' They will no longer be able to log in.'}
                </p>
            </Modal>

            {/* Credentials Modal */}
            <CredentialsModal isOpen={!!credentials} onClose={() => setCredentials(null)} credentials={credentials} />
        </div>
    );
};

// Create/Edit User Modal
const UserFormModal = ({ isOpen, onClose, user, isSelf, onSuccess }) => {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'sales_rep', isActive: true });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName || '', lastName: user.lastName || '',
                email: user.email || '', phone: user.phone || '',
                password: '', role: user.role || 'sales_rep',
                isActive: user.isActive !== undefined ? user.isActive : true,
            });
        } else {
            setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'sales_rep', isActive: true });
        }
        setErrors({});
    }, [user, isOpen]);

    const validate = () => {
        const errs = {};
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.lastName.trim()) errs.lastName = 'Required';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
        if (!user && !form.password) errs.password = 'Required';
        if (!user && form.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/.test(form.password)) {
            errs.password = 'Min 8 chars with uppercase, lowercase, number & special char';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const selectedRole = ROLES.find(r => r.value === form.role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            if (user) {
                const payload = {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    role: form.role,
                };
                if (!isSelf) payload.isActive = form.isActive;
                await userService.updateUser(user.id, payload);
                toast.success('User updated');
                onSuccess(null, false);
            } else {
                const created = await userService.createUser({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phone: form.phone || undefined,
                    password: form.password,
                    role: form.role,
                });
                toast.success('User created');
                onSuccess({ ...created, email: form.email, password: form.password }, true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? 'Edit User' : 'Add User'}
            subtitle={user ? 'Update account details and role' : 'Create an account and assign a role'}
            size="lg"
            loading={loading}
            footer={
                <>
                    <button onClick={onClose} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold text-sm shadow-lg shadow-brand-500/25 disabled:opacity-50">
                        {loading ? 'Saving...' : user ? 'Save Changes' : 'Create User'}
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Email" required error={errors.email}>
                        <input type="email" value={form.email} disabled={!!user} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60`} />
                    </FormField>
                    <FormField label="Phone">
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20" />
                    </FormField>
                </div>
                {!user && (
                    <FormField label="Password" required error={errors.password} hint="Min 8 characters with uppercase, lowercase, number and special character">
                        <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="e.g. Passw0rd@123" className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.password ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                    </FormField>
                )}

                {/* Role Assignment */}
                <FormField label="Role" required hint={selectedRole?.description}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ROLES.map((r) => {
                            const RoleIcon = r.icon;
                            const selected = form.role === r.value;
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    disabled={isSelf && r.value !== user?.role}
                                    onClick={() => setForm({ ...form, role: r.value })}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${selected
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-800/50 dark:border-gold-500'
                                        : 'border-slate-200 dark:border-brand-700 hover:border-brand-300'
                                        }`}>
                                    <RoleIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selected ? 'text-brand-600 dark:text-gold-400' : 'text-slate-400'}`} />
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold ${selected ? 'text-brand-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{r.label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </FormField>

                {user && !isSelf && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brand-800/30 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-brand-800 dark:text-white">Account Status</p>
                            <p className="text-xs text-slate-500">{form.isActive ? 'User can log in and access their dashboard' : 'User cannot log in'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${form.isActive ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                            {form.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                    </div>
                )}
            </form>
        </Modal>
    );
};

const FormField = ({ label, required, error, hint, children }) => (
    <div>
        <label className="block text-xs font-semibold text-brand-800 dark:text-slate-200 mb-1.5">{label} {required && <span className="text-rose-500">*</span>}</label>
        {children}
        {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        {error && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">{error}</p>}
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
        <Modal isOpen={isOpen} onClose={onClose} title="Account Created" subtitle="Save these now - they won't be shown again" size="sm">
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
                                {copied.email ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> : <EnvelopeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-brand-800 rounded-xl">
                            <div>
                                <p className="text-xs text-slate-500">Password</p>
                                <p className="font-mono font-semibold text-brand-800 dark:text-white">{credentials.password}</p>
                            </div>
                            <button onClick={() => copy(credentials.password, 'password')} className="p-2 text-slate-400 hover:text-brand-600">
                                {copied.password ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default UserManagement;
