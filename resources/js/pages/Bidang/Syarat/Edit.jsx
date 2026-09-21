import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Edit3,
    ArrowLeft,
    CheckSquare,
    Save,
    Briefcase,
    Layers,
    Cloud,
    Upload,
    FileText,
    Info,
    ChevronDown,
    AlertCircle,
} from 'lucide-react';

export default function SyaratBidangEdit({
    syarat = null,
    syaratEfile = [],
}) {
    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState(false);

    // Form helper with Inertia useForm
    const { data, setData, put, processing, errors } = useForm({
        syarat: syarat?.syarat || '',
        metode: syarat?.metode || 'simpeg', // 'simpeg' | 'upload'
        kode_efile: syarat?.kode_efile || '',
        deskripsi: syarat?.deskripsi || '',
    });

    // Handle form submission
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setConfirmModal(false);

        put(`/adminBidang/syarat/${syarat.id}`, {
            preserveScroll: true,
        });
    };

    const namaBidang = syarat?.layanan?.bidang?.nama_bidang || 'Bidang';
    const namaLayanan = syarat?.layanan?.nama_layanan || '-';
    const kodeLayanan = syarat?.kode_layanan || '';

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Syarat - ${syarat?.syarat || ''} - PILKB`} />

            {/* Kontainer Standar Lebar Penuh (Bagian 3.2 Standard.md) */}
            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4.1 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Edit3 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Edit Persyaratan Layanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Perbarui ketentuan dokumen persyaratan atau integrasi e-File SIMPEG untuk layanan {namaLayanan}.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Tombol Kembali Standar (Bagian 4.1 Standard.md) */}
                        <Link
                            href={
                                kodeLayanan
                                    ? `/adminBidang/syarat?layanan=${kodeLayanan}`
                                    : '/adminBidang/syarat'
                            }
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke List Syarat</span>
                        </Link>
                    </div>
                </div>

                {/* 2. CARD FORM KONTEN PENUH */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    {/* Card Header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                            <CheckSquare className="w-4 h-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Perubahan Master Persyaratan Dokumen
                            </h2>
                            <p className="text-xs text-slate-400">
                                Ubah informasi persyaratan layanan pada formulir berikut
                            </p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={(e) => { e.preventDefault(); setConfirmModal(true); }} className="p-6 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bidang (Read-only) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                    Bidang
                                </label>
                                <div className="relative">
                                    <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={namaBidang}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed opacity-90"
                                    />
                                </div>
                            </div>

                            {/* Layanan (Read-only on edit) */}
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

                        {/* Dokumen Persyaratan */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Nama Dokumen Persyaratan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.syarat}
                                onChange={(e) => setData('syarat', e.target.value)}
                                required
                                placeholder="Contoh: SK Kenaikan Pangkat Terakhir, Ijazah Terakhir..."
                                className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                            {errors.syarat && (
                                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.syarat}
                                </p>
                            )}
                        </div>

                        {/* Metode Dokumen (Modern Card Radio Selector) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Metode Pengambilan Dokumen <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Opsi 1: SIMPEG */}
                                <div
                                    onClick={() => setData('metode', 'simpeg')}
                                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-start gap-3.5 ${
                                        data.metode === 'simpeg'
                                            ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span className={`p-2.5 rounded-xl border flex-shrink-0 ${
                                        data.metode === 'simpeg'
                                            ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}>
                                        <Cloud className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                Integrasi SIMPEG (Otomatis)
                                            </span>
                                            {data.metode === 'simpeg' && (
                                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                            Sistem mengambil file e-document langsung dari profil SIMPEG pegawai bersangkutan.
                                        </p>
                                    </div>
                                </div>

                                {/* Opsi 2: Upload PILKB */}
                                <div
                                    onClick={() => {
                                        setData((prev) => ({ ...prev, metode: 'upload', kode_efile: '' }));
                                    }}
                                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-start gap-3.5 ${
                                        data.metode === 'upload'
                                            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span className={`p-2.5 rounded-xl border flex-shrink-0 ${
                                        data.metode === 'upload'
                                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}>
                                        <Upload className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                Upload PILKB (Manual OPD)
                                            </span>
                                            {data.metode === 'upload' && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                            Berkas diunggah secara mandiri oleh Admin OPD pemohon saat pembuatan tiket usulan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Jenis E-File SIMPEG (Kondisional tampil jika metode === 'simpeg') */}
                        {data.metode === 'simpeg' && (
                            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 space-y-3 animate-in fade-in duration-200">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                                        Pilih Jenis E-File SIMPEG <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={data.kode_efile}
                                            onChange={(e) => setData('kode_efile', e.target.value)}
                                            required={data.metode === 'simpeg'}
                                            className="w-full px-4 pr-9 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Pilih Jenis Dokumen E-File SIMPEG --</option>
                                            {syaratEfile.map((item) => (
                                                <option key={item.id || item.efile} value={item.efile}>
                                                    {item.syarat} ({item.efile})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    {errors.kode_efile && (
                                        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.kode_efile}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-start gap-2 text-[11px] text-sky-700 dark:text-sky-300">
                                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-500" />
                                    <span>
                                        Pilihlah jenis dokumen yang tepat sesuai penamaan sistem SIMPEG agar aplikasi dapat melakukan sinkronisasi file secara akurat.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Keterangan / Deskripsi */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Petunjuk / Keterangan Tambahan (Opsional)
                            </label>
                            <textarea
                                rows={3}
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                placeholder="Contoh: Dokumen harus dilegalisir basah atau scan warna dari berkas asli..."
                                className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                            {errors.deskripsi && (
                                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.deskripsi}
                                </p>
                            )}
                        </div>

                        {/* Form Action Footer */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <Link
                                href={
                                    kodeLayanan
                                        ? `/adminBidang/syarat?layanan=${kodeLayanan}`
                                        : '/adminBidang/syarat'
                                }
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL KONFIRMASI SIMPAN */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                            <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/40">
                                <Save className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Simpan Perubahan Syarat?
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Pastikan perubahan data telah sesuai
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <p>
                                Dokumen persyaratan akan diperbarui:
                            </p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                "{data.syarat}"
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => setConfirmModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleSubmit}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Ya, Simpan</span>
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
