import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function Preview({ message }) {
    return (
        <AuthenticatedLayout title="Preview Setup">
            <Head title="Preview Setup - PILKB" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Welcome Hero Card */}
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl shadow-blue-500/10">
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-4 border border-white/20">
                            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                            <span>Inertia.js + React + Tailwind v4</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Setup Frontend Modern PILKB Berhasil!
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
                            Arsitektur React dengan Tailwind CSS v4, Dark Mode presisi palet Slate/Navy,
                            Topbar backdrop-blur, dan anti-flash script telah siap digunakan.
                        </p>
                    </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            Tailwind CSS v4
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Didukung @tailwindcss/vite murni tanpa file konfigurasi usang.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            Inertia.js + React 19
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Performa SPA instan dengan routing Laravel tanpa page reload.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            Slate/Navy Dark Mode
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Anti-flash script aktif pada &lt;head&gt; untuk transisi mulus.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
