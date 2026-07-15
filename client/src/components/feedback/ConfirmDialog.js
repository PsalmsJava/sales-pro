import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary', // primary, danger
    loading = false
}) => {
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
        danger: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${variant === 'danger'
                                    ? 'bg-rose-100 dark:bg-rose-900/30'
                                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                                }`}>
                                <AlertTriangle className={`h-6 w-6 ${variant === 'danger'
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-indigo-600 dark:text-indigo-400'
                                    }`} />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {message}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                {cancelText}
                            </button>

                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;