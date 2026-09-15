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
    Layers,
    CheckCircle2,
    ArrowLeft,
    Check,
} from 'lucide-react';

export default function RootSyaratIndex({
    syarat = [],
    bidang = [],
    bidangId = null,
    layanan = [],
    layananId = null,
    allLayanan = [],
}) {
    // Filter states
    const [selectedBidang, setSelectedBidang] = useState(bidangId ? String(bidangId) : (bidang[0]?.id ? String(bidang[0].id) : ''));
    const [selectedLayanan, setSelectedLayanan] = useState(layananId ? String(layananId) : '');
    const [searchQuery, setSearchQuery] = useState('');
    const [metodeFilter, setMetodeFilter] = useState('ALL'); // 'ALL' | 'simpeg' | 'upload'
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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

    // Available layanan for currently selected bidang
    const availableLayanan = useMemo(() => {
        if (!selectedBidang) return [];
        return allLayanan.filter((l) => String(l.kode_bidang) === String(selectedBidang));
    }, [allLayanan, selectedBidang]);

    // Handle Bidang Change
    const handleBidangChange = (newBidangId) => {
        setSelectedBidang(newBidangId);
        setSelectedLayanan('');
        setCurrentPage(1);

        router.get(
            '/root/syarat',
            { bidang: newBidangId },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Handle Layanan Change
    const handleLayananChange = (newLayananId) => {
        setSelectedLayanan(newLayananId);
        setCurrentPage(1);
        setSearchQuery('');
        setMetodeFilter('ALL');

        if (newLayananId) {
            router.get(
                '/root/syarat',
                { bidang: selectedBidang, layanan: newLayananId },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        } else {
            router.get(
                '/root/syarat',
                { bidang: selectedBidang },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }
    };

    // Quick Stats Calculation
    const stats = useMemo(() => {
        const total = syarat.length;
        const simpeg = syarat.filter((s) => s.metode === 'simpeg').length;
        const upload = syarat.filter((s) => s.metode === 'upload').length;
        const activeLayananName =
            availableLayanan.find((l) => String(l.id) === String(selectedLayanan))?.nama_layanan || null;

        return { total, simpeg, upload, activeLayananName };
    }, [syarat, availableLayanan, selectedLayanan]);

    // Filtered data client-side (search & quick method filter)
    const filteredSyarat = useMemo(() => {
        return syarat.filter((item) => {
            // Metode filter
            if (metodeFilter !== 'ALL') {
                if (item.metode !== metodeFilter) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const namaSyarat = (item.syarat || '').toLowerCase();
                const efileName = (item.kode_efile || '').toLowerCase();
                const desc = (item.deskripsi || '').toLowerCase();
                return namaSyarat.includes(q) || efileName.includes(q) || desc.includes(q);
            }

            return true;
        });
    }, [syarat, metodeFilter, searchQuery]);

    // Paginated slice
    const paginatedSyarat = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredSyarat.slice(start, start + perPage);
    }, [filteredSyarat, currentPage, perPage]);

    // Pagination metadata
    const paginationMeta = useMemo(() => {
        const total = filteredSyarat.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        return {
            current_page: currentPage,
            last_page: lastPage,
            from: total === 0 ? 0 : (currentPage - 1) * perPage + 1,
            to: Math.min(total, currentPage * perPage),
            total: total,
            per_page: perPage,
        };
    }, [filteredSyarat.length, currentPage, perPage]);

    // Quick Metric Card Click
    const handleQuickFilter = (metode) => {
        setMetodeFilter(metode);
        setCurrentPage(1);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setMetodeFilter('ALL');
        setCurrentPage(1);
    };

    // Handle Confirm Delete
    const handleConfirmDelete = () => {
        if (!deleteModal.item) return;

        setDeleteModal((prev) => ({ ...prev, loading: true }));

        router.delete(`/root/syarat/${deleteModal.item.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ open: false, item: null, loading: false });
            },
            onError: () => {
                setDeleteModal((prev) => ({ ...prev, loading: false }));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Persyaratan Layanan" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Master Persyaratan Layanan
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola daftar dokumen persyaratan, metode integrasi SIMPEG, dan berkas unggahan
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href={
                                selectedLayanan
                                    ? `/root/syarat/create?bidang=${selectedBidang}&layanan=${selectedLayanan}`
                                    : '/root/syarat/create'
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Syarat Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Metric Cards (Interactive Stats) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Total Persyaratan */}
                    <div
                        onClick={() => handleQuickFilter('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            metodeFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Persyaratan
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Semua
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {stats.total}
                        </div>
                    </div>

                    {/* Integrasi SIMPEG */}
                    <div
                        onClick={() => handleQuickFilter('simpeg')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            metodeFilter === 'simpeg'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Integrasi SIMPEG
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 flex items-center gap-1">
                                <Cloud className="w-3 h-3" />
                                SIMPEG
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                            {stats.simpeg}
                        </div>
                    </div>

                    {/* Upload Manual */}
                    <div
                        onClick={() => handleQuickFilter('upload')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            metodeFilter === 'upload'
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Upload Manual
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                Upload
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                            {stats.upload}
                        </div>
                    </div>
                </div>

                {/* 3. Card Toolbar Filter Terpadu (Sesuai Gambar 1 & Seksi 4 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search */}
                        <div className="lg:col-span-4 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari nama syarat, e-file, deskripsi..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Bidang Pengampu */}
                        <div className="lg:col-span-3 relative">
                            <div className="relative">
                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={selectedBidang}
                                    onChange={(e) => handleBidangChange(e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    {bidang.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filter Layanan */}
                        <div className="lg:col-span-3 relative">
                            <div className="relative">
                                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={selectedLayanan}
                                    onChange={(e) => handleLayananChange(e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="">-- Pilih Layanan --</option>
                                    {availableLayanan.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filter Per Page */}
                        <div className="lg:col-span-2 relative">
                            <div className="relative">
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
                </div>

                {/* 4. Single Responsive Data Table Card */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {!selectedLayanan ? (
                        /* Empty State: Belum pilih layanan */
                        <div className="py-16 px-4 text-center">
                            <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Pilih Layanan Terlebih Dahulu
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Silakan pilih jenis layanan pada dropdown toolbar di atas untuk menampilkan dan mengelola daftar dokumen persyaratannya.
                            </p>
                        </div>
                    ) : paginatedSyarat.length === 0 ? (
                        /* Empty State: Layanan terpilih tapi syarat kosong */
                        <div className="py-16 px-4 text-center">
                            <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Belum Ada Persyaratan Layanan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery || metodeFilter !== 'ALL'
                                    ? 'Tidak ada persyaratan yang cocok dengan kata kunci atau filter metode yang dipilih.'
                                    : `Belum ada dokumen persyaratan yang ditambahkan untuk ${stats.activeLayananName || 'layanan ini'}.`}
                            </p>
                            {searchQuery || metodeFilter !== 'ALL' ? (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                >
                                    <span>Reset Filter & Pencarian</span>
                                </button>
                            ) : (
                                <Link
                                    href={`/root/syarat/create?bidang=${selectedBidang}&layanan=${selectedLayanan}`}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Syarat Sekarang</span>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-4 text-center w-14">No</th>
                                        <th className="py-3 px-4 w-52">Layanan & Bidang</th>
                                        <th className="py-3 px-4">Nama Dokumen Persyaratan</th>
                                        <th className="py-3 px-4 w-56">Metode Pengambilan</th>
                                        <th className="py-3 px-4 text-center w-24">Deskripsi</th>
                                        <th className="py-3 px-4 text-center w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                    {paginatedSyarat.map((item, idx) => {
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

                                                {/* Layanan & Bidang */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1" title={item.layanan?.nama_layanan || '-'}>
                                                        {item.layanan?.nama_layanan || '-'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                        {item.layanan?.bidang?.nama_bidang || '-'}
                                                    </div>
                                                </td>

                                                {/* Nama Dokumen Persyaratan */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {item.syarat}
                                                    </div>
                                                </td>

                                                {/* Metode Pengambilan */}
                                                <td className="py-3.5 px-4">
                                                    {item.metode === 'simpeg' ? (
                                                        <div className="space-y-1">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                                                <Cloud className="w-3 h-3 text-blue-500" />
                                                                SIMPEG
                                                            </span>
                                                            {item.kode_efile && (
                                                                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 line-clamp-1" title={item.kode_efile}>
                                                                    e-file: {item.kode_efile}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                                            <Upload className="w-3 h-3 text-amber-500" />
                                                            Upload Manual
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Deskripsi Modal */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDetailModal({ open: true, item: item })}
                                                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                        title="Lihat Rincian Syarat"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>

                                                {/* Kolom Aksi */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Edit Link - Sesuai Seksi 6 Standard.md: Amber/Orange */}
                                                        <Link
                                                            href={`/root/syarat/${item.id}`}
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                            title="Edit Dokumen Syarat"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>

                                                        {/* Delete Button - Sesuai Seksi 6 Standard.md: Merah Rose */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteModal({ open: true, item: item, loading: false })}
                                                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                                            title="Hapus Persyaratan"
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
                    )}
                </div>

                {/* 5. Pagination (Bagian 7 Standard.md) */}
                {selectedLayanan && filteredSyarat.length > 0 && (
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

            {/* Modal Deskripsi Layanan */}
            {detailModal.open && detailModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Deskripsi Layanan
                                    </h3>
                                    <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                        {detailModal.item.layanan?.nama_layanan || '-'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModal({ open: false, item: null })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Bidang Pengampu:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {detailModal.item.layanan?.bidang?.nama_bidang || '-'}
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

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                onClick={() => setDetailModal({ open: false, item: null })}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <span>Tutup</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {deleteModal.open && deleteModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Hapus Dokumen Persyaratan
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Tindakan ini tidak dapat dibatalkan
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={() => setDeleteModal({ open: false, item: null, loading: false })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Apakah Anda yakin ingin menghapus persyaratan berikut?
                            </p>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 font-bold text-xs">
                                    <CheckSquare className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                        {deleteModal.item.syarat}
                                    </div>
                                    <div className="text-slate-400 text-[11px] mt-0.5">
                                        Layanan: {deleteModal.item.layanan?.nama_layanan || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={() => setDeleteModal({ open: false, item: null, loading: false })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Batal</span>
                            </button>
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={handleConfirmDelete}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
                            >
                                {deleteModal.loading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
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
