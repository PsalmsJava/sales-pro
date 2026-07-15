import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto mb-6"
                >
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 rounded-full" />
                    <div className="w-16 h-16 border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full -mt-16" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-500 dark:text-gray-400 font-medium"
                >
                    Loading application...
                </motion.p>
            </div>
        </div>
    );
};

export default PageLoader;