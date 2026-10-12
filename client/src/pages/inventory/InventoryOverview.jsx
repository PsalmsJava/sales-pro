import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Package, AlertTriangle, TrendingDown, CheckCircle,
    Plus, ArrowRight, RefreshCw, Layers, ShieldCheck, Box
} from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';

const InventoryOverview = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [restockingProduct, setRestockingProduct] = useState(null);
    const [addQuantity, setAddQuantity] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['inventory-overview-products'],
        queryFn: () => productService.getAllProducts({ limit: 100 })
    });

    const stockMutation = useMutation({
        mutationFn: ({ id, quantity }) => productService.updateStock(id, quantity, 'add'),
        onSuccess: () => {
            toast.success('Stock replenished successfully');
            queryClient.invalidateQueries(['inventory-overview-products']);
            setRestockingProduct(null);
            setAddQuantity('');
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update stock')
    });

    const products = data?.data || [];
    const totalProducts = products.length;
    const totalInventoryUnits = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0);
    const lowStockProducts = products.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= 5);
    const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0);

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        const qty = parseInt(addQuantity, 10);
        if (!qty || qty <= 0) {
            toast.error('Please enter a valid replenishment quantity');
            return;
        }
        stockMutation.mutate({ id: restockingProduct.id, quantity: qty });
    };

    return (
        <div className="space-y-6">
            {/* Header Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="p-2 bg-gold-500/20 rounded-xl text-gold-400">
                                <Box className="w-6 h-6" />
                            </span>
                            <h1 className="text-2xl lg:text-3xl font-bold">Inventory Hub</h1>
                        </div>
                        <p className="text-brand-200 max-w-lg text-sm lg:text-base">
                            Warehouse stock control, real-time inventory monitoring, and automated replenishment.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => navigate('/inventory-manager/dashboard/products')}
                            className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-brand-900 rounded-xl hover:from-gold-400 hover:to-gold-500 transition font-semibold text-sm shadow-lg shadow-gold-500/25 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Manage All Products
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Inventory KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Catalog Products" value={totalProducts} icon={Package} color="navy" loading={isLoading} />
                <StatCard label="Total Units in Stock" value={totalInventoryUnits.toLocaleString()} icon={Layers} color="teal" loading={isLoading} />
                <StatCard label="Total Stock Valuation" value={`₦${totalInventoryValue.toLocaleString()}`} icon={ShieldCheck} color="emerald" loading={isLoading} />
                <StatCard label="Low & Out of Stock" value={lowStockProducts.length + outOfStockProducts.length} icon={AlertTriangle} color={outOfStockProducts.length > 0 ? 'rose' : 'gold'} loading={isLoading} />
            </div>

            {/* Alerts & Critical Replenishments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SectionCard title="Stock Attention Alerts" subtitle="Items requiring immediate restocking" className="lg:col-span-2">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-16 bg-slate-100 dark:bg-brand-800 rounded-xl" />)}
                        </div>
                    ) : (lowStockProducts.length === 0 && outOfStockProducts.length === 0) ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <p className="font-semibold text-brand-800 dark:text-white">All Products Well Stocked</p>
                            <p className="text-slate-500 text-sm mt-1">No items are running critically low or out of stock.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-brand-700">
                            {[...outOfStockProducts, ...lowStockProducts].map((product) => (
                                <div key={product.id} className="flex items-center justify-between py-3.5 gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-brand-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <Package className="w-5 h-5 text-slate-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm text-brand-800 dark:text-white truncate">{product.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">SKU: {product.sku || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${product.quantity === 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                            {product.quantity} left
                                        </span>
                                        <button onClick={() => setRestockingProduct(product)}
                                            className="px-3 py-1.5 bg-brand-50 dark:bg-brand-800 text-brand-700 dark:text-gold-400 hover:bg-brand-100 dark:hover:bg-brand-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
                                            <RefreshCw className="w-3.5 h-3.5" /> Restock
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Stock Health Summary */}
                <SectionCard title="Inventory Health" subtitle="Distribution of catalog items">
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Healthy Stock</span>
                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                    {totalProducts > 0 ? Math.round(((totalProducts - lowStockProducts.length - outOfStockProducts.length) / totalProducts) * 100) : 0}%
                                </span>
                            </div>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                {totalProducts - lowStockProducts.length - outOfStockProducts.length} items with sufficient stock
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Low Stock (&le; 5 units)</span>
                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{lowStockProducts.length} items</span>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-400">Order replacements before inventory runs out.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Out of Stock (0 units)</span>
                                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">{outOfStockProducts.length} items</span>
                            </div>
                            <p className="text-xs text-rose-700 dark:text-rose-400">Customers cannot place orders for depleted items.</p>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Quick Restock Modal */}
            <Modal isOpen={!!restockingProduct} onClose={() => setRestockingProduct(null)}
                title={`Replenish Stock: ${restockingProduct?.name}`} size="sm" loading={stockMutation.isLoading}
                footer={<>
                    <button onClick={() => setRestockingProduct(null)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                    <button onClick={handleRestockSubmit} disabled={stockMutation.isLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold text-sm shadow-lg shadow-brand-500/25">
                        {stockMutation.isLoading ? 'Updating...' : 'Add Stock'}
                    </button>
                </>}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Current stock: <strong>{restockingProduct?.quantity}</strong> units.
                    </p>
                    <div>
                        <label className="block text-xs font-semibold text-brand-800 dark:text-slate-200 mb-1.5 uppercase">
                            Units to Add
                        </label>
                        <input type="number" min="1" value={addQuantity} onChange={(e) => setAddQuantity(e.target.value)}
                            placeholder="e.g. 25" className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InventoryOverview;
