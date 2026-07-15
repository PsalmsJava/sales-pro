import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Pencil, Trash2, Search, Filter, Download, Upload,
    Package, DollarSign, AlertTriangle, TrendingUp, MoreHorizontal,
    Grid3X3, List, SlidersHorizontal, X, Check, Image, ChevronDown,
    Star, Eye, Copy, Archive, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import StatCard from '../../components/ui/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const ProductManagement = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [bulkAction, setBulkAction] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['products', { search, page, sortBy }],
        queryFn: () => productService.getAllProducts({ search, page, limit: 12 })
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => productService.deleteProduct(id),
        onSuccess: () => {
            toast.success('Product deleted');
            queryClient.invalidateQueries(['products']);
            setDeleteConfirm(null);
            setSelectedProducts([]);
        },
    });

    const products = data?.data || [];
    const pagination = data?.pagination;

    const stats = useMemo(() => ({
        total: pagination?.total || 0,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
        lowStock: products.filter(p => p.quantity <= 5 && p.quantity > 0).length,
        outOfStock: products.filter(p => p.quantity === 0).length,
        avgPrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
    }), [products]);

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header with Gradient */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-brand-800 via-brand-900 to-brand-950 rounded-3xl p-6 lg:p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <Package className="w-8 h-8 text-gold-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold">Product Management</h1>
                            <p className="text-brand-200 text-sm mt-1">Manage your inventory, track stock levels, and optimize pricing</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition font-medium text-sm flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Import
                        </button>
                        <button onClick={() => { setEditingProduct(null); setShowForm(true); }}
                            className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-brand-900 rounded-xl hover:from-gold-400 hover:to-gold-500 transition font-semibold text-sm shadow-lg shadow-gold-500/25 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* KPI Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Products" value={stats.total} icon={Package} color="navy" loading={isLoading} />
                <StatCard label="Inventory Value" value={`$${stats.totalValue.toLocaleString()}`} icon={DollarSign} color="emerald" loading={isLoading} />
                <StatCard label="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="gold" loading={isLoading} />
                <StatCard label="Out of Stock" value={stats.outOfStock} icon={TrendingUp} color="rose" loading={isLoading} />
                <StatCard label="Avg Price" value={`$${stats.avgPrice.toFixed(2)}`} icon={BarChart3} color="teal" loading={isLoading} />
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-brand-900 rounded-2xl border border-slate-200 dark:border-brand-700 shadow-card p-3">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search by name, SKU, or category..." value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-brand-800 border border-slate-200 dark:border-brand-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm" />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-brand-700 rounded-lg">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${showFilters ? 'bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-300' : 'border border-slate-200 dark:border-brand-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-800'
                                }`}>
                            <SlidersHorizontal className="w-4 h-4" /> Filters
                        </button>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 border border-slate-200 dark:border-brand-700 rounded-xl text-sm bg-white dark:bg-brand-900 text-slate-600 dark:text-slate-400">
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="stock_asc">Stock: Low to High</option>
                        </select>
                        <div className="flex border border-slate-200 dark:border-brand-700 rounded-xl overflow-hidden">
                            <button onClick={() => setViewMode('grid')}
                                className={`p-3 ${viewMode === 'grid' ? 'bg-brand-100 dark:bg-brand-800 text-brand-600' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-800'}`}>
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('table')}
                                className={`p-3 ${viewMode === 'table' ? 'bg-brand-100 dark:bg-brand-800 text-brand-600' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-800'}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                <AnimatePresence>
                    {selectedProducts.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-slate-200 dark:border-brand-700 flex items-center justify-between">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-brand-800 dark:text-white">{selectedProducts.length}</span> selected
                            </p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 text-sm border border-slate-200 dark:border-brand-700 rounded-xl hover:bg-slate-50 dark:hover:bg-brand-800 flex items-center gap-2">
                                    <Archive className="w-4 h-4" /> Archive
                                </button>
                                <button onClick={() => setBulkAction('delete')}
                                    className="px-4 py-2 text-sm bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Products Display */}
            <SectionCard>
                {isLoading ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-slate-100 dark:bg-brand-800 rounded-2xl p-5">
                                <div className="h-32 bg-slate-200 dark:bg-brand-700 rounded-xl mb-4" />
                                <div className="h-4 w-3/4 bg-slate-200 dark:bg-brand-700 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-slate-200 dark:bg-brand-700 rounded" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState icon={Package} title="No products found"
                        description={search ? 'Try different search terms or clear filters.' : 'Add your first product to start building your inventory.'}
                        searchTerm={search} onClear={() => setSearch('')}
                        action={() => { setEditingProduct(null); setShowForm(true); }} actionLabel="Add Product" />
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product, idx) => (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                                whileHover={{ y: -4 }}
                                className={`group relative bg-white dark:bg-brand-900 rounded-2xl border shadow-card overflow-hidden transition-all duration-300 cursor-pointer
                  ${selectedProducts.includes(product.id) ? 'border-brand-500 dark:border-gold-500 ring-2 ring-brand-500/20' : 'border-slate-200 dark:border-brand-700 hover:shadow-elevated hover:border-brand-300 dark:hover:border-brand-600'}`}
                                onClick={() => toggleSelect(product.id)}>
                                {/* Selection Checkbox */}
                                <div className={`absolute top-3 right-3 z-10 transition-all ${selectedProducts.includes(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedProducts.includes(product.id) ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white/80 border-slate-300'
                                        }`}>
                                        {selectedProducts.includes(product.id) && <Check className="w-4 h-4" />}
                                    </div>
                                </div>

                                {/* Product Image */}
                                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <StatusBadge status={product.stockStatus?.status} label={product.stockStatus?.label} size="sm" />
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-semibold text-brand-800 dark:text-white truncate">{product.name}</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xl font-bold text-brand-800 dark:text-white">${product.price?.toFixed(2)}</span>
                                        <span className="text-sm text-slate-500">Qty: {product.quantity}</span>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setShowForm(true); }}
                                            className="flex-1 py-2 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-800 rounded-lg transition-colors flex items-center justify-center gap-1">
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(product); }}
                                            className="flex-1 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-brand-700">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-brand-800/30">
                                    <th className="px-4 py-4 w-10">
                                        <button onClick={toggleSelectAll}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedProducts.length === products.length ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                                                }`}>
                                            {selectedProducts.length === products.length && <Check className="w-3 h-3" />}
                                        </button>
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Price</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Stock</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-brand-700">
                                {products.map((product, idx) => (
                                    <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                                        className="hover:bg-brand-50/30 dark:hover:bg-brand-800/20 transition-colors group">
                                        <td className="px-4 py-4">
                                            <button onClick={() => toggleSelect(product.id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedProducts.includes(product.id) ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                                                    }`}>
                                                {selectedProducts.includes(product.id) && <Check className="w-3 h-3" />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-brand-800 flex items-center justify-center overflow-hidden">
                                                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <Package className="w-5 h-5 text-slate-400" />}
                                                </div>
                                                <span className="text-sm font-semibold text-brand-800 dark:text-white">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 font-mono">{product.sku}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-right">${product.price?.toFixed(2)}</td>
                                        <td className="px-4 py-4 text-sm text-right">{product.quantity}</td>
                                        <td className="px-4 py-4 text-center"><StatusBadge status={product.stockStatus?.status} label={product.stockStatus?.label} size="sm" /></td>
                                        <td className="px-4 py-4 text-sm text-right text-slate-500">${((product.price || 0) * (product.quantity || 0)).toFixed(2)}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination pagination={pagination} onPageChange={setPage} />
            </SectionCard>

            {/* Product Form Modal - Inline */}
            <ProductFormModal isOpen={showForm} onClose={() => { setShowForm(false); setEditingProduct(null); }}
                product={editingProduct} onSuccess={() => { queryClient.invalidateQueries(['products']); setShowForm(false); setEditingProduct(null); }} />

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-brand-900 rounded-3xl shadow-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-rose-600" />
                                </div>
                                <h3 className="text-xl font-bold text-brand-800 dark:text-white">Delete Product</h3>
                                <p className="text-slate-500 mt-2">Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.</p>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-brand-800 transition-colors">Cancel</button>
                                <button onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl font-semibold text-sm hover:from-rose-700 hover:to-rose-800 transition-all shadow-lg shadow-rose-500/25">
                                    {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Product Form Modal
const ProductFormModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '', sku: '', imageUrl: '', category: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (product) {
            setForm({
                name: product.name || '', description: product.description || '',
                price: product.price?.toString() || '', quantity: product.quantity?.toString() || '',
                sku: product.sku || '', imageUrl: product.imageUrl || '', category: product.category || '',
            });
        } else {
            setForm({ name: '', description: '', price: '', quantity: '', sku: '', imageUrl: '', category: '' });
        }
        setErrors({});
    }, [product, isOpen]);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Product name is required';
        if (!form.price || parseFloat(form.price) < 0) errs.price = 'Valid price is required';
        if (!form.quantity || parseInt(form.quantity) < 0) errs.quantity = 'Valid quantity is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
            if (product) {
                await productService.updateProduct(product.id, payload);
                toast.success('Product updated');
            } else {
                await productService.createProduct(payload);
                toast.success('Product created');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-brand-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-shrink-0 px-8 py-5 bg-gradient-to-r from-brand-800 to-brand-900 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white">{product ? 'Edit Product' : 'Add New Product'}</h2>
                            <p className="text-brand-200 text-sm">{product ? 'Update product details' : 'Fill in the details below'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Product Name" required error={errors.name}>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                </FormField>
                                <FormField label="SKU">
                                    <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20" />
                                </FormField>
                            </div>
                            <FormField label="Description">
                                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 resize-none" />
                            </FormField>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField label="Price ($)" required error={errors.price}>
                                    <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.price ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                </FormField>
                                <FormField label="Quantity" required error={errors.quantity}>
                                    <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm ${errors.quantity ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-brand-700'} dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20`} />
                                </FormField>
                                <FormField label="Category">
                                    <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20" />
                                </FormField>
                            </div>
                            <FormField label="Image URL">
                                <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-brand-700 rounded-xl text-sm dark:bg-brand-800 dark:text-white focus:ring-2 focus:ring-brand-500/20" placeholder="https://..." />
                            </FormField>
                            {form.imageUrl && (
                                <div className="h-40 bg-slate-100 dark:bg-brand-800 rounded-xl flex items-center justify-center overflow-hidden">
                                    <img src={form.imageUrl} alt="Preview" className="h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                            )}
                        </form>
                    </div>
                    <div className="flex-shrink-0 px-8 py-4 bg-slate-50 dark:bg-brand-800/50 border-t border-slate-200 dark:border-brand-700 flex justify-end gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 border-2 border-slate-300 dark:border-brand-600 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition font-medium text-sm">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl hover:from-brand-800 hover:to-brand-950 transition-all font-semibold text-sm shadow-lg shadow-brand-500/25 disabled:opacity-50">
                            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const FormField = ({ label, required, error, children }) => (
    <div>
        <label className="block text-xs font-semibold text-brand-800 dark:text-slate-200 mb-1.5">{label} {required && <span className="text-rose-500">*</span>}</label>
        {children}
        {error && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
    </div>
);

export default ProductManagement;