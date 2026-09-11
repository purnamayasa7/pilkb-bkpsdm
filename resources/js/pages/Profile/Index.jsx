import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import RiwayatTahapanModal from '@/components/RiwayatTahapanModal';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import {
    User,
    ArrowLeft,
    Save,
    Building2,
    Briefcase,
    Award,
    Calendar,
    BookOpen,
    Layers,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    FileText,
    History,
    Printer,
    ClipboardList,
    Search,
    X,
    Loader2,
    Shield,
} from 'lucide-react';

export default function ProfileIndex({ user = {}, pegawai = {}, tiket = [] }) {
    const { flash = {} } = usePage().props;

    // Tab state ('profile' | 'tiket')
    const [activeTab, setActiveTab] = useState('profile');

    // Form edit account state
    const [email, setEmail] = useState(user.email || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Tiket tab state: search, pagination, riwayat modal
    const [ticketSearch, setTicketSearch] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedTiket, setCopiedTiket] = useState(null);

    // Modal Riwayat
    const [riwayatModalOpen, setRiwayatModalOpen] = useState(false);
    const [selectedNoTiket, setSelectedNoTiket] = useState(null);

    // Copy to clipboard helper
    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedTiket(text);
        setTimeout(() => setCopiedTiket(null), 2000);
    };

    // Filter tickets
    const filteredTiket = useMemo(() => {
        if (!ticketSearch.trim()) return tiket;
        const q = ticketSearch.toLowerCase().trim();
        return tiket.filter(
            (t) =>
                (t.no_tiket && t.no_tiket.toLowerCase().includes(q)) ||
                (t.nama_layanan && t.nama_layanan.toLowerCase().includes(q)) ||
                (t.status && t.status.toLowerCase().includes(q))
        );
    }, [tiket, ticketSearch]);

    // Paginate tickets
    const totalItems = filteredTiket.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const paginatedTiket = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredTiket.slice(start, start + perPage);
    }, [filteredTiket, currentPage, perPage]);

    // Pre-submit validation
    const handlePreSubmit = (e) => {
        e.preventDefault();
        const clientErrors = {};

        if (!email.trim()) {
            clientErrors.email = 'Alamat email wajib diisi.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            clientErrors.email = 'Format alamat email tidak valid.';
        }

        if (password && password.length < 5) {
            clientErrors.password = 'Password minimal 5 karakter jika ingin diubah.';
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setErrors({});
        setConfirmModalOpen(true);
    };

    // Confirm submit update profile
    const handleConfirmSubmit = () => {
        setSubmitting(true);

        const payload = {
            email: email.trim(),
        };

        if (password.trim()) {
            payload.password = password.trim();
        }

        router.put('/profil', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmModalOpen(false);
                setSubmitting(false);
                setPassword('');
            },
            onError: (backendErrors) => {
                setErrors(backendErrors || {});
                setConfirmModalOpen(false);
                setSubmitting(false);
            },
        });
    };

    // Helper avatar initial
    const getInitials = (nama, fallback = 'U') => {
        if (!nama) return fallback;
        const parts = String(nama).trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Profil Saya - PILKB" />

            <div className="space-y-6">
                {/* 1. Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0 mt-0.5">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Profil Pengguna
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Informasi data kepegawaian terintegrasi SIMPEG dan pengaturan akun akses PILKB Anda.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Dashboard</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                            activeTab === 'profile'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Data Pegawai & Akun</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('tiket')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                            activeTab === 'tiket'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <ClipboardList className="w-4 h-4" />
                        <span>Tiket Pengajuan Anda</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                            {tiket.length}
                        </span>
                    </button>
                </div>

                {/* 3. Tab Contents */}
                {activeTab === 'profile' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Kolom Kiri: Card Foto & Data Kepegawaian SIMPEG (lg:col-span-4) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-center">
                                {/* Foto Profil Lingkaran Sempurna (Tanpa Border) */}
                                <div className="relative w-28 h-28 mx-auto mb-3 rounded-full overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                                    {pegawai.foto_url ? (
                                        <img
                                            src={pegawai.foto_url}
                                            alt={pegawai.nama_lengkap || user.nama}
                                            className="w-full h-full object-cover aspect-square block"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.parentElement.querySelector('.avatar-fallback');
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="avatar-fallback w-full h-full flex items-center justify-center font-bold text-2xl text-slate-600 dark:text-slate-300 uppercase"
                                        style={{ display: pegawai.foto_url ? 'none' : 'flex' }}
                                    >
                                        {getInitials(pegawai.nama_lengkap || user.nama, 'P')}
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                                    {pegawai.nama_lengkap || user.nama || 'Pengguna PILKB'}
                                </h3>

                                <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                        NIP: {pegawai.nip || user.username}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                                        <Shield className="w-3 h-3 text-blue-500" />
                                        {user.role || 'Pengguna'}
                                    </span>
                                </div>

                                {/* List Rincian Data SIMPEG */}
                                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-left text-xs space-y-3.5">
                                    {/* Unit Kerja */}
                                    <div className="flex items-start gap-2.5">
                                        <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] text-slate-400">Unit Kerja (OPD)</div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                                {pegawai.ket_ukerja || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Jabatan */}
                                    <div className="flex items-start gap-2.5">
                                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] text-slate-400">Jabatan</div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                                {pegawai.nama_jab || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pangkat / Golongan */}
                                    <div className="flex items-start gap-2.5">
                                        <Award className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] text-slate-400">Pangkat / Golongan</div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {pegawai.ket_gol || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tempat / Tgl Lahir */}
                                    <div className="flex items-start gap-2.5">
                                        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] text-slate-400">Tempat, Tanggal Lahir</div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {pegawai.ttl || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agama */}
                                    <div className="flex items-start gap-2.5">
                                        <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] text-slate-400">Agama</div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {pegawai.ket_agama || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bidang Pengampu */}
                                    <div className="flex items-start gap-2.5">
                                        <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-[11px] text-slate-400">Bidang Sistem</div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {user.bidang_nama || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Card Pengaturan Akun User (lg:col-span-8) */}
                        <div className="lg:col-span-8">
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                                <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Pengaturan Akun Pengguna
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Perbarui alamat email komunikasi atau ganti kata sandi akses sistem Anda.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handlePreSubmit} className="space-y-5">
                                    {/* Grid Readonly System Data */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Username / NIP */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Username / NIP
                                            </label>
                                            <input
                                                type="text"
                                                value={user.username || ''}
                                                readOnly
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                            />
                                            <p className="text-[10px] text-slate-400">NIP terkunci dan bersumber dari SIMPEG.</p>
                                        </div>

                                        {/* Nama Lengkap */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                value={pegawai.nama_lengkap || user.nama || ''}
                                                readOnly
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Field Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Alamat Email <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (errors.email) {
                                                    setErrors((prev) => ({ ...prev, email: null }));
                                                }
                                            }}
                                            placeholder="Masukkan alamat email aktif..."
                                            className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                                errors.email
                                                    ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                            }`}
                                        />
                                        {errors.email && (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>{errors.email}</span>
                                            </p>
                                        )}
                                        <p className="text-[10px] text-slate-400">
                                            Email digunakan untuk menerima notifikasi berkas, usulan, dan keamanan akun.
                                        </p>
                                    </div>

                                    {/* Field Password Baru (Opsional) */}
                                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Ganti Kata Sandi (Opsional)
                                            </label>
                                            <Link
                                                href="/change-password"
                                                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Halaman Khusus Ganti Password &rarr;
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (errors.password) {
                                                        setErrors((prev) => ({ ...prev, password: null }));
                                                    }
                                                }}
                                                placeholder="Kosongkan jika tidak ingin mengubah kata sandi..."
                                                className={`w-full pl-4 pr-10 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                                                    errors.password
                                                        ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                                                        : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>{errors.password}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Simpan Perubahan Akun</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Tab 2: Tiket Pengajuan Anda */
                    <div className="space-y-4">
                        {/* Toolbar Search Tiket */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                                <div className="lg:col-span-8 relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={ticketSearch}
                                        onChange={(e) => setTicketSearch(e.target.value)}
                                        placeholder="Cari nomor tiket, nama layanan, atau status..."
                                        className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                    {ticketSearch && (
                                        <button
                                            onClick={() => setTicketSearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="lg:col-span-4 text-right">
                                    <span className="text-xs text-slate-400">
                                        Total Pengajuan: <strong className="text-slate-700 dark:text-slate-200">{filteredTiket.length} tiket</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card Tabel Tiket */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                            {paginatedTiket.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    <th className="py-3.5 px-4 text-center w-14">No</th>
                                                    <th className="py-3.5 px-4 w-44">No Tiket</th>
                                                    <th className="py-3.5 px-4">Nama Layanan</th>
                                                    <th className="py-3.5 px-4 w-44">Tanggal Pengajuan</th>
                                                    <th className="py-3.5 px-4 w-48">Status Terakhir</th>
                                                    <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                                {paginatedTiket.map((item, index) => {
                                                    const itemNum = (currentPage - 1) * perPage + index + 1;
                                                    return (
                                                        <tr
                                                            key={item.no_tiket}
                                                            className="hover:bg-slate-50/75 dark:hover:bg-slate-800/50 transition-colors"
                                                        >
                                                            <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                                                                {itemNum}
                                                            </td>

                                                            {/* No Tiket */}
                                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span>{item.no_tiket}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCopy(item.no_tiket)}
                                                                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5"
                                                                        title="Salin Nomor Tiket"
                                                                    >
                                                                        {copiedTiket === item.no_tiket ? (
                                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                        ) : (
                                                                            <Copy className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            {/* Layanan */}
                                                            <td className="py-3.5 px-4">
                                                                <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 max-w-sm">
                                                                    {item.nama_layanan}
                                                                </div>
                                                            </td>

                                                            {/* Tanggal */}
                                                            <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                                                                {item.tanggal}
                                                            </td>

                                                            {/* Status */}
                                                            <td className="py-3.5 px-4">
                                                                <StatusBadge
                                                                    status={item.status}
                                                                    statusId={item.status_id}
                                                                />
                                                            </td>

                                                            {/* Aksi */}
                                                            <td className="py-3.5 px-4 text-center">
                                                                <div className="inline-flex items-center justify-center gap-1.5">
                                                                    {/* Riwayat Tahapan */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedNoTiket(item.no_tiket);
                                                                            setRiwayatModalOpen(true);
                                                                        }}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs cursor-pointer"
                                                                        title="Lihat Riwayat Tahapan Tiket"
                                                                    >
                                                                        <History className="w-3.5 h-3.5" />
                                                                        <span>Riwayat</span>
                                                                    </button>

                                                                    {/* Cetak Tiket */}
                                                                    <a
                                                                        href={`/tiket/cetak/${item.no_tiket}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                        title="Cetak Salinan Tiket"
                                                                    >
                                                                        <Printer className="w-3.5 h-3.5" />
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={totalItems}
                                        perPage={perPage}
                                        onPageChange={(page) => setCurrentPage(page)}
                                    />
                                </>
                            ) : (
                                <div className="py-16 px-4 text-center">
                                    <ClipboardList className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {ticketSearch ? 'Tiket Tidak Ditemukan' : 'Belum Ada Tiket Pengajuan'}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        {ticketSearch
                                            ? `Tidak ditemukan tiket dengan kata kunci "${ticketSearch}".`
                                            : 'Anda belum memiliki riwayat pengajuan layanan kepegawaian.'}
                                    </p>
                                    {ticketSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setTicketSearch('')}
                                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Reset Pencarian</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Simpan Akun */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Konfirmasi Perubahan Akun</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => !submitting && setConfirmModalOpen(false)}
                                disabled={submitting}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <p>Apakah Anda yakin ingin menyimpan perubahan pada profil akun Anda?</p>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                                <div>
                                    <span className="text-slate-400">Email:</span> <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
                                </div>
                                {password && (
                                    <div className="text-amber-600 dark:text-amber-400 font-semibold">
                                        Kata sandi baru akan diterapkan.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                disabled={submitting}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={submitting}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Ya, Simpan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Riwayat Tahapan Tiket */}
            <RiwayatTahapanModal
                isOpen={riwayatModalOpen}
                onClose={() => {
                    setRiwayatModalOpen(false);
                    setSelectedNoTiket(null);
                }}
                noTiket={selectedNoTiket}
            />
        </AuthenticatedLayout>
    );
}
