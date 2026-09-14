import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Menu,
    X,
    Sun,
    Moon,
    User,
    Key,
    LogOut,
    Bell,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    PanelLeftClose,
    PanelLeft,
    CheckCheck,
    BellOff,
    ArrowRight,
    Clock,
    Tag,
    MessageSquare,
    Sparkles,
} from 'lucide-react';
import MenuIcon from '../components/MenuIcon';
import TicketSearch from '../components/TicketSearch';
import { getInitials, formatCleanName } from '@/utils/initials';

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
    const [liveMessages, setLiveMessages] = useState(unread_messages || { unread_count: 0, list: [] });

    useEffect(() => {
        setLiveMessages(unread_messages || { unread_count: 0, list: [] });
    }, [unread_messages]);

    const unreadMessagesCount = liveMessages?.unread_count || 0;
    const messagesList = liveMessages?.list || [];

    const lastSoundTimeRef = useRef(0);

    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('pilkb-sidebar-collapsed') === 'true';
        }
        return false;
    });
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [msgDropdownOpen, setMsgDropdownOpen] = useState(false);
    const [flashVisible, setFlashVisible] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    // Listen to Inertia page navigation events for custom logo spinner
    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            // Jangan memunculkan full-screen spinner jika ini partial/background reload
            if (event?.detail?.visit?.only && event.detail.visit.only.length > 0) {
                return;
            }
            setIsNavigating(true);
        });
        const removeFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('pilkb-sidebar-collapsed', String(next));
            }
            return next;
        });
    };

    // Global listener when chat is marked read anywhere (e.g. from chat room or navbar click)
    useEffect(() => {
        const handleChatRead = (e) => {
            const convId = Number(e.detail?.conversationId);
            if (!convId) return;

            setLiveMessages(prev => {
                if (!prev) return prev;
                const prevList = prev.list || [];
                const target = prevList.find(item => Number(item.id) === convId);
                const readCount = Number(target?.unread || 0);

                const updatedList = prevList.map(item =>
                    Number(item.id) === convId ? { ...item, unread: 0 } : item
                );

                return {
                    unread_count: Math.max(0, (Number(prev.unread_count) || 0) - readCount),
                    list: updatedList,
                };
            });
        };

        const handleChatReadAll = () => {
            setLiveMessages(prev => {
                if (!prev) return prev;
                return {
                    unread_count: 0,
                    list: (prev.list || []).map(item => ({ ...item, unread: 0 })),
                };
            });
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setMsgDropdownOpen(false);
                setNotifOpen(false);
                setProfileMenuOpen(false);
            }
        };

        const handleChatSyncUnread = (e) => {
            if (!e.detail) return;
            setLiveMessages({
                unread_count: Number(e.detail.unread_count) || 0,
                list: Array.isArray(e.detail.list) ? e.detail.list : [],
            });
        };

        window.addEventListener('chat:read', handleChatRead);
        window.addEventListener('chat:read-all', handleChatReadAll);
        window.addEventListener('chat:sync-unread', handleChatSyncUnread);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('chat:read', handleChatRead);
            window.removeEventListener('chat:read-all', handleChatReadAll);
            window.removeEventListener('chat:sync-unread', handleChatSyncUnread);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Sync Dark/Light Mode state (Default Light Mode)
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || localStorage.getItem('pilkb-dark-mode');
        if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setDarkMode(false);
        }
    }, []);

    // Firebase realtime sync for unread messages when on pages other than /chat
    useEffect(() => {
        if (typeof window === 'undefined' || !window.firebase || !firebaseConfig?.databaseURL || !user?.id) {
            return;
        }

        try {
            if (!window.firebase.apps?.length) {
                window.firebase.initializeApp(firebaseConfig);
            }
            if (!window.FirebaseDB) {
                window.FirebaseDB = window.firebase.database();
            }

            const userEventRef = window.FirebaseDB.ref(`users/${user.id}/last_event`);
            const mountTime = Date.now();
            let isFirstSnapshot = true;

            const handleUserEvent = (snap) => {
                const val = snap.val();
                if (!val || !val.messageData) return;

                // Abaikan snapshot inisial yang merupakan pesan lama dari sebelum page dibuka
                if (isFirstSnapshot) {
                    isFirstSnapshot = false;
                    return;
                }

                const eventTime = Number(val.sent_at || val.messageData?.timestamp || val.timestamp || 0);
                if (eventTime > 0 && eventTime < mountTime) {
                    return;
                }

                const senderUserId = Number(val.messageData?.sender_user_id);
                const isFromMe = senderUserId === Number(user.id);
                if (isFromMe) return;

                const isOnChat = typeof window !== 'undefined' && window.location.pathname.startsWith('/chat');
                if (isOnChat) {
                    // Ketika pengguna sedang berada di halaman /chat, seluruh status percakapan,
                    // penentuan room aktif, audio chime, dan badge navbar disinkronkan oleh Chat/Index
                    return;
                }

                // Update optimistik instan (0ms) pada icon navbar dan dropdown list
                setLiveMessages(prev => {
                    const prevList = prev?.list || [];
                    const convId = Number(val.conversationData?.id);
                    const cleanName = val.conversationData?.nama_pengirim || val.messageData?.sender_name || 'Pengguna';
                    const existingItem = prevList.find(item => Number(item.id) === convId);
                    const prevItemUnread = Number(existingItem?.unread || 0);
                    const newItemUnread = prevItemUnread + 1;

                    const newMsgItem = {
                        id: convId,
                        no_tiket: val.conversationData?.no_tiket,
                        nama_pengirim: cleanName,
                        role_label: val.conversationData?.sender_role_label || 'User',
                        last_message: val.messageData?.message || 'Pesan baru',
                        time_ago: 'Baru saja',
                        unread: newItemUnread,
                        url: `/chat?room=${convId}`,
                    };
                    const filtered = prevList.filter(item => Number(item.id) !== convId);
                    return {
                        unread_count: (Number(prev?.unread_count) || 0) + 1,
                        list: [newMsgItem, ...filtered].slice(0, 5),
                    };
                });

                // Bunyikan chime notifikasi jika pengguna sedang berada di halaman luar /chat
                const now = Date.now();
                if (now - lastSoundTimeRef.current > 1500) {
                    lastSoundTimeRef.current = now;
                    try {
                        const audio = new Audio('/sound/notification.mp3');
                        audio.play().catch(() => {});
                    } catch {}
                }
            };

            userEventRef.on('value', handleUserEvent);

            return () => {
                userEventRef.off('value', handleUserEvent);
            };
        } catch (e) {
            console.warn('Navbar Firebase error:', e);
        }
    }, [user?.id, firebaseConfig]);

    const handleReadAllNotifications = () => {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const toggleTheme = () => {
        const newDark = !darkMode;
        setDarkMode(newDark);
        if (newDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('pilkb-dark-mode', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            localStorage.setItem('pilkb-dark-mode', 'light');
        }
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
        if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
            router.post('/logout');
        }
    };

    const currentUrl = url ? url.split('?')[0] : (typeof window !== 'undefined' ? window.location.pathname : '');

    return (
        <div className={`${fullHeight ? 'h-screen h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200`}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Page Navigation Logo Spinner (Center Screen) ── */}
            <div
                className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/20 dark:bg-slate-950/50 backdrop-blur-xs transition-all duration-200 ${
                    isNavigating ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
                }`}
                aria-hidden={!isNavigating}
                aria-label="Memuat halaman..."
            >
                <div className="relative flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        {/* Static outer subtle track ring */}
                        <span className="absolute inset-0 rounded-full border border-slate-200 dark:border-slate-800" />
                        {/* Spinning ring: 1 solid brand color */}
                        <span
                            className={`absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 dark:border-t-blue-500 ${
                                isNavigating ? 'animate-spin' : ''
                            }`}
                            style={{ animationDuration: '0.85s' }}
                        />
                        {/* Logo container (clean, sharp, no glow) */}
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                            <img
                                src="/images/KabBuleleng.png"
                                alt="Loading..."
                                loading="eager"
                                decoding="sync"
                                className="w-10 h-10 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SIDEBAR: Modern PILKB Sidebar */}
            <aside
                className={`sidebar-container fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
            >
                {/* Brand Logo Header */}
                <div className={`h-16 flex items-center ${sidebarCollapsed ? 'lg:justify-center lg:px-2 px-5 justify-between' : 'justify-between px-5'} flex-shrink-0 transition-all duration-300`}>
                    <Link href="/dashboard" className="flex items-center gap-3.5 group overflow-hidden">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50/70 dark:bg-slate-800 border border-blue-100/70 dark:border-slate-700/60 p-1 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                            <img
                                src="/images/KabBuleleng.png"
                                alt="Logo Buleleng"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className={`${sidebarCollapsed ? 'lg:hidden' : 'block'} transition-opacity duration-200 whitespace-nowrap`}>
                            <h1 className="font-extrabold text-base leading-tight tracking-tight text-slate-900 dark:text-white">
                                PILKB
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mt-0.5">
                                BKPSDM BULELENG
                            </p>
                        </div>
                    </Link>

                    {/* Mobile close */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className={`flex-1 overflow-y-auto sidebar-scroll ${sidebarCollapsed ? 'lg:px-2.5 px-3.5' : 'px-3.5'} pt-1 pb-4 space-y-1 transition-all duration-300`}>
                    {(() => {
                        const allMenuHrefs = menu
                            .filter((i) => i.type !== 'heading' && i.path)
                            .map((i) => (i.path.startsWith('http') || i.path.startsWith('/') ? i.path : `/${i.path}`));
                        const exactMatchExists = allMenuHrefs.includes(currentUrl);

                        return menu.map((item, idx) => {
                            if (item.type === 'heading') {
                                if (sidebarCollapsed) {
                                    return (
                                        <div
                                            key={idx}
                                            className="hidden lg:block my-2 mx-1 border-t border-slate-100 dark:border-slate-800/80"
                                            title={item.title}
                                        />
                                    );
                                }
                                return (
                                    <div
                                        key={idx}
                                        className={`${idx === 0 ? 'pt-1.5 pb-2' : 'pt-5 pb-2'} px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500`}
                                    >
                                        {item.title}
                                    </div>
                                );
                            }

                            const href = item.path?.startsWith('http') || item.path?.startsWith('/')
                                ? item.path
                                : `/${item.path}`;

                            let isActive = false;
                            if (exactMatchExists) {
                                isActive = currentUrl === href;
                            } else {
                                const matchingPrefixes = allMenuHrefs.filter((h) => h !== '/' && (currentUrl === h || currentUrl.startsWith(`${h}/`)));
                                const bestMatch = matchingPrefixes.sort((a, b) => b.length - a.length)[0];
                                isActive = href === bestMatch;
                            }

                            const isHighlight = !isActive && (item.icon === 'file-plus' || item.active_key === 'register');
                            const hasBtlWarning = Boolean(item.badge_count && Number(item.badge_count) > 0);
                            const isWarning = !isActive && hasBtlWarning;

                            return (
                                <Link
                                    key={idx}
                                    href={href}
                                    target={item.target || undefined}
                                    onClick={() => setSidebarOpen(false)}
                                    title={sidebarCollapsed ? (hasBtlWarning ? `${item.title} (${item.badge_count} berkas BTL)` : item.title) : undefined}
                                    className={`flex items-center ${
                                        sidebarCollapsed ? 'lg:justify-center lg:px-2 px-3.5 gap-3' : 'gap-3 px-3.5'
                                    } py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-xs font-semibold'
                                            : isWarning
                                            ? 'bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100/60 dark:hover:bg-rose-900/40'
                                            : isHighlight
                                            ? 'bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100/60 dark:hover:bg-blue-900/40'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <MenuIcon
                                        name={isWarning ? 'alert-circle' : item.icon}
                                        className={`w-[18px] h-[18px] flex-shrink-0 ${
                                            isActive
                                                ? 'text-white'
                                                : isWarning
                                                ? 'text-rose-500 dark:text-rose-400'
                                                : isHighlight
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}
                                    />
                                    <span className={`truncate flex-1 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                                        {item.title}
                                    </span>

                                    {hasBtlWarning && (
                                        <span
                                            className={`px-1.5 py-0.5 min-w-[20px] h-5 rounded-full ${
                                                isActive
                                                    ? 'bg-white text-blue-600 font-bold'
                                                    : 'bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold'
                                            } text-[11px] flex items-center justify-center flex-shrink-0 ${
                                                sidebarCollapsed ? 'lg:hidden' : 'flex'
                                            }`}
                                            title={`${item.badge_count} berkas BTL perlu perbaikan`}
                                        >
                                            {item.badge_count}
                                        </span>
                                    )}
                                </Link>
                            );
                        });
                    })()}
                </nav>

                {/* Sidebar Bottom: User Info */}
                <div className={`border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ${
                    sidebarCollapsed ? 'lg:p-3 p-5 lg:flex lg:justify-center' : 'p-5'
                }`}>
                    {sidebarCollapsed ? (
                        <>
                            <div
                                className="hidden lg:flex w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 items-center justify-center font-bold text-xs shadow-2xs cursor-default"
                                title={`${user?.nama || 'Petugas'} (${user?.role ? user.role.replace('_', ' ') : 'Petugas'})`}
                            >
                                {getInitials(user?.nama, 'P')}
                            </div>
                            <div className="lg:hidden">
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-none">
                                    Login sebagai:
                                </p>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize mt-1.5 tracking-tight">
                                    {user?.role ? user.role.replace('_', ' ') : 'Petugas'}
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                    {user?.nama || '-'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-none">
                                Login sebagai:
                            </p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize mt-1.5 tracking-tight">
                                {user?.role ? user.role.replace('_', ' ') : 'Petugas'}
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {user?.nama || '-'}
                            </p>
                        </div>
                    )}
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 ease-in-out ${
                fullHeight ? 'h-screen h-[100dvh] overflow-hidden' : ''
            } ${
                sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
            }`}>
                {/* Topbar Backdrop Blur */}
                <header className="sticky top-0 z-30 w-full h-16 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Mobile open button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xs lg:hidden"
                            title="Buka Menu"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        {/* Desktop Collapse Toggle (3 Strip dengan border identik) */}
                        <button
                            type="button"
                            onClick={toggleSidebarCollapsed}
                            className="hidden lg:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xs"
                            title={sidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        <TicketSearch />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Dark / Light Mode Toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xs"
                            title={darkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                        >
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* Notifications Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setNotifOpen(!notifOpen);
                                    setProfileMenuOpen(false);
                                    setMsgDropdownOpen(false);
                                }}
                                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                                title="Notifikasi"
                            >
                                <Bell className="w-4 h-4" />
                                {unreadNotifsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none">
                                        {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setNotifOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {/* Dropdown Header */}
                                        <div className="p-3.5 sm:px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    Notifikasi
                                                </h3>
                                                {unreadNotifsCount > 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                                        {unreadNotifsCount} Baru
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                        Semua Dibaca
                                                    </span>
                                                )}
                                            </div>

                                            {unreadNotifsCount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleReadAllNotifications}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                                                    title="Tandai semua notifikasi telah dibaca"
                                                >
                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                    <span>Tandai dibaca</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Dropdown List (Max 5 Notifikasi) */}
                                        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                                            {notifList.length === 0 ? (
                                                <div className="py-8 px-4 text-center">
                                                    <BellOff className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        Belum Ada Notifikasi
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                                                        Pemberitahuan aktivitas usulan dan tiket Anda akan tampil di sini.
                                                    </p>
                                                </div>
                                            ) : (
                                                notifList.map((item) => {
                                                    const isUnread = !item.is_read;
                                                    const title = item.data?.title || 'Pemberitahuan';
                                                    const message = item.data?.message || item.data?.pesan || '-';
                                                    const noTiket = item.data?.no_tiket || '';
                                                    const itemUrl = `/notifications/read/${item.id}`;

                                                    return (
                                                        <a
                                                            key={item.id}
                                                            href={itemUrl}
                                                            onClick={() => setNotifOpen(false)}
                                                            className={`block p-3.5 sm:px-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                                                                isUnread
                                                                    ? 'bg-blue-50/40 dark:bg-blue-950/20'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-2.5">
                                                                <div className="mt-0.5 flex-shrink-0">
                                                                    {isUnread ? (
                                                                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 block mt-1 ring-2 ring-blue-200 dark:ring-blue-900/50" />
                                                                    ) : (
                                                                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 block mt-1" />
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-baseline justify-between gap-2">
                                                                        <h4 className={`text-xs truncate ${
                                                                            isUnread
                                                                                ? 'font-bold text-slate-900 dark:text-white'
                                                                                : 'font-semibold text-slate-700 dark:text-slate-300'
                                                                        }`}>
                                                                            {title}
                                                                        </h4>
                                                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 flex-shrink-0">
                                                                            <Clock className="w-2.5 h-2.5" />
                                                                            {item.time_ago || ''}
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                                                        {message}
                                                                    </p>

                                                                    {noTiket && (
                                                                        <div className="mt-1.5 flex items-center gap-1.5">
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-semibold">
                                                                                <Tag className="w-2.5 h-2.5 text-slate-400" />
                                                                                #{noTiket}
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

                                        {/* Dropdown Footer */}
                                        <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                                            <a
                                                href="/notifications"
                                                onClick={() => setNotifOpen(false)}
                                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors w-full"
                                            >
                                                <span>Lihat Semua Notifikasi</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Messages Dropdown (Tepat di sebelah kiri badge Nama user) */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setMsgDropdownOpen(!msgDropdownOpen);
                                    setNotifOpen(false);
                                    setProfileMenuOpen(false);
                                }}
                                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                                title="Pesan Chat"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {unreadMessagesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs pointer-events-none">
                                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                                    </span>
                                )}
                            </button>

                            {msgDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setMsgDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {/* Dropdown Header */}
                                        <div className="p-3.5 sm:px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    Pesan Chat
                                                </h3>
                                                {unreadMessagesCount > 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                                        {unreadMessagesCount} Baru
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                        Semua Dibaca
                                                    </span>
                                                )}
                                            </div>

                                            <Link
                                                href="/chat"
                                                onClick={() => setMsgDropdownOpen(false)}
                                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                                            >
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
                                                    <img
                                                        src="/images/lili-avatar.png"
                                                        alt="LILI"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <span className="w-full h-full bg-indigo-600 text-white font-bold text-[10px] hidden items-center justify-center">
                                                        LI
                                                    </span>
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1.5 ring-white dark:ring-slate-900 pointer-events-none" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">
                                                        LILI Asisten Kepegawaian
                                                    </h4>
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60">
                                                        Online 24/7
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 truncate mt-0.5 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                                    <span>Konsultasi regulasi kepegawaian instan</span>
                                                </p>
                                            </div>

                                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                        </Link>

                                        {/* Dropdown List (Max 5 Pesan Percakapan) */}
                                        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                                            {messagesList.length === 0 ? (
                                                <div className="py-8 px-4 text-center">
                                                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        Belum Ada Pesan
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                                                        Percakapan tiket layanan kepegawaian Anda akan tampil di sini.
                                                    </p>
                                                </div>
                                            ) : (
                                                messagesList.map((item) => {
                                                    const isUnread = (item.unread || 0) > 0;
                                                    const cleanName = formatCleanName(item.nama_pengirim || 'Pengguna');
                                                    const itemUrl = `/chat?room=${item.id}`;

                                                    return (
                                                        <Link
                                                            key={item.id}
                                                            href={itemUrl}
                                                            onClick={() => {
                                                                setMsgDropdownOpen(false);
                                                                try {
                                                                    window.dispatchEvent(new CustomEvent('chat:read', { detail: { conversationId: item.id } }));
                                                                } catch {}
                                                            }}
                                                            className={`block p-3.5 sm:px-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                                                                isUnread
                                                                    ? 'bg-blue-50/40 dark:bg-blue-950/20'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                                    {getInitials(cleanName, 'KP')}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-baseline justify-between gap-2">
                                                                        <h4 className={`text-xs truncate ${
                                                                            isUnread
                                                                                ? 'font-bold text-slate-900 dark:text-white'
                                                                                : 'font-semibold text-slate-700 dark:text-slate-300'
                                                                        }`}>
                                                                            {cleanName}
                                                                        </h4>
                                                                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 flex-shrink-0">
                                                                            <Clock className="w-2.5 h-2.5" />
                                                                            {item.time_ago || ''}
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                                        {item.last_message || 'Belum ada pesan'}
                                                                    </p>

                                                                    <div className="mt-1.5 flex items-center justify-between gap-1.5">
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            {item.role_label && (
                                                                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                                                                                    {item.role_label.replace('_', ' ')}
                                                                                </span>
                                                                            )}
                                                                            {item.no_tiket && (
                                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-semibold">
                                                                                    <Tag className="w-2.5 h-2.5" />
                                                                                    #{item.no_tiket}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {isUnread && (
                                                                            <span className="min-w-[16px] h-[16px] px-1 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shrink-0">
                                                                                {item.unread}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {/* Dropdown Footer */}
                                        <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                                            <Link
                                                href="/chat"
                                                onClick={() => setMsgDropdownOpen(false)}
                                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors w-full"
                                            >
                                                <span>Lihat Semua Percakapan</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileMenuOpen(!profileMenuOpen);
                                    setNotifOpen(false);
                                    setMsgDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs text-left"
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                                    {getInitials(user?.nama, 'U')}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                                        {user?.nama ? user.nama.split(',')[0].trim() : 'User'}
                                    </p>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium capitalize">
                                        {user?.role ? user.role.replace('_', ' ') : 'Petugas'}
                                    </p>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 hidden sm:block" />
                            </button>

                            {profileMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setProfileMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {user?.nama || 'Pengguna'}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                {user?.email || user?.username}
                                            </p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span>Profil Saya</span>
                                            </Link>

                                            <Link
                                                href="/change-password"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <Key className="w-4 h-4 text-slate-400" />
                                                <span>Ganti Password</span>
                                            </Link>
                                        </div>

                                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-medium"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Keluar (Logout)</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className={`flex-1 min-h-0 ${noPadding ? 'p-0 overflow-hidden flex flex-col' : 'p-4 sm:p-6 lg:p-8'}`}>
                    {flashVisible && (flash?.success || flash?.error) && (
                        <div
                            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                                flash.success
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                {flash.success ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                )}
                                <span className="font-medium">{flash.success || flash.error}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFlashVisible(false)}
                                className="p-1 hover:opacity-75 transition-opacity"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
