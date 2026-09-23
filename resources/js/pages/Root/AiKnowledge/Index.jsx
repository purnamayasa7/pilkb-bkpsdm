import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import Pagination from '@/components/Pagination';
import {
    Brain,
    Plus,
    Search,
    X,
    Filter,
    Layers,
    Pencil,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    FileText,
    Zap,
    TrendingUp,
    Tag,
    ChevronDown,
    BookOpen,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

// ─── Konstanta Kategori ──────────────────────────────────────────────────────
const KATEGORI_META = {
    regulasi:  { label: 'Regulasi / UU',    color: 'blue'   },
    se_bupati: { label: 'SE Bupati',         color: 'violet' },
    disiplin:  { label: 'Disiplin ASN',      color: 'rose'   },
    cuti:      { label: 'Cuti ASN',          color: 'amber'  },
    pangkat:   { label: 'Kenaikan Pangkat',  color: 'emerald'},
    pensiun:   { label: 'Pensiun',           color: 'slate'  },
    pns_pppk:  { label: 'PNS & PPPK',        color: 'indigo' },
    asn_umum:  { label: 'ASN Umum',          color: 'teal'   },
    lainnya:   { label: 'Lainnya',           color: 'gray'   },
};

const KATEGORI_BADGE_CLASS = {
    blue:    'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/50',
    violet:  'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-900/50',
    rose:    'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50',
    amber:   'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50',
    slate:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    indigo:  'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-900/50',
    teal:    'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-900/50',
    gray:    'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
};

export default function RootAiKnowledgeIndex({ knowledgeList = [], stats = {}, kategoriOptions = {} }) {
    const [searchQuery, setSearchQuery]       = useState('');
    const [filterKategori, setFilterKategori] = useState('');
    const [filterStatus, setFilterStatus]     = useState('');
    const [perPage, setPerPage]               = useState(10);
    const [currentPage, setCurrentPage]       = useState(1);

    const [deleteModal, setDeleteModal] = useState({
        open: false, id: null, topik: '', loading: false,
    });

    const [togglingId, setTogglingId] = useState(null);

    // ─── Filter & Pagination ────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let data = knowledgeList;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter(item =>
                item.topik?.toLowerCase().includes(q) ||
                item.kata_kunci?.some(k => k.toLowerCase().includes(q)) ||
                item.nomor_referensi?.toLowerCase().includes(q)
            );
        }
        if (filterKategori) {
            data = data.filter(item => item.kategori === filterKategori);
        }
        if (filterStatus === 'aktif') {
            data = data.filter(item => item.is_active);
        } else if (filterStatus === 'nonaktif') {
            data = data.filter(item => !item.is_active);
        }

        return data;
    }, [knowledgeList, searchQuery, filterKategori, filterStatus]);

    React.useEffect(() => { setCurrentPage(1); }, [searchQuery, filterKategori, filterStatus, perPage]);

    const totalPages   = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated    = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    // ─── Toggle Aktif ────────────────────────────────────────────────────────
    const handleToggle = (id) => {
        if (togglingId) return;
        setTogglingId(id);
        router.put(
            `/root/ai-knowledge/${id}/toggle-aktif`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            }
        );
    };

    // ─── Delete ──────────────────────────────────────────────────────────────
    const handleConfirmDelete = () => {
        if (!deleteModal.id || deleteModal.loading) return;
        setDeleteModal(prev => ({ ...prev, loading: true }));
        router.delete(`/root/ai-knowledge/${deleteModal.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteModal({ open: false, id: null, topik: '', loading: false }),
            onError:   () => setDeleteModal(prev => ({ ...prev, loading: false })),
        });
    };

    const getBadgeClass = (kategori) => {
        const color = KATEGORI_META[kategori]?.color ?? 'gray';
        return KATEGORI_BADGE_CLASS[color] ?? KATEGORI_BADGE_CLASS.gray;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Basis Pengetahuan LILI AI - PILKB" />

            <div className="space-y-6">
                {/* ── 1. Page Header ─────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 mt-0.5">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Basis Pengetahuan LILI AI
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola materi regulasi, SE Bupati, dan juknis kepegawaian untuk asisten virtual LILI.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <Link
                            href="/root/ai-knowledge/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Materi Baru</span>
                        </Link>
                    </div>
                </div>

                {/* ── 2. Stats Metric Cards (Standard.md §5) ───────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Total Materi */}
                    <div
                        onClick={() => setFilterStatus('')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            filterStatus === ''
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Materi
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.total ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                Semua
                            </span>
                        </div>
                    </div>

                    {/* Materi Aktif */}
                    <div
                        onClick={() => setFilterStatus('aktif')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            filterStatus === 'aktif'
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Materi Aktif
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {stats.aktif ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                Aktif
                            </span>
                        </div>
                    </div>

                    {/* Materi Nonaktif */}
                    <div
                        onClick={() => setFilterStatus('nonaktif')}
                        className={`cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all ${
                            filterStatus === 'nonaktif'
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Tidak Aktif
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                {stats.nonaktif ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                Nonaktif
                            </span>
                        </div>
                    </div>

                    {/* Total Hit */}
                    <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Total Hit AI
                        </span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {stats.hit_total ?? 0}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                Terpakai
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── 3. Filter Toolbar ───────────────────────────────────── */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
                        {/* Search */}
                        <div className="lg:col-span-5 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari topik, kata kunci, atau referensi..."
                                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Kategori */}
                        <div className="lg:col-span-3 relative">
                            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={filterKategori}
                                onChange={e => setFilterKategori(e.target.value)}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="">Semua Kategori</option>
                                {Object.entries(KATEGORI_META).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Filter Status */}
                        <div className="lg:col-span-2 relative">
                            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Per Halaman */}
                        <div className="lg:col-span-2 relative">
                            <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={perPage}
                                onChange={e => setPerPage(Number(e.target.value))}
                                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option value={10}>10 per hal</option>
                                <option value={25}>25 per hal</option>
                                <option value={50}>50 per hal</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* ── 4. Tabel ─────────────────────────────────────────────── */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3.5">
                                        Topik & Kategori
                                    </th>
                                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">
                                        Kata Kunci
                                    </th>
                                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">
                                        Ref. Hukum
                                    </th>
                                    <th className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">
                                        PDF
                                    </th>
                                    <th className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3.5">
                                        Status
                                    </th>
                                    <th className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">
                                        Hit
                                    </th>
                                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3.5 hidden xl:table-cell">
                                        Diperbarui
                                    </th>
                                    <th className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3.5">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 px-4 text-center">
                                            <Brain className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {searchQuery || filterKategori || filterStatus
                                                    ? 'Tidak ada materi yang cocok'
                                                    : 'Belum ada basis pengetahuan LILI'}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery || filterKategori || filterStatus
                                                    ? 'Coba ubah filter atau kata kunci pencarian.'
                                                    : 'Klik "Tambah Materi Baru" untuk mulai mengisi pengetahuan LILI AI.'}
                                            </p>
                                            {(searchQuery || filterKategori || filterStatus) && (
                                                <button
                                                    onClick={() => { setSearchQuery(''); setFilterKategori(''); setFilterStatus(''); }}
                                                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Reset Filter
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map(item => {
                                        const katMeta  = KATEGORI_META[item.kategori] ?? { label: item.kategori, color: 'gray' };
                                        const badgeCls = KATEGORI_BADGE_CLASS[katMeta.color] ?? KATEGORI_BADGE_CLASS.gray;
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                {/* Topik & Kategori */}
                                                <td className="px-5 py-3.5">
                                                    <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[240px]" title={item.topik}>
                                                        {item.topik}
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${badgeCls}`}>
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {katMeta.label}
                                                    </span>
                                                </td>

                                                {/* Kata Kunci */}
                                                <td className="px-4 py-3.5 hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {(item.kata_kunci ?? []).slice(0, 3).map((kk, i) => (
                                                            <span key={i} className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                                {kk}
                                                            </span>
                                                        ))}
                                                        {(item.kata_kunci ?? []).length > 3 && (
                                                            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                                +{item.kata_kunci.length - 3} lagi
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Ref. Hukum */}
                                                <td className="px-4 py-3.5 hidden lg:table-cell">
                                                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[160px]" title={item.nomor_referensi}>
                                                        {item.nomor_referensi || '-'}
                                                    </span>
                                                </td>

                                                {/* PDF */}
                                                <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                                                    {item.file_path ? (
                                                        <a
                                                            href={`/root/ai-knowledge/${item.id}/pdf`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                                                        >
                                                            <FileText className="w-3 h-3" /> Ada
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-600">—</span>
                                                    )}
                                                </td>

                                                {/* Status Toggle */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <button
                                                        onClick={() => handleToggle(item.id)}
                                                        disabled={togglingId === item.id}
                                                        title={item.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                                                        className="inline-flex items-center gap-1 transition-opacity disabled:opacity-50"
                                                    >
                                                        {togglingId === item.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                                        ) : item.is_active ? (
                                                            <ToggleRight className="w-8 h-8 text-emerald-500" />
                                                        ) : (
                                                            <ToggleLeft className="w-8 h-8 text-slate-400" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Hit Count */}
                                                <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                                        <Zap className="w-3 h-3" />
                                                        {item.hit_count}
                                                    </span>
                                                </td>

                                                {/* Diperbarui */}
                                                <td className="px-4 py-3.5 hidden xl:table-cell">
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.time_ago}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.created_by_nama}</div>
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link
                                                            href={`/root/ai-knowledge/${item.id}/edit`}
                                                            className="p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, id: item.id, topik: item.topik, loading: false })}
                                                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filtered.length}
                        perPage={perPage}
                        onPageChange={page => setCurrentPage(page)}
                    />
                </div>
            </div>

            {/* ── Delete Modal ─────────────────────────────────────────────── */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Konfirmasi Hapus</span>
                            </div>
                            <button
                                onClick={() => !deleteModal.loading && setDeleteModal({ open: false, id: null, topik: '', loading: false })}
                                disabled={deleteModal.loading}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <p>Yakin ingin menghapus materi pengetahuan berikut?</p>
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 font-semibold text-rose-800 dark:text-rose-200">
                                "{deleteModal.topik}"
                            </div>
                            <p className="text-slate-400">File PDF lampiran (jika ada) juga akan ikut terhapus.</p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => setDeleteModal({ open: false, id: null, topik: '', loading: false })}
                                disabled={deleteModal.loading}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteModal.loading}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {deleteModal.loading ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Menghapus...</span></>
                                ) : (
                                    <><Trash2 className="w-3.5 h-3.5" /><span>Ya, Hapus</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
