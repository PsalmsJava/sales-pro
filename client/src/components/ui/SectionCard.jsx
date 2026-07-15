import React from 'react';
import { motion } from 'framer-motion';

const SectionCard = ({ title, subtitle, icon: Icon, children, actions, badge, className = '', headerGradient = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card overflow-hidden ${className}`}
    >
        {(title || actions) && (
            <div className={`px-6 py-4 border-b border-slate-100 dark:border-brand-700 flex items-center justify-between ${headerGradient ? 'bg-gradient-to-r from-brand-50 to-white dark:from-brand-800/50 dark:to-brand-900' : ''
                }`}>
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 rounded-xl bg-gradient-to-br from-brand-50 to-gold-50 dark:from-brand-800 dark:to-brand-700 ring-1 ring-brand-200 dark:ring-brand-600">
                            <Icon className="w-5 h-5 text-brand-600 dark:text-gold-400" />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-brand-800 dark:text-white">{title}</h3>
                            {badge && (
                                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400">
                                    {badge}
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </motion.div>
);

export default SectionCard;