import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    PlusCircle,
    ArrowLeft,
    Save,
    Briefcase,
    Clock,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Info,
} from 'lucide-react';

export default function LayananBidangCreate({ userBidang = null }) {
    const { auth } = usePage().props;
    const [confirmModal, setConfirmModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nama_layanan: '',
        target_waktu: '',
        satuan_waktu: 'hari',
        deskripsi: '',
    });

    // Preview teks SLA
    const satuanLabel = { hari: 'Hari', minggu: 'Minggu', bulan: 'Bulan', hari_kerja: 'Hari', hari_kalender: 'Hari' };
    const waktuPreview = data.target_waktu ? `${data.target_waktu} ${satuanLabel[data.satuan_waktu] ?? data.satuan_waktu}` : '-';


    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setConfirmModal(false);

        post('/adminBidang/layanan', {
            preserveScroll: true,
        });
    };

    const namaBidang = userBidang?.nama_bidang || auth?.user?.bidang?.nama_bidang || 'Bidang';

    return (
        <AuthenticatedLayout>
            <Head title={`Tambah Layanan Baru - ${namaBidang} - PILKB`} />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <PlusCircle className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Tambah Layanan Baru
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Daftarkan jenis layanan baru untuk bidang Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <Link
                            href="/adminBidang/layanan"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                            <span>Kembali ke List Layanan</span>
                        </Link>
                    </div>
                </div>

                {/* 2. CARD FORM */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Briefcase className="w-4 h-4" />
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Formulir Layanan Baru
                            </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                            Status Awal: Aktif
                        </span>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setConfirmModal(true);
                        }}
                        className="p-6 sm:p-8 space-y-5"
                    >
                        {/* Bidang Pengampu (Readonly Info) */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                Bidang
                            </label>
                            <div className="px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed">
                                {namaBidang}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Layanan otomatis terhubung dengan bidang operasional akun Anda.
                            </p>
                        </div>

                        {/* Nama Layanan */}
                        <div>
                            <label
                                htmlFor="nama_layanan"
                                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                            >
                                Nama Layanan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="nama_layanan"
                                type="text"
                                value={data.nama_layanan}
                                onChange={(e) => setData('nama_layanan', e.target.value)}
                                placeholder="Contoh: Kenaikan Pangkat Reguler"
                                required
                                className={`w-full px-4 py-2.5 rounded-xl border text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
                                    errors.nama_layanan
                                        ? 'border-rose-500 ring-rose-500/20'
                                        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                            />
                            {errors.nama_layanan && (
                                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.nama_layanan}</span>
                                </p>
                            )}
                        </div>

                        {/* Waktu Penyelesaian (SLA) */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                >
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
                                        value={data.target_waktu}
                                        onChange={(e) => setData('target_waktu', e.target.value)}
                                        placeholder="Contoh: 3"
                                        required
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
                                            errors.target_waktu
                                                ? 'border-rose-500 ring-rose-500/20'
                                                : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                        }`}
                                    />
                                </div>
                                {/* Dropdown Satuan */}
                                <div className="relative w-44">
                                    <select
                                        value={data.satuan_waktu}
                                        onChange={(e) => setData('satuan_waktu', e.target.value)}
                                        className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="hari">Hari</option>
                                        <option value="minggu">Minggu</option>
                                        <option value="bulan">Bulan</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            {/* Preview & Info SOP */}
                            <div className="space-y-1.5 mt-2">
                                {data.target_waktu && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            Estimasi Waktu Layanan:
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 shadow-2xs">
                                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                            <span>{waktuPreview}</span>
                                        </span>
                                    </div>
                                )}
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>Pastikan target waktu penyelesaian telah disesuaikan dengan Standar Operasional Prosedur (SOP) layanan ini.</span>
                                </p>
                            </div>
                            {errors.target_waktu && (
                                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.target_waktu}</span>
                                </p>
                            )}
                        </div>

                        {/* Deskripsi Layanan */}
                        <div>
                            <label
                                htmlFor="deskripsi"
                                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                            >
                                Deskripsi Layanan
                            </label>
                            <textarea
                                id="deskripsi"
                                rows={4}
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                placeholder="Tuliskan penjelasan mengenai alur, sasaran, atau catatan khusus layanan..."
                                className={`w-full px-4 py-3 rounded-xl border text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                                    errors.deskripsi
                                        ? 'border-rose-500 ring-rose-500/20'
                                        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                            />
                            {errors.deskripsi && (
                                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.deskripsi}</span>
                                </p>
                            )}
                        </div>

                        {/* Form Buttons */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <Link
                                href="/adminBidang/layanan"
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'Menyimpan...' : 'Tambah Layanan'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL KONFIRMASI SIMPAN */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div
                        className="fixed inset-0"
                        onClick={() => !processing && setConfirmModal(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                <PlusCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Simpan Layanan Baru?
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Konfirmasi pendaftaran master layanan
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Apakah Anda yakin ingin menambahkan layanan{' '}
                            <strong>&ldquo;{data.nama_layanan}&rdquo;</strong> ke dalam daftar layanan bidang Anda?
                        </p>

                        <div className="flex items-center justify-end gap-2.5 mt-6">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => setConfirmModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleSubmit}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {processing ? (
                                    <span>Menyimpan...</span>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Ya, Tambahkan</span>
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
