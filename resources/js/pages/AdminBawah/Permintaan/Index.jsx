import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import { getInitials } from '@/utils/initials';
import {
    Inbox,
    Search,
    FileText,
    Layers,
    Clock,
    AlertCircle,
    X,
    Check,
    Copy,
    Edit3,
    Eye,
    Filter,
    ChevronDown,
    RotateCcw,
    CheckCircle2
} from 'lucide-react';

export default function Index({
    auth,
    tiket = [],
    layananList = [],
    selectedLayanan = '',
}) {
    const { flash = {} } = usePage().props;

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [currentLayanan, setCurrentLayanan] = useState(selectedLayanan || '');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, MENUNGGU, BTL
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat State
    const [modalRiwayatOpen, setModalRiwayatOpen] = useState(false);
    const [selectedTiket, setSelectedTiket] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Sync state when props change
    useEffect(() => {
        setCurrentLayanan(selectedLayanan || '');
        setCurrentPage(1);
    }, [selectedLayanan]);

    // Handle filter layanan via server query
    const handleLayananChange = (newVal) => {
        setCurrentLayanan(newVal);
        setCurrentPage(1);
        router.get(
            '/adminBawah/permintaan',
            newVal ? { layanan: newVal } : {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        if (currentLayanan) {
            handleLayananChange('');
        }
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

    // Hitung counts untuk Metric Cards
    const counts = useMemo(() => {
        let total = tiket.length;
        let btl = 0;
        let menunggu = 0;

        tiket.forEach((t) => {
            const hasBtl = Array.isArray(t.detail) && t.detail.some((d) => d.status === 2);
            if (hasBtl) {
                btl++;
            } else {
                menunggu++;
            }
        });

        return {
            total,
            btl,
            menunggu,
            layananAktif: layananList.length,
        };
    }, [tiket, layananList]);

    // Filter data tabel
    const filteredTiket = useMemo(() => {
        return tiket.filter((t) => {
            // Search query (No Tiket, NIP, Nama, Unit Kerja, Layanan)
            const query = searchQuery.toLowerCase().trim();
            const matchQuery =
                !query ||
                (t.no_tiket && t.no_tiket.toLowerCase().includes(query)) ||
                (t.nip && t.nip.toLowerCase().includes(query)) ||
                (t.nama && t.nama.toLowerCase().includes(query)) ||
                (t.nama_ukerja && t.nama_ukerja.toLowerCase().includes(query)) ||
                (t.layanan?.nama_layanan && t.layanan.nama_layanan.toLowerCase().includes(query));

            if (!matchQuery) return false;

            // Status BTL check
            const hasBtl = Array.isArray(t.detail) && t.detail.some((d) => d.status === 2);

            if (statusFilter === 'BTL') {
                return hasBtl;
            } else if (statusFilter === 'MENUNGGU') {
                return !hasBtl;
            }

            return true;
        });
    }, [tiket, searchQuery, statusFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTiket.length / perPage) || 1;
    const paginatedTiket = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredTiket.slice(start, start + perPage);
    }, [filteredTiket, currentPage, perPage]);

    // Format tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="PILKB - Registrasi SKPD" />

            {/* Container Full Width Sesuai Standard.md Bagian 3 Poin 2 */}
            <div className="space-y-6">
                {/* FLASH MESSAGE ALERT */}
                {flash.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-xs shadow-xs animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-medium">{flash.success}</span>
                        </div>
                    </div>
                )}
                {flash.error && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between text-xs shadow-xs animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span className="font-medium">{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Inbox className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Registrasi SKPD
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftar usulan berkas masuk dari OPD yang menunggu validasi tahap pertama oleh Front Office BKPSDM.
                        </p>
                    </div>

                    {/* Tombol Header Standard.md Bagian 4 Poin 1 (py-2.5 text-xs font-semibold) */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
                        <a
                            href={`/adminBawah/permintaan/export-pdf${currentLayanan ? `?layanan=${encodeURIComponent(currentLayanan)}` : ''}`}
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
                    {/* Total Permintaan */}
                    <div
                        onClick={() => setStatusFilter('ALL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Permintaan
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

                    {/* Menunggu Verifikasi */}
                    <div
                        onClick={() => setStatusFilter('MENUNGGU')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'MENUNGGU'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Menunggu Verifikasi
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                {counts.menunggu}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                Verifikasi
                            </span>
                        </div>
                    </div>

                    {/* Perlu Perbaikan (BTL) */}
                    <div
                        onClick={() => setStatusFilter('BTL')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'BTL'
                                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Perlu Perbaikan (BTL)
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                {counts.btl}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                Revisi
                            </span>
                        </div>
                    </div>

                    {/* Layanan Aktif */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Layanan
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {counts.layananAktif}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Aktif
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Bagian 4 Poin 3 Standard.md) */}
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

                        {/* Filter Dropdown Layanan */}
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={currentLayanan}
                                    onChange={(e) => handleLayananChange(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer truncate"
                                >
                                    <option value="">Semua Layanan</option>
                                    {layananList.map((lay) => (
                                        <option key={lay.id} value={lay.id}>
                                            {lay.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filter Dropdown Status */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    <option value="ALL">Semua Status</option>
                                    <option value="MENUNGGU">Menunggu Verifikasi</option>
                                    <option value="BTL">Perlu Perbaikan (BTL)</option>
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
                                    <th className="px-4 py-3.5 min-w-[220px]">Layanan</th>
                                    <th className="px-4 py-3.5 w-32">Tanggal Masuk</th>
                                    <th className="px-4 py-3.5 w-40 text-center">Status Verifikasi</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Perbaikan</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                {paginatedTiket.length === 0 ? (
                                    /* Standar Empty State (Bagian 8 Standard.md) */
                                    <tr>
                                        <td colSpan={8} className="py-16 px-4 text-center">
                                            <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Tidak Ada Permintaan Layanan
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || currentLayanan || statusFilter !== 'ALL'
                                                    ? 'Tidak ditemukan usulan tiket yang cocok dengan kriteria pencarian dan filter Anda.'
                                                    : 'Belum ada usulan berkas masuk tahap 1 dari ASN / SKPD saat ini.'}
                                            </p>
                                            {(searchQuery || currentLayanan || statusFilter !== 'ALL') && (
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
                                        const hasBtl = Array.isArray(item.detail) && item.detail.some((d) => d.status === 2);
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

                                                {/* Kolom Layanan (Bagian 6 Poin 2 Standard.md) */}
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px] block"
                                                        title={item.layanan?.nama_layanan || '-'}
                                                    >
                                                        {item.layanan?.nama_layanan || '-'}
                                                    </span>
                                                </td>

                                                {/* Tanggal Masuk */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                    {formatDate(item.tanggal)}
                                                </td>

                                                {/* Status Verifikasi */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    {hasBtl ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>BTL (Perbaikan)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                                            <Clock className="w-3 h-3" />
                                                            <span>Menunggu Verifikasi</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status Diperbaiki */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    {hasBtl ? (
                                                        item.diperbaiki === 1 ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                                Sudah
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                                                Belum
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-slate-400 font-mono">-</span>
                                                    )}
                                                </td>

                                                {/* Kolom Aksi Sesuai Standard.md Bagian 6 Poin 3:
                                                    Edit/Validasi = Amber/Orange
                                                    View/Riwayat = Biru */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <div className="inline-flex items-center justify-center gap-1.5">
                                                        {/* Tombol Validasi / Review Usulan (Amber/Orange) */}
                                                        <Link
                                                            href={`/adminBawah/permintaan/${encodeURIComponent(item.no_tiket)}/review`}
                                                            className="p-1.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors shadow-2xs"
                                                            title="Validasi / Review Usulan"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>

                                                        {/* Tombol Riwayat Tahapan (Biru) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenHistory(item)}
                                                            className="p-1.5 rounded-lg border border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors shadow-2xs cursor-pointer"
                                                            title="Lihat Riwayat Tahapan"
                                                        >
                                                            <Eye className="w-4 h-4" />
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
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredTiket.length}
                        perPage={perPage}
                    />
                </div>

                {/* MODAL RIWAYAT TAHAPAN */}
                <RiwayatTahapanModal
                    isOpen={modalRiwayatOpen}
                    onClose={() => {
                        setModalRiwayatOpen(false);
                        setSelectedTiket(null);
                    }}
                    tiket={selectedTiket}
                />
            </div>
        </AuthenticatedLayout>
    );
}
