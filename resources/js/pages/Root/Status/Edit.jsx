import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Edit3,
    ArrowLeft,
    ListOrdered,
    Save,
    Building2,
    Briefcase,
    AlertCircle,
    CheckCircle2,
    X,
} from 'lucide-react';

export default function RootStatusEdit({ status = null }) {
    // Form state initialized from existing status
    const [statusText, setStatusText] = useState(status?.status || '');
    const [errors, setErrors] = useState({});

    // Confirmation Modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Helpers
    const namaBidang = status?.layanan?.bidang?.nama_bidang || 'Bidang Terkait';
    const bidangId = status?.layanan?.bidang?.id || '';
    const namaLayanan = status?.layanan?.nama_layanan || 'Layanan Terkait';
    const kodeLayanan = status?.kode_layanan || '';

    // Dynamic back URL preserving filter context
    const backUrl = `/root/status${
        bidangId
            ? `?bidang=${bidangId}${kodeLayanan ? `&layanan=${kodeLayanan}` : ''}`
            : ''
    }`;

    // Client-side validation before confirmation
    const handlePreSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!statusText.trim()) {
            newErrors.status = 'Nama status / tahapan alur wajib diisi.';
        } else if (statusText.trim().length > 255) {
            newErrors.status = 'Nama status maksimal 255 karakter.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setConfirmModalOpen(true);
    };

    // Form submission to backend
    const handleConfirmSubmit = () => {
        setSubmitting(true);

        router.put(
            `/root/status/${status.id}`,
            {
                status: statusText.trim(),
            },
            {
                onSuccess: () => {
                    setConfirmModalOpen(false);
                    setSubmitting(false);
                },
                onError: (backendErrors) => {
                    setErrors(backendErrors || {});
                    setConfirmModalOpen(false);
                    setSubmitting(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Status - ${status?.status || ''} - PILKB`} />

            {/* Kontainer Standar Lebar Penuh (Bagian 3.2 Standard.md) */}
            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4.1 Standard.md) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Edit Status Layanan
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Perbarui penamaan tahapan status proses untuk layanan kepegawaian BKPSDM.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Tombol Kembali Standar */}
                        <Link
                            href={backUrl}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke List Status</span>
                        </Link>
                    </div>
                </div>

                {/* 2. CARD FORM KONTEN PENUH */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {/* Card Header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <ListOrdered className="w-4 h-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Perubahan Master Status Layanan
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Ubah informasi tahapan alur proses pada formulir berikut
                                </p>
                            </div>
                        </div>

                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            ID: #{status?.id}
                        </span>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handlePreSubmit} className="p-6 sm:p-8 space-y-6">
                        {/* Row 1: Bidang & Layanan Context (Readonly) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bidang Context */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                    Bidang
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={namaBidang}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed opacity-90"
                                    />
                                </div>
                            </div>

                            {/* Layanan Context */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                    Nama Layanan
                                </label>
                                <div className="relative">
                                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={namaLayanan}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed opacity-90"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Nama Status / Tahapan Alur */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Nama Status / Tahapan Alur <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={statusText}
                                onChange={(e) => setStatusText(e.target.value)}
                                required
                                placeholder="Contoh: Berkas Sudah Diterima, Verifikasi BKPSDM..."
                                className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                            {errors.status && (
                                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        {/* Form Action Footer */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <Link
                                href={backUrl}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>Perbarui Status</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL KONFIRMASI PERBARUI */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/40">
                                    <Save className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Simpan Perubahan Status?
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Pastikan data yang diubah telah benar
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
                            <div>
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                    Nama Status / Tahapan Alur
                                </span>
                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                    {statusText}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                                <div>
                                    <span className="text-[11px] font-medium text-slate-400 block">Bidang</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        {namaBidang}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-medium text-slate-400 block">Layanan</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        {namaLayanan}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setConfirmModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Ya, Perbarui</span>
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
