import React, { useState, useMemo, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    FileText,
    Download,
    Search,
    ChevronDown,
    Building2,
    Briefcase,
    RotateCcw,
    X,
    CheckCircle2,
    Layers,
    ExternalLink
} from 'lucide-react';

export default function Index({
    syarat: syaratProp = [],
    bidang = [],
    allLayanan = [],
    bidangId = null,
    layanan = [],
    layananId = null,
    selectedLayanan: selectedLayananProp = null,
}) {
    const { auth } = usePage().props;

    // Filter states
    const [currentBidang, setCurrentBidang] = useState(bidangId || '');
    const [currentLayanan, setCurrentLayanan] = useState(layananId || '');
    const [layananOptions, setLayananOptions] = useState(layanan || []);

    // Syarat data — dikelola lokal agar tidak perlu reload halaman
    const [syaratData, setSyaratData] = useState(syaratProp || []);
    const [selectedLayanan, setSelectedLayanan] = useState(selectedLayananProp || null);
    const [loadingSyarat, setLoadingSyarat] = useState(false);

    // Client-side search & pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Sync state ketika props berubah (misal navigasi back)
    useEffect(() => {
        setCurrentBidang(bidangId || '');
        setCurrentLayanan(layananId || '');
        setLayananOptions(layanan || []);
        setSyaratData(syaratProp || []);
        setSelectedLayanan(selectedLayananProp || null);
        setCurrentPage(1);
    }, [bidangId, layananId]);

    // Handle Bidang Change — murni client-side, TIDAK ada reload halaman
    const handleBidangChange = (newBidangId) => {
        setCurrentBidang(newBidangId);
        setCurrentLayanan('');
        setSyaratData([]);
        setSelectedLayanan(null);
        setCurrentPage(1);
        setSearchQuery('');
        // Filter layanan dari allLayanan tanpa navigate
        const filtered = (allLayanan || []).filter(
            (l) => String(l.kode_bidang) === String(newBidangId)
        );
        setLayananOptions(filtered);
    };

    // Handle Layanan Change — fetch syarat via API, TIDAK ada reload halaman
    const handleLayananChange = (newLayananId) => {
        setCurrentLayanan(newLayananId);
        setCurrentPage(1);
        setSearchQuery('');

        const layananSelected = (layananOptions || []).find(
            (l) => String(l.id) === String(newLayananId)
        );
        setSelectedLayanan(layananSelected || null);

        if (!newLayananId) {
            setSyaratData([]);
            return;
        }

        setLoadingSyarat(true);
        fetch(`/adminOpd/get-syarat-by-layanan/${newLayananId}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat data syarat');
                return res.json();
            })
            .then((data) => {
                setSyaratData(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setSyaratData([]);
            })
            .finally(() => {
                setLoadingSyarat(false);
            });
    };

    // Handle Reset — hanya clear state lokal
    const handleResetFilter = () => {
        setCurrentBidang('');
        setCurrentLayanan('');
        setLayananOptions([]);
        setSyaratData([]);
        setSelectedLayanan(null);
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Filtered Syarat based on client search
    const filteredSyarat = useMemo(() => {
        if (!searchQuery.trim()) return syaratData;
        const q = searchQuery.toLowerCase().trim();
        return syaratData.filter((item) => {
            const namaSyarat = (item.syarat || '').toLowerCase();
            const deskripsi = (item.deskripsi || '').toLowerCase();
            const namaLayanan = (item.layanan?.nama_layanan || '').toLowerCase();
            return namaSyarat.includes(q) || deskripsi.includes(q) || namaLayanan.includes(q);
        });
    }, [syaratData, searchQuery]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredSyarat.length / perPage) || 1;
    const paginatedSyarat = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredSyarat.slice(start, start + perPage);
    }, [filteredSyarat, currentPage, perPage]);

    const hasSelectedLayanan = Boolean(currentBidang && currentLayanan);

    // Export PDF URL
    const exportPdfUrl = hasSelectedLayanan
        ? `/adminOpd/cetakSyarat/export?bidang=${encodeURIComponent(currentBidang)}&layanan=${encodeURIComponent(currentLayanan)}`
        : '#';

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Cetak Syarat Layanan - PILKB" />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <FileText className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Cetak Syarat Layanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            {hasSelectedLayanan && selectedLayanan ? (
                                <>
                                    Persyaratan resmi untuk layanan{' '}
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {selectedLayanan.nama_layanan}
                                    </span>
                                </>
                            ) : (
                                'Lihat dan cetak dokumen persyaratan layanan kepegawaian dalam format PDF.'
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        {/* Tombol Export PDF Header */}
                        <a
                            href={exportPdfUrl}
                            onClick={(e) => {
                                if (!hasSelectedLayanan) {
                                    e.preventDefault();
                                    alert('Mohon pilih Bidang dan Layanan terlebih dahulu.');
                                }
                            }}
                            target={hasSelectedLayanan ? '_blank' : undefined}
                            rel="noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
                                hasSelectedLayanan
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                    : 'bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            }`}
                            title={hasSelectedLayanan ? 'Unduh Format PDF' : 'Pilih layanan terlebih dahulu'}
                        >
                            <Download className={`w-4 h-4 ${hasSelectedLayanan ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
                            <span>Export PDF</span>
                        </a>
                    </div>
                </div>

                {/* FILTER CARD (BIDANG & LAYANAN) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        {/* Pilih Bidang */}
                        <div className="flex-1 min-w-0">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                Bidang Layanan
                            </label>
                            <div className="relative">
                                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={currentBidang}
                                    onChange={(e) => handleBidangChange(e.target.value)}
                                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>
                                        -- Pilih Bidang Layanan --
                                    </option>
                                    {bidang.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Pilih Layanan */}
                        <div className="flex-1 min-w-0">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                Layanan Kepegawaian
                            </label>
                            <div className="relative">
                                <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select
                                    value={currentLayanan}
                                    disabled={!currentBidang || loadingSyarat}
                                    onChange={(e) => handleLayananChange(e.target.value)}
                                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>
                                        {!currentBidang
                                            ? '-- Pilih Bidang Dahulu --'
                                            : '-- Pilih Layanan --'}
                                    </option>
                                    {layananOptions.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Reset Filter Button — spacer invisible agar sejajar dengan select */}
                        <div className="flex-shrink-0">
                            <div className="text-xs mb-1.5 invisible select-none">Reset</div>
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-all shadow-2xs"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RESULTS SECTION */}
                {!hasSelectedLayanan ? (
                    /* PROMPT CARD BELUM MEMILIH LAYANAN */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Layanan Belum Dipilih
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Silakan tentukan <span className="font-semibold text-slate-700 dark:text-slate-300">Bidang Layanan</span> dan <span className="font-semibold text-slate-700 dark:text-slate-300">Layanan Kepegawaian</span> pada pilihan di atas untuk memuat daftar persyaratan resmi.
                        </p>
                    </div>
                ) : loadingSyarat ? (
                    /* LOADING CARD */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs text-slate-400 font-medium">Memuat persyaratan...</p>
                    </div>
                ) : syaratData.length === 0 ? (
                    /* NOT FOUND ALERT CARD */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-16 px-4 text-center shadow-xs">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            Belum Ada Persyaratan
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                            Belum ada dokumen persyaratan yang ditambahkan untuk layanan{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {selectedLayanan?.nama_layanan || '-'}
                            </span>.
                        </p>
                    </div>
                ) : (

                    /* TABLE CARD & MOBILE CARDS */
                    <div className="space-y-4">
                        {/* SEARCH & TOOLBAR */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Cari persyaratan berkas..."
                                    className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-xs text-slate-400">Tampilkan:</span>
                                <div className="relative">
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1.5 pr-8 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-2xs"
                                    >
                                        <option value={10}>10 per hal</option>
                                        <option value={25}>25 per hal</option>
                                        <option value={50}>50 per hal</option>
                                    </select>
                                    <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* TABLE CONTAINER CARD */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            {filteredSyarat.length === 0 ? (
                                <div className="py-16 px-4 text-center">
                                    <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Tidak ada persyaratan yang cocok
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        {searchQuery
                                            ? `Tidak ditemukan syarat dengan kata kunci "${searchQuery}".`
                                            : 'Belum ada persyaratan dokumen yang terdaftar untuk layanan ini.'}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Reset Pencarian</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* TABLE VIEW */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    <th className="py-3.5 px-4 lg:px-6 w-14 text-center">No</th>
                                                    <th className="py-3.5 px-4 lg:px-6">Persyaratan Dokumen</th>
                                                    <th className="py-3.5 px-4 lg:px-6">Sumber / Metode</th>
                                                    <th className="py-3.5 px-4 lg:px-6">Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                                {paginatedSyarat.map((item, index) => {
                                                    const rowNumber = (currentPage - 1) * perPage + index + 1;
                                                    const isSimpeg = item.metode === 'simpeg';

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                                        >
                                                            {/* No */}
                                                            <td className="py-3.5 px-4 lg:px-6 text-center font-medium text-slate-400 text-xs align-top">
                                                                {rowNumber}
                                                            </td>

                                                            {/* Persyaratan Dokumen */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-top">
                                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                                    {item.syarat || '-'}
                                                                </div>
                                                                {item.layanan?.nama_layanan && (
                                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                                        {item.layanan.nama_layanan}
                                                                    </div>
                                                                )}
                                                            </td>

                                                            {/* Sumber / Metode */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-top whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                                        isSimpeg
                                                                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
                                                                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                                            isSimpeg ? 'bg-blue-500' : 'bg-emerald-500'
                                                                        }`}
                                                                    />
                                                                    <span>{isSimpeg ? 'SIMPEG e-File' : 'Upload Manual'}</span>
                                                                </span>
                                                            </td>

                                                            {/* Keterangan */}
                                                            <td className="py-3.5 px-4 lg:px-6 align-top text-xs text-slate-600 dark:text-slate-300">
                                                                {item.deskripsi ? (
                                                                    <p className="leading-relaxed">{item.deskripsi}</p>
                                                                ) : (
                                                                    <span className="text-slate-400 italic">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* REUSABLE PAGINATION BAR */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={filteredSyarat.length}
                                        perPage={perPage}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
