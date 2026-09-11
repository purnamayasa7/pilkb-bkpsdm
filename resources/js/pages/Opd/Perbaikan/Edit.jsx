import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    ArrowLeft,
    Edit3,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    ExternalLink,
    UploadCloud,
    X,
    Save,
    QrCode,
    Maximize2,
    MessageSquare,
    Check,
    Copy,
    Building2,
    Briefcase,
    User,
    ShieldAlert
} from 'lucide-react';

export default function Edit({
    tiket = {},
    detail = [],
    dataPegawai = {},
    qr = null
}) {
    const { auth, flash = {} } = usePage().props;

    // Files uploaded in this session: { [detailId]: File }
    const [selectedFiles, setSelectedFiles] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [clientError, setClientError] = useState(null);

    // Modal preview dokumen SIMPEG
    const [simpegModalOpen, setSimpegModalOpen] = useState(false);
    const [activeSimpegDocs, setActiveSimpegDocs] = useState([]);
    const [activeSimpegTitle, setActiveSimpegTitle] = useState('');

    // QR Modal zoom
    const [qrZoomOpen, setQrZoomOpen] = useState(false);

    // Copied feedback state
    const [copiedTiket, setCopiedTiket] = useState(false);

    const handleCopyTiket = () => {
        if (!tiket?.no_tiket) return;
        navigator.clipboard.writeText(tiket.no_tiket);
        setCopiedTiket(true);
        setTimeout(() => setCopiedTiket(false), 2000);
    };

    // File handler
    const handleFileChange = (detailId, file) => {
        if (!file) return;

        // Validasi format PDF
        if (file.type !== 'application/pdf') {
            alert('File harus berformat PDF!');
            return;
        }

        // Validasi ukuran file (maks 1 MB)
        if (file.size > 1024 * 1024) {
            alert('Ukuran file maksimal 1 MB!');
            return;
        }

        setSelectedFiles((prev) => ({
            ...prev,
            [detailId]: file,
        }));
    };

    const handleRemoveSelectedFile = (detailId) => {
        setSelectedFiles((prev) => {
            const next = { ...prev };
            delete next[detailId];
            return next;
        });
    };

    // Handle SIMPEG Modal docs
    const handleOpenSimpegDocs = (syaratTitle, docs) => {
        // Jika hanya 1 dokumen dan ada url langsung buka di tab baru
        const firstDoc = docs[0];
        const docUrl = firstDoc?.preview_url || firstDoc?.url || firstDoc?.file_url;
        if (docs.length === 1 && docUrl) {
            window.open(docUrl, '_blank', 'noreferrer');
            return;
        }

        setActiveSimpegTitle(syaratTitle || 'Dokumen SIMPEG');
        setActiveSimpegDocs(docs || []);
        setSimpegModalOpen(true);
    };

    // Form Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setClientError(null);

        const fileCount = Object.keys(selectedFiles).length;
        if (fileCount === 0) {
            if (!confirm('Anda belum memilih dokumen perbaikan baru. Lanjutkan menyimpan konfirmasi perbaikan?')) {
                return;
            }
        }

        setSubmitting(true);
        const formData = new FormData();

        // Tambahkan dokumen yang dipilih: dokumen[detailId] = file
        Object.entries(selectedFiles).forEach(([detailId, file]) => {
            if (file) {
                formData.append(`dokumen[${detailId}]`, file);
            }
        });

        router.post(`/adminOpd/perbaikan/${tiket.no_tiket}/update`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setSubmitting(false);
            },
            onError: (errors) => {
                setSubmitting(false);
                setClientError(Object.values(errors)[0] || 'Gagal menyimpan perbaikan dokumen.');
            },
        });
    };

    // Hitung berapa berkas yang statusnya BTL (status == 2)
    const btlCount = detail.filter((d) => d.status === 2).length;

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Perbaikan Dokumen Tiket #${tiket?.no_tiket || ''} - PILKB`} />

            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <Edit3 className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Perbaikan Dokumen Usulan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Unggah ulang berkas usulan yang ditandai{' '}
                            <span className="font-semibold text-rose-600 dark:text-rose-400">Tidak Valid (BTL)</span>{' '}
                            sesuai catatan verifikator BKPSDM.
                        </p>
                    </div>

                    {/* Header Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 shadow-xs">
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                            <span>{btlCount} Berkas Perlu Diperbaiki</span>
                        </span>

                        <Link
                            href="/adminOpd/perbaikan"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                            <span>Kembali</span>
                        </Link>
                    </div>
                </div>

                {/* FLASH & ERROR ALERTS */}
                {flash?.success && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div className="flex-1 font-medium">{flash.success}</div>
                    </div>
                )}
                {(flash?.error || clientError) && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <div className="flex-1 font-medium">{flash.error || clientError}</div>
                    </div>
                )}

                {/* TOP SECTION: INFORMASI PEMOHON (COL-8) & NOMOR TIKET/QR (COL-4) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Kartu Informasi Pemohon */}
                    <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
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
                                    {tiket?.nip || '-'}
                                </p>
                            </div>

                            <div>
                                <span className="text-slate-400 font-medium">Bidang Pengampu Layanan:</span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                    {tiket?.layanan?.bidang?.nama_bidang || '-'}
                                </p>
                            </div>

                            <div>
                                <span className="text-slate-400 font-medium">Nama Pegawai:</span>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                                    {dataPegawai?.nama || tiket?.nama || '-'}
                                </p>
                            </div>

                            <div>
                                <span className="text-slate-400 font-medium">Nama Layanan:</span>
                                <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                    {tiket?.layanan?.nama_layanan || '-'}
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
                                    {dataPegawai?.unit || tiket?.nama_ukerja || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Kartu Nomor Tiket & QR Code */}
                    <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 text-xs font-bold uppercase tracking-wider mb-2">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Nomor Tiket</span>
                        </span>

                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {tiket?.no_tiket}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCopyTiket}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Salin No Tiket"
                            >
                                {copiedTiket ? (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {qr && (
                            <div className="space-y-2">
                                <div
                                    onClick={() => setQrZoomOpen(true)}
                                    className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 inline-block cursor-pointer hover:scale-105 transition-transform group"
                                    title="Klik untuk memperbesar QR"
                                >
                                    <img
                                        src={`data:image/svg+xml;base64,${qr}`}
                                        alt="QR Code Tiket"
                                        className="w-28 h-28 mx-auto"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                                    <Maximize2 className="w-3 h-3" />
                                    <span>Klik QR untuk memperbesar</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 2: PANDUAN PERBAIKAN / ALERT */}
                <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            Petunjuk Pengunggahan Berkas Revisi
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Silakan unggah ulang dokumen yang perlu diperbaiki (ditandai dengan status <span className="font-bold text-rose-600 dark:text-rose-400">Tidak Valid</span>). Periksa secara saksama catatan yang diberikan oleh verifikator. Dokumen yang diunggah harus berformat <b>PDF</b> dengan ukuran maksimal <b>1 MB</b>.
                        </p>
                    </div>
                </div>

                {/* CARD 3: FORM PERBAIKAN BERKAS */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Daftar Persyaratan & Dokumen Usulan
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Total {detail.length} berkas persyaratan untuk layanan ini
                                </p>
                            </div>
                        </div>

                        {/* List Syarat Items */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {detail.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-xs">
                                    Tidak ada berkas persyaratan untuk tiket ini.
                                </div>
                            ) : (
                                detail.map((d, index) => {
                                    const dokReview = d.dokumen_review || {};
                                    const metodeSyarat = d.syarat?.metode || dokReview.metode || 'upload';
                                    const hasManualUpload = Boolean(d.file_path || (dokReview.metode === 'upload' && dokReview.url));
                                    const urlManual = d.file_path ? `/adminOpd/perbaikan/dokumen/${encodeURIComponent(d.id)}` : (dokReview.url || null);
                                    const daftarDokumen = dokReview.dokumen || [];
                                    const hasSimpegDocs = Boolean(dokReview.metode === 'simpeg' && daftarDokumen.length > 0);
                                    const isBtl = d.status === 2;
                                    const isValid = d.status === 1;
                                    const selectedFile = selectedFiles[d.id];

                                    return (
                                        <div
                                            key={d.id}
                                            className={`p-4 sm:p-6 transition-colors ${
                                                isBtl
                                                    ? 'bg-rose-50/30 dark:bg-rose-950/10'
                                                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                                            }`}
                                        >
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                                                {/* Kiri: Nomor, Nama Syarat, Status Verifikasi & Berkas Lama (Col 1 - 7) */}
                                                <div className="lg:col-span-7 space-y-2.5">
                                                    <div className="flex items-start gap-3">
                                                        <span
                                                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                                isBtl
                                                                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            {index + 1}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                                                    {d.syarat?.syarat || 'Persyaratan Berkas'}
                                                                </h4>
                                                            </div>

                                                            {/* Badges Info */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                {/* Badge Status Verifikasi */}
                                                                {isBtl ? (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                                                                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                                        <span>Tidak Valid (BTL)</span>
                                                                    </span>
                                                                ) : isValid ? (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <span>Valid</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                                        <span>Menunggu Verifikasi</span>
                                                                    </span>
                                                                )}

                                                                {/* Badge Sumber / Metode */}
                                                                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                                                                    Sumber: {hasManualUpload ? (metodeSyarat === 'simpeg' ? 'Upload Manual (Revisi)' : 'Upload Manual') : (metodeSyarat === 'simpeg' ? 'SIMPEG' : 'Upload Manual')}
                                                                </span>

                                                                {/* Tautan Tunggal Lihat Dokumen (Tetap hanya 1 button) */}
                                                                {hasManualUpload && urlManual ? (
                                                                    <a
                                                                        href={urlManual}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                                                        title="Lihat Dokumen"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                        <span>Lihat Dokumen</span>
                                                                    </a>
                                                                ) : hasSimpegDocs ? (
                                                                    daftarDokumen.length === 1 && daftarDokumen[0]?.url ? (
                                                                        <a
                                                                            href={daftarDokumen[0].url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                                                            title={daftarDokumen[0].nama || 'Lihat Dokumen'}
                                                                        >
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                            <span>Lihat Dokumen</span>
                                                                        </a>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenSimpegDocs(d.syarat?.syarat, daftarDokumen)}
                                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                                                            title="Lihat Dokumen SIMPEG"
                                                                        >
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                            <span>
                                                                                Lihat Dokumen
                                                                                {daftarDokumen.length > 1 ? ` (${daftarDokumen.length})` : ''}
                                                                            </span>
                                                                        </button>
                                                                    )
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Catatan Verifikator BKPSDM (Jika Ada) */}
                                                    {d.comment ? (
                                                        <div className="ml-9 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-rose-200 dark:border-rose-900/60 shadow-2xs">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                <span>Catatan Verifikator BKPSDM:</span>
                                                            </div>
                                                            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                                                                {d.comment}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="ml-9 text-[11px] text-slate-400 italic">
                                                            Tidak ada catatan khusus dari verifikator.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Kanan: File Upload Zone (Col 8 - 12) */}
                                                <div className="lg:col-span-5">
                                                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800/60 space-y-2">
                                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                            <span>Upload Dokumen Revisi (PDF):</span>
                                                            <span className="text-[10px] text-slate-400">Maks. 1 MB</span>
                                                        </div>

                                                        {selectedFile ? (
                                                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                                    <div className="truncate">
                                                                        <span className="font-semibold text-slate-800 dark:text-slate-100 block truncate">
                                                                            {selectedFile.name}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400">
                                                                            {(selectedFile.size / 1024).toFixed(1)} KB (Siap diunggah)
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSelectedFile(d.id)}
                                                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                                                                    title="Batalkan Pilihan Berkas"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label
                                                                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer block transition-colors ${
                                                                    isBtl
                                                                        ? 'border-rose-200 dark:border-rose-800/60 hover:border-rose-400 bg-rose-50/20 dark:bg-rose-950/10'
                                                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="file"
                                                                    accept="application/pdf,.pdf"
                                                                    onChange={(e) => handleFileChange(d.id, e.target.files[0])}
                                                                    className="hidden"
                                                                />
                                                                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                                    <UploadCloud className="w-4 h-4 text-blue-600" />
                                                                    <span>
                                                                        {isBtl
                                                                            ? 'Pilih File PDF Pengganti'
                                                                            : 'Ganti File (Opsional)'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                                    Klik untuk memilih berkas dari komputer
                                                                </span>
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <Link
                                href="/adminOpd/perbaikan"
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-center transition-colors"
                            >
                                Batalkan
                            </Link>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Menyimpan Perbaikan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perbaikan Dokumen</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ======================================================== */}
            {/* MODAL ARSIP SIMPEG                                       */}
            {/* ======================================================== */}
            {simpegModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setSimpegModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Arsip SIMPEG: {activeSimpegTitle}
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Daftar e-File yang terhubung dari database SIMPEG
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSimpegModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {activeSimpegDocs.length === 0 ? (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                    Tidak ada dokumen arsip tersedia.
                                </div>
                            ) : (
                                activeSimpegDocs.map((doc, idx) => {
                                    const url = doc.preview_url || doc.url || doc.file_url;
                                    const name = doc.label || doc.nama_file || doc.nama || `Dokumen #${idx + 1}`;

                                    return (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2"
                                        >
                                            <div className="truncate">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                                                    {name}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {doc.tanggal ? `Tanggal: ${doc.tanggal}` : 'SIMPEG e-File Verified'}
                                                </span>
                                            </div>
                                            {url ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 transition-colors shadow-xs"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    <span>Buka</span>
                                                </a>
                                            ) : (
                                                <span className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-400 text-[11px] flex-shrink-0">
                                                    Tidak ada URL
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                            <button
                                type="button"
                                onClick={() => setSimpegModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL ZOOM QR CODE                                       */}
            {/* ======================================================== */}
            {qrZoomOpen && qr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setQrZoomOpen(false)}
                    />
                    <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 text-center space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    QR Code Tiket
                                </h3>
                                <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                                    {tiket?.no_tiket}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQrZoomOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block shadow-inner">
                            <img
                                src={`data:image/svg+xml;base64,${qr}`}
                                alt="QR Code"
                                className="w-56 h-56 object-contain mx-auto"
                            />
                        </div>

                        <p className="text-[11px] text-slate-400">
                            Scan QR Code ini dengan kamera smartphone untuk melihat bukti pengajuan usulan secara publik.
                        </p>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
