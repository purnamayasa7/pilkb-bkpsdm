import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    AlertOctagon,
    Info,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    X,
    ExternalLink,
    FileText,
    Calendar,
} from 'lucide-react';

/**
 * AnnouncementSlider
 *
 * Komponen Slim Slider / Carousel Banner Pengumuman & Maintenance Global.
 * Diletakkan persis di atas Hero Welcome Card pada Dashboard.
 *
 * Mengikuti pedoman desain Standard.md:
 *  - Menggunakan font Plus Jakarta Sans
 *  - Border halus: border border-slate-200 dark:border-slate-800
 *  - Tipografi kompak & line-clamping untuk efisiensi ruang vertikal
 *  - Navigasi slide kiri-kanan (terbaru di paling kiri/indeks 0)
 *  - Tombol Tutup (Dismiss) di sudut kanan atas
 */
// =========================================================================
// PENGATURAN DURASI SLIDER OTOMATIS:
// Ubah angka di bawah ini (dalam milidetik). Contoh: 8000 = 8 detik, 6000 = 6 detik.
// =========================================================================
const AUTO_PLAY_INTERVAL = 8000;

export default function AnnouncementSlider({ customAnnouncements = null, autoPlayInterval = AUTO_PLAY_INTERVAL }) {
    const { broadcast_announcements } = usePage().props;
    const rawList = customAnnouncements || broadcast_announcements || [];

    // Opsi 1: Pure React State (Refresh halaman langsung memunculkan kembali banner)
    const [dismissedIds, setDismissedIds] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState('right'); // 'right' | 'left'
    const [isHovered, setIsHovered] = useState(false);

    // Hapus sisa key sessionStorage lama jika pernah tersimpan sebelumnya
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.removeItem('pilkb_dismissed_announcements');
            } catch {}
        }
    }, []);

    // Filter pengumuman yang belum di-dismiss pada tampilan saat ini
    const activeList = rawList.filter((item) => !dismissedIds.includes(item.id));
    const total = activeList.length;

    // Pastikan currentIndex tidak out of bounds saat data berubah
    useEffect(() => {
        if (currentIndex >= total && total > 0) {
            setCurrentIndex(total - 1);
        }
    }, [total, currentIndex]);

    // Autoplay bergeser halus sesuai konfigurasi durasi jika lebih dari 1 pengumuman
    useEffect(() => {
        if (total <= 1 || isHovered) return;

        const timer = setInterval(() => {
            setDirection('right');
            setCurrentIndex((prev) => (prev + 1) % total);
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [total, isHovered, autoPlayInterval]);

    if (total === 0) {
        return null;
    }

    const current = activeList[currentIndex] || activeList[0];
    if (!current) return null;

    const handlePrev = () => {
        setDirection('left');
        setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    };

    const handleNext = () => {
        setDirection('right');
        setCurrentIndex((prev) => (prev + 1) % total);
    };

    // Dismiss murni di level state (akan muncul kembali jika halaman di-refresh)
    const handleDismissCurrent = () => {
        setDismissedIds((prev) => [...prev, current.id]);
    };

    // Konfigurasi tema semantik visual sesuai tipe pengumuman (Border halus pada card)
    const themeConfig = {
        warning: {
            cardBorder: 'border-amber-300/80 dark:border-amber-800/80 bg-gradient-to-r from-amber-50/30 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900',
            iconBox: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/40',
            icon: AlertTriangle,
        },
        danger: {
            cardBorder: 'border-rose-300/80 dark:border-rose-800/80 bg-gradient-to-r from-rose-50/30 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900',
            iconBox: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/40',
            icon: AlertOctagon,
        },
        success: {
            cardBorder: 'border-emerald-300/80 dark:border-emerald-800/80 bg-gradient-to-r from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900',
            iconBox: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/40',
            icon: CheckCircle2,
        },
        info: {
            cardBorder: 'border-blue-300/80 dark:border-blue-800/80 bg-gradient-to-r from-blue-50/30 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900',
            iconBox: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/40',
            icon: Info,
        },
    };

    const activeTheme = themeConfig[current.tipe] || themeConfig.info;
    const IconComponent = activeTheme.icon;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative rounded-2xl border shadow-xs overflow-hidden transition-all duration-300 ${activeTheme.cardBorder}`}
        >
            <div className="px-4 pt-3.5 pb-2.5 sm:px-5 sm:pt-4 sm:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    {/* Sisi Kiri: Icon, Judul, Pesan, Link (dengan Efek Slide Horizontal) */}
                    <div
                        key={current.id}
                        className={`flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0 ${
                            direction === 'left' ? 'animate-slide-left' : 'animate-slide-right'
                        }`}
                    >
                        {/* Icon Box */}
                        <div className={`p-2 sm:p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${activeTheme.iconBox}`}>
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>

                        {/* Konten Teks */}
                        <div className="flex-1 min-w-0">
                            {/* Judul Pengumuman (Max 100 char) */}
                            <h3
                                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight"
                                title={current.judul}
                            >
                                {current.judul}
                            </h3>

                            {/* Pesan Ringkas (Max 255 char) */}
                            <p
                                className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed"
                                title={current.pesan}
                            >
                                {current.pesan}
                            </p>

                            {/* Tombol Tautan Aksi (Jika Disediakan) - Sesuai Bab 10 Standard.md */}
                            {current.tautan && (
                                <div className="mt-2.5">
                                    <a
                                        href={current.tautan}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs cursor-pointer"
                                    >
                                        <span>Lihat Selengkapnya</span>
                                        <ExternalLink className="w-3 h-3 text-blue-400 ml-0.5" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sisi Kanan: Kontrol Slider & Tombol Tutup */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                        {total > 1 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mr-1 select-none">
                                    {currentIndex + 1} / {total}
                                </span>

                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                                    title="Pengumuman sebelumnya"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                                    title="Pengumuman berikutnya"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Tombol Close / Dismiss */}
                        <button
                            type="button"
                            onClick={handleDismissCurrent}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Tutup banner ini"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Dots Indikator (Tampil Jika Slide > 1) - Ramping & Rapi */}
                {total > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-1.5 sm:mt-2">
                        {activeList.map((item, idx) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 'right' : 'left');
                                    setCurrentIndex(idx);
                                }}
                                className={`transition-all duration-300 rounded-full cursor-pointer ${
                                    idx === currentIndex
                                        ? 'w-4 h-1 bg-blue-600 dark:bg-blue-500'
                                        : 'w-1.5 h-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                                title={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
