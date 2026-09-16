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
    Building2,
    Briefcase,
    Layers,
    Database,
    Upload,
    CheckSquare,
    Loader2,
    ShieldAlert,
    Eye,
    Calendar,
    ChevronDown,
    ListChecks
} from 'lucide-react';

export default function Edit({
    tiket = {},
    detail = [],
    dataPegawai = {},
    statusList = [],
    qr = null
}) {
    const { auth } = usePage().props;

    // Initial status checklist: detail.status === 1 (valid) or not 2
    const initialStatus = useMemo(() => {
        const map = {};
        detail.forEach((d) => {
            map[d.id] = d.status === 1 || d.status !== 2;
        });
        return map;
    }, [detail]);

    // Initial comments for invalid documents
    const initialComments = useMemo(() => {
        const map = {};
        detail.forEach((d) => {
            map[d.id] = d.comment || '';
        });
        return map;
    }, [detail]);

    const [statusTahap, setStatusTahap] = useState(tiket?.status_tahap || '');
    const [statusListState, setStatusListState] = useState(initialStatus);
    const [commentListState, setCommentListState] = useState(initialComments);
    const [catatanTahap, setCatatanTahap] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorAlert, setErrorAlert] = useState(null);

    // Deteksi apakah status yang dipilih di combobox adalah "Selesai"
    const selectedStatusObj = useMemo(() => {
        return statusList.find((st) => String(st.id) === String(statusTahap));
    }, [statusList, statusTahap]);

    const isSelesaiSelected = useMemo(() => {
        return selectedStatusObj?.status?.toLowerCase().trim() === 'selesai';
    }, [selectedStatusObj]);

    // Modal SIMPEG preview
    const [simpegModalOpen, setSimpegModalOpen] = useState(false);
    const [activeSimpegDocs, setActiveSimpegDocs] = useState([]);
    const [activeSimpegTitle, setActiveSimpegTitle] = useState('');
    const [simpegFilter, setSimpegFilter] = useState('all');

    // Modal Zoom QR
    const [qrModalOpen, setQrModalOpen] = useState(false);

    // Feedback copy no tiket
    const [copiedTiket, setCopiedTiket] = useState(false);

    const handleCopyTiket = () => {
        if (!tiket?.no_tiket) return;
        navigator.clipboard.writeText(tiket.no_tiket);
        setCopiedTiket(true);
        setTimeout(() => setCopiedTiket(false), 2000);
    };

    // Toggle single requirement checklist
    const handleToggleChecklist = (detailId) => {
        setStatusListState((prev) => ({
            ...prev,
            [detailId]: !prev[detailId],
        }));
    };

    // Quick Action: Check / Uncheck All
    const handleSetAllChecklist = (isValid) => {
        const nextMap = {};
        detail.forEach((d) => {
            nextMap[d.id] = isValid;
        });
        setStatusListState(nextMap);
    };

    // Handle Comment change
    const handleCommentChange = (detailId, value) => {
        setCommentListState((prev) => ({
            ...prev,
            [detailId]: value,
        }));
    };

    // Open SIMPEG modal
    const handleOpenSimpegDocs = (syaratTitle, docs) => {
        if (!docs || docs.length === 0) return;

        // If only 1 document, open directly
        if (docs.length === 1 && docs[0]?.url) {
            window.open(docs[0].url, '_blank', 'noopener,noreferrer');
            return;
        }

        setActiveSimpegTitle(syaratTitle || 'Dokumen SIMPEG');
        setActiveSimpegDocs(docs);
        setSimpegFilter('all');
        setSimpegModalOpen(true);
    };

    // Filtered SIMPEG docs inside modal
    const displayedSimpegDocs = useMemo(() => {
        if (simpegFilter === 'latest' && activeSimpegDocs.length > 0) {
            return [activeSimpegDocs[0]];
        }
        return activeSimpegDocs;
    }, [activeSimpegDocs, simpegFilter]);

    // Validation count summary
    const validCount = useMemo(() => {
        return Object.values(statusListState).filter(Boolean).length;
    }, [statusListState]);

    const allValid = validCount === detail.length;

    // Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorAlert(null);

        if (!statusTahap) {
            setErrorAlert('Silakan pilih Status Tahap Proses terlebih dahulu.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Check if any invalid item is missing comment
        const invalidWithoutComment = detail.find((d) => {
            const isValid = statusListState[d.id];
            const comment = (commentListState[d.id] || '').trim();
            return !isValid && !comment;
        });

        if (invalidWithoutComment) {
            const syaratName = invalidWithoutComment.syarat?.syarat || 'Persyaratan';
            setErrorAlert(`Mohon berikan alasan/catatan perbaikan untuk berkas: "${syaratName}".`);
            return;
        }

        setSubmitting(true);

        const payload = {
            status_tahap: statusTahap,
            catatan: catatanTahap || '-',
            status: {},
            comment: commentListState,
            archives: isSelesaiSelected ? 1 : 0,
        };

        Object.entries(statusListState).forEach(([id, isValid]) => {
            if (isValid) {
                payload.status[id] = 'on';
            }
        });

        router.post(
            `/adminBidang/status/${encodeURIComponent(tiket.no_tiket)}/update`,
            payload,
            {
                preserveScroll: false,
                onError: (errors) => {
                    setSubmitting(false);
                    setErrorAlert(
                        Object.values(errors)[0] || 'Terjadi kesalahan saat menyimpan review status.'
                    );
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Update Status - ${tiket.no_tiket} - PILKB`} />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <ListChecks className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Update Status & Proses Permintaan
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Pembaruan tahapan status proses dan verifikasi berkas persyaratan usulan kepegawaian.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link
                            href="/adminBidang/status"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                            <span>Kembali ke List</span>
                        </Link>
                    </div>
                </div>

                {/* ERROR ALERT */}
                {errorAlert && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-xs shadow-xs animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                        <div className="flex-1 font-medium">{errorAlert}</div>
                        <button
                            type="button"
                            onClick={() => setErrorAlert(null)}
                            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                        {tiket.nip || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Bidang Pengampu Layanan:</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {tiket.layanan?.bidang?.nama_bidang || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Nama Pegawai:</span>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                                        {dataPegawai.nama || tiket.nama || '-'}
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
                                        {dataPegawai.golongan || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-medium">Unit Kerja (OPD):</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {dataPegawai.unit || tiket.nama_ukerja || '-'}
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
                                    {tiket.no_tiket}
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
                                        onClick={() => setQrModalOpen(true)}
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

                    {/* STATUS PROSES SELECTION CARD */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                <Layers className="w-4 h-4" />
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Update Status Tahap Proses
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Pilih Status Tahap <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={statusTahap}
                                        onChange={(e) => setStatusTahap(e.target.value)}
                                        required
                                        className={`w-full px-3.5 py-2.5 pr-9 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border ${
                                            isSelesaiSelected
                                                ? 'border-emerald-500 dark:border-emerald-600 ring-1 ring-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all`}
                                    >
                                        <option value="">-- Pilih Status Tahapan --</option>
                                        {statusList.map((st) => (
                                            <option key={st.id} value={st.id}>
                                                {st.status}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {isSelesaiSelected ? (
                                    <div className="mt-2.5 flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs shadow-2xs animate-in fade-in duration-200">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                                                Status Selesai Dipilih
                                            </p>
                                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                                                Nilai <strong>Archives</strong> akan otomatis diperbarui menjadi <strong>1</strong> (usulan otomatis diarsipkan dan selesai tanpa proses terpisah).
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Pilih tahapan status yang sesuai dengan progres verifikasi layanan saat ini.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Catatan Tambahan Tahapan (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={catatanTahap}
                                    onChange={(e) => setCatatanTahap(e.target.value)}
                                    placeholder="Contoh: Berkas telah diverifikasi dan siap diproses"
                                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Catatan ini akan tersimpan ke dalam riwayat log tahapan usulan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TABLE PERSYARATAN & VALIDASI DOKUMEN */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                        <CheckSquare className="w-4 h-4" />
                                    </span>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Daftar Persyaratan & Validasi Dokumen
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Tinjau dokumen yang diunggah dan centang checklist verifikasi untuk menyetujui.
                                </p>
                            </div>

                            <div className="flex items-center gap-2.5 self-start sm:self-auto">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                                        allValid
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300'
                                    }`}
                                >
                                    {allValid ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                        <AlertCircle className="w-3.5 h-3.5" />
                                    )}
                                    <span>
                                        {validCount} / {detail.length} Berkas Sesuai
                                    </span>
                                </span>

                                <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => handleSetAllChecklist(true)}
                                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                        title="Centang semua berkas sebagai valid"
                                    >
                                        Semua Sesuai
                                    </button>
                                    <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                                    <button
                                        type="button"
                                        onClick={() => handleSetAllChecklist(false)}
                                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg text-rose-700 dark:text-rose-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                        title="Batal centang semua berkas"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <th className="py-3 px-4 text-center w-12">No</th>
                                        <th className="py-3 px-4 lg:px-6 min-w-[220px]">Persyaratan Dokumen</th>
                                        <th className="py-3 px-4 text-center min-w-[150px]">E-File / Berkas</th>
                                        <th className="py-3 px-4 text-center w-28">Verifikasi</th>
                                        <th className="py-3 px-4 lg:px-6 min-w-[240px]">Catatan / Alasan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {detail.map((d, index) => {
                                        const review = d.dokumen_review || {};
                                        const metodeSyarat = d.syarat?.metode || review.metode || 'upload';
                                        const hasManualUpload = Boolean(d.file_path || (review.metode === 'upload' && review.url));
                                        const urlManual = d.file_path
                                            ? `/adminBidang/permintaan/dokumen/${encodeURIComponent(d.id)}`
                                            : (review.url || null);
                                        const daftarDokumen = review.dokumen || [];
                                        const hasSimpegDocs = Boolean(review.metode === 'simpeg' && daftarDokumen.length > 0);
                                        const isValid = Boolean(statusListState[d.id]);
                                        const commentVal = commentListState[d.id] || '';

                                        return (
                                            <tr
                                                key={d.id}
                                                className={`transition-colors ${
                                                    isValid
                                                        ? 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                                                        : 'bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40 dark:hover:bg-rose-950/20'
                                                }`}
                                            >
                                                <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                                                    {index + 1}
                                                </td>

                                                <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-slate-900 dark:text-white">
                                                            {d.syarat?.syarat || '-'}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            {hasManualUpload ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-900/40">
                                                                    <Upload className="w-2.5 h-2.5" />
                                                                    <span>Sumber: {metodeSyarat === 'simpeg' ? 'Upload Manual (Pengganti)' : 'Upload OPD'}</span>
                                                                </span>
                                                            ) : metodeSyarat === 'simpeg' ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-900/40">
                                                                    <Database className="w-2.5 h-2.5" />
                                                                    <span>Sumber: SIMPEG</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-900/40">
                                                                    <Upload className="w-2.5 h-2.5" />
                                                                    <span>Sumber: Upload OPD</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* E-File / Berkas (Single Button Principle) */}
                                                <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                                                    {hasManualUpload && urlManual ? (
                                                        <a
                                                            href={urlManual}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                                                            title={review.nama || 'Lihat Dokumen'}
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span>Lihat Dokumen</span>
                                                            <ExternalLink className="w-3 h-3 text-blue-400" />
                                                        </a>
                                                    ) : hasSimpegDocs ? (
                                                        daftarDokumen.length === 1 ? (
                                                            daftarDokumen[0]?.url ? (
                                                                <a
                                                                    href={daftarDokumen[0].url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                                                                    title={daftarDokumen[0].nama || 'Lihat Dokumen SIMPEG'}
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
                                                                        daftarDokumen
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs cursor-pointer"
                                                                title="Buka Riwayat Dokumen SIMPEG"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>Lihat Dokumen</span>
                                                                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                                                    {daftarDokumen.length}
                                                                </span>
                                                            </button>
                                                        )
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/40">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>Tidak Tersedia</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Verifikasi (Checkbox) */}
                                                <td className="py-3.5 px-4 text-center align-middle">
                                                    <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={isValid}
                                                            onChange={() => handleToggleChecklist(d.id)}
                                                            className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                                        />
                                                    </label>
                                                </td>

                                                {/* Catatan / Alasan */}
                                                <td className="py-3.5 px-4 lg:px-6 align-middle">
                                                    {isValid ? (
                                                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>Tervalidasi & Sesuai</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <input
                                                                type="text"
                                                                value={commentVal}
                                                                onChange={(e) =>
                                                                    handleCommentChange(d.id, e.target.value)
                                                                }
                                                                placeholder="Wajib isi alasan jika berkas tidak valid..."
                                                                className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400"
                                                            />
                                                            <p className="text-[10px] text-rose-500">
                                                                * Berikan instruksi yang jelas bagi pemohon/OPD.
                                                            </p>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FORM ACTION BUTTONS */}
                    <div className="flex items-center justify-end pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer ${
                                isSelesaiSelected
                                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan Perubahan...</span>
                                </>
                            ) : isSelesaiSelected ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Simpan & Selesaikan Usulan (Arsipkan)</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Perubahan Status</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL MULTI-DOKUMEN SIMPEG */}
            {simpegModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setSimpegModalOpen(false)}
                    />

                    <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Database className="w-4 h-4 text-blue-600" />
                                    <span>Daftar Dokumen SIMPEG</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">
                                    {activeSimpegTitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSimpegModalOpen(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Filter Tampilan Dokumen:
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSimpegFilter('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        simpegFilter === 'all'
                                            ? 'bg-blue-600 text-white shadow-2xs'
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    Semua ({activeSimpegDocs.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSimpegFilter('latest')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        simpegFilter === 'latest'
                                            ? 'bg-blue-600 text-white shadow-2xs'
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    Terbaru Saja
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
                            {displayedSimpegDocs.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    Tidak ada dokumen yang ditemukan.
                                </div>
                            ) : (
                                displayedSimpegDocs.map((doc, idx) => {
                                    const docName = doc.nama || `Dokumen #${idx + 1}`;
                                    const docUrl = doc.url || null;
                                    const docDate = doc.tanggal || null;
                                    const docUrutan = doc.urutan ?? '-';

                                    return (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {docName}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                                        <span>Urutan: {docUrutan}</span>
                                                        {docDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {docDate}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {docUrl ? (
                                                <a
                                                    href={docUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex-shrink-0 transition-colors shadow-2xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Buka</span>
                                                </a>
                                            ) : (
                                                <span className="text-[11px] text-rose-500 font-semibold flex-shrink-0">
                                                    URL tidak tersedia
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSimpegModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ZOOM QR CODE */}
            {qrModalOpen && qr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setQrModalOpen(false)}
                    />

                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 text-center animate-in fade-in zoom-in-95 duration-150 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                QR Code Tiket
                            </h3>
                            <button
                                type="button"
                                onClick={() => setQrModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl inline-block border border-slate-200 dark:border-slate-700">
                            <img
                                src={`data:image/svg+xml;base64,${qr}`}
                                alt="QR Code Tiket"
                                className="w-56 h-56 mx-auto"
                            />
                        </div>

                        <div className="space-y-1">
                            <p className="font-mono text-base font-black text-blue-600 dark:text-blue-400">
                                {tiket.no_tiket}
                            </p>
                            <p className="text-xs text-slate-400">
                                Pindai QR untuk memeriksa status usulan secara publik.
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setQrModalOpen(false)}
                                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
