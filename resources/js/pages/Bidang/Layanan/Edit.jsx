import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Edit3,
    ArrowLeft,
    Save,
    Briefcase,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
} from 'lucide-react';

export default function LayananBidangEdit({ layanan, bidang = [] }) {
    const [confirmModal, setConfirmModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        nama_layanan: layanan?.nama_layanan || '',
        waktu_penyelesaian: layanan?.waktu_penyelesaian || '',
        deskripsi: layanan?.deskripsi || '',
        aktif: layanan?.aktif ?? 1,
    });

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setConfirmModal(false);

        put(`/adminBidang/layanan/${layanan.id}`, {
            preserveScroll: true,
        });
    };

    const namaBidang = layanan?.bidang?.nama_bidang || 'Bidang';

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Layanan - ${layanan?.nama_layanan || ''} - PILKB`} />

            <div className="space-y-6">
                {/* 1. PAGE HEADER (Bagian 4 Standard.md) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Edit3 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Edit Data Layanan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Perbarui informasi nama, estimasi waktu, deskripsi, dan status layanan bidang Anda.
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
                                Formulir Perubahan Layanan
                            </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                            ID Layanan: #{layanan?.id}
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
                                Bidang Pengampu
                            </label>
                            <div className="px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed">
                                {namaBidang}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Sesuai penugasan bidang operasional Anda saat ini.
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

                        {/* Waktu Penyelesaian */}
                        <div>
                            <label
                                htmlFor="waktu_penyelesaian"
                                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                            >
                                Waktu Penyelesaian <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    id="waktu_penyelesaian"
                                    type="text"
                                    value={data.waktu_penyelesaian}
                                    onChange={(e) => setData('waktu_penyelesaian', e.target.value)}
                                    placeholder="Contoh: 3 Hari Kerja"
                                    required
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
                                        errors.waktu_penyelesaian
                                            ? 'border-rose-500 ring-rose-500/20'
                                            : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                    }`}
                                />
                            </div>
                            {errors.waktu_penyelesaian && (
                                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.waktu_penyelesaian}</span>
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
                                placeholder="Tuliskan keterangan detail mengenai ruang lingkup dan alur layanan ini..."
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

                        {/* Status Operasional */}
                        <div>
                            <label
                                htmlFor="aktif"
                                className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                            >
                                Status Operasional <span className="text-rose-500">*</span>
                            </label>
                            <select
                                id="aktif"
                                value={data.aktif}
                                onChange={(e) => setData('aktif', Number(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                <option value={1}>Aktif (Dapat Diajukan oleh OPD)</option>
                                <option value={0}>Tidak Aktif (Disembunyikan dari OPD)</option>
                            </select>
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
                                <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
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
                                <Save className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Simpan Perubahan Layanan?
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Konfirmasi pembaruan data
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Apakah Anda yakin ingin menyimpan perubahan pada layanan{' '}
                            <strong>&ldquo;{data.nama_layanan}&rdquo;</strong>?
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
