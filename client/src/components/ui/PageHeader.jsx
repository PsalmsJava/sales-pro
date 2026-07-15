import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ icon: Icon, title, description, actions, children }) => (
    <div className="bg-white/90 dark:bg-brand-900/90 backdrop-blur-md border-b border-slate-200 dark:border-brand-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="p-2.5 bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl shadow-lg shadow-brand-500/25"
                    >
                        <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h1 className="text-2xl font-bold text-brand-800 dark:text-white">{title}</h1>
                        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
                    </div>
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
            {children}
        </div>
    </div>
);

export default PageHeader;