import React, { useState, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import {
    Brain,
    Pencil,
    ArrowLeft,
    Save,
    Tag,
    X,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Upload,
    FileText,
    Eye,
    Code2,
    Sparkles,
    Send,
    BookOpen,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    Zap,
    ExternalLink,
    Clock,
    User,
} from 'lucide-react';

// ─── Kategori options ──────────────────────────────────────────────────────
const KATEGORI_OPTIONS = [
    { value: 'regulasi',  label: 'Regulasi / UU' },
    { value: 'se_bupati', label: 'SE Bupati' },
    { value: 'disiplin',  label: 'Disiplin ASN' },
    { value: 'cuti',      label: 'Cuti ASN' },
    { value: 'pangkat',   label: 'Kenaikan Pangkat' },
    { value: 'pensiun',   label: 'Pensiun' },
    { value: 'pns_pppk',  label: 'PNS & PPPK' },
    { value: 'asn_umum',  label: 'ASN Umum' },
    { value: 'lainnya',   label: 'Lainnya' },
];

// ─── Simple Markdown Preview ───────────────────────────────────────────────
function MarkdownPreview({ content }) {
    const html = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.+)$/gm, '<h3 class="font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1 text-xs">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="font-bold text-slate-900 dark:text-white mt-4 mb-1 text-sm">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h1>')
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300">$2</li>')
        .replace(/\n\n/g, '</p><p class="mb-2">')
        .replace(/\n/g, '<br/>');
    return (
        <div
            className="min-h-[200px] p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: `<p class="mb-2">${html}</p>` }}
        />
    );
}

