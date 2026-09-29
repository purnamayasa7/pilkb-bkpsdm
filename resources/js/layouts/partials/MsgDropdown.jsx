import React from "react";
import { Link } from "@inertiajs/react";
import { MessageSquare, ArrowRight, Clock, Tag, Sparkles } from "lucide-react";
import { getInitials, formatCleanName } from "@/utils/initials";

export default function MsgDropdown({ msgDropdownOpen, setMsgDropdownOpen, setNotifOpen, setProfileMenuOpen, liveMessages }) {
    const unreadMessagesCount = liveMessages?.unread_count || 0;
    const messagesList = liveMessages?.list || [];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => { setMsgDropdownOpen(!msgDropdownOpen); setNotifOpen(false); setProfileMenuOpen(false); }}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="Pesan Chat"
            >
                <MessageSquare className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none">
                        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                    </span>
                )}
            </button>

            {msgDropdownOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setMsgDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-3.5 sm:px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pesan Chat</h3>
                                {unreadMessagesCount > 0 ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">{unreadMessagesCount} Baru</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Semua Dibaca</span>
                                )}
                            </div>
                            <Link href="/chat" onClick={() => setMsgDropdownOpen(false)} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                                Buka Chat
                            </Link>
                        </div>

                        {/* Pinned Banner Konsultasi LILI AI */}
                        <Link
                            href="/chat?room=lili_ai"
                            onClick={() => setMsgDropdownOpen(false)}
                            className="flex items-center gap-3 p-3 sm:px-4 bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-indigo-50/90 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-indigo-950/40 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/60 dark:hover:to-blue-900/40 border-b border-indigo-100/80 dark:border-indigo-900/50 transition-colors group cursor-pointer"
                            title="Konsultasi regulasi kepegawaian instan bersama Asisten Virtual LILI"
                        >
                            <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-indigo-300 dark:border-indigo-500 shadow-2xs">
                                    <img src="/images/lili-avatar.png" alt="LILI" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"; }} />
                                    <span className="w-full h-full bg-indigo-600 text-white font-bold text-[10px] hidden items-center justify-center">LI</span>
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1.5 ring-white dark:ring-slate-900 pointer-events-none" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">LILI Asisten Kepegawaian</h4>
                                    {/* <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60">Online 24/7</span> */}
                                </div>
                                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 truncate mt-0.5 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>Konsultasi regulasi kepegawaian instan</span>
                                </p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </Link>

                        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                            {messagesList.length === 0 ? (
                                <div className="py-8 px-4 text-center">
                                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Pesan</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">Percakapan tiket layanan kepegawaian Anda akan tampil di sini.</p>
                                </div>
                            ) : (
                                messagesList.map((item) => {
                                    const isUnread = (item.unread || 0) > 0;
                                    const cleanName = formatCleanName(item.nama_pengirim || "Pengguna");
                                    const itemUrl = `/chat?room=${item.id}`;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={itemUrl}
                                            onClick={() => {
                                                setMsgDropdownOpen(false);
                                                try { window.dispatchEvent(new CustomEvent("chat:read", { detail: { conversationId: item.id } })); } catch {}
                                            }}
                                            className={`block p-3.5 sm:px-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${isUnread ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                    {getInitials(cleanName, "KP")}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <h4 className={`text-xs truncate ${isUnread ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"}`}>{cleanName}</h4>
                                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 flex-shrink-0"><Clock className="w-2.5 h-2.5" />{item.time_ago || ""}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.last_message || "Belum ada pesan"}</p>
                                                    <div className="mt-1.5 flex items-center justify-between gap-1.5">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            {item.role_label && (<span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">{item.role_label.replace("_", " ")}</span>)}
                                                            {item.no_tiket && (<span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-semibold"><Tag className="w-2.5 h-2.5" />#{item.no_tiket}</span>)}
                                                        </div>
                                                        {isUnread && (<span className="min-w-[16px] h-[16px] px-1 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shrink-0">{item.unread}</span>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                            <Link href="/chat" onClick={() => setMsgDropdownOpen(false)} className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors w-full">
                                <span>Lihat Semua Percakapan</span><ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}