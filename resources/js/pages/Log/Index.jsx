import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import { getInitials } from '@/utils/initials';
import {
    Activity,
    Calendar,
    Search,
    RotateCcw,
    FileSpreadsheet,
    ChevronDown,
    Clock,
    User,
    Layers,
    X,
    Filter
} from 'lucide-react';

export default function Index({
    logs = [],
    tanggal_awal = '',
    tanggal_akhir = '',
    is_search = false,
}) {
    const { auth } = usePage().props;

    // Role-based dynamics
    const userRole = auth?.user?.role_id;
    const isBidang = userRole === 4;
    const isOpd = userRole === 3;
    const isAdminBawah = userRole === 2;

    // Detect bidang name from logs if available
    const namaBidang = useMemo(() => {
        const found = (logs || []).find((l) => l.user?.bidang?.nama_bidang);
        return found?.user?.bidang?.nama_bidang || '';
    }, [logs]);

    const pageTitle = isBidang
        ? `Aktivitas Bidang${namaBidang ? ` - ${namaBidang}` : ''} - PILKB`
        : isOpd
        ? 'Aktivitas Instansi - PILKB'
        : isAdminBawah
        ? 'Aktivitas Anda - PILKB'
        : 'Log Aktivitas - PILKB';

    const headerTitle = isBidang
        ? `Aktivitas Bidang${namaBidang ? ` - ${namaBidang}` : ''}`
        : isOpd
        ? 'Aktivitas Instansi'
        : isAdminBawah
        ? 'Aktivitas Anda'
        : 'Log Aktivitas';

    const headerSubtitle = isBidang
        ? 'Audit trail dan rekaman log aktivitas internal bidang kepegawaian'
        : isOpd
        ? 'Audit trail dan rekaman aktivitas pengguna sistem kepegawaian'
        : isAdminBawah
        ? 'Audit trail dan rekaman log aktivitas akun pelayanan Anda'
        : 'Audit trail dan rekaman seluruh aktivitas pengguna sistem kepegawaian';

    // Filter states
    const [startDate, setStartDate] = useState(tanggal_awal || '');
    const [endDate, setEndDate] = useState(tanggal_akhir || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Client-side search & filters
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [moduleFilter, setModuleFilter] = useState('ALL');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Sync state when props change
    useEffect(() => {
        setStartDate(tanggal_awal || '');
        setEndDate(tanggal_akhir || '');
        setCurrentPage(1);
    }, [tanggal_awal, tanggal_akhir]);

    // Handle Quick Date Presets
    const applyPreset = (preset) => {
        const today = new Date();
        const formatDateString = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        let sDate = '';
        let eDate = formatDateString(today);

        if (preset === 'today') {
            sDate = eDate;
        } else if (preset === '7days') {
            const past = new Date();
            past.setDate(today.getDate() - 6);
            sDate = formatDateString(past);
        } else if (preset === 'thisMonth') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            sDate = formatDateString(firstDay);
        } else if (preset === 'lastMonth') {
            const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            sDate = formatDateString(firstDayLastMonth);
            eDate = formatDateString(lastDayLastMonth);
        } else if (preset === 'thisYear') {
            sDate = `${today.getFullYear()}-01-01`;
        }

        setStartDate(sDate);
        setEndDate(eDate);
        handleSubmitFilter(sDate, eDate);
    };

    // Format Date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    };

    // Calculate Summary Stats based on action type
    const stats = useMemo(() => {
        let total = (logs || []).length;
        let create = 0;
        let update = 0;
        let del = 0;

        (logs || []).forEach((l) => {
            const act = (l.action || '').toUpperCase();
            if (act.includes('CREATE') || act.includes('TAMBAH') || act.includes('STORE')) {
                create++;
            } else if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('UBAH')) {
                update++;
            } else if (act.includes('DELETE') || act.includes('HAPUS') || act.includes('BATAL')) {
                del++;
            }
        });

        return { total, create, update, del };
    }, [logs]);

    // Handle Submit Filter
    const handleSubmitFilter = (sDate = startDate, eDate = endDate) => {
        if (!sDate || !eDate) {
            alert('Mohon tentukan tanggal mulai dan tanggal selesai terlebih dahulu.');
            return;
        }

        setIsSubmitting(true);
        router.get(
            '/log-aktivitas',
            { tanggal_awal: sDate, tanggal_akhir: eDate },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Handle Reset Filter
    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
        setActionFilter('ALL');
        setModuleFilter('ALL');
        setCurrentPage(1);

        setIsSubmitting(true);
        router.get(
            '/log-aktivitas',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Extract available modules for filter dropdown
    const availableModules = useMemo(() => {
        const modules = new Set();
        (logs || []).forEach((l) => {
            if (l.module) modules.add(l.module);
        });
        return Array.from(modules).sort();
    }, [logs]);

    // Format Date & Time Display
    const formatDateTime = (isoString) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    // Action Badge Color Helper
    const getActionBadgeClass = (action) => {
        const act = (action || '').toUpperCase();
        if (act.includes('CREATE') || act.includes('TAMBAH') || act.includes('STORE')) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
        }
        if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('UBAH')) {
            return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
        }
        if (act.includes('DELETE') || act.includes('HAPUS') || act.includes('BATAL')) {
            return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
        }
        if (act.includes('LOGIN') || act.includes('LOGOUT') || act.includes('AUTH')) {
            return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
        }
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    };

    // Filtered Logs
    const filteredLogs = useMemo(() => {
        return (logs || []).filter((item) => {
            // Action filter
            if (actionFilter !== 'ALL') {
                const itemAction = (item.action || '').toUpperCase();
                if (!itemAction.includes(actionFilter)) return false;
            }

            // Module filter
            if (moduleFilter !== 'ALL' && item.module !== moduleFilter) {
                return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const userName = (item.user?.nama || '').toLowerCase();
                const userNip = (item.user?.username || '').toLowerCase();
                const module = (item.module || '').toLowerCase();
                const action = (item.action || '').toLowerCase();
                const desc = (item.description || '').toLowerCase();

                const match =
                    userName.includes(q) ||
                    userNip.includes(q) ||
                    module.includes(q) ||
                    action.includes(q) ||
                    desc.includes(q);

                if (!match) return false;
            }

            return true;
        });
    }, [logs, actionFilter, moduleFilter, searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredLogs.length / perPage) || 1;
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredLogs.slice(start, start + perPage);
    }, [filteredLogs, currentPage, perPage]);

    // Export Excel URL
    const exportExcelUrl =
        startDate && endDate
            ? `/log-aktivitas/export-excel?tanggal_awal=${encodeURIComponent(startDate)}&tanggal_akhir=${encodeURIComponent(endDate)}`
            : '#';

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={pageTitle} />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Poin 1 & 2 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Activity className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {headerTitle}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            {startDate && endDate ? (
                                <>
                                    Rekapitulasi log aktivitas periode{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        {formatDate(startDate)} s/d {formatDate(endDate)}
                                    </span>
                                </>
                            ) : (
                                headerSubtitle
                            )}
                        </p>
                    </div>

                    {/* Tombol Export Excel Header */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        <a
                            href={exportExcelUrl}
                            onClick={(e) => {
                                if (!startDate || !endDate) {
                                    e.preventDefault();
                                    alert('Mohon tentukan tanggal mulai dan tanggal selesai terlebih dahulu.');
                                }
                            }}
                            target={startDate && endDate ? '_blank' : undefined}
                            rel="noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-2xs transition-colors cursor-pointer ${
                                startDate && endDate
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={startDate && endDate ? 'Unduh Format Excel' : 'Pilih rentang tanggal terlebih dahulu'}
                        >
                            <FileSpreadsheet className={`w-4 h-4 ${startDate && endDate ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                            <span>Export Excel</span>
                        </a>
                    </div>
                </div>

                {/* 2. STATS METRIC CARDS (Bagian 5 Standard.md - Tampil Saat Data Dimuat) */}
                {(is_search || (startDate && endDate)) && logs.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Total Aktivitas */}
                        <div
                            onClick={() => {
                                setActionFilter('ALL');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                actionFilter === 'ALL'
                                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Aktivitas
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {stats.total}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    Semua
                                </span>
                            </div>
                        </div>

                        {/* Aktivitas Create */}
                        <div
                            onClick={() => {
                                setActionFilter(actionFilter === 'CREATE' ? 'ALL' : 'CREATE');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                actionFilter === 'CREATE'
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Tambah / Buat
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {stats.create}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                                    Create
                                </span>
                            </div>
                        </div>

                        {/* Aktivitas Update */}
                        <div
                            onClick={() => {
                                setActionFilter(actionFilter === 'UPDATE' ? 'ALL' : 'UPDATE');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                actionFilter === 'UPDATE'
                                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Ubah / Edit
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                                    {stats.update}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                                    Update
                                </span>
                            </div>
                        </div>

                        {/* Aktivitas Hapus */}
                        <div
                            onClick={() => {
                                setActionFilter(actionFilter === 'DELETE' ? 'ALL' : 'DELETE');
                                setCurrentPage(1);
                            }}
                            className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                                actionFilter === 'DELETE'
                                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Hapus / Batal
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                    {stats.del}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                                    Delete
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. CARD TOOLBAR FILTER TERPADU (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                    {/* Quick Presets Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Filter Cepat:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {[
                                { id: 'today', label: 'Hari Ini' },
                                { id: '7days', label: '7 Hari Terakhir' },
                                { id: 'thisMonth', label: 'Bulan Ini' },
                                { id: 'lastMonth', label: 'Bulan Lalu' },
                                { id: 'thisYear', label: 'Tahun Ini' },
                            ].map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => applyPreset(preset.id)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Fields Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitFilter();
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
                            {/* Tanggal Mulai */}
                            <div className="lg:col-span-5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Tanggal Mulai
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tanggal Selesai */}
                            <div className="lg:col-span-5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Tanggal Selesai
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Buttons Submit & Reset */}
                            <div className="lg:col-span-2 flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Tampilkan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
                                    title="Reset Seluruh Filter"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* RESULTS SECTION */}
                {!is_search && logs.length === 0 ? (
                    /* INITIAL PROMPT CARD (BELUM MEMILIH TANGGAL - Bagian 8 Standard.md) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <Activity className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Rentang Tanggal Belum Dipilih
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Silakan tentukan <span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Mulai</span> dan <span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Selesai</span> pada kolom di atas atau gunakan tombol <span className="font-semibold text-blue-600 dark:text-blue-400">Filter Cepat</span> untuk memuat rekaman {isAdminBawah ? 'aktivitas akun pelayanan Anda' : isBidang ? 'aktivitas bidang' : isOpd ? 'aktivitas instansi' : 'log aktivitas'}.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* SEARCH & FILTER TOOLBAR */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Cari user, NIP, module, deskripsi..."
                                    className="w-full pl-10 pr-8 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Action, Module & Per-Page Controls */}
                            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                                {/* Action Filter */}
                                <div className="relative">
                                    <select
                                        value={actionFilter}
                                        onChange={(e) => {
                                            setActionFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="py-2.5 pl-3 pr-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-2xs font-medium"
                                    >
                                        <option value="ALL">Semua Aksi</option>
                                        <option value="CREATE">CREATE</option>
                                        <option value="UPDATE">UPDATE</option>
                                        <option value="DELETE">DELETE</option>
                                        <option value="LOGIN">LOGIN</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>

                                {/* Module Filter */}
                                {availableModules.length > 0 && (
                                    <div className="relative">
                                        <select
                                            value={moduleFilter}
                                            onChange={(e) => {
                                                setModuleFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="py-2.5 pl-3 pr-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-2xs font-medium max-w-[140px] truncate"
                                        >
                                            <option value="ALL">Semua Modul</option>
                                            {availableModules.map((mod) => (
                                                <option key={mod} value={mod}>
                                                    {mod}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                )}

                                {/* Per Page */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-400 hidden sm:inline">Tampilkan:</span>
                                    <div className="relative">
                                        <select
                                            value={perPage}
                                            onChange={(e) => {
                                                setPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="py-2.5 pl-3 pr-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-2xs font-medium"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DATA TABLE CONTAINER */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            {filteredLogs.length === 0 ? (
                                <div className="py-16 px-4 text-center">
                                    <Activity className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Tidak Ada Log Aktivitas Ditemukan
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        {searchQuery
                                            ? `Tidak ditemukan hasil dengan kata kunci "${searchQuery}".`
                                            : 'Tidak ada rekaman aktivitas pada rentang tanggal yang dipilih.'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Reset Pencarian</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Data Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
                                                <tr>
                                                    <th className="px-5 py-4 w-12 text-center">No</th>
                                                    <th className="px-5 py-4 w-44">Waktu</th>
                                                    <th className="px-5 py-4 w-56">Pengguna</th>
                                                    <th className="px-5 py-4 w-48">Modul</th>
                                                    <th className="px-5 py-4 w-28 text-center">Aksi</th>
                                                    <th className="px-5 py-4">Deskripsi Aktivitas</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                {paginatedLogs.map((log, index) => {
                                                    const rowNumber = (currentPage - 1) * perPage + index + 1;
                                                    return (
                                                        <tr
                                                            key={log.id || index}
                                                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                                        >
                                                            <td className="px-5 py-4 text-center font-bold text-slate-400">
                                                                {rowNumber}
                                                            </td>
                                                            <td className="px-5 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                                                                        {formatDateTime(log.created_at)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                                        {getInitials(log.user?.nama, 'U')}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div
                                                                            className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[180px]"
                                                                            title={log.user?.nama || '-'}
                                                                        >
                                                                            {log.user?.nama || '-'}
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-400 font-mono">
                                                                            {log.user?.username || '-'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                                                                    <Layers className="w-3 h-3 text-slate-400" />
                                                                    <span>{log.module || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                                <span
                                                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getActionBadgeClass(
                                                                        log.action
                                                                    )}`}
                                                                >
                                                                    {log.action || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words font-medium">
                                                                    {log.description || '-'}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={filteredLogs.length}
                                        perPage={perPage}
                                        onPageChange={(p) => setCurrentPage(p)}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
