import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    MegaphoneIcon, ClipboardDocumentIcon,
    CheckCircleIcon, ShareIcon, ArrowTopRightOnSquareIcon,
    MagnifyingGlassIcon, LinkIcon
} from '@heroicons/react/24/outline';
import { Facebook, Instagram, Twitter, Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import SectionCard from '../../components/ui/SectionCard';
import PageHeader from '../../components/ui/PageHeader';

const platforms = [
    { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-800', campaign: 'fb_ads', tip: 'Copy the link into your Facebook Ads Manager. Works best with Link ads.' },
    { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600', campaign: 'ig_ads', tip: 'Use in your Instagram bio link or Story/Reel ad creative.' },
    { key: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'from-sky-500 to-sky-700', campaign: 'tw_ads', tip: 'Best for Promoted Posts and X Ads campaigns.' },
];

const buildAdUrl = (productId, platform) => {
    const utmParams = new URLSearchParams({
        utm_source: platform.key,
        utm_medium: 'cpc',
        utm_campaign: platform.campaign,
        utm_content: productId,
        utm_term: 'order_now',
    });
    return `${window.location.origin}/order/${productId}?${utmParams.toString()}`;
};

const AdSetup = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [copied, setCopied] = useState(false);

    // Debounce search so we only hit the API as the user types
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ['ad-product-search', debouncedSearch],
        queryFn: () => productService.getAllProducts({ search: debouncedSearch, limit: 8 }),
        enabled: debouncedSearch.trim().length >= 1,
        placeholderData: keepPreviousData,
    });

    const results = data?.data || [];

    const adUrl = selectedProduct ? buildAdUrl(selectedProduct.id, selectedPlatform) : null;

    const copyLink = () => {
        navigator.clipboard.writeText(adUrl);
        setCopied(true);
        toast.success('Ad link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const stepClass = (done) =>
        done ? 'border-brand-500 dark:border-gold-500 bg-brand-50/50 dark:bg-brand-800/30' : 'border-slate-200 dark:border-brand-700';

    return (
        <div className="space-y-6">
            <PageHeader
                icon={MegaphoneIcon}
                title="Ad Campaign Setup"
                description="Pick a product, choose a platform, and generate a tracking link on demand"
            />

            {/* Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-brand-800 via-brand-900 to-brand-950 rounded-3xl p-6 text-white"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                        <ShareIcon className="w-8 h-8 text-gold-400" />
                        <h3 className="text-lg font-bold">How It Works</h3>
                    </div>
                    <ol className="space-y-2 text-sm text-brand-200">
                        <li>1. Search and select the product you want to advertise</li>
                        <li>2. Choose the social platform for the campaign</li>
                        <li>3. Copy the generated tracking link and paste it into your ad</li>
                        <li>4. Orders coming through the link are tracked automatically</li>
                    </ol>
                </div>
            </motion.div>

            {/* Step 1: Select Product */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <SectionCard
                    title="Step 1 — Select Product"
                    subtitle="Search your catalog and pick the product to advertise"
                >
                    <div className={selectedProduct ? 'hidden' : ''}>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products by name, SKU, or description..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-brand-800 border border-slate-200 dark:border-brand-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                                autoFocus
                            />
                        </div>

                        {search.trim().length === 0 ? (
                            <div className="text-center py-10">
                                <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Start typing to find a product</p>
                            </div>
                        ) : isLoading ? (
                            <div className="space-y-2 mt-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                                        <div className="h-10 w-10 bg-slate-200 dark:bg-brand-700 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-48 bg-slate-200 dark:bg-brand-700 rounded" />
                                            <div className="h-3 w-24 bg-slate-200 dark:bg-brand-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-10">
                                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No products match "{search}"</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-brand-700 mt-2 max-h-80 overflow-y-auto">
                                {results.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => { setSelectedProduct(product); setSearch(''); }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-brand-50/50 dark:hover:bg-brand-800/30 rounded-xl transition-colors text-left"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-brand-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-brand-800 dark:text-white truncate">{product.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{product.sku} • ₦{product.price?.toLocaleString()}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedProduct && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-brand-500 dark:border-gold-500 bg-brand-50/50 dark:bg-brand-800/30">
                            <div className="h-14 w-14 rounded-xl bg-white dark:bg-brand-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                {selectedProduct.imageUrl ? (
                                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Package className="w-7 h-7 text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-brand-800 dark:text-white truncate">{selectedProduct.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{selectedProduct.sku} • ₦{selectedProduct.price?.toLocaleString()} • Qty: {selectedProduct.quantity}</p>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-gold-400 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-lg transition-colors"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </SectionCard>
            </motion.div>

            {/* Step 2: Select Platform */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionCard
                    title="Step 2 — Select Platform"
                    subtitle="Choose where the ad will run"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {platforms.map(platform => (
                            <button
                                key={platform.key}
                                onClick={() => setSelectedPlatform(platform)}
                                disabled={!selectedProduct}
                                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedPlatform.key === platform.key && selectedProduct
                                    ? `bg-gradient-to-br ${platform.color} text-white shadow-lg border-transparent`
                                    : 'bg-white dark:bg-brand-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-brand-700 hover:border-slate-300'
                                    }`}
                            >
                                <platform.icon className="w-7 h-7" />
                                {platform.name}
                            </button>
                        ))}
                    </div>
                    {!selectedProduct && (
                        <p className="text-xs text-slate-400 mt-3 text-center">Select a product first to enable platform choice</p>
                    )}
                </SectionCard>
            </motion.div>

            {/* Step 3: Generated Link */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <SectionCard
                    title="Step 3 — Generated Ad Link"
                    subtitle="Copy this link into your ad campaign"
                >
                    {!selectedProduct ? (
                        <div className="text-center py-12">
                            <LinkIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No link generated yet</p>
                            <p className="text-sm text-slate-400 mt-1">Select a product in Step 1 to generate your tracking link</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className={`rounded-2xl border-2 p-4 ${stepClass(true)}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <selectedPlatform.icon className="w-4 h-4 text-brand-600 dark:text-gold-400" />
                                    <p className="text-xs font-bold text-brand-800 dark:text-slate-200 uppercase">
                                        {selectedPlatform.name} Tracking Link
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={adUrl}
                                        readOnly
                                        className="flex-1 text-xs sm:text-sm bg-white dark:bg-brand-800 border border-slate-200 dark:border-brand-700 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 font-mono truncate"
                                    />
                                    <button
                                        onClick={copyLink}
                                        className={`px-5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all flex-shrink-0 ${copied
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gradient-to-r from-brand-700 to-brand-900 text-white hover:from-brand-800 hover:to-brand-950 shadow-lg shadow-brand-500/25'
                                            }`}
                                    >
                                        {copied ? <CheckCircleIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                    <a
                                        href={adUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 border border-slate-200 dark:border-brand-700 rounded-xl hover:bg-white dark:hover:bg-brand-800 transition-colors text-slate-400 flex items-center flex-shrink-0"
                                        title="Preview product page"
                                    >
                                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                    </a>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].map(key => (
                                        <span key={key} className="text-[10px] px-2 py-1 bg-white dark:bg-brand-800 border border-slate-200 dark:border-brand-700 text-slate-500 rounded-full font-mono">
                                            {key}={new URLSearchParams(adUrl.split('?')[1]).get(key)}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl">
                                <p className="text-sm text-gold-800 dark:text-gold-400">
                                    <strong>{selectedPlatform.name} tip:</strong> {selectedPlatform.tip}
                                </p>
                            </div>
                        </div>
                    )}
                </SectionCard>
            </motion.div>
        </div>
    );
};

export default AdSetup;
