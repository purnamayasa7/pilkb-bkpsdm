import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

/**
 * Helper function to get badge styling based on status string.
 * Bisa diekspor jika halaman butuh info status tanpa merender badge langsung (misal untuk timeline dot).
 */
export function getStatusStyle(statusName) {
    const statusLower = (statusName || '').toLowerCase();

    if (statusLower.includes('selesai') || statusLower.includes('setuju') || statusLower.includes('acc')) {
        return {
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200/80 dark:border-emerald-800/60',
            icon: CheckCircle2,
            dot: 'bg-emerald-500',
        };
    }
    if (statusLower.includes('perbaikan') || statusLower.includes('btl') || statusLower.includes('revisi')) {
        return {
            bg: 'bg-amber-50 dark:bg-amber-950/40',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200/80 dark:border-amber-800/60',
            icon: AlertCircle,
            dot: 'bg-amber-500',
        };
    }
    if (statusLower.includes('tolak') || statusLower.includes('batal')) {
        return {
            bg: 'bg-rose-50 dark:bg-rose-950/40',
            text: 'text-rose-700 dark:text-rose-300',
            border: 'border-rose-200/80 dark:border-rose-800/60',
            icon: XCircle,
            dot: 'bg-rose-500',
        };
    }
    // Default: Sedang Diproses / Menunggu Verifikasi
    return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200/80 dark:border-blue-800/60',
        icon: Clock,
        dot: 'bg-blue-500',
    };
}

/**
 * StatusBadge Component
 * Mengikuti Standard.md: warna standar PILKB, card border halus, font tailwind.
 */
export default function StatusBadge({
    status = 'Menunggu Verifikasi',
    size = 'md',
    showDot = false,
    showIcon = false,
    className = '',
}) {
    const style = getStatusStyle(status);
    const IconComponent = style.icon;

    const sizeClasses =
        size === 'xs'
            ? 'px-2 py-0.5 text-[11px] gap-1'
            : size === 'sm'
            ? 'px-2.5 py-0.5 text-xs gap-1.5'
            : 'px-2.5 py-1 text-xs gap-1.5';

    const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5';
    const iconSize = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
        >
            {showDot && <span className={`${dotSize} rounded-full ${style.dot} flex-shrink-0`} />}
            {showIcon && <IconComponent className={`${iconSize} flex-shrink-0`} />}
            <span className="truncate">{status}</span>
        </span>
    );
}
