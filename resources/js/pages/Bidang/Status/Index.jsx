import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import StatusBadge from '@/components/StatusBadge';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import Pagination from '@/components/Pagination';
import {
    Edit,
    Search,
    X,
    Eye,
    Copy,
    Check,
    Calendar,
    AlertCircle,
    ClipboardList,
    Building2,
    Clock,
    UserCheck
} from 'lucide-react';

export default function Index({
    data = [],
    keyword = '',
    namaBidang = 'Bidang'
}) {
    const { auth } = usePage().props;

    const [searchKeyword, setSearchKeyword] = useState(keyword || '');
    const [searching, setSearching] = useState(false);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat
    const [modalRiwayatOpen, setModalRiwayatOpen] = useState(false);
    const [selectedTiket, setSelectedTiket] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const handleSearch = (e) => {
        e.preventDefault();
        setSearching(true);
        router.get(
            '/adminBidang/status',
            { keyword: searchKeyword.trim() },
            {
                preserveState: true,
                replace: true,
                onFinish: () => {
                    setSearching(false);
                    setCurrentPage(1);
                },
            }
        );
    };

    const handleReset = () => {
        setSearchKeyword('');
        router.get('/adminBidang/status', {}, { preserveState: true, replace: true });
    };

    const handleCopyTiket = (noTiket) => {
        navigator.clipboard.writeText(noTiket);
        setCopiedTiket(noTiket);
        setTimeout(() => setCopiedTiket(null), 2000);
    };

    const handleOpenHistory = (item) => {
        setSelectedTiket(item);
        setModalRiwayatOpen(true);
    };

    // Helper avatar 2 letters
    const getInitials = (name, fallback = 'P') => {
        if (!name) return fallback;
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    // Helper format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return dateString;
        }
    };

    // Pagination slice
    const paginatedData = data.slice((currentPage - 1) * perPage, currentPage * perPage);
    const totalPages = Math.ceil(data.length / perPage);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Update Status Tiket - ${namaBidang} - PILKB`} />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Edit className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Update Status Tiket - {namaBidang}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Pencarian cepat tiket usulan kepegawaian untuk pembaruan status dan kelengkapan dokumen.
                        </p>
                    </div>
                </div>

                {/* SEARCH FORM CARD */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Masukkan No Tiket atau NIP Pegawai..."
                                autoFocus
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            {searchKeyword && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                    title="Bersihkan"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                disabled={searching}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>{searching ? 'Mencari...' : 'Cari Tiket'}</span>
                            </button>

                            {keyword && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* HASIL PENCARIAN ATAU STATE AWAL */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    {keyword && data.length > 0 ? (
                        <>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Menampilkan hasil untuk kata kunci:{' '}
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                        "{keyword}"
                                    </span>{' '}
                                    ({data.length} tiket ditemukan)
                                </p>
                            </div>

                            {/* SINGLE RESPONSIVE TABLE */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <th className="py-3 px-4 text-center w-12">No</th>
                                            <th className="py-3 px-4 lg:px-6">No Tiket</th>
                                            <th className="py-3 px-4 lg:px-6">Pegawai</th>
                                            <th className="py-3 px-4 lg:px-6">Layanan</th>
                                            <th className="py-3 px-4 lg:px-6">Unit Kerja</th>
                                            <th className="py-3 px-4">Tanggal Masuk</th>
                                            <th className="py-3 px-4 text-center">Status Terakhir</th>
                                            <th className="py-3 px-4 text-center w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {paginatedData.map((item, idx) => {
                                            const namaPegawai = item.nama || '-';
                                            const ukerja = item.nama_ukerja || '-';
                                            const statusTerakhir =
                                                item.tahap_terakhir?.status_rel?.status ||
                                                item.tahapTerakhir?.statusRel?.status ||
                                                '-';

                                            return (
                                                <tr
                                                    key={item.id || item.no_tiket}
                                                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    {/* No */}
                                                    <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                                                        {(currentPage - 1) * perPage + idx + 1}
                                                    </td>

                                                    {/* No Tiket */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                        <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                            <span>{item.no_tiket}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyTiket(item.no_tiket)}
                                                                className="text-slate-400 hover:text-blue-600 p-1 rounded-md transition-colors cursor-pointer"
                                                                title="Salin No Tiket"
                                                            >
                                                                {copiedTiket === item.no_tiket ? (
                                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                ) : (
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>

                                                    {/* Pegawai */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0">
                                                                {getInitials(namaPegawai, 'P')}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                                                                    {namaPegawai}
                                                                </p>
                                                                <p className="text-[11px] font-mono text-slate-400">
                                                                    {item.nip || '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Layanan */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle text-xs">
                                                        <span
                                                            className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[220px]"
                                                            title={item.layanan?.nama_layanan || '-'}
                                                        >
                                                            {item.layanan?.nama_layanan || '-'}
                                                        </span>
                                                    </td>

                                                    {/* Unit Kerja */}
                                                    <td className="py-3.5 px-4 lg:px-6 align-middle text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="line-clamp-2 max-w-[180px]" title={ukerja}>
                                                            {ukerja}
                                                        </span>
                                                    </td>

                                                    {/* Tanggal Masuk */}
                                                    <td className="py-3.5 px-4 align-middle text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>{formatDate(item.tanggal)}</span>
                                                        </div>
                                                    </td>

                                                    {/* Status Terakhir */}
                                                    <td className="py-3.5 px-4 align-middle text-center">
                                                        <StatusBadge status={statusTerakhir} />
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="py-3.5 px-4 align-middle text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {/* Tombol Update Status */}
                                                            <Link
                                                                href={`/adminBidang/status/${encodeURIComponent(item.no_tiket)}/edit`}
                                                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50 transition-colors"
                                                                title="Update Status Tiket"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>

                                                            {/* Tombol Riwayat (Biru) */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenHistory(item)}
                                                                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                                                title="Riwayat Tahapan Usulan"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={data.length}
                                        perPage={perPage}
                                    />
                                </div>
                            )}
                        </>
                    ) : keyword && data.length === 0 ? (
                        <div className="py-16 px-4 text-center">
                            <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Tiket Tidak Ditemukan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Tidak ditemukan tiket aktif dengan kata kunci "{keyword}" pada bidang Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="py-16 px-4 text-center">
                            <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Pencarian Tiket Usulan
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Masukkan Nomor Tiket atau NIP Pegawai pada kolom pencarian di atas untuk menemukan tiket aktif yang akan diperbarui statusnya.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL RIWAYAT TAHAPAN */}
            <RiwayatTahapanModal
                isOpen={modalRiwayatOpen}
                onClose={() => {
                    setModalRiwayatOpen(false);
                    setSelectedTiket(null);
                }}
                tiket={selectedTiket}
            />
        </AuthenticatedLayout>
    );
}
