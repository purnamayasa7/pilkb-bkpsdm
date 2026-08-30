(function (window, $) {

    "use strict";

    window.ChatWidgetApp = {

        activeConversationId: null,
        activeConversationStatus: 'open',
        previousView: 'search',
        conversationsData: [],
        inboxData: [],
        isSelectionMode: false,
        selectedConversationIds: new Set(),

        isUserSubscribed: false,

        lastMessageId: null,
        renderedMessageIds: new Set(),
        notificationSound: null,

        init() {
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN':
                        $('meta[name="csrf-token"]').attr('content')
                }
            });

            this.notificationSound = new Audio('/sound/notification.mp3');
            this.notificationSound.preload = 'auto';

            this.subscribeUserChannel();
        },

        _userSubscribedTime: 0,
        _roomSubscribedTime: 0,

        isRoomCurrentlyOpen(conversationId) {
            const isDrawerOpen = $('#chatDrawer').hasClass('show');
            const hasRoomContainer = $('.chat-room-container').length > 0;
            return isDrawerOpen && hasRoomContainer && (Number(this.activeConversationId) === Number(conversationId));
        },

        // Subscribe to user private channel / Firebase for realtime inbox updates & unread badges
        subscribeUserChannel() {
            if (!window.ChatAuth?.id || this.isUserSubscribed) return;
            this.isUserSubscribed = true;
            this._userSubscribedTime = Date.now();

            const handleUserEvent = (e, isLive = true) => {
                if (!e || !e.messageData) return;
                const convId = Number(e.conversationData?.id);
                const isRoomOpen = this.isRoomCurrentlyOpen(convId);

                this.updateConversationListItem(e);

                // Hanya proses interaksi aktif (suara / mark read / append) jika ini pesan live yang baru masuk
                if (isLive) {
                    if (isRoomOpen) {
                        if (Number(e.messageData?.sender_user_id) !== Number(window.ChatAuth?.id)) {
                            this.appendNewMessages([e.messageData]);
                            this.markRoomRead(convId);
                            this.hideTypingIndicator();
                        }
                    } else {
                        this.loadUnreadBadge();

                        if (this.notificationSound) {
                            this.notificationSound.pause();
                            this.notificationSound.currentTime = 0;
                            this.notificationSound.play().catch(() => {});
                        }
                    }
                }
            };

            // Firebase Realtime Database Listener
            if (window.FirebaseDB) {
                try {
                    window.FirebaseDB.ref(`users/${window.ChatAuth.id}/last_event`)
                        .on('value', (snapshot) => {
                            const data = snapshot.val();
                            if (data && data.messageData) {
                                const isLive = (data.sent_at || 0) >= (this._userSubscribedTime - 1000);
                                handleUserEvent(data, isLive);
                            }
                        });
                } catch (err) {
                    console.warn('Firebase user listener error:', err);
                }
            }
        },

        // Mark room as read on server, lalu sync badge
        markRoomRead(conversationId) {
            if (!conversationId) return;
            $.post(`/chat/${conversationId}/mark-read`).done(() => {
                this.loadUnreadBadge();
            });
        },

        // Subscribe to active room channel
        subscribeRoomChannel(conversationId) {
            if (!conversationId) return;
            this._roomSubscribedTime = Date.now();

            const handleRoomMessage = (msgData) => {
                if (!msgData) return;
                if (Number(msgData.sender_user_id) !== Number(window.ChatAuth?.id)) {
                    if (this.isRoomCurrentlyOpen(conversationId)) {
                        this.appendNewMessages([msgData]);
                        this.markRoomRead(conversationId);
                        this.hideTypingIndicator();
                    }
                }
            };

            const handleStatusChange = (status) => {
                this.activeConversationStatus = status;
                this.updateChatActionsButtons(status);
                this.updateChatInput(status);

                const isClosed = status === 'closed';
                const statusPill = $('#chatStatusBadge');
                statusPill
                    .removeClass('open closed')
                    .addClass(isClosed ? 'closed' : 'open')
                    .text(isClosed ? 'Closed' : 'Open');

                if (isClosed) {
                    $('#chatClosedNotice').removeClass('d-none');
                } else {
                    $('#chatClosedNotice').addClass('d-none');
                }
            };

            // Firebase Realtime Database Room Listeners
            if (window.FirebaseDB) {
                try {
                    // Message Listener (hanya tangkap pesan yang dikirim saat room dibuka)
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

                    // Status Listener
                    window.FirebaseDB.ref(`conversations/${conversationId}/status`)
                        .on('value', (snapshot) => {
                            const val = snapshot.val();
                            if (val && val.status) {
                                handleStatusChange(val.status);
                            }
                        });

                    // Typing Listener
                    window.FirebaseDB.ref(`conversations/${conversationId}/typing`)
                        .on('value', (snapshot) => {
                            const typingUsers = snapshot.val();
                            if (typingUsers) {
                                const now = Date.now();
                                Object.keys(typingUsers).forEach((uid) => {
                                    if (Number(uid) !== Number(window.ChatAuth?.id)) {
                                        const userObj = typingUsers[uid];
                                        if (userObj && (now - (userObj.time || 0) < 3500)) {
                                            this.showTypingIndicator(userObj.name);
                                        }
                                    }
                                });
                            }
                        });
                } catch (err) {
                    console.warn('Firebase room listener error:', err);
                }
            }
        },

        whisperTyping() {
            if (!this.activeConversationId || !window.ChatAuth?.id) return;
            const now = Date.now();
            if (now - (this._lastWhisperTime || 0) < 1200) return;
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
            const subtitleEl = $('#roomSubtitle');
            if (subtitleEl.length) {
                if (!this._originalSubtitle) {
                    this._originalSubtitle = subtitleEl.text();
                }
                subtitleEl.html('<span class="text-success fw-semibold fst-italic"><i data-feather="edit-2" style="width:11px;height:11px;" class="me-1"></i>sedang mengetik...</span>');
                if (window.feather) feather.replace();
            }

            const stream = $('#chatMessages');
            if (stream.length && !$('#chatTypingBubble').length) {
                stream.append(`
                    <div class="chat-typing-bubble" id="chatTypingBubble">
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
            $('#chatTypingBubble').remove();
            if (this._originalSubtitle) {
                $('#roomSubtitle').text(this._originalSubtitle);
                this._originalSubtitle = null;
            }
        },

        // Update list items when message received in background
        updateConversationListItem(e) {
            const conv = e.conversationData;
            if (!conv || !conv.id) return;

            const convId = Number(conv.id);
            const isActiveRoom = Number(this.activeConversationId) === convId;
            const isFromMe = Number(e.messageData?.sender_user_id) === Number(window.ChatAuth?.id);

            // Helper: update satu item di array data
            const updateInArray = (arr, addIfMissing = true) => {
                const idx = arr.findIndex(item => Number(item.id) === convId);
                if (idx !== -1) {
                    const item = arr[idx];
                    item.last_message = conv.last_message;
                    item.last_message_time = conv.last_message_time;
                    item.status = conv.status;
                    item.need_reply = conv.need_reply;
                    item.is_last_from_me = isFromMe;
                    if (!isActiveRoom) {
                        item.unread = (item.unread || 0) + 1;
                    }
                    arr.splice(idx, 1);
                    arr.unshift(item);
                    return true;
                } else if (addIfMissing) {
                    arr.unshift({
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
                    return true;
                }
                return false;
            };

            // Update conversationsData (dipakai oleh halaman OPD / list percakapan)
            const convListEl = $('#conversationList');
            if (convListEl.length) {
                updateInArray(this.conversationsData, true);
                if (!this.isSelectionMode) {
                    const q = $('#searchMyConversations').val();
                    if (q) {
                        this.filterConversations(q);
                    } else {
                        this.renderConversationListItems(this.conversationsData);
                    }
                }
            }

            // Update inboxData (dipakai oleh admin bidang/bawah lewat renderInboxList)
            const inboxListEl = $('#searchAdminInbox');
            if (inboxListEl.length) {
                updateInArray(this.inboxData, true);
                if (!this.isSelectionMode) {
                    const q = inboxListEl.val();
                    if (q) {
                        this.filterInbox(q);
                    } else {
                        this.renderInboxListItems(this.inboxData);
                    }
                }
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

        // Function Short Name
        shortName(name) {
            if (!name) return 'Unknown';

            // Ambil nama sebelum koma (gelar dibuang)
            return String(name)
                .split(',')[0]
                .trim();
        },

        // Function Format Chat Time
        formatChatTime(dateString) {

            const date = new Date(dateString);
            const now = new Date();

            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            const msgDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

            const diffDays = Math.floor(
                (today - msgDate) /
                (1000 * 60 * 60 * 24)
            );

            const jam = date.toLocaleTimeString(
                'id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            }
            ).replace(':', '.');

            if (diffDays === 0) {
                return `Hari ini ${jam}`;
            }

            if (diffDays === 1) {
                return `Kemarin ${jam}`;
            }

            return (
                date.toLocaleDateString(
                    'id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }
                ) +
                ' ' +
                jam
            );
        },

        // Function Get Initials
        getInitials(name) {
            if (!name) return 'U';

            const cleanName = this.shortName(name).trim();
            const words = cleanName.split(/\s+/);

            if (words.length >= 2) {
                return (
                    words[0][0] +
                    words[1][0]
                ).toUpperCase();
            }

            return cleanName
                .substring(0, 2)
                .toUpperCase();
        },

        // Function Render Messages
        renderMessages(messages) {

            let box = $('#chatMessages');

            if (!box.length) return;

            box.html('');

            messages.forEach(msg => {
                this.renderedMessageIds.add(msg.id);

                box.append(
                    this.renderMessageItem(msg)
                );
            });

            box.scrollTop(box[0].scrollHeight);

            this.updateLastMessageId(messages);

        },

        // Function Append New Message
        appendNewMessages(messages) {

            let box = $('#chatMessages');

            if (!box.length || !messages.length) {
                return;
            }

            let shouldPlaySound = false;

            messages.forEach(msg => {

                if (this.renderedMessageIds.has(msg.id)) {
                    return;
                }

                this.renderedMessageIds.add(msg.id);

                box.append(this.renderMessageItem(msg));

                this.lastMessageId = msg.id;

                if (Number(msg.sender_user_id) !== Number(window.ChatAuth.id)) {
                    shouldPlaySound = true;
                }

            });

            if (shouldPlaySound) {

                this.playNotification();

            }

            box.scrollTop(box[0].scrollHeight);

        },

        // Function Update Last Message Id
        updateLastMessageId(messages) {

            if (!messages.length) return;

            this.lastMessageId = messages[messages.length - 1].id;

        },

        // Function Render Messages Item
        renderMessageItem(msg) {
            let isMe = Number(msg.sender_user_id) === Number(window.ChatAuth.id);
            let senderName = this.shortName(msg.sender_name);
            let chatTime = this.formatChatTime(msg.created_at);

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

        // Function Render Inbox Item
        renderInboxItem(item) {
            const isUnread = Number(item.unread) > 0;
            let unreadBadge = '';

            if (isUnread) {
                unreadBadge = `
                    <span class="badge bg-danger rounded-pill chat-unread-pill">
                        ${item.unread > 99 ? '99+' : item.unread}
                    </span>
                `;
            }

            const role = item.sender_role || (item.type === 'guest' ? 'tamu' : 'opd');
            const roleLabel = item.sender_role_label || (role === 'tamu' ? 'Tamu' : 'OPD');
            const roleIcon = role === 'tamu' ? 'user' : (role === 'bidang' ? 'layers' : (role === 'fo' ? 'user-check' : 'briefcase'));
            const roleBadge = `<span class="chat-role-badge badge-${role}"><i data-feather="${roleIcon}"></i>${roleLabel}</span>`;

            let ticketBadge = '';
            if (item.no_tiket) {
                ticketBadge = `
                    <span class="chat-item-ticket">
                        <i data-feather="tag"></i>
                        ${this.escapeHtml(item.no_tiket)}
                    </span>
                `;
            }

            const statusClass = item.status === 'closed' ? 'closed' : 'open';
            const statusLabel = item.status === 'closed' ? 'Closed' : 'Open';

            const formattedTime = item.last_message_time
                ? this.formatChatTime(item.last_message_time)
                : '';

            const senderName = this.escapeHtml(this.shortName(item.nama_pengirim));
            const subTitle = item.layanan
                ? this.escapeHtml(item.layanan)
                : (item.bidang ? this.escapeHtml(item.bidang) : '');

            const lastMessageText = this.escapeHtml(item.last_message ?? 'Belum ada pesan');
            const prefixMe = item.is_last_from_me ? '<span class="text-primary fw-medium me-1">Anda:</span>' : '';
            const avatarText = this.getInitials(item.nama_pengirim);

            const isSelected = this.selectedConversationIds && this.selectedConversationIds.has(Number(item.id));
            const selectClass = this.isSelectionMode ? '' : 'd-none';
            const itemSelectedClass = isSelected ? 'selected' : '';
            const selectionModeClass = this.isSelectionMode ? 'selection-mode' : '';

            return `
<div class="chat-item openConversation ${isUnread ? 'unread-item' : ''} ${itemSelectedClass} ${selectionModeClass}" data-id="${item.id}">
    <div class="chat-item-select ${selectClass}">
        <input class="form-check-input conversation-checkbox item-select-checkbox" type="checkbox" data-id="${item.id}" value="${item.id}" ${isSelected ? 'checked' : ''}>
    </div>

    <div class="chat-avatar">
        ${avatarText}
    </div>

    <div class="chat-content">
        <div class="chat-item-top">
            <div class="d-flex align-items-center gap-1 overflow-hidden">
                ${roleBadge}
                ${ticketBadge}
            </div>
            ${formattedTime ? `<span class="chat-item-time">${formattedTime}</span>` : ''}
        </div>

        <div class="chat-item-title" title="${senderName}">
            ${senderName}
        </div>

        ${subTitle ? `<div class="chat-item-sub">${subTitle}</div>` : ''}

        <div class="chat-item-preview ${isUnread ? 'unread' : ''}">
            ${prefixMe}${lastMessageText}
        </div>
    </div>

    <div class="chat-item-meta">
        <div>
            ${unreadBadge}
        </div>
        <i data-feather="chevron-right" class="chat-item-chevron"></i>
    </div>
</div>
`;
        },

        // Function Render My Conversation Item
        renderMyConversationItem(item) {
            const isUnread = Number(item.unread) > 0;
            let unreadBadge = '';

            if (isUnread) {
                unreadBadge = `
                    <span class="badge bg-danger rounded-pill chat-unread-pill">
                        ${item.unread > 99 ? '99+' : item.unread}
                    </span>
                `;
            }

            const role = item.sender_role || (item.type === 'guest' ? 'tamu' : 'opd');
            const roleLabel = item.sender_role_label || (role === 'tamu' ? 'Tamu' : 'OPD');
            const roleIcon = role === 'tamu' ? 'user' : (role === 'bidang' ? 'layers' : (role === 'fo' ? 'user-check' : 'briefcase'));
            const roleBadge = `<span class="chat-role-badge badge-${role}"><i data-feather="${roleIcon}"></i>${roleLabel}</span>`;

            let ticketBadge = '';
            if (item.no_tiket) {
                ticketBadge = `
                    <span class="chat-item-ticket">
                        <i data-feather="tag"></i>
                        ${this.escapeHtml(item.no_tiket)}
                    </span>
                `;
            }

            const statusClass = item.status === 'closed' ? 'closed' : 'open';
            const statusLabel = item.status === 'closed' ? 'Closed' : 'Open';

            const formattedTime = item.last_message_time
                ? this.formatChatTime(item.last_message_time)
                : '';

            const primaryTitle = item.layanan
                ? this.escapeHtml(item.layanan)
                : (item.bidang ? this.escapeHtml(item.bidang) : this.escapeHtml(this.shortName(item.nama_pengirim)));

            const secondaryTitle = item.layanan && item.bidang
                ? this.escapeHtml(item.bidang)
                : (item.layanan ? this.escapeHtml(this.shortName(item.nama_pengirim)) : '');

            const lastMessageText = this.escapeHtml(item.last_message ?? 'Belum ada pesan');
            const prefixMe = item.is_last_from_me ? '<span class="text-primary fw-medium me-1">Anda:</span>' : '';
            const avatarText = this.getInitials(item.nama_pengirim);

            const isSelected = this.selectedConversationIds && this.selectedConversationIds.has(Number(item.id));
            const selectClass = this.isSelectionMode ? '' : 'd-none';
            const itemSelectedClass = isSelected ? 'selected' : '';
            const selectionModeClass = this.isSelectionMode ? 'selection-mode' : '';

            return `
<div class="chat-item openConversation ${isUnread ? 'unread-item' : ''} ${itemSelectedClass} ${selectionModeClass}" data-id="${item.id}">
    <div class="chat-item-select ${selectClass}">
        <input class="form-check-input conversation-checkbox item-select-checkbox" type="checkbox" data-id="${item.id}" value="${item.id}" ${isSelected ? 'checked' : ''}>
    </div>

    <div class="chat-avatar">
        ${avatarText}
    </div>

    <div class="chat-content">
        <div class="chat-item-top">
            <div class="d-flex align-items-center gap-1 overflow-hidden">
                ${roleBadge}
                ${ticketBadge}
            </div>
            ${formattedTime ? `<span class="chat-item-time">${formattedTime}</span>` : ''}
        </div>

        <div class="chat-item-title" title="${primaryTitle}">
            ${primaryTitle}
        </div>

        ${secondaryTitle ? `<div class="chat-item-sub">${secondaryTitle}</div>` : ''}

        <div class="chat-item-preview ${isUnread ? 'unread' : ''}">
            ${prefixMe}${lastMessageText}
        </div>
    </div>

    <div class="chat-item-meta">
        <div>
            ${unreadBadge}
        </div>
        <i data-feather="chevron-right" class="chat-item-chevron"></i>
    </div>
</div>
`;
        },

        // Function Refresh Inbox
        refreshInbox(items) {
            if (!items || !items.length) return;

            items.forEach(item => {
                const idx = this.inboxData.findIndex(i => Number(i.id) === Number(item.id));
                if (idx !== -1) {
                    this.inboxData.splice(idx, 1);
                }
                this.inboxData.unshift(item);

                if (Number(item.last_message_id) > this.lastInboxMessageId) {
                    this.lastInboxMessageId = Number(item.last_message_id);
                }
            });

            const currentQuery = $('#searchAdminInbox').val();
            if (currentQuery) {
                this.filterInbox(currentQuery);
            } else {
                this.renderInboxListItems(this.inboxData);
            }
        },

        // Function Render Inbox List
        renderInboxList(items) {
            this.stopPolling();
            this.stopConversationListPolling();
            this.activeConversationId = null;
            this.previousView = 'inbox';
            this.inboxData = Array.isArray(items) ? items : [];
            this.isSelectionMode = false;
            this.selectedConversationIds.clear();

            const body = $('.chat-body');
            body.html(`
        <div class="chat-page chat-page-list">
            <div class="chat-list-header">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <div class="dropdown">
                            <button class="chat-menu-btn" type="button" id="btnListMenu" data-bs-toggle="dropdown" aria-expanded="false" title="Menu opsi">
                                <i data-feather="more-vertical"></i>
                            </button>
                            <ul class="dropdown-menu chat-dropdown-menu">
                                <li>
                                    <a class="dropdown-item d-flex align-items-center" href="#" id="btnSelectMessages">
                                        <i data-feather="check-square" class="me-2" style="width:14px;height:14px;"></i>
                                        Pilih Pesan
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center" href="#" id="btnMarkAllRead">
                                        <i data-feather="check" class="me-2" style="width:14px;height:14px;"></i>
                                        Baca Semua
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <div class="chat-header-title">
                                Inbox Percakapan
                            </div>
                            <div class="chat-header-subtitle">
                                Daftar obrolan tiket & tamu
                            </div>
                        </div>
                    </div>
                    <span id="inboxTotalCountBadge" class="chat-count-badge d-none">
                        0 Chat
                    </span>
                </div>

                <div class="chat-search-wrapper" id="listSearchWrapper">
                    <input
                        type="text"
                        id="searchAdminInbox"
                        class="form-control chat-search-input"
                        placeholder="Cari nama, tiket, layanan, pesan...">
                    <i data-feather="search" class="chat-search-icon"></i>
                </div>

                <div class="chat-selection-bar d-none" id="listSelectionBar">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                            <div class="form-check m-0 d-flex align-items-center gap-1">
                                <input class="form-check-input conversation-checkbox" type="checkbox" id="checkSelectAll">
                                <label class="form-check-label small fw-semibold text-dark mb-0" for="checkSelectAll" style="cursor:pointer;">
                                    Semua
                                </label>
                            </div>
                            <span class="small fw-semibold text-primary" id="selectedCountText">0 Dipilih</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" id="btnDeleteSelected" disabled style="border-radius: 8px; font-size: 11.5px; font-weight: 600;">
                                <i data-feather="trash-2" style="width:13px;height:13px;"></i>
                                Hapus Chat
                            </button>
                            <button type="button" class="btn btn-sm btn-light" id="btnCancelSelection" style="border-radius: 8px; font-size: 11.5px;">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="inboxList" class="chat-list">
            </div>
        </div>
    `);

            this.renderInboxListItems(this.inboxData);
            feather.replace();

            if (this.inboxData.length > 0) {
                this.lastInboxMessageId = Math.max(
                    ...this.inboxData.map(i => Number(i.last_message_id || 0))
                );
            } else {
                this.lastInboxMessageId = 0;
            }
        },

        // Function Render Inbox List Items
        renderInboxListItems(items, searchTerm = '') {
            const list = $('#inboxList');
            const countBadge = $('#inboxTotalCountBadge');

            if (!list.length) return;

            const total = this.inboxData.length;
            if (total > 0) {
                countBadge.text(`${total} Chat`).removeClass('d-none');
            } else {
                countBadge.addClass('d-none');
            }

            if (!items.length) {
                if (searchTerm) {
                    list.html(`
                        <div class="chat-empty-state">
                            <div class="chat-empty-icon">
                                <i data-feather="search"></i>
                            </div>
                            <h6 class="fw-bold mb-1">Tidak Ditemukan</h6>
                            <p class="text-muted small mb-0">Tidak ada pesan dengan kata kunci "<strong>${this.escapeHtml(searchTerm)}</strong>".</p>
                        </div>
                    `);
                } else {
                    list.html(`
                        <div class="chat-empty-state">
                            <div class="chat-empty-icon">
                                <i data-feather="inbox"></i>
                            </div>
                            <h6 class="fw-bold mb-1">Belum Ada Pesan Masuk</h6>
                            <p class="text-muted small mb-0">Belum ada obrolan tiket atau tamu yang masuk.</p>
                        </div>
                    `);
                }
                feather.replace();
                return;
            }

            let html = '';
            items.forEach(item => {
                html += this.renderInboxItem(item);
            });

            list.html(html);
            feather.replace();
        },

        // Function Filter Inbox
        filterInbox(query) {
            if (!this.inboxData || !this.inboxData.length) return;

            const q = String(query || '').trim().toLowerCase();
            if (!q) {
                this.renderInboxListItems(this.inboxData);
                return;
            }

            const filtered = this.inboxData.filter(item => {
                const ticket = String(item.no_tiket || '').toLowerCase();
                const sender = String(item.nama_pengirim || '').toLowerCase();
                const layanan = String(item.layanan || '').toLowerCase();
                const bidang = String(item.bidang || '').toLowerCase();
                const lastMsg = String(item.last_message || '').toLowerCase();

                return ticket.includes(q) || sender.includes(q) || layanan.includes(q) || bidang.includes(q) || lastMsg.includes(q);
            });

            this.renderInboxListItems(filtered, query);
        },

        // Function Load My Conversations
        loadConversationList(initialData = null) {
            this.stopPolling();
            this.stopInboxPolling();
            this.stopConversationListPolling();

            this.activeConversationId = null;
            this.previousView = 'list';
            this.isSelectionMode = false;
            this.selectedConversationIds.clear();

            const body = $('.chat-body');
            const hasData = Array.isArray(initialData) ? initialData.length > 0 : (this.conversationsData && this.conversationsData.length > 0);
            const dataToRender = Array.isArray(initialData) ? initialData : this.conversationsData;

            body.html(`
        <div class="chat-page chat-page-list">

            <div class="chat-list-header">

                <div class="d-flex align-items-center justify-content-between">

                    <div class="d-flex align-items-center gap-2">

                        <button
                            type="button"
                            class="btn btn-light chat-back-btn"
                            id="btnBackToChatHome"
                            title="Kembali ke cari tiket">
                            <i data-feather="arrow-left"></i>
                        </button>

                        <div class="dropdown">
                            <button class="chat-menu-btn" type="button" id="btnListMenu" data-bs-toggle="dropdown" aria-expanded="false" title="Menu opsi">
                                <i data-feather="more-vertical"></i>
                            </button>
                            <ul class="dropdown-menu chat-dropdown-menu">
                                <li>
                                    <a class="dropdown-item d-flex align-items-center" href="#" id="btnSelectMessages">
                                        <i data-feather="check-square" class="me-2" style="width:14px;height:14px;"></i>
                                        Pilih Pesan
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center" href="#" id="btnMarkAllRead">
                                        <i data-feather="check" class="me-2" style="width:14px;height:14px;"></i>
                                        Baca Semua
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <div class="chat-header-title">
                                List Percakapan
                            </div>
                            <div class="chat-header-subtitle">
                                Riwayat percakapan tiket Anda
                            </div>
                        </div>

                    </div>

                    <span id="chatTotalCountBadge" class="chat-count-badge d-none">
                        0 Chat
                    </span>

                </div>

                <div class="chat-search-wrapper" id="listSearchWrapper">
                    <input
                        type="text"
                        id="searchMyConversations"
                        class="form-control chat-search-input"
                        placeholder="Cari no. tiket, layanan, pesan...">
                    <i data-feather="search" class="chat-search-icon"></i>
                </div>

                <div class="chat-selection-bar d-none" id="listSelectionBar">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-2">
                            <div class="form-check m-0 d-flex align-items-center gap-1">
                                <input class="form-check-input conversation-checkbox" type="checkbox" id="checkSelectAll">
                                <label class="form-check-label small fw-semibold text-dark mb-0" for="checkSelectAll" style="cursor:pointer;">
                                    Semua
                                </label>
                            </div>
                            <span class="small fw-semibold text-primary" id="selectedCountText">0 Dipilih</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" id="btnDeleteSelected" disabled style="border-radius: 8px; font-size: 11.5px; font-weight: 600;">
                                <i data-feather="trash-2" style="width:13px;height:13px;"></i>
                                Hapus Chat
                            </button>
                            <button type="button" class="btn btn-sm btn-light" id="btnCancelSelection" style="border-radius: 8px; font-size: 11.5px;">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <div
                id="conversationList"
                class="chat-list">

                ${hasData ? '' : `
                <div class="chat-skeleton-wrapper">
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                </div>
                `}

            </div>

        </div>
    `);

            feather.replace();

            if (hasData) {
                this.renderConversationListItems(dataToRender);
            }

            this.fetchAndRenderConversationList(!hasData);
            this.startConversationListPolling();
        },

        // Function Fetch and Render Conversation List
        fetchAndRenderConversationList(showLoading = false) {
            if (showLoading && !$('#conversationList .chat-skeleton-wrapper').length && !$('#conversationList .chat-item').length) {
                $('#conversationList').html(`
                    <div class="chat-skeleton-wrapper">
                        <div class="chat-skeleton-item"></div>
                        <div class="chat-skeleton-item"></div>
                        <div class="chat-skeleton-item"></div>
                    </div>
                `);
            }

            $.get('/chat/my-conversations')
                .done((res) => {
                    this.conversationsData = Array.isArray(res) ? res : [];
                    const currentQuery = $('#searchMyConversations').val();
                    if (currentQuery) {
                        this.filterConversations(currentQuery);
                    } else {
                        this.renderConversationListItems(this.conversationsData);
                    }
                })
                .fail((xhr) => {
                    console.error('Gagal memuat percakapan:', xhr.responseText);
                    if (!$('#conversationList .chat-item').length) {
                        $('#conversationList').html(`
                            <div class="text-center text-danger p-4">
                                <i data-feather="alert-circle" class="mb-2 text-danger" style="width:28px;height:28px;"></i>
                                <div>Gagal memuat percakapan. Silakan coba beberapa saat lagi.</div>
                            </div>
                        `);
                        feather.replace();
                    }
                });
        },

        // Function Render Conversation List Items
        renderConversationListItems(items, searchTerm = '') {
            const list = $('#conversationList');
            const countBadge = $('#chatTotalCountBadge');

            if (!list.length) return;

            const total = this.conversationsData.length;
            if (total > 0) {
                countBadge.text(`${total} Chat`).removeClass('d-none');
            } else {
                countBadge.addClass('d-none');
            }

            if (!items.length) {
                if (searchTerm) {
                    list.html(`
                        <div class="chat-empty-state">
                            <div class="chat-empty-icon">
                                <i data-feather="search"></i>
                            </div>
                            <h6 class="fw-bold mb-1">Tidak Ditemukan</h6>
                            <p class="text-muted small mb-0">Tidak ada percakapan dengan kata kunci "<strong>${this.escapeHtml(searchTerm)}</strong>".</p>
                        </div>
                    `);
                } else {
                    list.html(`
                        <div class="chat-empty-state">
                            <div class="chat-empty-icon">
                                <i data-feather="message-square"></i>
                            </div>
                            <h6 class="fw-bold mb-1">Belum Ada Percakapan</h6>
                            <p class="text-muted small mb-3">Anda belum memiliki riwayat percakapan. Masukkan nomor tiket untuk memulai obrolan.</p>
                            <button class="btn btn-primary btn-sm chat-btn-rounded d-inline-flex align-items-center" id="btnBackToChatHome">
                                <i data-feather="search" class="me-1"></i>
                                Cari Tiket
                            </button>
                        </div>
                    `);
                }
                feather.replace();
                return;
            }

            let html = '';
            items.forEach(item => {
                html += this.renderMyConversationItem(item);
            });

            list.html(html);
            feather.replace();
        },

        // Function Filter Conversations
        filterConversations(query) {
            if (!this.conversationsData || !this.conversationsData.length) return;

            const q = String(query || '').trim().toLowerCase();
            if (!q) {
                this.renderConversationListItems(this.conversationsData);
                return;
            }

            const filtered = this.conversationsData.filter(item => {
                const ticket = String(item.no_tiket || '').toLowerCase();
                const layanan = String(item.layanan || '').toLowerCase();
                const bidang = String(item.bidang || '').toLowerCase();
                const sender = String(item.nama_pengirim || '').toLowerCase();
                const lastMsg = String(item.last_message || '').toLowerCase();

                return ticket.includes(q) || layanan.includes(q) || bidang.includes(q) || sender.includes(q) || lastMsg.includes(q);
            });

            this.renderConversationListItems(filtered, query);
        },

        // Function Start Conversation List Polling (Handled via Reverb WebSockets)
        startConversationListPolling() {
            this.stopConversationListPolling();
        },

        // Function Stop Conversation List Polling
        stopConversationListPolling() {
            if (this.convListPollingTimer) {
                clearInterval(this.convListPollingTimer);
                this.convListPollingTimer = null;
            }
            this.isConvListPolling = false;
        },

        // Function Unread Badge
        loadUnreadBadge() {
            const badge = $('#chatUnreadBadge');
            const btnBadge = $('.chat-btn-unread-badge');

            if (!badge.hasClass('chat-badge-ready')) {
                badge.addClass('d-none');
            }

            $.get('/chat/unread-count', (res) => {
                const count = Number(res.count) || 0;
                badge.addClass('chat-badge-ready');

                if (count > 0) {
                    const displayCount = count > 99 ? '99+' : count;
                    badge.text(displayCount).removeClass('d-none');
                    if (btnBadge.length) {
                        btnBadge.text(displayCount).removeClass('d-none');
                    }
                } else {
                    badge.addClass('d-none');
                    if (btnBadge.length) {
                        btnBadge.addClass('d-none');
                    }
                }
            }).fail(() => {
                badge.addClass('chat-badge-ready d-none');
            });
        },

        // Function Notification Sound
        playNotification() {

            // Kalau tab sedang aktif, jangan bunyikan
            if (!document.hidden) {
                return;
            }

            this.notificationSound.pause();

            this.notificationSound.currentTime = 0;

            this.notificationSound.play().catch((e) => {
                console.error(e);
            });

        },

        // Function Render Chat Layout
        renderChatLayout() {
            return `
        <div class="chat-room-container">
            <div class="chat-room-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden">
                        <button
                            class="btn btn-light chat-back-btn"
                            id="btnBackInbox"
                            title="Kembali">
                            <i data-feather="arrow-left"></i>
                        </button>
                        <div class="chat-room-info overflow-hidden">
                            <div class="d-flex align-items-center gap-1 flex-wrap">
                                <span id="roomRoleBadge"></span>
                                <span class="chat-item-ticket" id="roomTicketBadge">
                                    <i data-feather="tag"></i>
                                    <span id="roomTicketNo">-</span>
                                </span>
                                <span id="chatStatusBadge" class="chat-status-pill open">
                                    Open
                                </span>
                            </div>
                            <div id="roomSubtitle" class="chat-room-sub text-truncate">
                                Pusat Bantuan PILKB
                            </div>
                        </div>
                    </div>

                    <div class="dropdown ms-2">
                        <button
                            class="chat-menu-btn"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            title="Menu opsi">
                            <i data-feather="more-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end chat-dropdown-menu">
                            <li id="liCloseChat">
                                <a class="dropdown-item d-flex align-items-center text-danger" href="#" id="btnCloseChat">
                                    <i data-feather="check-circle" class="me-2" style="width:14px;height:14px;"></i>
                                    Tutup Chat
                                </a>
                            </li>
                            <li id="liReopenChat">
                                <a class="dropdown-item d-flex align-items-center text-success" href="#" id="btnReopenChat">
                                    <i data-feather="rotate-cw" class="me-2" style="width:14px;height:14px;"></i>
                                    Buka Chat
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div
                id="chatMessages"
                class="chat-messages flex-grow-1">
            </div>

            <div id="chatClosedNotice" class="chat-closed-notice d-none px-3 py-2 text-center">
                <i data-feather="lock" class="me-1" style="width:13px;height:13px;"></i> Percakapan ini telah ditutup
            </div>

            <div class="chat-input-footer position-relative">
                <div class="chat-emoji-picker d-none" id="chatEmojiPicker">
                    <div class="chat-emoji-header">
                        <span>Pilih Emoji</span>
                        <button type="button" class="btn-close btn-close-sm" id="closeEmojiPicker" aria-label="Tutup"></button>
                    </div>
                    <div class="chat-emoji-grid">
                        <button type="button" class="emoji-item" data-emoji="😊">😊</button>
                        <button type="button" class="emoji-item" data-emoji="👍">👍</button>
                        <button type="button" class="emoji-item" data-emoji="🙏">🙏</button>
                        <button type="button" class="emoji-item" data-emoji="👋">👋</button>
                        <button type="button" class="emoji-item" data-emoji="😄">😄</button>
                        <button type="button" class="emoji-item" data-emoji="🤝">🤝</button>
                        <button type="button" class="emoji-item" data-emoji="👌">👌</button>
                        <button type="button" class="emoji-item" data-emoji="✅">✅</button>
                        <button type="button" class="emoji-item" data-emoji="🙌">🙌</button>
                        <button type="button" class="emoji-item" data-emoji="✨">✨</button>
                        <button type="button" class="emoji-item" data-emoji="💡">💡</button>
                        <button type="button" class="emoji-item" data-emoji="🎉">🎉</button>
                        <button type="button" class="emoji-item" data-emoji="😁">😁</button>
                        <button type="button" class="emoji-item" data-emoji="😉">😉</button>
                        <button type="button" class="emoji-item" data-emoji="🤔">🤔</button>
                        <button type="button" class="emoji-item" data-emoji="🫡">🫡</button>
                        <button type="button" class="emoji-item" data-emoji="😎">😎</button>
                        <button type="button" class="emoji-item" data-emoji="👏">👏</button>
                        <button type="button" class="emoji-item" data-emoji="💪">💪</button>
                        <button type="button" class="emoji-item" data-emoji="❤️">❤️</button>
                        <button type="button" class="emoji-item" data-emoji="🔥">🔥</button>
                        <button type="button" class="emoji-item" data-emoji="💯">💯</button>
                        <button type="button" class="emoji-item" data-emoji="📌">📌</button>
                        <button type="button" class="emoji-item" data-emoji="📝">📝</button>
                        <button type="button" class="emoji-item" data-emoji="📋">📋</button>
                        <button type="button" class="emoji-item" data-emoji="💼">💼</button>
                        <button type="button" class="emoji-item" data-emoji="📂">📂</button>
                        <button type="button" class="emoji-item" data-emoji="☕">☕</button>
                    </div>
                </div>
                <div class="chat-input-wrapper">
                    <textarea
                        id="chatInput"
                        class="form-control"
                        placeholder="Tulis pesan..."
                        rows="1"></textarea>
                    <button
                        class="chat-emoji-btn"
                        id="chatEmojiBtn"
                        type="button"
                        title="Pilih emoji">
                        <i data-feather="smile"></i>
                    </button>
                    <button
                        class="chat-send-btn"
                        id="sendMessage"
                        disabled
                        title="Kirim pesan">
                        <i data-feather="navigation"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
        },

        // Function Chat Page
        renderChatPage(res) {

            let html = this.renderChatLayout();

            $('.chat-body').html(html);

            this.renderMessages(res.messages);

            this.lastMessageId =
                res.messages.length
                    ? res.messages[res.messages.length - 1].id
                    : null;

            this.updateChatHeader(res);

            this.updateChatActionsButtons(res.status);

            this.updateChatInput(res.status);

            feather.replace();
        },

        // Function UpdateChat Status
        updateChatActionsButtons(status) {
            const isClosed = status === 'closed';
            if (isClosed) {
                $('#liCloseChat, #btnCloseChat').addClass('d-none').hide();
                $('#liReopenChat, #btnReopenChat').removeClass('d-none').show();
            } else {
                $('#liCloseChat, #btnCloseChat').removeClass('d-none').show();
                $('#liReopenChat, #btnReopenChat').addClass('d-none').hide();
            }
        },

        // Function Header Chat
        updateChatHeader(res) {
            const role = res.sender_role || (res.type === 'guest' ? 'tamu' : 'opd');
            const roleLabel = res.sender_role_label || (role === 'tamu' ? 'Tamu' : 'OPD');
            const roleIcon = role === 'tamu' ? 'user' : (role === 'bidang' ? 'layers' : (role === 'fo' ? 'user-check' : 'briefcase'));
            $('#roomRoleBadge').html(`<span class="chat-role-badge badge-${role}"><i data-feather="${roleIcon}"></i>${roleLabel}</span>`);

            const ticketNo = res.ticket_number || '';
            if (ticketNo && ticketNo !== '-') {
                $('#roomTicketNo').text(ticketNo);
                $('#roomTicketBadge').removeClass('d-none');
            } else {
                $('#roomTicketBadge').addClass('d-none');
            }

            const isClosed = res.status === 'closed';
            const statusPill = $('#chatStatusBadge');
            statusPill
                .removeClass('open closed')
                .addClass(isClosed ? 'closed' : 'open')
                .text(isClosed ? 'Closed' : 'Open');

            const subTitle = res.layanan
                ? res.layanan
                : (res.bidang ? res.bidang : (res.nama_pengirim ? `Pengirim: ${this.shortName(res.nama_pengirim)}` : 'Pusat Bantuan PILKB'));
            $('#roomSubtitle').text(subTitle).attr('title', subTitle);

            if (isClosed) {
                $('#chatClosedNotice').removeClass('d-none');
            } else {
                $('#chatClosedNotice').addClass('d-none');
            }
        },

        // Function Update Chat Input
        updateChatInput(status) {
            const isClosed = status === 'closed';
            const input = $('#chatInput');
            const sendBtn = $('#sendMessage');
            const emojiBtn = $('#chatEmojiBtn');

            input
                .prop('disabled', isClosed)
                .attr(
                    'placeholder',
                    isClosed
                        ? 'Chat telah ditutup'
                        : 'Tulis pesan...'
                );

            emojiBtn.prop('disabled', isClosed);

            const hasText = input.val().trim().length > 0;
            sendBtn.prop('disabled', isClosed || !hasText);
        },

        // Function Load Chat
        loadChat(conversationId, source = null) {
            this.hideTypingIndicator();
            this.stopInboxPolling();
            this.stopConversationListPolling();

            if (this.activeConversationId && window.Echo) {
                window.Echo.leave(`chat.${this.activeConversationId}`);
            }

            if (source) {
                this.previousView = source;
            }

            this.lastMessageId = null;
            this.renderedMessageIds.clear();
            this.activeConversationId = conversationId;

            this.fetchConversation(conversationId)
                .done((res) => {
                    this.activeConversationStatus = res.status;
                    this.renderChatPage(res);
                    this.subscribeRoomChannel(conversationId);

                    // Reset unread count di lokal state agar badge list hilang
                    const inConvData = this.conversationsData.find(i => Number(i.id) === Number(conversationId));
                    if (inConvData) inConvData.unread = 0;
                    const inInboxData = this.inboxData.find(i => Number(i.id) === Number(conversationId));
                    if (inInboxData) inInboxData.unread = 0;

                    // Sync badge floating button setelah pesan terbaca
                    this.loadUnreadBadge();
                });
        },

        // Fetch Conversation
        fetchConversation(conversationId) {
            return $.get(`/chat/${conversationId}/messages`);
        },

        // Function Close Chat
        closeChat() {
            if (!confirm('Tutup chat ini?')) {
                return;
            }

            $.post(
                `/chat/${this.activeConversationId}/close`,
                {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                () => {

                    this.loadChat(
                        this.activeConversationId
                    );
                }
            );
        },

        // Function Reopen Chat
        reopenChat() {
            $.post(
                `/chat/${this.activeConversationId}/reopen`,
                {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                () => {

                    this.loadChat(
                        this.activeConversationId
                    );
                }
            );
        },

        // Function Send Message (Optimistic 0ms Instant Feedback)
        sendMessage() {
            if (this.activeConversationStatus === 'closed') {
                return;
            }

            const input = $('#chatInput');
            const message = input.val().trim();

            if (!message) {
                $('#sendMessage, #sendChatBtn').prop('disabled', true);
                return;
            }

            // 1. Instant UI Clear & Disable
            input.val('').css('height', 'auto');
            $('#sendMessage, #sendChatBtn').prop('disabled', true);

            // 2. Instant Optimistic Render (0 millisecond delay)
            const tempId = 'temp_' + Date.now();
            const nowIso = new Date().toISOString();
            const optimisticBubble = $(this.renderMessageItem({
                id: tempId,
                sender_user_id: window.ChatAuth.id,
                sender_name: window.ChatAuth.name,
                message: message,
                created_at: nowIso
            }));

            $('#chatMessages').append(optimisticBubble);
            $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);

            // 3. Clear typing indicator on send
            if (window.FirebaseDB && this.activeConversationId && window.ChatAuth?.id) {
                try {
                    window.FirebaseDB.ref(`conversations/${this.activeConversationId}/typing/${window.ChatAuth.id}`).remove();
                } catch (err) {}
            }

            // 4. Send to Server
            $.ajax({
                url: `/chat/${this.activeConversationId}/message`,
                method: 'POST',
                data: {
                    message: message
                },
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
                    $('#sendMessage, #sendChatBtn').prop('disabled', false);
                }
            });
        },

        // Function Start Polling
        startPolling() {
            this.stopPolling();
        },

        // Function Start Inbox Polling
        startInboxPolling() {
            this.stopInboxPolling();
        },

        // Function Start Badge Polling
        startBadgePolling() {
            this.stopBadgePolling();
        },

        // Function Handle Visibility Change
        handleVisibilityChange() {
            if (!document.hidden) {
                this.loadUnreadBadge();
            }
        },

        // Function Stop Polling
        stopPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
            }
        },

        // Function Stop Inbox Polling
        stopInboxPolling() {

            if (this.inboxPollingTimer) {
                clearInterval(
                    this.inboxPollingTimer
                );

                this.inboxPollingTimer = null;
            }
        },

        // Function Stop Badge Polling
        stopBadgePolling() {
            if (this.badgePollingTimer) {
                clearInterval(this.badgePollingTimer);

                this.badgePollingTimer = null;
            }
        },
        // Selection Mode Methods
        enterSelectionMode() {
            this.isSelectionMode = true;
            this.selectedConversationIds.clear();
            $('#listSearchWrapper').addClass('d-none');
            $('#listSelectionBar').removeClass('d-none');
            $('.chat-item-select').removeClass('d-none');
            $('.chat-item').addClass('selection-mode').removeClass('selected');
            $('.item-select-checkbox').prop('checked', false);
            $('#checkSelectAll').prop('checked', false);
            this.updateSelectionUI();
            if (window.feather) feather.replace();
        },

        exitSelectionMode() {
            this.isSelectionMode = false;
            this.selectedConversationIds.clear();
            $('#listSelectionBar').addClass('d-none');
            $('#listSearchWrapper').removeClass('d-none');
            $('.chat-item-select').addClass('d-none');
            $('.chat-item').removeClass('selection-mode selected');
            $('.item-select-checkbox').prop('checked', false);
            $('#checkSelectAll').prop('checked', false);
            if (window.feather) feather.replace();
        },

        updateSelectionUI() {
            const count = this.selectedConversationIds.size;
            $('#selectedCountText').text(`${count} Dipilih`);
            $('#btnDeleteSelected').prop('disabled', count === 0);

            const totalVisible = $('.item-select-checkbox').length;
            $('#checkSelectAll').prop('checked', totalVisible > 0 && count === totalVisible);
        },

        markAllAsRead() {
            $.post('/chat/mark-all-read', {
                _token: $('meta[name="csrf-token"]').attr('content')
            })
            .done((res) => {
                if (this.previousView === 'inbox') {
                    this.inboxData.forEach(item => { item.unread = 0; });
                    this.renderInboxListItems(this.inboxData);
                } else {
                    this.conversationsData.forEach(item => { item.unread = 0; });
                    this.renderConversationListItems(this.conversationsData);
                }
                this.loadUnreadBadge();
            })
            .fail((xhr) => {
                console.error('Gagal menandai semua pesan dibaca:', xhr.responseText);
            });
        },

        deleteSelectedConversations() {
            const ids = Array.from(this.selectedConversationIds);
            if (!ids.length) return;

            if (!confirm(`Hapus ${ids.length} percakapan yang dipilih dari daftar Anda?`)) {
                return;
            }

            $.post('/chat/delete-conversations', {
                _token: $('meta[name="csrf-token"]').attr('content'),
                conversation_ids: ids
            })
            .done((res) => {
                this.exitSelectionMode();
                if (this.previousView === 'inbox') {
                    this.inboxData = this.inboxData.filter(item => !ids.includes(Number(item.id)));
                    this.renderInboxListItems(this.inboxData);
                } else {
                    this.conversationsData = this.conversationsData.filter(item => !ids.includes(Number(item.id)));
                    this.renderConversationListItems(this.conversationsData);
                }
                this.loadUnreadBadge();
            })
            .fail((xhr) => {
                alert('Gagal menghapus percakapan. Silakan coba lagi.');
                console.error('Gagal menghapus percakapan:', xhr.responseText);
            });
        },
    };

    $(document).on('input', '#searchMyConversations', function () {
        const query = $(this).val();
        window.ChatWidgetApp.filterConversations(query);
    });

    $(document).on('input', '#searchAdminInbox', function () {
        const query = $(this).val();
        window.ChatWidgetApp.filterInbox(query);
    });

    $(document).on('input', '#chatInput', function () {
        const isClosed = window.ChatWidgetApp.activeConversationStatus === 'closed';
        const hasText = $(this).val().trim().length > 0;
        $('#sendMessage, #sendChatBtn').prop('disabled', isClosed || !hasText);

        if (!isClosed && hasText) {
            window.ChatWidgetApp.whisperTyping();
        }
    });

    // Kirim pesan dengan Enter (Shift + Enter untuk baris baru)
    $(document).on('keydown', '#chatInput', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!$('#sendMessage, #sendChatBtn').prop('disabled')) {
                window.ChatWidgetApp.sendMessage();
            }
        } else if (e.key !== 'Enter') {
            const isClosed = window.ChatWidgetApp.activeConversationStatus === 'closed';
            if (!isClosed) {
                window.ChatWidgetApp.whisperTyping();
            }
        }
    });

    // Toggle Emoji Picker
    $(document).on('click', '#chatEmojiBtn', function (e) {
        e.stopPropagation();
        const picker = $('#chatEmojiPicker');
        picker.toggleClass('d-none');
        if (!picker.hasClass('d-none') && window.feather) {
            feather.replace();
        }
    });

    // Close Emoji Picker
    $(document).on('click', '#closeEmojiPicker', function (e) {
        e.stopPropagation();
        $('#chatEmojiPicker').addClass('d-none');
    });

    // Click Emoji Item
    $(document).on('click', '.emoji-item', function (e) {
        e.stopPropagation();
        const emoji = $(this).data('emoji') || $(this).text().trim();
        const input = document.getElementById('chatInput');
        if (input) {
            const start = input.selectionStart || input.value.length;
            const end = input.selectionEnd || input.value.length;
            const text = input.value;
            input.value = text.substring(0, start) + emoji + text.substring(end);
            input.focus();
            input.selectionStart = input.selectionEnd = start + emoji.length;

            const isClosed = window.ChatWidgetApp.activeConversationStatus === 'closed';
            const hasText = input.value.trim().length > 0;
            $('#sendMessage, #sendChatBtn').prop('disabled', isClosed || !hasText);
        }
    });

    // Click Outside Emoji Picker
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#chatEmojiPicker, #chatEmojiBtn').length) {
            $('#chatEmojiPicker').addClass('d-none');
        }
    });

    // Selection Mode Menu Events
    $(document).on('click', '#btnSelectMessages', function (e) {
        e.preventDefault();
        window.ChatWidgetApp.enterSelectionMode();
    });

    $(document).on('click', '#btnMarkAllRead', function (e) {
        e.preventDefault();
        window.ChatWidgetApp.markAllAsRead();
    });

    $(document).on('click', '#btnCancelSelection', function () {
        window.ChatWidgetApp.exitSelectionMode();
    });

    $(document).on('click', '#btnDeleteSelected', function () {
        window.ChatWidgetApp.deleteSelectedConversations();
    });

    // Selection Item Click
    $(document).on('click', '.item-select-checkbox', function (e) {
        e.stopPropagation();
        const isChecked = $(this).prop('checked');
        const itemRow = $(this).closest('.chat-item');
        const id = Number(itemRow.data('id'));
        if (isChecked) {
            window.ChatWidgetApp.selectedConversationIds.add(id);
            itemRow.addClass('selected');
        } else {
            window.ChatWidgetApp.selectedConversationIds.delete(id);
            itemRow.removeClass('selected');
        }
        window.ChatWidgetApp.updateSelectionUI();
    });

    $(document).on('change', '#checkSelectAll', function () {
        const isChecked = $(this).prop('checked');
        $('.item-select-checkbox').each(function () {
            $(this).prop('checked', isChecked);
            const itemRow = $(this).closest('.chat-item');
            const id = Number(itemRow.data('id'));
            if (isChecked) {
                window.ChatWidgetApp.selectedConversationIds.add(id);
                itemRow.addClass('selected');
            } else {
                window.ChatWidgetApp.selectedConversationIds.delete(id);
                itemRow.removeClass('selected');
            }
        });
        window.ChatWidgetApp.updateSelectionUI();
    });

})(window, jQuery);