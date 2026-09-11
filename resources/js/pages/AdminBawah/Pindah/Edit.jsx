import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Shuffle,
    ArrowLeft,
    Check,
    Copy,
    QrCode,
    Maximize2,
    X,
    User,
    Building2,
    Briefcase,
    Layers,
    Save,
    AlertCircle,
    CheckSquare,
    Loader2
} from 'lucide-react';

export default function Edit({
    tiket = {},
    bidang = [],
    layanan = [],
    syarat = [],
    dataPegawai = {},
    qr = null
}) {
    const { flash } = usePage().props;

    // Selected Dropdown State
    const [selectedBidang, setSelectedBidang] = useState(
        tiket.layanan?.kode_bidang || (bidang[0]?.id || '')
    );
    const [selectedLayanan, setSelectedLayanan] = useState(
        tiket.kode_layanan || ''
    );

    // List Options State
    const [layananList, setLayananList] = useState(layanan);
    const [syaratList, setSyaratList] = useState(syarat);

    // Loading States
    const [loadingLayanan, setLoadingLayanan] = useState(false);
    const [loadingSyarat, setLoadingSyarat] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Checklist Syarat State: { [syaratId]: boolean }
    const [checklistState, setChecklistState] = useState({});

    // UI Feedback States
    const [validationError, setValidationError] = useState('');
    const [copied, setCopied] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    // Salin No Tiket
    const handleCopyTiket = () => {
        if (!tiket.no_tiket) return;
        navigator.clipboard.writeText(tiket.no_tiket);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Handler: Saat Bidang Berubah
    const handleBidangChange = (newBidangId) => {
        setSelectedBidang(newBidangId);
        setLoadingLayanan(true);
        setSelectedLayanan('');
        setSyaratList([]);
        setChecklistState({});
        setValidationError('');

        fetch(`/adminBawah/pindah/get-layanan/${encodeURIComponent(newBidangId)}`)
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat layanan');
                return res.json();
            })
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setLayananList(list);
                setLoadingLayanan(false);

                // Otomatis pilih layanan pertama jika ada
                if (list.length > 0) {
                    handleLayananChange(list[0].id);
                }
            })
            .catch((err) => {
                console.error('Error fetching layanan:', err);
                setLoadingLayanan(false);
            });
    };

    // Handler: Saat Layanan Berubah
    const handleLayananChange = (newLayananId) => {
        setSelectedLayanan(newLayananId);
        setLoadingSyarat(true);
        setSyaratList([]);
        setChecklistState({});
        setValidationError('');

        fetch(`/adminBawah/pindah/get-syarat/${encodeURIComponent(newLayananId)}`)
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat syarat');
                return res.json();
            })
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setSyaratList(list);
                setLoadingSyarat(false);
            })
            .catch((err) => {
                console.error('Error fetching syarat:', err);
                setLoadingSyarat(false);
            });
    };

    // Toggle Checklist Tunggal
    const handleToggleChecklist = (id) => {
        setChecklistState((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
        setValidationError('');
    };

    // Quick Action: Centang Semua / Kosongkan Semua
    const handleSetAllChecklist = (checked) => {
        const next = {};
        syaratList.forEach((s) => {
            next[s.id] = checked;
        });
        setChecklistState(next);
        setValidationError('');
    };

    // Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError('');

        if (!selectedLayanan) {
            setValidationError('Silakan pilih layanan tujuan terlebih dahulu.');
            return;
        }

        const checkedIds = Object.keys(checklistState).filter(
            (id) => checklistState[id]
        );

        if (syaratList.length > 0 && checkedIds.length !== syaratList.length) {
            setValidationError(
                `Semua syarat (${syaratList.length} berkas) wajib divalidasi dan dicentang sebelum pemindahan dapat diproses.`
            );
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/adminBawah/pindah/${encodeURIComponent(tiket.no_tiket)}`,
            {
                kode_layanan: selectedLayanan,
                syarat_id: checkedIds,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
                onError: (errors) => {
                    const msg = Object.values(errors)[0] || 'Terjadi kesalahan saat memproses data.';
                    setValidationError(msg);
                },
            }
        );
    };

    // Hitung Progress Checklist
    const checkedCount = Object.keys(checklistState).filter(
        (id) => checklistState[id]
    ).length;
    const isAllChecked = syaratList.length > 0 && checkedCount === syaratList.length;

    return (
        <AuthenticatedLayout>
            <Head title={`Pindah Layanan - ${tiket.no_tiket || 'Tiket'}`} />

            <div className="space-y-6">
                {/* 1. PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <div className="flex items-start gap-3">
                        <Link
                            href="/adminBawah/pindah"
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs mt-0.5 cursor-pointer"
                            title="Kembali ke Daftar Pencarian"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Pindah Layanan Tiket
                                </h1>
                                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-900/50">
                                    {tiket.no_tiket}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Formulir pengalihan layanan tiket usulan ke bidang atau layanan lain di BKPSDM.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/adminBawah/pindah"
                        className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>
                </div>

                {/* FLASH ERROR / VALIDATION ALERT */}
                {(validationError || flash?.error) && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3 shadow-2xs animate-in fade-in">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                        <div className="flex-1 font-semibold">
                            {validationError || flash?.error}
                        </div>
                        <button
                            type="button"
                            onClick={() => setValidationError('')}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* 2. CARD INFORMASI PEMOHON & QR TIKET (Bagian 9 Standard.md) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Card Kiri: Informasi Pemohon & Layanan Saat Ini (lg:col-span-8) */}
                    <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <User className="w-4 h-4" />
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Informasi Pemohon & Layanan Saat Ini
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* NIP */}
                            <div>
                                <span className="text-slate-400 block">Nomor Induk Pegawai (NIP):</span>
                                <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                                    {tiket.nip || '-'}
                                </p>
                            </div>

                            {/* Bidang Pengampu */}
                            <div>
                                <span className="text-slate-400 block">Bidang Pengampu Saat Ini:</span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                    {tiket.layanan?.bidang?.nama_bidang || '-'}
                                </p>
                            </div>

                            {/* Nama Pegawai */}
                            <div>
                                <span className="text-slate-400 block">Nama Pegawai:</span>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                                    {dataPegawai.nama || tiket.nama || '-'}
                                </p>
                            </div>

                            {/* Nama Layanan Saat Ini */}
                            <div>
                                <span className="text-slate-400 block">Layanan Terdaftar:</span>
                                <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                    {tiket.layanan?.nama_layanan || '-'}
                                </p>
                            </div>

                            {/* Pangkat / Golongan */}
                            <div>
                                <span className="text-slate-400 block">Pangkat / Golongan:</span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                    {dataPegawai.golongan || '-'}
                                </p>
                            </div>

                            {/* Unit Kerja (OPD) */}
                            <div>
                                <span className="text-slate-400 block">Unit Kerja (OPD):</span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                    {tiket.nama_ukerja || dataPegawai.unit || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card Kanan: Nomor Tiket & Barcode/QR Code (lg:col-span-4) */}
                    <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 text-xs font-bold uppercase tracking-wider mb-2">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Nomor Tiket</span>
                        </span>

                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {tiket.no_tiket}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCopyTiket}
                                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                title="Salin No Tiket"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {qr && (
                            <div
                                onClick={() => setQrModalOpen(true)}
                                className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform group relative"
                                title="Klik untuk memperbesar QR Code"
                            >
                                <img
                                    src={`data:image/svg+xml;base64,${qr}`}
                                    alt="QR Tiket"
                                    className="w-28 h-28 mx-auto"
                                />
                                <div className="absolute inset-0 bg-slate-950/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Maximize2 className="w-5 h-5 drop-shadow-md" />
                                </div>
                            </div>
                        )}
                        <span className="text-[10px] text-slate-400 mt-2">
                            Klik QR untuk memperbesar
                        </span>
                    </div>
                </div>

                {/* 3. CARD FORM PEMINDAHAN LAYANAN BARU */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Shuffle className="w-4 h-4" />
                            </span>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Pilih Bidang & Layanan Baru
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Tentukan bidang tujuan dan jenis layanan kepegawaian baru yang sesuai untuk usulan ini.
                                </p>
                            </div>
                        </div>

                        {/* Grid Pilihan Dropdown 2 Kolom */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Dropdown Bidang */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Bidang Tujuan</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedBidang}
                                    onChange={(e) => handleBidangChange(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">-- Pilih Bidang Tujuan --</option>
                                    {bidang.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dropdown Layanan */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Layanan Baru</span>
                                    <span className="text-rose-500">*</span>
                                    {loadingLayanan && (
                                        <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                                    )}
                                </label>
                                <select
                                    value={selectedLayanan}
                                    onChange={(e) => handleLayananChange(e.target.value)}
                                    disabled={loadingLayanan || layananList.length === 0}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:opacity-50"
                                >
                                    <option value="">-- Pilih Layanan Baru --</option>
                                    {layananList.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.nama_layanan}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 4. CARD CHECKLIST SYARAT LAYANAN BARU */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <CheckSquare className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Validasi Syarat Layanan Baru
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Centang seluruh syarat dokumen untuk layanan baru yang dipilih. Seluruh syarat wajib tervalidasi.
                                    </p>
                                </div>
                            </div>

                            {/* Quick Action Buttons */}
                            {syaratList.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSetAllChecklist(true)}
                                        className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Centang Semua ({syaratList.length})</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSetAllChecklist(false)}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Kosongkan</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tabel Syarat */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="px-4 py-3.5 w-12 text-center">No</th>
                                        <th className="px-4 py-3.5 min-w-[280px]">Persyaratan Dokumen Layanan Baru</th>
                                        <th className="px-4 py-3.5 w-32 text-center">Validasi Syarat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                    {loadingSyarat ? (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400">
                                                <Loader2 className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                <p className="text-xs font-semibold">Memuat persyaratan layanan baru...</p>
                                            </td>
                                        </tr>
                                    ) : syaratList.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400">
                                                Tidak ada syarat dokumen terdaftar untuk layanan ini atau belum memilih layanan.
                                            </td>
                                        </tr>
                                    ) : (
                                        syaratList.map((s, idx) => {
                                            const isChecked = Boolean(checklistState[s.id]);

                                            return (
                                                <tr
                                                    key={s.id}
                                                    onClick={() => handleToggleChecklist(s.id)}
                                                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                                                        isChecked ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                                                    }`}
                                                >
                                                    {/* No */}
                                                    <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-[11px]">
                                                        {idx + 1}
                                                    </td>

                                                    {/* Nama Syarat */}
                                                    <td className="px-4 py-3.5">
                                                        <span className="font-semibold text-slate-900 dark:text-white block">
                                                            {s.syarat || '-'}
                                                        </span>
                                                        {s.deskripsi && (
                                                            <span className="text-[11px] text-slate-400 block mt-0.5">
                                                                {s.deskripsi}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Checkbox Validasi */}
                                                    <td
                                                        className="px-4 py-3.5 text-center"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleToggleChecklist(s.id)}
                                                                className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                                                            />
                                                        </label>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Card: Summary Validasi */}
                        {syaratList.length > 0 && (
                            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">
                                    Status Kelengkapan:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                                        isAllChecked
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                    }`}
                                >
                                    {checkedCount} dari {syaratList.length} Syarat Tervalidasi
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 5. TOMBOL AKSI SUBMIT */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                        <Link
                            href="/adminBawah/pindah"
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-center transition-colors cursor-pointer"
                        >
                            Batalkan
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting || !isAllChecked}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memproses Pemindahan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan & Pindahkan Layanan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL ZOOM QR CODE */}
            {qrModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setQrModalOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center text-center">
                        <button
                            type="button"
                            onClick={() => setQrModalOpen(false)}
                            className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200/80 dark:border-blue-900/50 mb-4">
                            {tiket.no_tiket}
                        </span>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-4">
                            <img
                                src={`data:image/svg+xml;base64,${qr}`}
                                alt="QR Tiket Zoom"
                                className="w-48 h-48 mx-auto"
                            />
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Scan QR Code untuk verifikasi status usulan layanan kepegawaian publik.
                        </p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
