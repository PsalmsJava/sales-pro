import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        // Log to your error reporting service
        console.error('Error Boundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 mb-4">
                            <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-left">
                                <p className="text-sm font-mono text-rose-600 dark:text-rose-400 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Go Home
                            </button>

                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;