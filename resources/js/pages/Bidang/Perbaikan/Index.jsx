import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import { getInitials } from '@/utils/initials';
import {
    Wrench,
    Download,
    FileSpreadsheet,
    FileText,
    Search,
    ChevronDown,
    Eye,
    Copy,
    Check,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    RotateCcw,
    Layers,
    FileQuestion,
    Building2,
    FolderKanban
} from 'lucide-react';

export default function Index({
    data = [],
    layananList = [],
    namaBidang = 'Bidang',
}) {
    const { auth, flash = {} } = usePage().props;

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLayanan, setSelectedLayanan] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, BELUM, SUDAH
    const [copiedTiket, setCopiedTiket] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Detail BTL Modal state
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [activeDetailTiket, setActiveDetailTiket] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailBtlList, setDetailBtlList] = useState([]);

    // Riwayat Tahapan Modal state
    const [modalRiwayatOpen, setModalRiwayatOpen] = useState(false);
    const [selectedTiket, setSelectedTiket] = useState(null);

    // Copy No Tiket helper
    const handleCopyTiket = (noTiket) => {
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => {
            setCopiedTiket(null);
        }, 2000);
    };

    // Calculate Summary Stats
    const stats = useMemo(() => {
        let total = data.length;
        let belum = 0;
        let sudah = 0;
        let totalBtlFiles = 0;

        data.forEach((item) => {
            if (item.diperbaiki === 0) {
                belum++;
            } else {
                sudah++;
            }
            totalBtlFiles += Number(item.jumlah_btl || 0);
        });

        return { total, belum, sudah, totalBtlFiles };
    }, [data]);

    // Client-side Filtered List
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // Status Filter (Belum Diperbaiki vs Sudah Diperbaiki)
            if (statusFilter === 'BELUM' && item.diperbaiki !== 0) {
                return false;
            }
            if (statusFilter === 'SUDAH' && item.diperbaiki !== 1) {
                return false;
            }

            // Layanan Filter
            if (selectedLayanan && String(item.kode_layanan) !== String(selectedLayanan)) {
                return false;
            }

            // Search query filter (no_tiket, nip, nama, nama_ukerja, layanan)
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const namaPegawai = item.nama || '';

            const matchTiket = (item.no_tiket || '').toLowerCase().includes(q);
            const matchNip = (item.nip || '').toLowerCase().includes(q);
            const matchNama = namaPegawai.toLowerCase().includes(q);
            const matchLayanan = (item.layanan?.nama_layanan || '').toLowerCase().includes(q);
            const matchUkerja = (item.nama_ukerja || '').toLowerCase().includes(q);

            return matchTiket || matchNip || matchNama || matchLayanan || matchUkerja;
        });
    }, [data, searchQuery, selectedLayanan, statusFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, currentPage, perPage]);

    // Open Detail BTL Modal
    const handleOpenDetail = (item) => {
        setActiveDetailTiket({
            ...item,
            resolvedNama: item.nama || '-',
        });
        setDetailModalOpen(true);
        setLoadingDetail(true);
        setDetailBtlList([]);

        fetch(`/adminBidang/perbaikan/detail/${encodeURIComponent(item.no_tiket)}`)
            .then((res) => res.json())
            .then((resData) => {
                setDetailBtlList(Array.isArray(resData) ? resData : []);
                setLoadingDetail(false);
            })
            .catch((err) => {
                console.error('Gagal mengambil detail BTL:', err);
                setDetailBtlList([]);
                setLoadingDetail(false);
            });
    };

    // Open Riwayat Modal
    const handleOpenRiwayat = (item) => {
        setSelectedTiket({
            ...item,
            nama: item.nama || '-',
            nama_layanan: item.layanan?.nama_layanan || '-',
            nama_ukerja: item.nama_ukerja || '-',
        });
        setModalRiwayatOpen(true);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedLayanan('');
        setStatusFilter('ALL');
        setCurrentPage(1);
    };

    // Build Export URLs with current filter
    const exportExcelUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (selectedLayanan) params.set('layanan', selectedLayanan);
        return `/adminBidang/perbaikan/export-excel?${params.toString()}`;
    }, [selectedLayanan]);

    const exportPdfUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (selectedLayanan) params.set('layanan', selectedLayanan);
        return `/adminBidang/perbaikan/export-pdf?${params.toString()}`;
    }, [selectedLayanan]);

    const isFilterActive = searchQuery || selectedLayanan || statusFilter !== 'ALL';

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Daftar Perbaikan Usulan - ${namaBidang} - PILKB`} />

            <div className="space-y-6">
                {/* 1. PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Wrench className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                List Perbaikan Usulan - {namaBidang}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftar berkas usulan tidak lengkap (BTL) yang sedang atau telah diperbaiki oleh unit kerja pemohon.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
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
                                            href={exportExcelUrl}
                                            onClick={() => setExportOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            <span>Export Excel</span>
                                        </a>
                                        <a
                                            href={exportPdfUrl}
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


                {/* 2. STATS METRIC CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Total Usulan BTL */}
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
                            Total Usulan BTL
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.total}
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                Total
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Belum Diperbaiki */}
                    <div
                        onClick={() => {
                            setStatusFilter('BELUM');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'BELUM'
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Belum Diperbaiki
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {stats.belum}
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                Belum
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Sudah Diperbaiki */}
                    <div
                        onClick={() => {
                            setStatusFilter('SUDAH');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'SUDAH'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Sudah Diperbaiki
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {stats.sudah}
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                Sudah
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Total Syarat BTL */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Total Berkas BTL
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {stats.totalBtlFiles}
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                Berkas
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. UNIFIED FILTER TOOLBAR CARD */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search */}
                        <div className="lg:col-span-6 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari no tiket, NIP, nama pemohon, atau OPD..."
                                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Layanan Filter */}
                        <div className="lg:col-span-4 relative">
                            <select
                                value={selectedLayanan}
                                onChange={(e) => {
                                    setSelectedLayanan(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none pr-8 cursor-pointer"
                            >
                                <option value="">Semua Layanan</option>
                                {layananList.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.nama_layanan}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Items per Page */}
                        <div className="lg:col-span-2 relative">
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none pr-8 cursor-pointer"
                            >
                                <option value={10}>10 per hal</option>
                                <option value={25}>25 per hal</option>
                                <option value={50}>50 per hal</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Filter Active Indicator & Quick Reset */}
                    {isFilterActive && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">
                                Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredData.length}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{data.length}</strong> total data perbaikan
                            </span>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* 4. SINGLE DATA TABLE CARD */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                                    <th className="py-3.5 px-4 text-center w-12">No</th>
                                    <th className="py-3.5 px-4 text-center">Status Perbaikan</th>
                                    <th className="py-3.5 px-4">No Tiket</th>
                                    <th className="py-3.5 px-4">Pegawai</th>
                                    <th className="py-3.5 px-4">Layanan</th>
                                    <th className="py-3.5 px-4">Unit Kerja</th>
                                    <th className="py-3.5 px-4 text-center">Syarat BTL</th>
                                    <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-0">
                                            {/* Empty state card strictly following Section 8 of Standard.md */}
                                            <div className="py-16 px-4 text-center">
                                                <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    Tidak ada data perbaikan usulan
                                                </h4>
                                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                    {isFilterActive
                                                        ? 'Tidak ditemukan usulan perbaikan yang sesuai dengan filter atau kata kunci pencarian Anda.'
                                                        : 'Saat ini belum ada pengajuan usulan berkas tidak lengkap (BTL) yang membutuhkan perbaikan.'}
                                                </p>
                                                {isFilterActive && (
                                                    <button
                                                        type="button"
                                                        onClick={handleResetFilters}
                                                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Reset Filter</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item, index) => {
                                        const rowNumber = (currentPage - 1) * perPage + index + 1;
                                        const namaPegawai = item.nama || '-';

                                        return (
                                            <tr
                                                key={item.id || item.no_tiket || index}
                                                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs">
                                                    {rowNumber}
                                                </td>

                                                {/* Status Perbaikan */}
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                    {item.diperbaiki === 0 ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                                            Belum Diperbaiki
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                            Sudah Diperbaiki
                                                        </span>
                                                    )}
                                                </td>

                                                {/* No Tiket */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                                                            {item.no_tiket}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyTiket(item.no_tiket)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                                            title="Salin No Tiket"
                                                        >
                                                            {copiedTiket === item.no_tiket ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Pegawai (Section 6 Standard.md) */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2.5 max-w-[200px]">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                            {getInitials(namaPegawai, 'P')}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={namaPegawai}>
                                                                {namaPegawai}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-slate-400">
                                                                {item.nip || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Layanan */}
                                                <td className="py-3.5 px-4">
                                                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px]" title={item.layanan?.nama_layanan || '-'}>
                                                        {item.layanan?.nama_layanan || '-'}
                                                    </div>
                                                </td>

                                                {/* Unit Kerja */}
                                                <td className="py-3.5 px-4">
                                                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-2 max-w-[200px]" title={item.nama_ukerja || '-'}>
                                                        {item.nama_ukerja || '-'}
                                                    </div>
                                                </td>

                                                {/* Syarat BTL Badge */}
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                                        <AlertCircle className="w-3 h-3 text-rose-500" />
                                                        {item.jumlah_btl || 0} Berkas
                                                    </span>
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center justify-center gap-1">
                                                        {/* Button Detail BTL */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDetail(item)}
                                                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                                                            title="Lihat Detail Berkas BTL"
                                                        >
                                                            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </button>

                                                        {/* Button Riwayat Tahapan */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRiwayat(item)}
                                                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                                                            title="Lihat Riwayat Perjalanan Usulan"
                                                        >
                                                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredData.length)} dari {filteredData.length} data
                            </span>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(p) => setCurrentPage(p)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DETAIL BTL */}
            {detailModalOpen && activeDetailTiket && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/40">
                                    <AlertCircle className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Detail Berkas BTL
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        No Tiket:{' '}
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                            #{activeDetailTiket.no_tiket}
                                        </span>{' '}
                                        • {activeDetailTiket.resolvedNama}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            {loadingDetail ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <span>Memuat data berkas BTL...</span>
                                </div>
                            ) : detailBtlList.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    <FileQuestion className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <span>Tidak ada catatan berkas BTL pada usulan ini.</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                                                <th className="py-2.5 px-3 text-center w-10">No</th>
                                                <th className="py-2.5 px-3">Persyaratan</th>
                                                <th className="py-2.5 px-3">Catatan / Keterangan Verifikator</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {detailBtlList.map((dtl, idx) => (
                                                <tr key={dtl.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                                                        {dtl.syarat?.syarat || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="p-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                                                            {dtl.comment || 'Perlu perbaikan/kelengkapan berkas.'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDetailModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs"
                            >
                                Tutup
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
