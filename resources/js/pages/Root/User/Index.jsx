import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Users,
    UserPlus,
    Search,
    X,
    Filter,
    Eye,
    Edit3,
    FileSpreadsheet,
    FileText,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Shield,
    Briefcase,
    Layers,
    Building2,
    Mail,
    Phone,
    Hash,
    Power,
    Check,
    ArrowLeft,
} from 'lucide-react';

export default function RootUserIndex({ users = [] }) {
    // States for filter, search, and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | '1' | '0'
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef(null);

    // Modal states
    const [detailModal, setDetailModal] = useState({
        open: false,
        user: null,
    });

    const [toggleModal, setToggleModal] = useState({
        open: false,
        user: null,
        loading: false,
    });

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

    // Helper: generate 2-letter initials
    const getInitials = (nama, fallback = 'U') => {
        if (!nama) return fallback;
        const parts = String(nama).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Stats calculations
    const stats = useMemo(() => {
        const total = users.length;
        const aktif = users.filter((u) => u.aktif === true || u.aktif === 1).length;
        const nonaktif = total - aktif;
        return { total, aktif, nonaktif };
    }, [users]);

    // Filtered data
    const filteredUsers = useMemo(() => {
        return users.filter((item) => {
            // Status filter
            if (statusFilter !== 'ALL') {
                const itemStatus = item.aktif ? '1' : '0';
                if (itemStatus !== statusFilter) return false;
            }

            // Role filter
            if (roleFilter !== 'ALL') {
                const r = String(item.role || '').toLowerCase();
                if (r !== roleFilter.toLowerCase()) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchUsername = String(item.username || '').toLowerCase().includes(q);
                const matchNama = String(item.nama || '').toLowerCase().includes(q);
                const matchJabatan = String(item.jabatan || '').toLowerCase().includes(q);
                const matchBidang = String(item.nama_bidang || '').toLowerCase().includes(q);
                const matchEmail = String(item.email || '').toLowerCase().includes(q);
                const matchUkerja = String(item.kode_ukerja || '').toLowerCase().includes(q);
                if (!matchUsername && !matchNama && !matchJabatan && !matchBidang && !matchEmail && !matchUkerja) {
                    return false;
                }
            }

            return true;
        });
    }, [users, statusFilter, roleFilter, searchQuery]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, roleFilter, perPage]);

    // Paginated items
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredUsers.slice(start, start + perPage);
    }, [filteredUsers, currentPage, perPage]);

    // Build pagination object compatible with @/components/Pagination
    const paginationData = useMemo(() => {
        const total = filteredUsers.length;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        return {
            current_page: currentPage,
            last_page: lastPage,
            from: total === 0 ? 0 : (currentPage - 1) * perPage + 1,
            to: Math.min(total, currentPage * perPage),
            total: total,
            per_page: perPage,
        };
    }, [filteredUsers.length, currentPage, perPage]);

    // Handle toggle status action
    const handleConfirmToggle = () => {
        if (!toggleModal.user) return;
        setToggleModal((prev) => ({ ...prev, loading: true }));

        router.put(
            `/root/user/${toggleModal.user.id}/toggle-aktif`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setToggleModal({ open: false, user: null, loading: false });
                },
                onError: () => {
                    setToggleModal((prev) => ({ ...prev, loading: false }));
                },
            }
        );
    };

    // Helper badge role styling
    const getRoleBadge = (roleName, roleDisplay) => {
        const r = String(roleName || '').toLowerCase();
        if (r === 'root') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                    <Shield className="w-3 h-3 text-rose-500" />
                    Root
                </span>
            );
        }
        if (r === 'admin_bawah') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                    <Shield className="w-3 h-3 text-amber-500" />
                    Admin Bawah
                </span>
            );
        }
        if (r === 'admin_opd') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                    <Building2 className="w-3 h-3 text-emerald-500" />
                    Admin OPD
                </span>
            );
        }
        if (r === 'bidang') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                    <Layers className="w-3 h-3 text-blue-500" />
                    Bidang
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/50">
                <Shield className="w-3 h-3 text-purple-500" />
                {roleDisplay || 'Pimpinan'}
            </span>
        );
    };

    const hasActiveFilter = searchQuery !== '' || statusFilter !== 'ALL' || roleFilter !== 'ALL';

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setRoleFilter('ALL');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Data Pengguna - Root" />

            <div className="space-y-6">
                {/* 1. Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 mt-0.5">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Manajemen User
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola data akun pengguna, hak akses (role) dan status aktifasi sistem PILKB.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        {/* Dropdown Export */}
                        <div className="relative" ref={exportRef}>
                            <button
                                type="button"
                                onClick={() => setExportOpen(!exportOpen)}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                <span>Export</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {exportOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40">
                                    <a
                                        href="/root/user/export-excel"
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => setExportOpen(false)}
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                        <span>Export Excel</span>
                                    </a>
                                    <a
                                        href="/root/user/export-pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => setExportOpen(false)}
                                    >
                                        <FileText className="w-4 h-4 text-rose-600" />
                                        <span>Export PDF</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Tombol Tambah User Baru */}
                        <Link
                            href="/root/user/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tambah User Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Kartu Ringkasan Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Total User */}
                    <div
                        onClick={() => {
                            setStatusFilter('ALL');
                            setRoleFilter('ALL');
                        }}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === 'ALL' && roleFilter === 'ALL'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Total Pengguna
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                Akun
                            </span>
                        </div>
                    </div>

                    {/* User Aktif */}
                    <div
                        onClick={() => setStatusFilter(statusFilter === '1' ? 'ALL' : '1')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === '1'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Pengguna Aktif
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.aktif}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                Aktif
                            </span>
                        </div>
                    </div>

                    {/* User Nonaktif */}
                    <div
                        onClick={() => setStatusFilter(statusFilter === '0' ? 'ALL' : '0')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            statusFilter === '0'
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Nonaktif
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.nonaktif}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                Nonaktif
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Card Toolbar Filter Terpadu */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Search Input */}
                        <div className="lg:col-span-5 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, NIP/username, jabatan, bidang..."
                                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Role Selector */}
                        <div className="lg:col-span-3 relative">
                            <div className="relative">
                                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">Semua Peranan (Role)</option>
                                    <option value="root">Root (Super Admin)</option>
                                    <option value="admin_bawah">Admin Bawah (Front Office)</option>
                                    <option value="admin_opd">Admin OPD (SKPD)</option>
                                    <option value="bidang">Bidang (Back Office)</option>
                                    <option value="pimpinan">Pimpinan</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Status Selector */}
                        <div className="lg:col-span-2 relative">
                            <div className="relative">
                                <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">Semua Status</option>
                                    <option value="1">Akun Aktif</option>
                                    <option value="0">Akun Nonaktif</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Per Page Selector */}
                        <div className="lg:col-span-2 relative">
                            <div className="relative">
                                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={perPage}
                                    onChange={(e) => setPerPage(Number(e.target.value))}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value={10}>10 per hal</option>
                                    <option value={25}>25 per hal</option>
                                    <option value={50}>50 per hal</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Card Tabel Data Tunggal */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        /* Empty State Card - Sesuai Seksi 8 Standard.md */
                        <div className="py-16 px-4 text-center">
                            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Tidak ada data pengguna ditemukan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {hasActiveFilter
                                    ? 'Coba sesuaikan kata kunci pencarian atau reset filter untuk menampilkan data pengguna.'
                                    : 'Belum ada data akun pengguna yang terdaftar di dalam sistem.'}
                            </p>
                            {hasActiveFilter && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reset Filter</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50">
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12 text-center">
                                                No
                                            </th>
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Username / NIP
                                            </th>
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Nama Pegawai
                                            </th>
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Bidang
                                            </th>
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Jabatan
                                            </th>
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                                Status
                                            </th>
                                            <th className="py-3 px-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-28">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedItems.map((item, index) => {
                                            const rowNumber = (currentPage - 1) * perPage + index + 1;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    {/* No */}
                                                    <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                                                        {rowNumber}
                                                    </td>

                                                    {/* Username / NIP + Avatar */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            {/* Avatar Inisial Bulat Slate - Sesuai Seksi 6 Standard.md */}
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                                {getInitials(item.nama, 'U')}
                                                            </div>
                                                            <div>
                                                                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                                                    {item.username}
                                                                </div>
                                                                {item.email && (
                                                                    <div className="text-[11px] text-slate-400 truncate max-w-[170px]" title={item.email}>
                                                                        {item.email}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Nama Pegawai */}
                                                    <td className="py-3.5 px-4">
                                                        <div
                                                            className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]"
                                                            title={item.nama || '-'}
                                                        >
                                                            {item.nama || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Bidang */}
                                                    <td className="py-3.5 px-4">
                                                        <div
                                                            className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 max-w-[180px]"
                                                            title={item.nama_bidang || '-'}
                                                        >
                                                            {item.nama_bidang || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Jabatan */}
                                                    <td className="py-3.5 px-4">
                                                        <div
                                                            className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 max-w-[180px]"
                                                            title={item.jabatan || '-'}
                                                        >
                                                            {item.jabatan || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Role */}
                                                    <td className="py-3.5 px-4">
                                                        {getRoleBadge(item.role, item.nama_role)}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {item.aktif ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                                                <XCircle className="w-3 h-3 text-rose-500" />
                                                                Nonaktif
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {/* View Detail Modal Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailModal({ open: true, user: item })}
                                                                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                                title="Lihat Detail Profil User"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>

                                                            {/* Edit Link */}
                                                            <Link
                                                                href={`/root/user/${item.id}/edit`}
                                                                className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                                title="Edit Akun User"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Link>

                                                            {/* Toggle Status Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setToggleModal({
                                                                        open: true,
                                                                        user: item,
                                                                        loading: false,
                                                                    })
                                                                }
                                                                className={`p-1.5 rounded-lg transition-colors ${
                                                                    item.aktif
                                                                        ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                                                                        : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                                                }`}
                                                                title={item.aktif ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                                                            >
                                                                <Power className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginasi Komponen Bersama (Bagian 7 Standard.md) */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.max(1, Math.ceil(filteredUsers.length / perPage))}
                                totalItems={filteredUsers.length}
                                perPage={perPage}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* 5. Modal Detail User */}
            {detailModal.open && detailModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <Users className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Detail Data Pengguna
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailModal({ open: false, user: null })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                {/* Left Side: Photo or Initial Avatar */}
                                <div className="md:col-span-4 flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800">
                                    {detailModal.user.foto_url ? (
                                        <img
                                            src={detailModal.user.foto_url}
                                            alt={detailModal.user.nama || 'Foto Pegawai'}
                                            className="w-28 h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-28 h-36 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-2xl shadow-xs"
                                        style={{ display: detailModal.user.foto_url ? 'none' : 'flex' }}
                                    >
                                        {getInitials(detailModal.user.nama, 'U')}
                                    </div>

                                    <div className="mt-3">
                                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            {detailModal.user.username}
                                        </div>
                                        <div className="mt-1">
                                            {getRoleBadge(detailModal.user.role, detailModal.user.nama_role)}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: User Metadata */}
                                <div className="md:col-span-8 space-y-3 text-xs">
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Hash className="w-3.5 h-3.5 text-slate-400" /> Username / NIP
                                        </span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white text-right">
                                            {detailModal.user.username}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-slate-400" /> Nama Lengkap
                                        </span>
                                        <span className="font-semibold text-slate-900 dark:text-white text-right">
                                            {detailModal.user.nama || '-'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-slate-400" /> Bidang
                                        </span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                                            {detailModal.user.nama_bidang || '-'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Jabatan
                                        </span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                                            {detailModal.user.jabatan || '-'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Unit Kerja (SKPD)
                                        </span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                                            {detailModal.user.kode_ukerja || '-'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                                        </span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                                            {detailModal.user.email || '-'}
                                        </span>
                                    </div>

                                    {detailModal.user.no_wa && (
                                        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                            <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp
                                            </span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                                                {detailModal.user.no_wa}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center py-1.5">
                                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                            <Shield className="w-3.5 h-3.5 text-slate-400" /> Status Akun
                                        </span>
                                        <span className="text-right">
                                            {detailModal.user.aktif ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                                                    <XCircle className="w-3 h-3 text-rose-500" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                onClick={() => setDetailModal({ open: false, user: null })}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Tutup</span>
                            </button>
                            <Link
                                href={`/root/user/${detailModal.user.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Akun</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Modal Konfirmasi Toggle Aktif/Nonaktif */}
            {toggleModal.open && toggleModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`p-1.5 rounded-lg border ${
                                        toggleModal.user.aktif
                                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/40'
                                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/40'
                                    }`}
                                >
                                    <Power className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {toggleModal.user.aktif ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={() => setToggleModal({ open: false, user: null, loading: false })}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                Apakah Anda yakin ingin{' '}
                                <strong className="font-bold text-slate-900 dark:text-white">
                                    {toggleModal.user.aktif ? 'menonaktifkan' : 'mengaktifkan'}
                                </strong>{' '}
                                akun pengguna{' '}
                                <strong className="font-bold text-slate-900 dark:text-white">
                                    {toggleModal.user.nama || toggleModal.user.username}
                                </strong>
                                ?
                            </p>
                            <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                    {getInitials(toggleModal.user.nama, 'U')}
                                </div>
                                <div className="text-xs">
                                    <div className="font-semibold text-slate-900 dark:text-white">
                                        {toggleModal.user.nama || '-'}
                                    </div>
                                    <div className="text-slate-400 font-mono text-[11px]">
                                        NIP: {toggleModal.user.username}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={() => setToggleModal({ open: false, user: null, loading: false })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Batal</span>
                            </button>
                            <button
                                type="button"
                                disabled={toggleModal.loading}
                                onClick={handleConfirmToggle}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-white transition-colors shadow-2xs cursor-pointer ${
                                    toggleModal.user.aktif
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {toggleModal.loading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Ya, Lanjutkan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
