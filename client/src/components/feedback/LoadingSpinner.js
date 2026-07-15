import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen = false, size = 'md', text = 'Loading...' }) => {
    const sizes = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
                className={`${sizes[size]} rounded-full border-4 border-gray-200 dark:border-gray-700`}
                style={{ borderTopColor: '#4F46E5' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-500 dark:text-gray-400 font-medium"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;