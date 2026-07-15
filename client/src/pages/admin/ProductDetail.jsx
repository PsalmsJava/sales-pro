import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Package, TrendingUp, DollarSign, ShoppingCart,
    MapPin, Users, Star, Calendar, Clock, BarChart3, Target,
    AlertTriangle, CheckCircle, Truck, Globe, Percent, Award,
    ChevronDown, ChevronUp, Download, Edit, Trash2, Eye
} from 'lucide-react';
import productService from '../../services/productService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';

// Mock analytics data for the product
const generateProductAnalytics = (product) => {
    if (!product) return null;
    return {
        totalSold: Math.floor(Math.random() * 500) + 50,
        totalRevenue: (product.price || 0) * (Math.floor(Math.random() * 500) + 50),
        avgOrderValue: (product.price || 0) * (1 + Math.random()),
        conversionRate: (Math.random() * 30 + 10).toFixed(1),
        returnRate: (Math.random() * 5).toFixed(1),
        monthlySales: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2026, i).toLocaleString('default', { month: 'short' }),
            sales: Math.floor(Math.random() * 60) + 10,
            revenue: (product.price || 0) * (Math.floor(Math.random() * 60) + 10),
        })),
        topCities: [
            { city: 'Lagos', orders: 85, revenue: (product.price || 0) * 85 },
            { city: 'Abuja', orders: 62, revenue: (product.price || 0) * 62 },
            { city: 'Port Harcourt', orders: 45, revenue: (product.price || 0) * 45 },
            { city: 'Kano', orders: 38, revenue: (product.price || 0) * 38 },
            { city: 'Ibadan', orders: 31, revenue: (product.price || 0) * 31 },
        ],
        topSalesReps: [
            { name: 'Emma Johnson', orders: 28, revenue: (product.price || 0) * 28 },
            { name: 'John Smith', orders: 24, revenue: (product.price || 0) * 24 },
            { name: 'Lisa Garcia', orders: 21, revenue: (product.price || 0) * 21 },
            { name: 'David Martinez', orders: 18, revenue: (product.price || 0) * 18 },
            { name: 'Amanda Lewis', orders: 15, revenue: (product.price || 0) * 15 },
        ],
        adPerformance: {
            facebook: { clicks: 450, orders: 28, conversion: '6.2%' },
            instagram: { clicks: 380, orders: 22, conversion: '5.8%' },
            twitter: { clicks: 120, orders: 5, conversion: '4.2%' },
        },
        recentOrders: Array.from({ length: 5 }, (_, i) => ({
            id: `ORD-${1000 + i}`,
            customer: ['Adebayo Okonkwo', 'Chinelo Nwachukwu', 'Emeka Okafor', 'Folake Adebayo', 'Gbenga Mohammed'][i],
            city: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'][i],
            quantity: Math.floor(Math.random() * 3) + 1,
            total: (product.price || 0) * (Math.floor(Math.random() * 3) + 1),
            status: ['delivered', 'completed', 'processing', 'dispatched', 'delivered'][i],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        })),
    };
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showAllCities, setShowAllCities] = useState(false);

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProduct(id),
        enabled: !!id,
    });

    const analytics = generateProductAnalytics(product);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-xl border-4 border-brand-200 border-t-brand-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-brand-800 dark:text-white">Product Not Found</h3>
                <button onClick={() => navigate('/admin/dashboard/products')} className="mt-4 text-brand-600 hover:underline">Back to Products</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button & Actions */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/admin/dashboard/products')}
                    className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-gold-400 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </button>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 dark:border-brand-700 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-brand-800 flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Product Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="relative flex flex-col lg:flex-row gap-6">
                    <div className="h-48 w-48 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package className="w-20 h-20 text-white/40" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={product.stockStatus?.status} label={product.stockStatus?.label} />
                            <span className="text-brand-200 text-sm">SKU: {product.sku}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold">{product.name}</h1>
                        <p className="text-brand-200 mt-2 max-w-2xl">{product.description || 'No description available.'}</p>
                        <div className="flex items-end gap-4 mt-4">
                            <span className="text-4xl font-extrabold">${product.price?.toFixed(2)}</span>
                            <span className="text-brand-200">per unit</span>
                            <span className="text-brand-200">•</span>
                            <span className="text-brand-200">{product.quantity} in stock</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Sold" value={analytics?.totalSold || 0} icon={ShoppingCart} color="navy" />
                <StatCard label="Total Revenue" value={`$${(analytics?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="emerald" />
                <StatCard label="Avg Order Value" value={`$${(analytics?.avgOrderValue || 0).toFixed(2)}`} icon={Target} color="gold" />
                <StatCard label="Conversion Rate" value={`${analytics?.conversionRate || 0}%`} icon={TrendingUp} color="teal" />
                <StatCard label="Return Rate" value={`${analytics?.returnRate || 0}%`} icon={AlertTriangle} color="rose" />
            </div>

            {/* Sales Trend Chart */}
            <SectionCard title="Monthly Sales Trend" subtitle="12-month performance" icon={BarChart3}>
                <div className="space-y-2">
                    {analytics?.monthlySales?.map((month, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 w-10">{month.month}</span>
                            <div className="flex-1 h-8 bg-slate-100 dark:bg-brand-800 rounded-lg overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(month.sales / Math.max(...analytics.monthlySales.map(m => m.sales))) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-lg flex items-center px-2"
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                >
                                    <span className="text-xs text-white font-medium">{month.sales} units</span>
                                </motion.div>
                            </div>
                            <span className="text-xs font-bold text-brand-800 dark:text-white w-24 text-right">${month.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Cities */}
                <SectionCard title="Top Cities" subtitle="By order volume" icon={MapPin}>
                    <div className="space-y-3">
                        {(showAllCities ? analytics?.topCities : analytics?.topCities?.slice(0, 5))?.map((city, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-brand-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-xs font-bold text-brand-600">#{i + 1}</div>
                                    <div>
                                        <p className="font-semibold text-brand-800 dark:text-white text-sm">{city.city}</p>
                                        <p className="text-xs text-slate-500">{city.orders} orders</p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm">${city.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Top Sales Reps */}
                <SectionCard title="Top Sales Reps" subtitle="By product sales" icon={Users}>
                    <div className="space-y-3">
                        {analytics?.topSalesReps?.map((rep, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-brand-800/50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-xs font-bold text-white">#{i + 1}</div>
                                    <div>
                                        <p className="font-semibold text-brand-800 dark:text-white text-sm">{rep.name}</p>
                                        <p className="text-xs text-slate-500">{rep.orders} orders</p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm">${rep.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Ad Performance */}
            <SectionCard title="Ad Campaign Performance" subtitle="Social media conversions" icon={Globe}>
                <div className="grid grid-cols-3 gap-4">
                    {analytics?.adPerformance && Object.entries(analytics.adPerformance).map(([platform, data]) => (
                        <div key={platform} className="p-4 bg-slate-50 dark:bg-brand-800/50 rounded-2xl text-center">
                            <p className="text-lg font-bold text-brand-800 dark:text-white capitalize">{platform}</p>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                                <div><p className="text-slate-500">{data.clicks}</p><p className="text-xs">Clicks</p></div>
                                <div><p className="text-slate-500">{data.orders}</p><p className="text-xs">Orders</p></div>
                                <div><p className="text-emerald-600 font-bold">{data.conversion}</p><p className="text-xs">Conv.</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Recent Orders */}
            <SectionCard title="Recent Orders" subtitle="Latest purchases of this product" icon={Clock}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-brand-800/30">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">City</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-brand-700">
                            {analytics?.recentOrders?.map((order, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-brand-800/20">
                                    <td className="px-4 py-3 text-sm font-mono text-brand-600 dark:text-gold-400">{order.id}</td>
                                    <td className="px-4 py-3 text-sm">{order.customer}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{order.city}</td>
                                    <td className="px-4 py-3 text-sm text-right">{order.quantity}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-right">${order.total.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center"><StatusBadge status={order.status} size="sm" /></td>
                                    <td className="px-4 py-3 text-xs text-slate-500 text-right">{order.date.toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
};

export default ProductDetail;