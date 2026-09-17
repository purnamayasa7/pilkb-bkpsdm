import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import { getInitials } from '@/utils/initials';
import {
    Printer,
    Search,
    Copy,
    Check,
    AlertCircle,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    FileText,
    ClipboardList,
    ExternalLink,
    User,
    ArrowRight
} from 'lucide-react';

export default function Cetak({ data = [], keyword = '' }) {
    const { auth } = usePage().props;

    const [searchInput, setSearchInput] = useState(keyword || '');
    const [isSearching, setIsSearching] = useState(false);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Sync input if keyword prop changes
    useEffect(() => {
        setSearchInput(keyword || '');
        setCurrentPage(1);
    }, [keyword]);

    // Handle Copy No Tiket
    const handleCopyTiket = (noTiket) => {
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => {
            setCopiedTiket(null);
        }, 2000);
    };

    // Handle submit search
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchInput.trim();
        setIsSearching(true);
        router.get(
            '/adminOpd/tiket/cetak-form',
            { keyword: trimmed },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    // Handle reset
    const handleReset = () => {
        setSearchInput('');
        setIsSearching(true);
        router.get(
            '/adminOpd/tiket/cetak-form',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    // Format Date helper
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

    // Pagination calculations
    const totalPages = Math.ceil(data.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return data.slice(start, start + perPage);
    }, [data, currentPage, perPage]);

    const hasSearched = Boolean(keyword && keyword.trim().length > 0);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Cetak Ulang Tiket - PILKB" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
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
                            Pencarian dan cetak ulang tanda bukti pengajuan usulan tiket instansi Anda.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        <Link
                            href="/adminOpd/tiket"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Daftar Pengajuan</span>
                        </Link>
                    </div>
                </div>

                {/* SEARCH FILTER CARD */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <form onSubmit={handleSearch} className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Cari Berdasarkan No Tiket atau NIP
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Masukkan No Tiket (contoh: 010126ABC1) atau NIP Pegawai..."
                                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    autoFocus
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all w-full sm:w-auto"
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
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium transition-all"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400">
                            Pencarian mencakup seluruh data usulan yang terdaftar pada unit kerja instansi Anda.
                        </p>
                    </form>
                </div>

                {/* RESULTS SECTION */}
                {!hasSearched ? (
                    /* INITIAL PROMPT CARD (BELUM MENCARI) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <Printer className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Pencarian Tiket Pengajuan
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Silakan masukkan <span className="font-semibold text-slate-700 dark:text-slate-300">Nomor Tiket</span> atau <span className="font-semibold text-slate-700 dark:text-slate-300">NIP Pegawai</span> pada kolom pencarian di atas untuk menemukan tiket yang akan dicetak.
                        </p>
                    </div>
                ) : data.length === 0 ? (
                    /* NOT FOUND ALERT CARD */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Data Tidak Ditemukan
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Tidak ada tiket yang cocok dengan kata kunci <span className="font-semibold text-slate-800 dark:text-slate-200">"{keyword}"</span> pada unit kerja Anda. Pastikan Nomor Tiket atau NIP sudah sesuai.
                        </p>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Pencarian</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* FOUND RESULTS TABLE & CARDS */
                    <div className="space-y-4">
                        {/* Info Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Hasil pencarian untuk <span className="font-bold text-slate-800 dark:text-slate-200">"{keyword}"</span>
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

                        {/* TABLE CARD (Desktop & iPad) + CARD LIST (Mobile) */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
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
                                        {paginatedData.map((item, index) => {
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
                                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                                            {statusText}
                                                        </span>
                                                    </td>

                                                    {/* Aksi Cetak */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle text-center whitespace-nowrap">
                                                        <a
                                                            href={`/tiket/cetak/${encodeURIComponent(item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Cetak Bukti Tiket"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold text-xs transition-colors shadow-2xs"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                            <span>Cetak Tiket</span>
                                                        </a>
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
                                totalItems={data.length}
                                perPage={perPage}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
