import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, ShoppingCart, Truck, CreditCard, Check, ArrowRight,
    MapPin, Phone, Mail, User, Shield, Star, ChevronLeft, ChevronRight,
    Clock, BadgeCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';

const orderSchema = z.object({
    quantity: z.string().min(1).transform(Number).pipe(z.number().int().min(1, 'Minimum 1')),
    paymentMethod: z.enum(['online', 'delivery'], { errorMap: () => ({ message: 'Select a payment method' }) }),
    customer: z.object({
        firstName: z.string().min(2, 'First name required'),
        lastName: z.string().min(2, 'Last name required'),
        email: z.string().email('Valid email required'),
        phone: z.string().min(10, 'Valid phone required'),
        address: z.string().min(5, 'Address required'),
        city: z.string().min(2, 'City required'),
        state: z.string().min(2, 'State required'),
    }),
    notes: z.string().optional(),
});

const OrderPage = () => {
    const { productId } = useParams();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [imgError, setImgError] = useState(false);

    const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            quantity: '1',
            paymentMethod: 'delivery',
            customer: { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '' },
            notes: ''
        }
    });

    const { data: product, isLoading, isError, refetch } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productService.getProduct(productId),
        enabled: !!productId,
        retry: 1,
    });

    const orderMutation = useMutation({
        mutationFn: (orderData) => api.post('/orders', orderData),
        onSuccess: (response) => {
            setOrderId(response.data.data.id);
            setOrderComplete(true);
            setStep(4);
            toast.success('Order placed successfully! 🎉');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to place order');
        }
    });

    const watchQuantity = watch('quantity');
    const watchPaymentMethod = watch('paymentMethod');
    const total = product ? Number(product.price || 0) * (parseInt(watchQuantity, 10) || 1) : 0;
    const isOutOfStock = product && product.quantity <= 0;

    const handleProceedToReview = async () => {
        const isValid = await trigger([
            'customer.firstName',
            'customer.lastName',
            'customer.email',
            'customer.phone',
            'customer.address',
            'customer.city',
            'customer.state',
            'paymentMethod'
        ]);

        if (isValid) {
            setStep(3);
        } else {
            toast.error('Please complete all required fields');
        }
    };

    const onSubmit = (data) => {
        const payload = {
            productId,
            quantity: parseInt(data.quantity, 10) || 1,
            paymentMethod: data.paymentMethod,
            customer: data.customer,
            notes: data.notes || '',
        };

        const utmSource = searchParams.get('utm_source');
        const utmMedium = searchParams.get('utm_medium');
        const utmCampaign = searchParams.get('utm_campaign');
        const utmContent = searchParams.get('utm_content');
        const utmTerm = searchParams.get('utm_term');

        if (utmSource) payload.utm_source = utmSource;
        if (utmMedium) payload.utm_medium = utmMedium;
        if (utmCampaign) payload.utm_campaign = utmCampaign;
        if (utmContent) payload.utm_content = utmContent;
        if (utmTerm) payload.utm_term = utmTerm;

        orderMutation.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-brand-950 p-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 rounded-2xl border-4 border-brand-200 border-t-brand-600 mb-4"
                />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading product details...</p>
            </div>
        );
    }

    if (!isLoading && (!product || isError)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50/30 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950 p-4">
                <div className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-800 dark:text-white mb-2">Product Not Available</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                        The requested product could not be found or may no longer be available.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => refetch()}
                            className="w-full py-3 px-4 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Try Again
                        </button>
                        <Link
                            to="/login"
                            className="w-full py-3 px-4 border border-slate-200 dark:border-brand-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-gold-50 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950 p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-white dark:bg-brand-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-200 dark:border-brand-800"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
                    >
                        <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-extrabold text-brand-800 dark:text-white mb-2">Order Confirmed! 🎉</h1>
                    <p className="text-slate-500 text-sm mb-1">Order #{orderId?.slice(0, 8)}</p>
                    <p className="text-slate-500 text-sm mb-6">A sales representative will process and confirm your order shortly.</p>
                    
                    <div className="bg-slate-50 dark:bg-brand-800/50 rounded-2xl p-4 space-y-2.5 text-sm mb-6 text-left">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Product</span>
                            <span className="font-semibold text-brand-800 dark:text-white">{product?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Quantity</span>
                            <span className="font-semibold text-brand-800 dark:text-white">{watchQuantity} unit(s)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Payment</span>
                            <span className="font-medium capitalize text-slate-700 dark:text-slate-200">
                                {watchPaymentMethod === 'online' ? 'Pay Online' : 'Pay on Delivery'}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-brand-700">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Total</span>
                            <span className="font-extrabold text-brand-700 dark:text-gold-400 text-base">₦{total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="text-xs text-slate-400">
                        Need help? Keep your Order ID handy for our customer support team.
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950">
            {/* Top Bar */}
            <div className="bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-brand-800 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <Package className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-brand-800 dark:text-white tracking-tight">MaxSnow</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Verified & Secure</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                        {[
                            { num: 1, label: 'Product' },
                            { num: 2, label: 'Details' },
                            { num: 3, label: 'Review' },
                        ].map((s, i) => (
                            <div key={s.num} className="flex items-center gap-2">
                                <motion.div
                                    animate={step === s.num ? { scale: [1, 1.05, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                        step > s.num
                                            ? 'bg-emerald-500 text-white'
                                            : step === s.num
                                            ? 'bg-brand-700 text-white shadow-lg shadow-brand-500/30'
                                            : 'bg-slate-100 dark:bg-brand-800 text-slate-400'
                                    }`}
                                >
                                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                                </motion.div>
                                <span className={`text-sm font-medium hidden sm:block ${step === s.num ? 'text-brand-700 dark:text-gold-400' : 'text-slate-400'}`}>
                                    {s.label}
                                </span>
                                {i < 2 && (
                                    <div className={`w-8 sm:w-12 h-0.5 rounded-full ${step > s.num ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-brand-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Product Preview */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 overflow-hidden">
                                <div className="p-6 lg:p-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-64 h-64 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100 dark:border-brand-800">
                                            {product?.imageUrl && !imgError ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    onError={() => setImgError(true)}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                                    <span className="text-xs text-slate-400 font-medium">MaxSnow Product</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <StatusBadge status={product?.stockStatus?.status} label={product?.stockStatus?.label} />
                                                    {product?.stockStatus?.status === 'low_stock' && (
                                                        <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                                                            <Clock className="w-3 h-3" /> Selling fast! Only {product.quantity} left
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="text-2xl lg:text-3xl font-extrabold text-brand-800 dark:text-white mb-2 leading-tight">
                                                    {product?.name}
                                                </h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed whitespace-pre-line line-clamp-4">
                                                    {product?.description}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-baseline gap-3 mb-4">
                                                    <span className="text-3xl lg:text-4xl font-extrabold text-brand-800 dark:text-white">
                                                        ₦{Number(product?.price || 0).toLocaleString()}
                                                    </span>
                                                </div>

                                                {isOutOfStock ? (
                                                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-semibold">
                                                        This product is currently out of stock. Please check back later.
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-36">
                                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                                Quantity
                                                            </label>
                                                            <select
                                                                {...register('quantity')}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm font-semibold bg-white dark:bg-brand-800 dark:text-white focus:border-brand-500 focus:outline-none"
                                                            >
                                                                {Array.from({ length: Math.min(10, product?.quantity || 1) }, (_, i) => i + 1).map(n => (
                                                                    <option key={n} value={n}>{n} {n === 1 ? 'unit' : 'units'}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="bg-brand-50 dark:bg-brand-800/50 rounded-xl p-3 flex-1 text-center border border-brand-100 dark:border-brand-700/50">
                                                            <p className="text-xs text-slate-500 mb-0.5">Subtotal</p>
                                                            <p className="text-2xl font-extrabold text-brand-800 dark:text-white">
                                                                ₦{total.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setStep(2)}
                                disabled={isOutOfStock}
                                className="mt-6 w-full py-4 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-2xl font-bold text-lg hover:from-brand-800 hover:to-brand-950 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isOutOfStock ? 'Product Out of Stock' : <>Continue to Delivery Details <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Customer Details */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 p-6 lg:p-8">
                                <h2 className="text-xl font-bold text-brand-800 dark:text-white mb-6 flex items-center gap-2">
                                    <User className="w-6 h-6 text-brand-600" /> Customer Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                First Name *
                                            </label>
                                            <input
                                                {...register('customer.firstName')}
                                                placeholder="e.g. John"
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${
                                                    errors.customer?.firstName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-brand-700'
                                                } dark:bg-brand-800 dark:text-white focus:outline-none focus:border-brand-500`}
                                            />
                                            {errors.customer?.firstName && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customer.firstName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Last Name *
                                            </label>
                                            <input
                                                {...register('customer.lastName')}
                                                placeholder="e.g. Doe"
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${
                                                    errors.customer?.lastName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-brand-700'
                                                } dark:bg-brand-800 dark:text-white focus:outline-none focus:border-brand-500`}
                                            />
                                            {errors.customer?.lastName && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customer.lastName.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="john@example.com"
                                                {...register('customer.email')}
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${
                                                    errors.customer?.email ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-brand-700'
                                                } dark:bg-brand-800 dark:text-white focus:outline-none focus:border-brand-500`}
                                            />
                                            {errors.customer?.email && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customer.email.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="e.g. 08012345678"
                                                {...register('customer.phone')}
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${
                                                    errors.customer?.phone ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-brand-700'
                                                } dark:bg-brand-800 dark:text-white focus:outline-none focus:border-brand-500`}
                                            />
                                            {errors.customer?.phone && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customer.phone.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Delivery Address *
                                        </label>
                                        <input
                                            placeholder="Street address, apartment, suite..."
                                            {...register('customer.address')}
                                            className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${
                                                errors.customer?.address ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-brand-700'
                                            } dark:bg-brand-800 dark:text-white focus:outline-none focus:border-brand-500`}
                                        />
                                        {errors.customer?.address && (
                                            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customer.address.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                City *
                                            </label>
                                            <input
                                                placeholder="e.g. Ikeja"
                                                {...register('customer.city')}
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${
                                                    errors.customer?.city ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-brand-700'
                                                } dark:bg-brand-800 dark:text-white focus:outline-none focus:border-brand-500`}
                                            />
                                            {errors.customer?.city && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customer.city.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                State *
                                            </label>
                                            <input
                                                placeholder="e.g. Lagos"
                                                {...register('customer.state')}
                                                className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${
                                                    errors.customer?.state ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 dark:border-brand-700'
                                                } dark:bg-brand-800 dark:text-white focus:outline-none focus:border-brand-500`}
                                            />
                                            {errors.customer?.state && (
                                                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customer.state.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Order Notes (Optional)
                                        </label>
                                        <textarea
                                            {...register('notes')}
                                            rows={2}
                                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white resize-none focus:outline-none focus:border-brand-500"
                                            placeholder="Special delivery instructions or landmark..."
                                        />
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-brand-800">
                                    <h3 className="text-base font-bold text-brand-800 dark:text-white mb-3 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-brand-600" /> Select Payment Method
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <label
                                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                watchPaymentMethod === 'delivery'
                                                    ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-800/40 shadow-sm'
                                                    : 'border-slate-200 dark:border-brand-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <input type="radio" value="delivery" {...register('paymentMethod')} className="sr-only" />
                                            <div className={`p-2.5 rounded-xl ${watchPaymentMethod === 'delivery' ? 'bg-brand-700 text-white' : 'bg-slate-100 dark:bg-brand-800 text-slate-400'}`}>
                                                <Truck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-brand-900 dark:text-white">Pay on Delivery</p>
                                                <p className="text-xs text-slate-500">Pay cash or transfer when received</p>
                                            </div>
                                        </label>

                                        <label
                                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                watchPaymentMethod === 'online'
                                                    ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-800/40 shadow-sm'
                                                    : 'border-slate-200 dark:border-brand-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <input type="radio" value="online" {...register('paymentMethod')} className="sr-only" />
                                            <div className={`p-2.5 rounded-xl ${watchPaymentMethod === 'online' ? 'bg-brand-700 text-white' : 'bg-slate-100 dark:bg-brand-800 text-slate-400'}`}>
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-brand-900 dark:text-white">Pay Online</p>
                                                <p className="text-xs text-slate-500">Debit card, bank transfer, USSD</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 border-2 border-slate-200 dark:border-brand-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
                                >
                                    <ChevronLeft className="w-5 h-5" /> Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProceedToReview}
                                    className="flex-1 py-4 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-2xl font-bold hover:from-brand-800 hover:to-brand-950 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
                                >
                                    Review Order <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Review & Submit */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <div className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 p-6 lg:p-8">
                                <h2 className="text-xl font-bold text-brand-800 dark:text-white mb-6 flex items-center gap-2">
                                    <BadgeCheck className="w-6 h-6 text-brand-600" /> Order Summary
                                </h2>
                                
                                <div className="space-y-4">
                                    {/* Product summary card */}
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl border border-slate-100 dark:border-brand-700/50">
                                        <div className="h-16 w-16 rounded-xl bg-white dark:bg-brand-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {product?.imageUrl && !imgError ? (
                                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-brand-800 dark:text-white truncate">{product?.name}</p>
                                            <p className="text-xs text-slate-500">Qty: {watchQuantity} × ₦{Number(product?.price || 0).toLocaleString()}</p>
                                        </div>
                                        <span className="text-xl font-extrabold text-brand-800 dark:text-white">
                                            ₦{total.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Delivery details card */}
                                    <div className="p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl border border-slate-100 dark:border-brand-700/50 space-y-2 text-xs">
                                        <p className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Recipient Details</p>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{watch('customer.firstName')} {watch('customer.lastName')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{watch('customer.phone')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{watch('customer.address')}, {watch('customer.city')}, {watch('customer.state')}</span>
                                        </div>
                                    </div>

                                    {/* Payment method */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-brand-800/50 rounded-xl border border-slate-100 dark:border-brand-700/50">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {watchPaymentMethod === 'online' ? (
                                                <CreditCard className="w-4 h-4 text-brand-600" />
                                            ) : (
                                                <Truck className="w-4 h-4 text-emerald-600" />
                                            )}
                                            <span className="text-slate-700 dark:text-slate-200 font-semibold">
                                                {watchPaymentMethod === 'online' ? 'Online Payment' : 'Pay on Delivery'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500">
                                            {watchPaymentMethod === 'online' ? 'Card / Bank' : 'Cash or Transfer'}
                                        </span>
                                    </div>

                                    {/* Total breakdown */}
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-brand-700">
                                        <div>
                                            <span className="text-base font-bold text-slate-600 dark:text-slate-300">Total Due</span>
                                            <p className="text-xs text-slate-400">Includes all taxes and delivery handling</p>
                                        </div>
                                        <span className="text-3xl font-extrabold text-brand-800 dark:text-gold-400">
                                            ₦{total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-4 border-2 border-slate-200 dark:border-brand-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
                                >
                                    <ChevronLeft className="w-5 h-5" /> Edit Details
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={orderMutation.isLoading}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {orderMutation.isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" /> Complete Order (₦{total.toLocaleString()})
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderPage;