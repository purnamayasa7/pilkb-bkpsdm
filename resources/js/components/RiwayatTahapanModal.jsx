import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStatusStyle } from '@/components/StatusBadge';

export default function RiwayatTahapanModal({
    isOpen,
    onClose,
    tiket,
    noTiket,
    nip,
    nama,
    namaLayanan: propNamaLayanan,
    namaUkerja: propNamaUkerja,
}) {
    const resolvedTiket = typeof tiket === 'object' && tiket !== null ? tiket : null;
    const resolvedNoTiket = typeof tiket === 'string' ? tiket : (noTiket || resolvedTiket?.no_tiket || null);

    const activeTiket = resolvedTiket || (resolvedNoTiket ? { 
        no_tiket: resolvedNoTiket, 
        nip: nip || null, 
        nama: nama || null, 
        nama_layanan: propNamaLayanan || null, 
        nama_ukerja: propNamaUkerja || null 
    } : null);

    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [extraTiket, setExtraTiket] = useState(null);

    const targetNoTiket = resolvedNoTiket || activeTiket?.no_tiket;

    useEffect(() => {
        if (isOpen && targetNoTiket) {
            setHistoryLoading(true);
            setHistoryData([]);
            setExtraTiket(null);

            fetch(`/tiket/history/${encodeURIComponent(targetNoTiket)}`)
                .then((res) => {
                    if (!res.ok) throw new Error('Gagal memuat riwayat');
                    return res.json();
                })
                .then((data) => {
                    let list = [];
                    let fetchedTiket = null;

                    if (Array.isArray(data)) {
                        list = data;
                        if (data.length > 0 && data[0]?.regtiket) {
                            fetchedTiket = data[0].regtiket;
                        }
                    } else if (data && typeof data === 'object') {
                        list = Array.isArray(data.tahapan) ? data.tahapan : (Array.isArray(data.data) ? data.data : []);
                        fetchedTiket = data.tiket || null;
                    }

                    setHistoryData(list);
                    if (fetchedTiket) {
                        setExtraTiket(fetchedTiket);
                    }
                    setHistoryLoading(false);
                })
                .catch((err) => {
                    console.error('Error fetching history:', err);
                    setHistoryLoading(false);
                });
        }
    }, [isOpen, targetNoTiket]);

    if (!isOpen || (!activeTiket && !targetNoTiket)) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    };

    const displayNama = (activeTiket?.nama && activeTiket.nama !== '-') 
        ? activeTiket.nama 
        : (extraTiket?.nama && extraTiket.nama !== '-' ? extraTiket.nama : '-');

    const displayNip = (activeTiket?.nip && activeTiket.nip !== '-') 
        ? activeTiket.nip 
        : (extraTiket?.nip && extraTiket.nip !== '-' ? extraTiket.nip : '-');

    const displayLayanan = activeTiket?.layanan?.nama_layanan 
        || activeTiket?.nama_layanan 
        || propNamaLayanan 
        || extraTiket?.layanan?.nama_layanan 
        || extraTiket?.nama_layanan 
        || '-';

    const displayTanggal = activeTiket?.tanggal 
        || extraTiket?.tanggal 
        || (historyData.length > 0 ? (historyData[0]?.regtiket?.tanggal || historyData[0]?.tanggal) : null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>Riwayat Tahapan</span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40">
                                {targetNoTiket}
                            </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[280px]">
                            {displayNama} • {displayNip}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
                    {/* Summary Info Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Layanan:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[220px]">
                                {displayLayanan}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Tanggal Usulan:</span>
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                {formatDate(displayTanggal)}
                            </span>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Tahapan Pemrosesan
                        </h4>
                        {historyLoading ? (
                            <div className="py-8 text-center text-slate-400">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs">Memuat riwayat tahapan...</p>
                            </div>
                        ) : historyData.length === 0 ? (
                            <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                Tidak ada catatan riwayat tahapan.
                            </div>
                        ) : (
                            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                {historyData.map((step, idx) => {
                                    const statusName = step.status_rel?.status || step.status || 'Tahapan';
                                    const statusStyle = getStatusStyle(statusName);
                                    return (
                                        <div key={idx} className="relative">
                                            <div
                                                className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${statusStyle.dot}`}
                                            />
                                            <div>
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {statusName}
                                                    </h5>
                                                    <span className="text-[10px] text-slate-400">
                                                        {formatDate(step.created_at || step.tanggal)}
                                                    </span>
                                                </div>
                                                {step.keterangan && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        {step.keterangan}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
