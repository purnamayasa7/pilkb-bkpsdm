import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Layers,
    Edit3,
    ArrowLeft,
    Save,
    CheckCircle2,
    XCircle,
    X,
    Check,
    AlertCircle,
    Filter,
    ChevronDown,
    Lock,
} from 'lucide-react';

export default function RootBidangEdit({ bidang }) {
    // Form state initialized with bidang data
    const [namaBidang, setNamaBidang] = useState(bidang?.nama_bidang || '');
    const [aktif, setAktif] = useState(bidang?.aktif === true || bidang?.aktif === 1 ? '1' : '0');
    const [errors, setErrors] = useState({});

    // Confirmation Modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Pre-submit validation
    const handlePreSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!namaBidang.trim()) {
            newErrors.nama_bidang = 'Nama bidang wajib diisi.';
        } else if (namaBidang.trim().length > 100) {
            newErrors.nama_bidang = 'Nama bidang maksimal 100 karakter.';
        }

        if (aktif !== '1' && aktif !== '0') {
            newErrors.aktif = 'Pilih status keaktifan yang valid.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setConfirmModalOpen(true);
    };

    // Actual submission to backend
    const handleConfirmSubmit = () => {
        setSubmitting(true);

        router.put(
            `/root/bidang/${bidang.id}`,
            {
                nama_bidang: namaBidang.trim(),
                aktif: aktif === '1' ? 1 : 0,
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
            <Head title={`Edit Bidang - ${bidang?.nama_bidang || ''}`} />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40 shrink-0">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Update Bidang
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Perbarui nama dan status keaktifan bidang organisasi BKPSDM
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/root/bidang"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke List Bidang</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Main Form Card - Lebar Penuh (Sesuai Seksi 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Detail & Perubahan Data Bidang
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Pastikan informasi bidang valid sebelum menyimpan perubahan
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePreSubmit} className="space-y-6">
                        {/* Field ID Bidang (Readonly) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>ID Bidang (Sistem)</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={bidang?.id || '-'}
                                    disabled
                                    className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed select-all"
                                />
                                <span className="text-[11px] text-slate-400">
                                    Primary key string unik dibuat otomatis oleh sistem.
                                </span>
                            </div>
                        </div>

                        {/* Field Nama Bidang */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>
                                    Nama Bidang <span className="text-rose-500">*</span>
                                </span>
                                <span className="text-[11px] font-normal text-slate-400">
                                    {namaBidang.length}/100 karakter
                                </span>
                            </label>
                            <input
                                type="text"
                                maxLength={100}
                                value={namaBidang}
                                onChange={(e) => {
                                    setNamaBidang(e.target.value);
                                    if (errors.nama_bidang) {
                                        setErrors((prev) => ({ ...prev, nama_bidang: null }));
                                    }
                                }}
                                placeholder="Masukkan nama bidang"
                                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                    errors.nama_bidang
                                        ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                            />
                            {errors.nama_bidang && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.nama_bidang}</span>
                                </p>
                            )}
                        </div>

                        {/* Field Status Keaktifan - Sesuai Standar Combobox Standard.md */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <span>Status Keaktifan</span>
                                <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative max-w-xs">
                                <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={aktif}
                                    onChange={(e) => {
                                        setAktif(e.target.value);
                                        if (errors.aktif) {
                                            setErrors((prev) => ({ ...prev, aktif: null }));
                                        }
                                    }}
                                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="1">Aktif</option>
                                    <option value="0">Tidak Aktif</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            {errors.aktif && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.aktif}</span>
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href="/root/bidang"
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
                                <span>Update Bidang</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Konfirmasi Simpan Perubahan */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                    <Save className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Edit Data Bidang
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Konfirmasi perubahan data bidang
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setConfirmModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Apakah Anda yakin menyimpan perubahan bidang ini?
                            </p>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold text-xs">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {namaBidang}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-slate-400 font-mono text-[11px]">
                                            ID: {bidang?.id}
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                        {aktif === '1' ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                                                <XCircle className="w-3 h-3" />
                                                Tidak Aktif
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setConfirmModalOpen(false)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Batal</span>
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleConfirmSubmit}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Simpan</span>
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
