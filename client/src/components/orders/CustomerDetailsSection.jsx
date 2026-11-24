import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, Copy, Check, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard, formatCustomerForRider } from '../../utils/orderUtils';

/**
 * CustomerDetailsSection
 * Displays full customer details for an order with a dedicated "Copy for Rider" button.
 */
const CustomerDetailsSection = ({
    order,
    title = 'Customer Details',
    compact = false,
    className = ''
}) => {
    const [copied, setCopied] = useState(false);

    if (!order) return null;
    const customer = order.customer || {};

    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';
    const phone = customer.phone;
    const email = customer.email;
    const addressParts = [customer.address, customer.city, customer.state].filter(Boolean);
    const fullAddress = addressParts.join(', ') || 'N/A';

    const handleCopy = async (e) => {
        if (e) e.stopPropagation();
        const text = formatCustomerForRider(order);
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            toast.success('Customer details copied for rider!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <div className={`bg-slate-50/80 dark:bg-brand-800/40 rounded-xl p-3.5 sm:p-4 border border-slate-200/70 dark:border-brand-700/70 ${className}`}>
            {/* Header: Title & Copy Button */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200/60 dark:border-brand-700/60">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-lg bg-brand-100 dark:bg-brand-700 text-brand-700 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-800 dark:text-brand-200 truncate">
                        {title}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 flex-shrink-0 ${
                        copied
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-white dark:bg-brand-800 text-brand-700 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-brand-700 border border-slate-200 dark:border-brand-600 hover:border-gold-300'
                    }`}
                    title="Copy formatted customer details to send to Rider via WhatsApp or SMS"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy for Rider</span>
                        </>
                    )}
                </button>
            </div>

            {/* Customer Information Grid */}
            <div className={`grid gap-3 text-sm ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {/* Customer Name */}
                <div className="flex items-start gap-2.5 min-w-0">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Customer</p>
                        <p className="font-semibold text-brand-900 dark:text-white truncate">
                            {fullName}
                        </p>
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-slate-500 hover:underline flex items-center gap-1 mt-0.5 truncate"
                            >
                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{email}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Phone Number</p>
                        {phone ? (
                            <a
                                href={`tel:${phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-semibold text-brand-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1"
                            >
                                {phone}
                            </a>
                        ) : (
                            <p className="text-slate-400 text-sm">Not provided</p>
                        )}
                    </div>
                </div>

                {/* Delivery Address */}
                <div className={`flex items-start gap-2.5 min-w-0 ${compact ? '' : 'sm:col-span-2 lg:col-span-1'}`}>
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Delivery Address</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-sm break-words">
                            {fullAddress}
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes if present */}
            {order.notes && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-brand-700/50 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="break-words">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Notes: </span>
                        <span>{order.notes}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetailsSection;
