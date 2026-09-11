import React, { useState, useMemo } from 'react';
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
    ToggleLeft,
    ToggleRight,
    FileSpreadsheet,
    FileText,
    ChevronDown,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Layers,
    ArrowUpDown,
} from 'lucide-react';

export default function LayananBidangIndex({ layanan = [], bidang = null }) {
    // States for filter, search, and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | '1' | '0'
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [exportOpen, setExportOpen] = useState(false);

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

    // Stats calculations
    const stats = useMemo(() => {
        const total = layanan.length;
        const aktif = layanan.filter((l) => l.aktif === 1 || l.aktif === true).length;
        const nonaktif = total - aktif;
        return { total, aktif, nonaktif };
    }, [layanan]);

    // Filtered data
    const filteredLayanan = useMemo(() => {
        return layanan.filter((item) => {
            // Status filter
            if (statusFilter !== 'ALL') {
                const itemStatus = item.aktif ? '1' : '0';
                if (itemStatus !== statusFilter) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const nama = (item.nama_layanan || '').toLowerCase();
                const waktu = (item.waktu_penyelesaian || '').toLowerCase();
                const desc = (item.deskripsi || '').toLowerCase();

                return nama.includes(q) || waktu.includes(q) || desc.includes(q);
            }

            return true;
        });
    }, [layanan, statusFilter, searchQuery]);

    // Pagination calculations
    const totalItems = filteredLayanan.length;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const paginatedLayanan = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredLayanan.slice(start, start + perPage);
    }, [filteredLayanan, currentPage, perPage]);

    // Handle Quick Metric Card Click
    const handleQuickFilter = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    // Handle Confirm Toggle Status
    const handleConfirmToggle = () => {
        if (!toggleModal.item) return;

        setToggleModal((prev) => ({ ...prev, loading: true }));

        router.put(
            `/adminBidang/layanan/${toggleModal.item.id}/toggle-aktif`,
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

    const namaBidang = bidang?.nama_bidang || 'Bidang';

    return (
        <AuthenticatedLayout>
            <Head title={`Data Layanan - ${namaBidang} - PILKB`} />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Briefcase className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Data Layanan - {namaBidang}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Kelola master data layanan kepegawaian, estimasi waktu penyelesaian, dan status operasional layanan bidang Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Export Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setExportOpen(!exportOpen)}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Export Data</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {exportOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setExportOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <a
                                            href="/adminBidang/layanan/export-excel"
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors"
                                            onClick={() => setExportOpen(false)}
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            <span>Export Excel</span>
                                        </a>
                                        <a
                                            href="/adminBidang/layanan/export-pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 transition-colors"
                                            onClick={() => setExportOpen(false)}
                                        >
                                            <FileText className="w-4 h-4 text-rose-600" />
                                            <span>Export PDF</span>
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Tambah Layanan Baru */}
                        <Link
                            href="/adminBidang/layanan/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Layanan Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. KARTU RINGKASAN STATISTIK (Bagian 5 Standard.md) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Total Layanan */}
                    <div
                        onClick={() => handleQuickFilter('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Layanan
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                Semua
                            </span>
                        </div>
                    </div>

                    {/* Layanan Aktif */}
                    <div
                        onClick={() => handleQuickFilter('1')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === '1'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Layanan Aktif
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {stats.aktif}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                Aktif
                            </span>
                        </div>
                    </div>

                    {/* Layanan Tidak Aktif */}
                    <div
                        onClick={() => handleQuickFilter('0')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === '0'
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Tidak Aktif
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {stats.nonaktif}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                Nonaktif
                            </span>
                        </div>
                    </div>

                    {/* Bidang Info */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Bidang Pengampu
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={namaBidang}>
                                {namaBidang}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Master
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Bagian 4 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search (lg:col-span-6) */}
                        <div className="lg:col-span-6 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari nama layanan, waktu, atau deskripsi..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
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

                        {/* Filter Status (lg:col-span-3) */}
                        <div className="lg:col-span-3 relative">
                            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="1">Layanan Aktif</option>
                                <option value="0">Layanan Tidak Aktif</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Data Per Halaman (lg:col-span-3) */}
                        <div className="lg:col-span-3 relative">
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                            >
                                <option value={10}>10 per halaman</option>
                                <option value={25}>25 per halaman</option>
                                <option value={50}>50 per halaman</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* 4. CARD TABEL DATA TUNGGAL (Bagian 4 & 6 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {paginatedLayanan.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="py-3.5 px-4 w-12 text-center">No</th>
                                            <th className="py-3.5 px-4 min-w-[220px]">Nama Layanan</th>
                                            <th className="py-3.5 px-4 min-w-[160px]">Waktu Penyelesaian</th>
                                            <th className="py-3.5 px-4 min-w-[240px]">Deskripsi</th>
                                            <th className="py-3.5 px-4 w-28 text-center">Status</th>
                                            <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedLayanan.map((item, index) => {
                                            const isAktif = item.aktif === 1 || item.aktif === true;
                                            const rowNo = (currentPage - 1) * perPage + index + 1;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    {/* No */}
                                                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                                                        {rowNo}
                                                    </td>

                                                    {/* Nama Layanan */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="font-semibold text-slate-900 dark:text-white max-w-[260px] truncate"
                                                                title={item.nama_layanan}
                                                            >
                                                                {item.nama_layanan}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Waktu Penyelesaian */}
                                                    <td className="py-3.5 px-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>{item.waktu_penyelesaian || '-'}</span>
                                                        </span>
                                                    </td>

                                                    {/* Deskripsi */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p
                                                                className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[220px]"
                                                                title={item.deskripsi || 'Deskripsi belum diisi'}
                                                            >
                                                                {item.deskripsi || (
                                                                    <span className="italic text-slate-400">
                                                                        Belum ada deskripsi
                                                                    </span>
                                                                )}
                                                            </p>
                                                            {item.deskripsi && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDeskripsiModal({
                                                                            open: true,
                                                                            item,
                                                                        })
                                                                    }
                                                                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex-shrink-0"
                                                                    title="Lihat Deskripsi Lengkap"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {isAktif ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                Tidak Aktif
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {/* Edit Button (Orange / Amber) */}
                                                            <Link
                                                                href={`/adminBidang/layanan/${item.id}`}
                                                                className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-800 text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                                title="Edit Data Layanan"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </Link>

                                                            {/* Toggle Status Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setToggleModal({
                                                                        open: true,
                                                                        item,
                                                                        loading: false,
                                                                    })
                                                                }
                                                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                                                    isAktif
                                                                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                                                                        : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                                                                }`}
                                                                title={
                                                                    isAktif
                                                                        ? 'Klik untuk Menonaktifkan'
                                                                        : 'Klik untuk Mengaktifkan'
                                                                }
                                                            >
                                                                {isAktif ? (
                                                                    <ToggleRight className="w-4 h-4" />
                                                                ) : (
                                                                    <ToggleLeft className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (Reusable Component) */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                perPage={perPage}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </>
                    ) : (
                        /* Standard Clean Empty State (Bagian 8 Standard.md) */
                        <div className="py-16 px-4 text-center">
                            <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Tidak Ada Layanan yang Cocok'
                                    : 'Belum Ada Data Layanan'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Coba sesuaikan kata kunci pencarian atau ubah filter status layanan Anda.'
                                    : 'Silakan tambahkan layanan baru untuk bidang kepegawaian Anda melalui tombol di atas.'}
                            </p>
                            {(searchQuery || statusFilter !== 'ALL') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('ALL');
                                        setCurrentPage(1);
                                    }}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL LIHAT DESKRIPSI LENGKAP */}
            {deskripsiModal.open && deskripsiModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div
                        className="fixed inset-0"
                        onClick={() => setDeskripsiModal({ open: false, item: null })}
                    />
                    <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <FileText className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Deskripsi Layanan
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        {deskripsiModal.item.nama_layanan}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeskripsiModal({ open: false, item: null })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">
                                        Estimasi Waktu
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                        {deskripsiModal.item.waktu_penyelesaian || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Status</span>
                                    <span className="font-semibold mt-0.5 block">
                                        {deskripsiModal.item.aktif ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="text-rose-600 dark:text-rose-400">
                                                Tidak Aktif
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Penjelasan Layanan
                                </h4>
                                <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                                    {deskripsiModal.item.deskripsi || (
                                        <span className="italic text-slate-400">
                                            Tidak ada deskripsi rinci untuk layanan ini.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
                            <button
                                type="button"
                                onClick={() => setDeskripsiModal({ open: false, item: null })}
                                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI TOGGLE STATUS AKTIF / NONAKTIF */}
            {toggleModal.open && toggleModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div
                        className="fixed inset-0"
                        onClick={() => !toggleModal.loading && setToggleModal({ open: false, item: null, loading: false })}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                    toggleModal.item.aktif
                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60'
                                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60'
                                }`}
                            >
                                {toggleModal.item.aktif ? (
                                    <AlertTriangle className="w-5 h-5" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {toggleModal.item.aktif
                                        ? 'Nonaktifkan Layanan?'
                                        : 'Aktifkan Layanan?'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Konfirmasi perubahan status keaktifan
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Apakah Anda yakin ingin{' '}
                            <strong>
                                {toggleModal.item.aktif ? 'menonaktifkan' : 'mengaktifkan'}
                            </strong>{' '}
                            layanan <strong>&ldquo;{toggleModal.item.nama_layanan}&rdquo;</strong>?
                            {toggleModal.item.aktif && (
                                <span className="block text-slate-400 mt-1">
                                    Layanan yang dinonaktifkan tidak akan muncul pada pilihan registrasi usulan baru bagi OPD.
                                </span>
                            )}
                        </p>

                        <div className="flex items-center justify-end gap-2.5 mt-6">
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={() =>
                                    setToggleModal({ open: false, item: null, loading: false })
                                }
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={handleConfirmToggle}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                                    toggleModal.item.aktif
                                        ? 'bg-amber-600 hover:bg-amber-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {toggleModal.loading ? (
                                    <span>Memproses...</span>
                                ) : (
                                    <span>
                                        {toggleModal.item.aktif
                                            ? 'Ya, Nonaktifkan'
                                            : 'Ya, Aktifkan'}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
