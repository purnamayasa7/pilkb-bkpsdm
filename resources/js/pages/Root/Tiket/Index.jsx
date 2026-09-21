import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import {
    ClipboardList,
    Search,
    X,
    Building2,
    Calendar,
    Layers,
    Clock,
    AlertCircle,
    CheckCircle2,
    Eye,
    Printer,
    FileSpreadsheet,
    FileText,
    ChevronDown,
    Copy,
    Check,
    Download,
    Filter,
    RotateCcw,
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

export default function RootTiketIndex({
    tiket = [],
    bidang = [],
    bidangId = '',
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
}) {
    // Current year & available years (10 tahun terakhir persis seperti Bidang/Permintaan/Index.jsx)
    const currentYearNum = new Date().getFullYear();
    const yearsList = useMemo(() => {
        const years = [];
        for (let y = currentYearNum; y >= currentYearNum - 9; y--) {
            years.push(y);
        }
        return years;
    }, [currentYearNum]);

    // Filter states
    const [selectedBidang, setSelectedBidang] = useState(bidangId || '');
    const [selectedMonth, setSelectedMonth] = useState(Number(month));
    const [selectedYear, setSelectedYear] = useState(Number(year));
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PROSES' | 'BTL' | 'SELESAI'
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Sync state when props change
    useEffect(() => {
        setSelectedBidang(bidangId || '');
        setSelectedMonth(Number(month));
        setSelectedYear(Number(year));
        setCurrentPage(1);
    }, [bidangId, month, year]);

    // Modal state
    const [historyModal, setHistoryModal] = useState({
        open: false,
        item: null,
    });

    // Copy to clipboard state
    const [copiedNoTiket, setCopiedNoTiket] = useState(null);

    // Export dropdown state
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef(null);

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

    // Handler filter via Inertia visit (persis logika handleFilterChange di Bidang/Permintaan/Index.jsx)
    const handleFilterChange = (newBidang, newMonth, newYear) => {
        setSelectedBidang(newBidang);
        setSelectedMonth(Number(newMonth));
        setSelectedYear(Number(newYear));
        setCurrentPage(1);

        const params = {
            month: Number(newMonth),
            year: Number(newYear),
        };
        if (newBidang) {
            params.bidang = newBidang;
        }

        router.get(
            '/root/tiket',
            params,
            {
                preserveState: true,
                preserveScroll: true,
                only: ['tiket', 'month', 'year', 'bidangId'],
            }
        );
    };

    // Calculate Summary Stats based on Standard.md Section 5
    const stats = useMemo(() => {
        const total = tiket.length;
        let proses = 0;
        let btl = 0;
        let selesai = 0;

        tiket.forEach((t) => {
            const isArchived = Number(t.archives) === 1;
            const statusText = (
                t.tahap_terakhir?.status_rel?.status ||
                t.tahapTerakhir?.statusRel?.status ||
                ''
            ).toLowerCase();

            const hasBtlDetail = Array.isArray(t.detail) && t.detail.some((d) => d.status == 2 || d.diperbaiki == 1);
            const isBtl = statusText.includes('btl') || statusText.includes('perbaikan') || statusText.includes('revisi') || hasBtlDetail;

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

    // Client-side filtering (Search & Quick Status Filter)
    const filteredTiket = useMemo(() => {
        return tiket.filter((item) => {
            const isArchived = Number(item.archives) === 1;
            const statusText = (
                item.tahap_terakhir?.status_rel?.status ||
                item.tahapTerakhir?.statusRel?.status ||
                ''
            ).toLowerCase();

            const hasBtlDetail = Array.isArray(item.detail) && item.detail.some((d) => d.status == 2 || d.diperbaiki == 1);
            const isBtl = statusText.includes('btl') || statusText.includes('perbaikan') || statusText.includes('revisi') || hasBtlDetail;

            // Status Quick Filter Tab
            if (statusFilter === 'PROSES' && isArchived) return false;
            if (statusFilter === 'BTL' && (isArchived || !isBtl)) return false;
            if (statusFilter === 'SELESAI' && !isArchived) return false;

            // Search Filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchTiket = item.no_tiket?.toLowerCase().includes(query);
                const matchNip = item.nip?.toLowerCase().includes(query);
                const matchNama = item.nama?.toLowerCase().includes(query);
                const matchUkerja = item.nama_ukerja?.toLowerCase().includes(query);
                const matchLayanan = item.layanan?.nama_layanan?.toLowerCase().includes(query);

                if (!matchTiket && !matchNip && !matchNama && !matchUkerja && !matchLayanan) {
                    return false;
                }
            }

            return true;
        });
    }, [tiket, statusFilter, searchQuery]);

    // Reset pagination to page 1 whenever search/status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTiket.length / perPage) || 1;
    const paginatedTiket = useMemo(() => {
        const sliceStart = (currentPage - 1) * perPage;
        return filteredTiket.slice(sliceStart, sliceStart + perPage);
    }, [filteredTiket, currentPage, perPage]);

    // Copy to clipboard handler
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedNoTiket(text);
        setTimeout(() => setCopiedNoTiket(null), 2000);
    };

    // Formatter helpers
    const getInitials = (name) => {
        if (!name || name === '-') return '??';
        const clean = name.replace(/^(h\.|hj\.|dr\.|drs\.|drh\.|ir\.)\s+/i, '').trim();
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Export query parameters matching controller
    const getExportUrl = (type) => {
        const params = new URLSearchParams();
        if (selectedBidang) params.append('bidang', selectedBidang);
        params.append('month', selectedMonth);
        params.append('year', selectedYear);

        const endpoint = type === 'excel' ? '/root/tiket/export-excel' : '/root/tiket/export-pdf';
        return `${endpoint}?${params.toString()}`;
    };

    const activeMonthLabel = MONTH_NAMES.find((m) => m.value === Number(selectedMonth))?.label || '';

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Permintaan Layanan - PILKB" />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4.1 Standard.md & Acuan Resmi Bidang/Layanan/Index.jsx & Opd/Tiket/Index.jsx) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <ClipboardList className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                List Permintaan Layanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftar seluruh usulan permohonan layanan kepegawaian lintas perangkat daerah{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                ({selectedBidang ? (bidang.find((b) => String(b.id) === String(selectedBidang))?.nama_bidang || 'Bidang Terpilih') : 'Semua Bidang'})
                            </span>{' '}
                            periode{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {activeMonthLabel} {selectedYear}
                            </span>
                        </p>
                    </div>

                    {/* Sisi Kanan: Posisi Tombol Header Baku (Standard.md Bagian 4.1) */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
                        {/* Reset Period Button if not current month/year/all bidang */}
                        {(Number(selectedMonth) !== (new Date().getMonth() + 1) || Number(selectedYear) !== currentYearNum || selectedBidang !== '') && (
                            <button
                                type="button"
                                onClick={() => handleFilterChange('', new Date().getMonth() + 1, currentYearNum)}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4 text-slate-400" />
                                <span>Bulan Sekarang</span>
                            </button>
                        )}

                        {/* Dropdown Export Baku (Standard.md Bagian 4.1 Poin 3) */}
                        <div className="relative" ref={exportRef}>
                            <button
                                type="button"
                                onClick={() => setExportOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                                            href={getExportUrl('excel')}
                                            onClick={() => setExportOpen(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            <span>Export Excel (.xlsx)</span>
                                        </a>
                                        <a
                                            href={getExportUrl('pdf')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setExportOpen(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 text-rose-600" />
                                            <span>Export PDF (.pdf)</span>
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. KARTU RINGKASAN STATISTIK (Metric Cards - Standard.md Seksi 5) */}
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
                                {stats.total}
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
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.proses}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                                Proses
                            </span>
                        </div>
                    </div>

                    {/* Card 3: BTL / Perbaikan */}
                    <div
                        onClick={() => {
                            setStatusFilter('BTL');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'BTL'
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            BTL / Perbaikan
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.btl}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
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
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.selesai}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                                Selesai
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Standard.md Seksi 4.3 & Gambar 1) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
                        {/* Live Search (lg:col-span-3) */}
                        <div className="lg:col-span-3 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari pemohon, NIP, no tiket, layanan..."
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Bidang Dropdown (lg:col-span-3) */}
                        <div className="lg:col-span-3 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <select
                                value={selectedBidang}
                                onChange={(e) => handleFilterChange(e.target.value, selectedMonth, selectedYear)}
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Semua Bidang</option>
                                {bidang.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nama_bidang}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Month Dropdown (lg:col-span-2) */}
                        <div className="lg:col-span-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <select
                                value={selectedMonth}
                                onChange={(e) => handleFilterChange(selectedBidang, Number(e.target.value), selectedYear)}
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                {MONTH_NAMES.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        Bulan: {m.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Year Dropdown (lg:col-span-2) - FIXED: Luas, tidak terpotong, padding proporsional */}
                        <div className="lg:col-span-2 relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => handleFilterChange(selectedBidang, selectedMonth, Number(e.target.value))}
                                className="w-full pl-4 pr-8 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                {yearsList.map((y) => (
                                    <option key={y} value={y}>
                                        Tahun: {y}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Per Page Dropdown (lg:col-span-2) */}
                        <div className="lg:col-span-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Layers className="w-4 h-4" />
                            </div>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value={10}>10 / hal</option>
                                <option value={25}>25 / hal</option>
                                <option value={50}>50 / hal</option>
                                <option value={100}>100 / hal</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SINGLE RESPONSIVE TABLE CARD */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                                    <th className="py-3.5 px-4">No. Tiket</th>
                                    <th className="py-3.5 px-4">Pegawai (Pemohon)</th>
                                    <th className="py-3.5 px-4 max-w-[220px]">Layanan</th>
                                    <th className="py-3.5 px-4 max-w-[180px]">Unit Kerja</th>
                                    <th className="py-3.5 px-4">Tanggal Masuk</th>
                                    <th className="py-3.5 px-4 text-center">Status Alur</th>
                                    <th className="py-3.5 px-4 text-center">Status Usulan</th>
                                    <th className="py-3.5 px-4 w-24 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                {paginatedTiket.length === 0 ? (
                                    /* State Kosong: Tidak Ada Tiket Ditemukan */
                                    <tr>
                                        <td colSpan={9} className="py-16 px-4 text-center">
                                            <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                                                <ClipboardList className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    Tidak Ada Permintaan Layanan
                                                </h4>
                                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                    {searchQuery || statusFilter !== 'ALL'
                                                        ? 'Tidak ditemukan usulan yang sesuai dengan filter pencarian saat ini.'
                                                        : `Belum ada usulan tiket untuk periode ${activeMonthLabel} ${selectedYear}.`}
                                                </p>
                                                {(searchQuery || statusFilter !== 'ALL') && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('ALL');
                                                        }}
                                                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                    >
                                                        Reset Filter
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTiket.map((item, idx) => {
                                        const rowNum = (currentPage - 1) * perPage + idx + 1;
                                        const statusObj = item.tahap_terakhir?.status_rel || item.tahapTerakhir?.statusRel;
                                        const isArchived = Number(item.archives) === 1;

                                        return (
                                            <tr
                                                key={item.id || item.no_tiket}
                                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs align-middle">
                                                    {rowNum}
                                                </td>

                                                {/* No Tiket */}
                                                <td className="py-3.5 px-4 align-middle font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{item.no_tiket}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(item.no_tiket)}
                                                            className="text-slate-400 hover:text-blue-600 p-1 rounded-md transition-colors"
                                                            title="Salin No Tiket"
                                                        >
                                                            {copiedNoTiket === item.no_tiket ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Pegawai (Pemohon) - Standard.md Seksi 6.1 */}
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                            {getInitials(item.nama)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p
                                                                className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]"
                                                                title={item.nama || '-'}
                                                            >
                                                                {item.nama || '-'}
                                                            </p>
                                                            <p className="text-[11px] font-mono text-slate-400">
                                                                NIP. {item.nip || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Layanan - Standard.md Seksi 6.2 Line Clamping Max 2 Lines */}
                                                <td className="py-3.5 px-4 align-middle text-xs max-w-[220px]">
                                                    <div
                                                        className="line-clamp-2 max-w-[220px] font-medium text-slate-800 dark:text-slate-200"
                                                        title={item.layanan?.nama_layanan || '-'}
                                                    >
                                                        {item.layanan?.nama_layanan || '-'}
                                                    </div>
                                                </td>

                                                {/* Unit Kerja */}
                                                <td className="py-3.5 px-4 align-middle text-xs text-slate-500 dark:text-slate-400 max-w-[180px]">
                                                    <span className="line-clamp-2 max-w-[180px]" title={item.nama_ukerja || '-'}>
                                                        {item.nama_ukerja || '-'}
                                                    </span>
                                                </td>

                                                {/* Tanggal Masuk */}
                                                <td className="py-3.5 px-4 align-middle text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {formatDate(item.tanggal)}
                                                </td>

                                                {/* Status Alur */}
                                                <td className="py-3.5 px-4 align-middle text-center">
                                                    <StatusBadge
                                                        status={
                                                            statusObj?.status ||
                                                            (isArchived ? 'Selesai' : 'Sedang Diproses')
                                                        }
                                                    />
                                                </td>

                                                {/* Status Usulan (Proses / Selesai) */}
                                                <td className="py-3.5 px-4 align-middle text-center">
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

                                                {/* Aksi Baku (Standard.md Seksi 6.3 - Warna Semantik Jelas) */}
                                                <td className="py-3.5 px-4 align-middle text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Riwayat Tahapan (Icon Eye Biru) */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setHistoryModal({
                                                                    open: true,
                                                                    item: item,
                                                                })
                                                            }
                                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                            title="Riwayat Tahapan Usulan"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {/* Cetak Bukti Tiket (Icon Printer: Orange/Amber - Standard.md Seksi 6.3) */}
                                                        <a
                                                            href={`/tiket/cetak/${encodeURIComponent(item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                                            title="Cetak Bukti Pengajuan"
                                                        >
                                                            <Printer className="w-4 h-4" />
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

                    {/* 5. PAGINASI BAKU (Standard.md Seksi 7) */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredTiket.length}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            onPerPageChange={setPerPage}
                        />
                    </div>
                </div>
            </div>

            {/* 6. MODAL RIWAYAT TAHAPAN USULAN */}
            <RiwayatTahapanModal
                isOpen={historyModal.open}
                onClose={() => setHistoryModal({ open: false, item: null })}
                tiket={historyModal.item}
            />
        </AuthenticatedLayout>
    );
}
