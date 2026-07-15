import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ icon: Icon, title, description, action, actionLabel, searchTerm, hasFilters, onClear }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 px-6"
    >
        <div className="w-24 h-24 bg-slate-100 dark:bg-brand-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Icon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-brand-800 dark:text-white">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">{description}</p>
        {(searchTerm || hasFilters) ? (
            <button
                onClick={onClear}
                className="mt-4 text-brand-600 hover:text-brand-700 dark:text-gold-400 font-medium text-sm transition-colors"
            >
                Clear all filters
            </button>
        ) : action && (
            <button
                onClick={action}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold shadow-lg shadow-brand-500/25 inline-flex items-center gap-2"
            >
                <PlusIcon className="w-5 h-5" />
                {actionLabel}
            </button>
        )}
    </motion.div>
);

export default EmptyState;