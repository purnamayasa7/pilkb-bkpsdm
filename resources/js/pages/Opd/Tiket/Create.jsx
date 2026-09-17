import React, { useState, useEffect, useId } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { getInitials } from '@/utils/initials';
import {
    FilePlus,
    UserCheck,
    Check,
    Copy,
    Search,
    Printer,
    ArrowRight,
    ArrowLeft,
    Info,
    AlertCircle,
    CheckCircle2,
    XCircle,
    X,
    UploadCloud,
    FileText,
    Layers,
    User,
    Mail,
    Phone,
    Briefcase,
    Award,
    Building2,
    Calendar,
    QrCode,
    Sparkles,
    ShieldCheck,
    ExternalLink,
    Clock,
} from 'lucide-react';

export default function Create({
    auth,
    step = 1,
    bidang = [],
    data: sessionData = {},
    syarat = [],
    nama_layanan = null,
    tiket = null,
    qr = null,
}) {
    const { flash = {} } = usePage().props;

    // STEPPER TITLES
    const stepsConfig = [
        { num: 1, title: 'Input NIP', desc: 'Identifikasi ASN' },
        { num: 2, title: 'Pilih Layanan', desc: 'Bidang & Layanan' },
        { num: 3, title: 'Syarat Berkas', desc: 'SIMPEG & Upload' },
        { num: 4, title: 'Tiket Dibuat', desc: 'Bukti Pengajuan' },
    ];

    // MODAL PETUNJUK
    const [petunjukOpen, setPetunjukOpen] = useState(false);

    // ==========================================
    // STEP 1 STATES
    // ==========================================
    const [nip, setNip] = useState(sessionData.nip || '');
    const [email, setEmail] = useState(sessionData.email || '');
    const [loadingCekPegawai, setLoadingCekPegawai] = useState(false);
    const [pegawaiData, setPegawaiData] = useState(null);
    const [pegawaiModalOpen, setPegawaiModalOpen] = useState(false);
    const [step1Error, setStep1Error] = useState(null);

    // Check NIP via SIMPEG API
    const handleCekPegawai = async () => {
        if (!nip.trim()) {
            setStep1Error('Silakan masukkan NIP terlebih dahulu.');
            return;
        }

        setStep1Error(null);
        setLoadingCekPegawai(true);

        try {
            const res = await fetch(`/adminOpd/get-pegawai/${encodeURIComponent(nip.trim())}`);
            const result = await res.json();

            if (!result.success) {
                setStep1Error(result.message || 'Data pegawai tidak ditemukan.');
                setPegawaiData(null);
            } else {
                setPegawaiData(result.data);
                setPegawaiModalOpen(true);
            }
        } catch (err) {
            setStep1Error('Terjadi kesalahan saat memeriksa data pegawai.');
        } finally {
            setLoadingCekPegawai(false);
        }
    };

    const handlePilihPegawai = () => {
        if (pegawaiData) {
            setNip(pegawaiData.nip || nip);
            if (pegawaiData.email) {
                setEmail(pegawaiData.email);
            }
        }
        setPegawaiModalOpen(false);
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setStep1Error(null);

        if (!nip.trim()) {
            setStep1Error('NIP wajib diisi.');
            return;
        }
        if (!email.trim()) {
            setStep1Error('Email wajib diisi untuk notifikasi usulan.');
            return;
        }

        router.post('/adminOpd/tiket/step', {
            step: 1,
            nip: nip.trim(),
            email: email.trim(),
        });
    };

    // ==========================================
    // STEP 2 STATES
    // ==========================================
    const [selectedBidang, setSelectedBidang] = useState(sessionData.bidang_id || '');
    const [selectedLayanan, setSelectedLayanan] = useState(sessionData.layanan_id || '');
    const [layananList, setLayananList] = useState([]);
    const [loadingLayanan, setLoadingLayanan] = useState(false);
    const [step2Error, setStep2Error] = useState(null);

    const selectedLayananObj = layananList.find((l) => String(l.id) === String(selectedLayanan));
    const satuanMap = { hari: 'Hari', minggu: 'Minggu', bulan: 'Bulan', hari_kerja: 'Hari', hari_kalender: 'Hari' };
    const getEstimasiWaktu = (target, satuan) => {
        if (!target) return null;
        return `${target} ${satuanMap[satuan] ?? satuan ?? 'Hari'}`;
    };

    // Fetch Layanan saat Bidang berubah
    useEffect(() => {
        if (step === 2 && selectedBidang) {
            setLoadingLayanan(true);
            fetch(`/adminOpd/get-layanan/${selectedBidang}`)
                .then((res) => res.json())
                .then((data) => {
                    setLayananList(Array.isArray(data) ? data : []);
                    setLoadingLayanan(false);
                })
                .catch(() => {
                    setLayananList([]);
                    setLoadingLayanan(false);
                });
        }
    }, [selectedBidang, step]);

    const handleStep2Submit = (e) => {
        e.preventDefault();
        setStep2Error(null);

        if (!selectedBidang) {
            setStep2Error('Silakan pilih Bidang layanan.');
            return;
        }
        if (!selectedLayanan) {
            setStep2Error('Silakan pilih Layanan yang ingin diajukan.');
            return;
        }

        router.post('/adminOpd/tiket/step', {
            step: 2,
            bidang_id: selectedBidang,
            layanan_id: selectedLayanan,
        });
    };

    // ==========================================
    // STEP 3 STATES
    // ==========================================
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [checkedSyarat, setCheckedSyarat] = useState({});
    const [noHp, setNoHp] = useState('');
    const [konfirmasiOpen, setKonfirmasiOpen] = useState(false);
    const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
    const [step3Error, setStep3Error] = useState(null);

    // Modal preview e-file SIMPEG
    const [simpegModalOpen, setSimpegModalOpen] = useState(false);
    const [activeSimpegDocs, setActiveSimpegDocs] = useState([]);
    const [activeSimpegTitle, setActiveSimpegTitle] = useState('');

    // Otomatis centang syarat yang dokumennya tersedia di SIMPEG sejak awal
    useEffect(() => {
        if (Array.isArray(syarat) && syarat.length > 0) {
            setCheckedSyarat((prev) => {
                const next = { ...prev };
                syarat.forEach((item) => {
                    const sy = item.syarat || item;
                    const isSimpeg = sy.metode === 'simpeg';
                    if (isSimpeg && item.tersedia) {
                        next[sy.id] = true;
                    }
                });
                return next;
            });
        }
    }, [syarat]);

    const handleFileChange = (syaratId, file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('File harus berformat PDF!');
            return;
        }
        if (file.size > 1024 * 1024) {
            alert('Ukuran file maksimal 1 MB!');
            return;
        }

        setUploadedFiles((prev) => ({
            ...prev,
            [syaratId]: file,
        }));

        // Otomatis centang checkbox "Syarat Terpenuhi" setelah upload PDF berhasil
        setCheckedSyarat((prev) => ({
            ...prev,
            [syaratId]: true,
        }));
    };

    const handleRemoveFile = (syaratId) => {
        setUploadedFiles((prev) => {
            const copy = { ...prev };
            delete copy[syaratId];
            return copy;
        });

        // Hapus centang checkbox saat file dihapus
        setCheckedSyarat((prev) => {
            const copy = { ...prev };
            delete copy[syaratId];
            return copy;
        });
    };

    const handleCheckToggle = (syaratId) => {
        setCheckedSyarat((prev) => ({
            ...prev,
            [syaratId]: !prev[syaratId],
        }));
    };

    const getSimpegDocUrl = (doc) => doc?.preview_url || doc?.url || doc?.file_url || null;
    const getSimpegDocName = (doc, idx) => doc?.label || doc?.nama_file || doc?.nama || doc?.keterangan || (idx !== undefined ? `Dokumen #${idx + 1}` : 'Dokumen SIMPEG');

    const handleOpenSimpegDocs = (item) => {
        const docs = item.dokumen || [];

        // Jika hanya 1 dokumen dan ada preview_url/url → buka langsung di tab baru
        if (docs.length === 1) {
            const directUrl = getSimpegDocUrl(docs[0]);
            if (directUrl) {
                window.open(directUrl, '_blank', 'noreferrer');
                return;
            }
        }

        // Jika item memiliki URL langsung di level atas (fallback)
        const itemUrl = getSimpegDocUrl(item);
        if (docs.length === 0 && itemUrl) {
            window.open(itemUrl, '_blank', 'noreferrer');
            return;
        }

        // Jika lebih dari 1 dokumen atau tidak ada direct URL → tampilkan modal
        setActiveSimpegTitle(item.syarat?.syarat || 'Dokumen SIMPEG');
        setActiveSimpegDocs(docs);
        setSimpegModalOpen(true);
    };

    const handleFinalSubmit = () => {
        setStep3Error(null);
        setIsSubmittingFinal(true);

        const formData = new FormData();
        formData.append('step', '3');
        if (noHp) {
            formData.append('no_hp', noHp);
        }

        // Tambahkan berkas upload manual
        Object.entries(uploadedFiles).forEach(([syaratId, file]) => {
            if (file) {
                formData.append(`dokumen[${syaratId}]`, file);
            }
        });

        router.post('/adminOpd/tiket/step', formData, {
            forceFormData: true,
            onSuccess: () => {
                setKonfirmasiOpen(false);
                setIsSubmittingFinal(false);
            },
            onError: (errors) => {
                setIsSubmittingFinal(false);
                setKonfirmasiOpen(false);
                setStep3Error(Object.values(errors)[0] || 'Terjadi kesalahan saat memproses pengajuan.');
            },
        });
    };

    // ==========================================
    // STEP 4 STATES
    // ==========================================
    const [copied, setCopied] = useState(false);
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={`Pengajuan Layanan Baru - Tahap ${step} - PILKB`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                <FilePlus className="w-5 h-5" />
                            </span>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Pengajuan Layanan Baru
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11">
                            Lengkapi data usulan kepegawaian melalui 4 tahapan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setPetunjukOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <Info className="w-4 h-4 text-blue-600" />
                            <span>Petunjuk Pengajuan</span>
                        </button>

                        {step > 1 && step < 4 && (
                            <Link
                                href="/adminOpd/tiket/reset"
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/50 transition-colors shadow-2xs cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                <span>Batalkan Sesi</span>
                            </Link>
                        )}
                    </div>
                </div>


                {/* STEPPER WIZARD TRACKER */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-6">
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
                        {/* Connecting Line Track: dari titik tengah Kolom 1 (12.5%) ke titik tengah Kolom 4 (87.5%) */}
                        <div className="absolute top-4 sm:top-5 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{
                                    width: step === 1 ? '0%' : step === 2 ? '33.333%' : step === 3 ? '66.666%' : '100%',
                                }}
                            />
                        </div>

                        {stepsConfig.map((s) => {
                            const isCompleted = step > s.num;
                            const isActive = step === s.num;

                            return (
                                <div key={s.num} className="flex flex-col items-center text-center z-10">
                                    <div
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-xs ${
                                            isCompleted
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-950/60'
                                                : isActive
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/60'
                                                : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                                        }`}
                                    >
                                        {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.num}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs sm:text-sm font-bold truncate max-w-full ${
                                            isActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : isCompleted
                                                ? 'text-slate-900 dark:text-white'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        {s.title}
                                    </span>
                                    <span className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
                                        {s.desc}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ======================================================== */}
                {/* STEP 1: INPUT NIP & EMAIL                                */}
                {/* ======================================================== */}
                {step === 1 && (
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                                <span>Tahap 1: Masukkan NIP Pegawai</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Masukkan NIP yang bersangkutan dan cek data pegawai di database SIMPEG.
                            </p>
                        </div>

                        {step1Error && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{step1Error}</span>
                            </div>
                        )}

                        <form onSubmit={handleStep1Submit} className="space-y-6 max-w-2xl mx-auto">
                            {/* Input NIP */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Nomor Induk Pegawai (NIP) <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={nip}
                                            onChange={(e) => setNip(e.target.value)}
                                            placeholder="Contoh: 198501012010011001"
                                            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCekPegawai}
                                        disabled={loadingCekPegawai}
                                        className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                                    >
                                        {loadingCekPegawai ? (
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                        <span>Cek Data</span>
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Klik tombol Cek Data untuk memastikan ASN terdaftar pada instansi Anda.
                                </p>
                            </div>

                            {/* Input Email */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                    Email Notifikasi <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama.pegawai@bulelengkab.go.id"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Notifikasi perkembangan status tiket akan dikirimkan otomatis ke alamat email ini.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Lanjutkan ke Pemilihan Layanan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ======================================================== */}
                {/* STEP 2: PILIH BIDANG & LAYANAN                           */}
                {/* ======================================================== */}
                {step === 2 && (
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-600" />
                                <span>Tahap 2: Pilih Bidang & Layanan Kepegawaian</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Tentukan bidang layanan tujuan dan jenis permohonan kepegawaian yang diajukan.
                            </p>
                        </div>

                        {/* Summary Pegawai Banner */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-400">Pegawai Terpilih:</p>
                                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                    {sessionData.nama || '-'}
                                </p>
                                <p className="text-xs font-mono text-slate-500">
                                    NIP: {sessionData.nip} • {sessionData.unit || 'BKPSDM'}
                                </p>
                            </div>
                        </div>

                        {step2Error && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{step2Error}</span>
                            </div>
                        )}

                        <form onSubmit={handleStep2Submit} className="space-y-6 max-w-3xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Dropdown Bidang */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                        Pilih Bidang Layanan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={selectedBidang}
                                        onChange={(e) => {
                                            setSelectedBidang(e.target.value);
                                            setSelectedLayanan('');
                                        }}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                                        required
                                    >
                                        <option value="">-- Pilih Bidang BKPSDM --</option>
                                        {bidang.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.nama_bidang || b.bidang}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dropdown Layanan */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                        Pilih Jenis Layanan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={selectedLayanan}
                                        onChange={(e) => setSelectedLayanan(e.target.value)}
                                        disabled={!selectedBidang || loadingLayanan}
                                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    >
                                        <option value="">
                                            {loadingLayanan
                                                ? 'Memuat layanan...'
                                                : selectedBidang
                                                ? '-- Pilih Layanan --'
                                                : '-- Pilih bidang terlebih dahulu --'}
                                        </option>
                                        {layananList.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.nama_layanan}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Card Ringkasan Informasi Layanan & Target Waktu (SOP) */}
                            {selectedLayananObj && (
                                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 shrink-0">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                                                    Layanan Terpilih
                                                </span>
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                    {selectedLayananObj.nama_layanan}
                                                </h4>
                                            </div>
                                        </div>

                                        {selectedLayananObj.target_waktu && (
                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                    Target Waktu:
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 shadow-2xs">
                                                    <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                    <span>{getEstimasiWaktu(selectedLayananObj.target_waktu, selectedLayananObj.satuan_waktu)}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                        <p className="flex items-center gap-1.5">
                                            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span>Estimasi waktu penyelesaian mengacu pada Standar Operasional Prosedur (SOP) resmi BKPSDM.</span>
                                        </p>
                                        {selectedLayananObj.deskripsi && (
                                            <p className="mt-1 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed text-xs">
                                                {selectedLayananObj.deskripsi}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-3 pt-4">
                                <Link
                                    href="/adminOpd/tiket/create?step=1"
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Kembali ke Tahap 1</span>
                                </Link>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
                                >
                                    <span>Lanjut ke Checklist Syarat</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ======================================================== */}
                {/* STEP 3: CHECKLIST SYARAT & UPLOAD BERKAS                 */}
                {/* ======================================================== */}
                {step === 3 && (
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                                <span>Tahap 3: Verifikasi Berkas & Persyaratan</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Periksa ketersediaan berkas dari SIMPEG dan upload dokumen persyaratan tambahan berformat PDF (maks 1 MB).
                            </p>
                        </div>

                        {/* Info Ringkasan Pengajuan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                            <div>
                                <span className="text-slate-400 block text-[11px]">Pegawai Pemohon</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {sessionData.nama} ({sessionData.nip})
                                </span>
                                <span className="text-slate-500 block text-[11px] mt-0.5">
                                    {sessionData.unit}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[11px]">Layanan Diajukan</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                    {nama_layanan || 'Layanan Terpilih'}
                                </span>
                                <span className="text-slate-500 block text-[11px] mt-0.5">
                                    Email: {sessionData.email}
                                </span>
                            </div>
                        </div>

                        {step3Error && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{step3Error}</span>
                            </div>
                        )}

                        {/* DAFTAR PERSYARATAN */}
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Berkas Persyaratan ({syarat.length} Dokumen)
                                </h3>
                                <span className="text-[11px] font-medium text-slate-400">
                                    {Object.values(checkedSyarat).filter(Boolean).length} dari {syarat.length} terkonfirmasi
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2.5">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-[11px] leading-relaxed">
                                    <strong>Petunjuk:</strong>Untuk berkas yang <strong>bersifat opsional</strong>, Anda dapat langsung mencentang kotak verifikasi untuk mengonfirmasi kelengkapan.
                                </p>
                            </div>

                            {syarat.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <FileText className="w-7 h-7 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                                    <p className="text-xs font-medium">Tidak ada berkas persyaratan khusus untuk layanan ini.</p>
                                </div>
                            ) : (
                                syarat.map((item, idx) => {
                                    const sy = item.syarat || item;
                                    const isSimpeg = sy.metode === 'simpeg';
                                    const isTersediaSimpeg = item.tersedia;
                                    const uploadedFile = uploadedFiles[sy.id];
                                    const isChecked = !!checkedSyarat[sy.id];

                                    // Tentukan label dan warna status yang adaptif:
                                    let statusLabel = 'Belum\nTerpenuhi';
                                    let statusColor = 'text-slate-400';

                                    if (isChecked) {
                                        if (isSimpeg && isTersediaSimpeg) {
                                            statusLabel = 'Terpenuhi (SIMPEG) ✓';
                                            statusColor = 'text-emerald-600 dark:text-emerald-400';
                                        } else if (uploadedFile) {
                                            statusLabel = 'Terunggah ✓';
                                            statusColor = 'text-emerald-600 dark:text-emerald-400';
                                        } else {
                                            statusLabel = 'Dikonfirmasi (Opsional) ✓';
                                            statusColor = 'text-teal-600 dark:text-teal-400';
                                        }
                                    }

                                    return (
                                        <div
                                            key={sy.id}
                                            className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-2xs overflow-hidden"
                                        >
                                            {/* === BARIS UTAMA: 2 kolom (info | checkbox) === */}
                                            <div className="grid grid-cols-[1fr_auto] gap-3 items-start p-4">
                                                {/* Kolom Kiri: Nomor + Nama + Badge */}
                                                <div className="flex items-start gap-2.5 min-w-0">
                                                    <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug">
                                                            {sy.syarat}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                            {isSimpeg ? (
                                                                isTersediaSimpeg ? (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                                                        <Check className="w-3 h-3" />
                                                                        <span>Tersedia di SIMPEG</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                                        <AlertCircle className="w-3 h-3" />
                                                                        <span>Belum Ada di SIMPEG (Upload Manual)</span>
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                                                    <UploadCloud className="w-3 h-3" />
                                                                    <span>Wajib Upload Manual</span>
                                                                </span>
                                                            )}

                                                            {isSimpeg && isTersediaSimpeg && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenSimpegDocs(item)}
                                                                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                    <span>
                                                                        Lihat Arsip
                                                                        {item.dokumen?.length > 0 ? ` (${item.dokumen.length})` : ''}
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Kolom Kanan: Checkbox "Syarat Terpenuhi" (Bisa di-toggle mandiri untuk syarat opsional) */}
                                                <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0 min-w-[90px] border-l border-slate-100 dark:border-slate-700 pl-3">
                                                    <label
                                                        className="flex flex-col items-center gap-1.5 cursor-pointer select-none group p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                                                        title={
                                                            isChecked
                                                                ? 'Klik untuk membatalkan konfirmasi'
                                                                : 'Klik untuk konfirmasi berkas terpenuhi / opsional'
                                                        }
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleCheckToggle(sy.id)}
                                                            className="w-5 h-5 rounded-md text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer transition-transform group-hover:scale-105"
                                                        />
                                                        <span className={`text-[10px] font-semibold text-center leading-tight transition-colors ${statusColor}`}>
                                                            {statusLabel}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* File Upload Zone (Bila metode upload atau SIMPEG tidak tersedia) */}
                                            {(!isSimpeg || !isTersediaSimpeg) && (
                                                <div className="px-4 pb-4 pt-0">
                                                    {uploadedFile ? (
                                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                                    {uploadedFile.name}
                                                                </span>
                                                                <span className="text-slate-400 text-[11px] flex-shrink-0">
                                                                    ({(uploadedFile.size / 1024).toFixed(1)} KB)
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile(sy.id)}
                                                                className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-3 text-center cursor-pointer block transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                                                            <input
                                                                type="file"
                                                                accept="application/pdf"
                                                                onChange={(e) => handleFileChange(sy.id, e.target.files[0])}
                                                                className="hidden"
                                                            />
                                                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                                <UploadCloud className="w-4 h-4 text-blue-600" />
                                                                <span className="font-medium">
                                                                    Pilih Berkas PDF (Maks. 1 MB)
                                                                </span>
                                                            </div>
                                                        </label>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input No HP Pemohon */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                                Nomor WhatsApp Pemohon (Opsional)
                            </label>
                            <div className="relative max-w-sm">
                                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={noHp}
                                    onChange={(e) => setNoHp(e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-3 pt-4">
                            <Link
                                href="/adminOpd/tiket/create?step=2"
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Kembali ke Tahap 2</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setKonfirmasiOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Ajukan Usulan Layanan</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* STEP 4: TIKET BERHASIL DIBUAT (BUKTI PENGAJUAN)           */}
                {/* ======================================================== */}
                {step === 4 && tiket && (
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6 text-center">
                        {/* Success Badge */}
                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                Pengajuan Berhasil Terdaftar!
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                Usulan Anda telah resmi masuk ke BKPSDM Kabupaten Buleleng.
                            </p>
                        </div>

                        {/* TICKET PROMINENT CARD */}
                        <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 p-6 sm:p-8 text-left space-y-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 dark:border-slate-800 pb-4">
                                <div>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                        Nomor Tiket Layanan
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono font-extrabold text-2xl text-blue-600 dark:text-blue-400">
                                            {tiket.no_tiket}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(tiket.no_tiket)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                            title="Salin Nomor Tiket"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-800 self-start sm:self-auto">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    <span>Menunggu Verifikasi</span>
                                </span>
                            </div>

                            {/* 2-Column Details on Tablet/Desktop */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                                {/* QR Code */}
                                {qr && (
                                    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                                        <img
                                            src={`data:image/svg+xml;base64,${qr}`}
                                            alt="QR Tiket"
                                            className="w-32 h-32"
                                        />
                                        <span className="text-[10px] text-slate-400 mt-2 text-center">
                                            Scan QR pelacakan publik
                                        </span>
                                    </div>
                                )}

                                {/* Ticket Details */}
                                <div className={`space-y-3 text-xs ${qr ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
                                    <div className="flex justify-between py-1.5 border-b border-blue-50 dark:border-slate-800">
                                        <span className="text-slate-400">Pegawai</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                            {tiket.nama} ({tiket.nip})
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-blue-50 dark:border-slate-800">
                                        <span className="text-slate-400">Layanan</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                            {tiket.layanan?.nama_layanan || '-'}
                                        </span>
                                    </div>
                                    {tiket.layanan?.target_waktu && (
                                        <div className="flex justify-between py-1.5 border-b border-blue-50 dark:border-slate-800">
                                            <span className="text-slate-400">Target Penyelesaian</span>
                                            <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 text-right">
                                                <Clock className="w-3 h-3" />
                                                <span>{getEstimasiWaktu(tiket.layanan.target_waktu, tiket.layanan.satuan_waktu)}</span>
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-1.5 border-b border-blue-50 dark:border-slate-800">
                                        <span className="text-slate-400">Unit Kerja</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                            {tiket.nama_ukerja || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5">
                                        <span className="text-slate-400">Tanggal Pengajuan</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                            {new Date(tiket.tanggal || Date.now()).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <a
                                href={`/tiket/cetak/${encodeURIComponent(tiket.no_tiket)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Cetak Bukti Usulan (PDF)</span>
                            </a>

                            <Link
                                href="/adminOpd/tiket/create?step=1"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
                            >
                                <FilePlus className="w-4 h-4" />
                                <span>Ajukan Layanan Lain</span>
                            </Link>

                            <Link
                                href="/adminOpd/tiket"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors"
                            >
                                <span>Lihat Daftar Pengajuan</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODAL DETAIL PEGAWAI SIMPEG                              */}
            {/* ======================================================== */}
            {pegawaiModalOpen && pegawaiData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setPegawaiModalOpen(false)} />
                    <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                                <span>Detail Pegawai (SIMPEG)</span>
                            </h3>
                            <button type="button" onClick={() => setPegawaiModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* FOTO PEGAWAI */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center">
                                <div className="w-[190px] h-[235px] rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-md flex items-center justify-center flex-shrink-0">
                                    <img
                                        src={pegawaiData.foto_url || `https://simpegdev.bllkom.site/pegawai/foto/${pegawaiData.nip}`}
                                        alt={pegawaiData.nama_lengkap || 'Foto ASN'}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/templatepro/assets/img/demo/user-placeholder.svg';
                                        }}
                                        className="w-full h-full object-cover object-center"
                                    />
                                </div>
                                <span className="text-[11px] italic text-slate-400 mt-2.5">
                                    Data foto pada SIMPEG
                                </span>
                            </div>

                            {/* DETAIL DATA PEGAWAI */}
                            <div className="md:col-span-8 space-y-4">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                                    <div className="border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                            Nama Pegawai
                                        </span>
                                        <h4 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                                            {pegawaiData.nama_lengkap || '-'}
                                        </h4>
                                    </div>

                                    <div className="space-y-2.5 text-xs">
                                        {/* NIP */}
                                        <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <span className="text-rose-500 font-bold">#</span>
                                                <span>NIP</span>
                                            </span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                {pegawaiData.nip || '-'}
                                            </span>
                                        </div>

                                        {/* Golongan */}
                                        <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Award className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>Golongan</span>
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {pegawaiData.ket_gol || '-'}
                                            </span>
                                        </div>

                                        {/* Jabatan (nama_jab dari API) */}
                                        <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Jabatan</span>
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[260px] truncate">
                                                {pegawaiData.nama_jab || pegawaiData.jabatan || '-'}
                                            </span>
                                        </div>

                                        {/* Unit Kerja */}
                                        <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                                                <span>Unit Kerja</span>
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[260px] truncate">
                                                {pegawaiData.ket_ukerja || '-'}
                                            </span>
                                        </div>

                                        {/* Email */}
                                        <div className="flex items-center justify-between py-1.5">
                                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Mail className="w-3.5 h-3.5 text-sky-500" />
                                                <span>Email SIMPEG</span>
                                            </span>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {pegawaiData.email || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setPegawaiModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handlePilihPegawai}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                            >
                                <Check className="w-4 h-4" />
                                <span>Pilih Pegawai</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL KONFIRMASI FINAL                                   */}
            {/* ======================================================== */}
            {konfirmasiOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => !isSubmittingFinal && setKonfirmasiOpen(false)} />
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Konfirmasi Pengajuan Usulan
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Pastikan seluruh kelengkapan berkas telah diverifikasi.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                            <p className="text-slate-600 dark:text-slate-300">
                                Setelah diajukan, nomor tiket resmi akan diterbitkan dan berkas usulan akan langsung diteruskan ke tim verifikator BKPSDM.
                            </p>
                            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                                Total berkas terkonfirmasi: {Object.values(checkedSyarat).filter(Boolean).length} dari {syarat.length} dokumen.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                disabled={isSubmittingFinal}
                                onClick={() => setKonfirmasiOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold disabled:opacity-50"
                            >
                                Periksa Lagi
                            </button>
                            <button
                                type="button"
                                disabled={isSubmittingFinal}
                                onClick={handleFinalSubmit}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmittingFinal ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Ya, Ajukan Usulan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL PETUNJUK PENGAJUAN                                 */}
            {/* ======================================================== */}
            {petunjukOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setPetunjukOpen(false)} />
                    <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                <span>Petunjuk Pengajuan Layanan</span>
                            </h3>
                            <button type="button" onClick={() => setPetunjukOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold flex items-center justify-center flex-shrink-0">
                                    1
                                </span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Input NIP & Email</h4>
                                    <p className="text-slate-500 mt-0.5">
                                        Ketik NIP pegawai dan klik "Cek Data" untuk memastikan identitas pegawai terdaftar di instansi Anda.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold flex items-center justify-center flex-shrink-0">
                                    2
                                </span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Pilih Bidang & Layanan</h4>
                                    <p className="text-slate-500 mt-0.5">
                                        Pilih bidang tujuan di BKPSDM, lalu tentukan jenis layanan kepegawaian yang dibutuhkan.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold flex items-center justify-center flex-shrink-0">
                                    3
                                </span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Checklist & Upload Berkas</h4>
                                    <p className="text-slate-500 mt-0.5">
                                        Dokumen bertanda SIMPEG diambil langsung secara otomatis. Untuk dokumen non-SIMPEG, upload berkas PDF maksimal 1 MB.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold flex items-center justify-center flex-shrink-0">
                                    4
                                </span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Dapatkan Bukti Tiket</h4>
                                    <p className="text-slate-500 mt-0.5">
                                        Simpan nomor tiket atau cetak bukti PDF sebagai dokumen tanda terima sah pengajuan usulan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
                            <button
                                type="button"
                                onClick={() => setPetunjukOpen(false)}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL LIHAT BERKAS SIMPEG                                */}
            {/* ======================================================== */}
            {simpegModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSimpegModalOpen(false)} />
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Arsip SIMPEG: {activeSimpegTitle}
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Dokumen resmi yang terhubung dari e-File SIMPEG
                                </p>
                            </div>
                            <button type="button" onClick={() => setSimpegModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {activeSimpegDocs.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-6 text-center">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Berkas Terverifikasi di SIMPEG
                                    </p>
                                    <p className="text-[11px] text-slate-400 max-w-xs">
                                        File ini terdaftar di SIMPEG namun tidak memiliki tautan preview langsung.
                                        Dokumen akan diambil secara otomatis oleh sistem saat pengajuan diproses.
                                    </p>
                                </div>
                            ) : (
                                activeSimpegDocs.map((doc, idx) => {
                                    const docUrl = getSimpegDocUrl(doc);
                                    const docName = getSimpegDocName(doc, idx);

                                    return (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2"
                                        >
                                            <div className="truncate">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                                                    {docName}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {doc.tanggal ? `Tanggal: ${doc.tanggal}` : 'SIMPEG e-File Verified'}
                                                </span>
                                            </div>
                                            {docUrl ? (
                                                <a
                                                    href={docUrl}
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
        </AuthenticatedLayout>
    );
}
