/**
 * PILKB Dedicated WhatsApp Web Style Chat Controller
 */
(function (window, $) {
    "use strict";

    window.ChatPageApp = {
        activeConversationId: null,
        activeConversationStatus: 'open',
        activeConversationData: null,
        conversationsData: [],
        isUserSubscribed: false,
        isSelectionMode: false,
        selectedConversationIds: new Set(),
        renderedMessageIds: new Set(),
        lastMessageId: null,
        notificationSound: null,
        liliAiHistory: [],
        savedLiliChatHtml: '',
        isLiliAiLoading: false,
        hasPlayedLiliVoice: false,
        cachedRooms: new Map(),
        roomScrollTops: new Map(),

        init() {
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });

            this.notificationSound = new Audio('/sound/notification.mp3');
            this.notificationSound.preload = 'auto';

            this.loadConversations();
            this.subscribeUserChannel();
            this.bindEvents();
        },

        playNotificationSound() {
            const now = Date.now();
            if (now - (window._lastGlobalChatSoundTime || 0) < 1200) {
                return;
            }
            window._lastGlobalChatSoundTime = now;

            if (this.notificationSound) {
                this.notificationSound.pause();
                this.notificationSound.currentTime = 0;
                this.notificationSound.play().catch(() => {});
            }
        },

        subscribeUserChannel() {
            if (!window.ChatAuth?.id || this.isUserSubscribed) return;
            this.isUserSubscribed = true;
            this._userSubscribedTime = Date.now();

            // 1. Firebase Listener
            if (window.FirebaseDB) {
                try {
                    window.FirebaseDB.ref(`users/${window.ChatAuth.id}/last_event`)
                        .on('value', (snapshot) => {
                            const data = snapshot.val();
                            if (data && data.messageData) {
                                const isLive = (data.sent_at || 0) >= (this._userSubscribedTime - 1000);
                                if (isLive) {
                                    this.handleIncomingMessageForUser(data);
                                }
                            }
                        });
                } catch (err) {}
            }
        },

        // Mark room as read on server, lalu sync badge floating
        markRoomRead(conversationId) {
            if (!conversationId) return;
            $.post(`/chat/${conversationId}/mark-read`).done(() => {
                if (window.ChatWidgetApp) {
                    window.ChatWidgetApp.loadUnreadBadge();
                }
            });
        },

        handleIncomingMessageForUser(e) {
            const conv = e.conversationData;
            if (!conv || !conv.id) return;

            const isActiveRoom = Number(this.activeConversationId) === Number(conv.id);
            const isFromMe = Number(e.messageData?.sender_user_id) === Number(window.ChatAuth?.id);

            const existingIndex = this.conversationsData.findIndex(item => Number(item.id) === Number(conv.id));
            if (existingIndex !== -1) {
                const item = this.conversationsData[existingIndex];
                item.last_message = conv.last_message;
                item.last_message_time = conv.last_message_time;
                item.status = conv.status;
                item.is_last_from_me = isFromMe;
                if (!isActiveRoom) {
                    item.unread = (item.unread || 0) + 1;
                }
                this.conversationsData.splice(existingIndex, 1);
                this.conversationsData.unshift(item);
            } else {
                this.conversationsData.unshift({
                    id: conv.id,
                    no_tiket: conv.no_tiket,
                    status: conv.status,
                    nama_pengirim: conv.nama_pengirim,
                    sender_role: conv.sender_role,
                    sender_role_label: conv.sender_role_label,
                    layanan: conv.layanan,
                    bidang: conv.bidang,
                    last_message: conv.last_message,
                    last_message_time: conv.last_message_time,
                    unread: isActiveRoom ? 0 : 1,
                    type: conv.type,
                    need_reply: conv.need_reply,
                    is_last_from_me: isFromMe
                });
            }

            const q = $('#waSearchConversations').val();
            if (q) {
                this.filterConversations(q);
            } else {
                this.renderConversationListItems(this.conversationsData);
            }

            // Jika user sedang berada di dalam room ini, langsung append pesan baru
            if (isActiveRoom) {
                if (!isFromMe) {
                    this.appendNewMessages([e.messageData]);
                    this.markRoomRead(conv.id);
                    this.hideTypingIndicator();
                }
            } else {
                // Jika room ada di background tapi sudah di-cache di memori, selipkan pesan baru tanpa merusak scroll
                if (this.cachedRooms.has(Number(conv.id))) {
                    const cached = this.cachedRooms.get(Number(conv.id));
                    if (e.messageData && !cached.renderedMessageIds.has(e.messageData.id)) {
                        cached.renderedMessageIds.add(e.messageData.id);
                        cached.$bucket.append(this.renderMessageItem(e.messageData));
                        cached.lastMessageId = e.messageData.id;
                    }
                }
                // Mainkan suara secara debounced jika bukan room yang sedang aktif
                this.playNotificationSound();
            }
        },

        subscribeRoomChannel(conversationId) {
            if (!conversationId) return;
            this._roomSubscribedTime = Date.now();

            const handleRoomMessage = (msgData) => {
                if (!msgData) return;
                if (Number(msgData.sender_user_id) !== Number(window.ChatAuth?.id)) {
                    this.appendNewMessages([msgData]);
                    this.markRoomRead(conversationId);
                    this.hideTypingIndicator();
                }
            };

            const handleStatusChange = (status) => {
                this.activeConversationStatus = status;
                this.updateChatInput(status);
                const isClosed = status === 'closed';
                $('#waRoomStatusBadge')
                    .removeClass('open closed')
                    .addClass(isClosed ? 'closed' : 'open')
                    .text(isClosed ? 'Closed' : 'Open');

                if (isClosed) {
                    $('#waLiCloseChat, #waBtnCloseChat').addClass('d-none').hide();
                    $('#waLiReopenChat, #waBtnReopenChat').removeClass('d-none').show();
                    $('#waChatClosedNotice').removeClass('d-none');
                } else {
                    $('#waLiCloseChat, #waBtnCloseChat').removeClass('d-none').show();
                    $('#waLiReopenChat, #waBtnReopenChat').addClass('d-none').hide();
                    $('#waChatClosedNotice').addClass('d-none');
                }
            };

            // 1. Firebase Room Listeners
            if (window.FirebaseDB) {
                try {
                    window.FirebaseDB.ref(`conversations/${conversationId}/last_message`)
                        .on('value', (snapshot) => {
                            const val = snapshot.val();
                            if (val && val.messageData) {
                                const isLive = (val.sent_at || 0) >= (this._roomSubscribedTime - 1000);
                                if (isLive) {
                                    handleRoomMessage(val.messageData);
                                }
                            }
                        });

                    window.FirebaseDB.ref(`conversations/${conversationId}/status`)
                        .on('value', (snapshot) => {
                            const val = snapshot.val();
                            if (val && val.status) {
                                handleStatusChange(val.status);
                            }
                        });

                    window.FirebaseDB.ref(`conversations/${conversationId}/typing`)
                        .on('value', (snapshot) => {
                            const typingUsers = snapshot.val();
                            if (typingUsers) {
                                const now = Date.now();
                                Object.keys(typingUsers).forEach((uid) => {
                                    if (Number(uid) !== Number(window.ChatAuth?.id)) {
                                        const userObj = typingUsers[uid];
                                        if (userObj && (now - (userObj.time || 0) < 4000)) {
                                            this.showTypingIndicator(userObj.name);
                                        }
                                    }
                                });
                            }
                        });
                } catch (err) {}
            }
        },

        whisperTyping() {
            if (!this.activeConversationId || !window.ChatAuth?.id) return;
            const now = Date.now();
            if (now - (this._lastWhisperTime || 0) < 1500) return;
            this._lastWhisperTime = now;

            if (window.FirebaseDB) {
                try {
                    const typingRef = window.FirebaseDB.ref(`conversations/${this.activeConversationId}/typing/${window.ChatAuth.id}`);
                    typingRef.set({
                        name: window.ChatAuth.name || 'Pengguna',
                        time: now
                    });
                    typingRef.onDisconnect().remove();
                } catch (err) {}
            }
        },

        showTypingIndicator(name) {
            const subtitleEl = $('#waRoomSubtitle');
            if (subtitleEl.length) {
                if (!this._originalSubtitle) {
                    this._originalSubtitle = subtitleEl.text();
                }
                subtitleEl.html('<span class="text-success fw-semibold fst-italic"><i data-feather="edit-2" style="width:11px;height:11px;" class="me-1"></i>sedang mengetik...</span>');
                if (window.feather) feather.replace();
            }

            const stream = $('#waMessagesBox');
            if (stream.length && !$('#waChatTypingBubble').length) {
                stream.append(`
                    <div class="chat-typing-bubble" id="waChatTypingBubble">
                        <div class="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                `);
                stream.scrollTop(stream[0].scrollHeight);
            }

            if (this._typingTimer) {
                clearTimeout(this._typingTimer);
            }
            this._typingTimer = setTimeout(() => {
                this.hideTypingIndicator();
            }, 3500);
        },

        hideTypingIndicator() {
            if (this._typingTimer) {
                clearTimeout(this._typingTimer);
                this._typingTimer = null;
            }
            $('#waChatTypingBubble').remove();
            if (this._originalSubtitle) {
                $('#waRoomSubtitle').text(this._originalSubtitle);
                this._originalSubtitle = null;
            }
        },

        escapeHtml(text) {
            return String(text ?? '')
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        shortName(name) {
            if (!name) return 'Unknown';
            return String(name).split(',')[0].trim();
        },

        getInitials(name) {
            if (!name) return 'U';
            const cleanName = this.shortName(name).trim();
            const words = cleanName.split(/\s+/);
            if (words.length >= 2) {
                return (words[0][0] + words[1][0]).toUpperCase();
            }
            return cleanName.substring(0, 2).toUpperCase();
        },

        formatChatTime(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
            const jam = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

            if (diffDays === 0) return `Hari ini ${jam}`;
            if (diffDays === 1) return `Kemarin ${jam}`;
            return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + jam;
        },

        // Load Conversation List
        loadConversations() {
            const role = window.ChatAuth?.role || '';
            const url = (role === 'admin_bawah' || role === 'bidang') ? '/chat/admin/inbox' : '/chat/my-conversations';

            $.get(url)
                .done((res) => {
                    this.conversationsData = Array.isArray(res) ? res : [];
                    this.renderConversationList(this.conversationsData);
                })
                .fail((xhr) => {
                    console.error('Gagal memuat percakapan:', xhr.responseText);
                    $('#waConvList').html(`
                        <div class="text-center text-danger p-4">
                            <i data-feather="alert-circle" class="mb-2" style="width:28px;height:28px;"></i>
                            <div>Gagal memuat percakapan.</div>
                        </div>
                    `);
                    if (window.feather) feather.replace();
                });
        },

        // Render Conversation List Items
        renderConversationList(items, searchTerm = '') {
            const list = $('#waConvList');
            const totalCount = $('#waTotalCountBadge');

            if (!list.length) return;

            if (this.conversationsData.length > 0) {
                totalCount.text(`${this.conversationsData.length} Chat`).removeClass('d-none');
            } else {
                totalCount.addClass('d-none');
            }

            const qClean = String(searchTerm || '').toLowerCase().trim();
            const showLili = !qClean || 'lili'.includes(qClean) || 'ai'.includes(qClean) || 'asisten'.includes(qClean);
            const isLiliActive = this.activeConversationId === 'lili_ai';

            const liliPinnedHtml = `
                <div class="wa-conv-item wa-conv-item-lili ${isLiliActive ? 'active' : ''}" id="waBtnOpenLiliFromList">
                    <div class="wa-item-avatar position-relative" style="background: transparent; box-shadow: none;">
                        <img src="/images/lili-avatar.png" alt="LILI" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #6366f1; box-shadow: 0 2px 6px rgba(99,102,241,0.25);">
                        <span class="lili-verified-badge badge-md" title="Terverifikasi (Asisten Virtual Resmi)">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10.5" fill="#25D366" stroke="#ffffff" stroke-width="2"/>
                                <path d="M7.5 12.2L10.5 15.2L16.8 8.8" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div class="wa-item-body">
                        <div class="wa-item-top">
                            <div class="d-flex align-items-center gap-1 overflow-hidden">
                                <span class="chat-role-badge badge-ai">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap" style="vertical-align: middle; margin-right: 2px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>ASISTEN VIRTUAL
                                </span>
                            </div>
                            <span class="wa-item-time" style="color: #10b981; font-weight: 600; font-size: 11.5px;">
                                <span style="display:inline-block; width:6px; height:6px; background:#10b981; border-radius:50%; margin-right:4px; vertical-align:middle;"></span>Online
                            </span>
                        </div>
                        <div class="wa-item-title" title="LILI - Asisten Virtual Kepegawaian">
                            LILI - Asisten Virtual Kepegawaian
                        </div>
                        <div class="wa-item-sub">
                            Konsultasi regulasi ASN &amp; panduan layanan kepegawaian
                        </div>
                        <div class="wa-item-preview" style="color: #4f46e5; font-weight: 600;">
                            Klik untuk mulai konsultasi bersama LILI →
                        </div>
                    </div>
                </div>
            `;

            if (!items.length) {
                let emptyContent = '';
                if (searchTerm) {
                    emptyContent = `
                        <div class="p-4 text-center text-muted">
                            <i data-feather="search" class="mb-2" style="width:28px;height:28px;opacity:0.5;"></i>
                            <div class="fw-semibold">Tidak Ditemukan</div>
                            <div class="small">Tidak ada chat dengan kata kunci "${this.escapeHtml(searchTerm)}"</div>
                        </div>
                    `;
                } else {
                    emptyContent = `
                        <div class="p-4 text-center text-muted">
                            <i data-feather="message-square" class="mb-2" style="width:32px;height:32px;opacity:0.5;"></i>
                            <div class="fw-semibold">Belum Ada Percakapan</div>
                            <div class="small mb-3">Klik tombol Cari Tiket untuk memulai obrolan baru.</div>
                            <button class="btn btn-primary btn-sm chat-btn-rounded" id="btnOpenSearchModal">
                                <i data-feather="search" class="me-1"></i> Cari Tiket
                            </button>
                        </div>
                    `;
                }
                list.html((showLili ? liliPinnedHtml : '') + emptyContent);
                if (window.feather) feather.replace();
                return;
            }

            let html = showLili ? liliPinnedHtml : '';
            items.forEach((item) => {
                const isUnread = Number(item.unread) > 0;
                const isActive = Number(item.id) === Number(this.activeConversationId);
                const isSelected = this.selectedConversationIds.has(Number(item.id));
                const avatarText = this.getInitials(item.nama_pengirim);
                const senderName = this.escapeHtml(this.shortName(item.nama_pengirim));
                const formattedTime = item.last_message_time ? this.formatChatTime(item.last_message_time) : '';
                const lastMsg = this.escapeHtml(item.last_message || 'Belum ada pesan');
                const prefixMe = item.is_last_from_me ? '<span class="text-primary fw-semibold me-1">Anda:</span>' : '';
                const subTitle = item.layanan ? this.escapeHtml(item.layanan) : (item.bidang ? this.escapeHtml(item.bidang) : '');
                const role = item.sender_role || (item.type === 'guest' ? 'tamu' : 'opd');
                const roleLabel = item.sender_role_label || (role === 'tamu' ? 'Tamu' : 'OPD');
                const roleIcon = role === 'tamu' ? 'user' : (role === 'bidang' ? 'layers' : (role === 'fo' ? 'user-check' : 'briefcase'));
                const roleBadge = `<span class="chat-role-badge badge-${role}"><i data-feather="${roleIcon}"></i>${roleLabel}</span>`;

                let ticketTag = '';
                if (item.no_tiket) {
                    ticketTag = `<span class="chat-item-ticket"><i data-feather="tag"></i>${this.escapeHtml(item.no_tiket)}</span>`;
                }

                let unreadBadge = '';
                if (isUnread) {
                    unreadBadge = `<span class="wa-unread-badge">${item.unread > 99 ? '99+' : item.unread}</span>`;
                }

                html += `
                    <div class="wa-conv-item ${isActive ? 'active' : ''} ${isUnread ? 'unread-item' : ''} ${isSelected ? 'selected' : ''}" data-id="${item.id}">
                        <div class="chat-item-select ${this.isSelectionMode ? '' : 'd-none'}">
                            <input class="form-check-input conversation-checkbox wa-item-checkbox" type="checkbox" data-id="${item.id}" value="${item.id}" ${isSelected ? 'checked' : ''}>
                        </div>
                        <div class="wa-item-avatar">
                            ${avatarText}
                        </div>
                        <div class="wa-item-body">
                            <div class="wa-item-top">
                                <div class="d-flex align-items-center gap-1 overflow-hidden">
                                    ${roleBadge}
                                    ${ticketTag}
                                </div>
                                <span class="wa-item-time">${formattedTime}</span>
                            </div>
                            <div class="wa-item-title" title="${senderName}">
                                ${senderName}
                            </div>
                            ${subTitle ? `<div class="wa-item-sub">${subTitle}</div>` : ''}
                            <div class="wa-item-preview ${isUnread ? 'unread' : ''}">
                                ${prefixMe}${lastMsg}
                            </div>
                        </div>
                        <div class="d-flex align-items-center ms-1">
                            ${unreadBadge}
                        </div>
                    </div>
                `;
            });

            list.html(html);
            if (window.feather) feather.replace();
        },

        filterConversations(query) {
            if (!this.conversationsData || !this.conversationsData.length) return;
            const q = String(query || '').trim().toLowerCase();
            if (!q) {
                this.renderConversationList(this.conversationsData);
                return;
            }

            const filtered = this.conversationsData.filter(item => {
                const ticket = String(item.no_tiket || '').toLowerCase();
                const sender = String(item.nama_pengirim || '').toLowerCase();
                const layanan = String(item.layanan || '').toLowerCase();
                const bidang = String(item.bidang || '').toLowerCase();
                const lastMsg = String(item.last_message || '').toLowerCase();
                return ticket.includes(q) || sender.includes(q) || layanan.includes(q) || bidang.includes(q) || lastMsg.includes(q);
            });

            this.renderConversationList(filtered, query);
        },

        // Save current active room scroll & state
        saveCurrentRoomState() {
            if (!this.activeConversationId) return;
            const box = $('#waMessagesBox');
            if (!box.length) return;
            const scrollPos = box.scrollTop();
            this.roomScrollTops.set(String(this.activeConversationId), scrollPos);

            if (this.activeConversationId === 'lili_ai') {
                const $liliBucket = box.find('#waBucket_lili_ai');
                if ($liliBucket.length) {
                    this.savedLiliChatHtml = $liliBucket.html();
                }
            } else if (this.cachedRooms.has(Number(this.activeConversationId))) {
                const cached = this.cachedRooms.get(Number(this.activeConversationId));
                cached.scrollTop = scrollPos;
            }
        },

        // Open LILI AI Dedicated Room
        openLiliAiRoom(reset = false) {
            this.hideTypingIndicator();
            this.stopPolling();
            this.saveCurrentRoomState();

            this.activeConversationId = 'lili_ai';
            this.activeConversationStatus = 'open';

            // Highlight in list
            $('.wa-conv-item').removeClass('active');
            $('#waBtnOpenLiliFromList').addClass('active');

            // Show mobile room panel
            $('.wa-main').addClass('show-room');
            $('#waEmptyState').addClass('d-none');
            $('#waActiveRoom').removeClass('d-none');

            // Render Room Header for LILI
            $('#waRoomAvatar').html(`
                <div class="position-relative d-inline-block" style="width: 38px; height: 38px;">
                    <img src="/images/lili-avatar.png" alt="LILI" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #6366f1;">
                    <span class="lili-verified-badge badge-sm" title="Terverifikasi">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10.5" fill="#25D366" stroke="#ffffff" stroke-width="2"/>
                            <path d="M7.5 12.2L10.5 15.2L16.8 8.8" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </div>
            `);
            $('#waRoomTitle').text('LILI - Asisten Virtual Kepegawaian');
            $('#waRoomSubtitle').text('Layanan Informasi & Literasi Kepegawaian');
            $('#waRoomRoleBadge').html('');
            $('#waRoomTicketBadge').addClass('d-none');
            $('#waRoomStatusBadge').addClass('d-none');

            // Dropdown Menu options
            $('#waLiResetLili').removeClass('d-none').show();
            $('#waLiCloseChat, #waLiReopenChat').addClass('d-none').hide();
            $('#waChatClosedNotice').addClass('d-none');

            // Input Textarea
            $('#waChatInput')
                .prop('disabled', false)
                .attr('placeholder', 'Tanya apa saja seputar kepegawaian kepada LILI...')
                .val('')
                .css('height', '44px');
            $('#waSendMessage').prop('disabled', true);
            $('#waChatEmojiBtn').prop('disabled', false);

            const box = $('#waMessagesBox');
            // Sembunyikan semua bucket percakapan tiket
            box.find('.wa-room-bucket').addClass('d-none');

            let $liliBucket = box.find('#waBucket_lili_ai');
            if (reset && $liliBucket.length) {
                $liliBucket.remove();
                $liliBucket = $();
                this.savedLiliChatHtml = '';
                this.liliAiHistory = [];
                this.roomScrollTops.delete('lili_ai');
            }

            if (!$liliBucket.length) {
                $liliBucket = $(`<div class="wa-room-bucket" id="waBucket_lili_ai" data-conv-id="lili_ai"></div>`);
                box.append($liliBucket);

                const greetingUser = window.ChatAuth?.name
                    ? `Halo, Bapak/Ibu <strong>${this.escapeHtml(window.ChatAuth.name)}</strong>${(window.ChatAuth.ukerja || window.ChatAuth.nama_ukerja) ? ' (' + this.escapeHtml(window.ChatAuth.ukerja || window.ChatAuth.nama_ukerja) + ')' : ''}! 👋`
                    : 'Halo Rekan ASN! 👋';

                $liliBucket.html(`
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <img src="/images/lili-avatar.png" alt="LILI" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                            <span class="fw-bold">LILI - Asisten Virtual</span>
                        </div>
                        <div class="bot-bubble">
                            <p class="mb-2">
                                ${greetingUser} Saya <strong>LILI</strong>, Asisten Virtual Kepegawaian BKPSDM Kabupaten Buleleng.
                            </p>
                            <p class="mb-3">
                                Saya siap membantu Anda memberikan literasi regulasi kepegawaian ASN, persyaratan layanan (Kenaikan Pangkat, Cuti, Mutasi, Pensiun, Karis/Karsu), serta unduhan dokumen persyaratan resmi.
                            </p>
                            <p class="small text-muted mb-2 fw-semibold">Pilih topik pertanyaan di bawah atau ketik di kolom pesan:</p>
                            <div class="ai-action-chips d-flex flex-wrap gap-2 pt-1">
                                <button type="button" class="ai-action-chip chip-prompt" data-prompt="Syarat Kenaikan Pangkat Reguler">
                                    <span>Syarat Kenaikan Pangkat</span>
                                </button>
                                <button type="button" class="ai-action-chip chip-prompt" data-prompt="Syarat Pengusulan Cuti Melahirkan">
                                    <span>Syarat Cuti Melahirkan</span>
                                </button>
                                <button type="button" class="ai-action-chip chip-prompt" data-prompt="Syarat Pensiun BUP">
                                    <span>Syarat Pensiun BUP</span>
                                </button>
                                <button type="button" class="ai-action-chip chip-prompt" data-prompt="Bagaimana Alur Pengusulan Karis/Karsu?">
                                    <span>Alur Karis / Karsu</span>
                                </button>
                                <button type="button" class="ai-action-chip chip-prompt" data-prompt="Bagaimana pengajuan izin belajar atau tugas belajar?">
                                    <span>Izin / Tugas Belajar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `);
                box.scrollTop(box[0].scrollHeight);
            } else {
                $liliBucket.removeClass('d-none');
                const savedPos = this.roomScrollTops.get('lili_ai');
                if (savedPos != null) {
                    box.scrollTop(savedPos);
                }
            }

            // Langsung putar suara sapaan LILI hanya saat pertama kali dibuka (session)
            if (!this.hasPlayedLiliVoice) {
                this.playLiliVoiceGreeting();
                this.hasPlayedLiliVoice = true;
            }

            if (window.feather) feather.replace();
        },

        playLiliVoiceGreeting() {
            if (!this._liliVoiceAudio) {
                this._liliVoiceAudio = new Audio('/sound/lili-greeting.mp3');
            }
            this._liliVoiceAudio.currentTime = 0;
            this._liliVoiceAudio.play().catch(e => console.log('Autoplay audio blocked:', e));
        },

        formatLiliAiReply(text) {
            let safe = this.escapeHtml(text);
            safe = safe.replace(/\*\*([^*\n\r]+?)\*\*/g, '<strong>$1</strong>');
            safe = safe.replace(/_([^_\n\r]+?)_/g, '<em>$1</em>');
            safe = safe.replace(/\[(.*?)\]\((.*?)\)/g, (match, title, url) => {
                const cleanUrl = url.trim();
                if (/^(https?:\/\/|\/|mailto:)/i.test(cleanUrl)) {
                    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${title}</a>`;
                }
                return title;
            });
            safe = safe.replace(/\n/g, '<br>');
            return safe;
        },

        sendLiliAiMessage(customPrompt = null) {
            const input = $('#waChatInput');
            const message = customPrompt || input.val().trim();
            if (!message || this.isLiliAiLoading) return;

            input.val('').css('height', '44px');
            $('#waSendMessage').prop('disabled', true);

            const nowIso = new Date().toISOString();
            const box = $('#waMessagesBox');
            let targetBucket = box.find('#waBucket_lili_ai');
            if (!targetBucket.length) {
                targetBucket = box;
            }

            // 1. Render User Message Bubble
            targetBucket.append(this.renderMessageItem({
                id: 'lili_user_' + Date.now(),
                sender_user_id: window.ChatAuth?.id,
                sender_name: window.ChatAuth?.name,
                message: message,
                created_at: nowIso
            }));

            this.liliAiHistory = this.liliAiHistory || [];
            this.liliAiHistory.push({ role: 'user', content: message });

            // 2. Render Loading Indicator Bubble
            this.isLiliAiLoading = true;
            const loadingId = 'lili_loading_' + Date.now();
            targetBucket.append(`
                <div class="bot-message-wrapper" id="${loadingId}">
                    <div class="bot-badge-header">
                        <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                        <span>LILI - Asisten Virtual</span>
                    </div>
                    <div class="bot-bubble">
                        <div class="d-flex align-items-center gap-2 text-primary" style="font-size: 12.5px;">
                            <span class="spinner-border spinner-border-sm" style="width: 14px; height: 14px; color: #6366f1;"></span>
                            <span style="color: #4f46e5;">LILI sedang menganalisis regulasi &amp; panduan layanan...</span>
                        </div>
                    </div>
                </div>
            `);

            box.scrollTop(box[0].scrollHeight);

            // 3. Send Ajax request to /guest-bot/tanya-ai
            $.ajax({
                url: '/guest-bot/tanya-ai',
                type: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Accept': 'application/json'
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    pertanyaan: message,
                    history: this.liliAiHistory.slice(-6)
                })
            })
            .done((res) => {
                $(`#${loadingId}`).remove();
                this.isLiliAiLoading = false;

                const replyText = res.reply || 'Maaf, LILI tidak dapat memproses pertanyaan saat ini.';
                this.liliAiHistory.push({ role: 'assistant', content: replyText });

                const formattedReply = this.formatLiliAiReply(replyText);

                // Lampirkan Action Chips (PDF, Tiket, Konsultasi Bidang)
                let actionChipsHtml = '';
                const actionsList = res.actions || res.action_chips || [];
                if (Array.isArray(actionsList) && actionsList.length > 0) {
                    actionChipsHtml += '<div class="ai-action-chips d-flex flex-wrap gap-2 my-2 pt-1">';
                    actionsList.forEach(action => {
                        if (action.type === 'pdf') {
                            actionChipsHtml += `
                                <a href="${this.escapeHtml(action.url)}" target="_blank" class="ai-action-chip chip-pdf">
                                    <i data-feather="file-text" style="width:13px;height:13px;"></i>
                                    <span>${this.escapeHtml(action.label)}</span>
                                </a>
                            `;
                        } else if (action.type === 'ticket') {
                            actionChipsHtml += `
                                <a href="${this.escapeHtml(action.url)}" target="_blank" class="ai-action-chip chip-ticket">
                                    <i data-feather="search" style="width:13px;height:13px;"></i>
                                    <span>${this.escapeHtml(action.label)}</span>
                                </a>
                            `;
                        } else if (action.type === 'admin') {
                            const userRole = (window.ChatAuth && window.ChatAuth.role) ? window.ChatAuth.role : '';
                            // Hanya Admin OPD yang dapat berkonsultasi ke Admin Bidang. Admin Bidang tidak menampilkan tombol konsultasi ini.
                            if (userRole === 'admin_opd') {
                                actionChipsHtml += `
                                    <div class="ai-action-chip chip-admin" id="waChipConsultAdmin">
                                        <i data-feather="briefcase" style="width:13px;height:13px;"></i>
                                        <span>${this.escapeHtml(action.label)}</span>
                                    </div>
                                `;
                            }
                        } else if (action.type === 'prompt' || action.action === 'send_prompt') {
                            actionChipsHtml += `
                                <button type="button" class="ai-action-chip chip-prompt" data-prompt="${this.escapeHtml(action.prompt || action.label)}">
                                    <span>${this.escapeHtml(action.label)}</span>
                                </button>
                            `;
                        }
                    });
                    actionChipsHtml += '</div>';
                }

                targetBucket.append(`
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                            <span>LILI - Asisten Virtual</span>
                        </div>
                        <div class="bot-bubble">
                            <div class="ai-reply-content mb-2">${formattedReply}</div>
                            ${actionChipsHtml}
                            <div class="ai-bubble-toolbar">
                                <button type="button" class="btn-copy-ai" title="Salin Jawaban LILI">
                                    <i data-feather="copy" style="width:12px;height:12px;"></i>
                                    <span class="copy-label">Salin</span>
                                </button>
                                <div class="ai-feedback-actions">
                                    <span class="ai-feedback-label">Membantu?</span>
                                    <button type="button" class="btn-ai-rate rate-up" title="Jawaban Membantu">
                                        <i data-feather="thumbs-up" style="width:12px;height:12px;"></i>
                                    </button>
                                    <button type="button" class="btn-ai-rate rate-down" title="Jawaban Kurang Sesuai">
                                        <i data-feather="thumbs-down" style="width:12px;height:12px;"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                this.savedLiliChatHtml = targetBucket.html();

                if (window.feather) {
                    feather.replace();
                }

                box.scrollTop(box[0].scrollHeight);
            })
            .fail((xhr) => {
                $(`#${loadingId}`).remove();
                this.isLiliAiLoading = false;

                let errText = 'Mohon maaf, terjadi kendala saat menghubungi server AI. Silakan coba kembali sesaat lagi.';
                try {
                    const errJson = JSON.parse(xhr.responseText);
                    if (errJson.message) errText = errJson.message;
                } catch (e) {}

                targetBucket.append(`
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px;">
                            <span>LILI - Asisten Virtual</span>
                        </div>
                        <div class="bot-bubble" style="border-color: #fecaca; background: #fff5f5;">
                            <p class="mb-0 text-danger"><i data-feather="alert-circle" style="width:13px;height:13px;" class="me-1"></i>${this.escapeHtml(errText)}</p>
                        </div>
                    </div>
                `);

                if (window.feather) {
                    feather.replace();
                }

                box.scrollTop(box[0].scrollHeight);
            });
        },

        // Open Room (Pola WhatsApp Web: Render Sekali, Multi-Room Bucket Cache, Scroll Preservation)
        openConversation(conversationId) {
            conversationId = Number(conversationId);
            this.hideTypingIndicator();
            this.saveCurrentRoomState();

            this.activeConversationId = conversationId;

            // Highlight in list
            $('.wa-conv-item').removeClass('active');
            $('#waBtnOpenLiliFromList').removeClass('active');
            $(`.wa-conv-item[data-id="${conversationId}"]`).addClass('active');

            // Hide LILI reset from menu
            $('#waLiResetLili').addClass('d-none').hide();

            // Show mobile room panel
            $('.wa-main').addClass('show-room');
            $('#waEmptyState').addClass('d-none');
            $('#waActiveRoom').removeClass('d-none');

            const box = $('#waMessagesBox');

            // Sembunyikan semua bucket percakapan yang ada
            box.find('.wa-room-bucket').addClass('d-none');

            // Cek apakah room ini SUDAH PERNAH DI-RENDER (In-Memory Cache)
            if (this.cachedRooms.has(conversationId)) {
                const cached = this.cachedRooms.get(conversationId);
                this.activeConversationStatus = cached.res.status || 'open';
                this.activeConversationData = cached.res;
                this.renderedMessageIds = cached.renderedMessageIds;
                this.lastMessageId = cached.lastMessageId;

                this.renderRoomHeader(cached.res);
                this.updateChatInput(cached.res.status);

                // Tampilkan bucket yang sudah ada tanpa re-render (0ms)
                cached.$bucket.removeClass('d-none');

                // Kembalikan posisi scroll persis di tempat pengguna tinggalkan
                const savedPos = this.roomScrollTops.get(String(conversationId));
                if (savedPos != null) {
                    box.scrollTop(savedPos);
                } else {
                    box.scrollTop(box[0].scrollHeight);
                }

                // Update unread in local state & DOM without full list re-render
                const found = this.conversationsData.find(i => Number(i.id) === Number(conversationId));
                if (found && found.unread > 0) {
                    found.unread = 0;
                    $(`#conv_${conversationId}`).find('.wa-item-unread').remove();
                }
                this.markRoomRead(conversationId);
                return;
            }

            // Jika belum di-cache, tampilkan skeleton sementara & fetch sekali dari server
            const skeletonId = 'wa_skeleton_' + conversationId;
            box.append(`
                <div id="${skeletonId}" class="chat-skeleton-wrapper p-4">
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                </div>
            `);

            $.get(`/chat/${conversationId}/messages`)
                .done((res) => {
                    $(`#${skeletonId}`).remove();
                    this.activeConversationStatus = res.status || 'open';
                    this.activeConversationData = res;
                    this.renderRoomHeader(res);
                    this.updateChatInput(res.status);

                    // Buat bucket permanen untuk percakapan ini
                    const $bucket = $(`<div class="wa-room-bucket" id="waBucket_${conversationId}" data-conv-id="${conversationId}"></div>`);
                    box.append($bucket);

                    const renderedIds = new Set();
                    let lastMsgId = null;

                    const messages = res.messages || [];
                    if (!messages.length) {
                        $bucket.html(`
                            <div class="text-center text-muted my-auto p-4">
                                <div class="wa-date-pill mb-2">Mulai Percakapan</div>
                                <p class="small">Kirim pesan pertama Anda di bawah ini.</p>
                            </div>
                        `);
                    } else {
                        let batchHtml = '';
                        messages.forEach((msg) => {
                            renderedIds.add(msg.id);
                            batchHtml += this.renderMessageItem(msg);
                            lastMsgId = msg.id;
                        });
                        $bucket.html(batchHtml);
                    }

                    this.renderedMessageIds = renderedIds;
                    this.lastMessageId = lastMsgId;

                    // Simpan di cache
                    this.cachedRooms.set(conversationId, {
                        $bucket: $bucket,
                        res: res,
                        renderedMessageIds: renderedIds,
                        lastMessageId: lastMsgId
                    });

                    this.subscribeRoomChannel(conversationId);

                    // Set scroll awal ke paling bawah
                    box.scrollTop(box[0].scrollHeight);
                    this.roomScrollTops.set(String(conversationId), box[0].scrollHeight);

                    // Update unread in local state & DOM without full list re-render
                    const found = this.conversationsData.find(i => Number(i.id) === Number(conversationId));
                    if (found && found.unread > 0) {
                        found.unread = 0;
                        $(`#conv_${conversationId}`).find('.wa-item-unread').remove();
                    }
                    this.markRoomRead(conversationId);
                })
                .fail((xhr) => {
                    $(`#${skeletonId}`).remove();
                    console.error('Gagal memuat pesan:', xhr.responseText);
                    box.append(`
                        <div class="text-center text-danger p-4">
                            <i data-feather="alert-circle" class="mb-2" style="width:28px;height:28px;"></i>
                            <div>Gagal memuat ruang percakapan.</div>
                        </div>
                    `);
                    if (window.feather) feather.replace();
                });
        },

        renderRoomHeader(res) {
            const isClosed = res.status === 'closed';
            const ticketNo = res.ticket_number || '';
            const senderName = this.escapeHtml(this.shortName(res.nama_pengirim || 'Pengguna'));
            const subTitle = res.layanan || (res.bidang || 'Pusat Bantuan PILKB');
            const avatarText = this.getInitials(res.nama_pengirim);

            $('#waRoomAvatar').text(avatarText);
            $('#waRoomTitle').text(senderName);
            $('#waRoomSubtitle').text(subTitle);

            const role = res.sender_role || (res.type === 'guest' ? 'tamu' : 'opd');
            const roleLabel = res.sender_role_label || (role === 'tamu' ? 'Tamu' : 'OPD');
            const roleIcon = role === 'tamu' ? 'user' : (role === 'bidang' ? 'layers' : (role === 'fo' ? 'user-check' : 'briefcase'));
            $('#waRoomRoleBadge').html(`<span class="chat-role-badge badge-${role}"><i data-feather="${roleIcon}"></i>${roleLabel}</span>`);

            if (ticketNo && ticketNo !== '-') {
                $('#waRoomTicketNo').text(ticketNo);
                $('#waRoomTicketBadge').removeClass('d-none');
            } else {
                $('#waRoomTicketBadge').addClass('d-none');
            }

            $('#waRoomStatusBadge')
                .removeClass('d-none open closed')
                .removeAttr('style')
                .addClass(isClosed ? 'closed' : 'open')
                .text(isClosed ? 'Closed' : 'Open');

            if (isClosed) {
                $('#waLiCloseChat, #waBtnCloseChat').addClass('d-none').hide();
                $('#waLiReopenChat, #waBtnReopenChat').removeClass('d-none').show();
                $('#waChatClosedNotice').removeClass('d-none');
            } else {
                $('#waLiCloseChat, #waBtnCloseChat').removeClass('d-none').show();
                $('#waLiReopenChat, #waBtnReopenChat').addClass('d-none').hide();
                $('#waChatClosedNotice').addClass('d-none');
            }

            if (window.feather) feather.replace();
        },

        renderMessages(messages) {
            const box = $('#waMessagesBox');
            if (!box.length) return;
            box.html('');

            if (!messages.length) {
                box.html(`
                    <div class="text-center text-muted my-auto p-4">
                        <div class="wa-date-pill mb-2">Mulai Percakapan</div>
                        <p class="small">Kirim pesan pertama Anda di bawah ini.</p>
                    </div>
                `);
                return;
            }

            let html = '';
            messages.forEach((msg) => {
                this.renderedMessageIds.add(msg.id);
                html += this.renderMessageItem(msg);
                this.lastMessageId = msg.id;
            });
            box.html(html);

            box.scrollTop(box[0].scrollHeight);
            if (window.feather) feather.replace();
        },

        renderMessageItem(msg) {
            const isMe = Number(msg.sender_user_id) === Number(window.ChatAuth?.id);
            const senderName = this.shortName(msg.sender_name);
            const chatTime = this.formatChatTime(msg.created_at);

            return `
                <div class="message-row ${isMe ? 'me' : 'other'}">
                    <div class="message-wrapper">
                        <div class="message-info ${isMe ? 'me' : 'other'}">
                            <span class="sender-name">${this.escapeHtml(senderName)}</span>
                            <span class="message-dot">•</span>
                            <span class="message-time">${chatTime}</span>
                        </div>
                        <div class="message-bubble ${isMe ? 'me' : 'other'}">${this.escapeHtml(msg.message)}</div>
                    </div>
                </div>
            `;
        },

        appendNewMessages(messages) {
            const box = $('#waMessagesBox');
            if (!box.length || !messages.length) return;

            let targetBucket = box.find(`#waBucket_${this.activeConversationId}`);
            if (!targetBucket.length) {
                targetBucket = box;
            }

            let shouldPlaySound = false;

            messages.forEach((msg) => {
                if (this.renderedMessageIds.has(msg.id)) return;
                this.renderedMessageIds.add(msg.id);
                targetBucket.append(this.renderMessageItem(msg));
                this.lastMessageId = msg.id;

                if (Number(msg.sender_user_id) !== Number(window.ChatAuth?.id)) {
                    shouldPlaySound = true;
                }
            });

            if (shouldPlaySound) {
                this.playNotificationSound();
            }

            // Jika user sedang berada di dekat dasar, auto-scroll ke bawah
            const scrollDist = box[0].scrollHeight - box.scrollTop() - box.innerHeight();
            if (scrollDist < 180) {
                box.scrollTop(box[0].scrollHeight);
                this.roomScrollTops.set(String(this.activeConversationId), box[0].scrollHeight);
            }
        },

        updateChatInput(status) {
            const isClosed = status === 'closed';
            const input = $('#waChatInput');
            const sendBtn = $('#waSendMessage');
            const emojiBtn = $('#waChatEmojiBtn');

            input
                .prop('disabled', isClosed)
                .attr('placeholder', isClosed ? 'Chat telah ditutup' : 'Tulis pesan...');

            emojiBtn.prop('disabled', isClosed);

            const hasText = input.val().trim().length > 0;
            sendBtn.prop('disabled', isClosed || !hasText);
        },

        // Function Send Message (Optimistic 0ms Instant Feedback)
        sendMessage() {
            if (this.activeConversationId === 'lili_ai') {
                this.sendLiliAiMessage();
                return;
            }
            if (this.activeConversationStatus === 'closed') return;
            const input = $('#waChatInput');
            const message = input.val().trim();
            if (!message) {
                $('#waSendMessage').prop('disabled', true);
                return;
            }

            // 1. Instant UI Clear & Disable
            input.val('').css('height', '44px');
            $('#waSendMessage').prop('disabled', true);

            // 2. Instant Optimistic Render
            const tempId = 'temp_' + Date.now();
            const nowIso = new Date().toISOString();
            const box = $('#waMessagesBox');
            let targetBucket = box.find(`#waBucket_${this.activeConversationId}`);
            if (!targetBucket.length) {
                targetBucket = box;
            }

            const optimisticBubble = $(this.renderMessageItem({
                id: tempId,
                sender_user_id: window.ChatAuth?.id,
                sender_name: window.ChatAuth?.name,
                message: message,
                created_at: nowIso
            }));

            targetBucket.append(optimisticBubble);
            box.scrollTop(box[0].scrollHeight);
            this.roomScrollTops.set(String(this.activeConversationId), box[0].scrollHeight);

            // 3. Clear typing on send
            if (window.FirebaseDB && this.activeConversationId && window.ChatAuth?.id) {
                try {
                    window.FirebaseDB.ref(`conversations/${this.activeConversationId}/typing/${window.ChatAuth.id}`).remove();
                } catch (err) {}
            }

            // 4. Update last message in list immediately
            const found = this.conversationsData.find(i => Number(i.id) === Number(this.activeConversationId));
            if (found) {
                found.last_message = message;
                found.last_message_time = nowIso;
                found.is_last_from_me = true;
                this.renderConversationList(this.conversationsData);
            }

            // 5. Send to Server
            $.ajax({
                url: `/chat/${this.activeConversationId}/message`,
                method: 'POST',
                data: { message: message },
                success: (res) => {
                    if (res && res.message) {
                        this.renderedMessageIds.add(res.message.id);
                        this.lastMessageId = res.message.id;
                    }
                },
                error: (xhr) => {
                    console.error('Send message failed:', xhr.responseJSON);
                    optimisticBubble.addClass('opacity-50 border-danger');
                    alert('Gagal mengirim pesan. Silakan coba lagi.');
                    input.val(message);
                    $('#waSendMessage').prop('disabled', false);
                }
            });
        },

        // Polling Room
        startPolling() {
            this.stopPolling();
        },

        stopPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
            }
        },

        // Polling List (Managed via Reverb WebSockets)
        startConversationListPolling() {
            this.stopConversationListPolling();
        },

        stopConversationListPolling() {
            if (this.convListPollingTimer) {
                clearInterval(this.convListPollingTimer);
                this.convListPollingTimer = null;
            }
        },

        // Selection Mode
        enterSelectionMode() {
            this.isSelectionMode = true;
            this.selectedConversationIds.clear();
            $('#waSearchWrapper').addClass('d-none');
            $('#waSelectionBar').removeClass('d-none');
            $('.chat-item-select').removeClass('d-none');
            $('.wa-conv-item').addClass('selection-mode').removeClass('selected');
            $('.wa-item-checkbox').prop('checked', false);
            $('#waCheckSelectAll').prop('checked', false);
            this.updateSelectionUI();
            if (window.feather) feather.replace();
        },

        exitSelectionMode() {
            this.isSelectionMode = false;
            this.selectedConversationIds.clear();
            $('#waSelectionBar').addClass('d-none');
            $('#waSearchWrapper').removeClass('d-none');
            $('.chat-item-select').addClass('d-none');
            $('.wa-conv-item').removeClass('selection-mode selected');
            $('.wa-item-checkbox').prop('checked', false);
            $('#waCheckSelectAll').prop('checked', false);
            if (window.feather) feather.replace();
        },

        updateSelectionUI() {
            const count = this.selectedConversationIds.size;
            $('#waSelectedCountText').text(`${count} Dipilih`);
            $('#waBtnDeleteSelected').prop('disabled', count === 0);

            const totalVisible = $('.wa-item-checkbox').length;
            $('#waCheckSelectAll').prop('checked', totalVisible > 0 && count === totalVisible);
        },

        markAllAsRead() {
            $.post('/chat/mark-all-read')
                .done(() => {
                    this.conversationsData.forEach(item => { item.unread = 0; });
                    this.renderConversationList(this.conversationsData);
                })
                .fail((xhr) => {
                    console.error('Gagal menandai semua dibaca:', xhr.responseText);
                });
        },

        deleteSelectedConversations() {
            const ids = Array.from(this.selectedConversationIds);
            if (!ids.length) return;

            if (!confirm(`Hapus ${ids.length} percakapan yang dipilih dari daftar Anda?`)) {
                return;
            }

            $.post('/chat/delete-conversations', { conversation_ids: ids })
                .done(() => {
                    if (ids.includes(Number(this.activeConversationId))) {
                        this.activeConversationId = null;
                        $('#waActiveRoom').addClass('d-none');
                        $('#waEmptyState').removeClass('d-none');
                    }
                    this.exitSelectionMode();
                    this.conversationsData = this.conversationsData.filter(item => !ids.includes(Number(item.id)));
                    this.renderConversationList(this.conversationsData);
                })
                .fail((xhr) => {
                    alert('Gagal menghapus percakapan.');
                    console.error(xhr.responseText);
                });
        },

        // Close Chat
        closeActiveChat() {
            if (!this.activeConversationId || !confirm('Tutup chat ini?')) return;
            $.post(`/chat/${this.activeConversationId}/close`)
                .done(() => {
                    this.openConversation(this.activeConversationId);
                });
        },

        // Reopen Chat
        reopenActiveChat() {
            if (!this.activeConversationId) return;
            $.post(`/chat/${this.activeConversationId}/reopen`)
                .done(() => {
                    this.openConversation(this.activeConversationId);
                });
        },

        // Bind all DOM events
        bindEvents() {
            const self = this;

            // Search Filter
            $(document).on('input', '#waSearchInput', function () {
                self.filterConversations($(this).val());
            });

            // Open LILI AI Room from sidebar
            $(document).on('click', '#waBtnOpenLiliFromList', function (e) {
                e.preventDefault();
                self.openLiliAiRoom();
            });

            // Reset LILI AI session from dropdown menu
            $(document).on('click', '#waBtnResetLiliChat', function (e) {
                e.preventDefault();
                self.openLiliAiRoom(true);
            });

            // Click prompt chips in LILI chat
            $(document).on('click', '.chip-prompt, [data-prompt]', function (e) {
                e.preventDefault();
                const prompt = $(this).attr('data-prompt') || $(this).text().trim();
                if (prompt) {
                    self.sendLiliAiMessage(prompt);
                }
            });

            // Click play audio greeting in LILI chat
            $(document).on('click', '#btnPlayLiliVoicePage', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.playLiliVoiceGreeting();
            });

            // Click consult admin in LILI chat (for admin OPD)
            $(document).on('click', '#waChipConsultAdmin, .chip-admin', function (e) {
                e.preventDefault();
                if ($('#modalSearchTicket').length) {
                    $('#modalSearchTicket').modal('show');
                }
            });

            // Copy to clipboard with visual feedback
            $(document).on('click', '.btn-copy-ai', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const btn = $(this);
                const bubble = btn.closest('.bot-bubble');
                const clone = bubble.clone();
                clone.find('.ai-bubble-toolbar, .ai-action-chips, .ai-action-chips-wrap, .bot-options-grid, button').remove();
                const cleanText = clone.text().replace(/\n\s*\n/g, '\n\n').trim();

                const onCopied = () => {
                    const originalContent = btn.html();
                    btn.addClass('copied').html('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg> <span class="copy-label">Tersalin!</span>');
                    setTimeout(() => {
                        btn.removeClass('copied').html(originalContent);
                        if (window.feather) feather.replace();
                    }, 2000);
                };

                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(cleanText).then(onCopied).catch(() => {
                        const ta = document.createElement('textarea');
                        ta.value = cleanText;
                        ta.style.position = 'fixed';
                        ta.style.left = '-9999px';
                        document.body.appendChild(ta);
                        ta.focus();
                        ta.select();
                        try { document.execCommand('copy'); onCopied(); } catch (err) {}
                        document.body.removeChild(ta);
                    });
                } else {
                    const ta = document.createElement('textarea');
                    ta.value = cleanText;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    try { document.execCommand('copy'); onCopied(); } catch (err) {}
                    document.body.removeChild(ta);
                }
            });

            // Rating feedback (👍 / 👎)
            $(document).on('click', '.btn-ai-rate', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const btn = $(this);
                if (btn.hasClass('active') || btn.prop('disabled')) return;

                const rating = btn.hasClass('rate-up') ? 'up' : 'down';
                const actions = btn.closest('.ai-feedback-actions');
                const bubble = btn.closest('.bot-bubble');

                actions.find('.btn-ai-rate').prop('disabled', true);
                btn.addClass('active');

                const toast = $('<span class="ai-feedback-toast">Terima kasih!</span>');
                actions.append(toast);
                setTimeout(() => {
                    toast.fadeOut(300, function () { $(this).remove(); });
                }, 2500);

                const clone = bubble.clone();
                clone.find('.ai-bubble-toolbar, .ai-action-chips, .ai-action-chips-wrap, .bot-options-grid, button').remove();
                const snippet = clone.text().trim().substring(0, 150);

                $.ajax({
                    url: '/guest-bot/feedback-ai',
                    type: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                        'Accept': 'application/json'
                    },
                    contentType: 'application/json',
                    data: JSON.stringify({
                        rating: rating,
                        jawaban_ringkas: snippet
                    })
                }).fail(function (err) {
                    console.warn('AI feedback rating save error:', err);
                });
            });

            // Scroll tracking per room (WhatsApp Web Style Scroll Preservation)
            $('#waMessagesBox').on('scroll', function () {
                if (self.activeConversationId) {
                    self.roomScrollTops.set(String(self.activeConversationId), $(this).scrollTop());
                }
            });

            // Open Conversation Item Click
            $(document).on('click', '.wa-conv-item', function (e) {
                if ($(this).hasClass('wa-conv-item-lili')) return;
                if (self.isSelectionMode) {
                    if ($(e.target).is('.wa-item-checkbox')) return;
                    const checkbox = $(this).find('.wa-item-checkbox');
                    const isChecked = !checkbox.prop('checked');
                    checkbox.prop('checked', isChecked);
                    const id = Number($(this).data('id'));
                    if (isChecked) {
                        self.selectedConversationIds.add(id);
                        $(this).addClass('selected');
                    } else {
                        self.selectedConversationIds.delete(id);
                        $(this).removeClass('selected');
                    }
                    self.updateSelectionUI();
                    return;
                }

                const id = $(this).data('id');
                self.openConversation(id);
            });

            // Item Checkbox Click
            $(document).on('click', '.wa-item-checkbox', function (e) {
                e.stopPropagation();
                const isChecked = $(this).prop('checked');
                const row = $(this).closest('.wa-conv-item');
                const id = Number(row.data('id'));
                if (isChecked) {
                    self.selectedConversationIds.add(id);
                    row.addClass('selected');
                } else {
                    self.selectedConversationIds.delete(id);
                    row.removeClass('selected');
                }
                self.updateSelectionUI();
            });

            // Select All Checkbox
            $(document).on('change', '#waCheckSelectAll', function () {
                const isChecked = $(this).prop('checked');
                $('.wa-item-checkbox').each(function () {
                    $(this).prop('checked', isChecked);
                    const row = $(this).closest('.wa-conv-item');
                    const id = Number(row.data('id'));
                    if (isChecked) {
                        self.selectedConversationIds.add(id);
                        row.addClass('selected');
                    } else {
                        self.selectedConversationIds.delete(id);
                        row.removeClass('selected');
                    }
                });
                self.updateSelectionUI();
            });

            // Menu Selection Events
            $(document).on('click', '#waBtnSelectMessages', function (e) {
                e.preventDefault();
                self.enterSelectionMode();
            });

            $(document).on('click', '#waBtnMarkAllRead', function (e) {
                e.preventDefault();
                self.markAllAsRead();
            });

            $(document).on('click', '#waBtnCancelSelection', function () {
                self.exitSelectionMode();
            });

            $(document).on('click', '#waBtnDeleteSelected', function () {
                self.deleteSelectedConversations();
            });

            // Mobile Back Button
            $(document).on('click', '#waBtnBackToList', function () {
                $('.wa-main').removeClass('show-room');
            });

            // Chat Input Events
            $(document).on('input', '#waChatInput', function () {
                const isClosed = self.activeConversationStatus === 'closed';
                const hasText = $(this).val().trim().length > 0;
                $('#waSendMessage').prop('disabled', isClosed || !hasText);

                // Auto-Growing Textarea (44px - 120px)
                this.style.height = '44px';
                const scrollH = this.scrollHeight;
                if (scrollH > 44) {
                    this.style.height = Math.min(scrollH, 120) + 'px';
                }

                if (!isClosed && hasText) {
                    self.whisperTyping();
                }
            });

            $(document).on('keydown', '#waChatInput', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!$('#waSendMessage').prop('disabled')) {
                        self.sendMessage();
                    }
                } else if (e.key !== 'Enter') {
                    const isClosed = self.activeConversationStatus === 'closed';
                    if (!isClosed) {
                        self.whisperTyping();
                    }
                }
            });

            $(document).on('click', '#waSendMessage', function () {
                self.sendMessage();
            });

            // Emoji Picker Toggle
            $(document).on('click', '#waChatEmojiBtn', function (e) {
                e.stopPropagation();
                const picker = $('#waChatEmojiPicker');
                picker.toggleClass('d-none');
                if (!picker.hasClass('d-none') && window.feather) {
                    feather.replace();
                }
            });

            $(document).on('click', '#waCloseEmojiPicker', function (e) {
                e.stopPropagation();
                $('#waChatEmojiPicker').addClass('d-none');
            });

            $(document).on('click', '.wa-emoji-item', function (e) {
                e.stopPropagation();
                const emoji = $(this).data('emoji') || $(this).text().trim();
                const input = document.getElementById('waChatInput');
                if (input) {
                    const start = input.selectionStart || input.value.length;
                    const end = input.selectionEnd || input.value.length;
                    const text = input.value;
                    input.value = text.substring(0, start) + emoji + text.substring(end);
                    input.focus();
                    input.selectionStart = input.selectionEnd = start + emoji.length;

                    const isClosed = self.activeConversationStatus === 'closed';
                    const hasText = input.value.trim().length > 0;
                    $('#waSendMessage').prop('disabled', isClosed || !hasText);
                }
            });

            $(document).on('click', function (e) {
                if (!$(e.target).closest('#waChatEmojiPicker, #waChatEmojiBtn').length) {
                    $('#waChatEmojiPicker').addClass('d-none');
                }
            });

            // Close / Reopen chat buttons
            $(document).on('click', '#waBtnCloseChat', function (e) {
                e.preventDefault();
                self.closeActiveChat();
            });

            $(document).on('click', '#waBtnReopenChat', function (e) {
                e.preventDefault();
                self.reopenActiveChat();
            });

            // Search Ticket Modal Handler
            $(document).on('click', '#btnOpenSearchModal, #waBtnSearchTicketModal', function () {
                const modal = new bootstrap.Modal(document.getElementById('modalSearchTicket'));
                modal.show();
            });

            $(document).on('click', '#waBtnSubmitSearchTicket', function () {
                const ticketNo = $('#waModalTicketInput').val().trim();
                if (!ticketNo) return;

                const btn = $(this);
                btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Mencari...');

                $.post('/chat/search-ticket', { no_tiket: ticketNo })
                    .done((res) => {
                        if (!res.success) {
                            alert(res.message || 'Nomor tiket tidak ditemukan.');
                            return;
                        }

                        // Start / open conversation
                        $.post('/chat/start-ticket', { no_tiket: ticketNo })
                            .done((startRes) => {
                                bootstrap.Modal.getInstance(document.getElementById('modalSearchTicket'))?.hide();
                                $('#waModalTicketInput').val('');
                                self.loadConversations();
                                self.openConversation(startRes.conversation_id);
                            })
                            .fail((err) => {
                                alert(err.responseJSON?.message || 'Gagal memulai percakapan tiket.');
                            });
                    })
                    .fail((xhr) => {
                        alert(xhr.responseJSON?.message || 'Tiket tidak ditemukan.');
                    })
                    .always(() => {
                        btn.prop('disabled', false).html('<i data-feather="search" class="me-1"></i> Cari & Buka');
                        if (window.feather) feather.replace();
                    });
            });
        }
    };

    $(document).ready(function () {
        window.ChatPageApp.init();
    });

})(window, jQuery);
