import React from 'react';
import { motion } from 'framer-motion';

const statusStyles = {
    // Stock statuses
    in_stock: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    low_stock: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    out_of_stock: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    limited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',

    // Order statuses
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    processing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    dispatched: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const StatusBadge = ({ status, label, size = 'sm', animated = true }) => {
    const styles = statusStyles[status] || 'bg-gray-100 text-gray-800';

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    const Component = animated ? motion.span : 'span';
    const animationProps = animated ? {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', stiffness: 300 }
    } : {};

    return (
        <Component
            {...animationProps}
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeStyles[size]} ${styles}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'in_stock' || status === 'delivered' || status === 'completed' ? 'bg-emerald-500' :
                    status === 'out_of_stock' || status === 'cancelled' ? 'bg-rose-500' :
                        'bg-current'
                }`} />
            {label || status}
        </Component>
    );
};

export default StatusBadge;