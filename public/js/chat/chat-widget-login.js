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
                botMode: 'main_menu', // 'main_menu', 'info_menu', 'awaiting_ticket', 'selecting_bidang', 'selecting_layanan', 'selecting_admin_layanan', 'live_admin'
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
                pageNewChat: document.getElementById('pageNewChat'),
                pageTicket: document.getElementById('pageTicket'),
                pageRoom: document.getElementById('pageRoom'),

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
                el.pageNewChat,
                el.pageTicket,
                el.pageRoom
            ];

            // Show Page helper
            function showPage(activePage) {
                pages.forEach(page => {
                    if (page) page.classList.add('d-none');
                });

                if (activePage) activePage.classList.remove('d-none');
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
                if (el.roomSubtitle) {
                    el.roomSubtitle.innerText = 'Pusat Bantuan PILKB (Guest)';
                }

                window.ChatWidgetLogin.guestSession = null;
            }

            function clearMessageInput() {
                if (el.messageInput) {
                    el.messageInput.value = "";
                    el.messageInput.style.height = "auto";
                }
                if (el.sendButton) {
                    el.sendButton.disabled = true;
                }
            }

            // =========================================================
            // CHATBOT INTERACTIVE ENGINE
            // =========================================================

            function appendBotMessageHtml(htmlContent) {
                if (!el.chatMessages) return;
                const wrapper = document.createElement('div');
                wrapper.innerHTML = htmlContent;
                el.chatMessages.appendChild(wrapper.firstElementChild || wrapper);
                el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
                if (window.feather) feather.replace();
            }

            // Render gelembung pesan user menggunakan styling standar bubble PILKB (.message-row.me)
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
                el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
            }

            // 1. Menu Utama Bot
            function showBotMainMenu() {
                chatState.botMode = 'main_menu';
                if (el.messageInput) {
                    el.messageInput.placeholder = "Pilih opsi di atas atau ketik pesan...";
                }
                if (el.roomSubtitle) {
                    el.roomSubtitle.innerHTML = '<span class="text-primary fw-semibold"><i data-feather="cpu" style="width:12px;height:12px;" class="me-1"></i>Asisten Virtual BKPSDM</span>';
                }

                const guestName = window.ChatWidgetLogin.guestSession?.nama ? escapeHtml(shortName(window.ChatWidgetLogin.guestSession.nama)) : 'Bapak/Ibu';

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="cpu"></i> Asisten Virtual PILKB
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Halo <strong>${guestName}</strong>, Selamat Datang di Layanan Bantuan Virtual BKPSDM Kabupaten Buleleng.</p>
                            <p class="mb-0 text-muted small">Anda dapat memilih opsi menu yang dibutuhkan di bawah ini:</p>
                            
                            <div class="bot-options-grid">
                                <button type="button" class="bot-btn-option" data-bot-action="menu_info">
                                    <i data-feather="info" class="text-primary"></i>
                                    <span>1. ℹ️ Informasi</span>
                                </button>
                                <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                    <i data-feather="message-circle"></i>
                                    <span>2. 💬 Tanya Admin / Konsultasi</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
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
                                    <span>a. 🔍 Cek Status Tiket</span>
                                </button>
                                <button type="button" class="bot-btn-option" data-bot-action="cek_syarat">
                                    <i data-feather="file-text" class="text-success"></i>
                                    <span>b. 📋 Cek Syarat Layanan</span>
                                </button>
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                    <i data-feather="arrow-left"></i>
                                    <span>↩️ Kembali ke Menu Utama</span>
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
                    el.messageInput.placeholder = "Ketik nomor tiket Anda lalu tekan Enter...";
                    el.messageInput.focus();
                }

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="cpu"></i> Asisten Virtual PILKB
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Silakan ketikkan <strong>Nomor Tiket</strong> Anda pada kolom pesan di bawah lalu tekan Kirim (Enter).</p>
                            <p class="mb-0 text-muted small fst-italic">Contoh: TKT-20260831-001</p>
                            
                            <div class="bot-options-grid mt-2">
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_info_menu">
                                    <i data-feather="arrow-left"></i>
                                    <span>↩️ Kembali ke Menu Informasi</span>
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
                                    
                                    <div class="bot-options-grid">
                                        <a href="${d.url_detail}" target="_blank" class="bot-btn-option text-decoration-none">
                                            <i data-feather="external-link" class="text-primary"></i>
                                            <span>🌐 Buka Halaman Detail Tiket</span>
                                        </a>
                                        <button type="button" class="bot-btn-option" data-bot-action="cek_tiket">
                                            <i data-feather="search"></i>
                                            <span>🔍 Cek Tiket Lain</span>
                                        </button>
                                        <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                            <i data-feather="message-circle"></i>
                                            <span>💬 Tanya Admin Terkait Tiket Ini</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                            <i data-feather="arrow-left"></i>
                                            <span>↩️ Menu Utama</span>
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
                                    <p class="text-muted small mb-0">Silakan pastikan format nomor tiket sudah sesuai, atau tanyakan langsung ke Admin FO.</p>
                                    
                                    <div class="bot-options-grid">
                                        <button type="button" class="bot-btn-option" data-bot-action="cek_tiket">
                                            <i data-feather="rotate-cw"></i>
                                            <span>🔄 Coba Masukkan Tiket Lain</span>
                                        </button>
                                        <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                            <i data-feather="message-circle"></i>
                                            <span>💬 Tanya Admin FO</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                            <i data-feather="arrow-left"></i>
                                            <span>↩️ Menu Utama</span>
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

            // 4. Sub-Flow b: Cek Syarat Layanan (Pilih Bidang)
            async function loadBotBidangOptions() {
                chatState.botMode = 'selecting_bidang';
                appendUserMessageHtml("b. Cek Syarat Layanan");

                const loadingId = 'bot_loading_' + Date.now();
                appendBotMessageHtml(`
                    <div class="bot-message-wrapper" id="${loadingId}">
                        <div class="bot-bubble text-muted small">
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            Memuat daftar bidang & layanan...
                        </div>
                    </div>
                `);

                try {
                    const bidangList = await apiRequest('/guest-bot/bidang-layanan');
                    document.getElementById(loadingId)?.remove();
                    window._botBidangData = bidangList;

                    let buttonsHtml = '';
                    bidangList.forEach(b => {
                        buttonsHtml += `
                            <button type="button" class="bot-btn-option" data-bot-action="select_bidang" data-bidang-id="${b.id}">
                                <i data-feather="folder" class="text-primary"></i>
                                <span>${escapeHtml(b.nama_bidang)}</span>
                            </button>
                        `;
                    });

                    buttonsHtml += `
                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_info_menu">
                            <i data-feather="arrow-left"></i>
                            <span>↩️ Kembali</span>
                        </button>
                    `;

                    const html = `
                        <div class="bot-message-wrapper">
                            <div class="bot-badge-header">
                                <i data-feather="cpu"></i> Asisten Virtual PILKB
                            </div>
                            <div class="bot-bubble">
                                <p class="mb-2">Silakan pilih <strong>Bidang</strong> tujuan layanan yang ingin Anda cek persyaratannya:</p>
                                <div class="bot-options-grid">
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

            // 4.1 Pilih Layanan di Bidang Tersebut (Untuk Cek Syarat)
            function loadBotLayananOptions(bidangId) {
                chatState.botMode = 'selecting_layanan';
                const bidang = (window._botBidangData || []).find(b => String(b.id) === String(bidangId));
                if (!bidang) return;

                appendUserMessageHtml(`Bidang: ${bidang.nama_bidang}`);

                let buttonsHtml = '';
                if (bidang.layanan && bidang.layanan.length > 0) {
                    bidang.layanan.forEach(l => {
                        buttonsHtml += `
                            <button type="button" class="bot-btn-option" data-bot-action="select_layanan" data-layanan-id="${l.id}">
                                <i data-feather="file-text" class="text-success"></i>
                                <span>${escapeHtml(l.nama_layanan)}</span>
                            </button>
                        `;
                    });
                } else {
                    buttonsHtml += `<p class="text-muted small mb-2">Belum ada layanan aktif pada bidang ini.</p>`;
                }

                buttonsHtml += `
                    <button type="button" class="bot-btn-option secondary" data-bot-action="cek_syarat">
                        <i data-feather="arrow-left"></i>
                        <span>↩️ Pilih Bidang Lain</span>
                    </button>
                `;

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="cpu"></i> Asisten Virtual PILKB
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Pilih <strong>Layanan</strong> pada <em>${escapeHtml(bidang.nama_bidang)}</em>:</p>
                            <div class="bot-options-grid">
                                ${buttonsHtml}
                            </div>
                        </div>
                    </div>
                `;
                appendBotMessageHtml(html);
            }

            // 4.2 Tampilkan Persyaratan Layanan Lengkap
            async function loadBotSyaratLayanan(layananId) {
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
                        const d = res.data;
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
                                    
                                    <div class="bot-options-grid">
                                        <a href="${d.pdf_url}" target="_blank" class="bot-btn-option text-decoration-none">
                                            <i data-feather="download" class="text-primary"></i>
                                            <span>📄 Unduh Format PDF Persyaratan</span>
                                        </a>
                                        <button type="button" class="bot-btn-option" data-bot-action="cek_syarat">
                                            <i data-feather="grid"></i>
                                            <span>📋 Cek Layanan Lain</span>
                                        </button>
                                        <button type="button" class="bot-btn-option primary" data-bot-action="menu_admin_pilih_layanan">
                                            <i data-feather="message-circle"></i>
                                            <span>💬 Tanya Admin Terkait Layanan Ini</span>
                                        </button>
                                        <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                            <i data-feather="arrow-left"></i>
                                            <span>↩️ Menu Utama</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        appendBotMessageHtml(html);
                    }
                } catch (err) {
                    document.getElementById(loadingId)?.remove();
                    console.error(err);
                }
            }

            // 5. PILIH LAYANAN SAJA UNTUK TANYA ADMIN / KONSULTASI
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
                            <span>↩️ Kembali ke Menu Utama</span>
                        </button>
                    `;

                    const html = `
                        <div class="bot-message-wrapper">
                            <div class="bot-badge-header">
                                <i data-feather="help-circle" class="text-primary"></i> Pilih Layanan Konsultasi
                            </div>
                            <div class="bot-bubble">
                                <p class="mb-2">Silakan pilih <strong>Layanan</strong> yang ingin Anda tanyakan atau konsultasikan dengan Admin FO:</p>
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
            function activateAdminChatForLayanan(layananId, bidangId, layananName) {
                chatState.botMode = 'live_admin';
                appendUserMessageHtml(`Layanan: ${layananName}`);

                if (window.ChatWidgetLogin.guestSession) {
                    window.ChatWidgetLogin.guestSession.layanan_id = layananId;
                    window.ChatWidgetLogin.guestSession.bidang_id = bidangId || '';
                }

                if (el.roomSubtitle) {
                    el.roomSubtitle.innerHTML = `<span class="text-primary fw-semibold"><i data-feather="user-check" style="width:12px;height:12px;" class="me-1"></i>Tanya Admin: ${escapeHtml(layananName)}</span>`;
                }

                if (el.messageInput) {
                    el.messageInput.placeholder = `Tulis pertanyaan tentang ${layananName}...`;
                    el.messageInput.focus();
                }

                const html = `
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <i data-feather="headphones" class="text-success"></i> Terhubung ke Tanya Admin FO
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">Anda terhubung dengan layanan Tanya Admin FO untuk <strong>${escapeHtml(layananName)}</strong>.</p>
                            <p class="mb-2">Silakan ketik pertanyaan atau kendala Anda pada kolom pesan di bawah. Sistem akan <strong>otomatis membuat nomor tiket resmi</strong> begitu pesan pertama Anda terkirim.</p>
                            <p class="mb-0 text-muted small fst-italic">Admin FO kami siap merespons percakapan Anda.</p>
                            
                            <div class="bot-options-grid mt-2">
                                <button type="button" class="bot-btn-option secondary" data-bot-action="back_main_menu">
                                    <i data-feather="cpu"></i>
                                    <span>🤖 Buka Menu Bot</span>
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
                    case 'menu_admin_pilih_layanan':
                        showAdminLayananPicker();
                        break;
                    case 'pilih_layanan_admin':
                        const lId = btn.getAttribute('data-layanan-id');
                        const bId = btn.getAttribute('data-bidang-id');
                        const lName = btn.getAttribute('data-layanan-name');
                        activateAdminChatForLayanan(lId, bId, lName);
                        break;
                    case 'cek_tiket':
                        promptTicketInput();
                        break;
                    case 'cek_syarat':
                        loadBotBidangOptions();
                        break;
                    case 'select_bidang':
                        const bidangId = btn.getAttribute('data-bidang-id');
                        loadBotLayananOptions(bidangId);
                        break;
                    case 'select_layanan':
                        const layananId = btn.getAttribute('data-layanan-id');
                        loadBotSyaratLayanan(layananId);
                        break;
                    case 'back_main_menu':
                        showBotMainMenu();
                        break;
                    case 'back_info_menu':
                        showBotInfoMenu();
                        break;
                }
            });

            // =========================================================
            // NAVIGATION & FORM LOOKUPS
            // =========================================================

            function bindNavigationEvents() {
                document.getElementById('btnNewChat')?.addEventListener('click', () => showPage(el.pageNewChat));
                document.getElementById('btnOpenTicket')?.addEventListener('click', () => showPage(el.pageTicket));
                document.getElementById('backHome1')?.addEventListener('click', () => showPage(el.pageHome));
                document.getElementById('backHome2')?.addEventListener('click', () => showPage(el.pageHome));
            }

            function bindNipLookup() {
                el.btnCariNip?.addEventListener('click', async function () {
                    const nip = el.guestNip.value.trim();
                    el.nipError.classList.add('d-none');

                    if (nip.length !== 18) {
                        el.nipError.innerHTML = 'NIP harus terdiri dari 18 digit';
                        el.nipError.classList.remove('d-none');
                        return;
                    }

                    try {
                        el.btnCariNip.disabled = true;
                        el.nipLoading.classList.remove('d-none');

                        const res = await apiRequest(`/guest-chat/pegawai/${nip}`);
                        el.nipLoading.classList.add('d-none');
                        el.guestNama.value = res.nama;
                        el.guestUnitKerja.value = res.unit_kerja;
                    } catch (e) {
                        el.nipLoading.classList.add('d-none');
                        el.guestNama.value = '';
                        el.guestUnitKerja.value = '';
                        el.nipError.innerHTML = 'NIP tidak ditemukan';
                        el.nipError.classList.remove('d-none');
                    } finally {
                        el.btnCariNip.disabled = false;
                    }
                });
            }

            // MULAI PERCAKAPAN (MASUK KE BOT DENGAN DATA DIRI SAJA)
            function bindStartConversation() {
                document.getElementById('btnStartChat')?.addEventListener('click', function () {
                    const nama = el.guestNama.value.trim();
                    const email = el.guestEmail.value.trim();

                    if (!nama || !email) {
                        alert('Silakan lengkapi data nama dan email Anda terlebih dahulu.');
                        return;
                    }

                    window.ChatWidgetLogin.guestSession = {
                        nip: el.guestNip.value.trim(),
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

                    // Tampilkan Menu Utama Chat Bot!
                    showBotMainMenu();
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

                    // 2. Jika sesi live admin (atau user mengirim pesan bebas)
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

            document.getElementById('btnBackInbox')?.addEventListener('click', function () {
                const keluar = confirm('Anda akan menutup sesi chat. Lanjutkan?');
                if (!keluar) return;
                resetGuestSession();
                showPage(el.pageHome);
            });

            bindKeyboardEvents();
            bindNavigationEvents();
            bindNipLookup();
            bindStartConversation();
            bindResumeConversation();
            bindSendMessage();

            // =========================================================
            // CONVERSATION & FIREBASE SYNC
            // =========================================================

            async function createConversationIfNeeded() {
                let conversationId = el.conversationId.value;
                if (conversationId) return conversationId;

                const result = await apiRequest("/guest-chat/start", "POST", window.ChatWidgetLogin.guestSession);

                conversationId = result.conversation_id;
                chatState.conversationId = conversationId;
                el.conversationId.value = conversationId;
                chatState.email = window.ChatWidgetLogin.guestSession.email;
                chatState.ticket = result.no_tiket;
                el.roomTicketNo.innerHTML = escapeHtml(result.no_tiket);

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
                el.chatMessages.prepend(ticketBanner);
                if (window.feather) feather.replace();

                startPolling();
                return conversationId;
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
                        isGuest,
                        senderRole: msg.sender_role,
                        senderRoleLabel: msg.sender_role_label
                    });
                });
            }

            // Render pesan menggunakan styling chat-bubble standar PILKB
            function appendMessage({ senderName, message, createdAt, isGuest, senderRole = null, senderRoleLabel = null }) {
                if (!el.chatMessages) return;

                const row = document.createElement('div');
                row.className = `message-row ${isGuest ? 'me' : 'other'}`;

                let roleBadgeHtml = '';
                if (!isGuest && senderRole) {
                    const roleClass = senderRole === 'fo' ? 'badge-fo' : (senderRole === 'bidang' ? 'badge-bidang' : 'badge-opd');
                    const roleText = senderRoleLabel || (senderRole === 'fo' ? 'FO' : (senderRole === 'bidang' ? 'Bidang' : 'OPD'));
                    roleBadgeHtml = `<span class="chat-role-badge ${roleClass} ms-1" style="font-size:10px;padding:1px 5px;"><i data-feather="user-check" style="width:10px;height:10px;"></i>${roleText}</span>`;
                }

                row.innerHTML = `
                    <div class="message-wrapper">
                        <div class="message-info ${isGuest ? 'me' : 'other'}">
                            <span class="sender-name">${escapeHtml(shortName(senderName))}</span>
                            ${roleBadgeHtml}
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
                                        isGuest: false,
                                        senderRole: data.messageData.sender_role,
                                        senderRoleLabel: data.messageData.sender_role_label
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