import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Star, X, Send, CheckCircle2, Printer } from 'lucide-react';

const ASPEK_OPTIONS = [
    'Kecepatan Layanan',
    'Kejelasan Informasi',
    'Kemudahan Prosedur',
    'Kualitas Layanan',
];

/**
 * ReviewModal - Pop-up penilaian kepuasan SKM dari Admin OPD.
 * Muncul ketika tiket sudah berstatus Selesai (archives = 1).
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - noTiket: string  (no_tiket dari tb_regtiket)
 *  - namaLayanan: string
 *  - isFromPrint: boolean (jika dipicu saat ingin mencetak tiket selesai)
 *  - onSuccess: (noTiket: string) => void
 */
export default function ReviewModal({
    isOpen,
    onClose,
    noTiket,
    namaLayanan,
    isFromPrint = false,
    onSuccess,
}) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [aspekTerpilih, setAspekTerpilih] = useState([]);
    const [komentar, setKomentar] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Reset state setiap kali modal dibuka atau tiket berganti
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setAspekTerpilih([]);
            setKomentar('');
            setSubmitting(false);
            setSubmitted(false);
        }
    }, [isOpen, noTiket]);

    if (!isOpen) return null;

    const toggleAspek = (aspek) => {
        setAspekTerpilih((prev) =>
            prev.includes(aspek) ? prev.filter((a) => a !== aspek) : [...prev, aspek]
        );
    };

    const handleSubmit = () => {
        if (rating === 0) return;
        setSubmitting(true);

        router.post(
            `/tiket/${noTiket}/review`,
            {
                rating,
                aspek_penilaian: aspekTerpilih,
                komentar: komentar.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitting(false);
                    setSubmitted(true);
                    onSuccess?.(noTiket);
                    // Tutup modal setelah 2 detik
                    setTimeout(() => {
                        setSubmitted(false);
                        onClose();
                    }, 2000);
                },
                onError: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const ratingLabel = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'];
    const ratingColor = ['', 'text-rose-500', 'text-orange-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
                            <Star className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Survei Kepuasan Layanan
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                {namaLayanan}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                {submitted ? (
                    <div className="p-10 flex flex-col items-center text-center gap-3">
                        <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Terima Kasih!</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                            {isFromPrint
                                ? 'Ulasan kepuasan Anda berhasil dikirim. Tanda bukti tiket sedang dibuka untuk dicetak...'
                                : 'Ulasan Anda telah berhasil dikirim dan akan membantu meningkatkan kualitas layanan BKPSDM Buleleng.'}
                        </p>
                        {isFromPrint && (
                            <a
                                href={`/tiket/cetak/${encodeURIComponent(noTiket)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Buka Bukti Tiket Sekarang</span>
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="p-6 space-y-5">
                        {/* Notice jika dibuka dari alur Cetak */}
                        {isFromPrint && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
                                <Printer className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <span className="leading-relaxed">
                                    Sebelum mencetak tanda bukti selesai, mohon berikan penilaian singkat terhadap layanan yang telah diterima.
                                </span>
                            </div>
                        )}

                        {/* Bintang Rating */}
                        <div className="text-center space-y-2">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Berikan penilaian Anda
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-125 focus:outline-none"
                                    >
                                        <Star
                                            className={`w-9 h-9 transition-colors ${
                                                star <= (hoverRating || rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300 dark:text-slate-600'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="h-6 flex items-center justify-center">
                                {(hoverRating || rating) > 0 ? (
                                    <p className={`text-xs font-bold ${ratingColor[hoverRating || rating]} transition-all animate-in fade-in duration-150`}>
                                        {ratingLabel[hoverRating || rating]}
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-slate-400">
                                        Klik bintang untuk memberi nilai
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Aspek Penilaian (Quick Chips) */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Aspek Penilaian <span className="text-slate-400 font-normal">(opsional, pilih yang sesuai)</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {ASPEK_OPTIONS.map((aspek) => {
                                    const selected = aspekTerpilih.includes(aspek);
                                    return (
                                        <button
                                            key={aspek}
                                            type="button"
                                            onClick={() => toggleAspek(aspek)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                                                selected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                            }`}
                                        >
                                            {selected && <CheckCircle2 className="w-3 h-3" />}
                                            {aspek}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Komentar/Saran */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                Saran & Masukan <span className="text-slate-400 font-normal">(opsional)</span>
                            </label>
                            <textarea
                                rows={3}
                                value={komentar}
                                onChange={(e) => setKomentar(e.target.value)}
                                maxLength={1000}
                                placeholder="Ceritakan pengalaman Anda atau berikan masukan untuk peningkatan layanan..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            />
                            <p className="text-[10px] text-slate-400 text-right">{komentar.length}/1000</p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {!submitted && (
                    <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                        >
                            <X className="w-3.5 h-3.5" />
                            Tutup
                        </button>
                        <button
                            type="button"
                            disabled={rating === 0 || submitting}
                            onClick={handleSubmit}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    Kirim Ulasan
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
