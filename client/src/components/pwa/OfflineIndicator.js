import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showRestored, setShowRestored] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowRestored(true);
            setTimeout(() => setShowRestored(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {(!isOnline || showRestored) && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className={`fixed top-0 left-0 right-0 z-[100] ${isOnline ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-4 py-2">
                        <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                            {isOnline ? (
                                <>
                                    <Wifi className="h-4 w-4" />
                                    Internet connection restored
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-4 w-4" />
                                    You are offline. Some features may be limited.
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineIndicator;