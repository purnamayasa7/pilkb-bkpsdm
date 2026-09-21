import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    ListOrdered,
    Plus,
    Search,
    X,
    Eye,
    Edit3,
    Trash2,
    Building2,
    Briefcase,
    Layers,
    ChevronDown,
    AlertCircle,
    Activity,
    CheckCircle2,
} from 'lucide-react';

export default function RootStatusIndex({
    status = [],
    bidang = [],
    bidangId = 'all',
    layanan = [],
    layananId = 'all',
    allLayanan = [],
}) {
    // Client-side search & filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBidang, setSelectedBidang] = useState(bidangId || 'all');
    const [selectedLayanan, setSelectedLayanan] = useState(layananId || 'all');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Dynamic layanan options based on selected bidang
    const availableLayanan = useMemo(() => {
        if (!selectedBidang || selectedBidang === 'all') {
            return allLayanan;
        }
        return allLayanan.filter((item) => String(item.kode_bidang) === String(selectedBidang));
    }, [selectedBidang, allLayanan]);

    // Handle bidang dropdown change
    const handleBidangChange = (newBidangId) => {
        setSelectedBidang(newBidangId);
        setSelectedLayanan('all');
        setCurrentPage(1);
    };

    // Client-side filtering
    const filteredStatus = useMemo(() => {
        return status.filter((item) => {
            // Bidang match
            if (selectedBidang !== 'all') {
                const itemBidangId = item.layanan?.kode_bidang || item.layanan?.bidang?.id;
                if (String(itemBidangId) !== String(selectedBidang)) return false;
            }

            // Layanan match
            if (selectedLayanan !== 'all') {
                if (String(item.kode_layanan) !== String(selectedLayanan)) return false;
            }

            // Search query match
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const namaStatus = (item.status || '').toLowerCase();
                const namaLayanan = (item.layanan?.nama_layanan || '').toLowerCase();
                const namaBidang = (item.layanan?.bidang?.nama_bidang || '').toLowerCase();

                return (
                    namaStatus.includes(query) ||
                    namaLayanan.includes(query) ||
                    namaBidang.includes(query)
                );
            }

            return true;
        });
    }, [status, selectedBidang, selectedLayanan, searchQuery]);

    // Statistics
    const totalStatusCount = status.length;
    const totalBidangCount = bidang.length;
    const layananTerkonfigurasiCount = useMemo(() => {
        const set = new Set();
        status.forEach((item) => {
            if (item.kode_layanan) set.add(item.kode_layanan);
        });
        return set.size;
    }, [status]);

    // Pagination slice
    const totalPages = Math.ceil(filteredStatus.length / perPage) || 1;
    const paginatedStatus = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredStatus.slice(start, start + perPage);
    }, [filteredStatus, currentPage, perPage]);

    // Reset filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedBidang('all');
        setSelectedLayanan('all');
        setCurrentPage(1);
    };

    // Detail modal handler
    const handleOpenDetail = (item) => {
        setSelectedDetail(item);
        setDetailModalOpen(true);
    };

    // Delete modal handler
    const handleOpenDelete = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        setDeleting(true);

        router.delete(`/root/status/${itemToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
                setDeleting(false);
            },
            onError: () => {
                setDeleting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Status Layanan - PILKB" />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4.1 Standard.md) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <ListOrdered className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Master Status Layanan
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Kelola tahapan alur proses dan status penyelesaian untuk setiap layanan kepegawaian BKPSDM.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Tombol Tambah Status Baku */}
                        <Link
                            href={
                                selectedBidang !== 'all'
                                    ? `/root/status/create?bidang=${selectedBidang}${
                                          selectedLayanan !== 'all' ? `&layanan=${selectedLayanan}` : ''
                                      }`
                                    : '/root/status/create'
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Status Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. KARTU RINGKASAN STATISTIK (Metric Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Total Status */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Status Layanan
                            </span>
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                                <Activity className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {totalStatusCount}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                                Tahapan
                            </span>
                        </div>
                    </div>

                    {/* Bidang Pengampu */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Bidang
                            </span>
                            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                                <Building2 className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {totalBidangCount}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                                Bidang
                            </span>
                        </div>
                    </div>

                    {/* Total Layanan */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Layanan
                            </span>
                            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40">
                                <Briefcase className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {allLayanan.length}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                                Layanan
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Sesuai Gambar 1 & Seksi 4 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* 1. Live Search (lg:col-span-4) */}
                        <div className="lg:col-span-4 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari nama status, layanan, bidang..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCurrentPage(1);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* 2. Dropdown Filter Bidang (lg:col-span-3) */}
                        <div className="lg:col-span-3 relative">
                            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={selectedBidang}
                                onChange={(e) => handleBidangChange(e.target.value)}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="all">Semua Bidang</option>
                                {bidang.map((b) => (
                                    <option key={b.id} value={String(b.id)}>
                                        {b.nama_bidang}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* 3. Dropdown Filter Layanan (lg:col-span-3) */}
                        <div className="lg:col-span-3 relative">
                            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={selectedLayanan}
                                onChange={(e) => {
                                    setSelectedLayanan(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="all">Semua Layanan</option>
                                {availableLayanan.map((l) => (
                                    <option key={l.id} value={String(l.id)}>
                                        {l.nama_layanan}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* 4. Dropdown Per Page (lg:col-span-2) */}
                        <div className="lg:col-span-2 relative">
                            <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
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

                {/* 4. CARD TABEL DATA TUNGGAL */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="py-3.5 pl-6 pr-3 w-14">No</th>
                                    <th className="py-3.5 px-4 min-w-[260px]">Nama Layanan & Bidang</th>
                                    <th className="py-3.5 px-4 min-w-[240px]">Nama Status / Tahapan Alur</th>
                                    <th className="py-3.5 pl-4 pr-6 text-center w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                {paginatedStatus.length > 0 ? (
                                    paginatedStatus.map((item, index) => {
                                        const globalIndex = (currentPage - 1) * perPage + index + 1;
                                        const namaLayanan = item.layanan?.nama_layanan || '-';
                                        const namaBidang = item.layanan?.bidang?.nama_bidang || '-';

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="py-3.5 pl-6 pr-3 font-semibold text-slate-400 text-xs">
                                                    {globalIndex}
                                                </td>

                                                {/* Nama Layanan & Bidang */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className="font-semibold text-slate-900 dark:text-white line-clamp-2 max-w-[260px] block"
                                                        title={namaLayanan}
                                                    >
                                                        {namaLayanan}
                                                    </span>
                                                    <span
                                                        className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 block"
                                                        title={namaBidang}
                                                    >
                                                        {namaBidang}
                                                    </span>
                                                </td>

                                                {/* Nama Status / Tahapan Alur */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3.5 pl-4 pr-6">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Detail Modal */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDetail(item)}
                                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                            title="Detail Status"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {/* Edit Link */}
                                                        <Link
                                                            href={`/root/status/${item.id}`}
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                            title="Edit Status"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>

                                                        {/* Delete Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDelete(item)}
                                                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                                            title="Hapus Status"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-16 px-4 text-center">
                                            {/* Empty State Baku Sesuai Seksi 8 Standard.md */}
                                            <ListOrdered className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Status Layanan Tidak Ditemukan
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || selectedBidang !== 'all' || selectedLayanan !== 'all'
                                                    ? 'Tidak ada data status layanan yang sesuai dengan kriteria filter yang diterapkan.'
                                                    : 'Belum ada data tahapan status layanan yang tersimpan di sistem.'}
                                            </p>
                                            {(searchQuery || selectedBidang !== 'all' || selectedLayanan !== 'all') && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilters}
                                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    <span>Reset Filter</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {filteredStatus.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredStatus.length}
                            perPage={perPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </div>
            </div>

            {/* MODAL DETAIL STATUS */}
            {detailModalOpen && selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <ListOrdered className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Rincian Status Layanan
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        ID Status: #{selectedDetail.id}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                    Nama Status / Tahapan Alur
                                </span>
                                <p className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                                    {selectedDetail.status}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                                <div>
                                    <span className="text-[11px] font-medium text-slate-400 block">
                                        Nama Layanan
                                    </span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {selectedDetail.layanan?.nama_layanan || '-'}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                                    <span className="text-[11px] font-medium text-slate-400 block">
                                        Bidang
                                    </span>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                                        {selectedDetail.layanan?.bidang?.nama_bidang || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDetailModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS */}
            {deleteModalOpen && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                                <span className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/40">
                                    <Trash2 className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Hapus Status Layanan?
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Tindakan ini tidak dapat dibatalkan
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs space-y-1.5">
                            <p className="text-slate-600 dark:text-slate-300">
                                Anda akan menghapus status layanan:
                            </p>
                            <p className="font-bold text-slate-900 dark:text-white">
                                "{itemToDelete.status}"
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-400 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
                                Layanan: {itemToDelete.layanan?.nama_layanan || '-'}
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                            >
                                {deleting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Ya, Hapus</span>
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
