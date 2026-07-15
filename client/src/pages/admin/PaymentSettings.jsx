import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    CreditCard, Building2, DollarSign, ToggleLeft, ToggleRight,
    Shield, Key, FileText, RefreshCw, Download, ExternalLink,
    CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../../services/paymentService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const PaymentSettings = () => {
    const [toggling, setToggling] = useState(null);
    const [page, setPage] = useState(1);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const queryClient = useQueryClient();

    const { data: config, isLoading: configLoading } = useQuery({
        queryKey: ['payment-config'],
        queryFn: paymentService.getPaymentConfig
    });

    const { data: transactions, isLoading: txLoading } = useQuery({
        queryKey: ['payment-transactions', { page }],
        queryFn: () => paymentService.getTransactionHistory({ page, limit: 10 })
    });

    const toggleMutation = useMutation({
        mutationFn: ({ method, enabled }) => paymentService.togglePaymentMethod(method, enabled),
        onSuccess: () => {
            toast.success('Payment method updated');
            queryClient.invalidateQueries(['payment-config']);
            setToggling(null);
        },
        onError: () => { toast.error('Failed to update'); setToggling(null); }
    });

    const stats = {
        totalTransactions: transactions?.pagination?.total || 0,
        successful: transactions?.data?.filter(t => t.status === 'successful').length || 0,
        failed: transactions?.data?.filter(t => t.status === 'failed').length || 0,
        totalVolume: transactions?.data?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0,
    };

    return (
        <div className="space-y-6">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <CreditCard className="w-8 h-8 text-gold-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">Payment Settings</h1>
                        <p className="text-brand-200 text-sm mt-1">Manage payment methods, API keys, and view transactions</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Transactions" value={stats.totalTransactions} icon={FileText} color="navy" loading={txLoading} />
                <StatCard label="Successful" value={stats.successful} icon={CheckCircle} color="emerald" loading={txLoading} />
                <StatCard label="Failed" value={stats.failed} icon={XCircle} color="rose" loading={txLoading} />
                <StatCard label="Total Volume" value={`$${stats.totalVolume.toLocaleString()}`} icon={DollarSign} color="gold" loading={txLoading} />
            </div>

            {/* Payment Methods Toggle */}
            <SectionCard title="Payment Methods" subtitle="Enable or disable payment options" icon={CreditCard}>
                <div className="space-y-4">
                    <ToggleRow
                        icon={CreditCard}
                        iconBg="bg-brand-100 dark:bg-brand-800"
                        iconColor="text-brand-600"
                        title="Online Payment"
                        description="Paystack & Flutterwave integration"
                        tags={['Paystack', 'Flutterwave']}
                        enabled={config?.onlineEnabled}
                        loading={configLoading}
                        onToggle={() => setToggling('online')}
                    />
                    <ToggleRow
                        icon={DollarSign}
                        iconBg="bg-teal-100 dark:bg-teal-900/30"
                        iconColor="text-teal-600"
                        title="Pay on Delivery"
                        description="Cash or card payment upon delivery"
                        enabled={config?.deliveryEnabled}
                        loading={configLoading}
                        onToggle={() => setToggling('delivery')}
                    />
                </div>
            </SectionCard>

            {/* Gateway Configuration */}
            <SectionCard title="Payment Gateway Configuration" subtitle="API keys and webhook endpoints" icon={Key}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GatewayCard
                        name="Paystack"
                        color="purple"
                        publicKey="pk_test_••••••••••••••••"
                        webhookUrl="/api/payments/webhook/paystack"
                        status="active"
                        onManage={() => setShowKeyModal(true)}
                    />
                    <GatewayCard
                        name="Flutterwave"
                        color="teal"
                        publicKey="FLWPUBK_TEST_••••••••••••••••"
                        webhookUrl="/api/payments/webhook/flutterwave"
                        status="active"
                        onManage={() => setShowKeyModal(true)}
                    />
                </div>
            </SectionCard>

            {/* Transaction History */}
            <SectionCard title="Transaction History" subtitle="Recent payment transactions" icon={FileText}
                badge={`${transactions?.pagination?.total || 0} total`}
                actions={
                    <button className="text-sm text-brand-600 dark:text-gold-400 font-medium flex items-center gap-1 hover:underline">
                        <Download className="w-4 h-4" /> Export
                    </button>
                }>
                {txLoading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="animate-pulse h-12 bg-slate-200 dark:bg-brand-700 rounded-xl" />)}</div>
                ) : (!transactions?.data || transactions.data.length === 0) ? (
                    <EmptyState icon={FileText} title="No transactions yet" description="Payment transactions will appear here." />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-brand-700">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-brand-800/30">
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Reference</th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Provider</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-brand-700">
                                    {transactions.data.map((tx, idx) => (
                                        <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-brand-50/30 dark:hover:bg-brand-800/20 transition-colors">
                                            <td className="px-4 py-4 text-sm font-mono text-brand-600 dark:text-gold-400">{tx.reference}</td>
                                            <td className="px-4 py-4 text-sm capitalize font-medium">{tx.provider}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-right">${parseFloat(tx.amount).toFixed(2)}</td>
                                            <td className="px-4 py-4 text-center"><StatusBadge status={tx.status} size="sm" /></td>
                                            <td className="px-4 py-4 text-xs text-slate-500 text-right">{new Date(tx.created_at).toLocaleDateString()}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={transactions?.pagination} onPageChange={setPage} />
                    </>
                )}
            </SectionCard>

            {/* Toggle Confirmation Modal */}
            <Modal
                isOpen={!!toggling}
                onClose={() => setToggling(null)}
                title={config?.[toggling === 'online' ? 'onlineEnabled' : 'deliveryEnabled'] ? 'Disable Payment Method' : 'Enable Payment Method'}
                size="sm"
                loading={toggleMutation.isLoading}
                footer={
                    <>
                        <button onClick={() => setToggling(null)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                        <button
                            onClick={() => toggleMutation.mutate({ method: toggling, enabled: toggling === 'online' ? !config?.onlineEnabled : !config?.deliveryEnabled })}
                            disabled={toggleMutation.isLoading}
                            className={`px-6 py-2.5 text-white rounded-xl transition-all font-semibold text-sm shadow-lg ${config?.[toggling === 'online' ? 'onlineEnabled' : 'deliveryEnabled']
                                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 shadow-rose-500/25'
                                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-emerald-500/25'
                                }`}>
                            {toggleMutation.isLoading ? 'Updating...' : config?.[toggling === 'online' ? 'onlineEnabled' : 'deliveryEnabled'] ? 'Disable' : 'Enable'}
                        </button>
                    </>
                }>
                <p className="text-slate-600 dark:text-slate-400">
                    Are you sure you want to <strong>{config?.[toggling === 'online' ? 'onlineEnabled' : 'deliveryEnabled'] ? 'disable' : 'enable'}</strong> {toggling === 'online' ? 'online payments' : 'pay on delivery'}?
                </p>
            </Modal>
        </div>
    );
};

// Sub-components
const ToggleRow = ({ icon: Icon, iconBg, iconColor, title, description, tags, enabled, loading, onToggle }) => (
    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-brand-800/50 rounded-2xl border border-slate-200 dark:border-brand-700 hover:border-slate-300 dark:hover:border-brand-600 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
                <p className="font-semibold text-brand-800 dark:text-white">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
                {tags && (
                    <div className="flex gap-2 mt-1.5">
                        {tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-white dark:bg-brand-700 text-slate-500 rounded-full font-medium border border-slate-200 dark:border-brand-600">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <button onClick={onToggle} disabled={loading} className="relative">
            {loading ? (
                <div className="h-8 w-14 bg-slate-200 dark:bg-brand-700 rounded-full animate-pulse" />
            ) : enabled ? (
                <ToggleRight className="h-8 w-14 text-emerald-500" />
            ) : (
                <ToggleLeft className="h-8 w-14 text-slate-300" />
            )}
        </button>
    </div>
);

const GatewayCard = ({ name, color, publicKey, webhookUrl, status, onManage }) => (
    <div className="p-5 bg-slate-50 dark:bg-brand-800/50 rounded-2xl border border-slate-200 dark:border-brand-700">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Building2 className={`w-6 h-6 text-${color}-600`} />
                <div>
                    <h4 className="font-semibold text-brand-800 dark:text-white">{name}</h4>
                    <StatusBadge status={status} label="Active" size="sm" />
                </div>
            </div>
            <button onClick={onManage} className="text-xs text-brand-600 dark:text-gold-400 font-medium hover:underline">Manage</button>
        </div>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-slate-500">Public Key</span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{publicKey}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-500">Webhook URL</span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{webhookUrl}</span>
            </div>
        </div>
    </div>
);

export default PaymentSettings;