import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Edit3,
    ArrowLeft,
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
    XCircle,
    AlertCircle,
    Save,
    X,
    Lock,
    Check,
} from 'lucide-react';

export default function RootUserEdit({ profile = {}, bidang = [], pegawai = {} }) {
    // Form state
    const [email, setEmail] = useState(profile.email || '');
    const initialBidang = profile.bidang_id || (profile.role === 'pimpinan' ? 'pimpinan' : (profile.role === 'admin_bawah' ? 'admin_bawah' : (profile.role === 'admin_opd' ? 'admin_opd' : '')));
    const [bidangId, setBidangId] = useState(initialBidang);
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    // Confirmation Modal
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Pre-submit validation
    const handlePreSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!bidangId) newErrors.bidang_id = 'Pilih bidang / peranan terlebih dahulu.';
        if (!email.trim()) newErrors.email = 'Alamat email wajib diisi.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setConfirmModalOpen(true);
    };

    // Submit update to backend
    const handleConfirmSubmit = () => {
        setSubmitting(true);
        const payload = {
            username: profile.username,
            email: email.trim(),
            bidang_id: bidangId,
        };
        if (password.trim()) {
            payload.password = password.trim();
        }

        router.put(`/root/user/${profile.id}`, payload, {
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
        });
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

    const namaLengkap = pegawai.nama_lengkap || profile.nama || '-';
    const fotoUrl = pegawai.foto_url || profile.foto_url || null;

    return (
        <AuthenticatedLayout>
            <Head title={`Edit User - ${profile.nama || profile.username} - PILKB`} />

            <div className="space-y-6">
                {/* 1. Header Halaman */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40 mt-0.5">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Edit Data User
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Perbarui penempatan bidang, role, email, dan kredensial akun pengguna sistem PILKB.
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
                                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40">
                                    <User className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Foto & Data Pegawai SIMPEG
                                </h3>
                            </div>

                            {/* Foto Profil */}
                            <div className="flex flex-col items-center text-center">
                                {fotoUrl ? (
                                    <img
                                        src={fotoUrl}
                                        alt={namaLengkap}
                                        className="w-28 h-36 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-28 h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm"
                                    style={{ display: fotoUrl ? 'none' : 'flex' }}
                                >
                                    <User className="w-10 h-10 mb-1 opacity-50" />
                                    <span className="text-[10px] font-semibold">{getInitials(namaLengkap)}</span>
                                </div>

                                <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-3 max-w-[220px] truncate" title={namaLengkap}>
                                    {namaLengkap}
                                </h4>
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap justify-center">
                                    <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                        NIP: {profile.username}
                                    </span>
                                </div>
                            </div>

                            {/* Rincian Atribut SIMPEG */}
                            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-blue-500" /> TTL
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                        {pegawai.ttl || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Award className="w-3.5 h-3.5 text-emerald-500" /> Golongan
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                        {pegawai.ket_gol || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Jabatan
                                    </span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right line-clamp-2 max-w-[180px]" title={pegawai.nama_jab || '-'}>
                                        {pegawai.nama_jab || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-50 dark:border-slate-800/50">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <Building2 className="w-3.5 h-3.5 text-purple-500" /> Unit Kerja
                                    </span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right line-clamp-2 max-w-[180px]" title={pegawai.ket_ukerja || '-'}>
                                        {pegawai.ket_ukerja || '-'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start gap-2 py-1">
                                    <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
                                        <BookOpen className="w-3.5 h-3.5 text-rose-500" /> Agama
                                    </span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                                        {pegawai.ket_agama || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sisi Kanan: Form Update Akun (lg:col-span-8) */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handlePreSubmit} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Formulir Edit Akun Pengguna
                                </h3>
                            </div>

                            {/* Field NIP (Readonly / Disabled) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nomor Induk Pegawai (NIP / Username)
                                </label>
                                <input
                                    type="text"
                                    value={profile.username || ''}
                                    disabled
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                />
                                <p className="mt-1 text-[11px] text-slate-400">
                                    NIP akun tidak dapat diubah karena terikat langsung dengan data SIMPEG.
                                </p>
                            </div>

                            {/* Nama Lengkap (Readonly) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nama Lengkap Pegawai
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={namaLengkap}
                                        readOnly
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

                            {/* Unit Kerja (Readonly) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Unit Kerja (SKPD)
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={pegawai.ket_ukerja || '-'}
                                        readOnly
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

                            {/* Reset Password (Opsional) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Reset Password Baru (Opsional)
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Kosongkan jika tidak ingin mereset password akun..."
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Biarkan kosong jika tetap menggunakan password saat ini.
                                </p>
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
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Update Data User</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 3. Modal Konfirmasi Update */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40">
                                    <Edit3 className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Konfirmasi Update User
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
                                Apakah Anda yakin ingin menyimpan perubahan data user{' '}
                                <strong className="font-bold text-slate-900 dark:text-white">
                                    {namaLengkap}
                                </strong>
                                ?
                            </p>
                            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">NIP / Username:</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{profile.username}</span>
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
                                {password.trim() && (
                                    <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                                        <span>Status Password:</span>
                                        <span>Akan Direset</span>
                                    </div>
                                )}
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
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Ya, Simpan Perubahan</span>
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
