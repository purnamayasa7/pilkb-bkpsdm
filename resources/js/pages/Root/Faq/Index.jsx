import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    HelpCircle,
    Plus,
    Search,
    X,
    Layers,
    Pencil,
    Trash2,
    MessageCircle,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    ChevronDown,
    ChevronUp,
    FileText,
} from 'lucide-react';

export default function RootFaqIndex({ faqs = [] }) {
    // Search and Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState(null);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        id: null,
        pertanyaan: '',
        loading: false,
    });

    // Client-side live search filter
    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) {
            return faqs;
        }
        const query = searchQuery.toLowerCase().trim();
        return faqs.filter((item) => {
            return (
                (item.pertanyaan && item.pertanyaan.toLowerCase().includes(query)) ||
                (item.jawaban && item.jawaban.toLowerCase().includes(query))
            );
        });
    }, [faqs, searchQuery]);

    // Reset page to 1 when search or perPage changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, perPage]);

    // Paginated Slicing
    const totalItems = filteredFaqs.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const paginatedFaqs = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredFaqs.slice(start, start + perPage);
    }, [filteredFaqs, currentPage, perPage]);

    // Handler: Confirm Delete
    const handleConfirmDelete = () => {
        if (!deleteModal.id || deleteModal.loading) return;

        setDeleteModal((prev) => ({ ...prev, loading: true }));
        router.delete(`/root/faq/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ open: false, id: null, pertanyaan: '', loading: false });
            },
            onError: () => {
                setDeleteModal((prev) => ({ ...prev, loading: false }));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen FAQ - Root" />

            <div className="space-y-6">
                {/* 1. Header Halaman (Bagian 4 Poin 1 Standard.md) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 mt-0.5">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Manajemen FAQ
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola daftar tanya-jawab umum (Frequently Asked Questions) untuk pemohon dan pengguna PILKB.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/root/faq/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah FAQ Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Kartu Ringkasan Statistik (Bagian 4 Poin 2 Standard.md) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Total FAQ */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Total Pertanyaan FAQ
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                <HelpCircle className="w-3 h-3 text-blue-500" />
                                FAQ
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {faqs.length}
                            </span>
                            <span className="text-xs text-slate-400">Tanya Jawab</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Tersedia untuk bantuan pengguna
                        </p>
                    </div>

                    {/* FAQ Terakhir */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Pembaruan Terakhir
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                <Clock className="w-3 h-3 text-emerald-500" />
                                {faqs.length > 0 && faqs[0].time_ago ? faqs[0].time_ago : 'Belum Ada'}
                            </span>
                        </div>
                        <div className="mt-2">
                            <div
                                className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate"
                                title={faqs.length > 0 ? faqs[0].pertanyaan : 'Belum ada data FAQ'}
                            >
                                {faqs.length > 0 ? faqs[0].pertanyaan : 'Belum ada data FAQ'}
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            {faqs.length > 0 && faqs[0].created_at_formatted ? faqs[0].created_at_formatted : '-'}
                        </p>
                    </div>

                    {/* Status Modul */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Status Informasi
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Aktif
                            </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                Portal & Publik
                            </span>
                            <span className="text-xs text-slate-400">Siap Ditampilkan</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Panduan interaktif bagi pengguna sistem
                        </p>
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
                                placeholder="Cari pertanyaan atau jawaban FAQ..."
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
                    {paginatedFaqs.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="py-3.5 px-4 text-center w-14">No</th>
                                            <th className="py-3.5 px-4 w-72">Pertanyaan</th>
                                            <th className="py-3.5 px-4">Jawaban</th>
                                            <th className="py-3.5 px-4 w-48">Tanggal Dibuat</th>
                                            <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                        {paginatedFaqs.map((item, index) => {
                                            const itemNumber = (currentPage - 1) * perPage + index + 1;
                                            const isExpanded = expandedRow === item.id;
                                            const isLongAnswer = (item.jawaban || '').length > 160;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50/75 dark:hover:bg-slate-800/50 transition-colors align-top"
                                                >
                                                    {/* No */}
                                                    <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs">
                                                        {itemNumber}
                                                    </td>

                                                    {/* Pertanyaan */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-start gap-2.5">
                                                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 border border-blue-200/60 dark:border-blue-900/40">
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="font-semibold text-slate-900 dark:text-white leading-snug">
                                                                {item.pertanyaan}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Jawaban */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                            {isLongAnswer && !isExpanded ? (
                                                                <div>
                                                                    <p className="line-clamp-2">{item.jawaban}</p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setExpandedRow(item.id)}
                                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-1 cursor-pointer"
                                                                    >
                                                                        <span>Baca selengkapnya</span>
                                                                        <ChevronDown className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <p className="whitespace-pre-line">{item.jawaban}</p>
                                                                    {isLongAnswer && isExpanded && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setExpandedRow(null)}
                                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-1 cursor-pointer"
                                                                        >
                                                                            <span>Ringkas teks</span>
                                                                            <ChevronUp className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Tanggal Dibuat */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                                            {item.created_at_formatted}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                                            {item.time_ago}
                                                        </div>
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="inline-flex items-center justify-center gap-1.5">
                                                            {/* Tombol Edit */}
                                                            <Link
                                                                href={`/root/faq/${item.id}`}
                                                                className="inline-flex items-center justify-center p-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                                title="Ubah FAQ"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Link>

                                                            {/* Tombol Hapus */}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteModal({
                                                                        open: true,
                                                                        id: item.id,
                                                                        pertanyaan: item.pertanyaan,
                                                                        loading: false,
                                                                    })
                                                                }
                                                                className="inline-flex items-center justify-center p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                                                title="Hapus FAQ"
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
                            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {searchQuery ? 'FAQ Tidak Ditemukan' : 'Belum Ada FAQ'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {searchQuery
                                    ? `Tidak ditemukan pertanyaan atau jawaban FAQ dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                                    : 'Belum ada data tanya-jawab umum yang ditambahkan. Klik tombol "Tambah FAQ Baru" di atas untuk menambahkan pertanyaan pertama.'}
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
                                <span>Konfirmasi Hapus FAQ</span>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    !deleteModal.loading &&
                                    setDeleteModal({ open: false, id: null, pertanyaan: '', loading: false })
                                }
                                disabled={deleteModal.loading}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <p>Apakah Anda yakin ingin menghapus data FAQ berikut?</p>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                                "{deleteModal.pertanyaan}"
                            </div>
                            <div className="flex items-start gap-1.5 text-rose-600 dark:text-rose-400 text-[11px] pt-1">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>Data pertanyaan ini akan dihapus permanen dari panduan sistem.</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({ open: false, id: null, pertanyaan: '', loading: false })
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
                                        <span>Ya, Hapus FAQ</span>
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
