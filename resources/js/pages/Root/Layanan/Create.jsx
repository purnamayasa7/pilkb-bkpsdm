import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    PlusCircle,
    ArrowLeft,
    Save,
    Briefcase,
    Clock,
    AlertCircle,
    CheckCircle2,
    Building2,
    ChevronDown,
    X,
    Check,
    FileText,
    Info,
} from 'lucide-react';

export default function RootLayananCreate({ bidang = [] }) {
    // Form state
    const [kodeBidang, setKodeBidang] = useState('');
    const [namaLayanan, setNamaLayanan] = useState('');
    const [targetWaktu, setTargetWaktu] = useState('');
    const [satuanWaktu, setSatuanWaktu] = useState('hari');
    const [deskripsi, setDeskripsi] = useState('');
    const [errors, setErrors] = useState({});

    // Confirmation Modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Preview teks SLA otomatis
    const satuanLabel = { hari: 'Hari', minggu: 'Minggu', bulan: 'Bulan', hari_kerja: 'Hari', hari_kalender: 'Hari' };
    const waktuPreview = targetWaktu ? `${targetWaktu} ${satuanLabel[satuanWaktu] ?? satuanWaktu}` : '-';

    // Selected bidang object helper
    const selectedBidangObj = bidang.find((b) => String(b.id) === String(kodeBidang));

    // Pre-submit validation
    const handlePreSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!kodeBidang) {
            newErrors.kode_bidang = 'Pilih bidang pengampu layanan.';
        }
        if (!namaLayanan.trim()) {
            newErrors.nama_layanan = 'Nama layanan wajib diisi.';
        } else if (namaLayanan.trim().length > 150) {
            newErrors.nama_layanan = 'Nama layanan maksimal 150 karakter.';
        }
        if (!targetWaktu || Number(targetWaktu) < 1) {
            newErrors.target_waktu = 'Jumlah waktu wajib diisi (minimal 1).';
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
            '/root/layanan',
            {
                kode_bidang: kodeBidang,
                nama_layanan: namaLayanan.trim(),
                target_waktu: Number(targetWaktu),
                satuan_waktu: satuanWaktu,
                deskripsi: deskripsi.trim(),
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
            <Head title="Tambah Layanan Baru" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Tambah Layanan Baru
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Daftarkan jenis layanan kepegawaian baru pada sistem PILKB
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/root/layanan"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke List Layanan</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Main Form Card - Lebar Penuh (Sesuai Seksi 3 Standard.md) */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Formulir Layanan Baru
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Lengkapi informasi bidang, nama layanan, dan estimasi waktu penyelesaian
                                </p>
                            </div>
                        </div>

                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Status Awal: Aktif
                        </span>
                    </div>

                    <form onSubmit={handlePreSubmit} className="space-y-6">
                        {/* Field Bidang Pengampu */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>
                                    Bidang Pengampu <span className="text-rose-500">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={kodeBidang}
                                    onChange={(e) => {
                                        setKodeBidang(e.target.value);
                                        if (errors.kode_bidang) {
                                            setErrors((prev) => ({ ...prev, kode_bidang: null }));
                                        }
                                    }}
                                    className={`w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                                        errors.kode_bidang
                                            ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                            : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                    }`}
                                >
                                    <option value="" disabled>
                                        -- Pilih Bidang Pengampu --
                                    </option>
                                    {bidang.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            {errors.kode_bidang && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.kode_bidang}</span>
                                </p>
                            )}
                        </div>

                        {/* Field Nama Layanan */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>
                                    Nama Layanan <span className="text-rose-500">*</span>
                                </span>
                                <span className="text-[11px] font-normal text-slate-400">
                                    {namaLayanan.length}/150 karakter
                                </span>
                            </label>
                            <input
                                type="text"
                                maxLength={150}
                                value={namaLayanan}
                                onChange={(e) => {
                                    setNamaLayanan(e.target.value);
                                    if (errors.nama_layanan) {
                                        setErrors((prev) => ({ ...prev, nama_layanan: null }));
                                    }
                                }}
                                placeholder="Contoh: Kenaikan Pangkat Reguler, Cuti Alasan Penting, Mutasi Pegawai, dll"
                                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                    errors.nama_layanan
                                        ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                            />
                            {errors.nama_layanan && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.nama_layanan}</span>
                                </p>
                            )}
                        </div>

                        {/* Field Waktu Penyelesaian (SLA) */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Target Waktu Penyelesaian <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                                    Wajib sesuai SOP
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {/* Input Angka */}
                                <div className="relative flex-1">
                                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="number"
                                        min={1}
                                        value={targetWaktu}
                                        onChange={(e) => {
                                            setTargetWaktu(e.target.value);
                                            if (errors.target_waktu) setErrors((prev) => ({ ...prev, target_waktu: null }));
                                        }}
                                        placeholder="Contoh: 3"
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                            errors.target_waktu
                                                ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                                : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                        }`}
                                    />
                                </div>
                                {/* Dropdown Satuan */}
                                <div className="relative w-48">
                                    <select
                                        value={satuanWaktu}
                                        onChange={(e) => setSatuanWaktu(e.target.value)}
                                        className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="hari">Hari</option>
                                        <option value="minggu">Minggu</option>
                                        <option value="bulan">Bulan</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            {/* Preview & Info SOP */}
                            <div className="flex flex-col gap-1 mt-1">
                                {targetWaktu && (
                                    <p className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">
                                        <Clock className="w-3 h-3" />
                                        Preview: <strong>{waktuPreview}</strong>
                                    </p>
                                )}
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>Pastikan target waktu penyelesaian telah disesuaikan dengan Standar Operasional Prosedur (SOP) layanan ini.</span>
                                </p>
                            </div>
                            {errors.target_waktu && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.target_waktu}</span>
                                </p>
                            )}
                        </div>

                        {/* Field Deskripsi Layanan */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>Deskripsi & Penjelasan Layanan</span>
                                <span className="text-[11px] font-normal text-slate-400">Opsional</span>
                            </label>
                            <textarea
                                rows={4}
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                placeholder="Jelaskan ringkasan prosedur, dasar hukum, atau petunjuk pengajuan layanan ini..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                            />
                        </div>

                        {/* Status Awal Callout Info */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-200/80 dark:border-emerald-900/50">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="text-xs space-y-1">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <span>Status Ketersediaan Awal:</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        Aktif
                                    </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                    Layanan baru akan otomatis aktif dan dapat langsung dipilih oleh ASN maupun Admin OPD pada modul usulan tiket. Status dapat dinonaktifkan sewaktu-waktu di halaman Master Data Layanan.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href="/root/layanan"
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
                                <span>Tambah Layanan</span>
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
                                        Simpan Data Layanan
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Konfirmasi pendaftaran jenis layanan baru
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
                                Apakah Anda yakin ingin menyimpan jenis layanan baru ini?
                            </p>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Nama Layanan:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {namaLayanan}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Bidang:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {selectedBidangObj?.nama_bidang || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Target Waktu:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                            {waktuPreview}
                                        </span>
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
                                        <span>Simpan Layanan</span>
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
