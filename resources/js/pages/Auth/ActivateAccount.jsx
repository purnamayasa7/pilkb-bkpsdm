import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    Check,
    X,
    AlertCircle,
    ArrowRight,
    User,
    Mail,
    Shield,
    Sparkles,
    AlertTriangle,
    KeyRound,
    Building2,
    CheckCircle2,
} from 'lucide-react';

export default function ActivateAccount({
    invalidToken = false,
    errorMessage = null,
    user = null,
    token = '',
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Password criteria helpers
    const criteria = {
        minChar: data.password.length >= 8,
        hasUpper: /[A-Z]/.test(data.password),
        hasLower: /[a-z]/.test(data.password),
        hasNumber: /[0-9]/.test(data.password),
        hasSymbol: /[^A-Za-z0-9]/.test(data.password),
    };

    const criteriaCount = Object.values(criteria).filter(Boolean).length;
    const isMatched = data.password && data.password === data.password_confirmation;

    const getStrengthColor = () => {
        if (criteriaCount <= 2) return 'bg-rose-500';
        if (criteriaCount <= 4) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getStrengthLabel = () => {
        if (!data.password) return 'Belum Diisi';
        if (criteriaCount <= 2) return 'Lemah';
        if (criteriaCount <= 4) return 'Sedang';
        return 'Sangat Kuat';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/aktivasi-akun/${token}`, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors">
            <Head title="Aktivasi Akun & Atur Kata Sandi - PILKB" />

            {/* Brand Header */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20 text-white mb-4">
                    <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Aktivasi Akun Pengguna
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Pusat Informasi Layanan Kepegawaian Buleleng (PILKB)
                </p>
            </div>

            {/* Main Container */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
                {invalidToken ? (
                    /* Error / Expired State Card */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl text-center space-y-5">
                        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Tautan Aktivasi Tidak Valid / Kedaluwarsa
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                {errorMessage ||
                                    'Tautan aktivasi akun tidak ditemukan, telah kedaluwarsa, atau akun telah diaktifkan sebelumnya.'}
                            </p>
                        </div>

                        {user && (
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-xs text-left space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">NIP:</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {user.username}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Nama:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {user.nama}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <a
                                href="/login"
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
                            >
                                <span>Kembali ke Halaman Login</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ) : (
                    /* Active Form Card */
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
                        {/* User Identity Banner */}
                        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b border-blue-200/60 dark:border-blue-900/40">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                                    Data Pengguna Terdaftar
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">NIP / Username</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                        {user?.username}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Nama Pegawai</span>
                                    <span className="font-semibold text-slate-900 dark:text-white truncate block" title={user?.nama}>
                                        {user?.nama}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Email</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate block" title={user?.email}>
                                        {user?.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Peranan / Role</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {user?.nama_role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Activation Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                                    Buat Kata Sandi Baru
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Tentukan kata sandi yang aman dan mudah Anda ingat untuk masuk ke sistem PILKB.
                                </p>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Kata Sandi Baru <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan kata sandi baru..."
                                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                                            errors.password
                                                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 focus:ring-rose-500/20'
                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{errors.password}</span>
                                    </p>
                                )}
                            </div>

                            {/* Strength Meter */}
                            {data.password && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400">Kekuatan Sandi:</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                            {getStrengthLabel()}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: `${(criteriaCount / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Ketik ulang kata sandi baru..."
                                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                                            errors.password_confirmation
                                                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 focus:ring-rose-500/20'
                                                : isMatched && data.password_confirmation
                                                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-white focus:ring-emerald-500/20'
                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{errors.password_confirmation}</span>
                                    </p>
                                )}
                            </div>

                            {/* Requirements Checklist */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1.5">
                                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Syarat Keamanan Kata Sandi:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    <div className={`flex items-center gap-1.5 ${criteria.minChar ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                        {criteria.minChar ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />}
                                        <span>Minimal 8 karakter</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${criteria.hasUpper && criteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                        {criteria.hasUpper && criteria.hasLower ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />}
                                        <span>Huruf besar & kecil</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                        {criteria.hasNumber ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />}
                                        <span>Mengandung angka (0-9)</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${criteria.hasSymbol ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                        {criteria.hasSymbol ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />}
                                        <span>Karakter khusus / simbol</span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Menyimpan & Mengaktifkan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Simpan Sandi & Aktifkan Akun</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Footer link */}
                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    <span>Sudah memiliki akun aktif? </span>
                    <a
                        href="/login"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Masuk ke PILKB
                    </a>
                </div>
            </div>
        </div>
    );
}
