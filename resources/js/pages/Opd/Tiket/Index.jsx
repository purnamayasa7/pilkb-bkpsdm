import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import ReviewModal from '@/components/ReviewModal';
import Pagination from '@/components/Pagination';
import { getInitials } from '@/utils/initials';
import {
    ClipboardList,
    Plus,
    Download,
    FileSpreadsheet,
    FileText,
    Search,
    Calendar,
    Filter,
    ChevronDown,
    Eye,
    Printer,
    Copy,
    Check,
    X,
    ArrowUpDown,
    RotateCcw,
    Star,
} from 'lucide-react';

const MONTH_NAMES = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

export default function Index({ auth, tiket = [], month = new Date().getMonth() + 1, year = new Date().getFullYear() }) {
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedYear, setSelectedYear] = useState(year);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [copiedTiket, setCopiedTiket] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);

    // Modal Riwayat State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTiket, setSelectedTiket] = useState(null);

    // Modal Review SKM State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewTiket, setReviewTiket] = useState(null);
    const [isFromPrint, setIsFromPrint] = useState(false);
    const [pendingPrintTiket, setPendingPrintTiket] = useState(null);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Daftar tahun (10 tahun terakhir)
    const currentYearNum = new Date().getFullYear();
    const yearsList = useMemo(() => {
        const years = [];
        for (let y = currentYearNum; y >= currentYearNum - 9; y--) {
            years.push(y);
        }
        return years;
    }, [currentYearNum]);

    // Handler filter bulan/tahun via Inertia visit
    const handleFilterChange = (newMonth, newYear) => {
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
        setCurrentPage(1);
        router.get(
            '/adminOpd/tiket',
            { month: newMonth, year: newYear },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['tiket', 'month', 'year'],
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

    // Open Modal Review SKM
    const handleOpenReview = (item, fromPrint = false) => {
        setReviewTiket(item);
        setIsFromPrint(fromPrint);
        if (fromPrint) {
            setPendingPrintTiket(item.no_tiket);
        } else {
            setPendingPrintTiket(null);
        }
        setReviewModalOpen(true);
    };

    // Handler Cetak Tiket (Opsi 1: Soft-gating jika usulan telah selesai tapi belum diulas)
    const handlePrintTiket = (item) => {
        if (item.archives == 1 && !item.review) {
            handleOpenReview(item, true);
            return;
        }
        window.open(`/tiket/cetak/${encodeURIComponent(item.no_tiket)}`, '_blank');
    };

    // Callback setelah ulasan sukses terkirim
    const handleReviewSuccess = (noTiket) => {
        if (pendingPrintTiket === noTiket) {
            window.open(`/tiket/cetak/${encodeURIComponent(noTiket)}`, '_blank');
            setPendingPrintTiket(null);
        }
    };

    // Usulan Selesai yang Belum Diulas oleh Admin OPD (Opsi 3)
    const pendingReviewTiket = useMemo(() => {
        return tiket.filter((item) => item.archives == 1 && !item.review);
    }, [tiket]);

    // Client-side Filtered List
    const filteredTiket = useMemo(() => {
        return tiket.filter((item) => {
            // Status filter
            const lastStatus = item.tahap_terakhir?.status_rel?.status || item.tahapTerakhir?.statusRel?.status || '';
            const statusLower = lastStatus.toLowerCase();

            if (statusFilter === 'PROSES') {
                if (statusLower.includes('selesai') || statusLower.includes('perbaikan') || statusLower.includes('btl') || statusLower.includes('tolak')) {
                    return false;
                }
            } else if (statusFilter === 'PERBAIKAN') {
                if (!statusLower.includes('perbaikan') && !statusLower.includes('btl') && !statusLower.includes('revisi')) {
                    return false;
                }
            } else if (statusFilter === 'SELESAI') {
                if (!statusLower.includes('selesai') && !statusLower.includes('setuju')) {
                    return false;
                }
            }

            // Search query filter
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            const noTiket = (item.no_tiket || '').toLowerCase();
            const nip = (item.nip || '').toLowerCase();
            const nama = (item.nama || '').toLowerCase();
            const layanan = (item.layanan?.nama_layanan || '').toLowerCase();

            return noTiket.includes(query) || nip.includes(query) || nama.includes(query) || layanan.includes(query);
        });
    }, [tiket, searchQuery, statusFilter]);

    // Summary Counts
    const counts = useMemo(() => {
        let total = tiket.length;
        let proses = 0;
        let btl = 0;
        let selesai = 0;

        tiket.forEach((t) => {
            const st = (t.tahap_terakhir?.status_rel?.status || t.tahapTerakhir?.statusRel?.status || '').toLowerCase();
            if (st.includes('selesai') || st.includes('setuju')) selesai++;
            else if (st.includes('perbaikan') || st.includes('btl') || st.includes('revisi')) btl++;
            else proses++;
        });

        return { total, proses, btl, selesai };
    }, [tiket]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTiket.length / perPage) || 1;
    const paginatedTiket = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredTiket.slice(start, start + perPage);
    }, [filteredTiket, currentPage, perPage]);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Daftar Pengajuan Usulan - PILKB" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <ClipboardList className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Daftar Proses Pengajuan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Proses pengajuan usulan kepegawaian instansi Anda untuk periode{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {MONTH_NAMES.find((m) => m.value === Number(selectedMonth))?.label} {selectedYear}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        {/* Tombol Ajukan Usulan Baru */}
                        <Link
                            href="/adminOpd/tiket/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Ajukan Usulan Baru</span>
                        </Link>

                        {/* Dropdown Export */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setExportOpen(!exportOpen)}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Export Data</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {exportOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setExportOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                                        <a
                                            href={`/adminOpd/tiket/export-excel?month=${encodeURIComponent(selectedMonth)}&year=${encodeURIComponent(selectedYear)}`}
                                            onClick={() => setExportOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            <span>Export Excel</span>
                                        </a>
                                        <a
                                            href={`/adminOpd/tiket/export-pdf?month=${encodeURIComponent(selectedMonth)}&year=${encodeURIComponent(selectedYear)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => setExportOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 text-rose-600" />
                                            <span>Export PDF</span>
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* STATS CHIPS CARD */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div
                        onClick={() => setStatusFilter('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Total Periode Ini
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {counts.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                Semua
                            </span>
                        </div>
                    </div>

                    <div
                        onClick={() => setStatusFilter('PROSES')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'PROSES'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Sedang Diproses
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                {counts.proses}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                                Proses
                            </span>
                        </div>
                    </div>

                    <div
                        onClick={() => setStatusFilter('PERBAIKAN')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'PERBAIKAN'
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            BTL / Perbaikan
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {counts.btl}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                                Revisi
                            </span>
                        </div>
                    </div>

                    <div
                        onClick={() => setStatusFilter('SELESAI')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'SELESAI'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Telah Selesai
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {counts.selesai}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                                Selesai
                            </span>
                        </div>
                    </div>
                </div>

                {/* OPSI 3: BANNER PENGINGAT ULASAN TIKET SELESAI */}
                {pendingReviewTiket.length > 0 && !bannerDismissed && (
                    <div className="rounded-3xl border border-amber-200/90 dark:border-amber-800/70 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 p-4 sm:p-5 shadow-xs transition-all animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start sm:items-center gap-3.5">
                                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 flex-shrink-0">
                                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            Bantu Kami Meningkatkan Mutu Layanan
                                        </h4>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300">
                                            {pendingReviewTiket.length} Usulan Selesai
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                        {pendingReviewTiket.length === 1 ? (
                                            <>
                                                Usulan nomor{' '}
                                                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                                                    {pendingReviewTiket[0].no_tiket}
                                                </span>{' '}
                                                ({pendingReviewTiket[0].layanan?.nama_layanan || 'Layanan'}) telah selesai diproses. Mohon luangkan waktu anda untuk memberikan ulasan demi peningkatan layanan kami.
                                            </>
                                        ) : (
                                            <>
                                                Terdapat <span className="font-semibold text-slate-900 dark:text-white">{pendingReviewTiket.length} usulan</span> yang telah selesai dan siap diulas. Masukan Anda sangat berarti bagi evaluasi pelayanan BKPSDM Buleleng.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleOpenReview(pendingReviewTiket[0], false)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                                >
                                    <span>Beri Ulasan Sekarang</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBannerDismissed(true)}
                                    title="Tutup Pengingat"
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FILTER TOOLBAR CARD */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search */}
                        <div className="lg:col-span-5 relative">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari No Tiket, NIP, Nama, atau Layanan..."
                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

                        {/* Bulan Selector */}
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => handleFilterChange(Number(e.target.value), selectedYear)}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    {MONTH_NAMES.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            Bulan: {m.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Tahun Selector */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => handleFilterChange(selectedMonth, Number(e.target.value))}
                                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    {yearsList.map((y) => (
                                        <option key={y} value={y}>
                                            Tahun: {y}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Items Per Page */}
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
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* DATA TABLE CARD (Desktop & iPad) + CARD LIST (Mobile) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {paginatedTiket.length === 0 ? (
                        <div className="py-16 px-4 text-center">
                            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Tidak ada data pengajuan usulan
                            </h4>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                {searchQuery
                                    ? `Tidak ditemukan usulan dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                                    : `Belum ada pengajuan usulan yang tercatat untuk periode ${MONTH_NAMES.find((m) => m.value === Number(selectedMonth))?.label} ${selectedYear}.`}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset Pencarian</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* TABLE VIEW */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <th className="py-3.5 px-4 lg:px-6">No Tiket</th>
                                            <th className="py-3.5 px-4 lg:px-6">Pegawai</th>
                                            <th className="py-3.5 px-4 lg:px-6">Layanan</th>
                                            <th className="py-3.5 px-4 lg:px-6">Tanggal</th>
                                            <th className="py-3.5 px-4 lg:px-6">Status Terakhir</th>
                                            <th className="py-3.5 px-4 lg:px-6 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedTiket.map((item) => {
                                            const statusText =
                                                item.tahap_terakhir?.status_rel?.status ||
                                                item.tahapTerakhir?.statusRel?.status ||
                                                'Menunggu Verifikasi';

                                            return (
                                                <tr
                                                    key={item.id || item.no_tiket}
                                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                >
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
                                                            title={item.layanan?.nama_layanan || '-'}
                                                        >
                                                            {item.layanan?.nama_layanan || '-'}
                                                        </span>
                                                    </td>

                                                    {/* Tanggal */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                                        {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        }) : '-'}
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

                                                            <button
                                                                type="button"
                                                                onClick={() => handlePrintTiket(item)}
                                                                title={item.archives == 1 && !item.review ? 'Beri ulasan kepuasan untuk mencetak bukti tiket' : 'Cetak Bukti Tiket'}
                                                                className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </button>

                                                            {/* Tombol Beri Ulasan — hanya tampil jika tiket Selesai (archives=1) */}
                                                            {item.archives == 1 && (
                                                                item.review ? (
                                                                    /* Sudah diulas — tampil badge hijau */
                                                                    <span
                                                                        title="Ulasan sudah dikirim"
                                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/50"
                                                                    >
                                                                        <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                                                        Sudah Diulas
                                                                    </span>
                                                                ) : (
                                                                    /* Belum diulas — tombol bintang */
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenReview(item)}
                                                                        title="Beri Ulasan Kepuasan"
                                                                        className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800 transition-colors"
                                                                    >
                                                                        <Star className="w-4 h-4" />
                                                                    </button>
                                                                )
                                                            )}
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

            {/* MODAL RIWAYAT TAHAPAN (REUSABLE COMPONENT) */}
            <RiwayatTahapanModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                tiket={selectedTiket}
            />

            {/* MODAL REVIEW SKM */}
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => {
                    setReviewModalOpen(false);
                    setReviewTiket(null);
                    setIsFromPrint(false);
                    setPendingPrintTiket(null);
                }}
                noTiket={reviewTiket?.no_tiket}
                namaLayanan={reviewTiket?.layanan?.nama_layanan || ''}
                isFromPrint={isFromPrint}
                onSuccess={handleReviewSuccess}
            />
        </AuthenticatedLayout>
    );
}
