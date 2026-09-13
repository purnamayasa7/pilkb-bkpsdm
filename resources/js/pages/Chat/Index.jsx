import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { getInitials, formatCleanName } from '@/utils/initials';
import axios from 'axios';
import {
    MessageSquare,
    Search,
    X,
    PlusCircle,
    MoreVertical,
    CheckSquare,
    Check,
    CheckCheck,
    Trash2,
    ArrowLeft,
    RotateCcw,
    Lock,
    Smile,
    Send,
    Tag,
    Zap,
    Volume2,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Building2,
    Users,
    Briefcase,
    Shield,
    Sparkles,
    AlertCircle,
    Loader2,
    ChevronDown,
    FileDown,
    ExternalLink
} from 'lucide-react';

const EMOJIS = [
    '😊', '👍', '🙏', '👋', '😄', '🤝', '👌', '✅', '🙌', '✨',
    '💡', '🎉', '😁', '😉', '🤔', '🫡', '😎', '👏', '💪', '❤️',
    '🔥', '💯', '📌', '📝', '📋', '💼', '📂', '☕'
];

const LILI_SUGGESTIONS = [
    'Syarat Kenaikan Pangkat Reguler & Pilihan',
    'Cek Status Tiket Layanan Kepegawaian',
    'Ketentuan dan Syarat Cuti Tahunan ASN',
    'Prosedur Mutasi / Pindah Instansi Pegawai',
    'Pengusulan Pencantuman Gelar Pendidikan'
];

function formatMsgTime(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr.replace(' ', 'T'));
        if (isNaN(d.getTime())) return dateStr;
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}.${minutes}`;
    } catch {
        return dateStr;
    }
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr.replace(' ', 'T'));
        if (isNaN(d.getTime())) return '';
        const diffMs = Date.now() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins}m lalu`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}j lalu`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}h lalu`;
    } catch {
        return '';
    }
}

function getMessageDateGroup(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr.replace(' ', 'T'));
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return 'Hari ini';

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';

        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return '';
    }
}

function RoleBadge({ role, label }) {
    switch (role) {
        case 'opd':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide">
                    <Building2 className="w-2.5 h-2.5" />
                    <span>{label || 'OPD'}</span>
                </span>
            );
        case 'tamu':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    <Users className="w-2.5 h-2.5" />
                    <span>{label || 'Tamu'}</span>
                </span>
            );
        case 'bidang':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                    <Briefcase className="w-2.5 h-2.5" />
                    <span>{label || 'Bidang'}</span>
                </span>
            );
        case 'fo':
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                    <Shield className="w-2.5 h-2.5" />
                    <span>{label || 'FO'}</span>
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    <span>{label || 'Pengguna'}</span>
                </span>
            );
    }
}

function FormattedLiliText({ text }) {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className="space-y-1 text-xs leading-relaxed">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    return <div key={idx} className="h-1.5" />;
                }
                const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                const content = isBullet ? trimmed.substring(2) : trimmed;

                const parts = content.split(/(\*\*.*?\*\*)/g);
                const renderedParts = parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                            <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
                                {part.slice(2, -2)}
                            </strong>
                        );
                    }
                    return part;
                });

                if (isBullet) {
                    return (
                        <div key={idx} className="flex items-start gap-2 pl-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <div className="flex-1">{renderedParts}</div>
                        </div>
                    );
                }

                return <p key={idx}>{renderedParts}</p>;
            })}
        </div>
    );
}

