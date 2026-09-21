import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import { getInitials } from '@/utils/initials';
import {
    ClipboardList,
    Search,
    Calendar,
    ChevronDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Check,
    Copy,
    RotateCcw,
    Edit3,
    Eye,
    Archive,
    Loader2,
    ArrowRight
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

export default function Index({
    auth,
    tiket = [],
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
    namaBidang = 'Bidang',
}) {
    const { flash = {} } = usePage().props;

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedYear, setSelectedYear] = useState(year);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PROSES, BTL, SELESAI
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat State
    const [modalRiwayatOpen, setModalRiwayatOpen] = useState(false);
    const [selectedTiket, setSelectedTiket] = useState(null);

    // Modal Konfirmasi Selesai State
    const [confirmSelesaiOpen, setConfirmSelesaiOpen] = useState(false);
    const [tiketToSelesai, setTiketToSelesai] = useState(null);
    const [submittingSelesai, setSubmittingSelesai] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Sync state when props change
    useEffect(() => {
        setSelectedMonth(month);
        setSelectedYear(year);
        setCurrentPage(1);
    }, [month, year]);

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
            '/adminBidang/permintaan',
            { month: newMonth, year: newYear },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['tiket', 'month', 'year', 'namaBidang'],
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
        setModalRiwayatOpen(true);
    };

    // Open Modal Selesai
    const handleOpenSelesai = (item) => {
        setTiketToSelesai(item);
        setConfirmSelesaiOpen(true);
    };

    // Submit Selesai Permintaan
    const handleSubmitSelesai = () => {
        if (!tiketToSelesai?.no_tiket) return;

        setSubmittingSelesai(true);
        router.post(
            `/adminBidang/permintaan/${encodeURIComponent(tiketToSelesai.no_tiket)}/selesai`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmSelesaiOpen(false);
                    setTiketToSelesai(null);
                    setSubmittingSelesai(false);
                },
                onError: (err) => {
                    setSubmittingSelesai(false);
                    alert(Object.values(err)[0] || 'Gagal memproses usulan selesai.');
                },
            }
        );
    };

    // Summary Counts
    const counts = useMemo(() => {
        let total = tiket.length;
        let proses = 0;
        let btl = 0;
        let selesai = 0;

        tiket.forEach((t) => {
            const isArchived = t.archives == 1;
            const st = (
                t.tahap_terakhir?.status_rel?.status ||
                t.tahapTerakhir?.statusRel?.status ||
                ''
            ).toLowerCase();
            const isBtl = st.includes('btl') || st.includes('perbaikan') || st.includes('revisi');

            if (isArchived) {
                selesai++;
            } else {
                proses++;
                if (isBtl) {
                    btl++;
                }
            }
        });

        return { total, proses, btl, selesai };
    }, [tiket]);

    // Client-side Filtered List
    const filteredTiket = useMemo(() => {
        return tiket.filter((item) => {
            const isArchived = item.archives == 1;
            const lastStatus = (
                item.tahap_terakhir?.status_rel?.status ||
                item.tahapTerakhir?.statusRel?.status ||
                ''
            ).toLowerCase();

            // Status Filter Tab
            if (statusFilter === 'PROSES') {
                if (isArchived) {
                    return false;
                }
            } else if (statusFilter === 'BTL') {
                if (isArchived || (!lastStatus.includes('btl') && !lastStatus.includes('perbaikan') && !lastStatus.includes('revisi'))) {
                    return false;
                }
            } else if (statusFilter === 'SELESAI') {
                if (!isArchived) {
                    return false;
                }
            }

            // Search Filter
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const noTiket = (item.no_tiket || '').toLowerCase();
            const nip = (item.nip || '').toLowerCase();
            const nama = (item.nama || '').toLowerCase();
            const layanan = (item.layanan?.nama_layanan || '').toLowerCase();
            const ukerja = (item.nama_ukerja || '').toLowerCase();

            return (
                noTiket.includes(q) ||
                nip.includes(q) ||
                nama.includes(q) ||
                layanan.includes(q) ||
                ukerja.includes(q)
            );
        });
    }, [tiket, searchQuery, statusFilter]);

    // Pagination Slicing
    const paginatedTiket = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredTiket.slice(start, start + perPage);
    }, [filteredTiket, currentPage, perPage]);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Daftar Permintaan Layanan - ${namaBidang} - PILKB`} />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <ClipboardList className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                List Permintaan - {namaBidang}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftar permohonan usulan kepegawaian yang masuk ke bidang Anda untuk tahun{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {MONTH_NAMES.find((m) => m.value === Number(selectedMonth))?.label} {selectedYear}
                            </span>
                        </p>
                    </div>

                    {/* Reset Period Button if not current month/year */}
                    {(selectedMonth !== (new Date().getMonth() + 1) || selectedYear !== currentYearNum) && (
                        <button
                            type="button"
                            onClick={() => handleFilterChange(new Date().getMonth() + 1, currentYearNum)}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer self-start md:self-auto"
                        >
                            <RotateCcw className="w-4 h-4 text-slate-400" />
                            <span>Bulan Sekarang</span>
                        </button>
                    )}
                </div>

                {/* 4 STATISTIC METRIC CARDS (INTERACTIVE QUICK FILTER) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Total Permintaan */}
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
                            Total Permintaan
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

                    {/* Card 2: Sedang Diproses */}
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
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                {counts.proses}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                                Proses
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Berkas BTL / Perbaikan */}
                    <div
                        onClick={() => {
                            setStatusFilter('BTL');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'BTL'
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

                    {/* Card 4: Usulan Selesai */}
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

                {/* FILTER TOOLBAR CARD (TERPADU: SEARCH, BULAN, TAHUN, PER PAGE) */}
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
                                placeholder="Cari No Tiket, NIP, Nama, Layanan, atau Instansi..."
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

                {/* SINGLE DATA TABLE CARD (OVERFLOW-X-AUTO) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {filteredTiket.length === 0 ? (
                        <div className="py-16 px-4 text-center">
                            <ClipboardList className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Tidak ada data permintaan usulan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery
                                    ? `Tidak ditemukan tiket dengan kata kunci "${searchQuery}".`
                                    : `Belum ada usulan masuk untuk bidang ${namaBidang} pada periode terpilih.`}
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <th className="py-3.5 px-4 lg:px-6 w-12 text-center">No</th>
                                        <th className="py-3.5 px-4 lg:px-6">No Tiket</th>
                                        <th className="py-3.5 px-4 lg:px-6">Pegawai</th>
                                        <th className="py-3.5 px-4 lg:px-6">Layanan</th>
                                        <th className="py-3.5 px-4 lg:px-6">Unit Kerja</th>
                                        <th className="py-3.5 px-4 lg:px-6">Tanggal Masuk</th>
                                        <th className="py-3.5 px-4 lg:px-6">Status Terakhir</th>
                                        <th className="py-3.5 px-4 lg:px-6 text-center">Status</th>
                                        <th className="py-3.5 px-4 lg:px-6 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                    {paginatedTiket.map((item, index) => {
                                        const rowNumber = (currentPage - 1) * perPage + index + 1;
                                        const statusTerakhir =
                                            item.tahap_terakhir?.status_rel?.status ||
                                            item.tahapTerakhir?.statusRel?.status ||
                                            '-';
                                        const isArchived = item.archives == 1;

                                        return (
                                            <tr
                                                key={item.no_tiket || index}
                                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="py-3.5 px-4 lg:px-6 text-center font-medium text-slate-400 text-xs align-middle">
                                                    {rowNumber}
                                                </td>

                                                {/* No Tiket */}
                                                <td className="py-3.5 px-4 lg:px-6 align-middle font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{item.no_tiket}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyTiket(item.no_tiket)}
                                                            className="text-slate-400 hover:text-blue-600 p-1 rounded-md transition-colors"
                                                            title="Salin No Tiket"
                                                        >
                                                            {copiedTiket === item.no_tiket ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
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
                                                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
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

                                                {/* Unit Kerja */}
                                                <td className="py-3.5 px-4 lg:px-6 align-middle text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="line-clamp-2 max-w-[180px]" title={item.nama_ukerja || '-'}>
                                                        {item.nama_ukerja || '-'}
                                                    </span>
                                                </td>

                                                {/* Tanggal Masuk */}
                                                <td className="py-3.5 px-4 lg:px-6 align-middle text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {item.tanggal || '-'}
                                                </td>

                                                {/* Status Terakhir Tahap */}
                                                <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                    <StatusBadge status={statusTerakhir} />
                                                </td>

                                                {/* Status Usulan (Proses / Selesai) */}
                                                <td className="py-3.5 px-4 lg:px-6 align-middle text-center">
                                                    {isArchived ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Selesai</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Proses</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3.5 px-4 lg:px-6 align-middle text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Link Verifikasi / Edit Dokumen (Orange / Amber) */}
                                                        <Link
                                                            href={`/adminBidang/permintaan/${encodeURIComponent(item.no_tiket)}/edit`}
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                            title="Verifikasi / Update Dokumen"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>

                                                        {/* Tombol Proses Selesai */}
                                                        {!isArchived && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenSelesai(item)}
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-colors"
                                                                title="Tandai Layanan Selesai"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {/* Tombol Riwayat Tahapan (Biru) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenHistory(item)}
                                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                            title="Riwayat Tahapan Usulan"
                                                        >
                                                            <Eye className="w-4 h-4" />
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

                    {/* PAGINATION BAR */}
                    {filteredTiket.length > 0 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredTiket.length / perPage)}
                                onPageChange={(p) => setCurrentPage(p)}
                                totalItems={filteredTiket.length}
                                perPage={perPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL KONFIRMASI PROSES SELESAI */}
            {confirmSelesaiOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/50 text-emerald-600 flex items-center justify-center mx-auto">
                            <Archive className="w-6 h-6" />
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Konfirmasi Layanan Selesai
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Apakah Anda yakin layanan untuk No Tiket{' '}
                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                    {tiketToSelesai?.no_tiket}
                                </span>{' '}
                                sudah selesai dan ingin mengarsipkan tiket ini?
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Pegawai:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {tiketToSelesai?.nama || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Layanan:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                                    {tiketToSelesai?.layanan?.nama_layanan || '-'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={submittingSelesai}
                                onClick={() => {
                                    setConfirmSelesaiOpen(false);
                                    setTiketToSelesai(null);
                                }}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={submittingSelesai}
                                onClick={handleSubmitSelesai}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                            >
                                {submittingSelesai ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Mengarsipkan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Ya, Selesaikan & Arsipkan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RIWAYAT TAHAPAN */}
            <RiwayatTahapanModal
                isOpen={modalRiwayatOpen}
                onClose={() => {
                    setModalRiwayatOpen(false);
                    setSelectedTiket(null);
                }}
                tiket={selectedTiket}
            />
        </AuthenticatedLayout>
    );
}
