import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    MegaphoneIcon, LinkIcon, ClipboardDocumentIcon,
    CheckCircleIcon, ShareIcon, ArrowTopRightOnSquareIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import SectionCard from '../../components/ui/SectionCard';
import PageHeader from '../../components/ui/PageHeader';

const platforms = [
    { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-800', bgLight: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600' },
    { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600', bgLight: 'bg-pink-50 dark:bg-pink-900/20', textColor: 'text-pink-600' },
    { key: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'from-sky-500 to-sky-700', bgLight: 'bg-sky-50 dark:bg-sky-900/20', textColor: 'text-sky-600' },
];

const AdSetup = () => {
    const [selectedPlatform, setSelectedPlatform] = useState('facebook');
    const [copiedId, setCopiedId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['products-ads', selectedPlatform],
        queryFn: () => productService.getProductsForAds(selectedPlatform)
    });

    const copyLink = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Link copied!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                icon={MegaphoneIcon}
                title="Ad Campaign Setup"
                description="Generate tracking links for social media advertising"
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
                        <li>1. Select a product and platform below</li>
                        <li>2. Copy the generated tracking link with UTM parameters</li>
                        <li>3. Use the link in your social media ads (Facebook Ads, Instagram, Twitter Ads)</li>
                        <li>4. Orders from these links are automatically tracked in the system</li>
                    </ol>
                </div>
            </motion.div>

            {/* Platform Selector */}
            <div className="flex gap-2 flex-wrap">
                {platforms.map(platform => (
                    <button
                        key={platform.key}
                        onClick={() => setSelectedPlatform(platform.key)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${selectedPlatform === platform.key
                            ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                            : 'bg-white dark:bg-brand-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-brand-700 hover:bg-slate-50 dark:hover:bg-brand-800'
                            }`}
                    >
                        <platform.icon className="w-5 h-5" />
                        {platform.name}
                    </button>
                ))}
            </div>

            {/* Product Links */}
            <SectionCard title="Product Ad Links" subtitle="Click to copy tracking links">
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                                <div className="h-12 w-12 bg-slate-200 dark:bg-brand-700 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 bg-slate-200 dark:bg-brand-700 rounded" />
                                    <div className="h-3 w-full bg-slate-200 dark:bg-brand-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-brand-700">
                        {data?.products?.map(product => (
                            <div key={product.id} className="py-4 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-brand-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <GlobeAltIcon className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-brand-800 dark:text-white truncate">{product.name}</p>
                                        <p className="text-sm text-slate-500">${product.price?.toFixed(2)}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={product.adUrl || ''}
                                                readOnly
                                                className="flex-1 text-xs bg-slate-50 dark:bg-brand-800 border border-slate-200 dark:border-brand-700 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-400 truncate font-mono"
                                            />
                                            <button
                                                onClick={() => copyLink(product.adUrl, product.id)}
                                                className={`p-2 rounded-lg transition-colors ${copiedId === product.id
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                                    : 'hover:bg-slate-100 dark:hover:bg-brand-800 text-slate-400'
                                                    }`}
                                            >
                                                {copiedId === product.id ? (
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                ) : (
                                                    <ClipboardDocumentIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                            <a
                                                href={product.adUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-brand-800 rounded-lg transition-colors text-slate-400"
                                            >
                                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                            </a>
                                        </div>
                                        {product.utmParams && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {Object.entries(product.utmParams).map(([key, value]) => (
                                                    <span key={key} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-brand-800 text-slate-500 rounded-full font-mono">
                                                        {key}={value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!data?.products || data.products.length === 0) && (
                            <div className="text-center py-12">
                                <MegaphoneIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No products available for ads</p>
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default AdSetup;