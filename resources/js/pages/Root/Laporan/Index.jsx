import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import {
    BarChart2,
    Calendar,
    Download,
    Search,
    ChevronDown,
    Building2,
    FileText,
    RotateCcw,
    Copy,
    Check,
    X,
    History,
    ExternalLink,
    Filter
} from 'lucide-react';

export default function Index({
    bidangList = [],
    layananList = [],
    allLayanan = [],
    data = [],
    filters = {}
}) {
    const { auth } = usePage().props;

    // Filter Form State
    const [bidangFilter, setBidangFilter] = useState(filters.bidang || 'all');
    const [layananFilter, setLayananFilter] = useState(filters.layanan || 'all');
    const [startDate, setStartDate] = useState(filters.tanggal_awal || '');
    const [endDate, setEndDate] = useState(filters.tanggal_akhir || '');
    const [layananOptions, setLayananOptions] = useState(() => {
        if (layananList && layananList.length > 0) return layananList;
        return allLayanan || [];
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Active submitted dates (for headers and stats)
    const activeStart = filters.tanggal_awal || '';
    const activeEnd = filters.tanggal_akhir || '';
    const hasDateRange = Boolean(activeStart && activeEnd);

    // Client-side Table Filter & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PROSES, PERBAIKAN, SELESAI
    const [copiedTiket, setCopiedTiket] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Modal Riwayat State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Sync Layanan options saat Bidang berubah
    const handleBidangChange = (newBidangId) => {
        setBidangFilter(newBidangId);
        setLayananFilter('all');

        const pool = allLayanan && allLayanan.length > 0 ? allLayanan : layananList;
        if (newBidangId === 'all') {
            setLayananOptions(pool || []);
        } else {
            const filtered = (pool || []).filter(
                (l) => String(l.kode_bidang) === String(newBidangId)
            );
            setLayananOptions(filtered);
        }
    };

    useEffect(() => {
        const pool = allLayanan && allLayanan.length > 0 ? allLayanan : layananList;
        if (bidangFilter === 'all') {
            setLayananOptions(pool || []);
        } else {
            const filtered = (pool || []).filter(
                (l) => String(l.kode_bidang) === String(bidangFilter)
            );
            setLayananOptions(filtered);
        }
    }, [bidangFilter, allLayanan, layananList]);

    // Helper: Initial Avatar Bulat Slate
    const getInitials = (name, fallback = 'P') => {
        if (!name || name === '-') return fallback;
        const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return fallback;
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Helper: Format Tanggal Indonesia
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return dateString;
        }
    };

    // Preset Cepat Tanggal
    const applyPreset = (preset) => {
        const today = new Date();
        const formatDateString = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        let sDate = '';
        let eDate = formatDateString(today);

        if (preset === 'today') {
            sDate = eDate;
        } else if (preset === '7days') {
            const past = new Date();
            past.setDate(today.getDate() - 6);
            sDate = formatDateString(past);
        } else if (preset === 'thisMonth') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            sDate = formatDateString(firstDay);
        } else if (preset === 'lastMonth') {
            const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            sDate = formatDateString(firstDayLastMonth);
            eDate = formatDateString(lastDayLastMonth);
        } else if (preset === 'thisYear') {
            sDate = `${today.getFullYear()}-01-01`;
        }

        setStartDate(sDate);
        setEndDate(eDate);
        handleSubmitFilter(sDate, eDate);
    };

    // Submit Filter
    const handleSubmitFilter = (sDate = startDate, eDate = endDate) => {
        if (!sDate || !eDate) {
            alert('Mohon tentukan Tanggal Mulai dan Tanggal Selesai.');
            return;
        }

        setIsSubmitting(true);
        router.get(
            '/root/laporan',
            {
                filter: 1,
                bidang: bidangFilter,
                layanan: layananFilter,
                tanggal_awal: sDate,
                tanggal_akhir: eDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Reset Filter
    const handleResetFilter = () => {
        setBidangFilter('all');
        setLayananFilter('all');
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
        setStatusFilter('ALL');
        setLayananOptions(allLayanan || []);

        router.get(
            '/root/laporan',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

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

    // Hitung Statistik Laporan (Bagian 5 Standard.md)
    const stats = useMemo(() => {
        let total = data.length;
        let selesai = 0;
        let perbaikan = 0;
        let proses = 0;

        data.forEach((item) => {
            const isFinished = Number(item.archives) === 1;
            const statusName = item.tahap_terakhir?.status_rel?.status?.toLowerCase() || '';
            const isBtl = statusName.includes('btl') || statusName.includes('perbaikan') || Number(item.tahap_terakhir?.status) === 2;

            if (isFinished) {
                selesai++;
            } else if (isBtl) {
                perbaikan++;
            } else {
                proses++;
            }
        });

        return { total, selesai, perbaikan, proses };
    }, [data]);

    // Filter Data Berdasarkan Search & Status Tab (useMemo)
    const filteredData = useMemo(() => {
        let result = data;

        // Status Tab Filter
        if (statusFilter === 'SELESAI') {
            result = result.filter((item) => Number(item.archives) === 1);
        } else if (statusFilter === 'PERBAIKAN') {
            result = result.filter((item) => {
                const statusName = item.tahap_terakhir?.status_rel?.status?.toLowerCase() || '';
                return (
                    Number(item.archives) !== 1 &&
                    (statusName.includes('btl') || statusName.includes('perbaikan') || Number(item.tahap_terakhir?.status) === 2)
                );
            });
        } else if (statusFilter === 'PROSES') {
            result = result.filter((item) => {
                const isFinished = Number(item.archives) === 1;
                const statusName = item.tahap_terakhir?.status_rel?.status?.toLowerCase() || '';
                const isBtl = statusName.includes('btl') || statusName.includes('perbaikan') || Number(item.tahap_terakhir?.status) === 2;
                return !isFinished && !isBtl;
            });
        }

        // Live Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((item) => {
                const noTiket = (item.no_tiket || '').toLowerCase();
                const nip = (item.nip || '').toLowerCase();
                const nama = (item.nama || '').toLowerCase();
                const opd = (item.nama_ukerja || '').toLowerCase();
                const layanan = (item.layanan?.nama_layanan || '').toLowerCase();
                const bidang = (item.layanan?.bidang?.nama_bidang || '').toLowerCase();

                return (
                    noTiket.includes(q) ||
                    nip.includes(q) ||
                    nama.includes(q) ||
                    opd.includes(q) ||
                    layanan.includes(q) ||
                    bidang.includes(q)
                );
            });
        }

        return result;
    }, [data, statusFilter, searchQuery]);

    // Paginasi Data
    const totalPages = Math.ceil(filteredData.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, currentPage, perPage]);

    // Export PDF URL resmi Root
    const exportPdfUrl = hasDateRange
        ? `/root/laporan/export-pdf?bidang=${encodeURIComponent(bidangFilter)}&layanan=${encodeURIComponent(layananFilter)}&tanggal_awal=${encodeURIComponent(activeStart)}&tanggal_akhir=${encodeURIComponent(activeEnd)}`
        : '#';

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Laporan Usulan Layanan - PILKB" />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <BarChart2 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Laporan Usulan Layanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            {hasDateRange ? (
                                <>
                                    Rekapitulasi pengajuan usulan periode{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        {formatDate(activeStart)} s/d {formatDate(activeEnd)}
                                    </span>
                                </>
                            ) : (
                                'Pilih rentang tanggal untuk melihat laporan usulan layanan kepegawaian.'
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        {/* Tombol Export PDF Header (Bagian 4 Poin 2 Standard.md) */}
                        <a
                            href={exportPdfUrl}
                            onClick={(e) => {
                                if (!hasDateRange) {
                                    e.preventDefault();
                                    alert('Mohon tentukan Tanggal Mulai dan Tanggal Selesai terlebih dahulu.');
                                }
                            }}
                            target={hasDateRange ? '_blank' : undefined}
                            rel="noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-2xs transition-colors cursor-pointer ${
                                hasDateRange
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : 'bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                            title={hasDateRange ? 'Unduh Laporan Format PDF' : 'Pilih rentang tanggal terlebih dahulu'}
                        >
                            <Download className={`w-4 h-4 ${hasDateRange ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
                            <span>Export PDF</span>
                        </a>
                    </div>
                </div>

                {/* 2. STATS METRIC CARDS (Bagian 5 Standard.md - Tampil Saat Data Dimuat) */}
                {hasDateRange && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Total Laporan */}
                        <div
                            onClick={() => {
                                setStatusFilter('ALL');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                statusFilter === 'ALL'
                                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Laporan
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {stats.total}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    Semua
                                </span>
                            </div>
                        </div>

                        {/* Sedang Diproses */}
                        <div
                            onClick={() => {
                                setStatusFilter('PROSES');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                statusFilter === 'PROSES'
                                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Sedang Diproses
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                    {stats.proses}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                                    Proses
                                </span>
                            </div>
                        </div>

                        {/* BTL / Perbaikan */}
                        <div
                            onClick={() => {
                                setStatusFilter('PERBAIKAN');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                statusFilter === 'PERBAIKAN'
                                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                BTL / Perbaikan
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                    {stats.perbaikan}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                                    Revisi
                                </span>
                            </div>
                        </div>

                        {/* Usulan Selesai */}
                        <div
                            onClick={() => {
                                setStatusFilter('SELESAI');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                statusFilter === 'SELESAI'
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Usulan Selesai
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {stats.selesai}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                                    Selesai
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. CARD TOOLBAR FILTER TERPADU (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                    {/* Quick Presets Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Filter Cepat:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {[
                                { key: 'today', label: 'Hari Ini' },
                                { key: '7days', label: '7 Hari Terakhir' },
                                { key: 'thisMonth', label: 'Bulan Ini' },
                                { key: 'lastMonth', label: 'Bulan Lalu' },
                                { key: 'thisYear', label: 'Tahun Ini' },
                            ].map((preset) => (
                                <button
                                    key={preset.key}
                                    type="button"
                                    onClick={() => applyPreset(preset.key)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Fields Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitFilter();
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
                            {/* Bidang */}
                            <div className="lg:col-span-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Bidang Layanan
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <select
                                        value={bidangFilter}
                                        onChange={(e) => handleBidangChange(e.target.value)}
                                        className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                    >
                                        <option value="all">Semua Bidang</option>
                                        {bidangList.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.nama_bidang}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Layanan */}
                            <div className="lg:col-span-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Layanan Kepegawaian
                                </label>
                                <div className="relative">
                                    <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <select
                                        value={layananFilter}
                                        onChange={(e) => setLayananFilter(e.target.value)}
                                        className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                    >
                                        <option value="all">Semua Layanan</option>
                                        {layananOptions.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.nama_layanan}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Tanggal Mulai */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Tanggal Mulai
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Tanggal Selesai */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Tanggal Selesai
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Buttons Submit & Reset */}
                            <div className="lg:col-span-2 flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Tampilkan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
                                    title="Reset Seluruh Filter"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* 4. RESULTS SECTION (Bagian 8 Standard.md) */}
                {!hasDateRange ? (
                    /* PROMPT CARD BELUM MEMILIH TANGGAL (Bagian 8 Standard.md) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Rentang Tanggal Belum Dipilih
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Silakan tentukan <span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Mulai</span> dan <span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Selesai</span> pada form di atas atau gunakan tombol <span className="font-semibold text-blue-600 dark:text-blue-400">Filter Cepat</span> untuk memuat data laporan.
                        </p>
                    </div>
                ) : data.length === 0 ? (
                    /* EMPTY STATE DATA KOSONG (Bagian 8 Standard.md) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <BarChart2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Tidak Ada Data Laporan
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Tidak ditemukan usulan layanan kepegawaian pada rentang periode yang Anda pilih. Silakan ubah filter tanggal atau layanan.
                        </p>
                    </div>
                ) : (
                    /* 5. TABEL DATA TUNGGAL RESPONSIF (Bagian 3, 4, & 6 Standard.md) */
                    <div className="space-y-4">
                        {/* Search Toolbar & PerPage Selector */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Cari nomor tiket, NIP, nama pemohon, OPD..."
                                    className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-xs text-slate-400">Tampilkan:</span>
                                <div className="relative">
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 pr-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-2xs"
                                    >
                                        <option value={10}>10 per hal</option>
                                        <option value={25}>25 per hal</option>
                                        <option value={50}>50 per hal</option>
                                    </select>
                                    <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Data Table Card */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            {filteredData.length === 0 ? (
                                <div className="py-16 px-4 text-center">
                                    <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Data Tidak Ditemukan
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        {searchQuery
                                            ? `Tidak ada data laporan yang cocok dengan kata kunci "${searchQuery}".`
                                            : 'Tidak ada data pada kategori status yang dipilih.'}
                                    </p>
                                    {(searchQuery || statusFilter !== 'ALL') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setStatusFilter('ALL');
                                            }}
                                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Reset Filter Tabel</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* TABLE VIEW RESPONSIF TUNGGAL (Zero Mobile Duplication) */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                                                    <th className="py-3.5 px-4">No. Tiket</th>
                                                    <th className="py-3.5 px-4">Pemohon</th>
                                                    <th className="py-3.5 px-4">Layanan</th>
                                                    <th className="py-3.5 px-4">Tanggal Masuk</th>
                                                    <th className="py-3.5 px-4 text-center">Status Terakhir</th>
                                                    <th className="py-3.5 px-4">Penerima</th>
                                                    <th className="py-3.5 px-4 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                                {paginatedData.map((item, index) => {
                                                    const rowNumber = (currentPage - 1) * perPage + index + 1;
                                                    const isCopied = copiedTiket === item.no_tiket;
                                                    const initials = getInitials(item.nama);
                                                    const statusId = item.archives == 1 ? 4 : (item.tahap_terakhir?.status || 1);
                                                    const statusName = item.archives == 1 ? 'Selesai' : (item.tahap_terakhir?.status_rel?.status || 'Diajukan');
                                                    const tanggalDisplay = formatDate(item.tanggal);
                                                    const penerimaDisplay = item.user?.nama || '-';

                                                    return (
                                                        <tr
                                                            key={item.id || index}
                                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                                                        >
                                                            {/* No */}
                                                            <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                                                                {rowNumber}
                                                            </td>

                                                            {/* No Tiket */}
                                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-blue-600 dark:text-blue-400">
                                                                        #{item.no_tiket}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCopyTiket(item.no_tiket)}
                                                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                                                        title="Salin Nomor Tiket"
                                                                    >
                                                                        {isCopied ? (
                                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                        ) : (
                                                                            <Copy className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            {/* Pemohon */}
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                                                                        {initials}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                                                                            {item.nama || '-'}
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-400 font-mono">
                                                                            {item.nip || '-'}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] mt-0.5">
                                                                            {item.nama_ukerja || '-'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Layanan */}
                                                            <td className="py-3.5 px-4">
                                                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                                                    {item.layanan?.nama_layanan || '-'}
                                                                </div>
                                                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                                    <Building2 className="w-3 h-3" />
                                                                    <span>
                                                                        {item.layanan?.bidang?.nama_bidang || 'Bidang Umum'}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Tanggal Masuk */}
                                                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                                {tanggalDisplay}
                                                            </td>

                                                            {/* Status Terakhir */}
                                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                                <StatusBadge
                                                                    statusId={statusId}
                                                                    statusName={statusName}
                                                                />
                                                            </td>

                                                            {/* Penerima */}
                                                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                                {penerimaDisplay}
                                                            </td>

                                                            {/* Aksi */}
                                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenRiwayat(item)}
                                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs border border-slate-200/80 dark:border-slate-800 cursor-pointer"
                                                                    title="Lihat Riwayat Tahapan Tiket"
                                                                >
                                                                    <History className="w-3.5 h-3.5" />
                                                                    <span>Riwayat</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Paginasi Reusable */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={filteredData.length}
                                        perPage={perPage}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
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
