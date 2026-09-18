import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    X,
    Megaphone,
    AlertTriangle,
    AlertOctagon,
    Info,
    CheckCircle2,
    Calendar,
    Link as LinkIcon,
    Layers,
} from 'lucide-react';

export default function ModalForm({ isOpen, onClose, pengumuman = null, bidangs = [], currentRoleId }) {
    const isEdit = Boolean(pengumuman);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        judul: '',
        pesan: '',
        tipe: 'info',
        mulai_pada: '',
        selesai_pada: '',
        tautan: '',
        bidang_id: '',
    });

    // Helper format datetime-local (YYYY-MM-DDTHH:MM)
    const formatForInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (pengumuman) {
                setData({
                    judul: pengumuman.judul || '',
                    pesan: pengumuman.pesan || '',
                    tipe: pengumuman.tipe || 'info',
                    mulai_pada: formatForInput(pengumuman.mulai_pada),
                    selesai_pada: formatForInput(pengumuman.selesai_pada),
                    tautan: pengumuman.tautan || '',
                    bidang_id: pengumuman.bidang_id || '',
                });
            } else {
                // Default: mulai sekarang, selesai 7 hari ke depan
                const now = new Date();
                const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                setData({
                    judul: '',
                    pesan: '',
                    tipe: 'info',
                    mulai_pada: formatForInput(now),
                    selesai_pada: formatForInput(sevenDaysLater),
                    tautan: '',
                    bidang_id: '',
                });
            }
        }
    }, [isOpen, pengumuman]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/pengumuman/${pengumuman.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/pengumuman', {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const typeOptions = [
        { value: 'info', label: 'Info Umum', icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { value: 'warning', label: 'Batas Waktu / Deadline', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        { value: 'danger', label: 'Darurat / Maintenance', icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 border-rose-200' },
        { value: 'success', label: 'Pengumuman Resmi', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10">
                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                            <Megaphone className="w-5 h-5" />
                        </span>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                {isEdit ? 'Ubah Informasi Papan' : 'Buat Informasi Papan Baru'}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Informasi akan muncul sebagai papan interaktif di halaman dashboard.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Pilihan Tipe Visual Banner */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Tipe & Kategori Papan <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {typeOptions.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = data.tipe === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setData('tipe', opt.value)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                                        <span className={`text-[11px] font-semibold ${isSelected ? 'text-blue-900 dark:text-blue-200 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.tipe && <p className="text-rose-600 text-xs mt-1">{errors.tipe}</p>}
                    </div>

                    {/* Judul Pengumuman (Max 100 char) */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Judul Informasi <span className="text-rose-500">*</span>
                            </label>
                            <span className={`text-[11px] font-mono ${data.judul.length > 90 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                                {data.judul.length} / 100
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={100}
                            value={data.judul}
                            onChange={(e) => setData('judul', e.target.value)}
                            placeholder="Contoh: Batas Akhir Pengusulan Kenaikan Pangkat"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            required
                        />
                        {errors.judul && <p className="text-rose-600 text-xs mt-1">{errors.judul}</p>}
                    </div>

                    {/* Pesan Ringkas (Max 255 char) */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Pesan Papan <span className="text-rose-500">*</span>
                            </label>
                            <span className={`text-[11px] font-mono ${data.pesan.length > 230 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                                {data.pesan.length} / 255
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            maxLength={255}
                            value={data.pesan}
                            onChange={(e) => setData('pesan', e.target.value)}
                            placeholder="Tuliskan pesan ringkas 1-2 baris. Contoh: Usulan berkas kenaikan pangkat paling lambat diunggah tanggal 25 Februari pukul 23:59 WITA. Harap periksa kelengkapan berkas."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed"
                            required
                        />
                        {errors.pesan && <p className="text-rose-600 text-xs mt-1">{errors.pesan}</p>}
                    </div>

                    {/* Jadwal Penayangan (Mulai & Selesai) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                Mulai Tayang <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="datetime-local"
                                    value={data.mulai_pada}
                                    onChange={(e) => setData('mulai_pada', e.target.value)}
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                            {errors.mulai_pada && <p className="text-rose-600 text-xs mt-1">{errors.mulai_pada}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                Selesai Tayang <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="datetime-local"
                                    value={data.selesai_pada}
                                    onChange={(e) => setData('selesai_pada', e.target.value)}
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                            {errors.selesai_pada && <p className="text-rose-600 text-xs mt-1">{errors.selesai_pada}</p>}
                        </div>
                    </div>

                    {/* Tautan Opsional (Jika Ada Rujukan/Lampiran) */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Tautan / URL Rujukan (Opsional)
                        </label>
                        <div className="relative">
                            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="url"
                                value={data.tautan}
                                onChange={(e) => setData('tautan', e.target.value)}
                                placeholder="Contoh: https://bkpsdm.bulelengkab.go.id/juknis-kenaikan-pangkat.pdf"
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Jika diisi, papan akan menampilkan tombol "Lihat Selengkapnya" yang mengarah ke link ini.
                        </p>
                        {errors.tautan && <p className="text-rose-600 text-xs mt-1">{errors.tautan}</p>}
                    </div>

                    {/* Khusus Root & Pimpinan: Pilihan Bidang Afiliasi */}
                    {inArray(currentRoleId, [1, 5]) && (
                        <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                Bidang Terkait (Opsional)
                            </label>
                            <div className="relative">
                                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    value={data.bidang_id}
                                    onChange={(e) => setData('bidang_id', e.target.value)}
                                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="">-- Seluruh Instansi / BKPSDM Global --</option>
                                    {bidangs.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.nama_bidang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Jika dikosongkan, label pengumuman akan bertuliskan "BKPSDM Buleleng".
                            </p>
                        </div>
                    )}

                    {/* Modal Footer Buttons */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Terbitkan Papan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function inArray(needle, haystack) {
    return Array.isArray(haystack) && haystack.includes(needle);
}
