import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Key,
    Lock,
    ArrowLeft,
    Save,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    ShieldCheck,
    Loader2,
    Shield,
    Check,
} from 'lucide-react';

export default function ChangePassword({ mustChangePassword = false }) {
    const { flash = {}, errors: pageErrors = {} } = usePage().props;

    // Form inputs
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    // Toggle visibility
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Submission states
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Success state
    const isSuccess = Boolean(flash?.password_changed);

    const handleSubmit = (e) => {
        e.preventDefault();

        const clientErrors = {};
        if (!currentPassword) {
            clientErrors.current_password = 'Password saat ini wajib diisi.';
        }
        if (!password) {
            clientErrors.password = 'Password baru wajib diisi.';
        } else if (password.length < 8) {
            clientErrors.password = 'Password baru minimal 8 karakter.';
        }
        if (!passwordConfirmation) {
            clientErrors.password_confirmation = 'Konfirmasi password baru wajib diisi.';
        } else if (password !== passwordConfirmation) {
            clientErrors.password_confirmation = 'Konfirmasi password baru tidak cocok.';
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        router.post(
            '/change-password',
            {
                current_password: currentPassword,
                password: password,
                password_confirmation: passwordConfirmation,
            },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
                onError: (backendErrors) => {
                    setErrors(backendErrors || {});
                },
                onSuccess: () => {
                    setCurrentPassword('');
                    setPassword('');
                    setPasswordConfirmation('');
                },
            }
        );
    };

    const combinedErrors = { ...errors, ...pageErrors };

    return (
        <AuthenticatedLayout>
            <Head title="Ganti Password - PILKB" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0 mt-0.5">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Ganti Password
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akses sistem PILKB.
                            </p>
                        </div>
                    </div>

                    {!mustChangePassword && (
                        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Kembali ke Dashboard</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Warning Banner if mustChangePassword */}
                {mustChangePassword && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                            <div className="font-bold">Pemberitahuan Wajib Ganti Password</div>
                            <p className="text-amber-800/90 dark:text-amber-300 text-[11px] leading-relaxed">
                                Demi keamanan akun Anda, sistem mewajibkan Anda untuk mengganti kata sandi awal/bawaan sebelum melanjutkan ke menu lain. Silakan buat kata sandi baru di bawah ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* 2. Grid Layout Penuh (Sesuai Standard.md) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Kolom Kiri: Card Standar Keamanan & Panduan (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Standar Keamanan
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Kriteria pembuatan kata sandi
                                    </p>
                                </div>
                            </div>

                            {/* Checklist Syarat Password */}
                            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                                <div className="flex items-start gap-2.5">
                                    <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-200/80 dark:border-emerald-900/50">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className="text-[11px] leading-snug">
                                        Panjang kata sandi <strong>minimal 8 karakter</strong>.
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-200/80 dark:border-emerald-900/50">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className="text-[11px] leading-snug">
                                        Wajib <strong>berbeda</strong> dari kata sandi lama Anda.
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-200/80 dark:border-emerald-900/50">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className="text-[11px] leading-snug">
                                        Disarankan memadukan <strong>huruf besar, huruf kecil, dan angka</strong>.
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 border border-emerald-200/80 dark:border-emerald-900/50">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className="text-[11px] leading-snug">
                                        Hindari penggunaan tanggal lahir atau kombinasi angka berurutan.
                                    </span>
                                </div>
                            </div>

                            {/* Tips Card */}
                            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-300 text-[11px] leading-relaxed">
                                <div className="font-semibold flex items-center gap-1.5 mb-1">
                                    <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Penting:</span>
                                </div>
                                Jangan pernah membagikan kata sandi Anda kepada orang lain untuk menjaga keamanan data kepegawaian Anda.
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Card Formulir Ganti Kata Sandi (lg:col-span-8) */}
                    <div className="lg:col-span-8">
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Formulir Kata Sandi Baru
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Masukkan kata sandi lama, kemudian tentukan kata sandi baru untuk akun Anda.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Password Sekarang - Lebar Penuh */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Password Saat Ini <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => {
                                                setCurrentPassword(e.target.value);
                                                if (combinedErrors.current_password) {
                                                    setErrors((prev) => ({ ...prev, current_password: null }));
                                                }
                                            }}
                                            placeholder="Masukkan password saat ini..."
                                            className={`w-full pl-4 pr-10 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                                combinedErrors.current_password
                                                    ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {combinedErrors.current_password && (
                                        <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{combinedErrors.current_password}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Grid 2 Kolom untuk Password Baru & Konfirmasi */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    {/* Password Baru */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Password Baru <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNew ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (combinedErrors.password) {
                                                        setErrors((prev) => ({ ...prev, password: null }));
                                                    }
                                                }}
                                                placeholder="Minimal 8 karakter..."
                                                className={`w-full pl-4 pr-10 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                                    combinedErrors.password
                                                        ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                                        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(!showNew)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                            >
                                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {combinedErrors.password && (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>{combinedErrors.password}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Konfirmasi Password Baru */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Konfirmasi Password Baru <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                value={passwordConfirmation}
                                                onChange={(e) => {
                                                    setPasswordConfirmation(e.target.value);
                                                    if (combinedErrors.password_confirmation) {
                                                        setErrors((prev) => ({ ...prev, password_confirmation: null }));
                                                    }
                                                }}
                                                placeholder="Ulangi password baru..."
                                                className={`w-full pl-4 pr-10 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                                    combinedErrors.password_confirmation
                                                        ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                                        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                            >
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {combinedErrors.password_confirmation && (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>{combinedErrors.password_confirmation}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    {!mustChangePassword && (
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            <span>Batal</span>
                                        </Link>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Menyimpan...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Simpan Password Baru</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {isSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200/80 dark:border-emerald-900/50">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Password Berhasil Diganti!
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                                Kata sandi akun Anda telah diperbarui. Silakan lanjut ke Dashboard untuk mulai menggunakan sistem.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center w-full gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                <span>Lanjut ke Dashboard</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
