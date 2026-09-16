import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import {
    PackageCheck,
    Search,
    Calendar,
    Layers,
    ChevronDown,
    Copy,
    Check,
    RotateCcw,
    Printer,
    History,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    PlusCircle,
    FileText,
    UserCheck,
    Phone,
    X,
    Loader2,
} from 'lucide-react';

export default function Index({
    pengambilan = [],
    year = new Date().getFullYear(),
    availableYears = [],
    layananList = [],
    selectedLayanan = '',
}) {
    const { auth, flash = {} } = usePage().props;

    // State Filter & Pencarian
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState(year);
    const [currentLayanan, setCurrentLayanan] = useState(selectedLayanan || 'ALL');

    // Paginasi & Salin Tiket
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTiketHistory, setSelectedTiketHistory] = useState(null);

    // Modal Tambah Pengambilan
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [formNoTiket, setFormNoTiket] = useState('');
    const [formNamaPengambil, setFormNamaPengambil] = useState('');
    const [formNoHp, setFormNoHp] = useState('');
    const [checkingTiket, setCheckingTiket] = useState(false);
    const [tiketCheckResult, setTiketCheckResult] = useState(null);
    const [tiketCheckError, setTiketCheckError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Salin nomor tiket
    const handleCopyTiket = (noTiket) => {
        if (!noTiket) return;
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => setCopiedTiket(null), 2000);
    };

    // Format Tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(d);
        } catch {
            return dateStr;
        }
    };

    // Inisial Avatar Bulat Slate
    const getInitials = (name) => {
        if (!name) return 'BK';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    // Navigasi Ganti Tahun
    const handleYearChange = (newYear) => {
        setSelectedYear(newYear);
        setCurrentPage(1);
        router.get(
            '/adminBawah/pengambilan',
            {
                year: newYear,
                layanan: currentLayanan !== 'ALL' ? currentLayanan : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Reset Semua Filter
    const handleResetFilters = () => {
        setSearchQuery('');
        setCurrentLayanan('ALL');
        setCurrentPage(1);
        if (selectedYear !== new Date().getFullYear()) {
            handleYearChange(new Date().getFullYear());
        }
    };

    // Cek Tiket di Modal Tambah Pengambilan
    const handleCekTiket = async () => {
        const noTiket = formNoTiket.trim();
        if (!noTiket) {
            setTiketCheckError('Silakan masukkan nomor tiket terlebih dahulu.');
            return;
        }

        setCheckingTiket(true);
        setTiketCheckError('');
        setTiketCheckResult(null);

        try {
            const res = await fetch(`/adminBawah/pengambilan/cek-tiket/${encodeURIComponent(noTiket)}`);
            const data = await res.json();

            if (data.success) {
                setTiketCheckResult(data);
                // Pre-fill nama pengambil jika ada nama penerima/pemohon
                if (!formNamaPengambil && (data.nama_penerima || data.nama)) {
                    setFormNamaPengambil(data.nama_penerima || data.nama);
                }
                if (!formNoHp && data.no_hp) {
                    setFormNoHp(data.no_hp);
                }
            } else {
                setTiketCheckError(data.message || 'Nomor tiket tidak valid atau sudah diambil.');
            }
        } catch (err) {
            console.error(err);
            setTiketCheckError('Gagal memverifikasi nomor tiket. Silakan coba lagi.');
        } finally {
            setCheckingTiket(false);
        }
    };

    // Submit Tambah Pengambilan
    const handleSubmitPengambilan = (e) => {
        e.preventDefault();
        if (!formNoTiket || !formNamaPengambil) return;

        setSubmitting(true);
        router.post(
            '/adminBawah/pengambilan/store',
            {
                no_tiket: formNoTiket.trim(),
                nama_pengambil: formNamaPengambil.trim(),
                no_hp: formNoHp.trim() || null,
            },
            {
                onSuccess: () => {
                    setCreateModalOpen(false);
                    setFormNoTiket('');
                    setFormNamaPengambil('');
                    setFormNoHp('');
                    setTiketCheckResult(null);
                    setTiketCheckError('');
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    // Reset Form Modal
    const handleCloseModal = () => {
        setCreateModalOpen(false);
        setFormNoTiket('');
        setFormNamaPengambil('');
        setFormNoHp('');
        setTiketCheckResult(null);
        setTiketCheckError('');
    };

    // Hitung Metrik Statistik (Standard.md Bagian 5)
    const counts = useMemo(() => {
        let total = pengambilan.length;
        let bulanIni = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYearNum = now.getFullYear();
        const layananSet = new Set();

        pengambilan.forEach((p) => {
            if (p.tanggal_pengambilan) {
                const d = new Date(p.tanggal_pengambilan);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYearNum) {
                    bulanIni++;
                }
            }
            if (p.tiket?.kode_layanan) {
                layananSet.add(p.tiket.kode_layanan);
            }
        });

        return {
            total,
            bulanIni,
            layananTerlayani: layananSet.size,
        };
    }, [pengambilan]);

    // Filter Data Berdasarkan Pencarian & Layanan
    const filteredPengambilan = useMemo(() => {
        return pengambilan.filter((item) => {
            // 1. Search Query
            const query = searchQuery.toLowerCase().trim();
            if (query) {
                const matchQuery =
                    (item.tiket?.no_tiket && item.tiket.no_tiket.toLowerCase().includes(query)) ||
                    (item.tiket?.nip && item.tiket.nip.toLowerCase().includes(query)) ||
                    (item.tiket?.nama && item.tiket.nama.toLowerCase().includes(query)) ||
                    (item.tiket?.nama_ukerja && item.tiket.nama_ukerja.toLowerCase().includes(query)) ||
                    (item.nama_pengambil && item.nama_pengambil.toLowerCase().includes(query)) ||
                    (item.tiket?.layanan?.nama_layanan && item.tiket.layanan.nama_layanan.toLowerCase().includes(query));
                if (!matchQuery) return false;
            }

            // 2. Filter Layanan
            if (currentLayanan !== 'ALL' && item.tiket?.kode_layanan != currentLayanan) {
                return false;
            }

            return true;
        });
    }, [pengambilan, searchQuery, currentLayanan]);

    // Data Terpaginasi
    const totalPages = Math.ceil(filteredPengambilan.length / perPage) || 1;
    const paginatedPengambilan = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredPengambilan.slice(start, start + perPage);
    }, [filteredPengambilan, currentPage, perPage]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="PILKB - Pengambilan Berkas" />

            {/* Container Baku Standard.md (space-y-6 lebar penuh tanpa batasan max-w) */}
            <div className="space-y-6">

                {/* 1. PAGE HEADER (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <PackageCheck className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Pengambilan Berkas
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Pencatatan dan arsip bukti pengambilan fisik berkas layanan kepegawaian yang telah selesai diproses.
                        </p>
                    </div>

                    {/* Tombol Header Standard.md Bagian 4 Poin 1 (py-2.5 text-xs font-semibold) */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Tambah Pengambilan</span>
                        </button>

                        <a
                            href={`/adminBawah/pengambilan/export-pdf?year=${selectedYear}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>Export PDF</span>
                        </a>
                    </div>
                </div>

                {/* 2. STATS METRIC CHIPS CARDS (Bagian 4 Poin 2 & Bagian 5 Standard.md) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Total Pengambilan */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Pengambilan ({selectedYear})
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {counts.total}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                Berkas
                            </span>
                        </div>
                    </div>

                    {/* Pengambilan Bulan Ini */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Bulan Ini
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {counts.bulanIni}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                Selesai
                            </span>
                        </div>
                    </div>

                    {/* Layanan Terlayani */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Layanan Terlayani
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {counts.layananTerlayani}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                Layanan
                            </span>
                        </div>
                    </div>

                    {/* Status Serah Terima */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Status Pengambilan
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                100%
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                Terverifikasi
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. CARD TOOLBAR FILTER TERPADU (Bagian 4 Poin 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        {/* Search Input */}
                        <div className="lg:col-span-5">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari No Tiket, NIP, Nama, Pengambil, SKPD..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Tahun Pengambilan */}
                        <div className="lg:col-span-3">
                            <div className="relative">
                                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={selectedYear}
                                    onChange={(e) => handleYearChange(Number(e.target.value))}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    {availableYears.map((y) => (
                                        <option key={y} value={y}>
                                            Tahun {y}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filter Layanan */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={currentLayanan}
                                    onChange={(e) => {
                                        setCurrentLayanan(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer truncate"
                                >
                                    <option value="ALL">Semua Layanan</option>
                                    {layananList.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Per-Page Selector */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                                >
                                    <option value={10}>10 per hal</option>
                                    <option value={25}>25 per hal</option>
                                    <option value={50}>50 per hal</option>
                                    <option value={100}>100 per hal</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. CARD TABEL DATA TUNGGAL (Bagian 4 Poin 4 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-4 py-3.5 w-12 text-center">No</th>
                                    <th className="px-4 py-3.5 w-36">No. Tiket</th>
                                    <th className="px-4 py-3.5 min-w-[200px]">Pemohon</th>
                                    <th className="px-4 py-3.5 min-w-[200px]">Layanan</th>
                                    <th className="px-4 py-3.5 min-w-[160px]">Pengambil Berkas</th>
                                    <th className="px-4 py-3.5 w-36">Tanggal Diambil</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Status</th>
                                    <th className="px-4 py-3.5 w-28 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                {paginatedPengambilan.length === 0 ? (
                                    /* Standar Empty State (Bagian 8 Standard.md) */
                                    <tr>
                                        <td colSpan={8} className="py-16 px-4 text-center">
                                            <PackageCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Tidak Ada Data Pengambilan
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || currentLayanan !== 'ALL'
                                                    ? 'Tidak ditemukan data pengambilan yang cocok dengan kriteria filter Anda.'
                                                    : `Belum ada catatan pengambilan berkas fisik pada tahun ${selectedYear}.`}
                                            </p>
                                            {(searchQuery || currentLayanan !== 'ALL') && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilters}
                                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    <span>Reset Filter</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPengambilan.map((item, idx) => {
                                        const globalIndex = (currentPage - 1) * perPage + idx + 1;
                                        const tiketItem = item.tiket || {};
                                        const initials = getInitials(tiketItem.nama || tiketItem.nip || 'ASN');

                                        return (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                {/* No */}
                                                <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-[11px]">
                                                    {globalIndex}
                                                </td>

                                                {/* No Tiket */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-xs">
                                                            {tiketItem.no_tiket || item.no_tiket}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyTiket(tiketItem.no_tiket || item.no_tiket)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                            title="Salin Nomor Tiket"
                                                        >
                                                            {copiedTiket === (tiketItem.no_tiket || item.no_tiket) ? (
                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Kolom Pegawai (Bagian 6 Poin 1 Standard.md) */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        {/* Avatar Bulat Slate Standar */}
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div
                                                                className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]"
                                                                title={tiketItem.nama || '-'}
                                                            >
                                                                {tiketItem.nama || '-'}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-slate-400">
                                                                {tiketItem.nip || '-'}
                                                            </div>
                                                            {tiketItem.nama_ukerja && (
                                                                <div
                                                                    className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]"
                                                                    title={tiketItem.nama_ukerja}
                                                                >
                                                                    {tiketItem.nama_ukerja}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Kolom Layanan (Bagian 6 Poin 2 Standard.md) */}
                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px] block"
                                                        title={tiketItem.layanan?.nama_layanan || '-'}
                                                    >
                                                        {tiketItem.layanan?.nama_layanan || '-'}
                                                    </span>
                                                </td>

                                                {/* Pengambil Berkas */}
                                                <td className="px-4 py-3.5">
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                                                            {item.nama_pengambil || '-'}
                                                        </div>
                                                        {item.no_hp && (
                                                            <div className="text-[11px] font-mono text-slate-400">
                                                                {item.no_hp}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Tanggal Pengambilan */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                    {formatDate(item.tanggal_pengambilan)}
                                                </td>

                                                {/* Status Diambil */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Sudah Diambil</span>
                                                    </span>
                                                </td>

                                                {/* Kolom Aksi (Bagian 6 Poin 3 Standard.md) */}
                                                <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* 1. Riwayat Tahapan (Icon History / Eye: Biru) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedTiketHistory(tiketItem);
                                                                setHistoryModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                            title="Riwayat Tahapan Usulan"
                                                        >
                                                            <History className="w-4 h-4" />
                                                        </button>

                                                        {/* 2. Cetak Tiket (Icon Printer: Orange/Amber) */}
                                                        <a
                                                            href={`/tiket/cetak/${encodeURIComponent(tiketItem.no_tiket || item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                                            title="Cetak Tiket"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </a>

                                                        {/* 3. Tracking Publik (Icon ExternalLink: Slate / Biru) */}
                                                        <a
                                                            href={`/cek-tiket/${encodeURIComponent(tiketItem.no_tiket || item.no_tiket)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                            title="Tracking Berkas Publik"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Komponen Paginasi Bersama (Bagian 7 Standard.md) */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                        totalItems={filteredPengambilan.length}
                        perPage={perPage}
                    />
                </div>
            </div>

            {/* Modal Tambah Pengambilan */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <PackageCheck className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Catat Pengambilan Berkas
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Pencatatan penyerahan fisik berkas kepada pemohon.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitPengambilan} className="p-5 space-y-4">
                            {/* Input No Tiket & Tombol Cek */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nomor Tiket Usulan <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Contoh: TIKET-..."
                                        value={formNoTiket}
                                        onChange={(e) => {
                                            setFormNoTiket(e.target.value.toUpperCase());
                                            setTiketCheckResult(null);
                                            setTiketCheckError('');
                                        }}
                                        required
                                        className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCekTiket}
                                        disabled={checkingTiket || !formNoTiket.trim()}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                                    >
                                        {checkingTiket ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Search className="w-3.5 h-3.5" />
                                        )}
                                        <span>Cek Tiket</span>
                                    </button>
                                </div>

                                {/* Pesan Error Cek */}
                                {tiketCheckError && (
                                    <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{tiketCheckError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Preview Hasil Cek Tiket */}
                            {tiketCheckResult && (
                                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-blue-900 dark:text-blue-300">
                                            Data Tiket Terverifikasi
                                        </span>
                                        <span className="font-mono text-[11px] text-blue-700 dark:text-blue-400">
                                            {tiketCheckResult.no_tiket}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 pt-1 border-t border-blue-200/60 dark:border-blue-900/40 text-[11px]">
                                        <div>
                                            <span className="text-slate-400 block">Pemohon:</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {tiketCheckResult.nama}
                                            </span>
                                            <span className="block font-mono text-slate-400">{tiketCheckResult.nip}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Layanan:</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                                                {tiketCheckResult.layanan}
                                            </span>
                                        </div>
                                    </div>
                                    {tiketCheckResult.ukerja && (
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                            <span className="text-slate-400">Unit Kerja: </span>
                                            {tiketCheckResult.ukerja}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Input Nama Pengambil */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nama Pengambil Berkas <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Nama lengkap yang mengambil berkas fisik"
                                        value={formNamaPengambil}
                                        onChange={(e) => setFormNamaPengambil(e.target.value)}
                                        required
                                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Input No HP Pengambil */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nomor Telepon / WhatsApp Pengambil (Opsional)
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Contoh: 081234567890"
                                        value={formNoHp}
                                        onChange={(e) => setFormNoHp(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !formNoTiket || !formNamaPengambil}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{submitting ? 'Menyimpan...' : 'Simpan Pengambilan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Riwayat Tahapan Usulan (Bagian 7 Standard.md) */}
            <RiwayatTahapanModal
                isOpen={historyModalOpen}
                onClose={() => {
                    setHistoryModalOpen(false);
                    setSelectedTiketHistory(null);
                }}
                tiket={selectedTiketHistory}
            />
        </AuthenticatedLayout>
    );
}
