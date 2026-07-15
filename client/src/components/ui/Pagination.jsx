import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages, total, limit } = pagination;

    return (
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-brand-800/30 border-t border-slate-100 dark:border-brand-700 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-slate-200 dark:border-brand-600 rounded-xl text-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-brand-800 font-medium transition"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, index, arr) => (
                        <React.Fragment key={p}>
                            {index > 0 && arr[index - 1] !== p - 1 && (
                                <span className="px-2 py-2 text-slate-400">...</span>
                            )}
                            <button
                                onClick={() => onPageChange(p)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${page === p
                                        ? 'bg-gradient-to-r from-brand-700 to-brand-900 text-white shadow-md'
                                        : 'border border-slate-200 dark:border-brand-600 hover:bg-slate-100 dark:hover:bg-brand-800'
                                    }`}
                            >
                                {p}
                            </button>
                        </React.Fragment>
                    ))}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-slate-200 dark:border-brand-600 rounded-xl text-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-brand-800 font-medium transition"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;