import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Database,
    PlusCircle,
    Download,
    Trash2,
    Search,
    X,
    Layers,
    Archive,
    HardDrive,
    Clock,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    Info,
    AlertCircle,
    Loader2,
    ChevronDown,
} from 'lucide-react';

export default function RootBackupIndex({ backups = [], stats = {} }) {

    // Search and Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Action Loading States
    const [isCreating, setIsCreating] = useState(false);
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        filename: '',
        loading: false,
    });

    // Client-side filtering with useMemo for instantaneous response
    const filteredBackups = useMemo(() => {
        if (!searchQuery.trim()) {
            return backups;
        }
        const query = searchQuery.toLowerCase().trim();
        return backups.filter((item) => {
            return (
                item.filename.toLowerCase().includes(query) ||
                (item.path && item.path.toLowerCase().includes(query)) ||
                (item.created_at && item.created_at.toLowerCase().includes(query))
            );
        });
    }, [backups, searchQuery]);

    // Reset pagination to page 1 when search or perPage changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, perPage]);

    // Paginated Slicing
    const totalItems = filteredBackups.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const paginatedBackups = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredBackups.slice(start, start + perPage);
    }, [filteredBackups, currentPage, perPage]);

    // Handler: Trigger Manual Backup
    const handleCreateBackup = (e) => {
        e.preventDefault();
        if (isCreating) return;

        setIsCreating(true);
        router.post(
            '/root/backup/create',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsCreating(false),
            }
        );
    };

    // Handler: Delete Backup File
    const handleConfirmDelete = () => {
        if (!deleteModal.filename || deleteModal.loading) return;

        setDeleteModal((prev) => ({ ...prev, loading: true }));
        router.delete(`/root/backup/${encodeURIComponent(deleteModal.filename)}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ open: false, filename: '', loading: false });
            },
            onError: () => {
                setDeleteModal((prev) => ({ ...prev, loading: false }));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Backup Database - Root" />

            <div className="space-y-6">
                {/* 1. Header Halaman (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 mt-0.5">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Manajemen Backup Database
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola salinan cadangan basis data aplikasi PILKB, pantau jadwal otomatis, dan unduh berkas arsip.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={handleCreateBackup}
                            disabled={isCreating}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memproses Backup...</span>
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Buat Backup Sekarang</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Kartu Ringkasan Statistik (Bagian 4 Poin 2 Standard.md) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Card 1: Total File */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total File Backup
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                <Archive className="w-3 h-3 text-blue-500" />
                                Berkas
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.total_backups || 0}
                            </span>
                            <span className="text-xs text-slate-400">File Tersimpan</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Penyimpanan disk lokal aplikasi
                        </p>
                    </div>

                    {/* Card 2: Total Ukuran */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Ukuran Disk
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                                <HardDrive className="w-3 h-3 text-amber-500" />
                                Storage
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.total_size || '0 B'}
                            </span>
                            <span className="text-xs text-slate-400">Kapasitas</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Kapasitas disk backup terpakai
                        </p>
                    </div>

                    {/* Card 3: Backup Terakhir */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Backup Terakhir
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                <Clock className="w-3 h-3 text-emerald-500" />
                                {stats.latest_backup ? stats.latest_backup.time_ago : 'Belum Ada'}
                            </span>
                        </div>
                        <div className="mt-2">
                            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate" title={stats.latest_backup?.formatted || 'Belum Ada Backup'}>
                                {stats.latest_backup ? stats.latest_backup.formatted : 'Belum ada data backup'}
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 truncate" title={stats.latest_backup?.filename || '-'}>
                            {stats.latest_backup ? stats.latest_backup.filename : 'Belum pernah membuat backup'}
                        </p>
                    </div>
                </div>

                {/* Banner Informasi & Status Jadwal Otomatis */}
                <div className="rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Informasi Jadwal Backup Otomatis
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                    Backup database mencakup seluruh skema dan data tabel aplikasi PILKB dalam format berkas terkompresi <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-[11px] font-mono text-blue-700 dark:text-blue-300">.zip</code>. Berkas dapat diunduh untuk arsip luring atau dihapus untuk menjaga ruang penyimpanan.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs">
                                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Jadwal Harian: <strong>01:00 WITA</strong></span>
                            </span>

                            {stats.has_backup_today ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Backup Hari Ini Selesai</span>
                                </span>
                            ) : stats.is_missed_today ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-2xs">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                    <span>Jadwal Terlewat (Periksa Cron Server)</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-2xs">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Menunggu Jadwal 01:00 WITA</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Card Toolbar Filter Terpadu (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Search Input */}
                        <div className="lg:col-span-8 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama berkas backup database (misal: 2026-09-11)..."
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

                        {/* Per Page Selector */}
                        <div className="lg:col-span-4 relative">
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

                {/* 4. Card Tabel Data Tunggal (Bagian 4 Poin 4 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {paginatedBackups.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="py-3.5 px-4 text-center w-14">No</th>
                                            <th className="py-3.5 px-4">Nama Berkas Backup</th>
                                            <th className="py-3.5 px-4 text-center w-36">Ukuran File</th>
                                            <th className="py-3.5 px-4 w-56">Waktu Pembuatan</th>
                                            <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedBackups.map((item, index) => {
                                            const itemNumber = (currentPage - 1) * perPage + index + 1;
                                            return (
                                                <tr
                                                    key={item.filename}
                                                    className="hover:bg-slate-50/75 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    {/* No */}
                                                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs">
                                                        {itemNumber}
                                                    </td>

                                                    {/* Nama Berkas */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                                                                <Archive className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md" title={item.filename}>
                                                                    {item.filename}
                                                                </div>
                                                                <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-sm mt-0.5" title={item.path}>
                                                                    {item.path}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Ukuran File */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                                            <HardDrive className="w-3 h-3 text-slate-400" />
                                                            {item.size}
                                                        </span>
                                                    </td>

                                                    {/* Waktu Pembuatan */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                                            {item.created_at}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                                            {item.time_ago}
                                                        </div>
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="inline-flex items-center justify-center gap-2">
                                                            {/* Tombol Unduh */}
                                                            <a
                                                                href={`/root/backup/download/${encodeURIComponent(item.filename)}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                                                                title="Unduh Berkas Backup"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span>Unduh</span>
                                                            </a>

                                                            {/* Tombol Hapus */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteModal({
                                                                        open: true,
                                                                        filename: item.filename,
                                                                        loading: false,
                                                                    })
                                                                }
                                                                className="inline-flex items-center justify-center p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                                                title="Hapus Berkas Backup"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginasi Standar (Bagian 7 Standard.md) */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                perPage={perPage}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </>
                    ) : (
                        /* Empty State Card (Bagian 8 Standard.md) */
                        <div className="py-16 px-4 text-center">
                            <Database className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {searchQuery ? 'File Backup Tidak Ditemukan' : 'Belum Ada File Backup Database'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery
                                    ? `Tidak ditemukan berkas backup dengan kata kunci "${searchQuery}". Coba gunakan kata kunci pencarian lain.`
                                    : 'Belum ada riwayat backup database yang dibuat. Klik tombol "Buat Backup Sekarang" di atas untuk membuat salinan baru.'}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reset Pencarian</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Konfirmasi Hapus Backup</span>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    !deleteModal.loading &&
                                    setDeleteModal({ open: false, filename: '', loading: false })
                                }
                                disabled={deleteModal.loading}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <p>
                                Apakah Anda yakin ingin menghapus berkas backup basis data berikut?
                            </p>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all font-semibold">
                                {deleteModal.filename}
                            </div>
                            <div className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400 text-[11px] pt-1">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>Tindakan ini bersifat permanen dan berkas fisik tidak dapat dipulihkan kembali.</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({ open: false, filename: '', loading: false })
                                }
                                disabled={deleteModal.loading}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={deleteModal.loading}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {deleteModal.loading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Ya, Hapus Berkas</span>
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
