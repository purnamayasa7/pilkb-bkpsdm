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
        cachedRooms: new Map(),
        roomScrollTops: new Map(),

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
                const isTargetRoom = Number(this.activeConversationId) === convId && $('.chat-room-container').length > 0;
                const isDrawerOpen = $('#chatDrawer').hasClass('show');

                this.updateConversationListItem(e);

                // Jika user sedang berada di dalam room ini (meski drawer sedang minimized/closed), langsung append pesan baru
                if (isTargetRoom) {
                    if (Number(e.messageData?.sender_user_id) !== Number(window.ChatAuth?.id)) {
                        this.appendNewMessages([e.messageData]);
                        if (isDrawerOpen) {
                            this.markRoomRead(convId);
                            this.hideTypingIndicator();
                        } else {
                            this.loadUnreadBadge();
                        }
                    }
                } else {
                    this.loadUnreadBadge();

                    if (isLive) {
                        this.playNotification();
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
                    const isTargetRoom = Number(this.activeConversationId) === Number(conversationId) && $('.chat-room-container').length > 0;
                    if (isTargetRoom) {
                        this.appendNewMessages([msgData]);
                        if ($('#chatDrawer').hasClass('show')) {
                            this.markRoomRead(conversationId);
                            this.hideTypingIndicator();
                        } else {
                            this.loadUnreadBadge();
                        }
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
                            if (!$('#chatDrawer').hasClass('show')) {
                                this.hideTypingIndicator();
                                return;
                            }

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
            // Jangan tampilkan jika drawer sedang tertutup
            if (!$('#chatDrawer').hasClass('show')) {
                this.hideTypingIndicator();
                return;
            }

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

            // Background sync ke memory cache room jika ada pesan baru tanpa merusak scroll
            if (!isActiveRoom && this.cachedRooms && this.cachedRooms.has(convId) && e.messageData) {
                const cached = this.cachedRooms.get(convId);
                if (!cached.renderedMessageIds.has(e.messageData.id)) {
                    cached.renderedMessageIds.add(e.messageData.id);
                    cached.html += this.renderMessageItem(e.messageData);
                    cached.lastMessageId = e.messageData.id;
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

            let html = '';
            messages.forEach(msg => {
                this.renderedMessageIds.add(msg.id);
                html += this.renderMessageItem(msg);
            });

            box.html(html);
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

            // Update memory cache
            if (this.cachedRooms && this.cachedRooms.has(Number(this.activeConversationId))) {
                const cached = this.cachedRooms.get(Number(this.activeConversationId));
                cached.html = box.html();
                cached.lastMessageId = this.lastMessageId;
                cached.renderedMessageIds = new Set(this.renderedMessageIds);
            }

            // Jika user dekat dasar, auto-scroll ke bawah
            const scrollDist = box[0].scrollHeight - box.scrollTop() - box.innerHeight();
            if (scrollDist < 160) {
                box.scrollTop(box[0].scrollHeight);
                this.roomScrollTops.set(String(this.activeConversationId), box[0].scrollHeight);
            }
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

        // Fast Inline SVG Icons for List Items (Eliminates feather.replace layout recalculation)
        getSvgIcon(name, extraClass = '') {
            switch (name) {
                case 'chevron-right':
                    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chat-item-chevron ${extraClass}"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
                case 'tag':
                    return `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-tag ${extraClass}"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
                case 'briefcase':
                    return `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-briefcase ${extraClass}"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
                case 'user':
                    return `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user ${extraClass}"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                case 'layers':
                    return `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-layers ${extraClass}"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
                case 'user-check':
                    return `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user-check ${extraClass}"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`;
                default:
                    return `<i data-feather="${name}" class="${extraClass}"></i>`;
            }
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
            const roleBadge = `<span class="chat-role-badge badge-${role}">${this.getSvgIcon(roleIcon)}${roleLabel}</span>`;

            let ticketBadge = '';
            if (item.no_tiket) {
                ticketBadge = `
                    <span class="chat-item-ticket">
                        ${this.getSvgIcon('tag')}
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
        ${this.getSvgIcon('chevron-right')}
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
            const roleBadge = `<span class="chat-role-badge badge-${role}">${this.getSvgIcon(roleIcon)}${roleLabel}</span>`;

            let ticketBadge = '';
            if (item.no_tiket) {
                ticketBadge = `
                    <span class="chat-item-ticket">
                        ${this.getSvgIcon('tag')}
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
        ${this.getSvgIcon('chevron-right')}
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

        // Function Load Inbox from Server
        loadInbox(callback = null) {
            this.stopPolling();
            this.activeConversationId = null;
            this.previousView = 'inbox';

            $.get('/chat/admin/inbox')
                .done((res) => {
                    this.renderInboxList(res);
                    if (typeof callback === 'function') callback(res);
                })
                .fail(() => {
                    console.error("Gagal memuat inbox");
                });
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
                    <div class="d-flex align-items-center gap-1">
                        <button type="button" class="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2" id="btnOpenLiliFromInbox" title="Tanya LILI (Kamus Regulasi &amp; Panduan Layanan AI)" style="font-size: 11px; font-weight: 600; border-color: #6366f1; color: #4f46e5; background: #f5f3ff;">
                            <i data-feather="zap" style="width: 12px; height: 12px;"></i>
                            <span>Tanya LILI</span>
                        </button>
                        <span id="inboxTotalCountBadge" class="chat-count-badge d-none">
                            0 Chat
                        </span>
                    </div>
                </div>

                <div class="chat-search-wrapper" id="listSearchWrapper" style="position: relative !important; display: flex !important; align-items: center !important;">
                    <i data-feather="search" class="chat-search-icon" style="position: absolute !important; left: 14px !important; top: 50% !important; transform: translateY(-50%) !important; width: 14px !important; height: 14px !important; color: #94a3b8 !important; pointer-events: none !important; z-index: 5 !important;"></i>
                    <input
                        type="text"
                        id="searchAdminInbox"
                        class="form-control chat-search-input"
                        placeholder="Cari nama, tiket, layanan, pesan..."
                        style="padding-left: 38px !important; border-radius: 20px !important; height: 38px !important; font-size: 12.5px !important;">
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

            // Kartu Permanen LILI AI di Paling Atas Inbox Admin Bidang
            const liliPinnedHtml = `
                <div class="chat-item chat-item-lili-ai" id="btnOpenLiliFromInboxList">
                    <div class="position-relative flex-shrink-0 me-2" style="width: 44px; height: 44px;">
                        <img src="/images/lili-avatar.png" alt="LILI" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #6366f1; box-shadow: 0 2px 6px rgba(99,102,241,0.25);">
                        <span class="lili-verified-badge badge-md" title="Terverifikasi (Asisten Virtual Resmi)">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10.5" fill="#25D366" stroke="#ffffff" stroke-width="2"/>
                                <path d="M7.5 12.2L10.5 15.2L16.8 8.8" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                    <div class="chat-content flex-grow-1 overflow-hidden">
                        <div class="chat-item-top d-flex align-items-center justify-content-between mb-1">
                            <div class="d-flex align-items-center gap-1 overflow-hidden">
                                <span class="badge" style="background: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap" style="vertical-align: middle; margin-right: 2px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>ASISTEN VIRTUAL
                                </span>
                            </div>
                            <span class="badge bg-success-soft text-success small" style="font-size: 10px;">Online</span>
                        </div>
                        <div class="chat-item-title fw-bold text-dark text-truncate" style="font-size: 13.5px;">
                            LILI - Asisten Virtual Kepegawaian
                        </div>
                        <div class="chat-item-sub text-truncate" style="font-size: 11px; color: #64748b;">
                            Konsultasi regulasi ASN &amp; panduan layanan kepegawaian
                        </div>
                        <div class="chat-item-last text-truncate small mt-1" style="font-size: 11.5px; color: #4f46e5; font-weight: 600;">
                            Klik untuk mulai konsultasi bersama LILI →
                        </div>
                    </div>
                    <div class="chat-item-arrow text-muted ms-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </div>
            `;

            const qClean = String(searchTerm || '').toLowerCase().trim();
            const showLili = !qClean || 'lili'.includes(qClean) || 'ai'.includes(qClean) || 'asisten'.includes(qClean);

            if (!items.length) {
                if (searchTerm) {
                    list.html((showLili ? liliPinnedHtml : '') + `
                        <div class="chat-empty-state">
                            <div class="chat-empty-icon">
                                <i data-feather="search"></i>
                            </div>
                            <h6 class="fw-bold mb-1">Tidak Ditemukan</h6>
                            <p class="text-muted small mb-0">Tidak ada pesan dengan kata kunci "<strong>${this.escapeHtml(searchTerm)}</strong>".</p>
                        </div>
                    `);
                } else {
                    list.html(liliPinnedHtml + `
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

            let html = showLili ? liliPinnedHtml : '';
            items.forEach(item => {
                html += this.renderInboxItem(item);
            });

            list.html(html);
            if (list.find('[data-feather]').length && window.feather) {
                feather.replace();
            }
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

                <div class="chat-search-wrapper" id="listSearchWrapper" style="position: relative !important; display: flex !important; align-items: center !important;">
                    <i data-feather="search" class="chat-search-icon" style="position: absolute !important; left: 14px !important; top: 50% !important; transform: translateY(-50%) !important; width: 14px !important; height: 14px !important; color: #94a3b8 !important; pointer-events: none !important; z-index: 5 !important;"></i>
                    <input
                        type="text"
                        id="searchMyConversations"
                        class="form-control chat-search-input"
                        placeholder="Cari no. tiket, layanan, pesan..."
                        style="padding-left: 38px !important; border-radius: 20px !important; height: 38px !important; font-size: 12.5px !important;">
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
            if (list.find('[data-feather]').length && window.feather) {
                feather.replace();
            }
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

        // Function Notification Sound (Debounced & Single Instance)
        playNotification() {
            // Jangan bunyikan jika sedang berada di halaman /chat penuh (karena chat-page.js yang menangani)
            if ($('.wa-container').length > 0) {
                return;
            }

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

        // Simpan posisi scroll sebelum meninggalkan room
        saveCurrentRoomState() {
            if (this.activeConversationId) {
                const msgs = $('#chatMessages');
                if (msgs.length) {
                    const scrollPos = msgs.scrollTop();
                    this.roomScrollTops.set(String(this.activeConversationId), scrollPos);
                    if (this.cachedRooms && this.cachedRooms.has(Number(this.activeConversationId))) {
                        const cached = this.cachedRooms.get(Number(this.activeConversationId));
                        cached.html = msgs.html();
                        cached.scrollTop = scrollPos;
                        cached.lastMessageId = this.lastMessageId;
                        cached.renderedMessageIds = new Set(this.renderedMessageIds);
                    }
                }
            }
        },

        // Function Load Chat (WhatsApp Style In-Memory Room Caching & Scroll Preservation)
        loadChat(conversationId, source = null) {
            conversationId = Number(conversationId);
            this.hideTypingIndicator();
            this.saveCurrentRoomState();
            this.stopInboxPolling();
            this.stopConversationListPolling();

            if (this.activeConversationId && window.Echo) {
                window.Echo.leave(`chat.${this.activeConversationId}`);
            }

            if (source) {
                this.previousView = source;
            }

            this.activeConversationId = conversationId;

            // Cek apakah room sudah pernah di-load di memori (0ms instant render)
            if (this.cachedRooms && this.cachedRooms.has(conversationId)) {
                const cached = this.cachedRooms.get(conversationId);
                this.activeConversationStatus = cached.res.status;
                this.renderedMessageIds = new Set(cached.renderedMessageIds);
                this.lastMessageId = cached.lastMessageId;

                const layoutHtml = this.renderChatLayout();
                $('.chat-body').html(layoutHtml);
                $('#chatMessages').html(cached.html);

                this.updateChatHeader(cached.res);
                this.updateChatActionsButtons(cached.res.status);
                this.updateChatInput(cached.res.status);
                feather.replace();

                // Kembalikan posisi scroll persis di tempat pengguna tinggalkan
                const savedPos = this.roomScrollTops.get(String(conversationId));
                if (savedPos != null) {
                    $('#chatMessages').scrollTop(savedPos);
                } else {
                    $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
                }

                // Reset unread count di lokal state agar badge list hilang
                const inConvData = this.conversationsData.find(i => Number(i.id) === Number(conversationId));
                if (inConvData) inConvData.unread = 0;
                const inInboxData = this.inboxData.find(i => Number(i.id) === Number(conversationId));
                if (inInboxData) inInboxData.unread = 0;
                this.loadUnreadBadge();
                return;
            }

            this.lastMessageId = null;
            this.renderedMessageIds.clear();

            this.fetchConversation(conversationId)
                .done((res) => {
                    this.activeConversationStatus = res.status;
                    this.renderChatPage(res);

                    // Simpan di cache
                    this.cachedRooms.set(conversationId, {
                        res: res,
                        html: $('#chatMessages').html(),
                        renderedMessageIds: new Set(this.renderedMessageIds),
                        lastMessageId: this.lastMessageId,
                        scrollTop: $('#chatMessages')[0]?.scrollHeight || 0
                    });
                    this.roomScrollTops.set(String(conversationId), $('#chatMessages')[0]?.scrollHeight || 0);

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

            if (this.cachedRooms) {
                this.cachedRooms.delete(Number(this.activeConversationId));
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
            if (this.cachedRooms) {
                this.cachedRooms.delete(Number(this.activeConversationId));
            }

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
            input.val('').css('height', '48px');
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
            this.roomScrollTops.set(String(this.activeConversationId), $('#chatMessages')[0].scrollHeight);
            if (this.cachedRooms && this.cachedRooms.has(Number(this.activeConversationId))) {
                const cached = this.cachedRooms.get(Number(this.activeConversationId));
                cached.html = $('#chatMessages').html();
                cached.scrollTop = $('#chatMessages')[0].scrollHeight;
            }

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

        // ==========================================
        // LILI ASISTEN AI MODE (UNTUK USER AUTH)
        // ==========================================
        liliAiHistory: [],
        isLiliAiLoading: false,

        startLiliAiMode(backSource = 'search', resetChat = false) {
            this.stopPolling();
            this.stopConversationListPolling();
            this.stopInboxPolling();
            this.activeConversationId = 'lili_ai';
            this.previousView = backSource;
            this.isLiliAiLoading = false;

            if (resetChat) {
                this.liliAiHistory = [];
                this.savedLiliChatHtml = null;
            } else {
                this.liliAiHistory = this.liliAiHistory || [];
            }

            const greetingName = window.ChatAuth?.name
                ? `Halo, Bapak/Ibu <strong>${this.escapeHtml(window.ChatAuth.name)}</strong>${(window.ChatAuth.ukerja || window.ChatAuth.nama_ukerja) ? ' (' + this.escapeHtml(window.ChatAuth.ukerja || window.ChatAuth.nama_ukerja) + ')' : ''}!`
                : 'Halo!';

            const defaultWelcomeHtml = `
                <div class="bot-message-wrapper">
                    <div class="bot-badge-header">
                        <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                        <span>LILI - Asisten Virtual</span>
                    </div>
                    <div class="bot-bubble">
                        <p class="mb-2">${greetingName} Saya <strong>LILI</strong> (<em>Layanan Informasi &amp; Literasi Kepegawaian Interaktif</em>) Asisten Virtual PILKB BKPSDM Kabupaten Buleleng. 😊</p>
                        <p class="mb-2">Anda dapat berkonsultasi seputar regulasi ASN, cek status usulan tiket, serta persyaratan layanan kepegawaian di BKPSDM Buleleng.</p>
                        <p class="mb-1 text-muted small fw-semibold">Contoh pertanyaan yang bisa Anda tanyakan kepada LILI:</p>
                        <ul class="mb-3 small ps-3 text-muted">
                            <li><em>"Apa saja syarat usulan kenaikan pangkat di BKPSDM Buleleng?"</em></li>
                            <li><em>"Bagaimana aturan jam kerja dan sanksi disiplin ASN (PP 94/2021)?"</em></li>
                            <li><em>"Bagaimana prosedur pengajuan cuti tahunan dan cuti besar?"</em></li>
                        </ul>
                        <div class="ai-action-chips-wrap d-flex flex-wrap gap-1 mt-2 mb-2">
                            <button type="button" class="ai-action-chip chip-prompt" data-prompt="Apa saja syarat usulan kenaikan pangkat di BKPSDM Buleleng?">🔘 Kenaikan Pangkat</button>
                            <button type="button" class="ai-action-chip chip-prompt" data-prompt="Bagaimana prosedur pengajuan cuti tahunan ASN?">🔘 Cuti ASN</button>
                            <button type="button" class="ai-action-chip chip-prompt" data-prompt="Bagaimana aturan jam kerja dan sanksi disiplin ASN?">🔘 Disiplin Pegawai</button>
                            <button type="button" class="ai-action-chip chip-prompt" data-prompt="Apa syarat mutasi pegawai di BKPSDM Buleleng?">🔘 Mutasi Pegawai</button>
                            <button type="button" class="ai-action-chip chip-prompt" data-prompt="Apa saja syarat usulan pensiun BUP?">🔘 Pensiun BUP</button>
                        </div>
                        <p class="mb-0 text-muted small fst-italic">Silakan ketik pertanyaan Anda pada kolom pesan di bawah lalu tekan Kirim (Enter).</p>
                    </div>
                </div>
            `;

            const initialMessagesHtml = this.savedLiliChatHtml || defaultWelcomeHtml;

            const body = $('.chat-body');
            body.html(`
        <div class="chat-room-container">
            <div class="chat-room-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden">
                        <button class="btn btn-light chat-back-btn" id="btnBackFromLiliAi" title="Tutup / Kembali">
                            <i data-feather="arrow-left"></i>
                        </button>
                        <div class="chat-room-info overflow-hidden">
                            <div class="d-flex align-items-center gap-2">
                                <div class="position-relative flex-shrink-0">
                                    <img src="/images/lili-avatar.png" alt="LILI" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1.5px solid #6366f1; box-shadow: 0 2px 6px rgba(99,102,241,0.25);">
                                    <span class="lili-verified-badge badge-sm" title="Terverifikasi">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10.5" fill="#25D366" stroke="#ffffff" stroke-width="2"/>
                                            <path d="M7.5 12.2L10.5 15.2L16.8 8.8" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                </div>
                                <div class="overflow-hidden">
                                    <div class="d-flex align-items-center gap-1">
                                        <span class="fw-bold text-dark text-truncate" style="font-size: 13.5px;">LILI - Asisten Virtual</span>
                                        <button type="button" id="btnPlayLiliVoiceApp" class="btn btn-sm btn-link p-0 ms-1" title="Putar Ulang Suara LILI" style="line-height:1; vertical-align: middle;">
                                            <i data-feather="volume-2" style="width:14px; height:14px; color:#6366f1;"></i>
                                        </button>
                                    </div>
                                    <div class="chat-room-sub text-truncate" style="font-size: 10.5px; color: #64748b;">
                                        Layanan Informasi &amp; Literasi Kepegawaian
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <button type="button" class="btn btn-sm btn-light border-0 py-1 px-2 rounded-pill d-flex align-items-center gap-1 text-muted" id="btnResetLiliChat" title="Mulai Percakapan Baru" style="font-size: 11px; background: #f1f5f9;">
                            <i data-feather="rotate-ccw" style="width: 11px; height: 11px;"></i>
                            <span class="fw-semibold">Baru</span>
                        </button>
                    </div>
                </div>
            </div>

            <div id="liliAppChatMessages" class="chat-messages flex-grow-1">
                ${initialMessagesHtml}
            </div>

            <div class="chat-input-footer position-relative">
                <div class="chat-input-wrapper">
                    <textarea
                        id="liliAppInput"
                        class="form-control"
                        placeholder="Tulis pesan..."
                        rows="1"></textarea>
                    <button
                        class="chat-send-btn"
                        id="btnSendLiliApp"
                        disabled
                        title="Kirim pesan">
                        <i data-feather="navigation"></i>
                    </button>
                </div>
            </div>
        </div>
            `);

            if (typeof feather !== 'undefined') {
                feather.replace();
            }

            if (!this.savedLiliChatHtml) {
                this.playLiliVoiceGreeting();
            }

            const messagesEl = document.getElementById('liliAppChatMessages');
            if (messagesEl) {
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }

            $('#liliAppInput').focus();
        },

        playLiliVoiceGreeting() {
            try {
                const audio = new Audio('/sound/lili-greeting.mp3');
                audio.play().catch(() => {});
            } catch (err) {}
        },

        formatLiliAiReply(raw) {
            if (!raw) return '';
            let text = String(raw);

            // Escape HTML Dasar
            text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            // Bold: **teks**
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Italic: *teks* atau _teks_
            text = text.replace(/\*([^\*\n]+)\*/g, '<em>$1</em>');
            text = text.replace(/_([^_\n]+)_/g, '<em>$1</em>');

            // Link [teks](url) aman
            text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s\)]+|\/[^\s\)]+)\)/g, (match, label, url) => {
                const isInternal = url.startsWith('/') || url.includes(window.location.hostname);
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary fw-semibold text-decoration-underline">${label}</a>`;
            });

            // List baris baru (- atau *)
            text = text.replace(/(?:^|\n)[-\*]\s+(.+)/g, '<li class="ms-3 mb-1">$1</li>');

            // Nomor list: 1. 2.
            text = text.replace(/(?:^|\n)(\d+)\.\s+(.+)/g, '<div class="ms-2 mb-1"><strong>$1.</strong> $2</div>');

            // Paragraf ganda
            text = text.replace(/\n\n+/g, '</p><p class="mb-2">');
            text = text.replace(/\n/g, '<br>');

            return `<p class="mb-2">${text}</p>`;
        },

        sendLiliAiMessage(customPrompt = null) {
            if (this.isLiliAiLoading) return;
            const inputEl = $('#liliAppInput');
            const userMsg = customPrompt ? customPrompt.trim() : inputEl.val().trim();
            if (!userMsg) return;

            if (!customPrompt) {
                inputEl.val('');
                inputEl.css('height', '48px');
                $('#btnSendLiliApp').prop('disabled', true);
            }

            const chatMessages = $('#liliAppChatMessages');

            // Append pesan pengguna
            chatMessages.append(`
                <div class="user-message-wrapper" style="align-self: flex-end; max-width: 82%;">
                    <div class="user-bubble" style="background: linear-gradient(135deg, #1a6cff 0%, #0a58ca 100%); color: #fff; padding: 10px 14px; border-radius: 16px 16px 4px 16px; font-size: 13px; line-height: 1.45; box-shadow: 0 2px 8px rgba(10, 88, 202, 0.25);">
                        <p class="mb-0" style="white-space: pre-wrap;">${this.escapeHtml(userMsg)}</p>
                    </div>
                </div>
            `);

            // Append Loading Indicator
            const loadingId = 'liliAppLoading_' + Date.now();
            chatMessages.append(`
                <div id="${loadingId}" class="bot-message-wrapper">
                    <div class="bot-badge-header">
                        <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                        <span>LILI - Asisten Virtual</span>
                    </div>
                    <div class="bot-bubble">
                        <div class="d-flex align-items-center gap-2 text-primary" style="font-size: 12.5px;">
                            <span class="spinner-border spinner-border-sm"></span>
                            <span>LILI sedang menganalisis regulasi &amp; panduan layanan...</span>
                        </div>
                    </div>
                </div>
            `);

            chatMessages.scrollTop(chatMessages[0]?.scrollHeight || 0);

            this.isLiliAiLoading = true;
            this.liliAiHistory.push({ role: 'user', content: userMsg });

            // Kirim request ke /guest-bot/tanya-ai
            $.ajax({
                url: '/guest-bot/tanya-ai',
                type: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Accept': 'application/json'
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    pertanyaan: userMsg,
                    history: this.liliAiHistory.slice(-6)
                })
            })
            .done((res) => {
                $(`#${loadingId}`).remove();
                this.isLiliAiLoading = false;

                const replyText = res.reply || 'Maaf, LILI tidak dapat memproses pertanyaan saat ini.';
                this.liliAiHistory.push({ role: 'assistant', content: replyText });

                let formattedReply = this.formatLiliAiReply(replyText);

                // Lampirkan Chips Aksi (Unduh PDF Syarat, Cek Tiket, dll) identik dengan login.blade
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
                            // Hanya Admin OPD yang dapat berkonsultasi ke Admin Bidang. Admin Bidang tidak menampilkan tombol ini.
                            if (userRole === 'admin_opd') {
                                actionChipsHtml += `
                                    <div class="ai-action-chip chip-admin">
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

                chatMessages.append(`
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

                // Simpan state pesan terbaru agar saat berpindah halaman dan kembali riwayat tidak hilang
                this.savedLiliChatHtml = chatMessages.html();

                if (typeof feather !== 'undefined') {
                    feather.replace();
                }

                chatMessages.scrollTop(chatMessages[0]?.scrollHeight || 0);
            })
            .fail((xhr) => {
                $(`#${loadingId}`).remove();
                this.isLiliAiLoading = false;

                let errText = 'Mohon maaf, terjadi kendala saat menghubungi server AI. Silakan coba kembali sesaat lagi.';
                try {
                    const errJson = JSON.parse(xhr.responseText);
                    if (errJson.message) errText = errJson.message;
                } catch (e) {}

                chatMessages.append(`
                    <div class="bot-message-wrapper">
                        <div class="bot-badge-header">
                            <img src="/images/lili-avatar.png" alt="LILI" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
                            <span>LILI - Asisten Virtual</span>
                        </div>
                        <div class="bot-bubble" style="border-color: #fecaca; background: #fff5f5;">
                            <p class="mb-0 text-danger"><i data-feather="alert-circle" style="width:13px;height:13px;" class="me-1"></i>${this.escapeHtml(errText)}</p>
                        </div>
                    </div>
                `);

                if (typeof feather !== 'undefined') {
                    feather.replace();
                }

                chatMessages.scrollTop(chatMessages[0]?.scrollHeight || 0);
            });
        },
    };

    let _searchConvTimer = null;
    $(document).on('input', '#searchMyConversations', function () {
        const query = $(this).val();
        clearTimeout(_searchConvTimer);
        _searchConvTimer = setTimeout(() => {
            window.ChatWidgetApp.filterConversations(query);
        }, 120);
    });

    let _searchInboxTimer = null;
    $(document).on('input', '#searchAdminInbox', function () {
        const query = $(this).val();
        clearTimeout(_searchInboxTimer);
        _searchInboxTimer = setTimeout(() => {
            window.ChatWidgetApp.filterInbox(query);
        }, 120);
    });

    $(document).on('input', '#chatInput', function () {
        const isClosed = window.ChatWidgetApp.activeConversationStatus === 'closed';
        const hasText = $(this).val().trim().length > 0;
        $('#sendMessage, #sendChatBtn').prop('disabled', isClosed || !hasText);

        // Auto-Growing Textarea (48px - 85px)
        this.style.height = '48px';
        const scrollH = this.scrollHeight;
        if (scrollH > 48) {
            this.style.height = Math.min(scrollH, 85) + 'px';
        }

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

    // ==========================================
    // LILI AI ROOM EVENT LISTENERS (AUTH USERS)
    // ==========================================
    $(document).on('click', '#btnOpenLiliFromInbox, #btnOpenLiliFromInboxList', function (e) {
        e.preventDefault();
        window.ChatWidgetApp.startLiliAiMode('inbox');
    });

    $(document).on('click', '#btnStartLiliAiAuth, #btnAppLiliAvatar', function (e) {
        e.preventDefault();
        window.ChatWidgetApp.startLiliAiMode('search');
    });

    $(document).on('click', '.ai-action-chip.chip-prompt, [data-prompt]', function (e) {
        e.preventDefault();
        const promptText = $(this).attr('data-prompt') || $(this).text().trim();
        if (promptText) {
            window.ChatWidgetApp.sendLiliAiMessage(promptText);
        }
    });

    $(document).on('click', '#btnPlayLiliVoiceApp', function (e) {
        e.stopPropagation();
        window.ChatWidgetApp.playLiliVoiceGreeting();
    });

    $(document).on('input', '#liliAppInput', function () {
        const hasText = $(this).val().trim().length > 0;
        $('#btnSendLiliApp').prop('disabled', !hasText);

        this.style.height = '48px';
        const scrollH = this.scrollHeight;
        if (scrollH > 48) {
            this.style.height = Math.min(scrollH, 85) + 'px';
        }
    });

    $(document).on('keydown', '#liliAppInput', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!$('#btnSendLiliApp').prop('disabled')) {
                window.ChatWidgetApp.sendLiliAiMessage();
            }
        }
    });

    $(document).on('click', '#btnResetLiliChat', function (e) {
        e.preventDefault();
        window.ChatWidgetApp.startLiliAiMode(window.ChatWidgetApp.previousView, true);
    });

    $(document).on('click', '.chip-admin', function (e) {
        e.preventDefault();
        if (typeof window.loadTicketSearch === 'function') {
            window.ChatWidgetApp.stopPolling();
            window.ChatWidgetApp.activeConversationId = null;
            window.ChatWidgetApp.previousView = 'search';
            window.loadTicketSearch('back');
        } else {
            $('#btnBackFromLiliAi').trigger('click');
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

    // Scroll tracking on chat messages container (WhatsApp Style Scroll Preservation)
    $(document).on('scroll', '#chatMessages', function () {
        if (window.ChatWidgetApp.activeConversationId) {
            window.ChatWidgetApp.roomScrollTops.set(String(window.ChatWidgetApp.activeConversationId), $(this).scrollTop());
        }
    });

})(window, jQuery);