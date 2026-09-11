import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Bell,
    BellOff,
    CheckCheck,
    Trash2,
    Clock,
    Tag,
    Briefcase,
    ChevronRight,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Edit3,
    RefreshCw,
    Download,
    Shuffle,
    ExternalLink,
} from 'lucide-react';

const NOTIF_CONFIGS = {
    usulan_baru: {
        icon: FileText,
        label: 'Usulan Baru',
        colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-900/50',
    },
    berkas_diterima: {
        icon: CheckCircle2,
        label: 'Berkas Diterima',
        colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/70 dark:border-blue-900/50',
    },
    berkas_tidak_lengkap: {
        icon: AlertTriangle,
        label: 'Perlu Perbaikan',
        colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/70 dark:border-amber-900/50',
    },
    review_perbaikan: {
        icon: Edit3,
        label: 'Review Perbaikan',
        colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200/70 dark:border-indigo-900/50',
    },
    status_update: {
        icon: RefreshCw,
        label: 'Update Status',
        colorClass: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200/70 dark:border-sky-900/50',
    },
    pengambilan: {
        icon: Download,
        label: 'Pengambilan Berkas',
        colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200/70 dark:border-purple-900/50',
    },
    pindah_layanan: {
        icon: Shuffle,
        label: 'Pindah Layanan',
        colorClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    selesai: {
        icon: CheckCheck,
        label: 'Selesai',
        colorClass: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200/70 dark:border-teal-900/50',
    },
    default: {
        icon: Bell,
        label: 'Pemberitahuan',
        colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/70 dark:border-blue-900/50',
    },
};

export default function NotificationsIndex({
    notifications,
    totalCount = 0,
    unreadCount = 0,
    currentFilter = 'all',
}) {
    const handleReadAll = () => {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    };

    const handleDeleteAll = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat notifikasi?')) {
            router.post('/notifications/delete-all', {}, { preserveScroll: true });
        }
    };

    const handleDeleteSingle = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Hapus notifikasi ini?')) {
            router.delete(`/notifications/${id}`, { preserveScroll: true });
        }
    };

    const handleFilterChange = (filter) => {
        router.get('/notifications', { filter }, { preserveState: true, preserveScroll: true });
    };

    const handlePageChange = (page) => {
        router.get('/notifications', { page, filter: currentFilter }, { preserveState: true, preserveScroll: true });
    };

    const items = notifications?.data || [];

    return (
        <AuthenticatedLayout>
            <Head title="Notifikasi" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Bell className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Pusat Notifikasi
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Seluruh riwayat pemberitahuan aktivitas usulan, status verifikasi berkas, dan tiket layanan Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleReadAll}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                                title="Tandai semua notifikasi telah dibaca"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>Tandai Semua Dibaca</span>
                            </button>
                        )}

                        {totalCount > 0 && (
                            <button
                                type="button"
                                onClick={handleDeleteAll}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/50 transition-colors shadow-2xs cursor-pointer"
                                title="Hapus seluruh notifikasi"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Hapus Semua</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. System Notice Banner */}
                <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 sm:p-4 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                        <span className="font-bold text-blue-900 dark:text-blue-300">
                            Pembersihan Notifikasi Otomatis:
                        </span>{' '}
                        <span className="text-slate-600 dark:text-slate-400">
                            Notifikasi yang berumur lebih dari <strong>90 hari</strong> akan dihapus secara berkala oleh sistem untuk menjaga performa aplikasi tetap cepat.
                        </span>
                    </div>
                </div>

                {/* 3. Filter Tabs Toolbar */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                currentFilter === 'all'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span>Semua</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                currentFilter === 'all'
                                    ? 'bg-blue-500/80 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                {totalCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFilterChange('unread')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                currentFilter === 'unread'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span>Belum Dibaca</span>
                            {unreadCount > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                    currentFilter === 'unread'
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                                }`}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <span className="text-xs text-slate-400">
                        {totalCount} Total Notifikasi
                    </span>
                </div>

                {/* 4. Notification List */}
                {items.length > 0 ? (
                    <div className="space-y-2.5">
                        {items.map((item) => {
                            const config = NOTIF_CONFIGS[item.type] || NOTIF_CONFIGS.default;
                            const TypeIcon = config.icon;
                            const isUnread = !item.is_read;

                            return (
                                <div
                                    key={item.id}
                                    className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-150 overflow-hidden shadow-2xs hover:shadow-sm ${
                                        isUnread
                                            ? 'border-l-4 border-l-blue-600 dark:border-l-blue-500 border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/15'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className="p-4 sm:p-4.5 flex items-start gap-3.5">
                                        {/* Icon Avatar */}
                                        <div
                                            className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${config.colorClass}`}
                                        >
                                            <TypeIcon className="w-5 h-5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {isUnread && (
                                                        <span
                                                            className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"
                                                            title="Belum dibaca"
                                                        />
                                                    )}
                                                    <h3 className={`text-sm font-bold tracking-tight text-slate-900 dark:text-white`}>
                                                        {item.title}
                                                    </h3>
                                                    {isUnread && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60">
                                                            Baru
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{item.time_ago}</span>
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                                                {item.message || '-'}
                                            </p>

                                            {/* Badges / Meta Info */}
                                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                                                {item.no_tiket && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold">
                                                        <Tag className="w-3 h-3 text-slate-400" />
                                                        #{item.no_tiket}
                                                    </span>
                                                )}

                                                {item.nama_layanan && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium max-w-xs truncate"
                                                        title={item.nama_layanan}
                                                    >
                                                        <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                        <span className="truncate">{item.nama_layanan}</span>
                                                    </span>
                                                )}

                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.colorClass}`}>
                                                    {config.label}
                                                </span>

                                                <div className="ml-auto flex items-center gap-2">
                                                    {/* Single delete button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteSingle(e, item.id)}
                                                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                        title="Hapus notifikasi ini"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Open link action */}
                                                    <a
                                                        href={`/notifications/read/${item.id}`}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
                                                    >
                                                        <span>Buka</span>
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden mt-4">
                            <Pagination
                                currentPage={notifications.current_page || 1}
                                totalPages={notifications.last_page || 1}
                                totalItems={notifications.total || 0}
                                perPage={notifications.per_page || 15}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                ) : (
                    /* 5. Standard Clean Empty State (Section 8 Standard.md) */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs py-16 px-4 text-center">
                        <BellOff className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {currentFilter === 'unread'
                                ? 'Tidak Ada Notifikasi Baru'
                                : 'Belum Ada Notifikasi'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            {currentFilter === 'unread'
                                ? 'Seluruh notifikasi Anda telah dibaca.'
                                : 'Semua pemberitahuan aktivitas tiket layanan, verifikasi berkas, dan informasi kepegawaian Anda akan tampil di sini.'}
                        </p>
                        {currentFilter === 'unread' && totalCount > 0 && (
                            <button
                                type="button"
                                onClick={() => handleFilterChange('all')}
                                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            >
                                Lihat Semua Notifikasi
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
