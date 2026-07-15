import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300',
};

const CustomToast = ({ message, type = 'info', onClose }) => {
    const Icon = icons[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${colors[type]}`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default CustomToast;