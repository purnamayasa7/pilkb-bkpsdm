import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Star,
    BarChart2,
    Building2,
    MessageSquare,
    Filter,
    Layers,
    ChevronDown,
    ArrowLeft,
} from 'lucide-react';

/**
 * Halaman Evaluasi Kepuasan Layanan — Pimpinan
 *
 * Props dari PimpinanController::kepuasan():
 *  - reviews: paginated Laravel collection
 *  - distribusi: { 1: { rating, jumlah }, ... }
 *  - rata_per_bidang: [{ id, nama, avg_rating, total }]
 *  - bidang: all bidang
 *  - bidangFilter: string|null
 */
export default function PimpinanKepuasan({ reviews, distribusi = {}, rata_per_bidang = [], bidang = [], bidangFilter }) {
    const [filterBidang, setFilterBidang] = useState(bidangFilter || '');

    const handleFilterBidang = (e) => {
        const val = e.target.value;
        setFilterBidang(val);
        router.get('/pimpinan/kepuasan', { bidang: val || undefined }, { preserveState: true, replace: true });
    };

    const totalReview = useMemo(
        () => Object.values(distribusi).reduce((sum, d) => sum + (d.jumlah ?? 0), 0),
        [distribusi]
    );

    // Helper: inisial 2 huruf bulat slate (Standard.md Bab 6.1)
    const getInitials = (nama, fallback = 'OP') => {
        if (!nama) return fallback;
        const parts = String(nama).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const renderStars = (rating, size = 'w-3.5 h-3.5') => {
        return [1, 2, 3, 4, 5].map((s) => (
            <Star
                key={s}
                className={`${size} ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
            />
        ));
    };

    const aspekBadgeColor = (aspek) => {
        const colors = [
            'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
            'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300',
            'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300',
            'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300',
            'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300',
        ];
        const idx = aspek.charCodeAt(0) % colors.length;
        return colors[idx];
    };

    const ratingLabel = { 1: 'Sangat Buruk', 2: 'Buruk', 3: 'Cukup', 4: 'Baik', 5: 'Sangat Baik' };
    const ratingColor = {
        1: 'text-rose-600',
        2: 'text-orange-500',
        3: 'text-amber-500',
        4: 'text-blue-600',
        5: 'text-emerald-600',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Evaluasi Kepuasan Layanan - PILKB" />

            <div className="space-y-6">
                {/* 1. Page Header (Standard.md Bab 4.1) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Star className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Evaluasi Kepuasan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Hasil penilaian dan ulasan kualitas layanan dari Pengusul OPD.
                        </p>
                    </div>

                    {/* <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        <Link
                            href="/pimpinan/dashboard"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Dashboard Eksekutif</span>
                        </Link>
                    </div> */}
                </div>

                {/* 2. Kartu Rata-rata Per Bidang (Standard.md Bab 4.2 & Bab 5) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {rata_per_bidang.map((b) => (
                        <div key={b.id} className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate" title={b.nama_lengkap || b.nama}>
                                {b.nama}
                            </div>
                            <div className="mt-1 flex items-baseline justify-between">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                        {b.avg_rating}
                                    </span>
                                    <span className="text-xs text-amber-500 font-semibold">★</span>
                                </div>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                                    {b.total} Ulasan
                                </span>
                            </div>
                        </div>
                    ))}
                    {rata_per_bidang.length === 0 && (
                        <div className="col-span-4 rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                            Belum ada data ulasan per bidang
                        </div>
                    )}
                </div>

                {/* 3. Distribusi Bintang & Filter Toolbar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Distribusi Bintang */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 border border-amber-200/80 dark:border-amber-900/40">
                                <BarChart2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Distribusi Penilaian
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const jumlah = distribusi[star]?.jumlah ?? 0;
                                const pct = totalReview > 0 ? Math.round((jumlah / totalReview) * 100) : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5 w-20 shrink-0">
                                            {renderStars(star, 'w-3 h-3')}
                                        </div>
                                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-500 w-8 text-right">{jumlah}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-3 text-center">Total {totalReview} ulasan</p>
                    </div>

                    {/* Filter Toolbar + Tabel Reviews */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Filter Card */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                                <div className="lg:col-span-12 relative">
                                    <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={filterBidang}
                                        onChange={handleFilterBidang}
                                        className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="">Semua Bidang</option>
                                        {bidang.map((b) => (
                                            <option key={b.id} value={b.id}>{b.nama_bidang}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Daftar Review */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            {reviews?.data?.length > 0 ? (
                                <>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {reviews.data.map((review) => (
                                            <div key={review.id} className="p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                            {getInitials(review.tiket?.nama_ukerja || review.tiket?.nama || review.user?.name, 'OP')}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                                                {review.tiket?.nama_ukerja || review.user?.name || '-'}
                                                            </p>
                                                            <p className="text-[11px] font-mono text-slate-400">
                                                                {review.no_tiket}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <div className="flex items-center gap-0.5 justify-end">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                        <span className={`text-[11px] font-semibold ${ratingColor[review.rating] || ''}`}>
                                                            {ratingLabel[review.rating] || '-'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Layanan */}
                                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-2 line-clamp-1" title={review.layanan?.nama_layanan}>
                                                    {review.layanan?.nama_layanan || '-'}
                                                </p>

                                                {/* Aspek */}
                                                {review.aspek_penilaian?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {review.aspek_penilaian.map((aspek, i) => (
                                                            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${aspekBadgeColor(aspek)}`}>
                                                                {aspek}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Komentar */}
                                                {review.komentar && (
                                                    <div className="mt-2.5 flex items-start gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
                                                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                                                            "{review.komentar}"
                                                        </p>
                                                    </div>
                                                )}

                                                <p className="text-[10px] text-slate-400 mt-2">
                                                    {new Date(review.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <Pagination
                                        pagination={reviews}
                                        onPageChange={(page) =>
                                            router.get('/pimpinan/kepuasan', { page, bidang: filterBidang || undefined }, { preserveState: true })
                                        }
                                    />
                                </>
                            ) : (
                                <div className="py-16 px-4 text-center">
                                    <Star className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum Ada Ulasan</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        Ulasan akan muncul saat Admin OPD menilai layanan yang telah selesai
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
