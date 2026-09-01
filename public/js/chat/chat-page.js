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

            if (!items.length) {
                if (searchTerm) {
                    list.html(`
                        <div class="p-4 text-center text-muted">
                            <i data-feather="search" class="mb-2" style="width:28px;height:28px;opacity:0.5;"></i>
                            <div class="fw-semibold">Tidak Ditemukan</div>
                            <div class="small">Tidak ada chat dengan kata kunci "${this.escapeHtml(searchTerm)}"</div>
                        </div>
                    `);
                } else {
                    list.html(`
                        <div class="p-4 text-center text-muted">
                            <i data-feather="message-square" class="mb-2" style="width:32px;height:32px;opacity:0.5;"></i>
                            <div class="fw-semibold">Belum Ada Percakapan</div>
                            <div class="small mb-3">Klik tombol Cari Tiket untuk memulai obrolan baru.</div>
                            <button class="btn btn-primary btn-sm chat-btn-rounded" id="btnOpenSearchModal">
                                <i data-feather="search" class="me-1"></i> Cari Tiket
                            </button>
                        </div>
                    `);
                }
                if (window.feather) feather.replace();
                return;
            }

            let html = '';
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

        // Open Room
        openConversation(conversationId) {
            this.hideTypingIndicator();
            this.stopPolling();
            if (this.activeConversationId && window.Echo) {
                window.Echo.leave(`chat.${this.activeConversationId}`);
            }
            this.activeConversationId = conversationId;
            this.renderedMessageIds.clear();
            this.lastMessageId = null;

            // Highlight in list
            $('.wa-conv-item').removeClass('active');
            $(`.wa-conv-item[data-id="${conversationId}"]`).addClass('active');

            // Show mobile room panel
            $('.wa-main').addClass('show-room');
            $('#waEmptyState').addClass('d-none');
            $('#waActiveRoom').removeClass('d-none');

            // Show skeleton / loading
            $('#waMessagesBox').html(`
                <div class="chat-skeleton-wrapper p-4">
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                </div>
            `);

            $.get(`/chat/${conversationId}/messages`)
                .done((res) => {
                    this.activeConversationStatus = res.status || 'open';
                    this.activeConversationData = res;
                    this.renderRoomHeader(res);
                    this.renderMessages(res.messages || []);
                    this.updateChatInput(res.status);
                    this.subscribeRoomChannel(conversationId);

                    // Update unread in local state & server
                    const found = this.conversationsData.find(i => Number(i.id) === Number(conversationId));
                    if (found) {
                        found.unread = 0;
                        this.renderConversationList(this.conversationsData);
                    }

                    // Tandai pesan sudah dibaca di server agar tersimpan permanen di database
                    this.markRoomRead(conversationId);
                })
                .fail((xhr) => {
                    console.error('Gagal memuat pesan:', xhr.responseText);
                    $('#waMessagesBox').html(`
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

            messages.forEach((msg) => {
                this.renderedMessageIds.add(msg.id);
                box.append(this.renderMessageItem(msg));
                this.lastMessageId = msg.id;
            });

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

            let shouldPlaySound = false;

            messages.forEach((msg) => {
                if (this.renderedMessageIds.has(msg.id)) return;
                this.renderedMessageIds.add(msg.id);
                box.append(this.renderMessageItem(msg));
                this.lastMessageId = msg.id;

                if (Number(msg.sender_user_id) !== Number(window.ChatAuth?.id)) {
                    shouldPlaySound = true;
                }
            });

            if (shouldPlaySound) {
                this.playNotificationSound();
            }

            box.scrollTop(box[0].scrollHeight);
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
            const optimisticBubble = $(this.renderMessageItem({
                id: tempId,
                sender_user_id: window.ChatAuth?.id,
                sender_name: window.ChatAuth?.name,
                message: message,
                created_at: nowIso
            }));

            box.append(optimisticBubble);
            box.scrollTop(box[0].scrollHeight);

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

            // Open Conversation Item Click
            $(document).on('click', '.wa-conv-item', function (e) {
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
