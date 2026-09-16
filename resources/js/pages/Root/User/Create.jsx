import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    UserPlus,
    ArrowLeft,
    Search,
    User,
    Mail,
    Building2,
    Shield,
    Layers,
    Calendar,
    Award,
    Briefcase,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    Save,
    X,
    Info,
    Check,
} from 'lucide-react';

export default function RootUserCreate({ bidang = [] }) {
    // Form state
    const [nip, setNip] = useState('');
    const [email, setEmail] = useState('');
    const [bidangId, setBidangId] = useState('');

    // Pegawai data from SIMPEG
    const [pegawaiData, setPegawaiData] = useState(null);
    const [checkingNip, setCheckingNip] = useState(false);
    const [nipVerified, setNipVerified] = useState(false);
    const [nipError, setNipError] = useState('');
    const [errors, setErrors] = useState({});

    // Confirmation Modal
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Check NIP via backend SIMPEG API
    const handleCekPegawai = async () => {
        const cleanNip = nip.trim();
        if (!cleanNip) {
            setNipError('Masukkan NIP terlebih dahulu.');
            return;
        }

        setCheckingNip(true);
        setNipError('');
        setErrors((prev) => ({ ...prev, username: null }));

        try {
            const res = await fetch(`/root/api/pegawai/${cleanNip}`);
            const data = await res.json();

            if (!data || !data.status || !data.data) {
                setNipVerified(false);
                setPegawaiData(null);
                setNipError(data?.message || 'Data pegawai tidak ditemukan pada SIMPEG.');
            } else {
                setNipVerified(true);
                setPegawaiData(data.data);
                if (data.data.email && !email) {
                    setEmail(data.data.email);
                }
            }
        } catch (err) {
            setNipVerified(false);
            setPegawaiData(null);
            setNipError('Gagal menghubungkan ke server SIMPEG. Coba beberapa saat lagi.');
        } finally {
            setCheckingNip(false);
        }
    };

    // Reset when NIP changes
    const handleNipChange = (val) => {
        setNip(val);
        setNipVerified(false);
        setPegawaiData(null);
        setNipError('');
        setErrors((prev) => ({ ...prev, username: null }));
    };

    // Pre-submit validation
    const handlePreSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!nip.trim()) newErrors.username = 'NIP wajib diisi.';
        if (!nipVerified) newErrors.username = 'Silakan lakukan verifikasi NIP terlebih dahulu.';
        if (!bidangId) newErrors.bidang_id = 'Pilih bidang / peranan terlebih dahulu.';
        if (!email.trim()) newErrors.email = 'Alamat email wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setConfirmModalOpen(true);
    };

    // Submit form to backend
    const handleConfirmSubmit = () => {
        setSubmitting(true);
        router.post(
            '/root/user',
            {
                username: nip.trim(),
                email: email.trim(),
                bidang_id: bidangId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmModalOpen(false);
                    setSubmitting(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setConfirmModalOpen(false);
                    setSubmitting(false);
                },
            }
        );
    };

    // Helper: generate 2-letter initials
    const getInitials = (nama, fallback = 'U') => {
        if (!nama) return fallback;
        const parts = String(nama).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Helper: label role/bidang
    const getRoleLabel = (id) => {
        if (id === 'admin_bawah') return 'Admin Bawah (Front Office / Loket)';
        if (id === 'admin_opd') return 'Admin OPD (Pengusul SKPD)';
        if (id === 'pimpinan') return 'Pimpinan (Kepala Badan / Sekretaris)';
        const found = bidang.find((b) => String(b.id) === String(id));
        return found ? `Bidang: ${found.nama_bidang}` : id || '-';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah User Baru - PILKB" />

            <div className="space-y-6">
                {/* 1. Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 mt-0.5">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Tambah User Baru
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Daftarkan akun pegawai baru ke dalam sistem informasi kepegawaian PILKB.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/root/user"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Manajemen User</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Grid Form 2 Kolom Lebar Penuh (Sesuai Standard.md) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sisi Kiri: Foto & Ringkasan Pegawai SIMPEG (lg:col-span-4) */}
                    <div className="lg:col-span-4">
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <User className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Foto & Data Pegawai SIMPEG
                                </h3>
                            </div>

                            {/* Foto Profil */}
                            <div className="flex flex-col items-center text-center">
                                {pegawaiData?.foto_url ? (
                                    <img
                                        src={pegawaiData.foto_url}
                                        alt={pegawaiData.nama_lengkap || 'Foto Pegawai'}
                                        className="w-28 h-36 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-28 h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm"
                                    style={{ display: pegawaiData?.foto_url ? 'none' : 'flex' }}
                                >
                                    <User className="w-10 h-10 mb-1 opacity-50" />
                                    <span className="text-[10px] font-semibold">
                                        {pegawaiData ? getInitials(pegawaiData.nama_lengkap) : 'Belum Ada'}
                                    </span>
                                </div>

                                <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-3 max-w-[220px] truncate" title={pegawaiData?.nama_lengkap || '-'}>
                                    {pegawaiData?.nama_lengkap || 'Nama Pegawai'}
                                </h4>
                                <div className="mt-1">
                                    {nipVerified ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            NIP Terverifikasi
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            NIP: {nip || '-'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Rincian Atribut SIMPEG */}
                            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> TTL
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                        {pegawaiData?.ttl || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Award className="w-3.5 h-3.5 text-emerald-500" /> Golongan
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                        {pegawaiData?.ket_gol || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Jabatan
                                    </span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right line-clamp-2 max-w-[180px]" title={pegawaiData?.nama_jab || '-'}>
                                        {pegawaiData?.nama_jab || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Building2 className="w-3.5 h-3.5 text-purple-500" /> Unit Kerja
                                    </span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right line-clamp-2 max-w-[180px]" title={pegawaiData?.ket_ukerja || '-'}>
                                        {pegawaiData?.ket_ukerja || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <BookOpen className="w-3.5 h-3.5 text-rose-500" /> Agama
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                        {pegawaiData?.ket_agama || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sisi Kanan: Form Detail Akun (lg:col-span-8) */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handlePreSubmit} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Formulir Akun Pengguna
                                </h3>
                            </div>

                            {/* Field NIP + Tombol Cek SIMPEG */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nomor Induk Pegawai (NIP) <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={nip}
                                            onChange={(e) => handleNipChange(e.target.value)}
                                            placeholder="Masukkan 18 digit NIP pegawai..."
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-semibold transition-all focus:outline-none focus:ring-2 ${
                                                nipError || errors.username
                                                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 focus:ring-rose-500/20'
                                                    : nipVerified
                                                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-white focus:ring-emerald-500/20'
                                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500'
                                            }`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        disabled={checkingNip}
                                        onClick={handleCekPegawai}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer flex-shrink-0"
                                    >
                                        {checkingNip ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Memeriksa...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-3.5 h-3.5" />
                                                <span>Cek SIMPEG</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {nipError && (
                                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{nipError}</span>
                                    </p>
                                )}
                                {errors.username && !nipError && (
                                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{errors.username}</span>
                                    </p>
                                )}
                                {nipVerified && (
                                    <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>Data pegawai berhasil diverifikasi dari SIMPEG.</span>
                                    </p>
                                )}
                            </div>

                            {/* Nama Lengkap (Otomatis) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nama Lengkap Pegawai
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={pegawaiData?.nama_lengkap || ''}
                                        readOnly
                                        placeholder="Otomatis terisi dari data SIMPEG..."
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Dropdown Bidang / Peranan */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Bidang / Penempatan Peranan <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={bidangId}
                                        onChange={(e) => {
                                            setBidangId(e.target.value);
                                            setErrors((prev) => ({ ...prev, bidang_id: null }));
                                        }}
                                        className={`w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                                            errors.bidang_id
                                                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 focus:ring-rose-500/20'
                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                                        }`}
                                    >
                                        <option value="" disabled>Pilih Penempatan Bidang / Role</option>
                                        <option value="admin_bawah">Admin Bawah (Front Office / Loket)</option>
                                        <option value="admin_opd">Admin OPD (Pengusul SKPD)</option>
                                        <option value="pimpinan">Pimpinan (Kepala Badan / Sekretaris)</option>
                                        {bidang.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                Bidang: {b.nama_bidang}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.bidang_id && (
                                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{errors.bidang_id}</span>
                                    </p>
                                )}
                            </div>

                            {/* Unit Kerja (Otomatis) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Unit Kerja (SKPD)
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={pegawaiData?.ket_ukerja || ''}
                                        readOnly
                                        placeholder="Otomatis terisi dari data SIMPEG..."
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Alamat Email <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrors((prev) => ({ ...prev, email: null }));
                                        }}
                                        placeholder="contoh: nama.pegawai@bulelengkab.go.id"
                                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                                            errors.email
                                                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 focus:ring-rose-500/20'
                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                                        }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{errors.email}</span>
                                    </p>
                                )}
                            </div>

                            {/* Info Box Password */}
                            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-3 text-xs">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                                    <p className="font-semibold text-blue-900 dark:text-blue-200">
                                        Password Default Akun
                                    </p>
                                    <p className="leading-relaxed">
                                        Password awal otomatis diset menjadi <strong>5 digit terakhir NIP</strong> pengguna. Akun akan ditandai wajib mengganti password saat login pertama kali demi keamanan.
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link
                                    href="/root/user"
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
                                    <span>Simpan User Baru</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 3. Modal Konfirmasi Simpan */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                    <UserPlus className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Konfirmasi Simpan User
                                </h3>
                            </div>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setConfirmModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                Apakah Anda yakin ingin mendaftarkan akun untuk pegawai{' '}
                                <strong className="font-bold text-slate-900 dark:text-white">
                                    {pegawaiData?.nama_lengkap || nip}
                                </strong>{' '}
                                dengan penempatan bidang terpilih?
                            </p>
                            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">NIP / Username:</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{nip}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                                        {pegawaiData?.nama_lengkap || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Email:</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                                        {email}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Penempatan / Role:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                                        {getRoleLabel(bidangId)}
                                    </span>
                                </div>
                            </div>
                        </div>

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
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Ya, Simpan Akun</span>
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
