import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { getInitials } from '@/utils/initials';
import {
    Edit3,
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
    UploadCloud,
    ArrowRight,
    MessageSquare,
    ShieldAlert
} from 'lucide-react';

export default function Index({ data = [], layananList = [] }) {
    const { auth, flash = {} } = usePage().props;

    // Filters and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLayanan, setSelectedLayanan] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, BELUM, SUDAH
    const [copiedTiket, setCopiedTiket] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Modals states
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [activeConfirmTiket, setActiveConfirmTiket] = useState(null);
    const [submittingConfirm, setSubmittingConfirm] = useState(false);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [activeDetailTiket, setActiveDetailTiket] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [detailBtlList, setDetailBtlList] = useState([]);

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
            if (item.diperbaiki === 0) belum++;
            else sudah++;
            totalBtlFiles += Number(item.jumlah_btl || 0);
        });

        return { total, belum, sudah, totalBtlFiles };
    }, [data]);

    // Client-side Filtered List
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // Status Filter
            if (statusFilter === 'BELUM' && item.diperbaiki !== 0) {
                return false;
            }
            if (statusFilter === 'SUDAH' && item.diperbaiki !== 1) {
                return false;
            }

            // Layanan Filter
            if (selectedLayanan && item.kode_layanan !== selectedLayanan) {
                return false;
            }

            // Search query filter (no_tiket, nip, nama, layanan)
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const matchTiket = (item.no_tiket || '').toLowerCase().includes(q);
            const matchNip = (item.nip || '').toLowerCase().includes(q);
            const matchNama = (item.nama || '').toLowerCase().includes(q);
            const matchLayanan = (item.layanan?.nama_layanan || '').toLowerCase().includes(q);

            return matchTiket || matchNip || matchNama || matchLayanan;
        });
    }, [data, searchQuery, selectedLayanan, statusFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, currentPage, perPage]);

    // Action: Open Confirm Modal
    const handleOpenConfirm = (item) => {
        setActiveConfirmTiket(item);
        setConfirmModalOpen(true);
    };

    // Action: Submit Confirm
    const handleConfirmSubmit = (e) => {
        e.preventDefault();
        if (!activeConfirmTiket) return;

        setSubmittingConfirm(true);
        router.post(
            `/adminOpd/perbaikan/${activeConfirmTiket.no_tiket}/konfirmasi`,
            {},
            {
                onSuccess: () => {
                    setConfirmModalOpen(false);
                    setActiveConfirmTiket(null);
                    setSubmittingConfirm(false);
                },
                onError: () => {
                    setSubmittingConfirm(false);
                },
            }
        );
    };

    // Action: Open Detail BTL Modal
    const handleOpenDetail = (item) => {
        setActiveDetailTiket(item);
        setDetailModalOpen(true);
        setLoadingDetail(true);
        setDetailBtlList([]);

        fetch(`/adminOpd/perbaikan/detail/${item.no_tiket}`)
            .then((res) => res.json())
            .then((resData) => {
                setDetailBtlList(Array.isArray(resData) ? resData : []);
                setLoadingDetail(false);
            })
            .catch(() => {
                setDetailBtlList([]);
                setLoadingDetail(false);
            });
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Daftar Perbaikan Usulan - PILKB" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Edit3 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Daftar Perbaikan Usulan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftar pengajuan usulan berkas tidak lengkap (BTL) yang membutuhkan perbaikan atau revisi dokumen instansi Anda.
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
                                            href="/adminOpd/perbaikan/export-excel"
                                            onClick={() => setExportOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                            <span>Export Excel</span>
                                        </a>
                                        <a
                                            href="/adminOpd/perbaikan/export-pdf"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            Total Perbaikan BTL
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

                    <div
                        onClick={() => {
                            setStatusFilter('BELUM');
                            setCurrentPage(1);
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'BELUM'
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Menunggu Perbaikan
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {stats.belum}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                                Belum
                            </span>
                        </div>
                    </div>

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
                            Telah Diperbaiki
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {stats.sudah}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                                Sudah
                            </span>
                        </div>
                    </div>
                </div>

                {/* FILTER TOOLBAR CARD */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search */}
                        <div className="lg:col-span-6 relative">
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
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCurrentPage(1);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Layanan Selector */}
                        <div className="lg:col-span-4">
                            <div className="relative">
                                <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={selectedLayanan}
                                    onChange={(e) => {
                                        setSelectedLayanan(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    <option value="">Semua Layanan</option>
                                    {layananList.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.nama_layanan}
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
                    {paginatedData.length === 0 ? (
                        <div className="py-16 px-4 text-center">
                            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Tidak ada data perbaikan usulan
                            </h4>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                                {searchQuery || selectedLayanan || statusFilter !== 'ALL'
                                    ? `Tidak ditemukan usulan yang cocok dengan filter saat ini. Coba ubah atau reset filter Anda.`
                                    : `Semua usulan Anda saat ini berstatus normal atau belum ada berkas yang ditandai BTL.`}
                            </p>
                            {(searchQuery || selectedLayanan || statusFilter !== 'ALL') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedLayanan('');
                                        setStatusFilter('ALL');
                                        setCurrentPage(1);
                                    }}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset Filter</span>
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
                                            <th className="py-3.5 px-4 lg:px-6 text-center">Status Perbaikan</th>
                                            <th className="py-3.5 px-4 lg:px-6 text-center">Berkas BTL</th>
                                            <th className="py-3.5 px-4 lg:px-6 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedData.map((item) => {
                                            const isSudah = item.diperbaiki === 1;

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
                                                        <span className="text-[10px] text-slate-400 block mt-0.5">
                                                            {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            }) : '-'}
                                                        </span>
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
                                                        {item.layanan?.bidang?.nama_bidang && (
                                                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[220px]">
                                                                {item.layanan.bidang.nama_bidang}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Status Perbaikan */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle text-center">
                                                        {isSudah ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60">
                                                                <span>Sudah Diperbaiki</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60">
                                                                <span>Belum Diperbaiki</span>
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Jumlah Berkas BTL */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle text-center">
                                                        <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                                            {item.jumlah_btl || 0}
                                                        </span>
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {/* Tombol Lihat Catatan Verifikator (Biru) */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenDetail(item)}
                                                                title="Lihat Catatan Verifikator"
                                                                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50 transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>

                                                            {/* Tombol Perbaiki Dokumen */}
                                                            <Link
                                                                href={`/adminOpd/perbaikan/${item.no_tiket}/edit`}
                                                                title="Perbaiki / Unggah Dokumen"
                                                                className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800 transition-colors"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Link>

                                                            {/* Tombol Konfirmasi Perbaikan */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenConfirm(item)}
                                                                title="Konfirmasi Selesai Perbaikan ke BKPSDM"
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
                                                            >
                                                                <UploadCloud className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION BAR */}
                            <div className="px-4 lg:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <div>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {filteredData.length > 0 ? (currentPage - 1) * perPage + 1 : 0}
                                    </span>{' '}
                                    -{' '}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {Math.min(currentPage * perPage, filteredData.length)}
                                    </span>{' '}
                                    dari{' '}
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {filteredData.length}
                                    </span>{' '}
                                    usulan
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                        >
                                            Prev
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .map((p, idx, arr) => (
                                                <React.Fragment key={p}>
                                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                        <span className="px-1 text-slate-400">...</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentPage(p)}
                                                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                                                            currentPage === p
                                                                ? 'bg-blue-600 text-white'
                                                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        {p}
                                                    </button>
                                                </React.Fragment>
                                            ))}

                                        <button
                                            type="button"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* MODAL KONFIRMASI PERBAIKAN                               */}
            {/* ======================================================== */}
            {confirmModalOpen && activeConfirmTiket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                        onClick={() => !submittingConfirm && setConfirmModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Konfirmasi Perbaikan Usulan
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                disabled={submittingConfirm}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                            <p>
                                Apakah Anda yakin berkas pada usulan berikut telah selesai diperbaiki dan siap untuk dikonfirmasikan kembali ke BKPSDM?
                            </p>
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nomor Tiket:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                                        {activeConfirmTiket.no_tiket}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Pegawai:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {activeConfirmTiket.nama} ({activeConfirmTiket.nip})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Layanan:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {activeConfirmTiket.layanan?.nama_layanan}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                disabled={submittingConfirm}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={submittingConfirm}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {submittingConfirm ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Ya, Konfirmasi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL DETAIL CATATAN BTL                                 */}
            {/* ======================================================== */}
            {detailModalOpen && activeDetailTiket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setDetailModalOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-900">
                                        Catatan Verifikator BTL
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                                        {activeDetailTiket.no_tiket}
                                    </h3>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {activeDetailTiket.nama} ({activeDetailTiket.nip}) &bull; {activeDetailTiket.layanan?.nama_layanan}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {loadingDetail ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs">Memuat data berkas perbaikan...</span>
                                </div>
                            ) : detailBtlList.length === 0 ? (
                                <div className="py-8 text-center text-slate-400">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                                    <p className="text-xs font-semibold">Tidak ditemukan berkas bertanda BTL untuk tiket ini.</p>
                                </div>
                            ) : (
                                detailBtlList.map((d, index) => (
                                    <div
                                        key={d.id || index}
                                        className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-2 text-xs"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2">
                                                <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                                                    {index + 1}
                                                </span>
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-snug">
                                                    {d.syarat?.syarat || 'Persyaratan Berkas'}
                                                </h4>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 flex-shrink-0">
                                                Tidak Valid
                                            </span>
                                        </div>

                                        {/* Catatan Komentar Admin */}
                                        <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-rose-200/60 dark:border-rose-800/40">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Catatan Verifikator BKPSDM:</span>
                                            </div>
                                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                                {d.comment || 'Berkas tidak sesuai atau belum memenuhi ketentuan layanan.'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDetailModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Tutup
                            </button>
                            <Link
                                href={`/adminOpd/perbaikan/${activeDetailTiket.no_tiket}/edit`}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                            >
                                <span>Perbaiki Dokumen Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
