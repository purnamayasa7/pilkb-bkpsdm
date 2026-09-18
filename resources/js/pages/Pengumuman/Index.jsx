import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import ModalForm from './ModalForm';
import {
    Megaphone,
    Plus,
    Search,
    X,
    Filter,
    Layers,
    Calendar,
    Edit3,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    AlertOctagon,
    Info,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    FileText,
    Building2,
} from 'lucide-react';

export default function PengumumanIndex({
    pengumumans = { data: [], current_page: 1, last_page: 1, total: 0, per_page: 10 },
    metrics = { total: 0, aktif: 0, mendatang: 0, berakhir: 0 },
    filters = { search: '', status: 'semua', per_page: 10, bidang_id: 'semua' },
    bidangs = [],
    canManage = true,
    currentRoleId = 1,
    currentUserId = 1,
    userBidangId = null,
    userBidangNama = null,
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPengumuman, setSelectedPengumuman] = useState(null);

    const handleFilterChange = (key, value) => {
        router.get(
            '/pengumuman',
            {
                ...filters,
                [key]: value,
                page: 1,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange('search', searchQuery);
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        handleFilterChange('search', '');
    };

    const handlePageChange = (page) => {
        router.get(
            '/pengumuman',
            {
                ...filters,
                page,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleToggleAktif = (item) => {
        router.put(
            `/pengumuman/${item.id}/toggle-aktif`,
            {},
            { preserveScroll: true }
        );
    };

    const handleDelete = (item) => {
        if (confirm(`Apakah Anda yakin ingin menghapus pengumuman "${item.judul}"?`)) {
            router.delete(`/pengumuman/${item.id}`, {
                preserveScroll: true,
            });
        }
    };

    const openCreateModal = () => {
        setSelectedPengumuman(null);
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setSelectedPengumuman(item);
        setModalOpen(true);
    };

    // Format tanggal Indonesia
    const formatTanggal = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Helper status penayangan
    const getStatusPenayangan = (item) => {
        const now = new Date();
        const start = new Date(item.mulai_pada);
        const end = new Date(item.selesai_pada);

        if (!item.aktif) {
            if (now > end) {
                return {
                    label: 'Kedaluwarsa (Berakhir)',
                    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50',
                };
            }
            return {
                label: 'Nonaktif (Manual)',
                badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
            };
        }

        if (now < start) {
            return {
                label: 'Mendatang',
                badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/50',
            };
        }
        if (now > end) {
            return {
                label: 'Kedaluwarsa (Berakhir)',
                badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50',
            };
        }
        return {
            label: 'Sedang Tayang',
            badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50',
        };
    };

    // Helper tipe visual badge
    const getTypeBadge = (tipe) => {
        switch (tipe) {
            case 'warning':
                return {
                    label: 'Batas Waktu',
                    class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50',
                    icon: AlertTriangle,
                };
            case 'danger':
                return {
                    label: 'Darurat / Maintenance',
                    class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50',
                    icon: AlertOctagon,
                };
            case 'success':
                return {
                    label: 'Resmi',
                    class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50',
                    icon: CheckCircle2,
                };
            default:
                return {
                    label: 'Info',
                    class: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/50',
                    icon: Info,
                };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Papan Informasi - PILKB" />

            <div className="space-y-6">
                {/* 1. Komponen 1 - Header Halaman (Standard.md Bab 4.1) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Megaphone className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Manajemen Informasi
                            </h1>
                            {/* {currentRoleId === 4 && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {userBidangNama ? `Bidang ${userBidangNama}` : 'Admin Bidang'}
                                </span>
                            )}
                            {currentRoleId === 1 && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                                    Akses Penuh (Root - Semua Bidang)
                                </span>
                            )}
                            {currentRoleId === 5 && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
                                    Akses Pimpinan (Semua Bidang)
                                </span>
                            )} */}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            {currentRoleId === 4
                                ? `Kelola banner pengumuman & informasi khusus untuk ${userBidangNama ? `Bidang ${userBidangNama}` : 'bidang Anda'}.`
                                : 'Kelola informasi darurat, batas waktu usulan, maupun pemeliharaan sistem di dashboard seluruh bidang.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Informasi</span>
                        </button>
                    </div>
                </div>

                {/* 2. Komponen 2 - Kartu Ringkasan Statistik (Standard.md Bab 4.2 & Bab 5) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Total */}
                    <div
                        onClick={() => handleFilterChange('status', 'semua')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            filters.status === 'semua'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Total Pengumuman
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {metrics.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Semua
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Sedang Tayang */}
                    <div
                        onClick={() => handleFilterChange('status', 'aktif')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            filters.status === 'aktif'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Sedang Tayang
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {metrics.aktif}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                Aktif
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Mendatang */}
                    <div
                        onClick={() => handleFilterChange('status', 'mendatang')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            filters.status === 'mendatang'
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Akan Datang
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                {metrics.mendatang}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                Terjadwal
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Kedaluwarsa */}
                    <div
                        onClick={() => handleFilterChange('status', 'berakhir')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            filters.status === 'berakhir'
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Kedaluwarsa
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-600 dark:text-slate-400">
                                {metrics.berakhir}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Selesai
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Komponen 3 - Card Toolbar Filter Terpadu (Standard.md Bab 4.3) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Live Search */}
                        <div className={([1, 5].includes(currentRoleId)) ? "lg:col-span-4 relative" : "lg:col-span-6 relative"}>
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari judul atau isi pengumuman..."
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleResetSearch}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Bidang Khusus Root & Pimpinan */}
                        {([1, 5].includes(currentRoleId)) && (
                            <div className="lg:col-span-3 relative">
                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={filters.bidang_id || 'semua'}
                                    onChange={(e) => handleFilterChange('bidang_id', e.target.value)}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="semua">Semua Bidang</option>
                                    {bidangs.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Filter Status */}
                        <div className="lg:col-span-3 relative">
                            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={filters.status || 'semua'}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="aktif">Sedang Tayang (Aktif)</option>
                                <option value="mendatang">Akan Datang</option>
                                <option value="berakhir">Kedaluwarsa / Nonaktif</option>
                            </select>
                        </div>

                        {/* Filter Jumlah Per Halaman */}
                        <div className={([1, 5].includes(currentRoleId)) ? "lg:col-span-2 relative" : "lg:col-span-3 relative"}>
                            <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={filters.per_page || 10}
                                onChange={(e) => handleFilterChange('per_page', e.target.value)}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value={10}>10 per hal</option>
                                <option value={25}>25 per hal</option>
                                <option value={50}>50 per hal</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* 4. Komponen 4 - Card Tabel Data Tunggal (Standard.md Bab 4.4) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-12 text-center">
                                        No
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[280px]">
                                        Informasi Pengumuman
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[180px]">
                                        Jadwal Tayang
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[150px]">
                                        Pengunggah / Bidang
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28 text-center">
                                        Status
                                    </th>
                                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-28 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                {pengumumans.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 px-4 text-center">
                                            {/* Standar Card State Kosong (Standard.md Bab 8) */}
                                            <Megaphone className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Belum Ada Pengumuman
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                Tidak ada banner pengumuman yang sesuai dengan kriteria filter Anda.
                                            </p>
                                            {(filters.search || filters.status !== 'semua' || (filters.bidang_id && filters.bidang_id !== 'semua')) && (
                                                <button
                                                    type="button"
                                                    onClick={() => router.get('/pengumuman')}
                                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                >
                                                    Reset Filter
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    pengumumans.data.map((item, index) => {
                                        const typeBadge = getTypeBadge(item.tipe);
                                        const TypeIcon = typeBadge.icon;
                                        const statusTayang = getStatusPenayangan(item);
                                        const rowNum = (pengumumans.current_page - 1) * pengumumans.per_page + index + 1;

                                        // Hak kelola: Root (1) & Pimpinan (5) bisa kelola semua, Bidang (4) bisa kelola bidangnya
                                        const canEditItem =
                                            currentRoleId === 1 ||
                                            currentRoleId === 5 ||
                                            (currentRoleId === 4 && (Number(item.user_id) === Number(currentUserId) || (userBidangId && item.bidang_id === userBidangId)));

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                                                    {rowNum}
                                                </td>

                                                {/* Informasi Pengumuman */}
                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeBadge.class}`}>
                                                                <TypeIcon className="w-3 h-3" />
                                                                <span>{typeBadge.label}</span>
                                                            </span>
                                                        </div>
                                                        <h4
                                                            className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 max-w-md"
                                                            title={item.judul}
                                                        >
                                                            {item.judul}
                                                        </h4>
                                                        <p
                                                            className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 max-w-lg leading-relaxed"
                                                            title={item.pesan}
                                                        >
                                                            {item.pesan}
                                                        </p>
                                                        {item.tautan && (
                                                            <div className="pt-0.5">
                                                                <a
                                                                    href={item.tautan}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                                                                >
                                                                    <span>Lihat Selengkapnya</span>
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Jadwal Tayang */}
                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                                            <span className="text-slate-400 font-normal">Mulai:</span>{' '}
                                                            <span className="font-semibold">{formatTanggal(item.mulai_pada)}</span>
                                                        </div>
                                                        <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                                            <span className="text-slate-400 font-normal">Selesai:</span>{' '}
                                                            <span className="font-semibold">{formatTanggal(item.selesai_pada)}</span>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusTayang.badgeClass}`}>
                                                            {statusTayang.label}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Pengunggah / Bidang */}
                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                                            {item.bidang?.nama_bidang || 'BKPSDM Buleleng'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            Oleh: {item.author?.nama || item.author?.username || 'Admin'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Status Sakelar */}
                                                <td className="py-3.5 px-4 text-center">
                                                    {canEditItem ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleAktif(item)}
                                                            className={`p-1 rounded-xl transition-all cursor-pointer ${
                                                                item.aktif
                                                                    ? 'text-emerald-600 hover:text-emerald-700'
                                                                    : 'text-slate-300 hover:text-slate-400'
                                                            }`}
                                                            title={item.aktif ? 'Klik untuk nonaktifkan banner' : 'Klik untuk aktifkan banner'}
                                                        >
                                                            {item.aktif ? (
                                                                <ToggleRight className="w-8 h-8" />
                                                            ) : (
                                                                <ToggleLeft className="w-8 h-8" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {item.aktif ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi (Standard.md Bab 6.3) */}
                                                <td className="py-3.5 px-4 text-center">
                                                    {canEditItem ? (
                                                        <div className="inline-flex items-center gap-1.5">
                                                            {/* Tombol Ubah / Edit (Amber) */}
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(item)}
                                                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors shadow-2xs cursor-pointer"
                                                                title="Ubah Pengumuman"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>

                                                            {/* Tombol Hapus (Rose) */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(item)}
                                                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shadow-2xs cursor-pointer"
                                                                title="Hapus Pengumuman"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Hanya lihat
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Standard.md Bab 7) */}
                    <Pagination
                        pagination={pengumumans}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* Modal Tambah / Edit */}
            <ModalForm
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                pengumuman={selectedPengumuman}
                bidangs={bidangs}
                currentRoleId={currentRoleId}
            />
        </AuthenticatedLayout>
    );
}
