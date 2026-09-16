import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import {
    FileText,
    Download,
    Printer,
    Calendar,
    Filter,
    RotateCcw,
    Building2,
    CheckCircle2,
    AlertTriangle,
    Star,
    History,
    Search,
    ChevronDown
} from 'lucide-react';

export default function LaporanIndex({
    metrics = {},
    usulan = {},
    bidangList = [],
    layananList = [],
    filters = {}
}) {
    // Local filter state
    const [selectedBidang, setSelectedBidang] = useState(filters.bidang || 'all');
    const [selectedLayanan, setSelectedLayanan] = useState(filters.layanan || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [startDate, setStartDate] = useState(filters.tanggal_awal || '');
    const [endDate, setEndDate] = useState(filters.tanggal_akhir || '');

    // Modal Riwayat
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Filter Layanan options by Bidang
    const filteredLayananOptions = selectedBidang === 'all'
        ? layananList
        : layananList.filter((l) => String(l.kode_bidang) === String(selectedBidang));

    // Handle Bidang Change
    const handleBidangChange = (newBidang) => {
        setSelectedBidang(newBidang);
        setSelectedLayanan('all');
    };

    // Apply Filter Function
    const handleApplyFilter = () => {
        router.get(
            '/pimpinan/laporan',
            {
                bidang: selectedBidang,
                layanan: selectedLayanan,
                status: selectedStatus,
                tanggal_awal: startDate,
                tanggal_akhir: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSelectedBidang('all');
        setSelectedLayanan('all');
        setSelectedStatus('all');
        setStartDate('');
        setEndDate('');
        router.get('/pimpinan/laporan', {}, { preserveState: true, preserveScroll: true });
    };

    // Export PDF URL Builder
    const getPdfUrl = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('tanggal_awal', startDate);
        if (endDate) params.append('tanggal_akhir', endDate);
        if (selectedBidang !== 'all') params.append('bidang', selectedBidang);
        if (selectedLayanan !== 'all') params.append('layanan', selectedLayanan);
        if (selectedStatus !== 'all') params.append('status', selectedStatus);
        return `/pimpinan/laporan/export-pdf?${params.toString()}`;
    };

    const getInitials = (name, fallback = 'P') => {
        if (!name || name === '-') return fallback;
        const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return fallback;
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const usulanData = usulan.data || [];

    return (
        <AuthenticatedLayout>
            <Head title="PILKB - Laporan" />

            <div className="space-y-6">
                {/* 1. Header (Standard.md Bab 4.1) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <FileText className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Laporan Pelayanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Rekapitulasi data usulan layanan, persentase penyelesaian, dan indikator kepuasan siap cetak.
                        </p>
                    </div>

                    {/* Tombol Aksi Ekspor */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        <a
                            href={getPdfUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            title="Unduh Laporan Format PDF"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export PDF</span>
                        </a>
                    </div>
                </div>

                {/* 2. Kartu Ringkasan Metrik KPI Periode Ini (Standard.md Bab 4.2 & Bab 5) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1: Total Usulan Masuk */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Total Usulan Masuk
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {metrics.total_usulan ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                Periode Terpilih
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Usulan Selesai */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Usulan Selesai
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {metrics.total_selesai ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                                {metrics.pct_selesai ?? 0}% Selesai
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Rasio BTL */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Permintaan Perbaikan (BTL)
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {metrics.total_btl ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                                {metrics.ratio_btl ?? 0}% Rasio
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Rata-Rata IKM */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Rata-Rata Kepuasan
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-amber-500">
                                    {metrics.avg_rating ?? 0}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>IKM</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Filter Panel Kustom (Standard.md Card) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Filter className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Parameter Filter Laporan
                            </h3>
                        </div>
                        <button
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Filter</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Tanggal Awal */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Tanggal Awal
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Tanggal Akhir */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter Bidang */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Bidang Kepegawaian
                            </label>
                            <select
                                value={selectedBidang}
                                onChange={(e) => handleBidangChange(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Semua Bidang</option>
                                {bidangList.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.nama_bidang ?? b.name ?? b.id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Layanan */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Jenis Layanan
                            </label>
                            <select
                                value={selectedLayanan}
                                onChange={(e) => setSelectedLayanan(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Semua Layanan</option>
                                {filteredLayananOptions.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.nama_layanan}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        {/* Filter Status Usulan */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-400">Status:</span>
                            <div className="flex items-center gap-1">
                                {[
                                    { key: 'all', label: 'Semua' },
                                    { key: 'selesai', label: 'Selesai' },
                                    { key: 'proses', label: 'Dalam Proses' },
                                    { key: 'btl', label: 'Perbaikan (BTL)' },
                                ].map((st) => (
                                    <button
                                        key={st.key}
                                        type="button"
                                        onClick={() => setSelectedStatus(st.key)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                            selectedStatus === st.key
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => handleApplyFilter()}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer self-end sm:self-auto"
                        >
                            Terapkan Filter Laporan
                        </button>
                    </div>
                </div>

                {/* 5. Tabel Data Laporan Usulan */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Rekapitulasi Usulan Pelayanan ({usulan.total ?? usulanData.length})
                            </h3>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-400">
                            Periode: {formatDate(filters.tanggal_awal)} s/d {formatDate(filters.tanggal_akhir)}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-5 py-3.5">No. Tiket</th>
                                    <th className="px-5 py-3.5">Pegawai Pemohon</th>
                                    <th className="px-5 py-3.5">Unit Kerja (OPD)</th>
                                    <th className="px-5 py-3.5">Jenis Layanan</th>
                                    <th className="px-5 py-3.5">Bidang</th>
                                    <th className="px-5 py-3.5">Tanggal Masuk</th>
                                    <th className="px-5 py-3.5">Status Layanan</th>
                                    <th className="px-5 py-3.5 text-right">Alur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {usulanData.length > 0 ? (
                                    usulanData.map((item) => (
                                        <tr
                                            key={item.no_tiket}
                                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                {item.no_tiket}
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5 min-w-[170px]">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                        {getInitials(item.nama)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]" title={item.nama || '-'}>
                                                            {item.nama || '-'}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-slate-400">
                                                            NIP. {item.nip || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 max-w-[180px]">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[180px]" title={item.nama_ukerja || '-'}>
                                                    {item.nama_ukerja || '-'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-3.5 max-w-[200px]">
                                                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[200px]" title={item.layanan?.nama_layanan || '-'}>
                                                    {item.layanan?.nama_layanan || '-'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                                                {item.layanan?.bidang?.nama_bidang || '-'}
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                                                {formatDate(item.tanggal)}
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {item.archives == 1 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        <span>Selesai</span>
                                                    </span>
                                                ) : item.diperbaiki == 1 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60">
                                                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                                                        <span>Perbaikan (BTL)</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60">
                                                        {item.tahap_terakhir?.status_rel?.status || 'Dalam Proses'}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTiketHistory(item.no_tiket);
                                                        setHistoryModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                    title="Lihat Kronologi Riwayat Tahapan"
                                                >
                                                    <History className="w-3.5 h-3.5" />
                                                    <span>Alur</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-16 px-4 text-center">
                                            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Tidak Ada Data Usulan
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                Tidak ada rekaman usulan layanan pada rentang tanggal dan parameter filter yang dipilih.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Sesuai Standard.md Bab 7 */}
                    <Pagination
                        pagination={usulan}
                        onPageChange={(page) => {
                            router.get(
                                '/pimpinan/laporan',
                                {
                                    preset: selectedPreset,
                                    bidang: selectedBidang,
                                    layanan: selectedLayanan,
                                    status: selectedStatus,
                                    tanggal_awal: startDate,
                                    tanggal_akhir: endDate,
                                    page,
                                },
                                { preserveState: true, preserveScroll: true }
                            );
                        }}
                    />
                </div>
            </div>

            {/* Modal Riwayat Tahapan */}
            {selectedTiketHistory && (
                <RiwayatTahapanModal
                    isOpen={historyModalOpen}
                    onClose={() => {
                        setHistoryModalOpen(false);
                        setSelectedTiketHistory(null);
                    }}
                    noTiket={selectedTiketHistory}
                />
            )}
        </AuthenticatedLayout>
    );
}
