import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import {
    Shuffle,
    Search,
    X,
    Copy,
    Check,
    History,
    ExternalLink,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

export default function Index({ data = [], keyword = '' }) {
    // Search State
    const [searchQuery, setSearchQuery] = useState(keyword);
    const [activeSearch, setActiveSearch] = useState(keyword);
    const [isSearching, setIsSearching] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Helper: Inisial Nama untuk Avatar Bulat Slate
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
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return dateString;
        }
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

    // Handle Form Submit Pencarian
    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        const trimmed = searchQuery.trim();
        setActiveSearch(trimmed);
        setCurrentPage(1);
        setIsSearching(true);

        router.get(
            '/adminBawah/pindah',
            { keyword: trimmed },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    // Handle Reset Pencarian
    const handleResetSearch = () => {
        setSearchQuery('');
        setActiveSearch('');
        setCurrentPage(1);

        router.get(
            '/adminBawah/pindah',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Paginasi Data
    const totalPages = Math.ceil(data.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return data.slice(start, start + perPage);
    }, [data, currentPage, perPage]);

    return (
        <AuthenticatedLayout>
            <Head title="Pindah Data Tiket - Admin BKPSDM" />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 mt-0.5">
                            <Shuffle className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Pindah Data Tiket
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Pemindahan layanan tiket usulan ke bidang atau layanan lain.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. CARD FORM PENCARIAN TIKET (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Masukkan No Tiket atau NIP pemohon..."
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleResetSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Bersihkan pencarian"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                                <Search className="w-4 h-4" />
                                <span>{isSearching ? 'Mencari...' : 'Cari Tiket'}</span>
                            </button>

                            {activeSearch && (
                                <button
                                    type="button"
                                    onClick={handleResetSearch}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                                >
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* 3. HASIL PENCARIAN / TABEL DATA */}
                {!activeSearch ? (
                    /* Initial State Card (Bagian 8 Standard.md) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden py-16 px-4 text-center">
                        <Shuffle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Pencarian Tiket
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Silakan masukkan Nomor Tiket atau NIP pada form di atas untuk mencari tiket yang akan dipindahkan layanannya.
                        </p>
                    </div>
                ) : data.length === 0 ? (
                    /* Empty State Card (Bagian 8 Standard.md) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden py-16 px-4 text-center">
                        <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Data Tidak Ditemukan
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Tidak ditemukan tiket dengan kata kunci <span className="font-semibold text-slate-600 dark:text-slate-300">"{activeSearch}"</span>. Pastikan nomor tiket atau NIP sudah benar.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetSearch}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                ) : (
                    /* Card Tabel Tunggal Responsif (Bagian 4 Poin 4 Standard.md) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                        {/* Header Tabel Hasil */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/50">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    Hasil Pencarian:
                                </span>
                                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/40">
                                    {data.length} Tiket Ditemukan
                                </span>
                            </div>

                            {/* Pilihan Per Halaman */}
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>Tampilkan:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value={10}>10 per hal</option>
                                    <option value={25}>25 per hal</option>
                                    <option value={50}>50 per hal</option>
                                </select>
                            </div>
                        </div>

                        {/* TABEL RESPONSIP */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="px-4 py-3.5 w-12 text-center">No</th>
                                        <th className="px-4 py-3.5 min-w-[160px]">No Tiket</th>
                                        <th className="px-4 py-3.5 min-w-[220px]">Pemohon</th>
                                        <th className="px-4 py-3.5 min-w-[200px]">Layanan Saat Ini</th>
                                        <th className="px-4 py-3.5 whitespace-nowrap">Tanggal Masuk</th>
                                        <th className="px-4 py-3.5 whitespace-nowrap text-center">Status Terakhir</th>
                                        <th className="px-4 py-3.5 w-32 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                    {paginatedData.map((item, idx) => {
                                        const globalIndex = (currentPage - 1) * perPage + idx + 1;
                                        const statusName = item.tahap_terakhir?.status_rel?.status || item.status || 'Diajukan';

                                        return (
                                            <tr
                                                key={item.no_tiket}
                                                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-[11px]">
                                                    {globalIndex}
                                                </td>

                                                {/* Nomor Tiket */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                                                            {item.no_tiket}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyTiket(item.no_tiket)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                            title="Salin No Tiket"
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
                                                            {getInitials(item.nama, 'P')}
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
                                                        title={item.layanan?.nama_layanan || item.nama_layanan || '-'}
                                                    >
                                                        {item.layanan?.nama_layanan || item.nama_layanan || '-'}
                                                    </span>
                                                </td>

                                                {/* Tanggal Masuk */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                    {formatDate(item.tanggal)}
                                                </td>

                                                {/* Status Terakhir */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <StatusBadge status={statusName} />
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center justify-center gap-1.5">
                                                        {/* Pindah Layanan Button: Biru Solid / Soft */}
                                                        <Link
                                                            href={`/adminBawah/pindah/${encodeURIComponent(item.no_tiket)}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs cursor-pointer"
                                                            title="Pindahkan Layanan Tiket Ini"
                                                        >
                                                            <Shuffle className="w-3.5 h-3.5" />
                                                            <span>Pindah</span>
                                                        </Link>

                                                        {/* Riwayat Tahapan */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenRiwayat(item)}
                                                            className="p-1.5 rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                            title="Riwayat Tahapan"
                                                        >
                                                            <History className="w-4 h-4" />
                                                        </button>

                                                        {/* Tracking Publik */}
                                                        <a
                                                            href={`/cek-tiket/${encodeURIComponent(item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center cursor-pointer"
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

                        {/* PAGINASI */}
                        {data.length > perPage && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                    totalItems={data.length}
                                    perPage={perPage}
                                />
                            </div>
                        )}
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
