import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Truck, Building2, User, Phone, Mail, MapPin, Car, FileText,
    Lock, Shield, ArrowRight, Check, Star, ChevronLeft, Eye, EyeOff,
    BadgeCheck, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const registerSchema = z.object({
    companyName: z.string().min(2, 'Company name is required'),
    contactPerson: z.string().min(2, 'Contact person is required'),
    contactPhone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    vehicleType: z.string().optional(),
    licenseNumber: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

const benefits = [
    { icon: DollarSign, text: 'Earn 80% per delivery' },
    { icon: Clock, text: 'Flexible working hours' },
    { icon: Shield, text: 'Verified & trusted platform' },
    { icon: Star, text: 'Regular payouts' },
];

const steps = [
    { num: 1, label: 'Company' },
    { num: 2, label: 'Contact' },
    { num: 3, label: 'Location' },
    { num: 4, label: 'Security' },
];

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            companyName: '', contactPerson: '', contactPhone: '', email: '',
            password: '', confirmPassword: '', address: '', city: '', state: '',
            vehicleType: '', licenseNumber: ''
        }
    });

    const watchPassword = watch('password');

    const getPasswordStrength = () => {
        let score = 0;
        if (watchPassword?.length >= 8) score++;
        if (/[A-Z]/.test(watchPassword)) score++;
        if (/[a-z]/.test(watchPassword)) score++;
        if (/[0-9]/.test(watchPassword)) score++;
        if (/[^A-Za-z0-9]/.test(watchPassword)) score++;
        if (score <= 2) return { level: 'Weak', color: 'rose', width: '33%' };
        if (score <= 4) return { level: 'Good', color: 'amber', width: '66%' };
        return { level: 'Strong', color: 'emerald', width: '100%' };
    };

    const passwordStrength = getPasswordStrength();

    const validateStep = async (currentStep) => {
        const fieldsByStep = {
            1: ['companyName'],
            2: ['contactPerson', 'contactPhone', 'email'],
            3: ['address', 'city', 'state'],
            4: ['password', 'confirmPassword'],
        };
        const result = await trigger(fieldsByStep[currentStep]);
        return result;
    };

    const handleNext = async () => {
        const isValid = await validateStep(step);
        if (isValid) setStep(prev => Math.min(prev + 1, 4));
    };

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await api.post('/dispatch/register', {
                companyName: data.companyName,
                contactPerson: data.contactPerson,
                contactPhone: data.contactPhone,
                email: data.email,
                password: data.password,
                address: data.address,
                city: data.city,
                state: data.state,
                vehicleType: data.vehicleType,
                licenseNumber: data.licenseNumber,
            });
            setRegistrationComplete(true);
            toast.success('Registration submitted successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (registrationComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-brand-50 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950 p-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-white dark:bg-brand-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                        className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
                        <BadgeCheck className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-extrabold text-brand-800 dark:text-white mb-2">Application Submitted! 🎉</h1>
                    <p className="text-slate-500 mb-2">Your dispatch partner registration has been received.</p>
                    <p className="text-slate-500 mb-6">Our team will review your application and verify your account. You'll receive an email once approved.</p>
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 mb-6">
                        <p className="text-sm text-teal-700 dark:text-teal-300">⏳ Verification usually takes 24-48 hours.</p>
                    </div>
                    <button onClick={() => navigate('/login')}
                        className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all shadow-xl">
                        Go to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950">
            {/* Top Bar */}
            <div className="bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-brand-800 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-brand-800 dark:text-white">DispatchPro</span>
                    </Link>
                    <Link to="/login" className="text-sm text-slate-500 hover:text-teal-600 transition-colors font-medium">
                        Already registered? <span className="text-teal-600">Sign In</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 mb-4 shadow-lg shadow-teal-500/30">
                        <Truck className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-brand-800 dark:text-white">Become a Dispatch Partner</h1>
                    <p className="text-slate-500 mt-2">Join our delivery network and start earning</p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {benefits.map((benefit, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-brand-900 rounded-xl border border-slate-200 dark:border-brand-700 p-3 text-center">
                            <benefit.icon className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{benefit.text}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${step > s.num ? 'bg-emerald-500 text-white' : step === s.num ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-brand-800 text-slate-400'
                                }`}>
                                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                            </div>
                            <span className={`text-xs font-medium hidden sm:block ${step === s.num ? 'text-teal-600' : 'text-slate-400'}`}>{s.label}</span>
                            {i < 3 && <div className={`w-6 h-0.5 rounded-full ${step > s.num ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 p-6 lg:p-8">

                    <AnimatePresence mode="wait">
                        {/* Step 1: Company */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="text-lg font-bold text-brand-800 dark:text-white flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-teal-600" /> Company Information
                                </h3>
                                <FormField label="Company Name" required error={errors.companyName?.message}>
                                    <input {...register('companyName')} placeholder="Your delivery company name"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.companyName ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                </FormField>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Vehicle Type">
                                        <select {...register('vehicleType')} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white">
                                            <option value="">Select type</option>
                                            <option value="motorcycle">Motorcycle</option>
                                            <option value="car">Car</option>
                                            <option value="van">Van</option>
                                            <option value="truck">Truck</option>
                                            <option value="bicycle">Bicycle</option>
                                        </select>
                                    </FormField>
                                    <FormField label="License Number">
                                        <input {...register('licenseNumber')} placeholder="DL-XXXXXX"
                                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20" />
                                    </FormField>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Contact */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="text-lg font-bold text-brand-800 dark:text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-teal-600" /> Contact Information
                                </h3>
                                <FormField label="Contact Person" required error={errors.contactPerson?.message}>
                                    <input {...register('contactPerson')} placeholder="Full name"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.contactPerson ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                </FormField>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Phone" required error={errors.contactPhone?.message}>
                                        <input {...register('contactPhone')} type="tel" placeholder="+234..."
                                            className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.contactPhone ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                    </FormField>
                                    <FormField label="Email" required error={errors.email?.message}>
                                        <input {...register('email')} type="email" placeholder="you@company.com"
                                            className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                    </FormField>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Location */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="text-lg font-bold text-brand-800 dark:text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-teal-600" /> Location
                                </h3>
                                <FormField label="Address" required error={errors.address?.message}>
                                    <input {...register('address')} placeholder="Street address"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.address ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                </FormField>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="City" required error={errors.city?.message}>
                                        <input {...register('city')}
                                            className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.city ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                    </FormField>
                                    <FormField label="State" required error={errors.state?.message}>
                                        <input {...register('state')}
                                            className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.state ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                    </FormField>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Security */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="text-lg font-bold text-brand-800 dark:text-white flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-teal-600" /> Account Security
                                </h3>
                                <FormField label="Password" required error={errors.password?.message}>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Create a strong password"
                                            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl text-sm ${errors.password ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-brand-700 rounded-lg">
                                            {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                                        </button>
                                    </div>
                                    {watchPassword && (
                                        <div className="mt-2">
                                            <div className="h-1.5 bg-slate-200 dark:bg-brand-700 rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: passwordStrength.width }}
                                                    className={`h-full rounded-full bg-${passwordStrength.color}-500`} />
                                            </div>
                                            <p className={`text-xs mt-1 text-${passwordStrength.color}-600 font-medium`}>{passwordStrength.level}</p>
                                        </div>
                                    )}
                                </FormField>
                                <FormField label="Confirm Password" required error={errors.confirmPassword?.message}>
                                    <input type="password" {...register('confirmPassword')} placeholder="Re-enter password"
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.confirmPassword ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-teal-500/20`} />
                                </FormField>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-brand-700">
                        {step > 1 && (
                            <button onClick={handleBack}
                                className="flex-1 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors flex items-center justify-center gap-2">
                                <ChevronLeft className="w-5 h-5" /> Back
                            </button>
                        )}
                        {step < 4 ? (
                            <button onClick={handleNext}
                                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2">
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit(onSubmit)} disabled={isLoading}
                                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                                {isLoading ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                                ) : (
                                    <><BadgeCheck className="w-5 h-5" /> Submit Application</>
                                )}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const FormField = ({ label, required, error, children }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
    </div>
);

// Need to import these
import { DollarSign, Clock as ClockIcon } from 'lucide-react';
const AlertTriangle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

export default RegisterPage;