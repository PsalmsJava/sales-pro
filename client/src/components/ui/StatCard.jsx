import React from 'react';
import { motion } from 'framer-motion';

const gradients = {
    navy: 'from-brand-700 to-brand-900',
    gold: 'from-gold-400 to-gold-600',
    teal: 'from-teal-500 to-teal-700',
    emerald: 'from-emerald-500 to-emerald-700',
    rose: 'from-rose-500 to-rose-700',
    purple: 'from-purple-500 to-purple-700',
    blue: 'from-blue-500 to-blue-700',
};

const StatCard = ({ label, value, icon: Icon, color = 'navy', subtitle, trend, loading, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        onClick={onClick}
        className={`bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card hover:shadow-elevated transition-all duration-300 p-5 ${onClick ? 'cursor-pointer' : ''}`}
    >
        {loading ? (
            <div className="animate-pulse space-y-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-brand-700 rounded" />
                        <div className="h-8 w-24 bg-slate-200 dark:bg-brand-700 rounded" />
                    </div>
                    <div className="h-12 w-12 bg-slate-200 dark:bg-brand-700 rounded-xl" />
                </div>
            </div>
        ) : (
            <>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {label}
                        </p>
                        <p className="text-3xl font-bold text-brand-800 dark:text-white mt-1">{value}</p>
                        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
                        {trend && (
                            <p className={`text-xs font-medium mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg shadow-${color}-500/25`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </>
        )}
    </motion.div>
);

export default StatCard;