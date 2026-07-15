import React from 'react';

const variants = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    inactive: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    assigned: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    processing: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800',
    dispatched: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    completed: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',
    cancelled: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800',
    in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
    out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    successful: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const StatusBadge = ({ status, label, size = 'sm' }) => {
    const variant = variants[status] || variants.pending;
    const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${sizeClasses} ${variant}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${['active', 'delivered', 'completed', 'in_stock', 'paid', 'successful'].includes(status)
                    ? 'bg-emerald-500'
                    : ['cancelled', 'inactive', 'out_of_stock', 'failed'].includes(status)
                        ? 'bg-rose-500'
                        : 'bg-current'
                }`} />
            {label || status?.replace(/_/g, ' ')}
        </span>
    );
};

export default StatusBadge;