// ─── Source Badge ──────────────────────────────────────────────────────────
function SourceBadge({ source }) {
    if (!source) return null;
    let cls = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
    let label = source;
    if (source.startsWith('dynamic_knowledge')) {
        cls = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50';
        label = '✓ Layer 0: Dynamic Knowledge';
    } else if (source === 'gemini_ai' || source === 'gemini') {
        cls = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50';
        label = '✦ Layer 1: Gemini AI';
    } else if (source.startsWith('fallback') || source.startsWith('static')) {
        cls = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50';
        label = '⬡ Layer 2: Static Fallback';
    } else if (source === 'security_guardrail') {
        cls = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50';
        label = '⚠ Security Guardrail';
    }
    return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

export default function RootAiKnowledgeEdit({ knowledge, kategoriOptions }) {
    // Form state — pre-populated
    const [kategori, setKategori]   = useState(knowledge.kategori ?? 'regulasi');
    const [topik, setTopik]         = useState(knowledge.topik ?? '');
    const [nomorRef, setNomorRef]   = useState(knowledge.nomor_referensi ?? '');
    const [konten, setKonten]       = useState(knowledge.konten_jawaban ?? '');
    const [isActive, setIsActive]   = useState(knowledge.is_active ?? true);
    const [kataKunci, setKataKunci] = useState(knowledge.kata_kunci ?? []);
    const [tagInput, setTagInput]   = useState('');
    const [saran, setSaran]         = useState(() => {
        const arr = knowledge.saran_pertanyaan ?? [];
        while (arr.length < 4) arr.push('');
        return arr.slice(0, 4);
    });

    // File state
    const [newPdfFile, setNewPdfFile]     = useState(null);
    const [showDropzone, setShowDropzone] = useState(false);
    const [hapusFile, setHapusFile]       = useState(false);
    const [dragOver, setDragOver]         = useState(false);

    // UI state
    const [previewMode, setPreviewMode] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [errors, setErrors]           = useState({});

    // Simulator
    const [simOpen, setSimOpen]       = useState(false);
    const [simQuery, setSimQuery]     = useState('');
    const [simLoading, setSimLoading] = useState(false);
    const [simHistory, setSimHistory] = useState([]);

    const fileInputRef = useRef(null);
    const csrfToken    = document.querySelector('meta[name="csrf-token"]')?.content;

    // ─── Tag Input ─────────────────────────────────────────────────────────
    const addTag = useCallback(() => {
        const trimmed = tagInput.trim();
        if (!trimmed) return;
        const newTags = trimmed
            .split(/[,، ]+/)
            .map(t => t.trim())
            .filter(t => t && !kataKunci.includes(t));
        if (newTags.length) {
            setKataKunci(prev => [...prev, ...newTags]);
            if (errors.kata_kunci) setErrors(prev => ({ ...prev, kata_kunci: null }));
        }
        setTagInput('');
    }, [tagInput, kataKunci, errors.kata_kunci]);

    const removeTag = (idx) => setKataKunci(prev => prev.filter((_, i) => i !== idx));

    const handleTagKeyDown = (e) => {
        if (['Enter', ',', ' '].includes(e.key)) {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !tagInput && kataKunci.length) {
            setKataKunci(prev => prev.slice(0, -1));
        }
    };

    // ─── PDF ────────────────────────────────────────────────────────────────
    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type === 'application/pdf') setNewPdfFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) { setNewPdfFile(file); setHapusFile(false); }
        e.target.value = '';
    };

    // ─── Validation & Submit ─────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!topik.trim()) errs.topik = 'Topik/judul wajib diisi.';
        if (kataKunci.length === 0) errs.kata_kunci = 'Tambahkan minimal 1 kata kunci.';
        if (!konten.trim()) errs.konten_jawaban = 'Konten jawaban LILI wajib diisi.';
        return errs;
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setConfirmOpen(true);
    };

    const handleConfirmSubmit = () => {
        setSubmitting(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('kategori', kategori);
        formData.append('topik', topik.trim());
        formData.append('kata_kunci', JSON.stringify(kataKunci));
        formData.append('konten_jawaban', konten.trim());
        formData.append('nomor_referensi', nomorRef.trim());
        formData.append('is_active', isActive ? '1' : '0');
        formData.append('hapus_file', hapusFile ? '1' : '0');
        const saranBersih = saran.filter(s => s.trim());
        if (saranBersih.length) formData.append('saran_pertanyaan', JSON.stringify(saranBersih));
        if (newPdfFile) formData.append('file_pdf', newPdfFile);

        router.post(`/root/ai-knowledge/${knowledge.id}`, formData, {
            forceFormData: true,
            onSuccess: () => { setConfirmOpen(false); setSubmitting(false); },
            onError: (backendErrors) => {
                setErrors(backendErrors || {});
                setConfirmOpen(false);
                setSubmitting(false);
            },
        });
    };

    // ─── Simulator ──────────────────────────────────────────────────────────
    const handleSimSend = async () => {
        if (!simQuery.trim() || simLoading) return;
        const q = simQuery.trim();
        setSimLoading(true);
        setSimHistory(prev => [...prev, { role: 'user', text: q }]);
        setSimQuery('');
        try {
            const res = await fetch('/root/ai-knowledge/test-simulator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: JSON.stringify({ pertanyaan: q }),
            });
            const data = await res.json();
            setSimHistory(prev => [
                ...prev,
                { role: 'lili', text: data.reply ?? 'Tidak ada jawaban.', source: data.source, duration: data.duration_ms },
            ]);
        } catch {
            setSimHistory(prev => [...prev, { role: 'lili', text: 'Terjadi kesalahan saat menghubungi LILI.', source: 'error' }]);
        } finally {
            setSimLoading(false);
        }
    };

    // Apakah ada file PDF existing
    const hasExistingFile = !!knowledge.file_path && !hapusFile;

    return (
        <AuthenticatedLayout>
            <Head title={`Edit: ${knowledge.topik} - PILKB`} />

            <div className="space-y-6">
                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/40 shrink-0 mt-0.5">
                            <Pencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Edit Materi Pengetahuan LILI
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1" title={knowledge.topik}>
                                {knowledge.topik}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setSimOpen(prev => !prev)}
                            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
                                simOpen
                                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>{simOpen ? 'Tutup Simulator' : 'Uji di Simulator LILI'}</span>
                        </button>
                        <Link
                            href="/root/ai-knowledge"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali</span>
                        </Link>
                    </div>
                </div>

                {/* ── Layout Utama ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Kolom Kiri: Form ──────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                            {/* Card Header */}
                            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Edit Detail Materi Pengetahuan
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Perbarui informasi regulasi, SE Bupati, atau juknis kepegawaian ini.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handlePreSubmit} className="space-y-5">
                                {/* Kategori */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <select
                                            value={kategori}
                                            onChange={e => setKategori(e.target.value)}
                                            className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                        >
                                            {KATEGORI_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
                                    </div>
                                </div>

                                {/* Topik */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                        <span>Topik / Judul <span className="text-rose-500">*</span></span>
                                        <span className="text-[11px] font-normal text-slate-400">{topik.length}/255</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={topik}
                                        onChange={e => { setTopik(e.target.value); if (errors.topik) setErrors(p => ({...p, topik: null})); }}
                                        maxLength={255}
                                        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.topik ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                    />
                                    {errors.topik && <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.topik}</p>}
                                </div>

                                {/* Nomor Referensi */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nomor Referensi / Dasar Hukum <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={nomorRef}
                                        onChange={e => setNomorRef(e.target.value)}
                                        placeholder="Contoh: SE Bupati Buleleng No. 800.1/124/BKPSDM/2026"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                {/* Kata Kunci (Tag Input) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Kata Kunci Pencocokan <span className="text-rose-500">*</span>
                                        <span className="ml-2 text-[11px] font-normal text-slate-400">— ketik lalu Enter/koma</span>
                                    </label>
                                    <div className={`min-h-[44px] flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 transition-all ${errors.kata_kunci ? 'border-rose-300 dark:border-rose-800 focus-within:ring-2 focus-within:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500'}`}>
                                        {kataKunci.map((kk, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                                                {kk}
                                                <button type="button" onClick={() => removeTag(i)} className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            onBlur={addTag}
                                            placeholder={kataKunci.length === 0 ? 'Ketik kata kunci, tekan Enter...' : ''}
                                            className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                                        />
                                    </div>
                                    {errors.kata_kunci && <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.kata_kunci}</p>}
                                </div>

                                {/* Konten Jawaban */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                        <span>Konten Jawaban LILI <span className="text-rose-500">*</span></span>
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                                            <button type="button" onClick={() => setPreviewMode(false)} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${!previewMode ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                                <Code2 className="w-3 h-3" /> Edit
                                            </button>
                                            <button type="button" onClick={() => setPreviewMode(true)} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${previewMode ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                                <Eye className="w-3 h-3" /> Preview
                                            </button>
                                        </div>
                                    </label>
                                    <div className={`rounded-xl border overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 ${errors.konten_jawaban ? 'border-rose-300 dark:border-rose-800' : 'border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500'}`}>
                                        {previewMode ? (
                                            <MarkdownPreview content={konten} />
                                        ) : (
                                            <textarea
                                                rows={10}
                                                value={konten}
                                                onChange={e => { setKonten(e.target.value); if (errors.konten_jawaban) setErrors(p => ({...p, konten_jawaban: null})); }}
                                                placeholder="Tulis konten jawaban LILI..."
                                                className="w-full px-4 py-3 bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-mono leading-relaxed resize-none"
                                            />
                                        )}
                                    </div>
                                    {errors.konten_jawaban && <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{errors.konten_jawaban}</p>}
                                </div>

                                {/* Saran Pertanyaan */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Saran Pertanyaan Lanjutan <span className="text-slate-400 font-normal">(maks 4)</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {saran.map((s, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                value={s}
                                                onChange={e => { const arr = [...saran]; arr[i] = e.target.value; setSaran(arr); }}
                                                placeholder={`Chip ${i + 1}`}
                                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* ── PDF Section ──────────────────────────── */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Lampiran Dokumen PDF <span className="text-slate-400 font-normal">(opsional, maks 10MB)</span>
                                    </label>

                                    {/* Tampilkan file existing jika ada */}
                                    {hasExistingFile && !showDropzone && (
                                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/30">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 truncate max-w-[200px]">
                                                        {knowledge.file_original_name || 'Dokumen PDF'}
                                                    </p>
                                                    <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">File dokumen saat ini</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <a
                                                    href={`/root/ai-knowledge/${knowledge.id}/pdf`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> Lihat Dokumen
                                                    <ExternalLink className="w-3 h-3 text-blue-400" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDropzone(true)}
                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    Ganti File
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setHapusFile(true); }}
                                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                    title="Hapus file"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pesan hapus file */}
                                    {hapusFile && (
                                        <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/30 text-xs">
                                            <span className="text-rose-700 dark:text-rose-300 font-medium">File PDF akan dihapus saat disimpan.</span>
                                            <button type="button" onClick={() => setHapusFile(false)} className="text-rose-500 hover:text-rose-700 transition-colors underline">Batal Hapus</button>
                                        </div>
                                    )}

                                    {/* Dropzone ganti file atau file baru */}
                                    {(showDropzone || !hasExistingFile) && (
                                        <div>
                                            {newPdfFile ? (
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{newPdfFile.name}</p>
                                                            <p className="text-[11px] text-emerald-500 mt-0.5">{(newPdfFile.size / 1024 / 1024).toFixed(2)} MB · File baru</p>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => { setNewPdfFile(null); if (showDropzone) setShowDropzone(false); }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                                    onDragLeave={() => setDragOver(false)}
                                                    onDrop={handleFileDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`rounded-xl border-2 border-dashed transition-all cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                                >
                                                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                                                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                                                        <Upload className="w-7 h-7 text-slate-300 dark:text-slate-600 mb-2" />
                                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                            {showDropzone ? 'Pilih file PDF pengganti' : 'Klik atau seret file PDF ke sini'}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 mt-1">Hanya format PDF · Maks 10MB</p>
                                                    </div>
                                                </div>
                                            )}
                                            {showDropzone && (
                                                <button type="button" onClick={() => { setShowDropzone(false); setNewPdfFile(null); }} className="mt-1.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                                    ← Batal ganti file
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Link
                                        href="/root/ai-knowledge"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" /> Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" /> Perbarui Materi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ── Kolom Kanan ───────────────────────────────────── */}
                    <div className="space-y-5">
                        {/* Info Metadata */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Informasi Materi
                                </h3>
                            </div>
                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Hit count:</span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5" /> {knowledge.hit_count ?? 0}x dipakai
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Dibuat:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{knowledge.created_at_formatted}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Diperbarui:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{knowledge.updated_at_formatted}</span>
                                </div>
                            </div>
                        </div>

                        {/* Toggle Status */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Status Materi
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsActive(prev => !prev)}
                                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-left">
                                        {isActive ? 'Aktif — Digunakan LILI' : 'Nonaktif — Tidak Digunakan'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 text-left">
                                        {isActive ? 'LILI aktif menggunakan materi ini.' : 'LILI tidak menggunakan materi ini.'}
                                    </p>
                                </div>
                                {isActive
                                    ? <ToggleRight className="w-9 h-9 text-emerald-500 shrink-0" />
                                    : <ToggleLeft className="w-9 h-9 text-slate-400 shrink-0" />
                                }
                            </button>
                        </div>

                        {/* Tips Markdown */}
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Tips Format Konten
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {[
                                    ['**teks**', 'Cetak tebal'],
                                    ['*teks*', 'Cetak miring'],
                                    ['- item', 'Bullet list'],
                                    ['1. item', 'Daftar nomor'],
                                    ['## Judul', 'Sub judul'],
                                ].map(([fmt, desc]) => (
                                    <div key={fmt} className="flex items-center gap-2">
                                        <code className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono font-semibold">{fmt}</code>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Simulator Panel */}
                        {simOpen && (
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40 shrink-0">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Simulator Sandbox LILI
                                            </h3>
                                            <p className="text-[11px] text-slate-400">Uji apakah LILI menjawab dengan materi ini</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSimHistory([])}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        title="Bersihkan percakapan"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/40">
                                    {simHistory.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                            <Brain className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sandbox Uji Coba Siap</h4>
                                            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">Uji apakah respon LILI telah menggunakan data materi ini.</p>
                                        </div>
                                    )}
                                    {simHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                                msg.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-2xs'
                                            }`}>
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                                {msg.role === 'lili' && (
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                                        <SourceBadge source={msg.source} />
                                                        {msg.duration && <span className="text-[10px] text-slate-400 font-mono">{msg.duration}ms</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {simLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-2xs">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={simQuery}
                                        onChange={e => setSimQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSimSend()}
                                        placeholder="Tulis pertanyaan uji..."
                                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSimSend}
                                        disabled={simLoading || !simQuery.trim()}
                                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-2xs shrink-0"
                                    >
                                        {simLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Confirm Modal ──────────────────────────────────────────── */}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Konfirmasi Perbarui Materi</span>
                            </div>
                            <button type="button" onClick={() => !submitting && setConfirmOpen(false)} disabled={submitting} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            <p>Simpan perubahan pada materi pengetahuan berikut?</p>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                                <p className="font-bold text-slate-800 dark:text-slate-200">"{topik}"</p>
                                <p className="text-[11px] text-slate-500">Kategori: {KATEGORI_OPTIONS.find(o => o.value === kategori)?.label} · Kata kunci: {kataKunci.length} · Status: {isActive ? 'Aktif' : 'Nonaktif'}</p>
                                {hapusFile && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">⚠ File PDF akan dihapus.</p>}
                                {newPdfFile && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">+ File PDF baru: {newPdfFile.name}</p>}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button type="button" onClick={() => setConfirmOpen(false)} disabled={submitting} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                Batal
                            </button>
                            <button type="button" onClick={handleConfirmSubmit} disabled={submitting} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer">
                                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Menyimpan...</span></> : <><Save className="w-3.5 h-3.5" /><span>Ya, Perbarui</span></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