export default function ChatIndex({ initialConversations = [], initialActiveId = null }) {
    const { auth, firebase: firebaseConfig } = usePage().props;
    const currentUser = auth?.user;
    const userRoleName = typeof currentUser?.role === 'string'
        ? currentUser.role
        : (currentUser?.role?.name || '');
    const isOpd = userRoleName === 'admin_opd';
    const isBidang = userRoleName === 'bidang';

    const userRoleLabel = useMemo(() => {
        if (userRoleName === 'admin_opd') return 'Admin OPD';
        if (userRoleName === 'bidang') return 'Bidang';
        if (userRoleName === 'admin_bawah') return 'Front Office (FO)';
        if (userRoleName === 'superadmin') return 'Super Admin';
        if (userRoleName === 'pimpinan') return 'Pimpinan';
        return userRoleName ? userRoleName.charAt(0).toUpperCase() + userRoleName.slice(1) : 'Administrator';
    }, [userRoleName]);

    // Lock page window scroll so ONLY Layout 1 and Layout 2 scroll
    useEffect(() => {
        const origBody = document.body.style.overflow;
        const origHtml = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = origBody;
            document.documentElement.style.overflow = origHtml;
        };
    }, []);

    // Responsive Mobile Detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Conversation State
    const [conversations, setConversations] = useState(initialConversations);
    const [activeId, setActiveId] = useState(null);
    const activeIdRef = useRef(null);
    useEffect(() => {
        activeIdRef.current = activeId;
    }, [activeId]);

    // Sinkronisasi status unread & list percakapan navbar secara real-time dari Chat/Index
    useEffect(() => {
        if (!conversations || !Array.isArray(conversations)) return;

        const totalUnread = conversations.reduce((sum, c) => sum + (Number(c.unread) || 0), 0);

        const top5 = conversations
            .filter(c => (Number(c.unread) || 0) > 0 || c.last_message)
            .slice(0, 5)
            .map(c => ({
                id: c.id,
                no_tiket: c.no_tiket,
                nama_pengirim: c.nama_pengirim || 'Pengguna',
                role_label: c.sender_role_label || c.sender_role || 'User',
                last_message: c.last_message || 'Belum ada pesan',
                time_ago: c.last_message_time ? formatRelativeTime(c.last_message_time) : '',
                unread: Number(c.unread) || 0,
                url: `/chat?room=${c.id}`,
            }));

        try {
            window.dispatchEvent(new CustomEvent('chat:sync-unread', {
                detail: {
                    unread_count: totalUnread,
                    list: top5,
                }
            }));
        } catch {}
    }, [conversations]);

    const [activeRoomData, setActiveRoomData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingRoom, setLoadingRoom] = useState(false);

    // IN-MEMORY CACHE & SCROLL RESTORATION (Request 3)
    const roomCacheRef = useRef(new Map()); // id -> { roomData, messages }
    const roomScrollPosRef = useRef(new Map()); // id -> number (scrollTop)
    const messagesContainerRef = useRef(null);
    const scrollBtnRef = useRef(null);
    const isAtBottomRef = useRef(true);
    const [roomNewMessagesCount, setRoomNewMessagesCount] = useState(0);
    const readRoomIdsRef = useRef(new Set());
    const liliVoicePlayedRef = useRef(false);
    const knownMessageIdsRef = useRef(new Set());

    // LIVE TYPING INDICATOR (Request 2)
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);
    const lastWhisperTimeRef = useRef(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread'
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
    const [roomMenuOpen, setRoomMenuOpen] = useState(false);

    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [ticketSearchInput, setTicketSearchInput] = useState('');
    const [ticketSearching, setTicketSearching] = useState(false);
    const [ticketSearchResult, setTicketSearchResult] = useState(null);
    const [ticketSearchError, setTicketSearchError] = useState('');
    const [startingTicketChat, setStartingTicketChat] = useState(false);

    const [liliMessages, setLiliMessages] = useState([
        {
            id: 'lili_welcome',
            role: 'assistant',
            content: `Halo ${currentUser?.nama ? currentUser.nama.split(',')[0] : 'Bapak/Ibu'}! 👋 Saya **LILI** (*Layanan Informasi & Literasi Kepegawaian Interaktif*) Asisten Virtual PILKB BKPSDM Kabupaten Buleleng.\n\nAda yang bisa saya bantu terkait regulasi ASN, syarat layanan, atau panduan kepegawaian hari ini?`,
            created_at: new Date().toISOString(),
            feedback: null
        }
    ]);
    const [liliLoading, setLiliLoading] = useState(false);
    const [copiedMsgId, setCopiedMsgId] = useState(null);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const headerMenuRef = useRef(null);
    const roomMenuRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const audioChimeRef = useRef(null);

    // SIDEBAR SCROLL POSITION & AUTO-SCROLL TO ACTIVE ITEM
    const sidebarListRef = useRef(null);
    const sidebarScrollPosRef = useRef(0);

    const scrollToActiveSidebarItem = useCallback((behavior = 'smooth') => {
        if (!activeId) return;

        const container = sidebarListRef.current;
        if (!container) return;

        const targetId = activeId === 'lili_ai' ? 'sidebar-item-lili_ai' : `sidebar-item-${activeId}`;
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const containerRect = container.getBoundingClientRect();
            const itemRect = targetElement.getBoundingClientRect();

            // Cek apakah item sudah sepenuhnya terlihat di dalam viewport container sidebar (dengan margin padding 8px)
            const isFullyVisible = (
                itemRect.top >= containerRect.top + 8 &&
                itemRect.bottom <= containerRect.bottom - 8
            );

            if (!isFullyVisible) {
                targetElement.scrollIntoView({
                    behavior: behavior,
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }
    }, [activeId]);

    // Auto-scroll sidebar ke item aktif saat activeId berubah atau saat list pertama kali dimuat
    useEffect(() => {
        if (!activeId) return;

        const timer1 = setTimeout(() => {
            scrollToActiveSidebarItem('smooth');
        }, 80);

        const timer2 = setTimeout(() => {
            scrollToActiveSidebarItem('smooth');
        }, 250);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [activeId, scrollToActiveSidebarItem]);

    // Saat filter atau search berubah, pastikan active item tetap terlihat jika masih ada dalam list
    useEffect(() => {
        if (!activeId) return;
        const timer = setTimeout(() => {
            scrollToActiveSidebarItem('smooth');
        }, 120);
        return () => clearTimeout(timer);
    }, [filterTab, searchQuery, scrollToActiveSidebarItem]);

    // Saat daftar percakapan diisi atau diperbarui, pastikan item aktif langsung di-scroll ke posisi tampak
    useEffect(() => {
        if (!activeId || conversations.length === 0) return;
        const timer = setTimeout(() => {
            scrollToActiveSidebarItem('smooth');
        }, 120);
        return () => clearTimeout(timer);
    }, [conversations.length, activeId, scrollToActiveSidebarItem]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
                setHeaderMenuOpen(false);
            }
            if (roomMenuRef.current && !roomMenuRef.current.contains(e.target)) {
                setRoomMenuOpen(false);
            }
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setEmojiPickerOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scrollToBottom = (behavior = 'smooth') => {
        setRoomNewMessagesCount(0);
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior
            });
        } else if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
        }
        isAtBottomRef.current = true;
        if (scrollBtnRef.current) {
            scrollBtnRef.current.style.display = 'none';
        }
    };

    // Zero-lag scroll handler: absolutely NO setState inside onScroll
    const handleMessagesScroll = (e) => {
        const target = e.currentTarget;
        if (activeId && activeId !== 'lili_ai') {
            roomScrollPosRef.current.set(activeId, target.scrollTop);
        }
        const threshold = 80;
        const isNear = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;
        isAtBottomRef.current = isNear;
        if (isNear) {
            setRoomNewMessagesCount(0);
        }
        if (scrollBtnRef.current) {
            scrollBtnRef.current.style.display = isNear ? 'none' : 'flex';
        }
    };

    // Firebase Typing Whisper & Stop
    const whisperTyping = () => {
        if (!activeId || activeId === 'lili_ai' || !currentUser?.id || !window.FirebaseDB) return;
        const now = Date.now();
        if (now - lastWhisperTimeRef.current < 1500) return;
        lastWhisperTimeRef.current = now;

        try {
            const typingRef = window.FirebaseDB.ref(`conversations/${activeId}/typing/${currentUser.id}`);
            typingRef.set({
                name: currentUser.nama || currentUser.name || 'Pengguna',
                time: now
            });
            typingRef.onDisconnect().remove();
        } catch (err) {}
    };

    const stopTypingWhisper = () => {
        if (!activeId || activeId === 'lili_ai' || !currentUser?.id || !window.FirebaseDB) return;
        try {
            window.FirebaseDB.ref(`conversations/${activeId}/typing/${currentUser.id}`).remove();
        } catch (err) {}
    };

    const playNotificationSound = () => {
        // Notifikasi suara HANYA bunyi jika halaman window / tab browser TIDAK SEDANG AKTIF
        // Jika window aktif di depan mata pengguna, tidak ada bunyi (sesuai request)
        const isWindowActive = typeof document !== 'undefined' && !document.hidden && document.hasFocus();
        if (isWindowActive) {
            return;
        }

        const now = Date.now();
        if (now - (window._lastGlobalChatSoundTime || 0) < 1500) {
            return;
        }
        window._lastGlobalChatSoundTime = now;
        try {
            if (!audioChimeRef.current) {
                audioChimeRef.current = new Audio('/sound/notification.mp3');
            }
            audioChimeRef.current.currentTime = 0;
            audioChimeRef.current.play().catch(() => {});
        } catch {}
    };

    // Helper untuk menambahkan pesan baru secara ter-deduplikasi (mencegah pesan ganda di sisi sender)
    const appendMessageIfNew = (newMsg, targetConvId) => {
        if (!newMsg || !newMsg.id) return;
        const msgId = Number(newMsg.id);
        const convId = targetConvId || newMsg.conversation_id || activeIdRef.current;

        setMessages(prev => {
            if (prev.some(m => Number(m.id) === msgId)) {
                return prev;
            }
            const next = [...prev, newMsg];
            if (roomCacheRef.current.has(convId)) {
                const cached = roomCacheRef.current.get(convId);
                roomCacheRef.current.set(convId, { ...cached, messages: next });
            }
            return next;
        });
    };

    const playLiliVoice = () => {
        try {
            const voice = new Audio('/sound/lili-greeting.mp3');
            voice.play().catch(() => {});
        } catch {}
    };

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/chat/my-conversations');
            if (Array.isArray(res.data)) {
                const currentOpenId = activeIdRef.current;
                setConversations(res.data.map(conv => {
                    // Jika room sedang aktif dibuka oleh user atau sudah dibaca, unread badge harus selalu 0
                    if ((currentOpenId && conv.id === currentOpenId) || readRoomIdsRef.current.has(conv.id)) {
                        return { ...conv, unread: 0 };
                    }
                    return conv;
                }));
            }
        } catch (err) {
            console.error('Failed to fetch conversations', err);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchConversations, 12000);
        return () => clearInterval(interval);
    }, []);

    // =========================================================================
    // 3. ROOM CACHING & SCROLL POSITION RESTORATION (Request 3)
    // =========================================================================
    const loadRoom = async (convId) => {
        if (!convId || convId === 'lili_ai') return;
        setLoadingRoom(true);
        try {
            const res = await axios.get(`/chat/${convId}/messages`);
            setActiveRoomData(prev => ({
                ...prev,
                ...res.data,
                nama_pengirim: res.data.nama_pengirim || prev?.nama_pengirim,
                sender_role: res.data.sender_role || prev?.sender_role,
                sender_role_label: res.data.sender_role_label || prev?.sender_role_label
            }));
            const msgs = res.data.messages || [];
            msgs.forEach(m => {
                if (m.id) knownMessageIdsRef.current.add(Number(m.id));
            });
            setMessages(msgs);
            setRoomNewMessagesCount(0);
            if (scrollBtnRef.current) {
                scrollBtnRef.current.style.display = 'none';
            }
            roomCacheRef.current.set(convId, {
                roomData: {
                    ...res.data,
                    nama_pengirim: res.data.nama_pengirim || activeRoomData?.nama_pengirim,
                    sender_role: res.data.sender_role || activeRoomData?.sender_role,
                    sender_role_label: res.data.sender_role_label || activeRoomData?.sender_role_label
                },
                messages: msgs
            });
            setConversations(prev =>
                prev.map(c => (c.id === convId ? { ...c, unread: 0 } : c))
            );
            try {
                window.dispatchEvent(new CustomEvent('chat:read', { detail: { conversationId: convId } }));
            } catch {}
            setTimeout(() => scrollToBottom('auto'), 40);
        } catch (err) {
            console.error('Failed to load room messages', err);
        } finally {
            setLoadingRoom(false);
        }
    };

    const silentSyncRoom = async (convId) => {
        try {
            // Ambil id pesan terakhir yang ada di cache room saat ini
            const cached = roomCacheRef.current.get(convId);
            const currentMsgs = cached?.messages || messages;
            const lastMsgId = currentMsgs.length > 0 ? (Number(currentMsgs[currentMsgs.length - 1].id) || 0) : 0;

            // Gunakan endpoint incremental poll yang HANYA mengambil pesan baru (id > lastMsgId)
            // Sangat ringan, tidak me-load seluruh riwayat pesan dari awal
            const res = await axios.get(`/chat/${convId}/poll?last_message_id=${lastMsgId}`);
            if (res.data?.messages && res.data.messages.length > 0) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => Number(m.id)));
                    const brandNew = res.data.messages.filter(m => !existingIds.has(Number(m.id)));
                    if (brandNew.length > 0) {
                        brandNew.forEach(m => {
                            if (m.id) knownMessageIdsRef.current.add(Number(m.id));
                        });
                        const merged = [...prev, ...brandNew];
                        roomCacheRef.current.set(convId, {
                            roomData: { ...(cached?.roomData || activeRoomData), status: res.data.status || cached?.roomData?.status },
                            messages: merged
                        });
                        return merged;
                    }
                    return prev;
                });
            }
            if (res.data?.status && activeRoomData?.status !== res.data.status) {
                setActiveRoomData(prev => prev ? { ...prev, status: res.data.status } : null);
            }
        } catch (err) {}
    };

    const handleSelectConversation = (conv) => {
        if (selectionMode) {
            toggleSelectId(conv.id);
            return;
        }

        // Simpan posisi scroll dan cache room saat ini sebelum berpindah
        if (activeId && activeId !== 'lili_ai' && messagesContainerRef.current) {
            roomScrollPosRef.current.set(activeId, messagesContainerRef.current.scrollTop);
            roomCacheRef.current.set(activeId, {
                roomData: activeRoomData,
                messages: messages
            });
        }

        const nextId = conv.id;
        setActiveId(nextId);
        setRoomNewMessagesCount(0);
        readRoomIdsRef.current.add(nextId);
        if (scrollBtnRef.current) {
            scrollBtnRef.current.style.display = 'none';
        }

        // Tandai sudah dibaca di list
        setConversations(prev =>
            prev.map(c => (c.id === nextId ? { ...c, unread: 0 } : c))
        );
        axios.post(`/chat/${nextId}/mark-read`).catch(() => {});
        try {
            window.dispatchEvent(new CustomEvent('chat:read', { detail: { conversationId: nextId } }));
        } catch {}

        // JIKA ROOM SUDAH PERNAH DI-LOAD: GUNAKAN CACHE (0ms, SANGAT RINGAN, TIDAK LOAD ULANG)
        if (roomCacheRef.current.has(nextId)) {
            const cached = roomCacheRef.current.get(nextId);
            setActiveRoomData(cached.roomData || {
                ticket_number: conv.no_tiket,
                status: conv.status || 'open',
                layanan: conv.layanan,
                bidang: conv.bidang,
                sender_role: conv.sender_role,
                sender_role_label: conv.sender_role_label,
                nama_pengirim: conv.nama_pengirim,
            });
            (cached.messages || []).forEach(m => {
                if (m.id) knownMessageIdsRef.current.add(Number(m.id));
            });
            setMessages(cached.messages || []);
            setLoadingRoom(false);

            // KEMBALIKAN POSISI SCROLL SEBELUMNYA SECARA PRESISI
            const savedScroll = roomScrollPosRef.current.get(nextId);
            requestAnimationFrame(() => {
                if (messagesContainerRef.current && typeof savedScroll === 'number') {
                    messagesContainerRef.current.scrollTop = savedScroll;
                }
            });
            setTimeout(() => {
                if (messagesContainerRef.current && typeof savedScroll === 'number') {
                    messagesContainerRef.current.scrollTop = savedScroll;
                }
            }, 30);

            // Sinkronisasi inkremental pesan baru yang mungkin masuk saat di room lain (tanpa reload seluruh pesan)
            silentSyncRoom(nextId);
        } else {
            // Pertama kali dibuka: load dari server dan scroll ke bawah
            setActiveRoomData({
                ticket_number: conv.no_tiket,
                status: conv.status || 'open',
                layanan: conv.layanan,
                bidang: conv.bidang,
                sender_role: conv.sender_role,
                sender_role_label: conv.sender_role_label,
                nama_pengirim: conv.nama_pengirim,
                messages: []
            });
            loadRoom(nextId);
        }

        setTimeout(() => {
            scrollToActiveSidebarItem('smooth');
        }, 50);
    };

    const handleSelectLili = () => {
        if (selectionMode) return;
        if (activeId && activeId !== 'lili_ai' && messagesContainerRef.current) {
            roomScrollPosRef.current.set(activeId, messagesContainerRef.current.scrollTop);
            roomCacheRef.current.set(activeId, {
                roomData: activeRoomData,
                messages: messages
            });
        }
        setRoomNewMessagesCount(0);
        setActiveId('lili_ai');
        setActiveRoomData(null);
        if (!liliVoicePlayedRef.current) {
            playLiliVoice();
            liliVoicePlayedRef.current = true;
        }

        setTimeout(() => {
            scrollToActiveSidebarItem('smooth');
        }, 50);
    };

    // Auto-buka room jika diarahkan dari navbar atau URL query parameter (?room=... atau ?id=...)
    const lastOpenedTargetRef = useRef(null);
    useEffect(() => {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const targetRoomParam = initialActiveId || urlParams?.get('room') || urlParams?.get('id');
        if (!targetRoomParam) return;

        if (lastOpenedTargetRef.current === String(targetRoomParam)) return;

        const targetRoomId = isNaN(targetRoomParam) ? targetRoomParam : Number(targetRoomParam);
        if (targetRoomId === 'lili_ai') {
            lastOpenedTargetRef.current = 'lili_ai';
            handleSelectLili();
            return;
        }

        const found = conversations.find(c => String(c.id) === String(targetRoomId));
        if (found) {
            lastOpenedTargetRef.current = String(targetRoomId);
            handleSelectConversation(found);
        }
    }, [initialActiveId, conversations]);

    // =========================================================================
    // 4. FIREBASE REALTIME LIVE CHAT (Request 4)
    // =========================================================================
    const handleIncomingLiveMessage = (payload) => {
        const { messageData, conversationData } = payload;
        if (!conversationData?.id) return;

        const convId = conversationData.id;
        const currentActiveId = activeIdRef.current;
        const isCurrentActive = currentActiveId === convId;
        const isFromMe = Number(messageData?.sender_user_id) === Number(currentUser?.id);

        if (!isFromMe && !isCurrentActive) {
            // Ada pesan baru masuk untuk room yang tidak sedang aktif
            readRoomIdsRef.current.delete(convId);
        }

        setConversations(prev => {
            const existingIdx = prev.findIndex(c => c.id === convId);
            if (existingIdx !== -1) {
                const item = prev[existingIdx];
                const updated = {
                    ...item,
                    last_message: messageData?.message || item.last_message,
                    last_message_time: messageData?.created_at || new Date().toISOString(),
                    is_last_from_me: isFromMe,
                    // Jika room sedang aktif dibuka ATAU pesan ini dikirim oleh saya sendiri, unread harus 0
                    unread: isCurrentActive || isFromMe ? 0 : (item.unread || 0) + 1,
                    status: conversationData?.status || item.status,
                };
                const others = prev.filter(c => c.id !== convId);
                return [updated, ...others];
            } else {
                fetchConversations();
                return prev;
            }
        });

        if (isCurrentActive && messageData) {
            const msgId = Number(messageData.id);
            const isAlreadyKnown = knownMessageIdsRef.current.has(msgId);
            knownMessageIdsRef.current.add(msgId);

            appendMessageIfNew(messageData, convId);

            if (!isFromMe && !isAlreadyKnown) {
                playNotificationSound();
                axios.post(`/chat/${convId}/mark-read`).catch(() => {});
                if (!isAtBottomRef.current) {
                    setRoomNewMessagesCount(prev => prev + 1);
                    if (scrollBtnRef.current) {
                        scrollBtnRef.current.style.display = 'flex';
                    }
                }
            }

            if (isAtBottomRef.current) {
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                }, 40);
            }
        } else if (!isFromMe) {
            playNotificationSound();
        }
    };

    const handleIncomingRoomMessage = (payload) => {
        const { messageData } = payload;
        const currentActiveId = activeIdRef.current;
        if (!messageData || !currentActiveId || Number(messageData.conversation_id) !== Number(currentActiveId)) return;

        const msgId = Number(messageData.id);
        const isFromMe = Number(messageData?.sender_user_id) === Number(currentUser?.id);

        // Jika pesan ini sudah pernah tercatat (sudah di-load saat room dibuka),
        // ini adalah snapshot inisial Firebase, BUKAN pesan baru yang datang saat chatting!
        const isAlreadyKnown = knownMessageIdsRef.current.has(msgId);
        knownMessageIdsRef.current.add(msgId);

        appendMessageIfNew(messageData, currentActiveId);

        if (!isFromMe && !isAlreadyKnown) {
            playNotificationSound();
            axios.post(`/chat/${currentActiveId}/mark-read`).catch(() => {});
            if (!isAtBottomRef.current) {
                setRoomNewMessagesCount(prev => prev + 1);
                if (scrollBtnRef.current) {
                    scrollBtnRef.current.style.display = 'flex';
                }
            }
        }

        if (isAtBottomRef.current) {
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 40);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (window.firebase && !window.FirebaseDB && firebaseConfig?.databaseURL) {
            try {
                if (!window.firebase.apps?.length) {
                    window.firebase.initializeApp(firebaseConfig);
                }
                window.FirebaseDB = window.firebase.database();
            } catch (err) {
                console.warn('Firebase init error:', err);
            }
        }

        if (window.FirebaseDB && currentUser?.id) {
            const userEventRef = window.FirebaseDB.ref(`users/${currentUser.id}/last_event`);
            const mountTime = Date.now();
            let isFirstSnapshot = true;
            const onUserEvent = (snapshot) => {
                const data = snapshot.val();
                if (!data || !data.messageData) return;
                // Snapshot inisial Firebase selalu membawa event lama yang sudah ada di database saat page di-mount.
                // Abaikan snapshot pertama agar tidak me-replay pesan lama menjadi unread palsu.
                if (isFirstSnapshot) {
                    isFirstSnapshot = false;
                    return;
                }
                // Proteksi timestamp: hanya proses event yang benar-benar dikirim setelah komponen terpasang
                const eventTime = Number(data.sent_at || data.messageData?.timestamp || data.timestamp || 0);
                if (eventTime > 0 && eventTime < mountTime) {
                    return;
                }
                handleIncomingLiveMessage(data);
            };
            userEventRef.on('value', onUserEvent);

            return () => {
                userEventRef.off('value', onUserEvent);
            };
        }
    }, [currentUser?.id, firebaseConfig]);

    useEffect(() => {
        if (!activeId || activeId === 'lili_ai' || !window.FirebaseDB) return;

        const roomMsgRef = window.FirebaseDB.ref(`conversations/${activeId}/last_message`);
        const roomStatusRef = window.FirebaseDB.ref(`conversations/${activeId}/status`);
        const roomTypingRef = window.FirebaseDB.ref(`conversations/${activeId}/typing`);

        const onRoomMessage = (snapshot) => {
            const data = snapshot.val();
            if (!data || !data.messageData) return;
            handleIncomingRoomMessage(data);
        };

        const onRoomStatus = (snapshot) => {
            const data = snapshot.val();
            if (!data || !data.status) return;
            setActiveRoomData(prev => prev ? { ...prev, status: data.status } : prev);
            setConversations(prev => prev.map(c => c.id === activeId ? { ...c, status: data.status } : c));
        };

        const onRoomTyping = (snapshot) => {
            const typingUsers = snapshot.val();
            if (typingUsers) {
                const now = Date.now();
                let activeTypist = null;
                Object.keys(typingUsers).forEach((uid) => {
                    if (Number(uid) !== Number(currentUser?.id)) {
                        const userObj = typingUsers[uid];
                        if (userObj && (now - (userObj.time || 0) < 4000)) {
                            activeTypist = userObj.name || 'Pengguna';
                        }
                    }
                });
                if (activeTypist) {
                    setTypingUser(activeTypist);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        setTypingUser(null);
                    }, 3500);
                } else {
                    setTypingUser(null);
                }
            } else {
                setTypingUser(null);
            }
        };

        roomMsgRef.on('value', onRoomMessage);
        roomStatusRef.on('value', onRoomStatus);
        roomTypingRef.on('value', onRoomTyping);

        return () => {
            roomMsgRef.off('value', onRoomMessage);
            roomStatusRef.off('value', onRoomStatus);
            roomTypingRef.off('value', onRoomTyping);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setTypingUser(null);
            stopTypingWhisper();
        };
    }, [activeId, currentUser?.id]);

    // Auto-scroll when typing indicator appears and user is already at bottom
    useEffect(() => {
        if (typingUser && isAtBottomRef.current && messagesContainerRef.current) {
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 30);
        }
    }, [typingUser]);

    // Pre-calculate message date groups to avoid expensive re-evaluation during scroll
    const processedMessages = useMemo(() => {
        return messages.map((msg, idx) => {
            const isMe = Number(msg.sender_user_id) === Number(currentUser?.id);
            const dateGroup = getMessageDateGroup(msg.created_at);
            const prevDateGroup = idx > 0 ? getMessageDateGroup(messages[idx - 1].created_at) : null;
            const showDateSeparator = dateGroup && dateGroup !== prevDateGroup;
            return {
                ...msg,
                isMe,
                dateGroup,
                showDateSeparator
            };
        });
    }, [messages, currentUser?.id]);

    // Fallback polling jika Firebase offline atau tertunda (12 detik agar sangat ringan)
    useEffect(() => {
        if (!activeId || activeId === 'lili_ai') return;

        const interval = setInterval(async () => {
            const lastMsgId = messages.length > 0 ? messages[messages.length - 1].id : 0;
            try {
                const res = await axios.get(`/chat/${activeId}/poll?last_message_id=${lastMsgId}`);
                if (res.data?.messages?.length > 0) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => Number(m.id)));
                        const brandNew = res.data.messages.filter(m => !existingIds.has(Number(m.id)));
                        if (brandNew.length > 0) {
                            const incomingMsgs = brandNew.filter(m => Number(m.sender_user_id) !== Number(currentUser?.id));
                            if (incomingMsgs.length > 0) {
                                playNotificationSound();
                                axios.post(`/chat/${activeId}/mark-read`).catch(() => {});
                                if (!isAtBottomRef.current) {
                                    setRoomNewMessagesCount(prev => prev + incomingMsgs.length);
                                    if (scrollBtnRef.current) {
                                        scrollBtnRef.current.style.display = 'flex';
                                    }
                                }
                            }
                            const next = [...prev, ...brandNew];
                            if (roomCacheRef.current.has(activeId)) {
                                const cached = roomCacheRef.current.get(activeId);
                                roomCacheRef.current.set(activeId, { ...cached, messages: next });
                            }
                            return next;
                        }
                        return prev;
                    });
                    if (isAtBottomRef.current) {
                        setTimeout(() => {
                            if (messagesContainerRef.current) {
                                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                            }
                        }, 40);
                    }
                }
                if (res.data?.status && activeRoomData?.status !== res.data.status) {
                    setActiveRoomData(prev => prev ? { ...prev, status: res.data.status } : null);
                }
            } catch (err) {}
        }, 12000);

        return () => clearInterval(interval);
    }, [activeId, messages.length, currentUser?.id, activeRoomData?.status]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const text = inputText.trim();
        if (!text || sending || !activeId) return;

        if (activeId === 'lili_ai') {
            sendLiliMessage(text);
            return;
        }

        setSending(true);
        setInputText('');
        stopTypingWhisper();

        // Instan scroll saat enter
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }

        try {
            const res = await axios.post(`/chat/${activeId}/message`, { message: text });
            if (res.data?.success && res.data?.message) {
                const newMsg = {
                    id: res.data.message.id,
                    message: res.data.message.message,
                    sender_user_id: currentUser?.id,
                    sender_name: currentUser?.nama || 'Saya',
                    created_at: res.data.message.created_at || new Date().toISOString()
                };
                knownMessageIdsRef.current.add(Number(newMsg.id));
                // Menggunakan helper deduplikasi sehingga pesan tidak akan pernah tampil ganda
                appendMessageIfNew(newMsg, activeId);
                setConversations(prev => prev.map(c => {
                    if (c.id === activeId) {
                        return {
                            ...c,
                            last_message: text,
                            last_message_time: new Date().toISOString(),
                            is_last_from_me: true,
                            unread: 0
                        };
                    }
                    return c;
                }));

                // Seketika scroll ke posisi paling bawah
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
                scrollToBottom('auto');
                setTimeout(() => scrollToBottom('smooth'), 40);
            }
        } catch (err) {
            console.error('Failed to send message', err);
        } finally {
            setSending(false);
            if (textareaRef.current) textareaRef.current.focus();
        }
    };

    const sendLiliMessage = async (customPrompt) => {
        const query = (customPrompt || inputText).trim();
        if (!query || liliLoading) return;

        const userMsg = {
            id: 'u_' + Date.now(),
            role: 'user',
            content: query,
            created_at: new Date().toISOString()
        };

        const nextMessages = [...liliMessages, userMsg];
        setLiliMessages(nextMessages);
        setInputText('');
        setLiliLoading(true);

        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 20);

        const historyPayload = nextMessages
            .filter(m => m.id !== 'lili_welcome')
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await axios.post('/guest-bot/tanya-ai', {
                pertanyaan: query,
                history: historyPayload
            });

            const replyContent = res.data?.reply || res.data?.jawaban || res.data?.answer || res.data?.message || 'Maaf, LILI tidak dapat memproses jawaban saat ini. Silakan coba kembali beberapa saat lagi.';
            const actions = res.data?.actions || [];

            setLiliMessages(prev => [
                ...prev,
                {
                    id: 'ai_' + Date.now(),
                    role: 'assistant',
                    content: replyContent,
                    actions: actions,
                    created_at: new Date().toISOString(),
                    feedback: null
                }
            ]);

            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 40);
        } catch (err) {
            console.error('LILI error', err);
            const errorMsg = err.response?.data?.reply || err.response?.data?.message || 'Maaf, terjadi kendala saat menghubungi server asisten virtual. Mohon periksa koneksi Anda dan coba kembali.';
            setLiliMessages(prev => [
                ...prev,
                {
                    id: 'ai_' + Date.now(),
                    role: 'assistant',
                    content: errorMsg,
                    created_at: new Date().toISOString(),
                    feedback: null
                }
            ]);
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 40);
        } finally {
            setLiliLoading(false);
            if (textareaRef.current) textareaRef.current.focus();
        }
    };

    const handleLiliFeedback = async (msgId, type) => {
        const targetMsg = liliMessages.find(m => m.id === msgId);
        if (!targetMsg) return;

        setLiliMessages(prev =>
            prev.map(m => (m.id === msgId ? { ...m, feedback: type } : m))
        );

        try {
            await axios.post('/guest-bot/feedback-ai', {
                pertanyaan: 'Feedback dari pengguna',
                jawaban: targetMsg.content,
                feedback: type
            });
        } catch (err) {}
    };

    const handleCopyText = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedMsgId(id);
        setTimeout(() => setCopiedMsgId(null), 2000);
    };

    const handleResetLiliChat = () => {
        setLiliMessages([
            {
                id: 'lili_welcome_' + Date.now(),
                role: 'assistant',
                content: `Halo ${currentUser?.nama ? currentUser.nama.split(',')[0] : 'Bapak/Ibu'}! Sesi konsultasi telah diperbarui. Ada pertanyaan lain seputar kepegawaian yang bisa saya bantu? 😊`,
                created_at: new Date().toISOString(),
                feedback: null
            }
        ]);
        liliVoicePlayedRef.current = false;
        setRoomMenuOpen(false);
    };

    const handleToggleChatStatus = async () => {
        if (!activeId || activeId === 'lili_ai') return;
        const isClosed = activeRoomData?.status === 'closed';
        const endpoint = isClosed ? `/chat/${activeId}/reopen` : `/chat/${activeId}/close`;

        try {
            const res = await axios.post(endpoint);
            if (res.data?.success) {
                const newStatus = res.data.status;
                setActiveRoomData(prev => prev ? { ...prev, status: newStatus } : null);
                setConversations(prev =>
                    prev.map(c => (c.id === activeId ? { ...c, status: newStatus } : c))
                );
            }
        } catch (err) {
            console.error('Failed to change chat status', err);
        } finally {
            setRoomMenuOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post('/chat/mark-all-read');
            setConversations(prev => prev.map(c => ({ ...c, unread: 0 })));
        } catch (err) {
            console.error('Failed to mark all read', err);
        } finally {
            setHeaderMenuOpen(false);
        }
    };

    const toggleSelectId = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(filteredConversations.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Hapus ${selectedIds.length} percakapan dari daftar Anda?`)) return;

        try {
            const res = await axios.post('/chat/delete-conversations', {
                conversation_ids: selectedIds
            });
            if (res.data?.success) {
                setConversations(prev => prev.filter(c => !selectedIds.includes(c.id)));
                if (selectedIds.includes(activeId)) {
                    setActiveId(null);
                    setActiveRoomData(null);
                    setMessages([]);
                }
                setSelectionMode(false);
                setSelectedIds([]);
            }
        } catch (err) {
            alert('Gagal menghapus percakapan: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSearchTicketSubmit = async (e) => {
        e.preventDefault();
        const query = ticketSearchInput.trim();
        if (!query) return;

        setTicketSearching(true);
        setTicketSearchError('');
        setTicketSearchResult(null);

        try {
            const res = await axios.post('/chat/search-ticket', { no_tiket: query });
            if (res.data?.success && res.data?.tiket) {
                setTicketSearchResult(res.data.tiket);
            } else {
                setTicketSearchError(res.data?.message || 'Nomor tiket tidak ditemukan.');
            }
        } catch (err) {
            setTicketSearchError(err.response?.data?.message || 'Terjadi kesalahan saat mencari tiket.');
        } finally {
            setTicketSearching(false);
        }
    };

    const handleStartTicketChat = async () => {
        if (!ticketSearchResult?.no_tiket || startingTicketChat) return;

        setStartingTicketChat(true);
        try {
            const res = await axios.post('/chat/start-ticket', {
                no_tiket: ticketSearchResult.no_tiket
            });
            if (res.data?.conversation_id) {
                setSearchModalOpen(false);
                setTicketSearchInput('');
                setTicketSearchResult(null);
                await fetchConversations();
                setActiveId(res.data.conversation_id);
                loadRoom(res.data.conversation_id);
            }
        } catch (err) {
            alert('Gagal memulai percakapan tiket: ' + (err.response?.data?.message || err.message));
        } finally {
            setStartingTicketChat(false);
        }
    };

    const totalUnreadConversationsCount = useMemo(() => {
        return conversations.filter(c => Number(c.unread) > 0).length;
    }, [conversations]);

    const filteredConversations = useMemo(() => {
        let list = conversations;
        if (filterTab === 'unread') {
            list = list.filter(c => Number(c.unread) > 0);
        }
        const q = searchQuery.toLowerCase().trim();
        if (!q) return list;
        return list.filter(c => {
            const noTiket = (c.no_tiket || '').toLowerCase();
            const sender = (c.nama_pengirim || '').toLowerCase();
            const layanan = (c.layanan || '').toLowerCase();
            const msg = (c.last_message || '').toLowerCase();
            return noTiket.includes(q) || sender.includes(q) || layanan.includes(q) || msg.includes(q);
        });
    }, [conversations, searchQuery, filterTab]);

    const showLiliInList = useMemo(() => {
        if (filterTab === 'unread') return false;
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return 'lili'.includes(q) || 'ai'.includes(q) || 'asisten'.includes(q) || 'virtual'.includes(q);
    }, [searchQuery, filterTab]);


    return (
        <AuthenticatedLayout fullHeight={true} noPadding={true}>
            <Head title="PILKB - Pusat Komunikasi & Bantuan" />

            {/* FULL-VIEWPORT WRAPPER (NO PAGE SCROLL, EXACTLY LIKE WHATSAPP WINDOWS) */}
            <div className="flex-1 min-h-0 flex flex-col p-0 md:p-3 lg:p-4 bg-slate-50/80 dark:bg-slate-950 overflow-hidden h-full">
                
                {/* DUAL-PANEL CHAT CONTAINER (FLEX-1 TAKES 100% HEIGHT, ZERO OVERFLOW) */}
                <div className="flex-1 min-h-0 rounded-none md:rounded-3xl bg-white dark:bg-slate-900 border-0 md:border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-row">
                    
                    {/* --------------------------------------------------------------------- */}
                    {/* PANEL 1: DAFTAR PERCAKAPAN (SIDEBAR WA WINDOWS)                       */}
                    {/* --------------------------------------------------------------------- */}
                    <div className={`w-full md:w-80 lg:w-96 shrink-0 flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${
                        activeId ? 'hidden md:flex' : 'flex'
                    }`}>
                            {/* Header Sidebar: User Profile (PINNED AT TOP, DOES NOT SCROLL) */}
                            <div className="h-16 px-3.5 sm:px-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                        {getInitials(currentUser?.nama || 'Pengguna', 'SM')}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate leading-tight">
                                            {currentUser?.nama ? currentUser.nama.split(',')[0] : 'Pengguna'}
                                        </div>
                                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate leading-tight mt-0.5">
                                            {userRoleLabel}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {isOpd && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchModalOpen(true)}
                                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Cari Nomor Tiket"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                        </button>
                                    )}

                                    <div className="relative" ref={headerMenuRef}>
                                        <button
                                            type="button"
                                            onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title="Menu Opsi"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {headerMenuOpen && (
                                            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg py-1.5 z-50 text-xs font-semibold">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectionMode(true);
                                                        setSelectedIds([]);
                                                        setHeaderMenuOpen(false);
                                                    }}
                                                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                                >
                                                    <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Pilih Pesan</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleMarkAllRead}
                                                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                                >
                                                    <Check className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>Baca Semua</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar Section (PINNED, DOES NOT SCROLL) */}
                            <div className="p-2.5 sm:p-3 pb-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
                                <div className="relative flex items-center">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari tiket, layanan, nama, pesan..."
                                        className="w-full pl-10 pr-8 py-2 bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* WhatsApp Windows Style Filter Chips */}
                                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('all')}
                                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
                                            filterTab === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('unread')}
                                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                                            filterTab === 'unread'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <span>Belum Dibaca</span>
                                        {totalUnreadConversationsCount > 0 && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                                filterTab === 'unread'
                                                    ? 'bg-white text-blue-600'
                                                    : 'bg-blue-600 text-white'
                                            }`}>
                                                {totalUnreadConversationsCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {selectionMode && (
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="selectAllCheck"
                                                checked={
                                                    filteredConversations.length > 0 &&
                                                    selectedIds.length === filteredConversations.length
                                                }
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <label htmlFor="selectAllCheck" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer text-xs">
                                                Semua
                                            </label>
                                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 ml-1">
                                                {selectedIds.length} Dipilih
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={selectedIds.length === 0}
                                                onClick={handleDeleteSelected}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 text-[11px] font-semibold disabled:opacity-40 hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Hapus</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectionMode(false);
                                                    setSelectedIds([]);
                                                }}
                                                className="px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Conversation List (ONLY THIS AREA SCROLLS IN PANEL 1) */}
                            <div
                                ref={sidebarListRef}
                                onScroll={(e) => {
                                    sidebarScrollPosRef.current = e.currentTarget.scrollTop;
                                }}
                                className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 overscroll-contain"
                            >
                                {/* 1. PINNED LILI AI CARD */}
                                {showLiliInList && (
                                    <div
                                        id="sidebar-item-lili_ai"
                                        onClick={handleSelectLili}
                                        className={`p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative flex items-start gap-2.5 sm:gap-3 ${
                                            activeId === 'lili_ai'
                                                ? 'bg-indigo-50/80 dark:bg-indigo-950/50'
                                                : ''
                                        }`}
                                    >
                                        {activeId === 'lili_ai' && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r pointer-events-none" />
                                        )}
                                        <div className="relative shrink-0 mt-0.5">
                                            <img
                                                src="/images/lili-avatar.png"
                                                alt="LILI"
                                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-indigo-400/80 shadow-2xs"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div
                                                style={{ display: 'none' }}
                                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white font-bold text-xs items-center justify-center border-2 border-indigo-300"
                                            >
                                                LI
                                            </div>
                                            <span
                                                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center"
                                                title="Terverifikasi & Online"
                                            >
                                                <Check className="w-2 h-2 text-white stroke-[3]" />
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                                                    <Zap className="w-2.5 h-2.5 text-indigo-600" />
                                                    <span>ASISTEN VIRTUAL</span>
                                                </span>
                                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    • Online
                                                </span>
                                            </div>
                                            <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs mt-1 truncate">
                                                LILI - Asisten Virtual Kepegawaian
                                            </h5>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                Konsultasi regulasi ASN & panduan layanan kepega...
                                            </p>
                                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block">
                                                Klik untuk mulai konsultasi bersama LILI →
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 2. TICKET CONVERSATIONS */}
                                {filteredConversations.length > 0 ? (
                                    filteredConversations.map((conv) => {
                                        const isSelected = selectedIds.includes(conv.id);
                                        const isActive = activeId === conv.id;

                                        return (
                                            <div
                                                key={conv.id}
                                                id={`sidebar-item-${conv.id}`}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={`p-2.5 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative flex items-start gap-2.5 sm:gap-3 ${
                                                    isActive
                                                        ? 'bg-blue-50/80 dark:bg-blue-950/50'
                                                        : ''
                                                }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r pointer-events-none" />
                                                )}
                                                {selectionMode && (
                                                    <div className="pt-2 shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelectId(conv.id)}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                                        />
                                                    </div>
                                                )}

                                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                                    {getInitials(conv.nama_pengirim || 'Pengguna', 'KP')}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <RoleBadge
                                                                role={conv.sender_role}
                                                                label={conv.sender_role_label}
                                                            />
                                                            {conv.no_tiket && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                                                                    <Tag className="w-2.5 h-2.5" />
                                                                    <span>{conv.no_tiket}</span>
                                                                </span>
                                                            )}
                                                            {conv.status === 'closed' && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                                                                    Closed
                                                                </span>
                                                            )}
                                                        </div>

                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-normal">
                                                            {formatMsgTime(conv.last_message_time)}
                                                        </span>
                                                    </div>

                                                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs mt-1 truncate">
                                                        {formatCleanName(conv.nama_pengirim) || 'Pengguna'}
                                                    </h5>

                                                    {conv.layanan && (
                                                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase truncate mt-0.5">
                                                            {conv.layanan}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between gap-2 mt-0.5">
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1">
                                                            {conv.last_message || 'Belum ada pesan'}
                                                        </p>

                                                        {conv.unread > 0 && (
                                                            <span className="min-w-[18px] h-[18px] px-1 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
                                                                {conv.unread}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-center">
                                        <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {searchQuery ? 'Tidak ada percakapan yang cocok' : 'Belum ada percakapan tiket'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {searchQuery ? 'Coba gunakan kata kunci lain' : 'Mulai chat tiket baru untuk berkonsultasi'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    {/* --------------------------------------------------------------------- */}
                    {/* PANEL 2: RUANG PERCAKAPAN (MAIN PANEL WA WINDOWS)                     */}
                    {/* --------------------------------------------------------------------- */}
                    <div className={`flex-1 min-w-0 flex-col h-full bg-slate-50/50 dark:bg-slate-950/30 overflow-hidden ${
                        !activeId ? 'hidden md:flex' : 'flex'
                    }`}>
                            {/* KONDISI 1: EMPTY STATE (WHATSAPP WINDOWS AESTHETIC) */}
                            {!activeId && (
                                <div className="h-full flex flex-col items-center justify-between p-6 sm:p-10 text-center select-none bg-slate-50/50 dark:bg-slate-950/40">
                                    <div /> {/* Top spacer for vertical balance */}

                                    <div className="flex flex-col items-center max-w-md mx-auto">
                                        {/* WhatsApp Windows-inspired Hero Icon */}
                                        <div className="mb-5">
                                            <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                                                <MessageSquare className="w-10 sm:w-12 h-10 sm:h-12 stroke-[1.5]" />
                                            </div>
                                        </div>

                                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                                            Pusat Komunikasi & Bantuan PILKB
                                        </h3>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                            Pilih salah satu percakapan di sebelah kiri untuk melihat pesan, atau mulai percakapan baru dengan memasukkan nomor tiket layanan kepegawaian Anda.
                                        </p>

                                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={handleSelectLili}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span>Tanya LILI Asisten</span>
                                            </button>

                                            {isOpd && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchModalOpen(true)}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                                                >
                                                    <Search className="w-4 h-4 text-slate-400" />
                                                    <span>Cari Nomor Tiket</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* WhatsApp Windows Security / Encryption Indicator */}
                                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium pb-2">
                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Terkoneksi aman dengan server resmi BKPSDM Kabupaten Buleleng</span>
                                    </div>
                                </div>
                            )}

                            {/* KONDISI 2: ACTIVE ROOM - LILI AI */}
                            {activeId === 'lili_ai' && (
                                <div className="h-full flex flex-col min-h-0 bg-white dark:bg-slate-900">
                                    {/* Header (PINNED AT TOP, DOES NOT SCROLL) */}
                                    <div className="h-16 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 shadow-2xs">
                                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 flex-1">
                                            <button
                                                type="button"
                                                onClick={() => setActiveId(null)}
                                                className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                                title="Kembali ke daftar"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>

                                            <div className="relative shrink-0">
                                                <img
                                                    src="/images/lili-avatar.png"
                                                    alt="LILI"
                                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-indigo-400"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div
                                                    style={{ display: 'none' }}
                                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-600 text-white font-bold text-xs items-center justify-center border-2 border-indigo-300"
                                                >
                                                    LI
                                                </div>
                                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                                            </div>

                                            <div className="overflow-hidden min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                                                        LILI - Asisten Virtual
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={playLiliVoice}
                                                        className="p-1 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer shrink-0"
                                                        title="Putar Ulang Suara Sapaan LILI"
                                                    >
                                                        <Volume2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                                    Layanan Informasi & Literasi Kepegawaian Interaktif
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={handleResetLiliChat}
                                                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                                                title="Mulai Percakapan Baru dengan LILI"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="hidden sm:inline">Mulai Baru</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages Stream (ONLY THIS AREA SCROLLS IN PANEL 2) */}
                                    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50/60 dark:bg-slate-950/40 overscroll-contain">
                                        {liliMessages.map((msg) => {
                                            const isUser = msg.role === 'user';
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex items-start gap-2.5 ${
                                                        isUser ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    {!isUser && (
                                                        <img
                                                            src="/images/lili-avatar.png"
                                                            alt="LILI"
                                                            className="w-7 h-7 rounded-full object-cover border border-indigo-400 shrink-0 mt-1"
                                                        />
                                                    )}

                                                    <div
                                                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-2xs text-xs ${
                                                            isUser
                                                                ? 'bg-blue-600 text-white rounded-tr-xs'
                                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                                                        }`}
                                                    >
                                                        {!isUser && (
                                                            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] flex items-center gap-1">
                                                                    <Sparkles className="w-3 h-3" />
                                                                    <span>LILI Asisten Virtual</span>
                                                                </span>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCopyText(msg.id, msg.content)}
                                                                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                                        title="Salin Pesan"
                                                                    >
                                                                        {copiedMsgId === msg.id ? (
                                                                            <Check className="w-3 h-3 text-emerald-500" />
                                                                        ) : (
                                                                            <Copy className="w-3 h-3" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleLiliFeedback(msg.id, 'helpful')}
                                                                        className={`p-1 rounded transition-colors ${
                                                                            msg.feedback === 'helpful'
                                                                                ? 'text-blue-600 bg-blue-50'
                                                                                : 'text-slate-400 hover:text-blue-600'
                                                                        }`}
                                                                        title="Bermanfaat"
                                                                    >
                                                                        <ThumbsUp className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleLiliFeedback(msg.id, 'not_helpful')}
                                                                        className={`p-1 rounded transition-colors ${
                                                                            msg.feedback === 'not_helpful'
                                                                                ? 'text-rose-600 bg-rose-50'
                                                                                : 'text-slate-400 hover:text-rose-600'
                                                                        }`}
                                                                        title="Kurang Bermanfaat"
                                                                    >
                                                                        <ThumbsDown className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <FormattedLiliText text={msg.content} />

                                                        {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                                                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                                                                {msg.actions.map((act, aIdx) => {
                                                                    if (act.type === 'pdf') {
                                                                        return (
                                                                            <a
                                                                                key={aIdx}
                                                                                href={act.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                download
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                                            >
                                                                                <FileDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                                                                <span>{act.label || 'Unduh Format Syarat (PDF)'}</span>
                                                                            </a>
                                                                        );
                                                                    }
                                                                    if (act.type === 'admin') {
                                                                        return (
                                                                            <button
                                                                                key={aIdx}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (isOpd) {
                                                                                        setSearchModalOpen(true);
                                                                                    } else {
                                                                                        sendLiliMessage(`Saya ingin berkonsultasi mengenai ${act.bidang_nama || 'layanan ini'}`);
                                                                                    }
                                                                                }}
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                                                            >
                                                                                <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                                                <span>{act.label || 'Konsultasi ke Bidang'}</span>
                                                                            </button>
                                                                        );
                                                                    }
                                                                    if (act.type === 'ticket') {
                                                                        return (
                                                                            <a
                                                                                key={aIdx}
                                                                                href={act.url}
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                                            >
                                                                                <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                                                                <span>{act.label || 'Buka Rincian Tiket'}</span>
                                                                            </a>
                                                                        );
                                                                    }
                                                                    if (act.type === 'prompt' && act.prompt) {
                                                                        return (
                                                                            <button
                                                                                key={aIdx}
                                                                                type="button"
                                                                                onClick={() => sendLiliMessage(act.prompt)}
                                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-left"
                                                                            >
                                                                                <span>{act.label || act.prompt}</span>
                                                                            </button>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })}
                                                            </div>
                                                        )}

                                                        {msg.id.startsWith('lili_welcome') && (
                                                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                                                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                                                                    Rekomendasi topik konsultasi:
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {LILI_SUGGESTIONS.map((item, sIdx) => (
                                                                        <button
                                                                            key={sIdx}
                                                                            type="button"
                                                                            onClick={() => sendLiliMessage(item)}
                                                                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-medium transition-colors border border-slate-200/80 dark:border-slate-700/80 text-left cursor-pointer"
                                                                        >
                                                                            {item}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className={`text-[10px] mt-1.5 text-right ${
                                                                isUser ? 'text-blue-200' : 'text-slate-400'
                                                            }`}
                                                        >
                                                            {formatMsgTime(msg.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {liliLoading && (
                                            <div className="flex items-start gap-2.5">
                                                <img
                                                    src="/images/lili-avatar.png"
                                                    alt="LILI"
                                                    className="w-7 h-7 rounded-full object-cover border border-indigo-400 shrink-0 mt-1"
                                                />
                                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                                                    <span>LILI sedang menganalisis regulasi & menyiapkan jawaban...</span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Footer (PINNED AT BOTTOM, DOES NOT SCROLL) */}
                                    <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2 shrink-0">
                                        <div className="flex-1 relative flex items-center">
                                            <textarea
                                                ref={textareaRef}
                                                rows={1}
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Tanyakan regulasi, syarat layanan, atau panduan kepegawaian..."
                                                className="w-full px-3.5 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            disabled={!inputText.trim() || liliLoading}
                                            onClick={() => handleSendMessage()}
                                            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold transition-colors shadow-2xs cursor-pointer shrink-0"
                                            title="Kirim Pertanyaan ke LILI"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* KONDISI 3: ACTIVE ROOM - TIKET PERCAKAPAN */}
                            {activeId && activeId !== 'lili_ai' && (
                                <div className="h-full flex flex-col min-h-0 bg-white dark:bg-slate-900 relative">
                                    {/* Header (PINNED AT TOP, DOES NOT SCROLL) */}
                                    <div className="h-16 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 shadow-2xs">
                                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 flex-1">
                                            <button
                                                type="button"
                                                onClick={() => setActiveId(null)}
                                                className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                                title="Kembali ke daftar"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>

                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                                {getInitials(
                                                    activeRoomData?.nama_pengirim || 'Pengguna',
                                                    'KP'
                                                )}
                                            </div>

                                            <div className="overflow-hidden min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                                                        {formatCleanName(activeRoomData?.nama_pengirim) || 'Memuat...'}
                                                    </span>
                                                    {activeRoomData?.sender_role && (
                                                        <RoleBadge
                                                            role={activeRoomData.sender_role}
                                                            label={activeRoomData.sender_role_label}
                                                        />
                                                    )}
                                                    {activeRoomData?.ticket_number && (
                                                        <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-[10px] font-semibold text-blue-700 dark:text-blue-300 shrink-0">
                                                            <Tag className="w-2.5 h-2.5" />
                                                            <span>{activeRoomData.ticket_number}</span>
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                                            activeRoomData?.status === 'closed'
                                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                                        }`}
                                                    >
                                                        {activeRoomData?.status === 'closed' ? 'Closed' : 'Open'}
                                                    </span>
                                                </div>

                                                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 min-h-[16px]">
                                                    {typingUser ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span>{typingUser} sedang mengetik...</span>
                                                        </span>
                                                    ) : (
                                                        activeRoomData?.layanan
                                                            ? `${activeRoomData?.ticket_number ? '#' + activeRoomData.ticket_number + ' • ' : ''}${activeRoomData.layanan}`
                                                            : (activeRoomData?.bidang || (activeRoomData?.ticket_number ? '#' + activeRoomData.ticket_number : 'Pusat Bantuan PILKB'))
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative" ref={roomMenuRef}>
                                            <button
                                                type="button"
                                                onClick={() => setRoomMenuOpen(!roomMenuOpen)}
                                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                title="Menu opsi obrolan"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {roomMenuOpen && (
                                                <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg py-1.5 z-50 text-xs font-semibold">
                                                    {activeRoomData?.status === 'closed' ? (
                                                        <button
                                                            type="button"
                                                            onClick={handleToggleChatStatus}
                                                            className="w-full px-3.5 py-2 text-left text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            <span>Buka Chat</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleToggleChatStatus}
                                                            className="w-full px-3.5 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Lock className="w-3.5 h-3.5" />
                                                            <span>Tutup Chat</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Messages Stream (ONLY THIS AREA SCROLLS IN PANEL 2) */}
                                    <div
                                        ref={messagesContainerRef}
                                        onScroll={handleMessagesScroll}
                                        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-3 bg-[#efeae2]/20 dark:bg-slate-950 overscroll-contain"
                                    >
                                        {loadingRoom ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                                                <span className="text-xs">Memuat percakapan...</span>
                                            </div>
                                        ) : processedMessages.length > 0 ? (
                                            processedMessages.map((msg, idx) => {
                                                return (
                                                    <React.Fragment key={msg.id || idx}>
                                                        {msg.showDateSeparator && (
                                                            <div className="flex justify-center my-2.5 select-none">
                                                                <span className="px-3 py-1 rounded-lg bg-white/95 dark:bg-slate-800/95 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
                                                                    {msg.dateGroup}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div
                                                            className={`flex flex-col ${
                                                                msg.isMe ? 'items-end' : 'items-start'
                                                            }`}
                                                        >
                                                            {!msg.isMe && (
                                                                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 ml-1 select-none">
                                                                    {formatCleanName(msg.sender_name) || 'Pengguna'}
                                                                </span>
                                                            )}
                                                            <div
                                                                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 sm:p-3 shadow-2xs text-xs ${
                                                                    msg.isMe
                                                                        ? 'bg-blue-600 text-white rounded-tr-xs'
                                                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                                                                }`}
                                                            >
                                                                <p className="whitespace-pre-wrap break-words leading-relaxed">
                                                                    {msg.message}
                                                                </p>

                                                                <div
                                                                    className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                                                                        msg.isMe ? 'text-blue-200' : 'text-slate-400'
                                                                    }`}
                                                                >
                                                                    <span>{formatMsgTime(msg.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                    Belum ada pesan di percakapan ini
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Tulis pesan pertama Anda pada kotak di bawah
                                                </p>
                                            </div>
                                        )}

                                        {/* Typing Indicator Bubble in Stream */}
                                        {typingUser && (
                                            <div className="flex items-start gap-2 justify-start py-0.5">
                                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-2xs flex items-center gap-2 text-xs">
                                                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                                        {typingUser}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                        sedang mengetik
                                                    </span>
                                                    <div className="flex items-center gap-1 ml-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Floating WhatsApp Scroll-to-Bottom Button (Placed outside scroll container for 60fps performance) */}
                                    <button
                                        ref={scrollBtnRef}
                                        type="button"
                                        onClick={() => scrollToBottom('smooth')}
                                        style={{ display: 'none' }}
                                        className="absolute bottom-20 right-5 z-30 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                                        title="Scroll ke Pesan Terbaru"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                        {roomNewMessagesCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-800 pointer-events-none">
                                                {roomNewMessagesCount > 99 ? '99+' : roomNewMessagesCount}
                                            </span>
                                        )}
                                    </button>

                                    {activeRoomData?.status === 'closed' && (
                                        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 shrink-0">
                                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Percakapan ini telah ditutup</span>
                                        </div>
                                    )}

                                    {/* Input Footer (PINNED AT BOTTOM, DOES NOT SCROLL) */}
                                    {activeRoomData?.status !== 'closed' && (
                                        <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2 relative shrink-0">
                                            <div className="flex-1 relative flex items-center">
                                                <textarea
                                                    ref={textareaRef}
                                                    rows={1}
                                                    value={inputText}
                                                    onChange={(e) => {
                                                        setInputText(e.target.value);
                                                        if (e.target.value.trim().length > 0) {
                                                            whisperTyping();
                                                        } else {
                                                            stopTypingWhisper();
                                                        }
                                                    }}
                                                    onBlur={stopTypingWhisper}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Tulis pesan..."
                                                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                                                />
                                                <div className="absolute right-2.5 flex items-center">
                                                    {emojiPickerOpen && (
                                                        <div
                                                            ref={emojiPickerRef}
                                                            className="absolute bottom-full right-0 mb-3 w-64 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50"
                                                        >
                                                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                <span>Pilih Emoji</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEmojiPickerOpen(false)}
                                                                    className="text-slate-400 hover:text-slate-600 p-0.5"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-7 gap-1 text-base">
                                                                {EMOJIS.map((emoji, eIdx) => (
                                                                    <button
                                                                        key={eIdx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setInputText(prev => prev + emoji);
                                                                            setEmojiPickerOpen(false);
                                                                        }}
                                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-center transition-colors"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                                        title="Pilih Emoji"
                                                    >
                                                        <Smile className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={!inputText.trim() || sending}
                                                onClick={handleSendMessage}
                                                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold transition-colors shadow-2xs cursor-pointer shrink-0"
                                                title="Kirim Pesan"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            {/* ========================================================================= */}
            {/* MODAL CARI TIKET PERCAKAPAN BARU (ADMIN OPD ONLY)                         */}
            {/* ========================================================================= */}
            {searchModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                                    <Search className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                        Cari & Buka Obrolan Tiket
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Masukkan nomor tiket layanan kepegawaian Anda
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchModalOpen(false);
                                    setTicketSearchInput('');
                                    setTicketSearchResult(null);
                                    setTicketSearchError('');
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSearchTicketSubmit} className="mt-4">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={ticketSearchInput}
                                    onChange={(e) => setTicketSearchInput(e.target.value)}
                                    placeholder="Contoh: 070926P9TK"
                                    className="w-full pl-10 pr-20 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-blue-500 rounded-xl text-xs font-mono uppercase text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!ticketSearchInput.trim() || ticketSearching}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                                >
                                    {ticketSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
                                </button>
                            </div>
                        </form>

                        {ticketSearchError && (
                            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{ticketSearchError}</span>
                            </div>
                        )}

                        {ticketSearchResult && (
                            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                                        {ticketSearchResult.no_tiket}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                                        {ticketSearchResult.status}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 space-y-1">
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Layanan: <strong className="text-slate-800 dark:text-slate-200">{ticketSearchResult.layanan}</strong>
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Bidang: <strong className="text-slate-800 dark:text-slate-200">{ticketSearchResult.bidang}</strong>
                                    </p>
                                    {ticketSearchResult.nip && (
                                        <p className="text-slate-500 dark:text-slate-400">
                                            NIP: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{ticketSearchResult.nip}</span>
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleStartTicketChat}
                                    disabled={startingTicketChat}
                                    className="w-full mt-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {startingTicketChat ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Mulai Percakapan Tiket Ini</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
