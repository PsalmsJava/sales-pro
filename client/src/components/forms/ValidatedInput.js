import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ValidatedInput = forwardRef(({
    label,
    name,
    type = 'text',
    error,
    required = false,
    disabled = false,
    placeholder,
    icon: Icon,
    autoComplete,
    className = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="space-y-1">
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className={`h-5 w-5 ${error
                                ? 'text-rose-400'
                                : isFocused
                                    ? 'text-indigo-500'
                                    : 'text-gray-400'
                            }`} />
                    </div>
                )}

                <input
                    ref={ref}
                    id={name}
                    name={name}
                    type={inputType}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`
            block w-full rounded-lg border px-3 py-2.5
            ${Icon ? 'pl-10' : 'pl-3'}
            ${isPassword ? 'pr-10' : 'pr-3'}
            transition-colors duration-200
            ${error
                            ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-500 focus:border-rose-500'
                            : 'border-gray-300 bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                        }
            dark:bg-gray-800 dark:text-gray-100
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${className}
          `}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        )}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="flex items-center gap-1.5 text-rose-500 text-sm"
                    >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;