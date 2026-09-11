import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    PlusCircle,
    ArrowLeft,
    CheckSquare,
    Save,
    Building2,
    Briefcase,
    Cloud,
    Upload,
    FileText,
    Info,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    X,
} from 'lucide-react';

export default function RootSyaratCreate({
    bidang = [],
    bidangId = null,
    layanan = [],
    allLayanan = [],
    syaratEfile = [],
    selectedLayananId = null,
}) {
    // Initial state setup
    const initialBidangId = bidangId || (bidang.length > 0 ? String(bidang[0].id) : '');
    const [selectedBidang, setSelectedBidang] = useState(initialBidangId);
    const [kodeLayanan, setKodeLayanan] = useState(selectedLayananId ? String(selectedLayananId) : '');
    const [syarat, setSyarat] = useState('');
    const [metode, setMetode] = useState('simpeg'); // 'simpeg' | 'upload'
    const [kodeEfile, setKodeEfile] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [errors, setErrors] = useState({});

    // Confirmation modal & submitting state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filtered layanan based on selected bidang
    const availableLayanan = useMemo(() => {
        if (!selectedBidang) return allLayanan;
        return allLayanan.filter((item) => String(item.kode_bidang) === String(selectedBidang));
    }, [selectedBidang, allLayanan]);

    // Bidang change handler
    const handleBidangChange = (newBidangId) => {
        setSelectedBidang(newBidangId);
        // Reset layanan selection if current selected layanan is not in new bidang
        const existsInNewBidang = allLayanan.some(
            (l) => String(l.kode_bidang) === String(newBidangId) && String(l.id) === String(kodeLayanan)
        );
        if (!existsInNewBidang) {
            setKodeLayanan('');
        }
    };

    // Client-side validation before confirmation
    const handlePreSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!selectedBidang) {
            newErrors.bidang = 'Pilih bidang pengampu terlebih dahulu.';
        }
        if (!kodeLayanan) {
            newErrors.kode_layanan = 'Pilih layanan terkait persyaratan ini.';
        }
        if (!syarat.trim()) {
            newErrors.syarat = 'Nama dokumen persyaratan wajib diisi.';
        }
        if (metode === 'simpeg' && !kodeEfile) {
            newErrors.kode_efile = 'Pilih jenis dokumen e-File SIMPEG untuk integrasi otomatis.';
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

        router.post(
            '/root/syarat',
            {
                kode_layanan: kodeLayanan,
                syarat: syarat.trim(),
                metode: metode,
                kode_efile: metode === 'simpeg' ? kodeEfile : null,
                deskripsi: deskripsi.trim() || null,
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

    // Helper names for preview
    const selectedBidangObj = bidang.find((b) => String(b.id) === String(selectedBidang));
    const selectedLayananObj = allLayanan.find((l) => String(l.id) === String(kodeLayanan));
    const selectedEfileObj = syaratEfile.find((e) => e.efile === kodeEfile);

    // Dynamic back URL
    const backUrl = `/root/syarat${
        selectedBidang
            ? `?bidang=${selectedBidang}${kodeLayanan ? `&layanan=${kodeLayanan}` : ''}`
            : ''
    }`;

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Persyaratan Layanan - Root - PILKB" />

            {/* Kontainer Standar Lebar Penuh (Bagian 3.2 Standard.md) */}
            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4.1 Standard.md) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Tambah Persyaratan Layanan
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Daftarkan dokumen persyaratan baru dan tentukan metode integrasi SIMPEG untuk layanan BKPSDM.
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
                                Formulir Master Persyaratan Dokumen
                            </h2>
                            <p className="text-xs text-slate-400">
                                Lengkapi rincian dokumen persyaratan dan metode pengambilannya di bawah ini
                            </p>
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handlePreSubmit} className="p-6 sm:p-8 space-y-6">
                        {/* Row 1: Bidang & Layanan Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bidang Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                    Bidang Pengampu <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={selectedBidang}
                                        onChange={(e) => handleBidangChange(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Pilih Bidang Pengampu --</option>
                                        {bidang.map((b) => (
                                            <option key={b.id} value={String(b.id)}>
                                                {b.nama_bidang}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.bidang && (
                                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.bidang}
                                    </p>
                                )}
                            </div>

                            {/* Layanan Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                    Layanan Terkait <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={kodeLayanan}
                                        onChange={(e) => setKodeLayanan(e.target.value)}
                                        required
                                        disabled={!selectedBidang}
                                        className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {selectedBidang ? '-- Pilih Layanan Terkait --' : '-- Pilih Bidang Terlebih Dahulu --'}
                                        </option>
                                        {availableLayanan.map((item) => (
                                            <option key={item.id} value={String(item.id)}>
                                                {item.nama_layanan}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.kode_layanan && (
                                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.kode_layanan}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Nama Dokumen Persyaratan */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Nama Dokumen Persyaratan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={syarat}
                                onChange={(e) => setSyarat(e.target.value)}
                                required
                                placeholder="Contoh: SK Kenaikan Pangkat Terakhir, Ijazah & Transkrip Nilai, Surat Pengantar OPD..."
                                className="w-full px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                            {errors.syarat && (
                                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.syarat}
                                </p>
                            )}
                        </div>

                        {/* Metode Pengambilan Dokumen (Card Radio Selector) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Metode Pengambilan Dokumen <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Opsi 1: Integrasi SIMPEG */}
                                <div
                                    onClick={() => setMetode('simpeg')}
                                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-start gap-3.5 ${
                                        metode === 'simpeg'
                                            ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`p-2.5 rounded-xl border shrink-0 ${
                                            metode === 'simpeg'
                                                ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <Cloud className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                Integrasi SIMPEG (Otomatis)
                                            </span>
                                            {metode === 'simpeg' && (
                                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            Sistem mengambil file e-document secara otomatis langsung dari arsip profil SIMPEG ASN.
                                        </p>
                                    </div>
                                </div>

                                {/* Opsi 2: Upload PILKB */}
                                <div
                                    onClick={() => {
                                        setMetode('upload');
                                        setKodeEfile('');
                                    }}
                                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-start gap-3.5 ${
                                        metode === 'upload'
                                            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                                    }`}
                                >
                                    <span
                                        className={`p-2.5 rounded-xl border shrink-0 ${
                                            metode === 'upload'
                                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <Upload className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                Upload PILKB (Manual OPD)
                                            </span>
                                            {metode === 'upload' && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            Berkas dokumen fisik/digital diunggah mandiri oleh Admin OPD pemohon saat mengajukan permohonan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Jenis E-File SIMPEG (Kondisional tampil jika metode === 'simpeg') */}
                        {metode === 'simpeg' && (
                            <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/50 space-y-3 animate-in fade-in duration-200">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                                        Pilih Jenis Dokumen E-File SIMPEG <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={kodeEfile}
                                            onChange={(e) => setKodeEfile(e.target.value)}
                                            required={metode === 'simpeg'}
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
                                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-500" />
                                    <span>
                                        Pilihlah jenis dokumen yang tepat sesuai penamaan sistem SIMPEG agar aplikasi dapat melakukan sinkronisasi file secara akurat.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Petunjuk / Deskripsi */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                Petunjuk / Keterangan Tambahan (Opsional)
                            </label>
                            <textarea
                                rows={3}
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                placeholder="Contoh: Dokumen harus dilegalisir basah atau scan warna dari berkas asli, format PDF maksimal 2MB..."
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
                                <span>Simpan Syarat</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL KONFIRMASI SIMPAN */}
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
                                        Simpan Persyaratan Baru?
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Pastikan data yang diisi telah sesuai
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
                                    Dokumen Persyaratan
                                </span>
                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                    {syarat}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                                <div>
                                    <span className="text-[11px] font-medium text-slate-400 block">Bidang</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        {selectedBidangObj?.nama_bidang || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-medium text-slate-400 block">Layanan</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        {selectedLayananObj?.nama_layanan || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                                <span className="text-[11px] font-medium text-slate-400 block">Metode Pengambilan</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {metode === 'simpeg'
                                        ? `Integrasi SIMPEG (${selectedEfileObj?.syarat || kodeEfile})`
                                        : 'Upload PILKB (Manual OPD)'}
                                </span>
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
