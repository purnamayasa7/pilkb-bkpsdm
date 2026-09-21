import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import AnnouncementSlider from '@/components/AnnouncementSlider';
import {
    Calendar,
    ArrowRight,
    CreditCard,
    Briefcase,
    Mail,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    Inbox,
    BarChart3,
    Activity,
} from 'lucide-react';

import Chart from 'chart.js/auto';

/**
 * DashboardClock
 * Sub-komponen jam digital terisolasi agar interval 1000ms hanya
 * me-render ulang teks jam kecil ini, tanpa membebani komponen utama Dashboard.
 */
function DashboardClock() {
    const [time, setTime] = useState('');
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            setDateStr(now.toLocaleDateString('id-ID', options));
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {dateStr || 'Memuat...'}
            </span>
            <span>•</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
                {time || '--:--'} WITA
            </span>
        </div>
    );
}

export default function Dashboard({
    auth,
    user: propUser,
    ket_ukerja,
    nip: propNip,
    email: propEmail,
    selectedDate,
    selectedMonthName,
    pengajuanHariIni = 0,
    pengajuanBulanIni = 0,
    btlBulanIni = 0,
    tiketArchives = 0,
    trendHariIni = {},
    trendPengajuan = {},
    trendBTL = {},
    trendTahap = {},
    chartBidangLabels = [],
    chartBidangData = [],
    chartTahunLabels = [],
    chartTahunData = [],
    pengajuanTerakhirOpd = [],
    permintaanTerakhirBidang = [],
    namaBidang = '',
    year,
    heroConfig = {},
}) {
    const user = propUser || auth?.user;
    const userNip = propNip || user?.nip || user?.username || '-';
    const userEmail = propEmail || user?.email || '-';
    const userUnitKerja = ket_ukerja || user?.instansi?.nama || '-';

    // Filter Month change handler
    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        router.get(
            '/dashboard',
            { bulan: newMonth },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Chart.js Area Chart Ref & Instance
    const areaChartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!areaChartRef.current) return;
        const ctx = areaChartRef.current.getContext('2d');
        if (!ctx) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');

        // Soft Blue Gradient Fill khas PILKB (persis seperti referensi)
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.16)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.005)');

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartTahunLabels,
                datasets: [
                    {
                        label: user?.role === 'bidang' && (namaBidang || user?.nama_bidang)
                            ? `Jumlah Pengajuan (${namaBidang || user?.nama_bidang})`
                            : 'Jumlah Pengajuan',
                        data: chartTahunData,
                        tension: 0.45, // Kurva bergelombang lembut dan mengalir alami
                        fill: true,
                        backgroundColor: gradient,
                        borderColor: '#3b82f6', // Biru cerah presisi
                        borderWidth: 2, // Garis ramping elegan
                        pointRadius: 0, // Titik tersembunyi agar grafik bersih seperti gambar
                        pointHoverRadius: 6, // Muncul halus saat kursor melintas
                        pointHoverBackgroundColor: '#2563eb',
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2.5,
                        pointHitRadius: 15,
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
                        padding: 12,
                        boxPadding: 4,
                        cornerRadius: 12,
                        titleFont: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 13,
                            weight: '700',
                        },
                        bodyFont: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 12,
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
                                size: 11,
                                weight: '600',
                            },
                            padding: 8,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        border: {
                            display: false,
                        },
                        grid: {
                            color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.85)',
                            borderDash: [4, 4],
                            drawTicks: false,
                        },
                        ticks: {
                            precision: 0,
                            color: isDark ? '#64748b' : '#94a3b8',
                            font: {
                                family: "'Plus Jakarta Sans', sans-serif",
                                size: 11,
                            },
                            padding: 12,
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
    }, [chartTahunData, chartTahunLabels, namaBidang, user?.nama_bidang]);

    const maxBidang = Math.max(...chartBidangData, 5);

    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard - PILKB" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* PAGE HEADER: Title, Live Date/Clock & Month Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[20px] sm:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Dashboard
                        </h1>
                        <DashboardClock />
                    </div>

                    {/* Month Picker Filter */}
                    <div className="flex items-center self-start sm:self-auto">
                        <div className="relative inline-flex items-center">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                            <input
                                type="month"
                                value={selectedDate || ''}
                                onChange={handleMonthChange}
                                className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                                title="Pilih Bulan Filter"
                            />
                        </div>
                    </div>
                </div>

                {/* BROADCAST ANNOUNCEMENT SLIDER */}
                <AnnouncementSlider />

                {/* HERO WELCOME CARD & USER INFO (Modern Wave Background) */}
                <div className="relative rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-slate-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs overflow-hidden">
                    {/* DECORATIVE BACKGROUND WAVE */}
                    <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden leading-none z-0">
                        <svg
                            className="w-full h-16 sm:h-20 lg:h-24 text-blue-100/60 dark:text-slate-800/40"
                            viewBox="0 0 1440 195"
                            fill="currentColor"
                            preserveAspectRatio="none"
                        >
                            <path d="M0,0h26.7C53.3,0,107,0,160,10.8c53.3,10.8,107,32.5,160,46.9c53.3,14.7,107,21.5,160,14.5 c53.3-7.2,107-28.9,160-32.5c53.3-3.9,107,11,160,32.5c53.3,21.9,107,50.3,160,50.5c53.3-0.2,107-28.6,160-46.9 c53.3-18.3,107-25.1,160-32.5c53.3-7.4,107-14.2,133-18.1l27-3.6V195h-26.7c-26.6,0-80.3,0-133.3,0c-53.3,0-107,0-160,0 c-53.3,0-107,0-160,0c-53.3,0-107,0-160,0c-53.3,0-107,0-160,0c-53.3,0-107,0-160,0c-53.3,0-107,0-160,0c-53.3,0-107,0-160,0 c-53.3,0-107,0-133,0H0V0z" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                        {/* Left: Greeting & Action */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Selamat datang, {user?.nama || 'Petugas'}!
                            </h2>

                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                                {heroConfig?.text ||
                                    'Silakan melakukan pengajuan dan monitoring usulan secara berkala untuk memastikan seluruh proses pelayanan berjalan dengan baik.'}
                            </p>

                            <div className="pt-2">
                                <a
                                    href={heroConfig?.url || '/dashboard'}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <span>{heroConfig?.button || 'Pengajuan Layanan'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Right: User Info Card (NIP, Unit Kerja, Email terbaca dari API/Database) */}
                        <div className="lg:col-span-5 xl:col-span-4">
                            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/60 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                                    <div>
                                        <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            Data Pengguna
                                        </h4>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-400">
                                            Informasi akun login
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 capitalize">
                                        {user?.role ? user.role.replace('_', ' ') : 'Petugas'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs">
                                    {/* NIP */}
                                    <div className="flex items-start gap-2.5">
                                        <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400">NIP</p>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {userNip}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Unit Kerja */}
                                    <div className="flex items-start gap-2.5">
                                        <Briefcase className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400">Unit Kerja</p>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {userUnitKerja}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-2.5">
                                        <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400">Email</p>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {userEmail}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4 STATISTIC METRIC CARDS (Responsive: 1 col mobile, 2 cols tablet/iPad, 4 cols desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Card 1: Hari Ini */}
                    <div className="p-5 rounded-2xl border border-blue-300/80 dark:border-blue-800/80 bg-gradient-to-r from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Pengajuan Hari Ini
                            </p>
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {pengajuanHariIni.toLocaleString('id-ID')}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs">
                                <span
                                    className={`inline-flex items-center font-bold ${
                                        trendHariIni?.class === 'success'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : trendHariIni?.class === 'danger'
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {trendHariIni?.jumlah || 0}
                                </span>
                                <span className="text-slate-400 text-[11px]">Dibanding kemarin</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 2: Bulan Ini */}
                    <div className="p-5 rounded-2xl border border-indigo-300/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Pengajuan Bulan Ini
                            </p>
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {pengajuanBulanIni.toLocaleString('id-ID')}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs">
                                <span
                                    className={`inline-flex items-center font-bold ${
                                        trendPengajuan?.class === 'success'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : trendPengajuan?.class === 'danger'
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {trendPengajuan?.jumlah || 0}
                                </span>
                                <span className="text-slate-400 text-[11px]">Dibanding bulan lalu</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-900/40 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 3: BTL Bulan Ini */}
                    <div className="p-5 rounded-2xl border border-rose-300/80 dark:border-rose-800/80 bg-gradient-to-r from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                Jumlah BTL Bulan Ini
                            </p>
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {btlBulanIni.toLocaleString('id-ID')}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs">
                                <span
                                    className={`inline-flex items-center font-bold ${
                                        trendBTL?.class === 'success'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : trendBTL?.class === 'danger'
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {trendBTL?.jumlah || 0}
                                </span>
                                <span className="text-slate-400 text-[11px]">Dibanding bulan lalu</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 4: Selesai Diproses */}
                    <div className="p-5 rounded-2xl border border-emerald-300/80 dark:border-emerald-800/80 bg-gradient-to-r from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Tiket Selesai Diproses
                            </p>
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {tiketArchives.toLocaleString('id-ID')}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs">
                                <span
                                    className={`inline-flex items-center font-bold ${
                                        trendTahap?.class === 'success'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : trendTahap?.class === 'danger'
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {trendTahap?.jumlah || 0}
                                </span>
                                <span className="text-slate-400 text-[11px]">Dibanding bulan lalu</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: TIMELINE (OR BIDANG BAR CHART) & TAHUNAN AREA CHART */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Render berbeda per role */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        {user?.role === 'admin_opd' ? (
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col h-full">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span>Pengajuan Terakhir</span>
                                    </h3>
                                    <a
                                        href="/adminOpd/tiket"
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>Lihat Semua</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>

                                {pengajuanTerakhirOpd.length > 0 ? (
                                    <div className="space-y-4 flex-1">
                                        {pengajuanTerakhirOpd.map((tiket, idx) => {
                                            const statusLower = (tiket.status || '').toLowerCase();
                                            const isDone =
                                                statusLower.includes('selesai') ||
                                                statusLower.includes('diterima') ||
                                                tiket.archives === 1;
                                            const isBad =
                                                statusLower.includes('btl') ||
                                                statusLower.includes('tolak') ||
                                                statusLower.includes('batal');
                                            const isWarning =
                                                statusLower.includes('perbaikan') ||
                                                statusLower.includes('revisi');

                                            return (
                                                <div key={idx} className="relative pl-6 pb-2 group">
                                                    {idx !== pengajuanTerakhirOpd.length - 1 && (
                                                        <span className="absolute left-2 top-3 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />
                                                    )}
                                                    <span
                                                        className={`absolute left-0.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                                            isDone
                                                                ? 'bg-emerald-500'
                                                                : isBad
                                                                ? 'bg-rose-500'
                                                                : isWarning
                                                                ? 'bg-amber-500'
                                                                : 'bg-blue-600'
                                                        }`}
                                                    />

                                                    <div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <a
                                                                href={`/cek-tiket/${tiket.no_tiket}`}
                                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline"
                                                            >
                                                                #{tiket.no_tiket}
                                                            </a>
                                                            <span
                                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                                    isDone
                                                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200'
                                                                        : isBad
                                                                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200'
                                                                        : isWarning
                                                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200'
                                                                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border-blue-200'
                                                                }`}
                                                            >
                                                                {tiket.status}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                                                            {tiket.layanan}
                                                        </p>

                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                                                            <span>{tiket.nama || tiket.nip || '-'}</span>
                                                            <span title={tiket.tanggal_lengkap}>
                                                                {tiket.tanggal}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 flex-1 flex flex-col items-center justify-center">
                                        <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                                        <p className="text-xs">Belum ada riwayat pengajuan usulan.</p>
                                    </div>
                                )}
                            </div>
                        ) : user?.role === 'bidang' ? (
                            /* Timeline Permintaan Masuk Terbaru untuk Role Bidang */
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col h-full">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        <span>Permintaan Masuk Terbaru</span>
                                    </h3>
                                    <a
                                        href="/adminBidang/permintaan"
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>Lihat Semua</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>

                                {permintaanTerakhirBidang.length > 0 ? (
                                    <div className="space-y-4 flex-1">
                                        {permintaanTerakhirBidang.slice(0, 4).map((tiket, idx, arr) => {
                                            const statusLower = (tiket.status || '').toLowerCase();
                                            const isDone =
                                                statusLower.includes('selesai') ||
                                                statusLower.includes('diterima') ||
                                                tiket.archives === 1;
                                            const isBad =
                                                statusLower.includes('btl') ||
                                                statusLower.includes('tolak') ||
                                                statusLower.includes('batal');
                                            const isWarning =
                                                statusLower.includes('perbaikan') ||
                                                statusLower.includes('revisi');

                                            return (
                                                <div key={idx} className="relative pl-6 pb-2 group">
                                                    {idx !== arr.length - 1 && (
                                                        <span className="absolute left-2 top-3 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />
                                                    )}
                                                    <span
                                                        className={`absolute left-0.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                                            isDone
                                                                ? 'bg-emerald-500'
                                                                : isBad
                                                                ? 'bg-rose-500'
                                                                : isWarning
                                                                ? 'bg-amber-500'
                                                                : 'bg-blue-600'
                                                        }`}
                                                    />

                                                    <div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                                #{tiket.no_tiket}
                                                            </span>
                                                            <span
                                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                                    isDone
                                                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200'
                                                                        : isBad
                                                                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200'
                                                                        : isWarning
                                                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200'
                                                                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border-blue-200'
                                                                }`}
                                                            >
                                                                {tiket.status}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                                                            {tiket.layanan}
                                                        </p>

                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                                                            <span>{tiket.nama || tiket.nip || '-'}</span>
                                                            <span title={tiket.tanggal_lengkap}>
                                                                {tiket.tanggal}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 flex-1 flex flex-col items-center justify-center">
                                        <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                                        <p className="text-xs">Belum ada permintaan masuk saat ini.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Bar Chart Pengajuan Per Bidang (Non OPD, Non Bidang) */
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col h-full">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-blue-600" />
                                        <span>Pengajuan Per Bidang</span>
                                    </h3>
                                    <span className="text-xs text-slate-400">Tahun {year}</span>
                                </div>

                                <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                                    {chartBidangLabels.map((label, idx) => {
                                        const count = chartBidangData[idx] || 0;
                                        const percentage = Math.round((count / maxBidang) * 100);
                                        return (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    <span>{label}</span>
                                                    <span className="font-mono text-blue-600 dark:text-blue-400">
                                                        {count.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                                                        style={{ width: `${Math.max(percentage, 4)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Soft Curved Chart.js Area Chart */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
                                        <Activity className="w-4 h-4 text-blue-600" />
                                        <span>Tren Pengajuan Tahun {year}</span>
                                        {user?.role === 'bidang' && (namaBidang || user?.nama_bidang) && (
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                                                {namaBidang || user?.nama_bidang}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {user?.role === 'bidang' && (namaBidang || user?.nama_bidang)
                                            ? `Grafik rekapitulasi volume pengajuan usulan per bulan`
                                            : 'Grafik rekapitulasi volume pengajuan usulan per bulan'}
                                    </p>
                                </div>
                                {/* <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                    <span>Tahun {year}</span>
                                </span> */}
                            </div>

                            {/* Chart.js Smooth Canvas Container (Responsive on iPad & Mobile) */}
                            <div className="flex-1 w-full min-h-[260px] sm:min-h-[280px] relative">
                                <canvas ref={areaChartRef} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
