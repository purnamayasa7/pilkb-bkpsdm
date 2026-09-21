import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    CheckSquare,
    Plus,
    Search,
    X,
    Filter,
    Eye,
    Edit3,
    Trash2,
    Cloud,
    Upload,
    FileText,
    ChevronDown,
    Building2,
    Briefcase,
    AlertCircle,
    Info,
    HelpCircle,
    Layers,
    ArrowUpDown,
    CheckCircle2,
} from 'lucide-react';

export default function SyaratBidangIndex({
    layanan = [],
    layananId = null,
    syarat = [],
    bidang = null,
}) {
    // Local filter states
    const [selectedLayanan, setSelectedLayanan] = useState(layananId ? String(layananId) : '');
    const [searchQuery, setSearchQuery] = useState('');
    const [metodeFilter, setMetodeFilter] = useState('ALL'); // 'ALL' | 'simpeg' | 'upload'
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Sync selectedLayanan when prop layananId changes
    useEffect(() => {
        setSelectedLayanan(layananId ? String(layananId) : '');
    }, [layananId]);

    // Modal states
    const [detailModal, setDetailModal] = useState({
        open: false,
        item: null,
    });

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        item: null,
        loading: false,
    });

    // Handle change of Layanan dropdown
    const handleLayananChange = (newId) => {
        setSelectedLayanan(newId);
        setCurrentPage(1);
        setSearchQuery('');
        setMetodeFilter('ALL');

        if (newId) {
            router.get(
                '/adminBidang/syarat',
                { layanan: newId },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        } else {
            router.get(
                '/adminBidang/syarat',
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }
    };

    // Calculate metrics
    const stats = useMemo(() => {
        const total = syarat.length;
        const simpeg = syarat.filter((s) => s.metode === 'simpeg').length;
        const upload = syarat.filter((s) => s.metode === 'upload').length;
        const activeLayananName =
            layanan.find((l) => String(l.id) === String(selectedLayanan))?.nama_layanan || null;

        return { total, simpeg, upload, activeLayananName };
    }, [syarat, layanan, selectedLayanan]);

    // Filtered data client-side for search & method filter
    const filteredSyarat = useMemo(() => {
        return syarat.filter((item) => {
            // Method filter
            if (metodeFilter !== 'ALL' && item.metode !== metodeFilter) {
                return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const textSyarat = (item.syarat || '').toLowerCase();
                const textEfile = (item.kode_efile || '').toLowerCase();
                const textDeskripsi = (item.deskripsi || '').toLowerCase();
                const textLayanan = (item.layanan?.nama_layanan || '').toLowerCase();

                return (
                    textSyarat.includes(q) ||
                    textEfile.includes(q) ||
                    textDeskripsi.includes(q) ||
                    textLayanan.includes(q)
                );
            }

            return true;
        });
    }, [syarat, metodeFilter, searchQuery]);

    // Pagination calculations
    const totalItems = filteredSyarat.length;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const paginatedSyarat = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredSyarat.slice(start, start + perPage);
    }, [filteredSyarat, currentPage, perPage]);

    // Handle Quick Filter click on metric card
    const handleQuickFilter = (metode) => {
        setMetodeFilter(metode);
        setCurrentPage(1);
    };

    // Handle Delete Confirm
    const handleConfirmDelete = () => {
        if (!deleteModal.item) return;

        setDeleteModal((prev) => ({ ...prev, loading: true }));

        router.delete(`/adminBidang/syarat/${deleteModal.item.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ open: false, item: null, loading: false });
            },
            onError: () => {
                setDeleteModal((prev) => ({ ...prev, loading: false }));
            },
        });
    };

    const namaBidang = bidang?.nama_bidang || 'Bidang';

    return (
        <AuthenticatedLayout>
            <Head title={`Persyaratan Layanan - ${namaBidang} - PILKB`} />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4.1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <CheckSquare className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Persyaratan Layanan - {namaBidang}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Kelola kelengkapan dokumen persyaratan dan integrasi e-File SIMPEG untuk setiap layanan kepegawaian bidang Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Tombol Tambah Syarat Baru (Standar Baru Bagian 4.1 Standard.md) */}
                        <Link
                            href={
                                selectedLayanan
                                    ? `/adminBidang/syarat/create?layanan=${selectedLayanan}`
                                    : '/adminBidang/syarat/create'
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Syarat Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. METRIC STATS CARDS (Bagian 4.2 & Bagian 5 Standard.md) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Total Syarat */}
                    <div
                        onClick={() => handleQuickFilter('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            metodeFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Syarat
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Dokumen
                            </span>
                        </div>
                    </div>

                    {/* Metode SIMPEG */}
                    <div
                        onClick={() => handleQuickFilter('simpeg')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            metodeFilter === 'simpeg'
                                ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Metode SIMPEG
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                                {stats.simpeg}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                                Terhubung
                            </span>
                        </div>
                    </div>

                    {/* Metode Upload */}
                    <div
                        onClick={() => handleQuickFilter('upload')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            metodeFilter === 'upload'
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Upload PILKB
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {stats.upload}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                File Manual
                            </span>
                        </div>
                    </div>

                    {/* Layanan Terpilih */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Layanan Aktif
                        </span>
                        <div className="mt-2">
                            <span
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 line-clamp-2"
                                title={stats.activeLayananName || 'Belum Dipilih'}
                            >
                                {stats.activeLayananName || 'Belum Memilih Layanan'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. UNIFIED FILTER TOOLBAR CARD (Bagian 4.3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Dropdown Pemilih Layanan (lg:col-span-5) */}
                        <div className="lg:col-span-5 relative">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Pilih Layanan Bidang
                            </label>
                            <div className="relative">
                                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={selectedLayanan}
                                    onChange={(e) => handleLayananChange(e.target.value)}
                                    className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>-- Pilih Layanan untuk Memuat Syarat --</option>
                                    {layanan.map((item) => (
                                        <option key={item.id} value={String(item.id)}>
                                            {item.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Input Pencarian Live Search (lg:col-span-3) */}
                        <div className="lg:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Cari Syarat
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    disabled={!selectedLayanan}
                                    placeholder="Cari nama dokumen..."
                                    className="w-full pl-10 pr-9 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Filter Metode (lg:col-span-2) */}
                        <div className="lg:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Metode
                            </label>
                            <div className="relative">
                                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={metodeFilter}
                                    onChange={(e) => {
                                        setMetodeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    disabled={!selectedLayanan}
                                    className="w-full pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <option value="ALL">Semua</option>
                                    <option value="simpeg">SIMPEG</option>
                                    <option value="upload">Upload</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Dropdown Jumlah Per Halaman (lg:col-span-2) */}
                        <div className="lg:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Tampilkan
                            </label>
                            <div className="relative">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    disabled={!selectedLayanan}
                                    className="w-full px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

                {/* 4. SINGLE DATA TABLE CARD (Bagian 3.1 & Bagian 4.4 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {!selectedLayanan ? (
                        /* Empty State: Belum Memilih Layanan (Bagian 8 Standard.md) */
                        <div className="py-16 px-4 text-center">
                            <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Layanan Belum Dipilih
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Silakan pilih salah satu Layanan pada kotak filter di atas untuk menampilkan seluruh daftar persyaratan dokumen.
                            </p>
                        </div>
                    ) : filteredSyarat.length === 0 ? (
                        /* Empty State: Data Kosong / Tidak Ditemukan */
                        <div className="py-16 px-4 text-center">
                            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {searchQuery || metodeFilter !== 'ALL'
                                    ? 'Persyaratan Tidak Ditemukan'
                                    : 'Belum Ada Persyaratan Terdaftar'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery || metodeFilter !== 'ALL'
                                    ? 'Tidak ada syarat yang cocok dengan filter pencarian Anda.'
                                    : 'Layanan ini belum memiliki daftar persyaratan dokumen kepegawaian.'}
                            </p>

                            {searchQuery || metodeFilter !== 'ALL' ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setMetodeFilter('ALL');
                                    }}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                    Reset Filter
                                </button>
                            ) : (
                                <Link
                                    href={`/adminBidang/syarat/create?layanan=${selectedLayanan}`}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Syarat Sekarang</span>
                                </Link>
                            )}
                        </div>
                    ) : (
                        /* Single Responsive Table */
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="py-3.5 px-4 w-12 text-center">No</th>
                                            <th className="py-3.5 px-4">Nama Layanan</th>
                                            <th className="py-3.5 px-4">Dokumen Persyaratan</th>
                                            <th className="py-3.5 px-4">Metode Dokumen</th>
                                            <th className="py-3.5 px-4">Jenis E-File SIMPEG</th>
                                            <th className="py-3.5 px-4 text-center w-24">Deskripsi</th>
                                            <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedSyarat.map((item, index) => {
                                            const itemNumber = (currentPage - 1) * perPage + index + 1;
                                            const namaLayanan = item.layanan?.nama_layanan || '-';

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    {/* 1. No */}
                                                    <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                                                        {itemNumber}
                                                    </td>

                                                    {/* 2. Nama Layanan (Bagian 6 Standard.md) */}
                                                    <td className="py-3.5 px-4">
                                                        <span
                                                            className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px]"
                                                            title={namaLayanan}
                                                        >
                                                            {namaLayanan}
                                                        </span>
                                                    </td>

                                                    {/* 3. Dokumen Persyaratan */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="space-y-0.5">
                                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                                {item.syarat}
                                                            </p>
                                                            {item.deskripsi && (
                                                                <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm" title={item.deskripsi}>
                                                                    {item.deskripsi}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* 4. Metode Dokumen */}
                                                    <td className="py-3.5 px-4">
                                                        {item.metode === 'simpeg' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-900/50">
                                                                <Cloud className="w-3.5 h-3.5" />
                                                                <span>SIMPEG</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                                                <Upload className="w-3.5 h-3.5" />
                                                                <span>Upload PILKB</span>
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* 5. Jenis E-File SIMPEG */}
                                                    <td className="py-3.5 px-4">
                                                        {item.metode === 'simpeg' && item.kode_efile ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                                {item.kode_efile}
                                                            </span>
                                                        ) : item.metode === 'simpeg' ? (
                                                            <span className="text-slate-400 text-xs italic">
                                                                Semua berkas terkait
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">-</span>
                                                        )}
                                                    </td>

                                                    {/* 6. Deskripsi Layanan Modal */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDetailModal({ open: true, item })}
                                                            title="Lihat Deskripsi Layanan"
                                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>

                                                    {/* 7. Aksi */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {/* Tombol Edit (Orange / Amber) */}
                                                            <Link
                                                                href={`/adminBidang/syarat/${item.id}`}
                                                                title="Edit Syarat"
                                                                className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Link>

                                                            {/* Tombol Hapus (Merah) */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteModal({
                                                                        open: true,
                                                                        item,
                                                                        loading: false,
                                                                    })
                                                                }
                                                                title="Hapus Syarat"
                                                                className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (Bagian 7 Standard.md) */}
                            {totalItems > perPage && (
                                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={totalItems}
                                        perPage={perPage}
                                        onPageChange={(page) => setCurrentPage(page)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* MODAL DESKRIPSI LAYANAN */}
            {detailModal.open && detailModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <FileText className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Deskripsi Layanan
                                    </h3>
                                    <p className="text-xs text-slate-400 truncate max-w-xs">
                                        {detailModal.item.layanan?.nama_layanan || '-'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModal({ open: false, item: null })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Bidang:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {detailModal.item.layanan?.bidang?.nama_bidang || bidang?.nama_bidang || '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                                    <span className="text-slate-400">Nama Layanan:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {detailModal.item.layanan?.nama_layanan || '-'}
                                    </span>
                                </div>
                                {detailModal.item.layanan?.waktu_penyelesaian && (
                                    <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                                        <span className="text-slate-400">Estimasi Waktu:</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {detailModal.item.layanan.waktu_penyelesaian}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <span className="font-bold block text-slate-900 dark:text-white mb-1">
                                    Deskripsi / Penjelasan Layanan:
                                </span>
                                {detailModal.item.layanan?.deskripsi || 'Deskripsi detail belum diisi untuk layanan ini.'}
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDetailModal({ open: false, item: null })}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS */}
            {deleteModal.open && deleteModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                            <span className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/40">
                                <Trash2 className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Hapus Persyaratan?
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Tindakan ini tidak dapat dibatalkan
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <p>
                                Anda yakin ingin menghapus persyaratan:
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                "{deleteModal.item.syarat}"
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Dari layanan: {deleteModal.item.layanan?.nama_layanan || '-'}
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={() => setDeleteModal({ open: false, item: null, loading: false })}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                            >
                                {deleteModal.loading ? (
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
