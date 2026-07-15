import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md', loading }) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw]',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 py-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={!loading ? onClose : undefined}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`relative bg-white dark:bg-brand-900 rounded-3xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}
                        >
                            {/* Header */}
                            <div className="flex-shrink-0 px-8 py-5 bg-gradient-to-r from-brand-800 to-brand-900">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{title}</h2>
                                        {subtitle && <p className="text-brand-200 text-sm mt-0.5">{subtitle}</p>}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={loading}
                                        className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition disabled:opacity-50"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8">{children}</div>

                            {/* Footer */}
                            {footer && (
                                <div className="flex-shrink-0 px-8 py-4 bg-slate-50 dark:bg-brand-800/50 border-t border-slate-200 dark:border-brand-700 flex justify-end gap-3 rounded-b-3xl">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;