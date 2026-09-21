import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import {
    Archive,
    Search,
    Calendar,
    Briefcase,
    ChevronDown,
    Copy,
    Check,
    RotateCcw,
    Printer,
    History,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    FileText,
    Filter,
} from 'lucide-react';

export default function Index({
    data = [],
    bidangList = [],
    selectedBidang = 'all',
    tanggalAwal = '',
    tanggalAkhir = '',
}) {
    const { auth, flash = {} } = usePage().props;

    // State Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState('');
    const [currentBidang, setCurrentBidang] = useState(selectedBidang || 'all');
    const [startDate, setStartDate] = useState(tanggalAwal || '');
    const [endDate, setEndDate] = useState(tanggalAkhir || '');

    // Paginasi & Salin Tiket
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Salin nomor tiket
    const handleCopyTiket = (noTiket) => {
        if (!noTiket) return;
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => setCopiedTiket(null), 2000);
    };

    // Format Tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(d);
        } catch {
            return dateStr;
        }
    };

    // Inisial Avatar Bulat Slate
    const getInitials = (name) => {
        if (!name) return 'BK';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    // Quick Date Presets
    const handlePresetDate = (preset) => {
        const now = new Date();
        const formatDateString = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        let sDate = '';
        let eDate = formatDateString(now);

        if (preset === 'today') {
            sDate = eDate;
        } else if (preset === '7days') {
            const past = new Date();
            past.setDate(now.getDate() - 6);
            sDate = formatDateString(past);
        } else if (preset === 'thisMonth') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            sDate = formatDateString(firstDay);
        } else if (preset === 'thisYear') {
            sDate = `${now.getFullYear()}-01-01`;
        }

        setStartDate(sDate);
        setEndDate(eDate);
        setCurrentPage(1);

        router.get(
            '/adminBawah/archives',
            {
                tanggal_awal: sDate,
                tanggal_akhir: eDate,
                bidang: currentBidang !== 'all' ? currentBidang : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Navigasi Filter Server
    const handleApplyDateFilter = (newStart, newEnd) => {
        setCurrentPage(1);
        router.get(
            '/adminBawah/archives',
            {
                tanggal_awal: newStart,
                tanggal_akhir: newEnd,
                bidang: currentBidang !== 'all' ? currentBidang : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleBidangChange = (newBidang) => {
        setCurrentBidang(newBidang);
        setCurrentPage(1);
        router.get(
            '/adminBawah/archives',
            {
                bidang: newBidang !== 'all' ? newBidang : undefined,
                tanggal_awal: startDate || undefined,
                tanggal_akhir: endDate || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Reset Semua Filter
    const handleResetFilters = () => {
        setSearchQuery('');
        setCurrentBidang('all');
        setCurrentPage(1);
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const formatStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const s = formatStr(firstDay);
        const e = formatStr(now);
        setStartDate(s);
        setEndDate(e);
        handleApplyDateFilter(s, e);
    };

    // Hitung Metrik Statistik (Standard.md Bagian 5)
    const counts = useMemo(() => {
        let total = data.length;
        let bulanIni = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYearNum = now.getFullYear();
        const bidangSet = new Set();

        data.forEach((item) => {
            if (item.tanggal) {
                const d = new Date(item.tanggal);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYearNum) {
                    bulanIni++;
                }
            }
            if (item.layanan?.bidang?.nama_bidang) {
                bidangSet.add(item.layanan.bidang.nama_bidang);
            }
        });

        return {
            total,
            bulanIni,
            bidangTerlibat: bidangSet.size,
        };
    }, [data]);

    // Filter Data Client Side (Pencarian teks)
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const query = searchQuery.toLowerCase().trim();
            if (query) {
                const matchQuery =
                    (item.no_tiket && item.no_tiket.toLowerCase().includes(query)) ||
                    (item.nip && item.nip.toLowerCase().includes(query)) ||
                    (item.nama && item.nama.toLowerCase().includes(query)) ||
                    (item.nama_ukerja && item.nama_ukerja.toLowerCase().includes(query)) ||
                    (item.layanan?.nama_layanan && item.layanan.nama_layanan.toLowerCase().includes(query)) ||
                    (item.layanan?.bidang?.nama_bidang && item.layanan.bidang.nama_bidang.toLowerCase().includes(query)) ||
                    (item.operator_archives?.nama && item.operator_archives.nama.toLowerCase().includes(query));
                if (!matchQuery) return false;
            }

            return true;
        });
    }, [data, searchQuery]);

    // Data Terpaginasi
    const totalPages = Math.ceil(filteredData.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, currentPage, perPage]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Arsip Usulan Layanan - PILKB" />

            {/* Container Baku Standard.md (space-y-6 lebar penuh tanpa batasan max-w) */}
            <div className="space-y-6">

                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Archive className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Arsip Usulan Layanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftar berkas pengajuan usulan ASN yang telah selesai diproses dan diarsipkan oleh operator BKPSDM.
                        </p>
                    </div>

                    {/* Tombol Header Standard.md Bagian 4 Poin 1 (py-2.5 text-xs font-semibold) */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
                        <a
                            href={`/adminBawah/archives/export-pdf?tanggal_awal=${startDate}&tanggal_akhir=${endDate}${currentBidang !== 'all' ? `&bidang=${currentBidang}` : ''}`}
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
                    {/* Total Arsip */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Arsip Periode
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {counts.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                Berkas
                            </span>
                        </div>
                    </div>

                    {/* Arsip Bulan Ini */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Arsip Bulan Ini
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {counts.bulanIni}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                Selesai
                            </span>
                        </div>
                    </div>

                    {/* Bidang Terlibat */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Bidang Terlibat
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {counts.bidangTerlibat}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                Bidang
                            </span>
                        </div>
                    </div>

                    {/* Status Selesai Arsip */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Status Arsip
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                100%
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                Diarsipkan
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        {/* Search Input */}
                        <div className="lg:col-span-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari No Tiket, NIP, Nama, SKPD, Operator..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Bidang */}
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={currentBidang}
                                    onChange={(e) => handleBidangChange(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer truncate"
                                >
                                    <option value="all">Semua Bidang</option>
                                    {bidangList.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Rentang Tanggal (Start & End) */}
                        <div className="lg:col-span-3">
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        if (endDate) handleApplyDateFilter(e.target.value, endDate);
                                    }}
                                    className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Tanggal Awal"
                                />
                                <span className="text-slate-400 text-xs">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        if (startDate) handleApplyDateFilter(startDate, e.target.value);
                                    }}
                                    className="w-1/2 px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Tanggal Akhir"
                                />
                            </div>
                        </div>

                        {/* Per-Page Selector */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    <option value={10}>10 per hal</option>
                                    <option value={25}>25 per hal</option>
                                    <option value={50}>50 per hal</option>
                                    <option value={100}>100 per hal</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Date Presets Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                            Preset:
                        </span>
                        <button
                            type="button"
                            onClick={() => handlePresetDate('today')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePresetDate('7days')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                        >
                            7 Hari Terakhir
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePresetDate('thisMonth')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                        >
                            Bulan Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePresetDate('thisYear')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                        >
                            Tahun Ini
                        </button>
                    </div>
                </div>

                {/* 4. CARD TABEL DATA TUNGGAL (Bagian 4 Poin 4 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-4 py-3.5 w-12 text-center">No</th>
                                    <th className="px-4 py-3.5 w-36">No. Tiket</th>
                                    <th className="px-4 py-3.5 min-w-[200px]">Pemohon</th>
                                    <th className="px-4 py-3.5 min-w-[200px]">Layanan & Bidang</th>
                                    <th className="px-4 py-3.5 w-36">Tanggal Masuk</th>
                                    <th className="px-4 py-3.5 min-w-[140px]">Petugas Arsip</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Status</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                {paginatedData.length === 0 ? (
                                    /* Standar Empty State (Bagian 8 Standard.md) */
                                    <tr>
                                        <td colSpan={8} className="py-16 px-4 text-center">
                                            <Archive className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Tidak Ada Data Arsip Usulan
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || currentBidang !== 'all'
                                                    ? 'Tidak ditemukan usulan arsip yang cocok dengan kriteria pencarian dan filter Anda.'
                                                    : 'Belum ada usulan yang diarsipkan pada periode tanggal terpilih.'}
                                            </p>
                                            {(searchQuery || currentBidang !== 'all') && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilters}
                                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    <span>Reset Filter</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item, idx) => {
                                        const globalIndex = (currentPage - 1) * perPage + idx + 1;
                                        const initials = getInitials(item.nama || item.nip || 'ASN');

                                        return (
                                            <tr
                                                key={item.id || item.no_tiket}
                                                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-[11px]">
                                                    {globalIndex}
                                                </td>

                                                {/* No Tiket */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-xs">
                                                            {item.no_tiket}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyTiket(item.no_tiket)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                            title="Salin Nomor Tiket"
                                                        >
                                                            {copiedTiket === item.no_tiket ? (
                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Kolom Pegawai (Bagian 6 Poin 1 Standard.md) */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        {/* Avatar Bulat Slate Standar */}
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
                                                            {item.nama_ukerja && (
                                                                <div
                                                                    className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]"
                                                                    title={item.nama_ukerja}
                                                                >
                                                                    {item.nama_ukerja}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Kolom Layanan & Bidang (Bagian 6 Poin 2 Standard.md) */}
                                                <td className="px-4 py-3.5">
                                                    <div className="min-w-0">
                                                        <span
                                                            className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[200px] block"
                                                            title={item.layanan?.nama_layanan || '-'}
                                                        >
                                                            {item.layanan?.nama_layanan || '-'}
                                                        </span>
                                                        {item.layanan?.bidang?.nama_bidang && (
                                                            <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                                                                {item.layanan.bidang.nama_bidang}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Tanggal Masuk */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                    {formatDate(item.tanggal)}
                                                </td>

                                                {/* Operator Arsip */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                                                    {item.operator_archives?.nama || '-'}
                                                </td>

                                                {/* Status Usulan */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Diarsipkan</span>
                                                    </span>
                                                </td>

                                                {/* Kolom Aksi (Bagian 6 Poin 3 Standard.md) */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* 1. Riwayat Tahapan (Icon History: Biru) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedTiketHistory(item);
                                                                setHistoryModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                            title="Riwayat Tahapan Usulan"
                                                        >
                                                            <History className="w-4 h-4" />
                                                        </button>

                                                        {/* 2. Cetak Tiket (Icon Printer: Orange/Amber) */}
                                                        <a
                                                            href={`/tiket/cetak/${encodeURIComponent(item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                                            title="Cetak Tiket"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </a>

                                                        {/* 3. Tracking Publik (Icon ExternalLink: Slate / Biru) */}
                                                        <a
                                                            href={`/cek-tiket/${encodeURIComponent(item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

                    {/* Komponen Paginasi Bersama (Bagian 7 Standard.md) */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                        totalItems={filteredData.length}
                        perPage={perPage}
                    />
                </div>
            </div>

            {/* Modal Riwayat Tahapan Usulan (Bagian 7 Standard.md) */}
            <RiwayatTahapanModal
                isOpen={historyModalOpen}
                onClose={() => {
                    setHistoryModalOpen(false);
                    setSelectedTiketHistory(null);
                }}
                tiket={selectedTiketHistory}
            />
        </AuthenticatedLayout>
    );
}
