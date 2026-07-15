import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after 30 seconds
            setTimeout(() => {
                const dismissed = localStorage.getItem('installPromptDismissed');
                if (!dismissed) {
                    setShowPrompt(true);
                }
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('[PWA] User accepted install');
            setIsInstalled(true);
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('installPromptDismissed', 'true');

        // Reset after 7 days
        setTimeout(() => {
            localStorage.removeItem('installPromptDismissed');
        }, 7 * 24 * 60 * 60 * 1000);
    };

    if (isInstalled) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <Smartphone className="h-6 w-6 text-indigo-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Install SalesPro
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Install on your device for quick access and offline use
                                </p>

                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={handleInstall}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        Install
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                                    >
                                        Not now
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPrompt;