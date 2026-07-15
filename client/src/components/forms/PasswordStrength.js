import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const requirements = [
    { regex: /.{8,}/, label: 'At least 8 characters' },
    { regex: /[A-Z]/, label: 'One uppercase letter' },
    { regex: /[a-z]/, label: 'One lowercase letter' },
    { regex: /\d/, label: 'One number' },
    { regex: /[@$!%*?&#]/, label: 'One special character' }
];

const PasswordStrength = ({ password }) => {
    const getStrength = () => {
        const passed = requirements.filter(req => req.regex.test(password)).length;
        if (passed <= 2) return { level: 'Weak', color: 'bg-rose-500', width: '33%' };
        if (passed <= 4) return { level: 'Medium', color: 'bg-amber-500', width: '66%' };
        return { level: 'Strong', color: 'bg-emerald-500', width: '100%' };
    };

    const strength = getStrength();

    return (
        <div className="space-y-2">
            {password && (
                <div className="space-y-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            className={`h-full rounded-full ${strength.color}`}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className={`text-xs font-medium ${strength.level === 'Weak' ? 'text-rose-500' :
                            strength.level === 'Medium' ? 'text-amber-500' :
                                'text-emerald-500'
                        }`}>
                        {strength.level}
                    </p>
                </div>
            )}

            <div className="space-y-1">
                {requirements.map((req, index) => {
                    const isMet = req.regex.test(password);
                    return (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            {isMet ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                                <X className="h-3.5 w-3.5 text-gray-400" />
                            )}
                            <span className={isMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrength;