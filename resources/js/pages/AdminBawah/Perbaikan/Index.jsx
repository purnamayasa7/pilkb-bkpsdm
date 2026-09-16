import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import { getInitials } from '@/utils/initials';
import {
    Edit3,
    Search,
    Layers,
    ChevronDown,
    Copy,
    Check,
    RotateCcw,
    History,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Clock,
    FileText,
    Download,
    X,
    ShieldAlert,
    ArrowRight
} from 'lucide-react';

export default function Index({
    data = [],
    layananList = [],
}) {
    const { auth, flash = {} } = usePage().props;

    // Filters & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLayanan, setSelectedLayanan] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SUDAH (Siap Direview), BELUM (Menunggu OPD)
    const [activeMetricTab, setActiveMetricTab] = useState('ALL');

    // Pagination & Clipboard State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Copy Nomor Tiket
    const handleCopyTiket = (noTiket) => {
        if (!noTiket) return;
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => setCopiedTiket(null), 2000);
    };

    // Open Modal Riwayat
    const handleOpenRiwayat = (item) => {
        setSelectedTiketHistory(item);
        setHistoryModalOpen(true);
    };

    // Summary Metric Stats
    const stats = useMemo(() => {
        let total = data.length;
        let belum = 0;
        let sudah = 0;
        let totalBtl = 0;

        data.forEach((item) => {
            const isDiperbaiki = Number(item.diperbaiki) === 1;
            if (isDiperbaiki) {
                sudah++;
            } else {
                belum++;
            }
            totalBtl += Number(item.jumlah_btl || 0);
        });

        return { total, belum, sudah, totalBtl };
    }, [data]);

    // Handle Metric Card Click
    const handleMetricCardClick = (type) => {
        setActiveMetricTab(type);
        setStatusFilter(type);
        setCurrentPage(1);
    };

    // Filtered Data (Client-side useMemo for Instant Response)
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // Status filter
            if (statusFilter === 'SUDAH' && Number(item.diperbaiki) !== 1) {
                return false;
            }
            if (statusFilter === 'BELUM' && Number(item.diperbaiki) === 1) {
                return false;
            }

            // Layanan filter
            if (selectedLayanan !== 'ALL') {
                const itemLayananId = item.layanan?.id || item.kode_layanan;
                if (String(itemLayananId) !== String(selectedLayanan)) {
                    return false;
                }
            }

            // Search query filter
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const matchTiket = (item.no_tiket || '').toLowerCase().includes(q);
            const matchNip = (item.nip || '').toLowerCase().includes(q);
            const matchNama = (item.nama || '').toLowerCase().includes(q);
            const matchUkerja = (item.nama_ukerja || '').toLowerCase().includes(q);
            const matchLayanan = (item.layanan?.nama_layanan || '').toLowerCase().includes(q);

            return matchTiket || matchNip || matchNama || matchUkerja || matchLayanan;
        });
    }, [data, searchQuery, selectedLayanan, statusFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, currentPage, perPage]);

    // Reset All Filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedLayanan('ALL');
        setStatusFilter('ALL');
        setActiveMetricTab('ALL');
        setCurrentPage(1);
    };

    // Export PDF URL
    const exportPdfUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (selectedLayanan && selectedLayanan !== 'ALL') {
            params.append('layanan', selectedLayanan);
        }
        const qs = params.toString();
        return `/adminBawah/perbaikan/export-pdf${qs ? `?${qs}` : ''}`;
    }, [selectedLayanan]);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="PILKB - List Perbaikan Usulan" />

            {/* Container Full Width Sesuai Standard.md Bagian 3 Poin 2 */}
            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Edit3 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                List Perbaikan Usulan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftar usulan berkas tidak lengkap (BTL) yang memerlukan perbaikan dan verifikasi ulang dari OPD.
                        </p>
                    </div>

                    {/* Tombol Header Standard.md Bagian 4 Poin 1 (py-2.5 text-xs font-semibold) */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <a
                            href={exportPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>Export PDF</span>
                        </a>
                    </div>
                </div>

                {/* 2. STATS METRIC CHIPS CARDS (Bagian 4 Poin 2 & Bagian 5 Standard.md) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Total Usulan */}
                    <div
                        onClick={() => handleMetricCardClick('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            activeMetricTab === 'ALL' && statusFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Usulan
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

                    {/* Card 2: Menunggu OPD */}
                    <div
                        onClick={() => handleMetricCardClick('BELUM')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            activeMetricTab === 'BELUM'
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Menunggu OPD
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {stats.belum}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                Belum Diperbaiki
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Sudah Diperbaiki OPD (Siap Direview) */}
                    <div
                        onClick={() => handleMetricCardClick('SUDAH')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            activeMetricTab === 'SUDAH'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Siap Direview
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                {stats.sudah}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                Sudah Diperbaiki
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Total Syarat BTL */}
                    <div
                        onClick={() => handleMetricCardClick('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'ALL' && activeMetricTab === 'ALL'
                                ? 'border-slate-200 dark:border-slate-800'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Syarat BTL
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {stats.totalBtl}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                                Berkas BTL
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Standard.md Bagian 4 Poin 3) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search Input (lg:col-span-5) */}
                        <div className="relative lg:col-span-5">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari No Tiket, NIP, Nama, SKPD..."
                                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCurrentPage(1);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown Filter Layanan (lg:col-span-4) */}
                        <div className="relative lg:col-span-4">
                            <div className="relative flex items-center">
                                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                                <select
                                    value={selectedLayanan}
                                    onChange={(e) => {
                                        setSelectedLayanan(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ALL">Semua Layanan</option>
                                    {layananList.map((lay) => (
                                        <option key={lay.id} value={lay.id}>
                                            {lay.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                            </div>
                        </div>

                        {/* Dropdown Filter Status & Selector Per Halaman (lg:col-span-3) */}
                        <div className="grid grid-cols-2 gap-2 lg:col-span-3">
                            {/* Dropdown Status */}
                            <div className="relative flex items-center">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setActiveMetricTab(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ALL">Semua Status</option>
                                    <option value="SUDAH">Siap Direview</option>
                                    <option value="BELUM">Menunggu OPD</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                            </div>

                            {/* Dropdown Per Halaman */}
                            <div className="relative flex items-center">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value={10}>10 per hal</option>
                                    <option value={25}>25 per hal</option>
                                    <option value={50}>50 per hal</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOMPONEN 4: SINGLE DATA TABLE CARD (Standard.md Bagian 4 Poin 4 & Bagian 6) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50">
                                    <th className="w-12 py-3 px-4 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        No Tiket
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Pemohon
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Layanan
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                                        Syarat BTL
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                                        Tahapan
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 px-4 text-center">
                                            {/* Standard Empty State (Standard.md Bagian 8) */}
                                            <Edit3 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Tidak ada usulan perbaikan
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || selectedLayanan !== 'ALL' || statusFilter !== 'ALL'
                                                    ? 'Tidak ditemukan usulan perbaikan yang cocok dengan filter pencarian.'
                                                    : 'Saat ini belum ada berkas usulan yang berstatus BTL atau memerlukan verifikasi perbaikan.'}
                                            </p>
                                            {(searchQuery || selectedLayanan !== 'ALL' || statusFilter !== 'ALL') && (
                                                <button
                                                    onClick={handleResetFilters}
                                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    Reset Filter
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item, idx) => {
                                        const rowNumber = (currentPage - 1) * perPage + idx + 1;
                                        const initials = getInitials(item.nama || item.nip || 'ASN');
                                        const isDiperbaiki = Number(item.diperbaiki) === 1;

                                        return (
                                            <tr
                                                key={item.id || item.no_tiket}
                                                className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* NO */}
                                                <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
                                                    {rowNumber}
                                                </td>

                                                {/* NO TIKET */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                                            {item.no_tiket}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopyTiket(item.no_tiket)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                            title="Salin No Tiket"
                                                        >
                                                            {copiedTiket === item.no_tiket ? (
                                                                <Check className="w-3 h-3 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* PEMOHON: Avatar Bulat Slate + Nama, NIP, SKPD Lokal DB (Standard.md Bagian 6 Poin 1) */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div
                                                                className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]"
                                                                title={item.nama || '-'}
                                                            >
                                                                {item.nama || '-'}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-slate-400">
                                                                {item.nip || '-'}
                                                            </div>
                                                            <div
                                                                className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]"
                                                                title={item.nama_ukerja || '-'}
                                                            >
                                                                {item.nama_ukerja || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* LAYANAN (Standard.md Bagian 6 Poin 2: text-xs line-clamp-2 max-w-[220px]) */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px]"
                                                        title={item.layanan?.nama_layanan || '-'}
                                                    >
                                                        {item.layanan?.nama_layanan || '-'}
                                                    </span>
                                                </td>

                                                {/* SYARAT BTL & KESIAPAN PERBAIKAN */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                                                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                                            {item.jumlah_btl || 0} Berkas BTL
                                                        </span>
                                                        {isDiperbaiki ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                                                                Sudah Diperbaiki
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                                Menunggu OPD
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* TAHAPAN */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                                        {item.jumlah_tahap || 0} Tahapan
                                                    </span>
                                                </td>

                                                {/* AKSI (Standard.md Bagian 6 Poin 3: Warna Semantik) */}
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center justify-center gap-1.5">
                                                        {/* Review: Amber / Orange */}
                                                        <Link
                                                            href={`/adminBawah/perbaikan/review/${encodeURIComponent(item.no_tiket)}`}
                                                            className="p-2 rounded-xl text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                            title="Review Berkas Perbaikan"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>

                                                        {/* Riwayat: Biru */}
                                                        <button
                                                            onClick={() => handleOpenRiwayat(item)}
                                                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                            title="Riwayat Tahapan"
                                                        >
                                                            <History className="w-4 h-4" />
                                                        </button>

                                                        {/* Tracking Publik: Slate */}
                                                        <a
                                                            href={`/cek-tiket/${encodeURIComponent(item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                            title="Tracking Berkas Publik"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINASI */}
                    {filteredData.length > 0 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                                totalItems={filteredData.length}
                                perPage={perPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL RIWAYAT TAHAPAN */}
            <RiwayatTahapanModal
                isOpen={historyModalOpen}
                onClose={() => {
                    setHistoryModalOpen(false);
                    setSelectedTiketHistory(null);
                }}
                tiket={selectedTiketHistory}
                noTiket={selectedTiketHistory?.no_tiket}
            />
        </AuthenticatedLayout>
    );
}
