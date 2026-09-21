import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Briefcase,
    Plus,
    Search,
    X,
    Filter,
    Clock,
    Eye,
    Edit3,
    FileSpreadsheet,
    FileText,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Building2,
    Layers,
    Power,
    Check,
    ArrowLeft,
} from 'lucide-react';

export default function RootLayananIndex({ layanan = [], bidang = [], bidangId = 'all' }) {
    // States for filter, search, and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBidang, setSelectedBidang] = useState(bidangId || 'all');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | '1' | '0'
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef(null);

    // Modal states
    const [deskripsiModal, setDeskripsiModal] = useState({
        open: false,
        item: null,
    });

    const [toggleModal, setToggleModal] = useState({
        open: false,
        item: null,
        loading: false,
    });

    // Close export dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setExportOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Stats calculations
    const stats = useMemo(() => {
        const total = layanan.length;
        const aktif = layanan.filter((l) => l.aktif === 1 || l.aktif === true).length;
        const nonaktif = total - aktif;
        return { total, aktif, nonaktif };
    }, [layanan]);

    // Filtered data based on search, bidang, and status
    const filteredLayanan = useMemo(() => {
        return layanan.filter((item) => {
            // Bidang filter
            if (selectedBidang !== 'all') {
                const itemBidangId = String(item.kode_bidang || '');
                if (itemBidangId !== String(selectedBidang)) return false;
            }

            // Status filter
            if (statusFilter !== 'ALL') {
                const itemStatus = item.aktif ? '1' : '0';
                if (itemStatus !== statusFilter) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const nama = (item.nama_layanan || '').toLowerCase();
                const namaBidang = (item.bidang?.nama_bidang || '').toLowerCase();
                const waktu = (item.waktu_penyelesaian || '').toLowerCase();
                const desc = (item.deskripsi || '').toLowerCase();

                return nama.includes(q) || namaBidang.includes(q) || waktu.includes(q) || desc.includes(q);
            }

            return true;
        });
    }, [layanan, selectedBidang, statusFilter, searchQuery]);

    // Reset pagination to page 1 on filter changes
    const handleSearchChange = (val) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleBidangChange = (val) => {
        setSelectedBidang(val);
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
        setSelectedBidang('all');
        setStatusFilter('ALL');
        setCurrentPage(1);
    };

    // Paginated slice
    const paginatedLayanan = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredLayanan.slice(start, start + perPage);
    }, [filteredLayanan, currentPage, perPage]);

    // Pagination metadata for Pagination component
    const paginationMeta = useMemo(() => {
        const total = filteredLayanan.length;
        const lastPage = Math.ceil(total / perPage) || 1;
        return {
            current_page: currentPage,
            last_page: lastPage,
            from: total === 0 ? 0 : (currentPage - 1) * perPage + 1,
            to: Math.min(total, currentPage * perPage),
            total: total,
            per_page: perPage,
        };
    }, [filteredLayanan.length, currentPage, perPage]);

    // Handle Confirm Toggle Status
    const handleConfirmToggle = () => {
        if (!toggleModal.item) return;

        setToggleModal((prev) => ({ ...prev, loading: true }));

        router.put(
            `/root/layanan/${toggleModal.item.id}/toggle-aktif`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setToggleModal({ open: false, item: null, loading: false });
                },
                onError: () => {
                    setToggleModal((prev) => ({ ...prev, loading: false }));
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Layanan - PILKB" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Master Data Layanan
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola seluruh jenis layanan kepegawaian BKPSDM, persyaratan, dan estimasi waktu
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        {/* Dropdown Export */}
                        <div className="relative" ref={exportRef}>
                            <button
                                type="button"
                                onClick={() => setExportOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                <span>Export Data</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {exportOpen && (
                                <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-30">
                                    <a
                                        href="/root/layanan/export-excel"
                                        onClick={() => setExportOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                        <span>Export Excel</span>
                                    </a>
                                    <a
                                        href="/root/layanan/export-pdf"
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setExportOpen(false)}
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-rose-600" />
                                        <span>Export PDF</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Tombol Tambah Layanan Baru */}
                        <Link
                            href="/root/layanan/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Layanan Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Metric Cards (Interactive Stats) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Total Layanan */}
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
                                Total Layanan
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Semua
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {stats.total}
                        </div>
                    </div>

                    {/* Layanan Aktif */}
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
                                Layanan Aktif
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                Aktif
                            </span>
                        </div>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                            {stats.aktif}
                        </div>
                    </div>

                    {/* Layanan Nonaktif */}
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
                                Layanan Nonaktif
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

                {/* 3. Card Toolbar Filter Terpadu - Sesuai Gambar 1 & Seksi 4 Standard.md */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search */}
                        <div className="lg:col-span-5 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Cari nama layanan, bidang, waktu..."
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

                        {/* Bidang Filter Dropdown - Wajib icon Building2 & ChevronDown */}
                        <div className="lg:col-span-3 relative">
                            <div className="relative">
                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={selectedBidang}
                                    onChange={(e) => handleBidangChange(e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="all">Semua Bidang</option>
                                    {bidang.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Status Filter Dropdown - Wajib icon Filter & ChevronDown */}
                        <div className="lg:col-span-2 relative">
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
                        <div className="lg:col-span-2 relative">
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
                    {paginatedLayanan.length === 0 ? (
                        /* 5. Empty State Card - Sesuai Seksi 8 Standard.md */
                        <div className="py-16 px-4 text-center">
                            <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Tidak Ada Data Layanan Ditemukan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery || selectedBidang !== 'all' || statusFilter !== 'ALL'
                                    ? 'Tidak ada layanan yang sesuai dengan kata kunci pencarian atau filter yang dipilih.'
                                    : 'Belum ada data master layanan yang terdaftar pada sistem.'}
                            </p>
                            {(searchQuery || selectedBidang !== 'all' || statusFilter !== 'ALL') && (
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
                                        <th className="py-3 px-4 w-52">Bidang</th>
                                        <th className="py-3 px-4">Nama Layanan</th>
                                        <th className="py-3 px-4 w-44">Waktu Penyelesaian</th>
                                        <th className="py-3 px-4 text-center w-24">Deskripsi</th>
                                        <th className="py-3 px-4 text-center w-32">Status</th>
                                        <th className="py-3 px-4 text-center w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                    {paginatedLayanan.map((item, idx) => {
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

                                                {/* Bidang Pengampu */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900/50">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span
                                                            className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[180px]"
                                                            title={item.bidang?.nama_bidang || '-'}
                                                        >
                                                            {item.bidang?.nama_bidang || '-'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Nama Layanan - Sesuai Seksi 6 Standard.md: text-xs line-clamp-2 */}
                                                <td className="py-3.5 px-4">
                                                    <div
                                                        className="font-semibold text-slate-900 dark:text-white line-clamp-2 max-w-[220px]"
                                                        title={item.nama_layanan || '-'}
                                                    >
                                                        {item.nama_layanan}
                                                    </div>
                                                </td>

                                                {/* Waktu Penyelesaian */}
                                                <td className="py-3.5 px-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span>{item.waktu_penyelesaian || '-'}</span>
                                                    </div>
                                                </td>

                                                {/* Deskripsi - Tombol Modal Eye Biru */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeskripsiModal({ open: true, item: item })}
                                                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                        title="Lihat Deskripsi Layanan"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
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
                                                            href={`/root/layanan/${item.id}`}
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                            title="Edit Data Layanan"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>

                                                        {/* Toggle Status Button - Sesuai Seksi 6 Standard.md */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setToggleModal({
                                                                    open: true,
                                                                    item: item,
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
                                                                    ? 'Nonaktifkan Layanan'
                                                                    : 'Aktifkan Layanan'
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
                {filteredLayanan.length > 0 && (
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
            {deskripsiModal.open && deskripsiModal.item && (
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
                                        {deskripsiModal.item.nama_layanan}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeskripsiModal({ open: false, item: null })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Bidang:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {deskripsiModal.item.bidang?.nama_bidang || '-'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-400 block text-[11px]">Waktu Penyelesaian:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {deskripsiModal.item.waktu_penyelesaian || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                                {deskripsiModal.item.deskripsi || 'Deskripsi detail belum diisi untuk layanan ini.'}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                onClick={() => setDeskripsiModal({ open: false, item: null })}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <span>Tutup</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Toggle Status */}
            {toggleModal.open && toggleModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`p-2 rounded-xl ${
                                        toggleModal.item.aktif
                                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    }`}
                                >
                                    <Power className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {toggleModal.item.aktif
                                            ? 'Nonaktifkan Layanan'
                                            : 'Aktifkan Layanan'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Ubah status ketersediaan layanan
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={() => setToggleModal({ open: false, item: null, loading: false })}
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
                                    {toggleModal.item.aktif ? 'menonaktifkan' : 'mengaktifkan'}
                                </span>{' '}
                                layanan ini?
                            </p>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold text-xs">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                        {toggleModal.item.nama_layanan}
                                    </div>
                                    <div className="text-slate-400 text-[11px] mt-0.5">
                                        Bidang: {toggleModal.item.bidang?.nama_bidang || '-'}
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400 italic">
                                {toggleModal.item.aktif
                                    ? 'Saat dinonaktifkan, ASN dan OPD tidak dapat memilih jenis layanan ini untuk membuat tiket permohonan baru.'
                                    : 'Setelah diaktifkan kembali, layanan ini akan langsung tersedia pada daftar formulir tiket permohonan.'}
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={() => setToggleModal({ open: false, item: null, loading: false })}
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
                                    toggleModal.item.aktif
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
