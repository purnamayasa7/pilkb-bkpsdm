import React from 'react';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    totalItems = 0,
    perPage = 10,
    pagination = null,
    className = '',
}) {
    // Dukung prop 'pagination' terpadu maupun prop individual
    const activeCurrentPage = pagination?.current_page ?? currentPage;
    const activeTotalPages = pagination?.last_page ?? totalPages;
    const activeTotalItems = pagination?.total ?? totalItems;
    const activePerPage = pagination?.per_page ?? perPage;

    if (activeTotalPages <= 1 && activeTotalItems === 0) return null;

    const startItem = activeTotalItems === 0 ? 0 : (activeCurrentPage - 1) * activePerPage + 1;
    const endItem = Math.min(activeCurrentPage * activePerPage, activeTotalItems);

    return (
        <div
            className={`p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
        >
            <span className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan data{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {startItem}
                </span>{' '}
                -{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {endItem}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {activeTotalItems}
                </span>{' '}
                data
            </span>
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={activeCurrentPage <= 1}
                    onClick={() => onPageChange && onPageChange(Math.max(1, activeCurrentPage - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                    Sebelumnya
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    {activeCurrentPage} / {activeTotalPages}
                </span>
                <button
                    type="button"
                    disabled={activeCurrentPage >= activeTotalPages}
                    onClick={() => onPageChange && onPageChange(Math.min(activeTotalPages, activeCurrentPage + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                    Berikutnya
                </button>
            </div>
        </div>
    );
}
