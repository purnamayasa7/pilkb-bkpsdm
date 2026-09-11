import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Layers,
    PlusCircle,
    ArrowLeft,
    Save,
    CheckCircle2,
    X,
    Check,
    AlertCircle,
    Info,
} from 'lucide-react';

export default function RootBidangCreate() {
    // Form state
    const [namaBidang, setNamaBidang] = useState('');
    const [errors, setErrors] = useState({});

    // Confirmation Modal
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

        router.post(
            '/root/bidang',
            {
                nama_bidang: namaBidang.trim(),
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
            <Head title="Tambah Bidang Baru" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Tambah Bidang Baru
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Tambahkan master data bidang baru pada sistem PILKB
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
                                Informasi Bidang Baru
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Masukkan nama bidang resmi yang akan mengampu layanan dan pegawai
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePreSubmit} className="space-y-6">
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
                                placeholder="Contoh: Bidang Pengadaan, Pemberhentian dan Informasi"
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

                        {/* Status Default Info Card */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-200/80 dark:border-emerald-900/50">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="text-xs space-y-1">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <span>Status Awal:</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        Aktif
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                    Bidang baru yang ditambahkan secara otomatis akan aktif dan langsung tersedia dalam pilihan relasi layanan maupun pengguna. Status dapat dinonaktifkan sewaktu-waktu di halaman Master Data Bidang.
                                </p>
                            </div>
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
                                <span>Tambah Bidang</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Konfirmasi Simpan */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                    <Save className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Simpan Data Bidang
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Konfirmasi penambahan bidang baru
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
                                Apakah Anda yakin ingin menyimpan data bidang baru ini?
                            </p>

                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold text-xs">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        {namaBidang}
                                    </div>
                                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] mt-0.5">
                                        Status: Aktif
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
