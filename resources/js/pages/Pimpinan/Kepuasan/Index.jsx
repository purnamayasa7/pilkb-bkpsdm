import React, { useState, useMemo, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Star,
    BarChart2,
    MessageSquare,
    Building2,
    Layers,
    ChevronDown,
    Calendar,
    ExternalLink,
} from 'lucide-react';

/**
 * Halaman Evaluasi Kepuasan Layanan — Pimpinan
 *
 * Props dari PimpinanController::kepuasan():
 *  - reviews        : paginated Laravel collection
 *  - distribusi     : { 1: { rating, jumlah }, ... }
 *  - rata_per_bidang: [{ id, nama, avg_rating, total }]
 *  - bidang         : all bidang
 *  - bidangFilter   : string|null
 *  - perPage        : number (5|10|20|50)
 *  - selected_year  : number (default tahun berjalan)
 *  - available_years: array of available years
 */
export default function PimpinanKepuasan({
    reviews,
    distribusi = {},
    rata_per_bidang = [],
    bidang = [],
    bidangFilter,
    perPage = 10,
    selected_year = new Date().getFullYear(),
    available_years = [],
}) {
    const [filterBidang, setFilterBidang] = useState(bidangFilter || '');
    const [activePerPage, setActivePerPage] = useState(perPage);
    const [selectedYear, setSelectedYear] = useState(selected_year);
    const listRef = useRef(null);

    /** Navigasi dengan preserveState + preserveScroll agar tidak full reload */
    const navigate = (params = {}) => {
        router.get(
            '/pimpinan/kepuasan',
            {
                bidang: filterBidang || undefined,
                per_page: activePerPage,
                year: selectedYear,
                ...params,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onSuccess: () => {
                    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                },
            }
        );
    };

    const handleFilterBidang = (e) => {
        const val = e.target.value;
        setFilterBidang(val);
        navigate({ bidang: val || undefined, page: 1 });
    };

    const handlePerPage = (e) => {
        const val = Number(e.target.value);
        setActivePerPage(val);
        navigate({ per_page: val, page: 1 });
    };

    const handleYearChange = (newYear) => {
        const yr = Number(newYear);
        setSelectedYear(yr);
        navigate({ year: yr, page: 1 });
    };

    const totalReview = useMemo(
        () => Object.values(distribusi).reduce((sum, d) => sum + (d.jumlah ?? 0), 0),
        [distribusi]
    );

    // Rata-rata global tertimbang
    const avgGlobal = useMemo(() => {
        let weightedSum = 0;
        let total = 0;
        Object.entries(distribusi).forEach(([star, d]) => {
            weightedSum += Number(star) * (d.jumlah ?? 0);
            total += d.jumlah ?? 0;
        });
        return total > 0 ? (weightedSum / total).toFixed(1) : '—';
    }, [distribusi]);

    const getInitials = (nama, fallback = 'OP') => {
        if (!nama) return fallback;
        const parts = String(nama).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const renderStars = (rating, size = 'w-3.5 h-3.5') =>
        [1, 2, 3, 4, 5].map((s) => (
            <Star
                key={s}
                className={`${size} ${
                    s <= Math.round(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                }`}
            />
        ));

    const aspekBadgeColor = (aspek) => {
        const colors = [
            'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
            'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300',
            'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300',
            'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300',
            'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300',
        ];
        return colors[aspek.charCodeAt(0) % colors.length];
    };

    // Lebar progress bar distribusi bintang — dikalibrasi Tailwind (tanpa inline style)
    const pctWidthClass = (pct) => {
        if (pct === 0) return 'w-0';
        if (pct <= 10) return 'w-[10%]';
        if (pct <= 20) return 'w-[20%]';
        if (pct <= 30) return 'w-[30%]';
        if (pct <= 40) return 'w-[40%]';
        if (pct <= 50) return 'w-[50%]';
        if (pct <= 60) return 'w-[60%]';
        if (pct <= 70) return 'w-[70%]';
        if (pct <= 80) return 'w-[80%]';
        if (pct <= 90) return 'w-[90%]';
        return 'w-full';
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
                {/* ── Komponen 1: Page Header (Standard.md §4.1) ─────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            {/* Icon boks biru — warna brand PILKB Blue (Standard.md §4.1) */}
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Star className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Evaluasi Kepuasan
                            </h1>
                        </div>
                        {/* Sub-deskripsi wajib pl-11 (Standard.md §4.1) */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Penilaian dan ulasan kualitas layanan dari Pengusul OPD Tahun {selectedYear}.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        {/* Dropdown Pemilih Periode Tahun di Header (Standard.md Bab 4.1 & Bab 4.3) */}
                        <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                            >
                                {available_years.map((yr) => (
                                    <option key={yr} value={yr}>
                                        Tahun {yr}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* ── Komponen 2: Metric Cards Per Bidang (Standard.md §5) ────────── */}
                {rata_per_bidang.length > 0 && (
                    /* Grid baku: grid-cols-2 sm:grid-cols-4 (Standard.md §5.1) */
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {rata_per_bidang.map((b) => {
                            const avg = parseFloat(b.avg_rating) || 0;
                            // Lebar bar dikalibrasi ke kelipatan 10 (tanpa inline style)
                            const barPct = Math.round((avg / 5) * 10) * 10;
                            const barClass = pctWidthClass(barPct);
                            return (
                                /* Container kartu baku p-4 rounded-2xl (Standard.md §5.2) */
                                <div
                                    key={b.id}
                                    className="cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                                >
                                    {/* Label atas: text-[11px] font-semibold ... uppercase tracking-wider (Standard.md §5.2) */}
                                    <p
                                        className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate"
                                        title={b.nama_lengkap || b.nama}
                                    >
                                        {b.nama}
                                    </p>
                                    {/* Angka tebal text-2xl font-extrabold + badge pill (Standard.md §5.2) */}
                                    <div className="mt-1 flex items-baseline justify-between">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                                {avg > 0 ? avg.toFixed(1) : '—'}
                                            </span>
                                            {avg > 0 && (
                                                <span className="text-xs text-amber-500 font-bold">★</span>
                                            )}
                                        </div>
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                                            {b.total > 0 ? `${b.total} ulasan` : 'Belum ada'}
                                        </span>
                                    </div>
                                    {/* Mini progress bar — Tailwind width class, bukan inline style (Standard.md §2.3) */}
                                    <div className="mt-2 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div className={`h-full rounded-full bg-amber-400 transition-all duration-700 ${barClass}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Komponen 3 + 4: Distribusi | Filter Toolbar + Daftar Review ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                    {/* Panel Distribusi Bintang — card kiri */}
                    <div className="lg:col-span-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <BarChart2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Distribusi Rating
                            </h3>
                        </div>

                        {/* Skor rata-rata global */}
                        <div className="text-center py-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                            <p className="text-3xl font-extrabold text-amber-500">{avgGlobal}</p>
                            <div className="flex justify-center gap-0.5 mt-1">
                                {renderStars(parseFloat(avgGlobal) || 0, 'w-3.5 h-3.5')}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{totalReview} total ulasan</p>
                        </div>

                        {/* Bar distribusi per bintang */}
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
                                            <div className={`h-full rounded-full bg-amber-400 transition-all duration-500 ${pctWidthClass(pct)}`} />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-500 w-8 text-right shrink-0">
                                            {jumlah}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-3 text-center">
                            Total {totalReview} ulasan
                        </p>
                    </div>

                    {/* Kolom Kanan: Filter Toolbar + Daftar Review */}
                    <div className="lg:col-span-9 space-y-4" ref={listRef}>

                        {/* Komponen 3 — Card Toolbar Filter Terpadu (Standard.md §4.3) */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">

                                {/* Filter Bidang — icon Building2 wajib untuk bidang (Standard.md §4.3.1) */}
                                <div className="lg:col-span-9 relative">
                                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={filterBidang}
                                        onChange={handleFilterBidang}
                                        className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="">Semua Bidang</option>
                                        {bidang.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.nama_bidang}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Per Halaman — icon Layers wajib untuk jumlah per hal (Standard.md §4.3.1) */}
                                <div className="lg:col-span-3 relative">
                                    <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={activePerPage}
                                        onChange={handlePerPage}
                                        className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    >
                                        {/* Label format baku: "N per hal" (Standard.md §4.3.1) */}
                                        <option value={5}>5 per hal</option>
                                        <option value={10}>10 per hal</option>
                                        <option value={20}>20 per hal</option>
                                        <option value={50}>50 per hal</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Komponen 4 — Card Daftar Review (Standard.md §4.4) */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            {reviews?.data?.length > 0 ? (
                                <>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {reviews.data.map((review) => (
                                            <div
                                                key={review.id}
                                                className="p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                                            >
                                                {/* Row: Avatar + Info + Rating */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        {/* Avatar bulat slate baku (Standard.md §6.1) */}
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                            {getInitials(
                                                                review.tiket?.nama_ukerja ||
                                                                    review.tiket?.nama ||
                                                                    review.user?.name,
                                                                'OP'
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                                                {review.tiket?.nama_ukerja ||
                                                                    review.user?.name ||
                                                                    '-'}
                                                            </p>
                                                            <a
                                                                href={`/cek-tiket/${encodeURIComponent(review.no_tiket)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[11px] font-mono text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                                                                title="Lihat Detail Usulan di Tab Baru (Cek Tiket Publik)"
                                                            >
                                                                {review.no_tiket}
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <div className="flex items-center gap-0.5 justify-end">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                        <span
                                                            className={`text-[11px] font-semibold ${ratingColor[review.rating] || ''}`}
                                                        >
                                                            {ratingLabel[review.rating] || '-'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Nama Layanan */}
                                                <p
                                                    className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-2 line-clamp-1"
                                                    title={review.layanan?.nama_layanan}
                                                >
                                                    {review.layanan?.nama_layanan || '-'}
                                                </p>

                                                {/* Aspek Penilaian */}
                                                {review.aspek_penilaian?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {review.aspek_penilaian.map((aspek, i) => (
                                                            <span
                                                                key={i}
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${aspekBadgeColor(aspek)}`}
                                                            >
                                                                {aspek}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Komentar */}
                                                {review.komentar && (
                                                    <div className="mt-2.5 flex items-start gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
                                                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                                            "{review.komentar}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Footer: Tanggal + Tombol Lihat Detail Usulan (Opsi 1) */}
                                                <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
                                                    <p className="text-[11px] text-slate-400">
                                                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                    <a
                                                        href={`/cek-tiket/${encodeURIComponent(review.no_tiket)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
                                                        title="Buka Detail Usulan di Tab Baru (Cek Tiket Publik)"
                                                    >
                                                        <span>Lihat Detail Usulan</span>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination baku (Standard.md §7) */}
                                    <Pagination
                                        pagination={reviews}
                                        onPageChange={(page) => navigate({ page })}
                                    />
                                </>
                            ) : (
                                /* Empty State baku (Standard.md §8) */
                                <div className="py-16 px-4 text-center">
                                    <Star className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Belum Ada Ulasan
                                    </h4>
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
