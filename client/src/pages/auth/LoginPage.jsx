import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, Layers, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Valid email required'),
    password: z.string().min(1, 'Password is required'),
});

const roles = [
    { role: 'admin', email: 'admin@salespro.com', label: 'Admin', color: 'from-brand-600 to-brand-800', icon: '🛡️' },
    { role: 'sales_rep', email: 'john.smith@salespro.com', label: 'Sales Rep', color: 'from-gold-500 to-gold-600', icon: '💼' },
    { role: 'dispatch_partner', email: 'dispatch1@speedexlogistics.com', label: 'Dispatch', color: 'from-teal-500 to-teal-600', icon: '🚚' },
];

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: 'admin@salespro.com', password: 'Password@123' }
    });

    const handleQuickLogin = (role) => {
        setSelectedRole(role.role);
        setValue('email', role.email);
        setValue('password', 'Password@123');
        setSelectedRole(null);
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const result = await login(data.email, data.password);
            toast.success(`Welcome back, ${result.user.firstName}!`);
            const routes = { admin: '/admin/dashboard', sales_rep: '/sales-rep/dashboard', dispatch_partner: '/dispatch/dashboard' };
            navigate(routes[result.user.role] || '/login', { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div animate={{ x: [0, 100, 0], y: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
                <motion.div animate={{ x: [0, -80, 0], y: [0, 80, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/3 rounded-full blur-3xl" />
            </div>

            {/* Left Brand Panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="absolute top-20 left-0 right-0 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-3 mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-2xl shadow-gold-500/30">
                            <Layers className="h-7 w-7 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">SalesPro</h1>
                            <p className="text-gold-400 text-sm font-medium tracking-wider uppercase">Enterprise</p>
                        </div>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="text-brand-200 text-lg max-w-sm mx-auto">
                        Powerful inventory & sales management for modern businesses
                    </motion.p>
                </div>
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="absolute bottom-20 left-12 right-12 space-y-3">
                    {[
                        { icon: '📊', text: 'Real-time analytics & insights' },
                        { icon: '🤝', text: 'Sales team & commission management' },
                        { icon: '🚚', text: 'Dispatch & delivery tracking' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-brand-200 bg-white/5 rounded-xl px-4 py-3 backdrop-blur-sm">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm">{item.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Right Login Panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="w-full max-w-md">
                    {/* Theme Toggle */}
                    <div className="flex justify-end mb-6">
                        <button onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-800 transition-colors">
                            {isDark ? <Sun className="w-5 h-5 text-gold-500" /> : <Moon className="w-5 h-5 text-brand-600" />}
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-brand-800 dark:text-white">Welcome Back</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account to continue</p>
                    </div>

                    {/* Quick Role Selection */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {roles.map((role) => (
                            <motion.button key={role.role} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => handleQuickLogin(role)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${selectedRole === role.role ? 'border-brand-500 bg-brand-50 dark:bg-brand-800/30' : 'border-slate-200 dark:border-brand-700 hover:border-slate-300'}`}>
                                <span className="text-xl block mb-1">{role.icon}</span>
                                <span className="text-xs font-semibold text-brand-800 dark:text-white">{role.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-brand-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="email" {...register('email')}
                                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-sm transition-all ${errors.email ? 'border-rose-300 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-200 dark:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
                                        } dark:bg-brand-800 dark:text-white`}
                                    placeholder="you@company.com" />
                            </div>
                            {errors.email && <p className="text-xs text-rose-600 mt-1.5">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-brand-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type={showPassword ? 'text' : 'password'} {...register('password')}
                                    className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl text-sm transition-all ${errors.password ? 'border-rose-300 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-200 dark:border-brand-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
                                        } dark:bg-brand-800 dark:text-white`}
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-brand-700 rounded-lg">
                                    {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-rose-600 mt-1.5">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                                <span className="text-slate-500 dark:text-slate-400">Remember me</span>
                            </label>
                            <button type="button" className="text-brand-600 dark:text-gold-400 font-medium hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        <motion.button type="submit" disabled={isLoading}
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            className="w-full py-3.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl font-bold text-sm hover:from-brand-800 hover:to-brand-950 transition-all shadow-xl shadow-brand-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                            ) : (
                                <><LogIn className="w-5 h-5" /> Sign In</>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Default password for all accounts: <span className="font-mono font-bold text-brand-600 dark:text-gold-400">Password@123</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;