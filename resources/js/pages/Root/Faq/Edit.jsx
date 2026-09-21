import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Pencil,
    ArrowLeft,
    Save,
    HelpCircle,
    FileText,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Info,
    X,
} from 'lucide-react';

export default function RootFaqEdit({ faq = {} }) {
    // Form state pre-populated with existing FAQ data
    const [pertanyaan, setPertanyaan] = useState(faq.pertanyaan || '');
    const [jawaban, setJawaban] = useState(faq.jawaban || '');
    const [errors, setErrors] = useState({});

    // Confirmation modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Pre-submit client validation
    const handlePreSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!pertanyaan.trim()) {
            newErrors.pertanyaan = 'Pertanyaan FAQ wajib diisi.';
        }
        if (!jawaban.trim()) {
            newErrors.jawaban = 'Jawaban FAQ wajib diisi.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setConfirmModalOpen(true);
    };

    // Actual submission via PUT
    const handleConfirmSubmit = () => {
        setSubmitting(true);

        router.put(
            `/root/faq/${faq.id}`,
            {
                pertanyaan: pertanyaan.trim(),
                jawaban: jawaban.trim(),
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
            <Head title={`Edit FAQ #${faq.id} - PILKB`} />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0 mt-0.5">
                            <Pencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Edit FAQ
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Perbarui isi pertanyaan atau jawaban panduan FAQ sistem PILKB.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/root/faq"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke List FAQ</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Form Card - Lebar Penuh (Sesuai Bagian 3 Poin 2 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Perbarui Informasi FAQ
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Sesuaikan redaksi kalimat agar tetap akurat dan relevan dengan regulasi terkini.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePreSubmit} className="space-y-6">
                        {/* Field Pertanyaan */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>
                                    Pertanyaan <span className="text-rose-500">*</span>
                                </span>
                                <span className="text-[11px] font-normal text-slate-400">
                                    {pertanyaan.length} karakter
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={pertanyaan}
                                    onChange={(e) => {
                                        setPertanyaan(e.target.value);
                                        if (errors.pertanyaan) {
                                            setErrors((prev) => ({ ...prev, pertanyaan: null }));
                                        }
                                    }}
                                    placeholder="Masukkan pertanyaan FAQ..."
                                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                        errors.pertanyaan
                                            ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                    }`}
                                />
                            </div>
                            {errors.pertanyaan && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.pertanyaan}</span>
                                </p>
                            )}
                        </div>

                        {/* Field Jawaban */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>
                                    Jawaban Lengkap <span className="text-rose-500">*</span>
                                </span>
                                <span className="text-[11px] font-normal text-slate-400">
                                    {jawaban.length} karakter
                                </span>
                            </label>
                            <div className="relative">
                                <textarea
                                    rows={6}
                                    value={jawaban}
                                    onChange={(e) => {
                                        setJawaban(e.target.value);
                                        if (errors.jawaban) {
                                            setErrors((prev) => ({ ...prev, jawaban: null }));
                                        }
                                    }}
                                    placeholder="Tuliskan jawaban atau penjelasan lengkap FAQ..."
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                                        errors.jawaban
                                            ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                    }`}
                                />
                            </div>
                            {errors.jawaban && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.jawaban}</span>
                                </p>
                            )}
                        </div>

                        {/* Info Panduan Card */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 border border-blue-200/80 dark:border-blue-900/50">
                                <Info className="w-4 h-4" />
                            </div>
                            <div className="text-xs space-y-1">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    Pemberitahuan Sinkronisasi
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                    Perubahan data pertanyaan dan jawaban ini akan langsung terbarui secara instan pada seluruh laman bantuan dan portal tanya-jawab pengguna.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href="/root/faq"
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Batal</span>
                            </Link>

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>Perbarui FAQ</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Konfirmasi Simpan Perubahan */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Konfirmasi Perubahan FAQ</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => !submitting && setConfirmModalOpen(false)}
                                disabled={submitting}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <p>Apakah Anda yakin ingin menyimpan perubahan pada FAQ ini?</p>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                                "{pertanyaan}"
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                disabled={submitting}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={submitting}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Memperbarui...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Ya, Simpan Perubahan</span>
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
