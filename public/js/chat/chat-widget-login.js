(function (window) {
    "use strict";

    window.ChatWidgetLogin = {
        guestSession: null,

        init() {
            this.initGuestChat();
        },

        initGuestChat() {
            function escapeHtml(text) {
                if (text === null || text === undefined) return '';
                return String(text)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            function shortName(name) {
                if (!name) return 'Pengguna';
                return String(name).split(',')[0].trim();
            }

            function updateChatStatus(status) {
                const badge = el.chatStatusBadge;
                if (!badge) return;

                const isClosed = status === 'closed';
                badge.className = `chat-status-pill ${isClosed ? 'closed' : 'open'}`;
                badge.innerText = isClosed ? 'Closed' : 'Open';

                const emojiBtn = document.getElementById('chatEmojiBtn');
                if (emojiBtn) emojiBtn.disabled = isClosed;

                if (el.messageInput) el.messageInput.disabled = isClosed;
                if (el.sendButton) {
                    const hasText = el.messageInput ? el.messageInput.value.trim().length > 0 : false;
                    el.sendButton.disabled = isClosed || !hasText;
                }
            }

            function formatChatTime(dateString) {
                const date = new Date(dateString);
                const now = new Date();

                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));

                const jam = date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace(':', '.');

                if (diffDays === 0) return `Hari ini ${jam}`;
                if (diffDays === 1) return `Kemarin ${jam}`;

                return (
                    date.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }) + ' ' + jam
                );
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

            async function apiRequest(url, method = "GET", data = null) {
                const options = {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                        "Accept": "application/json"
                    }
                };

                if (data !== null) {
                    options.body = JSON.stringify(data);
                }

                const response = await fetch(url, options);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Terjadi kesalahan sistem.");
                }

                return result;
            }

            const chatState = {
                pollingId: null,
                conversationId: null,
                lastMessageId: 0,
                isPolling: false,
                email: null,
                ticket: null,
                soundEnabled: false,
                botMode: 'main_menu', // 'main_menu', 'info_menu', 'awaiting_ticket', 'selecting_syarat_layanan', 'selecting_admin_layanan', 'live_admin'
                pendingAdminMessage: null
            };

            const notificationSound = new Audio("/sound/notification.mp3");
            notificationSound.preload = "auto";

            const el = {
                guestNip: document.getElementById('guestNip'),
                btnCariNip: document.getElementById('btnCariNip'),
                guestNama: document.getElementById('guestNama'),
                guestUnitKerja: document.getElementById('guestUnitKerja'),
                nipLoading: document.getElementById('nipLoading'),
                nipError: document.getElementById('nipError'),

                pageHome: document.getElementById('pageHome'),
                pageCekUsulan: document.getElementById('pageCekUsulan'),
                pageNewChat: document.getElementById('pageNewChat'),
                pageTicket: document.getElementById('pageTicket'),
                pageRoom: document.getElementById('pageRoom'),

                inputDrawerTiketUsulan: document.getElementById('inputDrawerTiketUsulan'),
                formDrawerCekUsulan: document.getElementById('formDrawerCekUsulan'),
                drawerCekTiketFeedback: document.getElementById('drawerCekTiketFeedback'),

                chatMessages: document.getElementById('chatMessages'),
                conversationId: document.getElementById('conversationId'),

                sendButton: document.getElementById('sendChatBtn'),
                messageInput: document.getElementById('chatInput'),

                guestEmail: document.getElementById('guestEmail'),

                guestTicket: document.getElementById('guestTicket'),
                guestTicketEmail: document.getElementById('guestTicketEmail'),

                roomTicketNo: document.getElementById('roomTicketNo'),
                roomSubtitle: document.getElementById('roomSubtitle'),
                chatStatusBadge: document.getElementById('chatStatusBadge'),
            };

            const pages = [
                el.pageHome,
                el.pageCekUsulan,
                el.pageNewChat,
                el.pageTicket,
                el.pageRoom
            ];

            function getWitaGreeting() {
                try {
                    const now = new Date();
                    const formatter = new Intl.DateTimeFormat('id-ID', {
                        timeZone: 'Asia/Makassar',
                        hour: 'numeric',
                        hour12: false
                    });
                    const hour = parseInt(formatter.format(now), 10);
                    if (hour >= 5 && hour < 11) return 'Halo, Selamat Pagi!';
                    if (hour >= 11 && hour < 15) return 'Halo, Selamat Siang!';
                    if (hour >= 15 && hour < 19) return 'Halo, Selamat Sore!';
                    return 'Halo, Selamat Malam!';
                } catch (e) {
                    const now = new Date();
                    const utcHours = now.getUTCHours();
                    const witaHour = (utcHours + 8) % 24;
                    if (witaHour >= 5 && witaHour < 11) return 'Halo, Selamat Pagi!';
                    if (witaHour >= 11 && witaHour < 15) return 'Halo, Selamat Siang!';
                    if (witaHour >= 15 && witaHour < 19) return 'Halo, Selamat Sore!';
                    return 'Halo, Selamat Malam!';
                }
            }

            function updateWitaGreeting() {
                const greetingEl = document.getElementById('chatHomeGreeting');
                if (greetingEl) {
                    greetingEl.innerText = getWitaGreeting();
                }
            }

            function triggerLiliBubbleAnimation() {
                const pill = document.querySelector('.welcome-lili-bubble-pill');
                if (pill) {
                    pill.classList.remove('is-animating');
                    void pill.offsetWidth; // Force DOM reflow to re-trigger popIn delay
                    pill.classList.add('is-animating');
                }
            }

            // Show Page helper
            function showPage(activePage) {
                pages.forEach(page => {
                    if (page) page.classList.add('d-none');
                });

                if (activePage) {
                    activePage.classList.remove('d-none');
                    if (activePage === el.pageHome) {
                        updateWitaGreeting();
                        triggerLiliBubbleAnimation();
                    }
                }
                if (window.feather) {
                    window.feather.replace();
                }
            }

            // Keyboard & Input Events
            function bindKeyboardEvents() {
                el.messageInput?.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!el.sendButton?.disabled) {
                            el.sendButton?.click();
                        }
                    }
                });

                el.messageInput?.addEventListener('input', function () {
                    const isClosed = el.chatStatusBadge?.innerText?.trim().toLowerCase() === 'closed';
                    const hasText = this.value.trim().length > 0;
                    if (el.sendButton) {
                        el.sendButton.disabled = isClosed || !hasText;
                    }

                    // Auto-Growing Textarea (48px - 85px)
                    this.style.height = '48px';
                    const scrollH = this.scrollHeight;
                    if (scrollH > 48) {
                        this.style.height = Math.min(scrollH, 85) + 'px';
                    }
                });
            }

            // Sound Management with Debounce
            let _lastSoundTime = 0;
            function enableSound() {
                if (chatState.soundEnabled) return;
                notificationSound.play().then(() => {
                    notificationSound.pause();
                    notificationSound.currentTime = 0;
                    chatState.soundEnabled = true;
                }).catch(() => {});
            }

            function playNotificationSound() {
                const now = Date.now();
                if (now - _lastSoundTime < 1200) return;
                _lastSoundTime = now;

                if (!chatState.soundEnabled && document.hidden) return;
                notificationSound.currentTime = 0;
                notificationSound.play().catch(() => {});
            }

            // Reset Guest Session
            function resetGuestSession() {
                stopPolling();
                chatState.conversationId = null;
                chatState.lastMessageId = 0;
                chatState.email = null;
                chatState.ticket = null;
                chatState.botMode = 'main_menu';
                chatState.pendingAdminMessage = null;
                chatState.aiHistory = [];

                if (el.conversationId) el.conversationId.value = '';
                if (el.roomTicketNo) el.roomTicketNo.innerHTML = '-';
                if (el.chatMessages) el.chatMessages.innerHTML = '';
                if (el.guestTicketEmail) el.guestTicketEmail.value = '';
                if (el.guestTicket) el.guestTicket.value = '';
                if (el.guestNip) el.guestNip.value = '';
                if (el.guestNama) el.guestNama.value = '';
                if (el.guestUnitKerja) el.guestUnitKerja.value = '';
                if (el.nipError) el.nipError.classList.add('d-none');
                if (el.guestEmail) el.guestEmail.value = '';
                if (el.messageInput) {
                    el.messageInput.placeholder = "Tulis pesan...";
                    el.messageInput.style.height = '48px';
                }

                const roomDropdown = document.getElementById('roomActionDropdownWrap');
                if (roomDropdown) {
                    roomDropdown.classList.add('d-none');
                }
                const botHeader = document.getElementById('roomBotHeaderWrap');
                if (botHeader) {
                    botHeader.classList.remove('d-none');
                }
                const ticketHeader = document.getElementById('roomTicketHeaderWrap');
                if (ticketHeader) {
                    ticketHeader.classList.add('d-none');
                }
                const aiDisclaimer = document.getElementById('liliAiDisclaimerWrap');
                if (aiDisclaimer) {
                    aiDisclaimer.classList.add('d-none');
                }

                window.ChatWidgetLogin.guestSession = null;
            }

            function clearMessageInput() {
                if (el.messageInput) {
                    el.messageInput.value = "";
                    el.messageInput.style.height = "48px";
                }
                if (el.sendButton) {
                    el.sendButton.disabled = true;
                }
            }

            function scrollToBottom(smooth = true) {
                if (!el.chatMessages) return;
                el.chatMessages.scrollTo({
                    top: el.chatMessages.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }

            // =========================================================
            // CHATBOT INTERACTIVE ENGINE
            // =========================================================

            function appendBotMessageHtml(htmlContent) {
                if (!el.chatMessages) return;
                const wrapper = document.createElement('div');
                wrapper.innerHTML = htmlContent;
                el.chatMessages.appendChild(wrapper.firstElementChild || wrapper);
                scrollToBottom(true);
                if (window.feather) feather.replace();
            }

            // Render gelembung pesan user (.message-row.me)
            function appendUserMessageHtml(text) {
                if (!el.chatMessages) return;
                const chatTime = formatChatTime(new Date().toISOString());
                const bubble = document.createElement('div');
                bubble.className = 'message-row me';
                bubble.innerHTML = `
                    <div class="message-wrapper">
                        <div class="message-info me">
                            <span class="sender-name">Saya</span>
                            <span class="message-dot">•</span>
                            <span class="message-time">${chatTime}</span>
                        </div>
                        <div class="message-bubble me">${escapeHtml(text)}</div>
                    </div>
                `;
                el.chatMessages.appendChild(bubble);
                scrollToBottom(true);
            }

            // 1. Menu Utama Bot Interaktif
            function showBotMainMenu() {
                chatState.botMode = 'main_menu';
                
                // Pastikan header navbar dalam mode Asisten Virtual
                document.getElementById('roomBotHeaderWrap')?.classList.remove('d-none');
                document.getElementById('roomLiliHeaderWrap')?.classList.add('d-none');
                document.getElementById('roomTicketHeaderWrap')?.classList.add('d-none');
                document.getElementById('roomActionDropdownWrap')?.classList.add('d-none');
                document.getElementById('btnResetGuestLiliChat')?.classList.add('d-none');
                document.getElementById('btnResetGuestLiliChat')?.classList.remove('d-flex');
                document.getElementById('liliAiDisclaimerWrap')?.classList.add('d-none');

                if (el.messageInput) {
                    el.messageInput.placeholder = "Tulis pesan...";
                }

                const guestName = window.ChatWidgetLogin.guestSession?.nama ? escapeHtml(shortName(window.ChatWidgetLogin.guestSession.nama)) : 'Bapak/Ibu';

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="cpu"></i> Asisten Virtual PILKB
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Halo <strong>${guestName}</strong>, Selamat Datang di Layanan Bantuan Virtual PILKB.</p>
                            <p class="mb-0 text-muted small">Anda dapat memilih opsi menu yang dibutuhkan di bawah ini:</p>
                            
                            <div class="bot-options-grid">
                                <button type="button" class="bot-btn-option" data-bot-action="menu_info">
                                    <i data-feather="info" class="text-primary"></i>
                                    <span>1. Informasi</span>
                                </button>
                                <button type="button" class="bot-btn-option" data-bot-action="menu_tanya_ai" style="border-color: #c7d2fe; background: #f5f3ff;">
                                    <img src="/images/lili-avatar.png" alt="LILI" class="bot-option-avatar" style="border-radius: 50%; object-fit: cover; box-shadow: 0 1px 3px rgba(99,102,241,0.25);">
                                    <span class="fw-semibold" style="color: #4f46e5;">2. Tanya LILI (Asisten AI)</span>
                                </button>
                                <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                    <i data-feather="message-circle"></i>
                                    <span>3. Tanya Admin / Konsultasi</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
            }

            // 1.1 Mode Tanya AI Kepegawaian (LILI)
            function startAiKepegawaianMode(forceReset = false) {
                chatState.botMode = 'ai_kepegawaian';

                if (forceReset) {
                    chatState.aiHistory = [];
                    if (el.chatMessages) {
                        el.chatMessages.innerHTML = '';
                    }
                } else {
                    chatState.aiHistory = chatState.aiHistory || [];
                }

                // Update Navbar Header khusus LILI & tampilkan disclaimer AI
                document.getElementById('roomBotHeaderWrap')?.classList.add('d-none');
                document.getElementById('roomLiliHeaderWrap')?.classList.remove('d-none');
                document.getElementById('roomTicketHeaderWrap')?.classList.add('d-none');
                document.getElementById('roomActionDropdownWrap')?.classList.add('d-none');
                document.getElementById('btnResetGuestLiliChat')?.classList.remove('d-none');
                document.getElementById('btnResetGuestLiliChat')?.classList.add('d-flex');
                document.getElementById('liliAiDisclaimerWrap')?.classList.remove('d-none');

                if (el.messageInput) {
                    el.messageInput.placeholder = "Tanya LILI seputar kepegawaian...";
                    el.messageInput.focus();
                }

                // Jika sudah ada pesan sebelumnya dan bukan reset paksa, jangan hapus atau putar audio berulang
                if (el.chatMessages && el.chatMessages.children.length > 0 && !forceReset) {
                    scrollToBottom(false);
                    return;
                }

                // Putar suara sapaan ramah LILI jika chat pertama kali
                playLiliVoiceGreeting();

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                            <span>LILI - Layanan Informasi &amp; Literasi Kepegawaian Interaktif</span>
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Halo! Saya <strong>LILI</strong> (<em>Layanan Informasi &amp; Literasi Kepegawaian Interaktif</em>) Asisten AI PILKB. 😊</p>
                            <p class="mb-2">Anda dapat berkonsultasi seputar regulasi ASN, cek status usulan tiket, serta persyaratan layanan kepegawaian di BKPSDM Buleleng.</p>
                            <p class="mb-1 text-muted small fw-semibold">Contoh pertanyaan yang bisa Anda tanyakan kepada LILI:</p>
                            <ul class="mb-3 small ps-3 text-muted">
                                <li><em>"Tolong cek status tiket usulan saya 010126ABCD"</em></li>
                                <li><em>"Apa saja syarat usulan kenaikan pangkat di BKPSDM Buleleng?"</em></li>
                                <li><em>"Bagaimana aturan disiplin dan sanksi jam kerja ASN?"</em></li>
                            </ul>
                            <p class="mb-0 text-muted small fst-italic">Silakan ketik pertanyaan Anda pada kolom pesan di bawah lalu tekan Kirim (Enter).</p>
                            
                            <div class="bot-options-grid mt-3">
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                    <i data-feather="arrow-left"></i>
                                    <span>Kembali ke Menu Utama</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
            }

            // Putar Suara Sapaan LILI (File MP3 / Web Speech API Browser Native)
            function playLiliVoiceGreeting() {
                const greetingText = "Halo, saya LILI Asisten AI. Ada yang bisa saya bantu?";
                try {
                    const audio = new Audio('/sound/lili-greeting.mp3');
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            speakWithBrowserTTS(greetingText);
                        });
                    }
                } catch (e) {
                    speakWithBrowserTTS(greetingText);
                }
            }

            function speakWithBrowserTTS(text) {
                if ('speechSynthesis' in window) {
                    try {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'id-ID';
                        utterance.rate = 0.95;
                        utterance.pitch = 1.05;

                        const voices = window.speechSynthesis.getVoices();
                        const idVoice = voices.find(v => (v.lang && (v.lang === 'id-ID' || v.lang.startsWith('id'))) || (v.name && v.name.toLowerCase().includes('indonesia')));
                        if (idVoice) {
                            utterance.voice = idVoice;
                        }

                        window.speechSynthesis.speak(utterance);
                    } catch (err) {
                        console.warn('Speech synthesis error:', err);
                    }
                }
            }

            // 1.2 Penanganan Pesan Tanya AI Kepegawaian (LILI)
            async function handleAiKepegawaianMessage(messageText) {
                appendUserMessageHtml(messageText);
                clearMessageInput();

                if (el.sendButton) el.sendButton.disabled = true;

                const loadingId = 'ai_loading_' + Date.now();
                appendBotMessageHtml(`
                    <div class="bot-message-wrapper" id="${loadingId}">
                        <div class="bot-bubble text-muted small d-flex align-items-center gap-2" style="background:#f5f3ff; border:1px solid #e0e7ff; color:#4f46e5;">
                            <span class="spinner-border spinner-border-sm" style="color:#6366f1; width: 0.9rem; height: 0.9rem;" role="status"></span>
                            <span>LILI sedang mengetik...</span>
                        </div>
                    </div>
                `);

                try {
                    chatState.aiHistory = chatState.aiHistory || [];
                    const res = await apiRequest('/guest-bot/tanya-ai', 'POST', {
                        pertanyaan: messageText,
                        history: chatState.aiHistory.slice(-6)
                    });

                    document.getElementById(loadingId)?.remove();

                    if (res && res.reply) {
                        chatState.aiHistory.push({ role: 'user', text: messageText });
                        chatState.aiHistory.push({ role: 'model', text: res.reply });
                        const formattedReply = formatAiReply(res.reply);

                        // Render Action Chips jika ada tindakan cepat (Unduh PDF Syarat, Cek Tiket, dll)
                        let actionChipsHtml = '';
                        if (res.actions && Array.isArray(res.actions) && res.actions.length > 0) {
                            actionChipsHtml += '<div class="ai-action-chips d-flex flex-wrap gap-2 my-2 pt-1">';
                            res.actions.forEach(action => {
                                if (action.type === 'pdf') {
                                    actionChipsHtml += `
                                        <a href="${escapeHtml(action.url)}" target="_blank" class="ai-action-chip chip-pdf">
                                            <i data-feather="file-text" style="width:13px;height:13px;"></i>
                                            <span>${escapeHtml(action.label)}</span>
                                        </a>
                                    `;
                                } else if (action.type === 'ticket') {
                                    actionChipsHtml += `
                                        <a href="${escapeHtml(action.url)}" target="_blank" class="ai-action-chip chip-ticket">
                                            <i data-feather="search" style="width:13px;height:13px;"></i>
                                            <span>${escapeHtml(action.label)}</span>
                                        </a>
                                    `;
                                } else if (action.type === 'prompt') {
                                    actionChipsHtml += `
                                        <button type="button" class="ai-action-chip chip-prompt" data-ai-prompt="${escapeHtml(action.prompt || action.label)}">
                                            <span>${escapeHtml(action.label)}</span>
                                        </button>
                                    `;
                                } else if (action.type === 'admin') {
                                    actionChipsHtml += `
                                        <button type="button" class="ai-action-chip chip-admin" data-bot-action="menu_admin_pilih_layanan">
                                            <i data-feather="message-square" style="width:13px;height:13px;"></i>
                                            <span>${escapeHtml(action.label)}</span>
                                        </button>
                                    `;
                                }
                            });
                            actionChipsHtml += '</div>';
                        }

                        const html = `
                            <div class="bot-message-wrapper">
                                <div class="bot-badge-header">
                                    <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                                    <span>LILI - Asisten AI</span>
                                </div>
                                <div class="bot-bubble">
                                    <div class="ai-reply-content mb-2">${formattedReply}</div>
                                    ${actionChipsHtml}
                                    
                                    <p class="mt-3 mb-1 text-muted small fw-semibold">Langkah selanjutnya:</p>
                                    <div class="bot-options-grid">
                                        <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                            <i data-feather="message-circle"></i>
                                            <span>Tanya Admin Terkait Hal Ini</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="selesai_terima_kasih">
                                            <i data-feather="check"></i>
                                            <span>Tidak, Terima Kasih</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                            <i data-feather="arrow-left"></i>
                                            <span>Menu Utama</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        appendBotMessageHtml(html);
                    } else {
                        throw new Error('Gagal mendapatkan respon AI.');
                    }
                } catch (err) {
                    document.getElementById(loadingId)?.remove();
                    appendBotMessageHtml(`
                        <div class="bot-message-wrapper">
                            <div class="bot-bubble text-danger small">
                                Maaf, terjadi kendala saat menghubungkan ke LILI. Silakan coba kembali atau gunakan opsi <strong>Tanya Admin BKPSDM</strong>.
                            </div>
                        </div>
                    `);
                } finally {
                    if (el.sendButton) el.sendButton.disabled = false;
                    if (el.messageInput) el.messageInput.focus();
                }
            }

            function formatAiReply(text) {
                let safe = escapeHtml(text);
                // 1. Bold: **text** (tanpa memotong teks atau karakter lain)
                safe = safe.replace(/\*\*([^*\n\r]+?)\*\*/g, '<strong>$1</strong>');
                // 2. Italic: _text_
                safe = safe.replace(/_([^_\n\r]+?)_/g, '<em>$1</em>');
                // 3. Links: [title](url)
                safe = safe.replace(/\[(.*?)\]\((.*?)\)/g, function (match, title, url) {
                    const cleanUrl = url.trim();
                    // Sanitasi keamanan link URL (Hanya izinkan https, http, atau relative path)
                    if (/^(https?:\/\/|\/|mailto:)/i.test(cleanUrl)) {
                        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${title}</a>`;
                    }
                    return title;
                });
                safe = safe.replace(/\n/g, '<br>');
                return safe;
            }

            // 2. Sub-Menu Informasi
            function showBotInfoMenu() {
                chatState.botMode = 'info_menu';
                appendUserMessageHtml("1. Informasi");

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="cpu"></i> Asisten Virtual PILKB
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Silakan pilih jenis informasi yang ingin Anda ketahui:</p>
                            
                            <div class="bot-options-grid">
                                <button type="button" class="bot-btn-option" data-bot-action="cek_tiket">
                                    <i data-feather="search" class="text-info"></i>
                                    <span>a. Cek Status Tiket</span>
                                </button>
                                <button type="button" class="bot-btn-option" data-bot-action="cek_syarat_langsung">
                                    <i data-feather="file-text" class="text-success"></i>
                                    <span>b. Cek Syarat Layanan</span>
                                </button>
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                    <i data-feather="arrow-left"></i>
                                    <span>Kembali ke Menu Utama</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
            }

            // 3. Sub-Flow a: Cek Status Tiket (Prompt)
            function promptTicketInput() {
                chatState.botMode = 'awaiting_ticket';
                appendUserMessageHtml("a. Cek Status Tiket");

                if (el.messageInput) {
                    el.messageInput.placeholder = "Tulis nomor tiket Anda...";
                    el.messageInput.focus();
                }

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="cpu"></i> Asisten Virtual PILKB
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Silakan ketikkan <strong>Nomor Tiket</strong> Anda pada kolom pesan di bawah lalu tekan Kirim (Enter).</p>
                            <p class="mb-0 text-muted small fst-italic">Contoh: 010126ABCD</p>
                            
                            <div class="bot-options-grid mt-2">
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_info_menu">
                                    <i data-feather="arrow-left"></i>
                                    <span>Kembali ke Menu Informasi</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
            }

            // 3.1 Handle Pencarian Tiket
            async function handleBotTicketSearch(ticketNo) {
                chatState.botMode = 'info_menu';
                appendUserMessageHtml(`Cek Tiket: ${ticketNo}`);
                clearMessageInput();

                if (el.messageInput) {
                    el.messageInput.placeholder = "Tulis pesan...";
                }

                const loadingId = 'bot_loading_' + Date.now();
                appendBotMessageHtml(`
                    <div class="bot-message-wrapper" id="${loadingId}">
                        <div class="bot-bubble text-muted small">
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            Sedang mencari data tiket <strong>${escapeHtml(ticketNo)}</strong>...
                        </div>
                    </div>
                `);

                try {
                    const res = await apiRequest('/guest-bot/cek-tiket', 'POST', { no_tiket: ticketNo });
                    document.getElementById(loadingId)?.remove();

                    if (res.status === 'found') {
                        const d = res.data;
                        const isSelesai = (d.status_nama || '').toLowerCase().includes('selesai');
                        const statusBadgeStyle = isSelesai ? 'background:#dcfce7;color:#15803d;font-weight:700;' : 'background:#e0f2fe;color:#0369a1;font-weight:700;';

                        const html = `
                            <div class="bot-message-wrapper">
                                <div class="bot-badge-header">
                                    <i data-feather="check-circle" class="text-success"></i> Status Terkini Tiket
                                </div>
                                <div class="bot-bubble">
                                    <div class="bot-ticket-card">
                                        <div class="bot-ticket-header">
                                            <span class="bot-ticket-no font-monospace">${escapeHtml(d.no_tiket)}</span>
                                            <span class="bot-ticket-status" style="${statusBadgeStyle}">${escapeHtml(d.status_nama)}</span>
                                        </div>
                                        <div class="bot-ticket-row">
                                            <span class="bot-ticket-label">Pemohon:</span>
                                            <span class="bot-ticket-value">${escapeHtml(d.nama)}</span>
                                        </div>
                                        <div class="bot-ticket-row">
                                            <span class="bot-ticket-label">Layanan:</span>
                                            <span class="bot-ticket-value">${escapeHtml(d.layanan)}</span>
                                        </div>
                                        <div class="bot-ticket-row">
                                            <span class="bot-ticket-label">Bidang:</span>
                                            <span class="bot-ticket-value">${escapeHtml(d.bidang)}</span>
                                        </div>
                                        <div class="bot-ticket-row">
                                            <span class="bot-ticket-label">Status Terakhir:</span>
                                            <span class="bot-ticket-value text-primary">${escapeHtml(d.status_nama)}</span>
                                        </div>
                                        <div class="bot-ticket-row">
                                            <span class="bot-ticket-label">Update Terakhir:</span>
                                            <span class="bot-ticket-value">${escapeHtml(d.tanggal_update)}</span>
                                        </div>
                                        ${d.catatan && d.catatan !== '-' ? `
                                        <div class="bot-ticket-row border-top pt-1 mt-1">
                                            <span class="bot-ticket-label">Catatan:</span>
                                            <span class="bot-ticket-value">${escapeHtml(d.catatan)}</span>
                                        </div>` : ''}
                                    </div>
                                    
                                    <p class="mt-2 mb-1 text-muted small fw-semibold">Ada yang bisa dibantu lagi?</p>
                                    <div class="bot-options-grid">
                                        <a href="${d.url_detail}" target="_blank" class="bot-btn-option text-decoration-none">
                                            <i data-feather="external-link" class="text-primary"></i>
                                            <span>Buka Halaman Detail Tiket</span>
                                        </a>
                                        <button type="button" class="bot-btn-option" data-bot-action="cek_tiket">
                                            <i data-feather="search"></i>
                                            <span>Cek Tiket Lain</span>
                                        </button>
                                        <button type="button" class="bot-btn-option primary" data-bot-action="pilih_layanan_admin" data-layanan-id="${d.layanan_id || ''}" data-bidang-id="${d.bidang_id || ''}" data-layanan-name="${escapeHtml(d.layanan)}" data-nama-bidang="${escapeHtml(d.bidang)}" data-ticket-no="${escapeHtml(d.no_tiket)}" data-guest-nama="${escapeHtml(d.nama || '')}" data-guest-email="${escapeHtml(d.email || '')}" data-guest-nip="${escapeHtml(d.nip !== '-' ? d.nip : '')}" data-guest-ukerja="${escapeHtml(d.unit_kerja !== '-' ? d.unit_kerja : '')}">
                                            <i data-feather="message-circle"></i>
                                            <span>Tanya Admin Terkait Tiket Ini</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="selesai_terima_kasih">
                                            <i data-feather="check"></i>
                                            <span>Tidak, Terima Kasih</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                            <i data-feather="arrow-left"></i>
                                            <span>Menu Utama</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        appendBotMessageHtml(html);
                    } else {
                        const html = `
                            <div class="bot-message-wrapper">
                                <div class="bot-badge-header">
                                    <i data-feather="alert-circle" class="text-danger"></i> Tiket Tidak Ditemukan
                                </div>
                                <div class="bot-bubble">
                                    <p class="text-danger mb-2">Maaf, nomor tiket <strong>"${escapeHtml(ticketNo)}"</strong> tidak ditemukan di dalam sistem.</p>
                                    <p class="text-muted small mb-0">Silakan pastikan format nomor tiket sudah sesuai, atau tanyakan langsung ke Admin BKPSDM.</p>
                                    
                                    <p class="mt-2 mb-1 text-muted small fw-semibold">Ada yang bisa dibantu lagi?</p>
                                    <div class="bot-options-grid">
                                        <button type="button" class="bot-btn-option" data-bot-action="cek_tiket">
                                            <i data-feather="rotate-cw"></i>
                                            <span>Coba Masukkan Tiket Lain</span>
                                        </button>
                                        <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                            <i data-feather="message-circle"></i>
                                            <span>Tanya Admin BKPSDM</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="selesai_terima_kasih">
                                            <i data-feather="check"></i>
                                            <span>Tidak, Terima Kasih</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                            <i data-feather="arrow-left"></i>
                                            <span>Menu Utama</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        appendBotMessageHtml(html);
                    }
                } catch (err) {
                    document.getElementById(loadingId)?.remove();
                    appendBotMessageHtml(`
                        <div class="bot-message-wrapper">
                            <div class="bot-bubble text-danger small">
                                Terjadi kesalahan saat memeriksa tiket. Silakan coba beberapa saat lagi.
                            </div>
                        </div>
                    `);
                }
            }

            // 4. Sub-Flow b: Cek Syarat Layanan (Langsung Daftar Layanan A-Z tanpa Pilih Bidang)
            async function loadBotSyaratLayananList() {
                chatState.botMode = 'selecting_syarat_layanan';
                appendUserMessageHtml("b. Cek Syarat Layanan");

                const loadingId = 'bot_loading_' + Date.now();
                appendBotMessageHtml(`
                    <div class="bot-message-wrapper" id="${loadingId}">
                        <div class="bot-bubble text-muted small">
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            Memuat daftar layanan...
                        </div>
                    </div>
                `);

                try {
                    const list = await apiRequest('/guest-bot/semua-layanan');
                    document.getElementById(loadingId)?.remove();
                    window._allLayananData = list;

                    let buttonsHtml = '';
                    list.forEach(l => {
                        buttonsHtml += `
                            <button type="button" class="bot-btn-option" data-bot-action="lihat_syarat_layanan" data-layanan-id="${l.id}">
                                <i data-feather="file-text" class="text-success"></i>
                                <span>${escapeHtml(l.nama_layanan)}</span>
                            </button>
                        `;
                    });

                    buttonsHtml += `
                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_info_menu">
                            <i data-feather="arrow-left"></i>
                            <span>Kembali ke Menu Informasi</span>
                        </button>
                    `;

                    const html = `
                        <div class="bot-message-wrapper">
                            <div class="bot-badge-header">
                                <i data-feather="file-text" class="text-success"></i> Pilih Layanan (A-Z)
                            </div>
                            <div class="bot-bubble">
                                <p class="mb-2">Silakan pilih <strong>Layanan</strong> yang ingin Anda cek persyaratannya:</p>
                                <div class="bot-options-grid" style="max-height: 280px; overflow-y: auto; padding-right: 4px;">
                                    ${buttonsHtml}
                                </div>
                            </div>
                        </div>
                    `;
                    appendBotMessageHtml(html);
                } catch (err) {
                    document.getElementById(loadingId)?.remove();
                    console.error(err);
                }
            }

            // 4.1 Tampilkan Persyaratan Layanan Lengkap (dengan In-Memory Cache)
            async function loadBotSyaratLayanan(layananId) {
                window._syaratCache = window._syaratCache || {};

                function renderSyarat(d) {
                    appendUserMessageHtml(`Layanan: ${d.nama_layanan}`);

                    let listItems = '';
                    if (d.syarat && d.syarat.length > 0) {
                        d.syarat.forEach((s, idx) => {
                            listItems += `<li><strong>${idx + 1}.</strong> ${escapeHtml(s.syarat)}${s.deskripsi ? ` <span class="text-muted">(${escapeHtml(s.deskripsi)})</span>` : ''}</li>`;
                        });
                    } else {
                        listItems = `<li class="text-muted fst-italic">Belum ada rincian persyaratan khusus yang dicantumkan.</li>`;
                    }

                    const html = `
                        <div class="bot-message-wrapper">
                            <div class="bot-badge-header">
                                <i data-feather="file-text" class="text-success"></i> Syarat Layanan: ${escapeHtml(d.nama_layanan)}
                            </div>
                            <div class="bot-bubble">
                                <div class="bot-syarat-card">
                                    <div class="bot-syarat-title">${escapeHtml(d.nama_layanan)}</div>
                                    <div class="text-muted small mb-2"><i data-feather="folder" style="width:11px;height:11px;" class="me-1"></i>${escapeHtml(d.nama_bidang)}</div>
                                    
                                    <div class="fw-semibold small text-dark mt-2 mb-1">Daftar Persyaratan Berkas:</div>
                                    <ul class="bot-syarat-list">
                                        ${listItems}
                                    </ul>
                                    
                                    <div class="bot-syarat-meta">
                                        <i data-feather="clock" style="width:12px;height:12px;" class="me-1"></i>
                                        Estimasi Waktu: <strong>${escapeHtml(d.waktu_penyelesaian)}</strong>
                                    </div>
                                </div>
                                
                                <p class="mt-3 mb-1 text-muted small fw-semibold">Ada yang bisa dibantu lagi?</p>
                                <div class="bot-options-grid">
                                    <a href="${d.pdf_url}" target="_blank" class="bot-btn-option text-decoration-none">
                                        <i data-feather="download" class="text-primary"></i>
                                        <span>Unduh Format PDF Persyaratan</span>
                                    </a>
                                    <button type="button" class="bot-btn-option" data-bot-action="cek_syarat_langsung">
                                        <i data-feather="grid"></i>
                                        <span>Cek Layanan Lain</span>
                                    </button>
                                    <button type="button" class="bot-btn-option primary" data-bot-action="pilih_layanan_admin" data-layanan-id="${d.id}" data-bidang-id="${d.kode_bidang || ''}" data-layanan-name="${escapeHtml(d.nama_layanan)}" data-nama-bidang="${escapeHtml(d.nama_bidang)}">
                                        <i data-feather="message-circle"></i>
                                        <span>Tanya Admin Terkait Layanan Ini</span>
                                    </button>
                                    <button type="button" class="bot-btn-option secondary" data-bot-action="selesai_terima_kasih">
                                        <i data-feather="check"></i>
                                        <span>Tidak, Terima Kasih</span>
                                    </button>
                                    <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                        <i data-feather="arrow-left"></i>
                                        <span>Menu Utama</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    appendBotMessageHtml(html);
                }

                if (window._syaratCache[layananId]) {
                    renderSyarat(window._syaratCache[layananId]);
                    return;
                }

                const loadingId = 'bot_loading_' + Date.now();
                appendBotMessageHtml(`
                    <div class="bot-message-wrapper" id="${loadingId}">
                        <div class="bot-bubble text-muted small">
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            Mengambil data persyaratan layanan...
                        </div>
                    </div>
                `);

                try {
                    const res = await apiRequest(`/guest-bot/syarat/${layananId}`);
                    document.getElementById(loadingId)?.remove();

                    if (res.status === 'success') {
                        window._syaratCache[layananId] = res.data;
                        renderSyarat(res.data);
                    }
                } catch (err) {
                    document.getElementById(loadingId)?.remove();
                    console.error(err);
                }
            }

            // 4.2 Selesai / Terima Kasih
            function handleBotSelesai() {
                chatState.botMode = 'main_menu';
                appendUserMessageHtml("Tidak, terima kasih");

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="smile" class="text-success"></i> Selesai
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Sama-sama, senang bisa membantu Anda! 😊</p>
                            <p class="mb-2">Jika sewaktu-waktu Anda memerlukan informasi atau bantuan layanan kepegawaian lainnya, jangan ragu untuk kembali menggunakan layanan Pusat Bantuan BKPSDM Kabupaten Buleleng.</p>
                            <p class="mb-0 text-muted small fst-italic">Semoga hari Anda menyenangkan perkerjaan Anda berjalan lancar! ✨</p>
                            
                            <div class="bot-options-grid mt-3">
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                    <i data-feather="cpu"></i>
                                    <span>Buka Menu Utama</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
            }

            // 5. PILIH LAYANAN UNTUK TANYA ADMIN / KONSULTASI
            async function showAdminLayananPicker() {
                chatState.botMode = 'selecting_admin_layanan';
                appendUserMessageHtml("2. Tanya Admin / Konsultasi");

                const loadingId = 'bot_loading_' + Date.now();
                appendBotMessageHtml(`
                    <div class="bot-message-wrapper" id="${loadingId}">
                        <div class="bot-bubble text-muted small">
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            Memuat daftar layanan...
                        </div>
                    </div>
                `);

                try {
                    const list = await apiRequest('/guest-bot/semua-layanan');
                    document.getElementById(loadingId)?.remove();
                    window._allLayananData = list;

                    let buttonsHtml = '';
                    list.forEach(l => {
                        buttonsHtml += `
                            <button type="button" class="bot-btn-option" data-bot-action="pilih_layanan_admin" data-layanan-id="${l.id}" data-bidang-id="${l.bidang_id || ''}" data-layanan-name="${escapeHtml(l.nama_layanan)}">
                                <i data-feather="help-circle" class="text-primary"></i>
                                <span>${escapeHtml(l.nama_layanan)}</span>
                            </button>
                        `;
                    });

                    buttonsHtml += `
                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                            <i data-feather="arrow-left"></i>
                            <span>Kembali ke Menu Utama</span>
                        </button>
                    `;

                    const html = `
                        <div class="bot-message-wrapper">
                            <div class="bot-badge-header">
                                <i data-feather="help-circle" class="text-primary"></i> Pilih Layanan Konsultasi
                            </div>
                            <div class="bot-bubble">
                                <p class="mb-2">Silakan pilih <strong>Layanan</strong> yang ingin Anda tanyakan atau konsultasikan dengan Admin BKPSDM:</p>
                                <div class="bot-options-grid" style="max-height: 280px; overflow-y: auto; padding-right: 4px;">
                                    ${buttonsHtml}
                                </div>
                            </div>
                        </div>
                    `;
                    appendBotMessageHtml(html);
                } catch (err) {
                    document.getElementById(loadingId)?.remove();
                    console.error(err);
                }
            }

            // 5.1 Aktifkan Sesi Live Chat Admin Setelah Pilih Layanan
            async function activateAdminChatForLayanan(layananId, bidangId, layananName, ticketNo = null, namaBidang = '', guestData = null) {
                chatState.botMode = 'live_admin';
                
                // Bersihkan riwayat chat bot sebelumnya agar tampilan ruang obrolan bersih & fokus
                if (el.chatMessages) {
                    el.chatMessages.innerHTML = '';
                }

                if (!window.ChatWidgetLogin.guestSession) {
                    window.ChatWidgetLogin.guestSession = {
                        nip: guestData?.nip || el.guestNip?.value?.trim() || '',
                        nama: guestData?.nama || el.guestNama?.value?.trim() || 'Tamu',
                        unit_kerja: guestData?.unit_kerja || el.guestUnitKerja?.value?.trim() || '',
                        email: guestData?.email || el.guestEmail?.value?.trim() || '',
                        bidang_id: bidangId || '',
                        layanan_id: layananId ? (parseInt(layananId) || layananId) : ''
                    };
                } else {
                    if (guestData?.nama && (!window.ChatWidgetLogin.guestSession.nama || window.ChatWidgetLogin.guestSession.nama === 'Tamu')) {
                        window.ChatWidgetLogin.guestSession.nama = guestData.nama;
                    }
                    if (guestData?.email && !window.ChatWidgetLogin.guestSession.email) {
                        window.ChatWidgetLogin.guestSession.email = guestData.email;
                    }
                    if (guestData?.nip && !window.ChatWidgetLogin.guestSession.nip) {
                        window.ChatWidgetLogin.guestSession.nip = guestData.nip;
                    }
                    if (guestData?.unit_kerja && !window.ChatWidgetLogin.guestSession.unit_kerja) {
                        window.ChatWidgetLogin.guestSession.unit_kerja = guestData.unit_kerja;
                    }
                    window.ChatWidgetLogin.guestSession.layanan_id = layananId ? (parseInt(layananId) || layananId) : '';
                    window.ChatWidgetLogin.guestSession.bidang_id = bidangId || '';
                }

                const displaySub = namaBidang && namaBidang !== '-' ? `${layananName} • ${namaBidang}` : layananName;
                if (el.roomSubtitle) {
                    el.roomSubtitle.innerHTML = `<span class="text-primary fw-semibold"><i data-feather="user-check" style="width:12px;height:12px;" class="me-1"></i>Tanya Admin: ${escapeHtml(displaySub)}</span>`;
                }

                if (el.messageInput) {
                    if (ticketNo) {
                        el.messageInput.placeholder = `Tulis pesan konsultasi tiket #${ticketNo}...`;
                    } else {
                        el.messageInput.placeholder = "Tulis pesan...";
                    }
                    el.messageInput.focus();
                }

                const ticketIntro = ticketNo
                    ? `<p class="mb-2">Anda terhubung ke <strong>${escapeHtml(namaBidang && namaBidang !== '-' ? namaBidang : 'Bidang Terkait')}</strong> untuk layanan <strong>${escapeHtml(layananName)}</strong> seputar nomor tiket <strong>#${escapeHtml(ticketNo)}</strong>.</p>`
                    : `<p class="mb-2">Anda terhubung dengan layanan Tanya Admin BKPSDM untuk <strong>${escapeHtml(layananName)}</strong>${namaBidang && namaBidang !== '-' ? ` (<strong>${escapeHtml(namaBidang)}</strong>)` : ''}.</p>`;

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="headphones" class="text-success"></i> Terhubung ke Tanya Admin BKPSDM
                        </div>
                        <div class="bot-bubble">
                            ${ticketIntro}
                            <p class="mb-2">Silakan ketik pertanyaan atau kendala Anda pada kolom pesan di bawah. Sistem akan <strong>otomatis menghubungkan ke Admin bidang yang menangani</strong> begitu pesan pertama Anda terkirim.</p>
                            <p class="mb-0 text-muted small fst-italic">Admin BKPSDM kami siap merespons percakapan Anda.</p>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);

                // Jika ada pesan pending dari ketikan bebas sebelumnya, kirimkan langsung!
                if (chatState.pendingAdminMessage) {
                    const pendingText = chatState.pendingAdminMessage;
                    chatState.pendingAdminMessage = null;
                    try {
                        let conversationId = await createConversationIfNeeded();
                        await sendGuestMessage(conversationId, pendingText);
                        appendMessage({
                            senderName: "Saya",
                            message: pendingText,
                            createdAt: new Date().toISOString(),
                            isGuest: true
                        });
                    } catch (err) {
                        console.error(err);
                    }
                }
            }

            // 6. Penanganan Cerdas saat User Mengetik Pesan Bebas di Menu Bot
            function handleFreeformBotMessage(messageText) {
                appendUserMessageHtml(messageText);
                clearMessageInput();

                // 1. Deteksi jika teks menyerupai nomor tiket (misal mengandung "TK" atau ada angka dengan tanda strip/panjang > 6)
                const isLikelyTicket = /^(TK|TKT|REG)[\w\-]+/i.test(messageText) || (/[\d]{4,}/.test(messageText) && messageText.length >= 6);
                if (isLikelyTicket) {
                    handleBotTicketSearch(messageText);
                    return;
                }

                // 2. Jika bukan tiket, simpan teks sebagai pending message dan tanyakan apakah ingin disambungkan ke Admin BKPSDM
                chatState.pendingAdminMessage = messageText;

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="help-circle" class="text-primary"></i> Bantuan Asisten Virtual
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Halo! Anda saat ini berada di menu Asisten Virtual.</p>
                            <p class="mb-2">Apakah Anda ingin mengonsultasikan pesan Anda: <em>"${escapeHtml(messageText)}"</em> ini langsung dengan <strong>Admin BKPSDM</strong>?</p>
                            
                            <div class="bot-options-grid">
                                <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                    <i data-feather="message-circle"></i>
                                    <span>Ya, Hubungkan ke Tanya Admin</span>
                                </button>
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                    <i data-feather="cpu"></i>
                                    <span>Buka Pilihan Menu Bot</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
            }

            // Delegasi Event Klik Tombol Bot
            document.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-bot-action]');
                if (!btn) return;

                e.preventDefault();
                const action = btn.getAttribute('data-bot-action');

                switch (action) {
                    case 'menu_info':
                        showBotInfoMenu();
                        break;
                    case 'menu_tanya_ai':
                        startAiKepegawaianMode();
                        break;
                    case 'menu_admin_pilih_layanan':
                        showAdminLayananPicker();
                        break;
                    case 'pilih_layanan_admin':
                        const lId = btn.getAttribute('data-layanan-id');
                        const bId = btn.getAttribute('data-bidang-id');
                        const lName = btn.getAttribute('data-layanan-name');
                        const nBidang = btn.getAttribute('data-nama-bidang') || '';
                        const tNo = btn.getAttribute('data-ticket-no') || null;
                        const gNama = btn.getAttribute('data-guest-nama') || '';
                        const gEmail = btn.getAttribute('data-guest-email') || '';
                        const gNip = btn.getAttribute('data-guest-nip') || '';
                        const gUkerja = btn.getAttribute('data-guest-ukerja') || '';
                        activateAdminChatForLayanan(lId, bId, lName, tNo, nBidang, { nama: gNama, email: gEmail, nip: gNip, unit_kerja: gUkerja });
                        break;
                    case 'cek_tiket':
                        promptTicketInput();
                        break;
                    case 'cek_syarat_langsung':
                        loadBotSyaratLayananList();
                        break;
                    case 'lihat_syarat_layanan':
                        const syaratLayananId = btn.getAttribute('data-layanan-id');
                        loadBotSyaratLayanan(syaratLayananId);
                        break;
                    case 'back_main_menu':
                        showBotMainMenu();
                        break;
                    case 'back_info_menu':
                        showBotInfoMenu();
                        break;
                    case 'selesai_terima_kasih':
                        handleBotSelesai();
                        break;
                }
            });

            // =========================================================
            // NAVIGATION & FORM LOOKUPS
            // =========================================================

            function bindNavigationEvents() {
                document.getElementById('btnDirectCekUsulan')?.addEventListener('click', () => {
                    showPage(el.pageCekUsulan);
                    if (el.drawerCekTiketFeedback) {
                        el.drawerCekTiketFeedback.classList.add('d-none');
                        el.drawerCekTiketFeedback.innerHTML = '';
                    }
                    if (el.inputDrawerTiketUsulan) {
                        el.inputDrawerTiketUsulan.value = '';
                        setTimeout(() => el.inputDrawerTiketUsulan.focus(), 150);
                    }
                });
                document.getElementById('backHomeCekUsulan')?.addEventListener('click', () => showPage(el.pageHome));
                document.getElementById('btnNewChat')?.addEventListener('click', () => {
                    chatState.directAiMode = false;
                    if (window.ChatWidgetLogin.guestSession?.nama) {
                        showPage(el.pageRoom);
                        if (!el.chatMessages.children.length) {
                            showBotMainMenu();
                        } else {
                            scrollToBottom(false);
                        }
                    } else {
                        showPage(el.pageNewChat);
                    }
                });
                document.getElementById('btnWelcomeLiliAvatar')?.addEventListener('click', () => {
                    chatState.directAiMode = true;
                    if (window.ChatWidgetLogin.guestSession?.nama) {
                        showPage(el.pageRoom);
                        if (!el.chatMessages.children.length) {
                            startAiKepegawaianMode();
                        } else {
                            scrollToBottom(false);
                        }
                    } else {
                        showPage(el.pageNewChat);
                    }
                });
                document.getElementById('btnOpenTicket')?.addEventListener('click', () => showPage(el.pageTicket));
                document.getElementById('backHome1')?.addEventListener('click', () => showPage(el.pageHome));
                document.getElementById('backHome2')?.addEventListener('click', () => showPage(el.pageHome));

                // Submit Form Cek Tiket di Tab Baru
                el.formDrawerCekUsulan?.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    const ticketNo = el.inputDrawerTiketUsulan?.value?.trim();
                    if (!ticketNo) return;

                    const btn = document.getElementById('btnCekTiketTabBaru');
                    const normalSpan = btn?.querySelector('.cek-normal');
                    const loadingSpan = btn?.querySelector('.cek-loading');
                    const feedback = el.drawerCekTiketFeedback;

                    if (btn) btn.disabled = true;
                    if (normalSpan) normalSpan.classList.add('d-none');
                    if (loadingSpan) loadingSpan.classList.remove('d-none');
                    if (feedback) {
                        feedback.className = 'small mt-2 text-primary';
                        feedback.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Memeriksa nomor tiket...';
                        feedback.classList.remove('d-none');
                    }

                    try {
                        const res = await apiRequest('/guest-bot/cek-tiket', 'POST', { no_tiket: ticketNo });
                        if (res.status === 'found') {
                            if (feedback) {
                                feedback.className = 'small mt-2 text-success fw-semibold';
                                feedback.innerHTML = '<i data-feather="check-circle" class="me-1"></i> Nomor tiket ditemukan! Membuka halaman tiket di tab baru...';
                                if (window.feather) feather.replace();
                            }
                            const targetUrl = res.data.url_detail || ('/cek-tiket/' + encodeURIComponent(res.data.no_tiket));
                            window.open(targetUrl, '_blank');
                        } else {
                            if (feedback) {
                                feedback.className = 'small mt-2 text-danger fw-semibold';
                                feedback.innerHTML = '<i data-feather="alert-circle" class="me-1"></i> Nomor tiket tidak ditemukan. Pastikan nomor tiket sudah benar.';
                                if (window.feather) feather.replace();
                            }
                        }
                    } catch (err) {
                        if (feedback) {
                            feedback.className = 'small mt-2 text-danger fw-semibold';
                            feedback.innerHTML = '<i data-feather="alert-circle" class="me-1"></i> Nomor tiket tidak ditemukan.';
                            if (window.feather) feather.replace();
                        }
                    } finally {
                        if (btn) btn.disabled = false;
                        if (normalSpan) normalSpan.classList.remove('d-none');
                        if (loadingSpan) loadingSpan.classList.add('d-none');
                    }
                });

                const btnToggleExpand = document.getElementById('btnToggleExpandChat');
                if (btnToggleExpand) {
                    btnToggleExpand.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const chatDrawer = document.getElementById('chatDrawer');
                        if (!chatDrawer) return;
                        const isExpanded = chatDrawer.classList.toggle('is-expanded');
                        const icon = isExpanded ? 'minimize-2' : 'maximize-2';
                        btnToggleExpand.innerHTML = `<i data-feather="${icon}"></i>`;
                        if (window.feather) feather.replace();
                    });
                }

                const btnPlayLiliVoice = document.getElementById('btnPlayLiliVoice');
                if (btnPlayLiliVoice) {
                    btnPlayLiliVoice.addEventListener('click', function (e) {
                        e.stopPropagation();
                        playLiliVoiceGreeting();
                    });
                }
            }

            function bindNipLookup() {
                el.guestNip?.addEventListener('input', function () {
                    el.guestNama.value = '';
                    el.guestUnitKerja.value = '';
                    el.nipError.classList.add('d-none');
                });

                el.btnCariNip?.addEventListener('click', async function () {
                    const nip = el.guestNip.value.trim();
                    el.nipError.classList.add('d-none');

                    if (nip.length !== 18) {
                        el.nipError.innerHTML = '<i data-feather="alert-circle" style="width:13px;height:13px;" class="me-1"></i> NIP harus terdiri dari 18 digit angka';
                        el.nipError.classList.remove('d-none');
                        if (window.feather) feather.replace();
                        return;
                    }

                    try {
                        el.btnCariNip.disabled = true;
                        el.nipLoading.classList.remove('d-none');

                        const res = await apiRequest(`/guest-chat/pegawai/${nip}`);
                        el.nipLoading.classList.add('d-none');
                        el.guestNama.value = res.nama || '';
                        el.guestUnitKerja.value = res.unit_kerja || '';
                        if (el.guestEmail && res.email) {
                            el.guestEmail.value = res.email;
                        }
                    } catch (e) {
                        el.nipLoading.classList.add('d-none');
                        el.guestNama.value = '';
                        el.guestUnitKerja.value = '';
                        if (el.guestEmail) el.guestEmail.value = '';

                        const errMsg = e.message || 'Data pegawai tidak ditemukan.';
                        const icon = (errMsg.toLowerCase().includes('api') || errMsg.toLowerCase().includes('koneksi') || errMsg.toLowerCase().includes('server') || errMsg.toLowerCase().includes('offline')) 
                            ? 'wifi-off' 
                            : 'alert-circle';

                        el.nipError.innerHTML = `<i data-feather="${icon}" style="width:13px;height:13px;" class="me-1"></i> ${errMsg}`;
                        el.nipError.classList.remove('d-none');
                        if (window.feather) feather.replace();
                    } finally {
                        el.btnCariNip.disabled = false;
                    }
                });
            }

            // MULAI PERCAKAPAN (WAJIB TERVERIFIKASI DARI SIMPEG)
            function bindStartConversation() {
                document.getElementById('btnStartChat')?.addEventListener('click', function () {
                    const nip = el.guestNip.value.trim();
                    const nama = el.guestNama.value.trim();
                    const email = el.guestEmail.value.trim();

                    if (!nip || !nama) {
                        alert('Silakan masukkan dan verifikasi NIP Anda terlebih dahulu untuk memulai percakapan.');
                        el.guestNip.focus();
                        return;
                    }

                    if (!email) {
                        alert('Silakan lengkapi alamat email aktif Anda terlebih dahulu.');
                        el.guestEmail.focus();
                        return;
                    }

                    window.ChatWidgetLogin.guestSession = {
                        nip,
                        nama,
                        unit_kerja: el.guestUnitKerja.value.trim(),
                        email,
                        bidang_id: '',
                        layanan_id: ''
                    };

                    el.conversationId.value = '';
                    showPage(el.pageRoom);
                    el.roomTicketNo.innerHTML = '-';
                    el.chatMessages.innerHTML = '';

                    enableSound();

                    // Jika pengguna masuk dari klik Avatar LILI, langsung masuk ke mode AI LILI (tanpa 3 opsi menu)
                    if (chatState.directAiMode) {
                        startAiKepegawaianMode();
                        chatState.directAiMode = false;
                    } else {
                        // Tampilkan Menu Utama Chat Bot (3 Opsi)
                        showBotMainMenu();
                    }
                });
            }

            // BUKA TIKET PERCAKAPAN (RESUME)
            function bindResumeConversation() {
                document.getElementById('btnOpenConversation')?.addEventListener('click', async function () {
                    const btn = this;
                    const originalHtml = btn.innerHTML;
                    const email = el.guestTicketEmail.value.trim();
                    const noTiket = el.guestTicket.value.trim();

                    if (!email || !noTiket) {
                        alert("Email dan nomor tiket wajib diisi");
                        return;
                    }

                    btn.disabled = true;
                    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Membuka Percakapan...`;

                    try {
                        const result = await apiRequest("/guest-chat/resume", "POST", { email, no_tiket: noTiket });

                        chatState.conversationId = result.conversation_id;
                        el.conversationId.value = result.conversation_id;
                        window.ChatWidgetLogin.guestSession = { nama: result.guest_name, email };
                        chatState.email = email;
                        chatState.ticket = result.ticket_number;
                        chatState.botMode = 'live_admin';

                        el.roomTicketNo.innerHTML = escapeHtml(result.ticket_number);
                        updateChatStatus(result.status);
                        
                        // Tampilkan dropdown menu titik 3 & ubah header ke mode tiket
                        const roomDropdown = document.getElementById('roomActionDropdownWrap');
                        if (roomDropdown) {
                            roomDropdown.classList.remove('d-none');
                        }
                        document.getElementById('roomBotHeaderWrap')?.classList.add('d-none');
                        document.getElementById('roomTicketHeaderWrap')?.classList.remove('d-none');

                        showPage(el.pageRoom);

                        await loadGuestMessages(result.conversation_id, email);
                        startPolling();
                    } catch (error) {
                        console.error(error);
                        alert(error.message);
                    } finally {
                        btn.disabled = false;
                        btn.innerHTML = originalHtml;
                        feather.replace();
                        enableSound();
                    }
                });
            }

            // SEND MESSAGE
            function bindSendMessage() {
                async function handleSendMessage() {
                    const message = el.messageInput.value.trim();
                    if (!message) return;

                    // 1. Jika bot sedang menunggu input nomor tiket
                    if (chatState.botMode === 'awaiting_ticket') {
                        handleBotTicketSearch(message);
                        return;
                    }

                    // 2. Jika sedang dalam mode Tanya AI Kepegawaian
                    if (chatState.botMode === 'ai_kepegawaian') {
                        handleAiKepegawaianMessage(message);
                        return;
                    }

                    // 3. Jika user mengetik pesan bebas saat berada di menu bot lainnya (bukan di sesi live admin)
                    if (chatState.botMode !== 'live_admin') {
                        handleFreeformBotMessage(message);
                        return;
                    }

                    // 4. Jika sesi live admin aktif
                    if (el.sendButton) el.sendButton.disabled = true;

                    try {
                        let conversationId = await createConversationIfNeeded();
                        await sendGuestMessage(conversationId, message);

                        appendMessage({
                            senderName: "Saya",
                            message,
                            createdAt: new Date().toISOString(),
                            isGuest: true
                        });

                        clearMessageInput();
                    } catch (error) {
                        console.error(error);
                        alert(error.message);
                        if (el.sendButton) el.sendButton.disabled = false;
                    }
                }

                el.sendButton?.addEventListener("click", handleSendMessage);
            }

            // HANDLER TUTUP / AKHIRI PERCAKAPAN
            function handleExitChatSession() {
                if (chatState.ticket) {
                    const keluar = confirm(
                        `Apakah Anda yakin ingin mengakhiri sesi chat ini?\n\n` +
                        `Nomor Tiket Anda (${chatState.ticket}) telah tersimpan dan dapat dibuka kembali sewaktu-waktu melalui menu "Sudah Punya Tiket".`
                    );
                    if (!keluar) return false;
                    resetGuestSession();
                    showPage(el.pageHome);
                    return true;
                }
                // Jika sedang dalam percakapan AI atau bot (tanpa tiket aktif),
                // pertahankan riwayat pesan dan session agar pengguna bisa kembali tanpa kehilangan chat!
                showPage(el.pageHome);
                return true;
            }

            function bindRoomHeaderActions() {
                document.getElementById('btnBackInbox')?.addEventListener('click', function (e) {
                    e.preventDefault();
                    handleExitChatSession();
                });

                document.getElementById('closeChatDrawer')?.addEventListener('click', function (e) {
                    if (chatState.ticket) {
                        const confirmed = handleExitChatSession();
                        if (!confirmed) {
                            e.stopImmediatePropagation();
                            document.getElementById('chatDrawer')?.classList.add('show');
                        }
                    }
                });
                
                document.getElementById('menuActionEndChat')?.addEventListener('click', function (e) {
                    e.preventDefault();
                    handleExitChatSession();
                });

                document.getElementById('menuActionCopyTicket')?.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (!chatState.ticket) return;
                    navigator.clipboard.writeText(chatState.ticket).then(() => {
                        alert(`Nomor Tiket ${chatState.ticket} berhasil disalin!`);
                    }).catch(() => {
                        alert(`Nomor Tiket: ${chatState.ticket}`);
                    });
                });

                document.getElementById('btnResetGuestLiliChat')?.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (confirm('Mulai obrolan baru dengan LILI? Riwayat percakapan saat ini akan dibersihkan.')) {
                        startAiKepegawaianMode(true);
                    }
                });
            }

            function bindEmojiPicker() {
                const emojiBtn = document.getElementById('chatEmojiBtn');
                const emojiPicker = document.getElementById('chatEmojiPicker');
                const closePickerBtn = document.getElementById('closeEmojiPicker');

                if (emojiBtn) {
                    emojiBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        if (!emojiPicker) return;
                        emojiPicker.classList.toggle('d-none');
                        if (!emojiPicker.classList.contains('d-none') && window.feather) {
                            feather.replace();
                        }
                    });
                }

                if (closePickerBtn) {
                    closePickerBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        emojiPicker?.classList.add('d-none');
                    });
                }

                // Delegasi klik emoji item & click-outside
                document.addEventListener('click', function (e) {
                    const emojiItem = e.target.closest('.emoji-item');
                    if (emojiItem) {
                        e.stopPropagation();
                        const emoji = emojiItem.getAttribute('data-emoji') || emojiItem.innerText.trim();
                        const input = el.messageInput || document.getElementById('chatInput');
                        if (input) {
                            const start = input.selectionStart || input.value.length;
                            const end = input.selectionEnd || input.value.length;
                            const text = input.value;
                            input.value = text.substring(0, start) + emoji + text.substring(end);
                            input.focus();
                            input.selectionStart = input.selectionEnd = start + emoji.length;

                            const isClosed = el.chatStatusBadge?.innerText?.trim().toLowerCase() === 'closed';
                            const hasText = input.value.trim().length > 0;
                            if (el.sendButton) {
                                el.sendButton.disabled = isClosed || !hasText;
                            }
                        }
                        return;
                    }

                    if (emojiPicker && !emojiPicker.classList.contains('d-none')) {
                        if (!e.target.closest('#chatEmojiPicker') && !e.target.closest('#chatEmojiBtn')) {
                            emojiPicker.classList.add('d-none');
                        }
                    }
                });
            }

            bindKeyboardEvents();
            bindNavigationEvents();
            bindNipLookup();
            bindStartConversation();
            bindResumeConversation();
            bindSendMessage();
            bindRoomHeaderActions();
            bindEmojiPicker();

            // =========================================================
            // CONVERSATION & FIREBASE SYNC
            // =========================================================

            async function createConversationIfNeeded() {
                let conversationId = el.conversationId.value;
                if (conversationId) return conversationId;

                const loaderId = 'ticket_prep_loader';
                const loaderEl = document.createElement('div');
                loaderEl.id = loaderId;
                loaderEl.className = 'bot-message-wrapper my-2';
                loaderEl.innerHTML = `
                    <div class="bot-bubble d-flex align-items-center gap-2 py-2 px-3" style="background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;font-size:12.5px;border-radius:12px;">
                        <span class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
                        <span class="fw-semibold">Menyiapkan tiket obrolan &amp; menghubungkan ke Admin BKPSDM...</span>
                    </div>
                `;
                el.chatMessages.appendChild(loaderEl);
                el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

                if (el.messageInput) el.messageInput.disabled = true;
                if (el.sendButton) el.sendButton.disabled = true;

                try {
                    if (!window.ChatWidgetLogin.guestSession) {
                        window.ChatWidgetLogin.guestSession = {
                            nip: el.guestNip?.value?.trim() || '',
                            nama: el.guestNama?.value?.trim() || 'Tamu',
                            unit_kerja: el.guestUnitKerja?.value?.trim() || '',
                            email: el.guestEmail?.value?.trim() || '',
                            bidang_id: '',
                            layanan_id: ''
                        };
                    }

                    if (!window.ChatWidgetLogin.guestSession.layanan_id) {
                        const fallbackLayanan = el.layanan?.value || (window._allLayananData && window._allLayananData[0]?.id);
                        if (fallbackLayanan) {
                            window.ChatWidgetLogin.guestSession.layanan_id = parseInt(fallbackLayanan) || fallbackLayanan;
                        }
                    }

                    if (!window.ChatWidgetLogin.guestSession.email) {
                        const fallbackEmail = el.guestEmail?.value?.trim();
                        if (fallbackEmail) {
                            window.ChatWidgetLogin.guestSession.email = fallbackEmail;
                        } else {
                            const promptedEmail = prompt("Silakan masukkan alamat email aktif Anda untuk menerima nomor tiket & riwayat percakapan:");
                            if (promptedEmail && promptedEmail.trim()) {
                                window.ChatWidgetLogin.guestSession.email = promptedEmail.trim();
                            }
                        }
                    }

                    const result = await apiRequest("/guest-chat/start", "POST", window.ChatWidgetLogin.guestSession);

                    conversationId = result.conversation_id;
                    chatState.conversationId = conversationId;
                    el.conversationId.value = conversationId;
                    chatState.email = window.ChatWidgetLogin.guestSession.email;
                    chatState.ticket = result.no_tiket;
                    el.roomTicketNo.innerHTML = escapeHtml(result.no_tiket);

                    // Tampilkan menu titik tiga di header room & ubah header ke mode tiket
                    const roomDropdown = document.getElementById('roomActionDropdownWrap');
                    if (roomDropdown) {
                        roomDropdown.classList.remove('d-none');
                    }
                    document.getElementById('roomBotHeaderWrap')?.classList.add('d-none');
                    document.getElementById('roomTicketHeaderWrap')?.classList.remove('d-none');

                    document.getElementById(loaderId)?.remove();

                    const ticketBanner = document.createElement('div');
                    ticketBanner.className = 'ticket-card-banner mb-3 p-3';
                    ticketBanner.innerHTML = `
                        <div class="d-flex align-items-center justify-content-between mb-1">
                            <span class="ticket-card-badge">
                                <i data-feather="tag"></i>
                                Tiket Percakapan
                            </span>
                            <button type="button" class="btn btn-sm copy-ticket-btn" id="copyTicketBtn" title="Salin nomor tiket">
                                <i data-feather="copy"></i>
                                <span>Salin</span>
                            </button>
                        </div>
                        <div class="ticket-card-number font-monospace" id="ticketNumberText">${escapeHtml(result.no_tiket)}</div>
                        <div class="ticket-card-desc">
                            Nomor tiket telah dikirim ke email Anda. Harap simpan nomor tiket ini untuk melanjutkan percakapan di kemudian hari.
                        </div>
                    `;
                    el.chatMessages.appendChild(ticketBanner);
                    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
                    if (window.feather) feather.replace();

                    startPolling();
                    return conversationId;
                } finally {
                    document.getElementById(loaderId)?.remove();
                    if (el.messageInput) el.messageInput.disabled = false;
                }
            }

            async function sendGuestMessage(conversationId, message) {
                return await apiRequest(`/guest-chat/${conversationId}/message`, "POST", {
                    email: chatState.email,
                    message
                });
            }

            async function loadGuestMessages(conversationId, email) {
                const result = await apiRequest(`/guest-chat/${conversationId}/messages?email=${encodeURIComponent(email)}`);
                el.chatMessages.innerHTML = '';

                result.messages.forEach(msg => {
                    const isGuest = msg.sender_guest_id !== null;
                    appendMessage({
                        senderName: isGuest ? "Saya" : (msg.sender_user?.nama || "Admin"),
                        message: msg.message,
                        createdAt: msg.created_at,
                        isGuest
                    });
                });
            }

            // Render pesan menggunakan styling chat-bubble standar PILKB (Hanya nama saja, tanpa badge bidang)
            function appendMessage({ senderName, message, createdAt, isGuest }) {
                if (!el.chatMessages) return;

                const row = document.createElement('div');
                row.className = `message-row ${isGuest ? 'me' : 'other'}`;

                row.innerHTML = `
                    <div class="message-wrapper">
                        <div class="message-info ${isGuest ? 'me' : 'other'}">
                            <span class="sender-name">${escapeHtml(shortName(senderName))}</span>
                            <span class="message-dot">•</span>
                            <span class="message-time">${formatChatTime(createdAt)}</span>
                        </div>
                        <div class="message-bubble ${isGuest ? 'me' : 'other'}">${escapeHtml(message)}</div>
                    </div>
                `;

                el.chatMessages.appendChild(row);
                el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
                if (window.feather) feather.replace();
            }

            // FIREBASE REALTIME SUBSCRIPTION
            let _guestSubscribedTime = 0;
            function subscribeGuestChannel(ticketNo) {
                if (!ticketNo || !window.FirebaseDB) return;
                _guestSubscribedTime = Date.now();

                try {
                    window.FirebaseDB.ref(`guest_conversations/${ticketNo}/last_message`)
                        .on('value', (snapshot) => {
                            const data = snapshot.val();
                            if (data && data.messageData && (data.sent_at || 0) >= (_guestSubscribedTime - 1000)) {
                                if (data.messageData.sender_user_id) {
                                    appendMessage({
                                        senderName: data.messageData.sender_name || "Admin",
                                        message: data.messageData.message,
                                        createdAt: data.messageData.created_at,
                                        isGuest: false
                                    });
                                    playNotificationSound();
                                }
                            }
                        });

                    window.FirebaseDB.ref(`guest_conversations/${ticketNo}/status`)
                        .on('value', (snapshot) => {
                            const data = snapshot.val();
                            if (data && data.status) {
                                updateChatStatus(data.status);
                            }
                        });
                } catch (err) {
                    console.warn('Firebase guest listener error:', err);
                }
            }

            function unsubscribeGuestChannel() {}

            function startPolling() {
                if (chatState.ticket) {
                    subscribeGuestChannel(chatState.ticket);
                }
            }

            function stopPolling() {
                unsubscribeGuestChannel();
                if (chatState.pollingId) {
                    clearInterval(chatState.pollingId);
                }
                chatState.isPolling = false;
            }

            // Interactive Action Chip Prompt Trigger (LILI AI)
            document.addEventListener('click', function (e) {
                const chipPrompt = e.target.closest('.chip-prompt');
                if (chipPrompt) {
                    e.preventDefault();
                    const prompt = chipPrompt.getAttribute('data-ai-prompt');
                    if (prompt && typeof handleAiKepegawaianMessage === 'function') {
                        handleAiKepegawaianMessage(prompt);
                    }
                }
            });

            // Privacy Policy Modal Trigger for LILI AI
            document.addEventListener('click', function (e) {
                const btnPrivacy = e.target.closest('#btnOpenLiliPrivacy');
                if (btnPrivacy) {
                    e.preventDefault();
                    const modalEl = document.getElementById('modalLiliPrivacy');
                    if (modalEl && window.bootstrap) {
                        const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
                        modal.show();
                    }
                }
            });

            // Copy Ticket Button
            document.addEventListener('click', function (e) {
                const btn = e.target.closest('#copyTicketBtn');
                if (!btn) return;

                const ticketText = document.getElementById('ticketNumberText')?.innerText?.trim();
                if (!ticketText) return;

                navigator.clipboard.writeText(ticketText).then(() => {
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = `<i data-feather="check"></i> <span>Disalin!</span>`;
                    btn.classList.add('btn-success');
                    if (window.feather) feather.replace();

                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.classList.remove('btn-success');
                        if (window.feather) feather.replace();
                    }, 2000);
                }).catch(() => {
                    alert('Nomor tiket: ' + ticketText);
                });
            });
        }
    };
})(window);