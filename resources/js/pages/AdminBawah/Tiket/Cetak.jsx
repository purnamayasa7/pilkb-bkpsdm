import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import {
    Printer,
    Search,
    Copy,
    Check,
    AlertCircle,
    RotateCcw,
    ChevronDown,
    Ticket,
    History,
    ExternalLink,
    CheckCircle2,
    Clock,
} from 'lucide-react';

export default function Cetak({ data = [], keyword = '' }) {
    const { auth } = usePage().props;

    const [searchInput, setSearchInput] = useState(keyword || '');
    const [isSearching, setIsSearching] = useState(false);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Paginasi State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Modal Riwayat State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Sync input jika keyword berubah
    useEffect(() => {
        setSearchInput(keyword || '');
        setCurrentPage(1);
    }, [keyword]);

    // Handle Copy Nomor Tiket
    const handleCopyTiket = (noTiket) => {
        if (!noTiket) return;
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => setCopiedTiket(null), 2000);
    };

    // Handle Submit Search
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchInput.trim();
        setIsSearching(true);
        router.get(
            '/adminBawah/tiket/cetak-form',
            { keyword: trimmed },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    // Handle Reset Search
    const handleReset = () => {
        setSearchInput('');
        setIsSearching(true);
        router.get(
            '/adminBawah/tiket/cetak-form',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    // Format Tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(d);
        } catch {
            return dateString;
        }
    };

    // Inisial Avatar Bulat Slate
    const getInitials = (name) => {
        if (!name) return 'BK';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    // Paginasi Data
    const totalPages = Math.ceil(data.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return data.slice(start, start + perPage);
    }, [data, currentPage, perPage]);

    const hasSearched = Boolean(keyword && keyword.trim().length > 0);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Cetak Ulang Tiket - Admin Bawah" />

            {/* Container Baku Standard.md (space-y-6 lebar penuh tanpa batasan max-w) */}
            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Printer className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Cetak Ulang Tiket
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Pencarian dan cetak ulang tanda bukti pengajuan usulan tiket layanan kepegawaian.
                        </p>
                    </div>

                    {/* Tombol Header Standard.md Bagian 4 Poin 1 (py-2.5 text-xs font-semibold) */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        <Link
                            href="/adminBawah/tiket"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Daftar Tiket</span>
                        </Link>
                    </div>
                </div>

                {/* 2. CARD PENCARIAN (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <form onSubmit={handleSearch} className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Cari Berdasarkan No. Tiket, NIP, atau Nama Pegawai
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Masukkan No Tiket (contoh: TKT-...), NIP, atau Nama Pegawai..."
                                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    autoFocus
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all w-full sm:w-auto cursor-pointer"
                                >
                                    {isSearching ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                    <span>Cari Tiket</span>
                                </button>

                                {hasSearched && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400">
                            Pencarian mencakup seluruh data usulan tiket yang terdaftar pada sistem PILKB.
                        </p>
                    </form>
                </div>

                {/* 3. HASIL PENCARIAN */}
                {!hasSearched ? (
                    /* PROMPT AWAL (BELUM MENCARI) - Bagian 8 Standard.md */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <Printer className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Pencarian Tiket Pengajuan
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Silakan masukkan <span className="font-semibold text-slate-700 dark:text-slate-300">Nomor Tiket</span>, <span className="font-semibold text-slate-700 dark:text-slate-300">NIP</span>, atau <span className="font-semibold text-slate-700 dark:text-slate-300">Nama Pegawai</span> pada kolom pencarian di atas untuk menemukan tiket yang akan dicetak.
                        </p>
                    </div>
                ) : data.length === 0 ? (
                    /* DATA TIDAK DITEMUKAN - Bagian 8 Standard.md */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Data Tidak Ditemukan
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Tidak ada tiket yang cocok dengan kata kunci <span className="font-semibold text-slate-800 dark:text-slate-200">"{keyword}"</span>. Pastikan Nomor Tiket atau NIP sudah sesuai.
                        </p>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Pencarian</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* TABEL DATA HASIL PENCARIAN - Bagian 4 Poin 4 Standard.md */
                    <div className="space-y-4">
                        {/* Info Bar Hasil */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Hasil pencarian untuk <span className="font-bold text-slate-800 dark:text-slate-200">"{keyword}"</span>:
                                </span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-900/40">
                                    {data.length} Tiket Ditemukan
                                </span>
                            </div>

                            {data.length > 10 && (
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <span className="text-xs text-slate-400">Tampilkan:</span>
                                    <div className="relative">
                                        <select
                                            value={perPage}
                                            onChange={(e) => {
                                                setPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="px-3 py-1.5 pr-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                        >
                                            <option value={10}>10 data</option>
                                            <option value={25}>25 data</option>
                                            <option value={50}>50 data</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Card Tabel Data Tunggal */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="px-4 py-3.5 w-12 text-center">No</th>
                                            <th className="px-4 py-3.5 w-36">No. Tiket</th>
                                            <th className="px-4 py-3.5 min-w-[200px]">Pemohon</th>
                                            <th className="px-4 py-3.5 min-w-[200px]">Layanan</th>
                                            <th className="px-4 py-3.5 w-36">Tanggal Masuk</th>
                                            <th className="px-4 py-3.5 w-36 text-center">Status Usulan</th>
                                            <th className="px-4 py-3.5 w-28 text-center">Pengambilan</th>
                                            <th className="px-4 py-3.5 w-28 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedData.map((item, idx) => {
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

                                                    {/* Tanggal Masuk */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                        {formatDate(item.tanggal)}
                                                    </td>

                                                    {/* Status Usulan */}
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
                                                            {/* 1. Cetak Tiket (Icon Printer: Orange/Amber) */}
                                                            <a
                                                                href={`/tiket/cetak/${encodeURIComponent(item.no_tiket)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                                                title="Cetak Tiket"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </a>

                                                            {/* 2. Riwayat Tahapan (Icon History: Biru) */}
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
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Komponen Paginasi Bersama (Bagian 7 Standard.md) */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(p) => setCurrentPage(p)}
                                totalItems={data.length}
                                perPage={perPage}
                            />
                        </div>
                    </div>
                )}
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
