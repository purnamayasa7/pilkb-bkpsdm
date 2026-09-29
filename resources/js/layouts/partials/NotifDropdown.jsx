import React from "react";
import { router } from "@inertiajs/react";
import { Bell, BellOff, CheckCheck, ArrowRight, Clock, Tag } from "lucide-react";

function getNotifDotStyle(notifType, title, message, isUnread) {
    const typeLower = (notifType || "").toLowerCase();
    const textLower = `${title} ${message}`.toLowerCase();
    if (typeLower === "selesai" || textLower.includes("selesai") || textLower.includes("acc") || textLower.includes("diterima") || textLower.includes("disetujui") || textLower.includes("pengambilan")) {
        return { dot: isUnread ? "bg-emerald-500 dark:bg-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-900/50" : "bg-emerald-300 dark:bg-emerald-800/60" };
    }
    if (typeLower === "berkas_tidak_lengkap" || textLower.includes("btl") || textLower.includes("tidak lengkap") || textLower.includes("tolak") || textLower.includes("batal")) {
        return { dot: isUnread ? "bg-rose-500 dark:bg-rose-400 ring-2 ring-rose-200 dark:ring-rose-900/50" : "bg-rose-300 dark:bg-rose-800/60" };
    }
    if (typeLower === "review_perbaikan" || textLower.includes("perbaikan") || textLower.includes("revisi") || textLower.includes("tinjau ulang")) {
        return { dot: isUnread ? "bg-amber-500 dark:bg-amber-400 ring-2 ring-amber-200 dark:ring-amber-900/50" : "bg-amber-300 dark:bg-amber-800/60" };
    }
    if (typeLower === "usulan_baru" || textLower.includes("usulan baru") || textLower.includes("pengajuan baru") || textLower.includes("pendaftaran") || textLower.includes("baru dibuat")) {
        return { dot: isUnread ? "bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-200 dark:ring-blue-900/50" : "bg-blue-300 dark:bg-blue-800/60" };
    }
    return { dot: isUnread ? "bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-200 dark:ring-blue-900/50" : "bg-slate-300 dark:bg-slate-700" };
}

export default function NotifDropdown({ notifOpen, setNotifOpen, setProfileMenuOpen, setMsgDropdownOpen, unreadNotifsCount, notifList }) {
    const handleReadAll = () => {
        router.post("/notifications/read-all", {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => { setNotifOpen(!notifOpen); setProfileMenuOpen(false); setMsgDropdownOpen(false); }}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="Notifikasi"
            >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none">
                        {unreadNotifsCount > 99 ? "99+" : unreadNotifsCount}
                    </span>
                )}
            </button>

            {notifOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-3.5 sm:px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifikasi</h3>
                                {unreadNotifsCount > 0 ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">{unreadNotifsCount} Baru</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Semua Dibaca</span>
                                )}
                            </div>
                            {unreadNotifsCount > 0 && (
                                <button type="button" onClick={handleReadAll} className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer" title="Tandai semua notifikasi telah dibaca">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Tandai dibaca</span>
                                </button>
                            )}
                        </div>

                        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                            {notifList.length === 0 ? (
                                <div className="py-8 px-4 text-center">
                                    <BellOff className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Notifikasi</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">Pemberitahuan aktivitas usulan dan tiket Anda akan tampil di sini.</p>
                                </div>
                            ) : (
                                notifList.map((item) => {
                                    const isUnread = !item.is_read;
                                    const title = item.data?.title || "Pemberitahuan";
                                    const message = item.data?.message || item.data?.pesan || "-";
                                    const noTiket = item.data?.no_tiket || "";
                                    const notifType = item.data?.type || "";
                                    const itemUrl = `/notifications/read/${item.id}`;
                                    const dotStyle = getNotifDotStyle(notifType, title, message, isUnread);
                                    return (
                                        <a key={item.id} href={itemUrl} onClick={() => setNotifOpen(false)} className={`block p-3.5 sm:px-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${isUnread ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}>
                                            <div className="flex items-start gap-2.5">
                                                <div className="mt-0.5 flex-shrink-0"><span className={`w-2 h-2 rounded-full block mt-1 transition-all ${dotStyle.dot}`} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <h4 className={`text-xs truncate ${isUnread ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"}`}>{title}</h4>
                                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 flex-shrink-0"><Clock className="w-2.5 h-2.5" />{item.time_ago || ""}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{message}</p>
                                                    {noTiket && (
                                                        <div className="mt-1.5 flex items-center gap-1.5">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-semibold">
                                                                <Tag className="w-2.5 h-2.5 text-slate-400" />#{noTiket}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                            <a href="/notifications" onClick={() => setNotifOpen(false)} className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors w-full">
                                <span>Lihat Semua Notifikasi</span><ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}