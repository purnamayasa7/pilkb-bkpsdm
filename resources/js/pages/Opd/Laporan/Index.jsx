import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import { getInitials } from '@/utils/initials';
import {
    BarChart2,
    Calendar,
    Download,
    FileText,
    Search,
    ChevronDown,
    Eye,
    Printer,
    Copy,
    Check,
    X,
    RotateCcw,
    Filter
} from 'lucide-react';

export default function Index({ tiket = [], start = '', end = '' }) {
    const { auth } = usePage().props;

    // Date range filter states
    const [startDate, setStartDate] = useState(start || '');
    const [endDate, setEndDate] = useState(end || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Client-side table filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PROSES, PERBAIKAN, SELESAI
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Modal Riwayat State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTiket, setSelectedTiket] = useState(null);

    // Sync state if props change
    useEffect(() => {
        setStartDate(start || '');
        setEndDate(end || '');
        setCurrentPage(1);
    }, [start, end]);

    // Handle Quick Date Presets
    const applyPreset = (preset) => {
        const today = new Date();
        const formatDateString = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
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

        // Directly submit preset
        handleSubmitFilter(sDate, eDate);
    };

    // Handle submit filter
    const handleSubmitFilter = (sDate = startDate, eDate = endDate) => {
        if (!sDate || !eDate) {
            alert('Mohon pilih tanggal mulai dan tanggal selesai');
            return;
        }

        setIsSubmitting(true);
        router.get(
            '/adminOpd/laporan',
            { start_date: sDate, end_date: eDate },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Handle Reset
    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
        setStatusFilter('ALL');
        setIsSubmitting(true);
        router.get(
            '/adminOpd/laporan',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Copy No Tiket helper
    const handleCopyTiket = (noTiket) => {
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => {
            setCopiedTiket(null);
        }, 2000);
    };

    // Open Modal Riwayat
    const handleOpenHistory = (item) => {
        setSelectedTiket(item);
        setModalOpen(true);
    };

    // Format Date helper
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

    // Calculate Summary Stats
    const stats = useMemo(() => {
        let total = tiket.length;
        let proses = 0;
        let btl = 0;
        let selesai = 0;

        tiket.forEach((t) => {
            const st = (
                t.tahap_terakhir?.status_rel?.status ||
                t.tahapTerakhir?.statusRel?.status ||
                t.status ||
                ''
            ).toLowerCase();

            if (st.includes('selesai') || st.includes('setuju') || st.includes('acc')) {
                selesai++;
            } else if (st.includes('perbaikan') || st.includes('btl') || st.includes('revisi')) {
                btl++;
            } else {
                proses++;
            }
        });

        return { total, proses, btl, selesai };
    }, [tiket]);

    // Client-side filtering (Search Query + Status Filter)
    const filteredTiket = useMemo(() => {
        return tiket.filter((item) => {
            // Status filter
            const st = (
                item.tahap_terakhir?.status_rel?.status ||
                item.tahapTerakhir?.statusRel?.status ||
                item.status ||
                ''
            ).toLowerCase();

            if (statusFilter === 'PROSES') {
                if (st.includes('selesai') || st.includes('setuju') || st.includes('btl') || st.includes('perbaikan')) {
                    return false;
                }
            } else if (statusFilter === 'PERBAIKAN') {
                if (!st.includes('btl') && !st.includes('perbaikan') && !st.includes('revisi')) {
                    return false;
                }
            } else if (statusFilter === 'SELESAI') {
                if (!st.includes('selesai') && !st.includes('setuju') && !st.includes('acc')) {
                    return false;
                }
            }

            // Search query filter
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase().trim();
            const noTiket = (item.no_tiket || '').toLowerCase();
            const nip = (item.nip || '').toLowerCase();
            const nama = (item.nama || '').toLowerCase();
            const layanan = (item.layanan?.nama_layanan || item.nama_layanan || '').toLowerCase();

            return noTiket.includes(q) || nip.includes(q) || nama.includes(q) || layanan.includes(q);
        });
    }, [tiket, statusFilter, searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTiket.length / perPage) || 1;
    const paginatedTiket = useMemo(() => {
        const startIdx = (currentPage - 1) * perPage;
        return filteredTiket.slice(startIdx, startIdx + perPage);
    }, [filteredTiket, currentPage, perPage]);

    const activeStart = start || startDate;
    const activeEnd = end || endDate;
    const hasDateRange = Boolean(activeStart && activeEnd);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Laporan Permintaan Layanan - PILKB" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <BarChart2 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Laporan Permintaan Layanan
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

                    {/* Tombol Export PDF Header (Bagian 4 Poin 1 & 2 Standard.md) */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        <a
                            href={
                                hasDateRange
                                    ? `/adminOpd/laporan/export?start_date=${encodeURIComponent(activeStart)}&end_date=${encodeURIComponent(activeEnd)}`
                                    : '#'
                            }
                            onClick={(e) => {
                                if (!hasDateRange) {
                                    e.preventDefault();
                                    alert('Mohon tentukan tanggal mulai dan tanggal selesai terlebih dahulu.');
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
                                    {stats.btl}
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

                    {/* Filter Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitFilter();
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
                            {/* Input Tanggal Mulai */}
                            <div className="lg:col-span-5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Tanggal Mulai
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input Tanggal Selesai */}
                            <div className="lg:col-span-5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Tanggal Selesai
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tombol Action Submit & Reset */}
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

                {/* RESULTS SECTION */}
                {!hasDateRange ? (
                    /* INITIAL PROMPT CARD (BELUM MEMILIH TANGGAL) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Rentang Tanggal Belum Dipilih
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Silakan tentukan <span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Mulai</span> dan <span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Selesai</span> pada kolom di atas atau gunakan tombol <span className="font-semibold text-blue-600 dark:text-blue-400">Filter Cepat</span> untuk memuat rekap laporan.
                        </p>
                    </div>
                ) : tiket.length === 0 ? (
                    /* NOT FOUND ALERT CARD */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Tidak Ada Data Laporan
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Belum ada tiket pengajuan usulan yang tercatat pada rentang tanggal{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {formatDate(activeStart)} s/d {formatDate(activeEnd)}
                            </span>.
                        </p>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Pilih Rentang Lain</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* TABLE & MOBILE LIST */
                    <div className="space-y-4">
                        {/* SEARCH & PER-PAGE TOOLBAR */}
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
                                    placeholder="Cari No Tiket, NIP, Nama pegawai, atau layanan..."
                                    className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
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

                        {/* DATA TABLE CARD (Desktop & iPad) + CARD LIST (Mobile) */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            {filteredTiket.length === 0 ? (
                                <div className="py-12 px-4 text-center">
                                    <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Tidak ada hasil yang sesuai
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Tidak ditemukan tiket dengan kata kunci "{searchQuery}".
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Reset Pencarian</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* TABLE VIEW */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    <th className="py-3.5 px-4 lg:px-6 w-12 text-center">No</th>
                                                    <th className="py-3.5 px-4 lg:px-6">No Tiket</th>
                                                    <th className="py-3.5 px-4 lg:px-6">Pegawai</th>
                                                    <th className="py-3.5 px-4 lg:px-6">Layanan</th>
                                                    <th className="py-3.5 px-4 lg:px-6">Tanggal Masuk</th>
                                                    <th className="py-3.5 px-4 lg:px-6">Status Terakhir</th>
                                                    <th className="py-3.5 px-4 lg:px-6 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                                {paginatedTiket.map((item, index) => {
                                                    const statusText =
                                                        item.tahap_terakhir?.status_rel?.status ||
                                                        item.tahapTerakhir?.statusRel?.status ||
                                                        item.status ||
                                                        'Menunggu Verifikasi';
                                                    const rowNumber = (currentPage - 1) * perPage + index + 1;

                                                    return (
                                                        <tr
                                                            key={item.id || item.no_tiket}
                                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                        >
                                                            {/* No */}
                                                            <td className="py-3.5 px-4 lg:px-6 text-center font-medium text-slate-400 text-xs align-middle">
                                                                {rowNumber}
                                                            </td>

                                                            {/* No Tiket */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs lg:text-sm">
                                                                        {item.no_tiket}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCopyTiket(item.no_tiket)}
                                                                        title="Salin No Tiket"
                                                                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                                                    >
                                                                        {copiedTiket === item.no_tiket ? (
                                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                        ) : (
                                                                            <Copy className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            {/* Pegawai */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                                        {getInitials(item.nama || item.nip, 'P')}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]" title={item.nama || '-'}>
                                                                            {item.nama || '-'}
                                                                        </p>
                                                                        <p className="text-[11px] font-mono text-slate-400">
                                                                            {item.nip || '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Layanan */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-middle text-xs">
                                                                <span
                                                                    className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px]"
                                                                    title={item.layanan?.nama_layanan || item.nama_layanan || '-'}
                                                                >
                                                                    {item.layanan?.nama_layanan || item.nama_layanan || '-'}
                                                                </span>
                                                            </td>

                                                            {/* Tanggal */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-middle whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                                                {formatDate(item.tanggal)}
                                                            </td>

                                                            {/* Status Terakhir */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                                <StatusBadge status={statusText} />
                                                            </td>

                                                            {/* Aksi */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-middle text-center whitespace-nowrap">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenHistory(item)}
                                                                        title="Lihat Riwayat Tahapan"
                                                                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50 transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>

                                                                    <a
                                                                        href={`/tiket/cetak/${encodeURIComponent(item.no_tiket)}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        title="Cetak Bukti Tiket"
                                                                        className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/40 transition-colors"
                                                                    >
                                                                        <Printer className="w-4 h-4" />
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* PAGINATION BAR */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={filteredTiket.length}
                                        perPage={perPage}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL RIWAYAT TAHAPAN (REUSABLE COMPONENT) */}
                <RiwayatTahapanModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    tiket={selectedTiket}
                />
            </div>
        </AuthenticatedLayout>
    );
}
