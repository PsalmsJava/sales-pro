import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, ShoppingCart, Truck, CreditCard, Check, ArrowRight,
    MapPin, Phone, Mail, User, Shield, Star, ChevronLeft, ChevronRight,
    Clock, BadgeCheck, Sparkles
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

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(orderSchema),
        defaultValues: { quantity: '1', paymentMethod: 'delivery', customer: { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '' }, notes: '' }
    });

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productService.getProduct(productId),
        enabled: !!productId
    });

    const orderMutation = useMutation({
        mutationFn: (orderData) => api.post('/orders', orderData),
        onSuccess: (response) => {
            setOrderId(response.data.data.id);
            setOrderComplete(true);
            setStep(4);
            toast.success('Order placed successfully! 🎉');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to place order')
    });

    const watchQuantity = watch('quantity');
    const watchPaymentMethod = watch('paymentMethod');
    const total = product ? product.price * (parseInt(watchQuantity) || 1) : 0;

    const onSubmit = (data) => {
        orderMutation.mutate({
            productId,
            quantity: parseInt(data.quantity),
            paymentMethod: data.paymentMethod,
            customer: data.customer,
            notes: data.notes,
            utm_source: searchParams.get('utm_source'),
            utm_medium: searchParams.get('utm_medium'),
            utm_campaign: searchParams.get('utm_campaign'),
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-2xl border-4 border-brand-200 border-t-brand-600" />
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-gold-50 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950 p-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-white dark:bg-brand-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                        className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                        <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-extrabold text-brand-800 dark:text-white mb-2">Order Confirmed! 🎉</h1>
                    <p className="text-slate-500 mb-1">Order #{orderId?.slice(0, 8)}</p>
                    <p className="text-slate-500 mb-6">A sales representative will process your order shortly.</p>
                    <div className="bg-slate-50 dark:bg-brand-800/50 rounded-2xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="font-medium">{product?.name}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="font-medium">{watchQuantity}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold text-brand-800 dark:text-white">${total.toFixed(2)}</span></div>
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
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center">
                            <Package className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-brand-800 dark:text-white">SalesPro</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-500">Secure Checkout</span>
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
                                <motion.div animate={step === s.num ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.5 }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${step > s.num ? 'bg-emerald-500 text-white' : step === s.num ? 'bg-brand-700 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 dark:bg-brand-800 text-slate-400'
                                        }`}>
                                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                                </motion.div>
                                <span className={`text-sm font-medium hidden sm:block ${step === s.num ? 'text-brand-700 dark:text-gold-400' : 'text-slate-400'}`}>{s.label}</span>
                                {i < 2 && <div className={`w-8 sm:w-12 h-0.5 rounded-full ${step > s.num ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-brand-700'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Product Preview */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <div className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 overflow-hidden">
                                <div className="p-6 lg:p-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-56 h-56 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center overflow-hidden">
                                            {product?.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <StatusBadge status={product?.stockStatus?.status} label={product?.stockStatus?.label} />
                                                {product?.stockStatus?.status === 'low_stock' && (
                                                    <span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Selling fast!</span>
                                                )}
                                            </div>
                                            <h2 className="text-2xl lg:text-3xl font-extrabold text-brand-800 dark:text-white mb-2">{product?.name}</h2>
                                            <p className="text-slate-500 mb-4">{product?.description}</p>
                                            <div className="flex items-end gap-3 mb-4">
                                                <span className="text-4xl font-extrabold text-brand-800 dark:text-white">${product?.price?.toFixed(2)}</span>
                                                {product?.originalPrice && <span className="text-lg text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quantity</label>
                                                    <select {...register('quantity')} className="px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm bg-white dark:bg-brand-800">
                                                        {Array.from({ length: Math.min(10, product?.quantity || 1) }, (_, i) => i + 1).map(n => (
                                                            <option key={n} value={n}>{n}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="bg-brand-50 dark:bg-brand-800/50 rounded-xl p-3 flex-1 text-center">
                                                    <p className="text-xs text-slate-500 mb-1">Total</p>
                                                    <p className="text-2xl font-extrabold text-brand-800 dark:text-white">${total.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setStep(2)}
                                className="mt-6 w-full py-4 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-2xl font-bold text-lg hover:from-brand-800 hover:to-brand-950 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2">
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Customer Details */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 p-6 lg:p-8">
                                <h2 className="text-xl font-bold text-brand-800 dark:text-white mb-6 flex items-center gap-2">
                                    <User className="w-6 h-6 text-brand-600" /> Customer Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                                            <input {...register('customer.firstName')} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.customer?.firstName ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                            {errors.customer?.firstName && <p className="text-xs text-rose-600 mt-1">{errors.customer.firstName.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                                            <input {...register('customer.lastName')} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.customer?.lastName ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                                            <input type="email" {...register('customer.email')} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.customer?.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone *</label>
                                            <input type="tel" {...register('customer.phone')} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.customer?.phone ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Delivery Address *</label>
                                        <input {...register('customer.address')} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.customer?.address ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">City *</label>
                                            <input {...register('customer.city')} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.customer?.city ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">State *</label>
                                            <input {...register('customer.state')} className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.customer?.state ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                                        <textarea {...register('notes')} rows={3} className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white resize-none focus:ring-2 focus:ring-brand-500/20" placeholder="Any special instructions..." />
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-brand-800 dark:text-white mb-4 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-brand-600" /> Payment Method
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${watchPaymentMethod === 'online' ? 'border-brand-500 bg-brand-50 dark:bg-brand-800/30' : 'border-slate-200 dark:border-brand-700 hover:border-slate-300'
                                            }`}>
                                            <input type="radio" value="online" {...register('paymentMethod')} className="sr-only" />
                                            <div className={`p-2 rounded-xl ${watchPaymentMethod === 'online' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div><p className="font-semibold text-sm">Pay Online</p><p className="text-xs text-slate-500">Card, Bank Transfer</p></div>
                                        </label>
                                        <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${watchPaymentMethod === 'delivery' ? 'border-brand-500 bg-brand-50 dark:bg-brand-800/30' : 'border-slate-200 dark:border-brand-700 hover:border-slate-300'
                                            }`}>
                                            <input type="radio" value="delivery" {...register('paymentMethod')} className="sr-only" />
                                            <div className={`p-2 rounded-xl ${watchPaymentMethod === 'delivery' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <Truck className="w-6 h-6" />
                                            </div>
                                            <div><p className="font-semibold text-sm">Pay on Delivery</p><p className="text-xs text-slate-500">Cash or Card</p></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 border-2 border-slate-200 dark:border-brand-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors flex items-center justify-center gap-2">
                                    <ChevronLeft className="w-5 h-5" /> Back
                                </button>
                                <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-2xl font-bold hover:from-brand-800 hover:to-brand-950 transition-all shadow-xl flex items-center justify-center gap-2">
                                    Review Order <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="bg-white dark:bg-brand-900 rounded-3xl shadow-xl border border-slate-200 dark:border-brand-700 p-6 lg:p-8">
                                <h2 className="text-xl font-bold text-brand-800 dark:text-white mb-6 flex items-center gap-2">
                                    <BadgeCheck className="w-6 h-6 text-brand-600" /> Order Summary
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl">
                                        <div className="h-16 w-16 rounded-xl bg-white dark:bg-brand-700 flex items-center justify-center overflow-hidden">
                                            {product?.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <Package className="w-8 h-8 text-slate-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-brand-800 dark:text-white">{product?.name}</p>
                                            <p className="text-sm text-slate-500">Qty: {watchQuantity} × ${product?.price?.toFixed(2)}</p>
                                        </div>
                                        <span className="text-xl font-extrabold text-brand-800 dark:text-white">${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-brand-800/50 rounded-xl">
                                        {watchPaymentMethod === 'online' ? <CreditCard className="w-5 h-5 text-brand-600" /> : <Truck className="w-5 h-5 text-emerald-600" />}
                                        <span className="text-sm font-medium">{watchPaymentMethod === 'online' ? 'Online Payment' : 'Pay on Delivery'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-brand-700">
                                        <span className="text-lg font-bold text-brand-800 dark:text-white">Total</span>
                                        <span className="text-3xl font-extrabold text-brand-800 dark:text-white">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-slate-200 dark:border-brand-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <ChevronLeft className="w-5 h-5" /> Back
                                </button>
                                <button onClick={handleSubmit(onSubmit)} disabled={orderMutation.isLoading}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {orderMutation.isLoading ? (
                                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                                    ) : (
                                        <><ShoppingCart className="w-5 h-5" /> Place Order</>
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