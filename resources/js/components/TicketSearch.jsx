import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    X,
    Loader2,
    Ticket,
    Copy,
    Printer,
    ArrowRight,
    Check,
    Calendar,
    User,
    Layers,
    Tag,
} from 'lucide-react';

export default function TicketSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    // Modal state for ticket detail
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Click outside to close dropdown & handle Escape key
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setMobileSearchOpen(false);
                setSelectedTicket(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Debounce search query
    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 3) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/search-ticket?q=${encodeURIComponent(trimmed)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(Array.isArray(data) ? data : []);
                    setIsOpen(true);
                }
            } catch (err) {
                console.error('Error searching ticket:', err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelectTicket = async (noTiket) => {
        setIsOpen(false);
        setDetailLoading(true);
        setSelectedTicket(null);
        try {
            const response = await fetch(`/ticket/detail/${encodeURIComponent(noTiket)}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedTicket(data);
            }
        } catch (err) {
            console.error('Error fetching ticket detail:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Desktop / Tablet Search Input */}
            <div className="hidden sm:block relative w-64 md:w-80 lg:w-96">
                <div className="relative flex items-center">
                    <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (e.target.value.trim().length >= 3) setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (results.length > 0) setIsOpen(true);
                        }}
                        placeholder="Cari No Tiket atau NIP..."
                        className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                    />
                    {isLoading ? (
                        <Loader2 className="absolute right-3 w-4 h-4 text-blue-500 animate-spin" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setResults([]);
                                setIsOpen(false);
                            }}
                            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Mobile Search Button Trigger */}
            <div className="sm:hidden">
                <button
                    type="button"
                    onClick={() => setMobileSearchOpen(true)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                    title="Cari Tiket"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>

            {/* Mobile Search Overlay Modal */}
            {typeof document !== 'undefined' && mobileSearchOpen && createPortal(
                <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs p-4 sm:hidden flex flex-col">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none top-3" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari No Tiket atau NIP..."
                                    className="w-full pl-9 pr-8 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileSearchOpen(false);
                                    setQuery('');
                                    setResults([]);
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Results */}
                        <div className="mt-3 max-h-64 overflow-y-auto">
                            {isLoading ? (
                                <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    <span>Mencari tiket...</span>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-1">
                                    {results.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setMobileSearchOpen(false);
                                                handleSelectTicket(item.no_tiket);
                                            }}
                                            className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                #{item.no_tiket}
                                            </p>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">
                                                {item.layanan || '-'}
                                            </p>
                                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                                                {item.status || 'Diproses'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : query.trim().length >= 3 ? (
                                <div className="py-4 text-center text-xs text-slate-400">
                                    Tiket tidak ditemukan.
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Desktop Dropdown Search Results */}
            {isOpen && query.trim().length >= 3 && (
                <div className="hidden sm:block absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden z-50">
                    <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span>Hasil Pencarian</span>
                        <span>{results.length} ditemukan</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                        {isLoading ? (
                            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <span>Mencari tiket...</span>
                            </div>
                        ) : results.length > 0 ? (
                            results.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectTicket(item.no_tiket)}
                                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start justify-between gap-3 group"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                                                #{item.no_tiket}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 truncate mt-1">
                                            {item.layanan || 'Layanan Usulan'}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900/60 flex-shrink-0">
                                        {item.status || 'Diproses'}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="py-6 text-center text-xs text-slate-400">
                                Tiket tidak ditemukan untuk "{query}".
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Ticket Modal Popup */}
            {typeof document !== 'undefined' && (selectedTicket || detailLoading) && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSelectedTicket(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <Ticket className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Detail Tiket Usulan
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTicket(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {detailLoading ? (
                                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    <span>Memuat detail tiket...</span>
                                </div>
                            ) : selectedTicket ? (
                                <>
                                    {/* Ticket Header Card */}
                                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
                                        <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                            Nomor Tiket
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <h2 className="text-xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight">
                                                #{selectedTicket.no_tiket}
                                            </h2>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(selectedTicket.no_tiket)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 shadow-2xs transition-colors"
                                                title="Salin Nomor Tiket"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Tersalin</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Salin</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Status Terakhir:</span>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                                {selectedTicket.status || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detail Fields Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Pengusul</span>
                                            </div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {selectedTicket.nama || '-'}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                {selectedTicket.nip || '-'}
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Tanggal Pengajuan</span>
                                            </div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                                                {selectedTicket.tanggal || '-'}
                                            </p>
                                        </div>

                                        <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                                <Layers className="w-3.5 h-3.5" />
                                                <span>Layanan & Bidang</span>
                                            </div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">
                                                {selectedTicket.layanan || '-'}
                                            </p>
                                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                                                {selectedTicket.bidang || 'BKPSDM Buleleng'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        {selectedTicket && (
                            <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
                                {selectedTicket.print_url && (
                                    <a
                                        href={selectedTicket.print_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Cetak Bukti</span>
                                    </a>
                                )}

                                {selectedTicket.can_review && selectedTicket.review_url && (
                                    <a
                                        href={selectedTicket.review_url}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
                                    >
                                        <span>Review Berkas</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
