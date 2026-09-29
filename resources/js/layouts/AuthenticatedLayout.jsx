import React, { useState, useEffect, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    Menu, X, Sun, Moon, User, Key, LogOut,
    ChevronDown, CheckCircle2, AlertCircle,
    PanelLeftClose, PanelLeft,
} from "lucide-react";
import TicketSearch from "../components/TicketSearch";
import Footer from "../components/Footer";
import { getInitials } from "@/utils/initials";
import Sidebar from "./partials/Sidebar";
import NotifDropdown from "./partials/NotifDropdown";
import MsgDropdown from "./partials/MsgDropdown";

export default function AuthenticatedLayout({ children, title, fullHeight = false, noPadding = false }) {
    const { props, url } = usePage();
    const {
        auth,
        flash,
        menu = [],
        notifications = { unread_count: 0, list: [] },
        unread_messages = { unread_count: 0, list: [] },
        firebase: firebaseConfig,
    } = props;
    const user = auth?.user;
    const unreadNotifsCount = notifications?.unread_count || 0;
    const notifList = notifications?.list || [];

    // 🛡️ AMAN CHAT: liveMessages & setLiveMessages tetap di sini, bukan di MsgDropdown
    const [liveMessages, setLiveMessages] = useState(unread_messages || { unread_count: 0, list: [] });

    useEffect(() => {
        setLiveMessages(unread_messages || { unread_count: 0, list: [] });
    }, [unread_messages]);

    // 🛡️ AMAN CHAT: lastSoundTimeRef tetap di sini untuk mencegah double-chime
    const lastSoundTimeRef = useRef(0);

    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("pilkb-sidebar-collapsed") === "true";
        }
        return false;
    });
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgDropdownOpen, setMsgDropdownOpen] = useState(false);
    const [flashVisible, setFlashVisible] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    // Navigation spinner dengan threshold 250ms
    useEffect(() => {
        let navTimer = null;
        const removeStart = router.on("start", (event) => {
            if (event?.detail?.visit?.only && event.detail.visit.only.length > 0) return;
            if (navTimer) clearTimeout(navTimer);
            navTimer = setTimeout(() => { setIsNavigating(true); }, 250);
        });
        const removeFinish = router.on("finish", () => {
            if (navTimer) { clearTimeout(navTimer); navTimer = null; }
            setIsNavigating(false);
        });
        return () => { if (navTimer) clearTimeout(navTimer); removeStart(); removeFinish(); };
    }, []);

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") localStorage.setItem("pilkb-sidebar-collapsed", String(next));
            return next;
        });
    };

    // 🛡️ AMAN CHAT: Semua event handler chat tetap di sini sesuai rencana perlindungan
    useEffect(() => {
        const handleChatRead = (e) => {
            const convId = Number(e.detail?.conversationId);
            if (!convId) return;
            setLiveMessages(prev => {
                if (!prev) return prev;
                const prevList = prev.list || [];
                const target = prevList.find(item => Number(item.id) === convId);
                const readCount = Number(target?.unread || 0);
                const updatedList = prevList.map(item => Number(item.id) === convId ? { ...item, unread: 0 } : item);
                return { unread_count: Math.max(0, (Number(prev.unread_count) || 0) - readCount), list: updatedList };
            });
        };

        const handleChatReadAll = () => {
            setLiveMessages(prev => {
                if (!prev) return prev;
                return { unread_count: 0, list: (prev.list || []).map(item => ({ ...item, unread: 0 })) };
            });
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") { setMsgDropdownOpen(false); setNotifOpen(false); setProfileMenuOpen(false); }
        };

        const handleChatSyncUnread = (e) => {
            if (!e.detail) return;
            setLiveMessages({ unread_count: Number(e.detail.unread_count) || 0, list: Array.isArray(e.detail.list) ? e.detail.list : [] });
        };

        window.addEventListener("chat:read", handleChatRead);
        window.addEventListener("chat:read-all", handleChatReadAll);
        window.addEventListener("chat:sync-unread", handleChatSyncUnread);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("chat:read", handleChatRead);
            window.removeEventListener("chat:read-all", handleChatReadAll);
            window.removeEventListener("chat:sync-unread", handleChatSyncUnread);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Dark/Light Mode sync
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || localStorage.getItem("pilkb-dark-mode");
        if (storedTheme === "dark") { document.documentElement.classList.add("dark"); setDarkMode(true); }
        else { document.documentElement.classList.remove("dark"); setDarkMode(false); }
    }, []);

    // 🛡️ AMAN CHAT: Firebase listener tetap di sini (tidak dipindah ke MsgDropdown)
    useEffect(() => {
        if (typeof window === "undefined" || !window.firebase || !firebaseConfig?.databaseURL || !user?.id) return;
        try {
            if (!window.firebase.apps?.length) window.firebase.initializeApp(firebaseConfig);
            if (!window.FirebaseDB) window.FirebaseDB = window.firebase.database();

            const userEventRef = window.FirebaseDB.ref(`users/${user.id}/last_event`);
            const mountTime = Date.now();
            let isFirstSnapshot = true;

            const handleUserEvent = (snap) => {
                const val = snap.val();
                if (!val || !val.messageData) return;

                if (isFirstSnapshot) { isFirstSnapshot = false; return; }

                const eventTime = Number(val.sent_at || val.messageData?.timestamp || val.timestamp || 0);
                if (eventTime > 0 && eventTime < mountTime) return;

                const senderUserId = Number(val.messageData?.sender_user_id);
                const isFromMe = senderUserId === Number(user.id);
                if (isFromMe) return;

                const isOnChat = typeof window !== "undefined" && window.location.pathname.startsWith("/chat");
                if (isOnChat) return;

                // Update optimistik badge navbar
                setLiveMessages(prev => {
                    const prevList = prev?.list || [];
                    const convId = Number(val.conversationData?.id);
                    const cleanName = val.conversationData?.nama_pengirim || val.messageData?.sender_name || "Pengguna";
                    const existingItem = prevList.find(item => Number(item.id) === convId);
                    const prevItemUnread = Number(existingItem?.unread || 0);
                    const newMsgItem = {
                        id: convId,
                        no_tiket: val.conversationData?.no_tiket,
                        nama_pengirim: cleanName,
                        role_label: val.conversationData?.sender_role_label || "User",
                        last_message: val.messageData?.message || "Pesan baru",
                        time_ago: "Baru saja",
                        unread: prevItemUnread + 1,
                        url: `/chat?room=${convId}`,
                    };
                    const filtered = prevList.filter(item => Number(item.id) !== convId);
                    return { unread_count: (Number(prev?.unread_count) || 0) + 1, list: [newMsgItem, ...filtered].slice(0, 5) };
                });

                // 🛡️ AMAN CHAT: Audio chime tetap dibunyikan dari sini
                const now = Date.now();
                if (now - lastSoundTimeRef.current > 1500) {
                    lastSoundTimeRef.current = now;
                    try { const audio = new Audio("/sound/notification.mp3"); audio.play().catch(() => {}); } catch {}
                }
            };

            userEventRef.on("value", handleUserEvent);
            return () => { userEventRef.off("value", handleUserEvent); };
        } catch (e) {
            console.warn("Navbar Firebase error:", e);
        }
    }, [user?.id, firebaseConfig]);

    const toggleTheme = () => {
        const newDark = !darkMode;
        setDarkMode(newDark);
        if (newDark) { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); localStorage.setItem("pilkb-dark-mode", "dark"); }
        else { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); localStorage.setItem("pilkb-dark-mode", "light"); }
    };

    useEffect(() => {
        if (flash?.success || flash?.error || flash?.warning) {
            setFlashVisible(true);
            const timer = setTimeout(() => setFlashVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar dari aplikasi?")) router.post("/logout");
    };

    const currentUrl = url ? url.split("?")[0] : (typeof window !== "undefined" ? window.location.pathname : "");

    return (
        <div className={`${fullHeight ? "fixed inset-0 overflow-hidden" : "min-h-screen"} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200`}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Navigation Spinner */}
            <div
                className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/20 dark:bg-slate-950/50 transition-opacity duration-150 ${isNavigating ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
                aria-hidden={!isNavigating}
                aria-label="Memuat halaman..."
            >
                <div className="relative flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <span className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-800" />
                        <span className={`absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 dark:border-t-blue-500 ${isNavigating ? "animate-spin" : ""}`} style={{ animationDuration: "0.85s" }} />
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                            <img src="/images/KabBuleleng.png" alt="Loading..." loading="eager" decoding="sync" className="w-10 h-10 object-contain" />
                        </div>
                    </div>
                </div>
            </div>

            {/* SIDEBAR — React.memo: tidak re-render saat badge notif/pesan berubah */}
            <Sidebar
                menu={menu}
                user={user}
                currentUrl={currentUrl}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                sidebarCollapsed={sidebarCollapsed}
            />

            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 ease-in-out ${fullHeight ? "h-full overflow-hidden" : ""} ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
                {/* Topbar */}
                <header className="sticky top-0 z-30 w-full h-16 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <button type="button" onClick={() => setSidebarOpen(true)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xs lg:hidden" title="Buka Menu">
                            <Menu className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={toggleSidebarCollapsed} className="hidden lg:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xs" title={sidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}>
                            <Menu className="w-4 h-4" />
                        </button>
                        <TicketSearch />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Dark/Light Toggle */}
                        <button type="button" onClick={toggleTheme} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xs" title={darkMode ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}>
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* Notification Dropdown */}
                        <NotifDropdown
                            notifOpen={notifOpen}
                            setNotifOpen={setNotifOpen}
                            setProfileMenuOpen={setProfileMenuOpen}
                            setMsgDropdownOpen={setMsgDropdownOpen}
                            unreadNotifsCount={unreadNotifsCount}
                            notifList={notifList}
                        />

                        {/* Messages Dropdown — hanya menerima props, tidak menyimpan state chat */}
                        <MsgDropdown
                            msgDropdownOpen={msgDropdownOpen}
                            setMsgDropdownOpen={setMsgDropdownOpen}
                            setNotifOpen={setNotifOpen}
                            setProfileMenuOpen={setProfileMenuOpen}
                            liveMessages={liveMessages}
                        />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button type="button" onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifOpen(false); setMsgDropdownOpen(false); }} className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs text-left">
                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">{getInitials(user?.nama, "U")}</div>
                                <div className="hidden md:block">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{user?.nama ? user.nama.split(",")[0].trim() : "User"}</p>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium capitalize">{user?.role ? user.role.replace("_", " ") : "Petugas"}</p>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 hidden sm:block" />
                            </button>

                            {profileMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.nama || "Pengguna"}</p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || user?.username}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <User className="w-4 h-4 text-slate-400" /><span>Profil Saya</span>
                                            </Link>
                                            <Link href="/change-password" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <Key className="w-4 h-4 text-slate-400" /><span>Ganti Password</span>
                                            </Link>
                                        </div>
                                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                                            <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium">
                                                <LogOut className="w-4 h-4" /><span>Keluar (Logout)</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className={`flex-1 min-h-0 ${noPadding ? "p-0 overflow-hidden flex flex-col" : "p-4 sm:p-6 lg:p-8"}`}>
                    {flashVisible && (flash?.success || flash?.error || flash?.warning) && (
                        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs transition-all shadow-xs animate-in fade-in duration-200 ${
                            flash.success ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                            : flash.warning ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                            : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                        }`}>
                            <div className="flex items-center gap-2.5">
                                {flash.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <AlertCircle className={`w-4 h-4 flex-shrink-0 ${flash.warning ? "text-amber-500" : "text-rose-500"}`} />}
                                <span className="font-medium">{flash.success || flash.warning || flash.error}</span>
                            </div>
                            <button type="button" onClick={() => setFlashVisible(false)} className="p-1 hover:opacity-75 transition-opacity cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                    {children}
                </main>

                {!fullHeight && <Footer />}
            </div>
        </div>
    );
}