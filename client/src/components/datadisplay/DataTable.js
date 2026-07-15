import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const DataTable = ({
    columns,
    data,
    pagination,
    onPageChange,
    onSort,
    onSearch,
    onFilter,
    loading = false,
    emptyMessage = 'No data found',
    className = ''
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
        if (onSort) onSort(key, direction);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        const timeoutId = setTimeout(() => {
            if (onSearch) onSearch(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {onFilter && (
                        <button
                            onClick={onFilter}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    {column.sortable ? (
                                        <button
                                            onClick={() => handleSort(column.key)}
                                            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                        >
                                            {column.label}
                                            <span className="flex flex-col">
                                                <ChevronUp className={`h-3 w-3 ${sortConfig.key === column.key && sortConfig.direction === 'asc'
                                                        ? 'text-indigo-500'
                                                        : 'text-gray-400'
                                                    }`} />
                                                <ChevronDown className={`h-3 w-3 -mt-1 ${sortConfig.key === column.key && sortConfig.direction === 'desc'
                                                        ? 'text-indigo-500'
                                                        : 'text-gray-400'
                                                    }`} />
                                            </span>
                                        </button>
                                    ) : (
                                        column.label
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <AnimatePresence>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <motion.tr
                                        key={row.id || rowIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: rowIndex * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        {columns.map((column) => (
                                            <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                                {column.render ? column.render(row) : row[column.key]}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(page =>
                                page === 1 ||
                                page === pagination.totalPages ||
                                Math.abs(page - pagination.page) <= 2
                            )
                            .map((page, index, array) => (
                                <React.Fragment key={page}>
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                        <span className="text-gray-400">...</span>
                                    )}
                                    <button
                                        onClick={() => onPageChange(page)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${page === pagination.page
                                                ? 'bg-indigo-600 text-white'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            ))}

                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;