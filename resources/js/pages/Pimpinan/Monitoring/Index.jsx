import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import {
    Clock,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Building2,
    Search,
    Filter,
    RotateCcw,
    FileText,
    History,
    ChevronRight,
    Activity,
    ChevronDown,
    Calendar,
    List,
    ExternalLink,
} from 'lucide-react';

export default function MonitoringIndex({
    metrics = {},
    beban_per_bidang = [],
    antrean = {},
    bidangList = [],
    selected_year = new Date().getFullYear(),
    available_years = [],
    filters = {}
}) {
    // Local filter state
    const [selectedYear, setSelectedYear] = useState(filters.year || selected_year);
    const [selectedBidang, setSelectedBidang] = useState(filters.bidang || 'all');
    const [selectedSla, setSelectedSla] = useState(filters.sla_status || 'all');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Modal Riwayat
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Data antrean dari paginator Laravel
    const antreanItems = antrean.data || (Array.isArray(antrean) ? antrean : []);
    const totalAntrean = antrean.total ?? antreanItems.length;

    // Filter submit handler
    const applyFilter = (newBidang, newSla, newSearch, newYear) => {
        router.get(
            '/pimpinan/monitoring',
            {
                year: newYear !== undefined ? newYear : selectedYear,
                bidang: newBidang !== undefined ? newBidang : selectedBidang,
                sla_status: newSla !== undefined ? newSla : selectedSla,
                search: newSearch !== undefined ? newSearch : searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
        applyFilter(selectedBidang, selectedSla, searchQuery, newYear);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilter(selectedBidang, selectedSla, searchQuery, selectedYear);
    };

    const handleReset = () => {
        setSelectedBidang('all');
        setSelectedSla('all');
        setSearchQuery('');
        router.get('/pimpinan/monitoring', { year: selectedYear }, { preserveState: true, preserveScroll: true });
    };

    const getInitials = (name, fallback = 'P') => {
        if (!name || name === '-') return fallback;
        const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return fallback;
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const renderSlaBadge = (status, hariBerjalan, targetHari) => {
        switch (status) {
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                        <span>Lewat Target ({hariBerjalan} hr)</span>
                    </span>
                );
            case 'warning':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span>Perhatian ({hariBerjalan}/{targetHari} hr)</span>
                    </span>
                );
            case 'btl':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                        <span>Perbaikan Berkas (BTL)</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span>On Track ({hariBerjalan}/{targetHari} hr)</span>
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="PILKB - Monitoring Layanan" />

            <div className="space-y-6">
                {/* 1. Header (Standard.md Bab 4.1) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Clock className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Monitoring Layanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Pengawasan beban kerja bidang, ketepatan waktu layanan, dan antrean usulan Tahun {selectedYear}.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        {/* Dropdown Pemilih Periode Tahun (Standard.md Bab 4.1 & Bab 4.3) */}
                        <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                            >
                                {available_years.map((yr) => (
                                    <option key={yr} value={yr}>
                                        Tahun {yr}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* <Link
                            href="/pimpinan/laporan"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span>Buka Laporan Eksekutif</span>
                        </Link> */}
                    </div>
                </div>

                {/* 2. Kartu Metrik Ringkasan Operasional (Standard.md Bab 4.2 & Bab 5) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Total Antrean Aktif */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Antrean Aktif
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {metrics.total_antrean_aktif ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                                Berjalan
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Usulan Overdue (Lewat Target) */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Melewati Batas Waktu
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {metrics.total_overdue ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                                Perlu Perhatian
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Usulan Butuh Perbaikan (BTL) */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Berkas Perbaikan (BTL)
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {metrics.total_btl ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                                Menunggu OPD
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Usulan Selesai */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Usulan Selesai
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {metrics.total_selesai ?? metrics.selesai_bulan_ini ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                                Tahun {selectedYear}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Distribusi Beban Per Bidang (Standard.md Card Container) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/40">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Distribusi Beban Kerja Antar Bidang (Tahun {selectedYear})
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Status antrean aktif dan beban operasional pada masing-masing bidang kepegawaian BKPSDM.
                                </p>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                            {beban_per_bidang.length} Bidang Terdaftar
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {beban_per_bidang.map((b) => {
                            const isSelected = String(selectedBidang) === String(b.id);

                            return (
                                <div
                                    key={b.id}
                                    onClick={() => {
                                        const newBidang = isSelected ? 'all' : String(b.id);
                                        setSelectedBidang(newBidang);
                                        applyFilter(newBidang, selectedSla, searchQuery);
                                    }}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={b.nama_lengkap || b.nama}>
                                            {b.nama}
                                        </h4>
                                    </div>

                                    <div className="mt-3 flex items-baseline justify-between">
                                        <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                                            {b.total_aktif}
                                            <span className="text-[11px] font-normal text-slate-400 ml-1">usulan</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px]">
                                            {b.total_overdue > 0 && (
                                                <span className="text-rose-600 dark:text-rose-400 font-bold">
                                                    {b.total_overdue} telat
                                                </span>
                                            )}
                                            {b.total_btl > 0 && (
                                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                    {b.total_btl} btl
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                                        <span>{isSelected ? 'Sedang difilter' : 'Klik untuk filter'}</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Tabel Antrean Usulan Aktif (Realtime Queue) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {/* Toolbar Pencarian & Filter */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <List className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Daftar Antrean Usulan Aktif ({totalAntrean}) - Tahun {selectedYear}
                                </h3>
                            </div>

                            {/* Reset Button if filtered */}
                            {(selectedBidang !== 'all' || selectedSla !== 'all' || searchQuery) && (
                                <button
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 self-start sm:self-auto cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset Filter</span>
                                </button>
                            )}
                        </div>

                        {/* Controls Grid (Standard.md Bab 4.3) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {/* Search */}
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari tiket, pemohon, NIP, OPD lalu Enter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </form>

                            {/* Filter Bidang */}
                            <div className="relative">
                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={selectedBidang}
                                    onChange={(e) => {
                                        setSelectedBidang(e.target.value);
                                        applyFilter(e.target.value, selectedSla, searchQuery);
                                    }}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="all">Semua Bidang</option>
                                    {bidangList.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang ?? b.name ?? b.id}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Filter SLA Status */}
                            <div className="relative">
                                <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={selectedSla}
                                    onChange={(e) => {
                                        setSelectedSla(e.target.value);
                                        applyFilter(selectedBidang, e.target.value, searchQuery);
                                    }}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="all">Semua Status Waktu</option>
                                    <option value="on_track">On Track (Sesuai Target)</option>
                                    <option value="warning">Perhatian (Mendekati Batas)</option>
                                    <option value="overdue">Melebihi Target (Overdue)</option>
                                    <option value="btl">Perbaikan Berkas (BTL)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table View (Standard.md Bab 6) */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3.5">No. Tiket</th>
                                    <th className="px-5 py-3.5">Pegawai Pemohon</th>
                                    <th className="px-5 py-3.5">Unit Kerja (OPD)</th>
                                    <th className="px-5 py-3.5">Layanan & Bidang</th>
                                    <th className="px-5 py-3.5">Tanggal Masuk</th>
                                    <th className="px-5 py-3.5">Tahapan Saat Ini</th>
                                    <th className="px-5 py-3.5">Status Waktu</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {antreanItems.length > 0 ? (
                                    antreanItems.map((item) => (
                                        <tr
                                            key={item.no_tiket}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            {/* No Tiket */}
                                            <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                <a
                                                    href={`/cek-tiket/${encodeURIComponent(item.no_tiket)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                                                    title="Lihat Detail Usulan (Cek Tiket Publik)"
                                                >
                                                    {item.no_tiket}
                                                </a>
                                            </td>

                                            {/* Pemohon */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5 min-w-[170px]">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                        {getInitials(item.nama)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]" title={item.nama || '-'}>
                                                            {item.nama || '-'}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-slate-400">
                                                            NIP. {item.nip || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* OPD */}
                                            <td className="px-5 py-3.5 max-w-[180px]">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[180px]" title={item.nama_ukerja || '-'}>
                                                    {item.nama_ukerja || '-'}
                                                </span>
                                            </td>

                                            {/* Layanan & Bidang */}
                                            <td className="px-5 py-3.5 max-w-[200px]">
                                                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[200px]" title={item.layanan?.nama_layanan || '-'}>
                                                    {item.layanan?.nama_layanan || '-'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 line-clamp-1">
                                                    {item.layanan?.bidang?.nama_bidang || '-'}
                                                </div>
                                            </td>

                                            {/* Tanggal */}
                                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                                                {formatDate(item.tanggal)}
                                            </td>

                                            {/* Tahapan Terakhir */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    {item.tahap_terakhir?.status_rel?.status || 'Diajukan'}
                                                </span>
                                            </td>

                                            {/* Status SLA */}
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {renderSlaBadge(item.sla_status, item.hari_berjalan, item.target_hari)}
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={`/cek-tiket/${encodeURIComponent(item.no_tiket)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                        title="Lihat Detail Usulan di Tab Baru (Cek Tiket Publik)"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Detail</span>
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTiketHistory(item.no_tiket);
                                                            setHistoryModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                        title="Lihat Kronologi Riwayat Tahapan"
                                                    >
                                                        <History className="w-3.5 h-3.5" />
                                                        <span>Alur</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-16 px-4 text-center">
                                            <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Tidak Ada Antrean Usulan
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || selectedBidang !== 'all' || selectedSla !== 'all'
                                                    ? 'Tidak ada usulan aktif yang cocok dengan kriteria filter saat ini.'
                                                    : 'Semua usulan layanan telah selesai diproses atau belum ada usulan baru.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Sesuai Standard.md Bab 7 */}
                    <Pagination
                        pagination={antrean}
                        onPageChange={(page) => {
                            router.get(
                                '/pimpinan/monitoring',
                                {
                                    year: selectedYear,
                                    bidang: selectedBidang,
                                    sla_status: selectedSla,
                                    search: searchQuery,
                                    page,
                                },
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                    />
                </div>
            </div>

            {/* Modal Riwayat Tahapan */}
            {selectedTiketHistory && (
                <RiwayatTahapanModal
                    isOpen={historyModalOpen}
                    onClose={() => {
                        setHistoryModalOpen(false);
                        setSelectedTiketHistory(null);
                    }}
                    noTiket={selectedTiketHistory}
                />
            )}
        </AuthenticatedLayout>
    );
}
