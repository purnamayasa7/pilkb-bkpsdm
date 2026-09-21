import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    ExternalLink,
    Save,
    QrCode,
    Maximize2,
    Copy,
    Check,
    X,
    User,
    Database,
    Upload,
    CheckSquare,
    Loader2,
    Edit3,
    ShieldAlert
} from 'lucide-react';

export default function Review({
    tiket = {},
    detail = [],
    dataPegawai = {},
    qr = null,
}) {
    const { auth, flash = {} } = usePage().props;

    // Inisialisasi status checklist: default true jika status === 1 atau status bukan 2 (BTL)
    const initialStatus = useMemo(() => {
        const map = {};
        detail.forEach((d) => {
            map[d.id] = d.status === 1 || d.status !== 2;
        });
        return map;
    }, [detail]);

    // Inisialisasi catatan perbaikan yang sudah ada
    const initialComments = useMemo(() => {
        const map = {};
        detail.forEach((d) => {
            map[d.id] = d.comment || '';
        });
        return map;
    }, [detail]);

    const [statusListState, setStatusListState] = useState(initialStatus);
    const [commentListState, setCommentListState] = useState(initialComments);
    const [submitting, setSubmitting] = useState(false);
    const [errorAlert, setErrorAlert] = useState(null);

    // Modal SIMPEG preview state
    const [simpegModalOpen, setSimpegModalOpen] = useState(false);
    const [activeSimpegDocs, setActiveSimpegDocs] = useState([]);
    const [activeSimpegTitle, setActiveSimpegTitle] = useState('');
    const [simpegFilter, setSimpegFilter] = useState('all');

    // Modal Zoom QR
    const [qrModalOpen, setQrModalOpen] = useState(false);

    // Modal Konfirmasi Submit
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // Feedback copy no tiket
    const [copiedTiket, setCopiedTiket] = useState(false);

    const handleCopyTiket = () => {
        if (!tiket?.no_tiket) return;
        navigator.clipboard.writeText(tiket.no_tiket);
        setCopiedTiket(true);
        setTimeout(() => setCopiedTiket(false), 2000);
    };

    // Toggle checklist berkas tunggal
    const handleToggleChecklist = (detailId) => {
        setStatusListState((prev) => ({
            ...prev,
            [detailId]: !prev[detailId],
        }));
    };

    // Centang Semua Sesuai / Kosongkan Semua
    const handleSetAllChecklist = (isValid) => {
        const nextMap = {};
        detail.forEach((d) => {
            nextMap[d.id] = isValid;
        });
        setStatusListState(nextMap);
    };

    // Perubahan text catatan BTL
    const handleCommentChange = (detailId, value) => {
        setCommentListState((prev) => ({
            ...prev,
            [detailId]: value,
        }));
    };

    // Buka berkas SIMPEG (jika 1 langsung open new tab, jika banyak buka modal)
    const handleOpenSimpegDocs = (syaratTitle, docs) => {
        if (!docs || docs.length === 0) return;

        if (docs.length === 1 && docs[0]?.url) {
            window.open(docs[0].url, '_blank', 'noopener,noreferrer');
            return;
        }

        setActiveSimpegTitle(syaratTitle || 'Dokumen SIMPEG');
        setActiveSimpegDocs(docs);
        setSimpegFilter('all');
        setSimpegModalOpen(true);
    };

    // Filter dokumen di modal SIMPEG
    const displayedSimpegDocs = useMemo(() => {
        if (simpegFilter === 'latest' && activeSimpegDocs.length > 0) {
            return [activeSimpegDocs[0]];
        }
        return activeSimpegDocs;
    }, [activeSimpegDocs, simpegFilter]);

    // Ringkasan validasi
    const validCount = useMemo(() => {
        return Object.values(statusListState).filter(Boolean).length;
    }, [statusListState]);

    const allValid = validCount === detail.length;
    const btlCount = detail.length - validCount;

    // Validasi sebelum membuka modal konfirmasi submit
    const handlePreSubmit = (e) => {
        e.preventDefault();
        setErrorAlert(null);

        // Validasi: pastikan item yang tidak dicentang memiliki catatan alasan
        const invalidWithoutComment = detail.find((d) => {
            const isValid = statusListState[d.id];
            const comment = (commentListState[d.id] || '').trim();
            return !isValid && !comment;
        });

        if (invalidWithoutComment) {
            const syaratName = invalidWithoutComment.syarat?.syarat || 'Persyaratan';
            setErrorAlert(`Mohon berikan alasan / catatan perbaikan untuk dokumen: "${syaratName}".`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setConfirmModalOpen(true);
    };

    // Eksekusi submit form ke backend
    const handleConfirmSubmit = () => {
        setConfirmModalOpen(false);
        setSubmitting(true);

        const payload = {
            status: {},
            comment: commentListState,
        };

        // Backend memeriksa isset($request->status[$detail->id])
        Object.entries(statusListState).forEach(([id, isValid]) => {
            if (isValid) {
                payload.status[id] = 'on';
            }
        });

        router.post(
            `/adminBawah/perbaikan/review/${encodeURIComponent(tiket.no_tiket)}`,
            payload,
            {
                preserveScroll: false,
                onError: (errors) => {
                    setSubmitting(false);
                    setErrorAlert(
                        Object.values(errors)[0] || 'Terjadi kesalahan saat menyimpan hasil review perbaikan.'
                    );
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Review Perbaikan Usulan #${tiket.no_tiket || ''} - PILKB`} />

            {/* Container Full Width Sesuai Standard.md Bagian 3 Poin 2 */}
            <div className="space-y-6">

                {/* ERROR ALERT NOTIFICATION */}
                {errorAlert && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-xs shadow-xs animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                        <div className="flex-1 font-medium">{errorAlert}</div>
                        <button
                            type="button"
                            onClick={() => setErrorAlert(null)}
                            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* 1. PAGE HEADER (Standard.md Bagian 4 Poin 1) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Edit3 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Review Perbaikan Usulan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Pemeriksaan dan verifikasi ulang kelengkapan berkas persyaratan perbaikan dari OPD sebelum diteruskan.
                        </p>
                    </div>

                    {/* Tombol Header Standard.md: py-2.5 text-xs font-semibold */}
                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/adminBawah/perbaikan"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                            <span>Kembali ke List Perbaikan</span>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handlePreSubmit} className="space-y-6">
                    {/* TOP SECTION: INFORMASI PEMOHON & QR BOX (STANDARD.MD BAGIAN 9) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Kiri (lg:col-span-8): Informasi Pemohon & Layanan */}
                        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <User className="w-4 h-4" />
                                </span>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Informasi Pemohon & Layanan
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 font-medium">Nomor Induk Pegawai (NIP):</span>
                                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                                        {tiket.nip || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Bidang Layanan:</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {tiket.layanan?.bidang?.nama_bidang || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Nama Pegawai:</span>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                                        {dataPegawai?.nama || tiket.nama || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Nama Layanan:</span>
                                    <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                        {tiket.layanan?.nama_layanan || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Pangkat / Golongan:</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {dataPegawai?.golongan || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Unit Kerja (OPD):</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {dataPegawai?.unit || tiket.nama_ukerja || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Kanan (lg:col-span-4): Nomor Tiket & QR Code (Standard.md Bagian 9 Poin 3) */}
                        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 text-xs font-bold uppercase tracking-wider mb-2">
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Nomor Tiket</span>
                            </span>

                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {tiket.no_tiket}
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleCopyTiket}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    title="Salin No Tiket"
                                >
                                    {copiedTiket ? (
                                        <Check className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {/* Frame QR Code Interaktif */}
                            {qr ? (
                                <div className="flex flex-col items-center">
                                    <div
                                        onClick={() => setQrModalOpen(true)}
                                        className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                                        title="Klik untuk memperbesar QR"
                                    >
                                        <img
                                            src={`data:image/svg+xml;base64,${qr}`}
                                            alt="QR Tiket"
                                            className="w-28 h-28 mx-auto"
                                        />
                                    </div>
                                    <span className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                                        <Maximize2 className="w-3 h-3" />
                                        Klik QR untuk memperbesar
                                    </span>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                                    QR Code tidak tersedia
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TABLE PERSYARATAN & VALIDASI DOKUMEN */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <CheckSquare className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Daftar Persyaratan & Validasi Perbaikan
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Periksa fisik/digital dokumen perbaikan. Centang jika SESUAI, kosongkan jika MASIH PERLU PERBAIKAN (BTL).
                                    </p>
                                </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleSetAllChecklist(true)}
                                    className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Centang Semua Sesuai</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetAllChecklist(false)}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Kosongkan Semua</span>
                                </button>
                            </div>
                        </div>

                        {/* Table Dokumen */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="px-4 py-3.5 w-12 text-center">No</th>
                                        <th className="px-4 py-3.5 min-w-[240px]">Persyaratan Dokumen</th>
                                        <th className="px-4 py-3.5 w-44 text-center">E-File / Berkas</th>
                                        <th className="px-4 py-3.5 w-32 text-center">Status Validasi</th>
                                        <th className="px-4 py-3.5 min-w-[280px]">Catatan / Alasan (Jika BTL)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                                    {detail.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400">
                                                Tidak ada berkas persyaratan untuk layanan tiket ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        detail.map((d, idx) => {
                                            const isValid = statusListState[d.id] ?? false;
                                            const dokReview = d.dokumen_review || {};

                                            // METODE MURNI: SIMPEG ATAU UPLOAD
                                            const metodeSyarat = d.syarat?.metode || dokReview.metode || 'upload';
                                            const hasManualUpload = Boolean(d.file_path);
                                            const daftarDok = dokReview.dokumen || [];
                                            const urlManual = d.file_path
                                                ? `/adminBawah/permintaan/dokumen/${encodeURIComponent(d.id)}`
                                                : (dokReview.url || null);
                                            const wasBtl = d.status === 2;

                                            return (
                                                <tr
                                                    key={d.id}
                                                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                                                        !isValid ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                                                    }`}
                                                >
                                                    {/* No */}
                                                    <td className="px-4 py-3.5 text-center text-slate-400 font-mono text-[11px]">
                                                        {idx + 1}
                                                    </td>

                                                    {/* Persyaratan Dokumen */}
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                                {d.syarat?.syarat || '-'}
                                                            </span>
                                                            {wasBtl && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                                                                    <ShieldAlert className="w-2.5 h-2.5" />
                                                                    <span>Status Sebelumnya BTL</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        {d.syarat?.deskripsi && (
                                                            <div className="text-[11px] text-slate-400 mt-1">
                                                                {d.syarat.deskripsi}
                                                            </div>
                                                        )}
                                                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                                            {metodeSyarat === 'simpeg' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                                                                    <Database className="w-2.5 h-2.5" />
                                                                    <span>SIMPEG E-File</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                                                                    <Upload className="w-2.5 h-2.5" />
                                                                    <span>Upload di PILKB</span>
                                                                </span>
                                                            )}
                                                            {hasManualUpload && metodeSyarat === 'simpeg' && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                                                                    <Check className="w-2.5 h-2.5" />
                                                                    <span>Berkas Manual Terunggah</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* E-File / Berkas */}
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                        {metodeSyarat === 'upload' ? (
                                                            hasManualUpload && urlManual ? (
                                                                <a
                                                                    href={urlManual}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    <span>Lihat Dokumen</span>
                                                                    <ExternalLink className="w-3 h-3 text-blue-400" />
                                                                </a>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                                                                    Belum Diunggah
                                                                </span>
                                                            )
                                                        ) : (
                                                            /* Syarat metode SIMPEG */
                                                            <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                                                                {/* Jika pemohon mengunggah file manual pengganti, tetap hanya 1 button: Lihat Dokumen */}
                                                                {hasManualUpload && urlManual ? (
                                                                    <a
                                                                        href={urlManual}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                                                                        title="Lihat dokumen perbaikan yang diunggah pemohon"
                                                                    >
                                                                        <FileText className="w-3.5 h-3.5" />
                                                                        <span>Lihat Dokumen</span>
                                                                        <ExternalLink className="w-3 h-3 text-blue-400" />
                                                                    </a>
                                                                ) : (
                                                                    /* Berkas dari SIMPEG */
                                                                    daftarDok.length > 0 ? (
                                                                        daftarDok.length === 1 ? (
                                                                            daftarDok[0]?.url ? (
                                                                                <a
                                                                                    href={daftarDok[0].url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                                                                                    title={daftarDok[0].nama || 'Lihat Dokumen SIMPEG'}
                                                                                >
                                                                                    <FileText className="w-3.5 h-3.5" />
                                                                                    <span>Lihat Dokumen</span>
                                                                                    <ExternalLink className="w-3 h-3 text-blue-400" />
                                                                                </a>
                                                                            ) : (
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                                                                                    URL SIMPEG Tidak Valid
                                                                                </span>
                                                                            )
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleOpenSimpegDocs(
                                                                                        d.syarat?.syarat,
                                                                                        daftarDok
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs cursor-pointer"
                                                                                title="Buka Dokumen SIMPEG"
                                                                            >
                                                                                <FileText className="w-3.5 h-3.5" />
                                                                                <span>Lihat Dokumen</span>
                                                                                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                                                                    {daftarDok.length}
                                                                                </span>
                                                                            </button>
                                                                        )
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                                                            Tidak Ada di SIMPEG
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Status Validasi (Checkbox Toggle) */}
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={isValid}
                                                                onChange={() => handleToggleChecklist(d.id)}
                                                                className="w-5 h-5 rounded-md text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
                                                            />
                                                            <span
                                                                className={`text-xs font-bold ${
                                                                    isValid
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : 'text-rose-600 dark:text-rose-400'
                                                                }`}
                                                            >
                                                                {isValid ? 'Sesuai' : 'BTL'}
                                                            </span>
                                                        </label>
                                                    </td>

                                                    {/* Catatan / Alasan Perbaikan */}
                                                    <td className="px-4 py-3.5">
                                                        {isValid ? (
                                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span>Berkas perbaikan sesuai & siap diproses</span>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <input
                                                                    type="text"
                                                                    value={commentListState[d.id] || ''}
                                                                    onChange={(e) =>
                                                                        handleCommentChange(d.id, e.target.value)
                                                                    }
                                                                    placeholder="Wajib diisi: alasan berkas masih belum sesuai..."
                                                                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-rose-50/50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white placeholder:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                                                />
                                                                <span className="text-[10px] text-rose-500 block">
                                                                    * Catatan ini akan dikirimkan ke ASN/Admin OPD.
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Summary & Submit Button */}
                        <div className="p-4 sm:p-5 bg-slate-50/75 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Status Count Summary */}
                            <div className="flex items-center gap-3 text-xs">
                                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>{validCount} Berkas Sesuai</span>
                                </span>
                                {btlCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-200/80 dark:border-rose-800/60">
                                        <AlertCircle className="w-4 h-4 text-rose-600" />
                                        <span>{btlCount} Berkas BTL (Perlu Revisi Ulang)</span>
                                    </span>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan Review...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Simpan Review Perbaikan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* MODAL PREVIEW DOKUMEN SIMPEG */}
                {simpegModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                            onClick={() => setSimpegModalOpen(false)}
                        />
                        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
                            {/* Modal Header */}
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Database className="w-4 h-4 text-blue-600" />
                                        <span>Daftar Dokumen SIMPEG</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                                        {activeSimpegTitle}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSimpegModalOpen(false)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Filter */}
                            <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                                <span className="text-slate-500 font-medium">Tampilkan Dokumen:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSimpegFilter('all')}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                            simpegFilter === 'all'
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Semua ({activeSimpegDocs.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSimpegFilter('latest')}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                            simpegFilter === 'latest'
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Terbaru
                                    </button>
                                </div>
                            </div>

                            {/* Modal List Dokumen */}
                            <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
                                {displayedSimpegDocs.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        Tidak ada dokumen SIMPEG yang dapat ditampilkan.
                                    </div>
                                ) : (
                                    displayedSimpegDocs.map((doc, dIdx) => (
                                        <div
                                            key={dIdx}
                                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                                                    <FileText className="w-4 h-4" />
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                                        {doc.nama || 'Dokumen SIMPEG'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                        {doc.tanggal ? `Diunggah: ${doc.tanggal}` : 'Tersedia di e-file'}
                                                    </div>
                                                </div>
                                            </div>

                                            {doc.url ? (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
                                                >
                                                    <span>Lihat Dokumen</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-slate-400">URL Tidak Tersedia</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSimpegModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL ZOOM QR (Standard.md Bagian 9 Poin 3) */}
                {qrModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                            onClick={() => setQrModalOpen(false)}
                        />
                        <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 text-center space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    QR Code Tiket
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setQrModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block">
                                <img
                                    src={`data:image/svg+xml;base64,${qr}`}
                                    alt="QR Tiket Zoom"
                                    className="w-56 h-56 mx-auto object-contain"
                                />
                            </div>

                            <div>
                                <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {tiket.no_tiket}
                                </span>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Gunakan scanner untuk melacak tahapan publik layanan.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setQrModalOpen(false)}
                                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI SUBMIT REVIEW */}
                {confirmModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                            onClick={() => setConfirmModalOpen(false)}
                        />
                        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                            <div className="flex items-center gap-3">
                                <span
                                    className={`p-3 rounded-2xl shrink-0 ${
                                        allValid
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                                    }`}
                                >
                                    {allValid ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6" />
                                    )}
                                </span>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {allValid ? 'Konfirmasi Berkas Sesuai' : 'Konfirmasi Masih Ada BTL'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        No. Tiket: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{tiket.no_tiket}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                                {allValid ? (
                                    <p>
                                        Seluruh berkas perbaikan (<strong className="text-emerald-600">{validCount} berkas</strong>) dinyatakan <strong className="text-emerald-600">SESUAI</strong>. Usulan akan diteruskan ke tahapan berikutnya.
                                    </p>
                                ) : (
                                    <p>
                                        Terdapat <strong className="text-rose-600">{btlCount} berkas</strong> yang dinyatakan <strong className="text-rose-600">MASIH PERLU PERBAIKAN (BTL)</strong>. Tiket akan ditandai belum diperbaiki dan pemberitahuan catatan perbaikan akan dikirimkan ke Admin OPD.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSubmit}
                                    className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all shadow-md cursor-pointer ${
                                        allValid
                                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                            : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                                    }`}
                                >
                                    Ya, Simpan Hasil Review
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
