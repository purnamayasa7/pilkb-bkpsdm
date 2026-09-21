import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import {
    Ticket,
    Search,
    Filter,
    Calendar,
    Layers,
    ChevronDown,
    Copy,
    Check,
    RotateCcw,
    Printer,
    History,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Clock,
} from 'lucide-react';

export default function Index({
    tiket = [],
    year = new Date().getFullYear(),
    availableYears = [],
    diambil = '',
    layananList = [],
    selectedLayanan = '',
}) {
    const { auth, flash = {} } = usePage().props;

    // State Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState(year);
    const [diambilFilter, setDiambilFilter] = useState(diambil || 'ALL');
    const [currentLayanan, setCurrentLayanan] = useState(selectedLayanan || 'ALL');
    const [activeMetricTab, setActiveMetricTab] = useState('ALL');

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

    // Navigasi Ganti Tahun
    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
        setCurrentPage(1);
        router.get(
            '/adminBawah/tiket',
            {
                year: newYear,
                diambil: diambilFilter !== 'ALL' ? diambilFilter : undefined,
                layanan: currentLayanan !== 'ALL' ? currentLayanan : undefined,
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
        setDiambilFilter('ALL');
        setCurrentLayanan('ALL');
        setActiveMetricTab('ALL');
        setCurrentPage(1);
        if (selectedYear !== new Date().getFullYear()) {
            handleYearChange(new Date().getFullYear());
        }
    };

    // Hitung Metrik Statistik (Standard.md Bagian 5)
    const counts = useMemo(() => {
        let total = tiket.length;
        let belumDiambil = 0;
        let sudahDiambil = 0;
        let arsipSelesai = 0;

        tiket.forEach((t) => {
            if (t.diambil == 1) {
                sudahDiambil++;
            } else {
                belumDiambil++;
            }

            // Sesuai Standard.md Bagian 5 Poin 4: Acuan Utama Selesai adalah archives == 1
            if (t.archives == 1) {
                arsipSelesai++;
            }
        });

        return {
            total,
            belumDiambil,
            sudahDiambil,
            arsipSelesai,
        };
    }, [tiket]);

    // Filter Data Berdasarkan Semua Kriteria
    const filteredTiket = useMemo(() => {
        return tiket.filter((t) => {
            // 1. Search Query (No Tiket, NIP, Nama, Unit Kerja, Layanan)
            const query = searchQuery.toLowerCase().trim();
            if (query) {
                const matchQuery =
                    (t.no_tiket && t.no_tiket.toLowerCase().includes(query)) ||
                    (t.nip && t.nip.toLowerCase().includes(query)) ||
                    (t.nama && t.nama.toLowerCase().includes(query)) ||
                    (t.nama_ukerja && t.nama_ukerja.toLowerCase().includes(query)) ||
                    (t.layanan?.nama_layanan && t.layanan.nama_layanan.toLowerCase().includes(query));
                if (!matchQuery) return false;
            }

            // 2. Filter Status Pengambilan Berkas
            if (diambilFilter === '0' && t.diambil == 1) return false;
            if (diambilFilter === '1' && t.diambil != 1) return false;

            // 3. Filter Layanan
            if (currentLayanan !== 'ALL' && t.kode_layanan != currentLayanan) return false;

            // 4. Quick Filter Metric Tab
            if (activeMetricTab === 'BELUM' && t.diambil == 1) return false;
            if (activeMetricTab === 'SUDAH' && t.diambil != 1) return false;
            if (activeMetricTab === 'ARSIP' && t.archives != 1) return false;

            return true;
        });
    }, [tiket, searchQuery, diambilFilter, currentLayanan, activeMetricTab]);

    // Data Terpaginasi
    const totalPages = Math.ceil(filteredTiket.length / perPage) || 1;
    const paginatedTiket = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredTiket.slice(start, start + perPage);
    }, [filteredTiket, currentPage, perPage]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Daftar Tiket Usulan - PILKB" />

            {/* Container Baku Standard.md (space-y-6 lebar penuh tanpa batasan max-w) */}
            <div className="space-y-6">

                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Ticket className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Daftar Tiket Usulan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Monitoring dan penelusuran seluruh berkas tiket usulan layanan kepegawaian.
                        </p>
                    </div>

                    {/* Tombol Header Standard.md Bagian 4 Poin 1 (py-2.5 text-xs font-semibold) */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
                        <Link
                            href="/adminBawah/tiket/cetak-form"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <Printer className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                            <span>Cetak Ulang Tiket</span>
                        </Link>
                    </div>
                </div>

                {/* 2. STATS METRIC CHIPS CARDS (Bagian 4 Poin 2 & Bagian 5 Standard.md) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Total Tiket */}
                    <div
                        onClick={() => {
                            setActiveMetricTab('ALL');
                            setDiambilFilter('ALL');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            activeMetricTab === 'ALL' && diambilFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Tiket ({selectedYear})
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {counts.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                Semua
                            </span>
                        </div>
                    </div>

                    {/* Belum Diambil */}
                    <div
                        onClick={() => {
                            setActiveMetricTab('BELUM');
                            setDiambilFilter('0');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            activeMetricTab === 'BELUM' || diambilFilter === '0'
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Belum Diambil
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {counts.belumDiambil}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                Belum
                            </span>
                        </div>
                    </div>

                    {/* Sudah Diambil */}
                    <div
                        onClick={() => {
                            setActiveMetricTab('SUDAH');
                            setDiambilFilter('1');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            activeMetricTab === 'SUDAH' || diambilFilter === '1'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Sudah Diambil
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {counts.sudahDiambil}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                Diambil
                            </span>
                        </div>
                    </div>

                    {/* Selesai Diarsipkan */}
                    <div
                        onClick={() => {
                            setActiveMetricTab('ARSIP');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            activeMetricTab === 'ARSIP'
                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Selesai Diarsipkan
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {counts.arsipSelesai}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                Arsip
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        {/* Search Input */}
                        <div className="lg:col-span-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari No Tiket, NIP, Nama, Unit Kerja..."
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

                        {/* Filter Tahun */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(Number(e.target.value))}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    {availableYears.map((y) => (
                                        <option key={y} value={y}>
                                            Tahun {y}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filter Status Diambil */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={diambilFilter}
                                    onChange={(e) => {
                                        setDiambilFilter(e.target.value);
                                        setActiveMetricTab('ALL');
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    <option value="ALL">Semua Pengambilan</option>
                                    <option value="0">Belum Diambil</option>
                                    <option value="1">Sudah Diambil</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filter Layanan */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={currentLayanan}
                                    onChange={(e) => {
                                        setCurrentLayanan(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer truncate"
                                >
                                    <option value="ALL">Semua Layanan</option>
                                    {layananList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                                    <th className="px-4 py-3.5 min-w-[200px]">Layanan</th>
                                    <th className="px-4 py-3.5 w-36">Tanggal Pengajuan</th>
                                    <th className="px-4 py-3.5 w-36 text-center">Status Usulan</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Pengambilan</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                {paginatedTiket.length === 0 ? (
                                    /* Standar Empty State (Bagian 8 Standard.md) */
                                    <tr>
                                        <td colSpan={8} className="py-16 px-4 text-center">
                                            <Ticket className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Tidak Ada Data Tiket
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || diambilFilter !== 'ALL' || currentLayanan !== 'ALL' || activeMetricTab !== 'ALL'
                                                    ? 'Tidak ditemukan usulan tiket yang cocok dengan kriteria pencarian dan filter Anda.'
                                                    : `Belum ada data pengajuan tiket usulan pada tahun ${selectedYear}.`}
                                            </p>
                                            {(searchQuery || diambilFilter !== 'ALL' || currentLayanan !== 'ALL' || activeMetricTab !== 'ALL') && (
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
                                    paginatedTiket.map((item, idx) => {
                                        const globalIndex = (currentPage - 1) * perPage + idx + 1;
                                        const initials = getInitials(item.nama || item.nip || 'ASN');
                                        const statusUsulan =
                                            item.tahap_terakhir?.status_rel?.nama_status ||
                                            (item.archives == 1 ? 'Usulan Selesai' : 'Sedang Diproses');

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

                                                {/* Kolom Layanan (Bagian 6 Poin 2 Standard.md) */}
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px] block"
                                                        title={item.layanan?.nama_layanan || '-'}
                                                    >
                                                        {item.layanan?.nama_layanan || '-'}
                                                    </span>
                                                </td>

                                                {/* Tanggal Pengajuan */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                    {formatDate(item.tanggal)}
                                                </td>

                                                {/* Status Usulan (Tahapan) */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <StatusBadge status={statusUsulan} size="sm" />
                                                </td>

                                                {/* Status Pengambilan Berkas */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    {item.diambil == 1 ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Sudah</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Belum</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Kolom Aksi (Bagian 6 Poin 3 Standard.md) */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* 1. Riwayat Tahapan (Icon History / Eye: Biru) */}
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
                        totalItems={filteredTiket.length}
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
