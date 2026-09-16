import React, { useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Chart from 'chart.js/auto';
import {
    BarChart2,
    CheckCircle2,
    AlertTriangle,
    Star,
    TrendingUp,
    FileText,
    Building2,
    Users,
    Award,
    Clock,
    Calendar,
    ChevronDown,
} from 'lucide-react';

/**
 * Dashboard Eksekutif Pimpinan (Kepala Badan & Sekretaris BKPSDM)
 *
 * Props dari PimpinanController::dashboard():
 *  - metrics: { total_usulan, total_selesai, pct_selesai, total_btl, ratio_btl, avg_rating, total_review }
 *  - stat_per_bidang: [{ bidang, total, selesai, btl, avg_rating, total_review }]
 *  - trend_bulanan: [{ bulan, label, label_full, total }]
 *  - top_opd: [{ nama_ukerja, kode_ukerja, total, selesai }]
 *  - selected_year: integer
 *  - available_years: array
 */
export default function PimpinanDashboard({
    metrics = {},
    stat_per_bidang = [],
    trend_bulanan = [],
    top_opd = [],
    selected_year = new Date().getFullYear(),
    available_years = []
}) {
    const chartCanvasRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!chartCanvasRef.current || !trend_bulanan?.length) return;
        const ctx = chartCanvasRef.current.getContext('2d');
        if (!ctx) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');

        // Soft Blue Gradient Fill khas PILKB
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.005)');

        const labels = trend_bulanan.map((t) => t.label || t.bulan);
        const dataValues = trend_bulanan.map((t) => t.total);

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Volume Usulan',
                        data: dataValues,
                        tension: 0.45,
                        fill: true,
                        backgroundColor: gradient,
                        borderColor: '#2563eb',
                        borderWidth: 2.5,
                        pointRadius: 2.5,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1.5,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#1d4ed8',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2.5,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#94a3b8' : '#475569',
                        borderColor: isDark ? '#1e293b' : '#e2e8f0',
                        borderWidth: 1,
                        padding: 10,
                        boxPadding: 4,
                        cornerRadius: 10,
                        titleFont: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 12,
                            weight: '700',
                        },
                        bodyFont: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 11,
                            weight: '500',
                        },
                        callbacks: {
                            label: (context) => ` ${context.parsed.y} Pengajuan`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: isDark ? '#64748b' : '#94a3b8',
                            font: {
                                family: "'Plus Jakarta Sans', sans-serif",
                                size: 10,
                                weight: '600',
                            },
                            padding: 6,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.9)',
                        },
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: isDark ? '#64748b' : '#94a3b8',
                            font: {
                                family: "'Plus Jakarta Sans', sans-serif",
                                size: 10,
                                weight: '600',
                            },
                            precision: 0,
                            padding: 6,
                        },
                    },
                },
            },
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [trend_bulanan]);

    // Helper: generate 2-letter initials (Standard.md Bab 6.1)
    const getInitials = (nama, fallback = 'OP') => {
        if (!nama) return fallback;
        const parts = String(nama).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const handleYearChange = (newYear) => {
        router.get(
            '/pimpinan/dashboard',
            { year: newYear },
            { preserveState: true, preserveScroll: true }
        );
    };

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((s) => (
            <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
            />
        ));
    };

    return (
        <AuthenticatedLayout>
            <Head title="PILKB - Dashboard" />

            <div className="space-y-6">
                {/* 1. Page Header (Standard.md Bab 4.1) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <BarChart2 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Dashboard
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Ringkasan kinerja pelayanan kepegawaian, pencapaian serta survei kepuasan BKPSDM Tahun {selected_year}.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        {/* Dropdown Pemilih Periode Tahun (Standard.md Bab 4.1 & Bab 4.3) */}
                        <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={selected_year}
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
{/* 
                        <Link
                            href="/pimpinan/kepuasan"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Star className="w-4 h-4" />
                            <span>Evaluasi Kepuasan</span>
                        </Link> */}
                    </div>
                </div>

                {/* 2. Kartu Ringkasan Statistik (Standard.md Bab 4.2 & Bab 5) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Total Usulan */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Total Usulan
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {metrics.total_usulan ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                Tahun {selected_year}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Usulan Selesai */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Usulan Selesai
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {metrics.total_selesai ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                                {metrics.pct_selesai ?? 0}%
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Rata-rata IKM */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Rata-Rata Indeks Kepuasan
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {metrics.avg_rating ?? 0}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                                {metrics.total_review ?? 0} Ulasan
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Rasio BTL */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Permintaan BTL
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {metrics.total_btl ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                                {metrics.ratio_btl ?? 0}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Tren Bulanan & Performa Per Bidang */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Widget Kiri: Tren Usulan Bulanan (Chart.js Area Line Chart) */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Tren Usulan (Tahun {selected_year})
                                </h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">
                                Januari - Desember
                            </span>
                        </div>

                        {trend_bulanan.length > 0 ? (
                            <div className="w-full h-56 sm:h-64 relative">
                                <canvas ref={chartCanvasRef} />
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <TrendingUp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum Ada Data Tren</h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    Data volume usulan bulanan akan muncul seiring proses pengajuan berjalan
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Widget Kanan: Performa Per Bidang */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/40">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Performa Per Bidang (Tahun {selected_year})
                                </h3>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">
                                Kinerja & Penyelesaian
                            </span>
                        </div>

                        {stat_per_bidang.length > 0 ? (
                            <div className="space-y-3.5">
                                {stat_per_bidang.map((item, idx) => {
                                    const pct = item.total > 0 ? Math.round((item.selesai / item.total) * 100) : 0;
                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs gap-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 flex-1 pr-2" title={item.bidang}>
                                                    {item.bidang}
                                                </span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-slate-500 font-medium">{item.selesai}/{item.total}</span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 min-w-[36px] text-right">{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                {item.total_review > 0 || item.avg_rating > 0 ? (
                                                    <>
                                                        <div className="flex items-center gap-0.5">
                                                            {renderStars(item.avg_rating)}
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                            {item.avg_rating}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            ({item.total_review ?? 0} ulasan)
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">
                                                        Belum ada survei kepuasan
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum Ada Data Bidang</h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    Data performa bidang akan muncul otomatis saat usulan diproses
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Top OPD Terbaik */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40">
                                <Award className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Daftar 10 OPD Usulan Terbanyak (Tahun {selected_year})
                            </h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-10">#</th>
                                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Nama OPD / Unit Kerja
                                    </th>
                                    <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Total Selesai
                                    </th>
                                    <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Total Usulan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
                                {top_opd.length > 0 ? (
                                    top_opd.map((opd, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-3 font-bold text-slate-400">
                                                {idx < 3 ? (
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black ${
                                                        idx === 0 ? 'bg-amber-100 text-amber-600' :
                                                        idx === 1 ? 'bg-slate-100 text-slate-600' :
                                                        'bg-orange-100 text-orange-600'
                                                    }`}>{idx + 1}</span>
                                                ) : (
                                                    <span className="pl-1.5">{idx + 1}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                        {getInitials(opd.nama_ukerja, 'OP')}
                                                    </div>
                                                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]" title={opd.nama_ukerja}>
                                                        {opd.nama_ukerja || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {opd.selesai ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                                                {opd.total ?? 0}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-16 px-4 text-center">
                                            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum ada data OPD</h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                Data akan muncul saat ada usulan yang telah selesai
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
