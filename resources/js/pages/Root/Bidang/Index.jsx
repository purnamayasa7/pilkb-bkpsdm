import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Layers,
    Plus,
    Search,
    X,
    Edit3,
    CheckCircle2,
    XCircle,
    Power,
    Check,
    ArrowLeft,
    Filter,
    ChevronDown,
} from 'lucide-react';

export default function RootBidangIndex({ bidang = [] }) {
    // Filter & search states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | '1' | '0'
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state for toggle status confirmation
    const [toggleModal, setToggleModal] = useState({
        open: false,
        bidang: null,
        loading: false,
    });

    // Statistics calculations
    const stats = useMemo(() => {
        const total = bidang.length;
        const aktif = bidang.filter((b) => b.aktif === true || b.aktif === 1).length;
        const nonaktif = total - aktif;
        return { total, aktif, nonaktif };
    }, [bidang]);

    // Filtered data based on search and status
    const filteredBidang = useMemo(() => {
        return bidang.filter((item) => {
            // Status filter
            if (statusFilter !== 'ALL') {
                const itemStatus = item.aktif ? '1' : '0';
                if (itemStatus !== statusFilter) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchNama = String(item.nama_bidang || '').toLowerCase().includes(q);
                const matchId = String(item.id || '').toLowerCase().includes(q);
                if (!matchNama && !matchId) return false;
            }

            return true;
        });
    }, [bidang, statusFilter, searchQuery]);

    // Reset pagination to page 1 whenever filters change
    const handleSearchChange = (val) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (val) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const handlePerPageChange = (val) => {
        setPerPage(Number(val));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setCurrentPage(1);
    };

    // Paginated slice
    const paginatedBidang = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredBidang.slice(start, start + perPage);
    }, [filteredBidang, currentPage, perPage]);

    // Pagination metadata for Pagination component
    const paginationMeta = useMemo(() => {
        const total = filteredBidang.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        return {
            current_page: currentPage,
            last_page: lastPage,
            from: total === 0 ? 0 : (currentPage - 1) * perPage + 1,
            to: Math.min(total, currentPage * perPage),
            total: total,
            per_page: perPage,
        };
    }, [filteredBidang.length, currentPage, perPage]);

    // Toggle status handler
    const handleConfirmToggle = () => {
        if (!toggleModal.bidang) return;
        setToggleModal((prev) => ({ ...prev, loading: true }));

        router.put(
            `/root/bidang/${toggleModal.bidang.id}/toggle-aktif`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setToggleModal({ open: false, bidang: null, loading: false });
                },
                onError: () => {
                    setToggleModal((prev) => ({ ...prev, loading: false }));
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Bidang - PILKB" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Master Data Bidang
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola data bidang organisasi BKPSDM
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/root/bidang/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Bidang Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Metric Cards (Interactive Stats) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Total Bidang */}
                    <div
                        onClick={() => handleStatusFilterChange('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Bidang
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Semua
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {stats.total}
                        </div>
                    </div>

                    {/* Bidang Aktif */}
                    <div
                        onClick={() => handleStatusFilterChange('1')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === '1'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Bidang Aktif
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                Aktif
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                            {stats.aktif}
                        </div>
                    </div>

                    {/* Bidang Nonaktif */}
                    <div
                        onClick={() => handleStatusFilterChange('0')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === '0'
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Bidang Nonaktif
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                Nonaktif
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                            {stats.nonaktif}
                        </div>
                    </div>
                </div>

                {/* 3. Card Toolbar Filter Terpadu - Sesuai Seksi 4 Standard.md & Gambar 1 */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search */}
                        <div className="lg:col-span-6 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Cari nama bidang, ID bidang..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => handleSearchChange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter Dropdown - Wajib icon Filter & ChevronDown */}
                        <div className="lg:col-span-3 relative">
                            <div className="relative">
                                <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">Semua Status</option>
                                    <option value="1">Aktif</option>
                                    <option value="0">Tidak Aktif</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Per Page Dropdown - Wajib icon Layers & ChevronDown */}
                        <div className="lg:col-span-3 relative">
                            <div className="relative">
                                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value={10}>10 per hal</option>
                                    <option value={25}>25 per hal</option>
                                    <option value={50}>50 per hal</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Single Responsive Data Table Card */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {paginatedBidang.length === 0 ? (
                        /* 5. Empty State Card - Sesuai Seksi 8 Standard.md */
                        <div className="py-16 px-4 text-center">
                            <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Tidak Ada Data Bidang Ditemukan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Tidak ada bidang yang sesuai dengan kata kunci pencarian atau filter yang dipilih.'
                                    : 'Belum ada data bidang yang tersimpan di sistem.'}
                            </p>
                            {(searchQuery || statusFilter !== 'ALL') && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                >
                                    <span>Reset Filter & Pencarian</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-4 text-center w-14">No</th>
                                        <th className="py-3 px-4 w-36">ID Bidang</th>
                                        <th className="py-3 px-4">Nama Bidang</th>
                                        <th className="py-3 px-4 text-center w-32">Status</th>
                                        <th className="py-3 px-4 text-center w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                    {paginatedBidang.map((item, idx) => {
                                        const rowNumber = (currentPage - 1) * perPage + idx + 1;
                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                                                    {rowNumber}
                                                </td>

                                                {/* ID Bidang (Font Mono Badge) */}
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                                                        {item.id}
                                                    </span>
                                                </td>

                                                {/* Nama Bidang */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900/50">
                                                            <Layers className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span
                                                            className="font-semibold text-slate-900 dark:text-white"
                                                            title={item.nama_bidang}
                                                        >
                                                            {item.nama_bidang}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status Keaktifan */}
                                                <td className="py-3.5 px-4 text-center">
                                                    {item.aktif ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                                            <XCircle className="w-3 h-3 text-rose-500" />
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Kolom Aksi */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Edit Link - Sesuai Seksi 6 Standard.md: Amber/Orange */}
                                                        <Link
                                                            href={`/root/bidang/${item.id}`}
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                            title="Edit Nama / Status Bidang"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>

                                                        {/* Toggle Status Button - Sesuai Seksi 6 Standard.md */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setToggleModal({
                                                                    open: true,
                                                                    bidang: item,
                                                                    loading: false,
                                                                })
                                                            }
                                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                                item.aktif
                                                                    ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                                                                    : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                                            }`}
                                                            title={
                                                                item.aktif
                                                                    ? 'Nonaktifkan Bidang'
                                                                    : 'Aktifkan Bidang'
                                                            }
                                                        >
                                                            <Power className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 6. Pagination (Bagian 7 Standard.md) */}
                {filteredBidang.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={paginationMeta.last_page}
                        totalItems={paginationMeta.total}
                        perPage={perPage}
                        pagination={paginationMeta}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                )}
            </div>

            {/* Modal Konfirmasi Toggle Status */}
            {toggleModal.open && toggleModal.bidang && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`p-2 rounded-xl ${
                                        toggleModal.bidang.aktif
                                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    }`}
                                >
                                    <Power className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {toggleModal.bidang.aktif
                                            ? 'Nonaktifkan Bidang'
                                            : 'Aktifkan Bidang'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Ubah status ketersediaan bidang
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={() => setToggleModal({ open: false, bidang: null, loading: false })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Apakah Anda yakin ingin{' '}
                                <span className="font-bold">
                                    {toggleModal.bidang.aktif ? 'menonaktifkan' : 'mengaktifkan'}
                                </span>{' '}
                                bidang ini?
                            </p>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold text-xs">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {toggleModal.bidang.nama_bidang}
                                    </div>
                                    <div className="text-slate-400 font-mono text-[11px]">
                                        ID: {toggleModal.bidang.id}
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400 italic">
                                {toggleModal.bidang.aktif
                                    ? 'Saat dinonaktifkan, layanan di bawah bidang ini dapat dibatasi pengajuannya.'
                                    : 'Setelah diaktifkan, bidang ini akan kembali aktif dan dapat dipilih.'}
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={() => setToggleModal({ open: false, bidang: null, loading: false })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Batal</span>
                            </button>
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={handleConfirmToggle}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-white transition-colors shadow-2xs cursor-pointer ${
                                    toggleModal.bidang.aktif
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {toggleModal.loading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Ya, Lanjutkan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
