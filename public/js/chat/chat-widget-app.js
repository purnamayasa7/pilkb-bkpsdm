(function (window, $) {

    "use strict";

    window.ChatWidgetApp = {

        activeConversationId: null,
        activeConversationStatus: 'open',

        pollingTimer: null,
        inboxPollingTimer: null,
        badgePollingTimer: null,

        lastMessageId: null,
        lastInboxMessageId: 0,

        isPolling: false,
        isInboxPolling: false,

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

            // document.addEventListener(
            //     'click',
            //     () => {

            //         if (!this.notificationSound) {
            //             return;
            //         }

            //         this.notificationSound.play()
            //             .then(() => {

            //                 this.notificationSound.pause();

            //                 this.notificationSound.currentTime = 0;

            //             })
            //             .catch(() => { });

            //     },
            //     {
            //         once: true
            //     }
            // );

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

            const words = name
                .trim()
                .split(/\s+/);

            if (words.length >= 2) {

                return (
                    words[0][0] +
                    words[1][0]
                ).toUpperCase();
            }

            return words[0]
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

            let isMe =
                Number(msg.sender_user_id) ===
                Number(window.ChatAuth.id);

            let senderName = this.shortName(
                msg.sender_name
            );

            let chatTime =
                this.formatChatTime(
                    msg.created_at
                );

            return `

<div class="message-row ${isMe ? 'me' : 'other'}">

    <div class="message-wrapper">

        <div class="message-info ${isMe ? 'me' : 'other'}">

            <span class="sender-name">
                ${this.escapeHtml(senderName)},
            </span>

            <span class="message-time">
                ${chatTime}
            </span>

        </div>

        <div class="message-bubble ${isMe ? 'me' : 'other'}">

            ${this.escapeHtml(msg.message)}

        </div>

    </div>

</div>

`;

        },

        // Function Render Inbox Item
        renderInboxItem(item) {

            let unreadBadge = '';

            if (item.unread > 0) {

                unreadBadge = `
            <span class="badge bg-danger rounded-pill">
                ${item.unread}
            </span>
        `;

            }

            let badge = '';

            switch (item.type) {

                case 'guest':

                    badge = `
                <span class="badge bg-success-soft text-success">
                    Tamu
                </span>
            `;
                    break;

                case 'ticket':

                    badge = `
                <span class="badge bg-primary-soft text-primary">
                    OPD
                </span>
            `;
                    break;

                case 'admin':

                    badge = `
                <span class="badge bg-primary-soft text-primary">
                    Tamu
                </span>
            `;
                    break;

                default:

                    badge = '';

            }

            return `

<div
    class="chat-item openConversation"
    data-id="${item.id}">

    <div class="chat-avatar">

        ${this.getInitials(item.nama_pengirim)}

    </div>

    <div class="chat-content">

        <div class="d-flex justify-content-between align-items-center mb-1">

            <div class="chat-name">

                ${this.escapeHtml(item.nama_pengirim)}

            </div>

            ${badge}

        </div>

        <div class="chat-preview">

            ${this.escapeHtml(item.last_message ?? 'Belum ada pesan')}

        </div>

    </div>

    <div class="chat-meta d-flex flex-column align-items-end gap-1">

        ${unreadBadge}

        <i data-feather="chevron-right"></i>

    </div>

</div>

`;

        },

        // Function Refresh Inbox
        refreshInbox(items) {

            if (!items.length) {
                return;
            }

            items.forEach(item => {
                const selector =
                    `.chat-item[data-id="${item.id}"]`;

                const oldItem =
                    $(selector);

                const newItem =
                    $(this.renderInboxItem(item));

                if (oldItem.length) {
                    oldItem.remove();
                }

                $('.chat-list').prepend(newItem);

                if (
                    Number(item.last_message_id) >
                    this.lastInboxMessageId
                ) {
                    this.lastInboxMessageId =
                        Number(item.last_message_id);
                }
            });

            feather.replace();

        },

        // Function Render Inbox List
        renderInboxList(items) {

            let html = `<div class="chat-list">`;

            if (!items.length) {

                html += `
            <div class="chat-empty">

                Belum ada pesan masuk

            </div>
        `;

            } else {
                items.forEach(item => {
                    html += this.renderInboxItem(item);
                });
            }

            html += `</div>`;

            $('.chat-body').html(html);

            feather.replace();

            if (items.length > 0) {

                this.lastInboxMessageId = Math.max(
                    ...items.map(i => Number(i.last_message_id))
                );

            } else {
                this.lastInboxMessageId = 0;
            }
        },

        // Function Unread Badge
        loadUnreadBadge() {
            $.get('/chat/unread-count', (res) => {
                const badge = $('#chatUnreadBadge');

                if (res.count > 0) {
                    badge
                        .text(
                            res.count > 99
                                ? '99+'
                                : res.count
                        ).removeClass('d-none');
                } else {
                    badge.addClass('d-none');
                }
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
        <div class="d-flex flex-column h-100">

            <div class="border-bottom bg-white p-3">

                <div class="d-flex justify-content-between align-items-center">

                    <div class="d-flex align-items-center gap-2">

                        <button
                            class="btn btn-light chat-back-btn"
                            id="btnBackInbox">

                            <i data-feather="arrow-left"></i>

                        </button>

                        <div class="small d-flex align-items-center gap-1 flex-nowrap">

                            <span class="fw-semibold text-dark">
                                Tiket :
                            </span>

                            <span
                                class="fw-semibold text-dark"
                                id="roomTicketNo">
                                -
                            </span>

                        </div>

                    </div>

                    <div class="dropdown">

                        <button
                            class="chat-menu-btn"
                            type="button"
                            data-bs-toggle="dropdown">

                            <i data-feather="more-vertical"></i>

                        </button>

                        <ul class="dropdown-menu dropdown-menu-end">

                            <li>

                                <a
                                    class="dropdown-item"
                                    href="#"
                                    id="btnCloseChat">

                                    Tutup Chat

                                </a>

                            </li>

                            <li>

                                <a
                                    class="dropdown-item"
                                    href="#"
                                    id="btnReopenChat">

                                    Buka Chat

                                </a>

                            </li>

                        </ul>

                    </div>

                </div>

            </div>

            <div
                id="chatMessages"
                class="flex-grow-1 overflow-auto p-3">
            </div>

            <div class="border-top p-2">

                <div class="chat-input-wrapper">

                    <textarea
                        id="chatInput"
                        class="form-control"
                        placeholder="Tulis pesan..."
                        rows="1"></textarea>

                    <button
                        class="chat-send-btn"
                        id="sendMessage">

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
            if (status === 'closed') {

                $('#btnCloseChat').hide();

            } else {

                $('#btnReopenChat').hide();

            }
        },

        // Function Header Chat
        updateChatHeader(res) {

            $('#roomTicketNo').text(
                res.ticket_number || '-'
            );

            $('#chatStatusBadge').remove();

            $('#roomTicketNo').after(`
        <span
            id="chatStatusBadge"
            class="badge ms-2 ${res.status === 'closed'
                    ? 'bg-danger-soft text-danger'
                    : 'bg-success-soft text-success'
                }">

            ${res.status === 'closed'
                    ? 'Closed'
                    : 'Open'
                }

        </span>
    `);

        },

        // Function Update Chat Input
        updateChatInput(status) {

            const isClosed = status === 'closed';

            $('#chatInput')
                .prop('disabled', isClosed)
                .attr(
                    'placeholder',
                    isClosed
                        ? 'Chat telah ditutup'
                        : 'Tulis pesan...'
                );

            $('#sendMessage')
                .prop('disabled', isClosed);

        },

        // Function Load Chat
        loadChat(conversationId) {
            this.stopInboxPolling();

            this.lastMessageId = null;

            this.renderedMessageIds.clear();

            this.activeConversationId = conversationId;

            this.fetchConversation(conversationId)
                .done((res) => {

                    this.activeConversationStatus = res.status;

                    this.renderChatPage(res);

                    this.startPolling();

                });
        },

        // Fetch Conversation
        fetchConversation(conversationId) {
            return $.get(`/chat/${conversationId}/messages`);
        },

        // Function Poll Messages
        pollMessages() {

            return $.get(
                `/chat/${this.activeConversationId}/poll`,
                {
                    last_message_id: this.lastMessageId ?? 0
                }
            );
        },

        // Function Poll Inbox
        pollInbox() {
            return $.get(
                '/chat/admin/inbox/poll',
                {
                    last_message_id: this.lastInboxMessageId ?? 0
                }
            );
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

        // Function Send Message
        sendMessage() {

            if (this.activeConversationStatus === 'closed') {
                return;
            }

            const input = $('#chatInput');
            const message = input.val().trim();

            if (!message) return;

            $.ajax({
                url: `/chat/${this.activeConversationId}/message`,
                method: 'POST',
                data: {
                    message: message
                },

                success: (res) => {

                    input.val('');

                    $('#chatMessages').append(
                        this.renderMessageItem({
                            sender_user_id: window.ChatAuth.id,
                            sender_name: window.ChatAuth.name,
                            message: res.message.message,
                            created_at: res.message.created_at
                        })
                    );

                    this.renderedMessageIds.add(res.message.id);

                    this.lastMessageId = res.message.id;

                    $('#chatMessages').scrollTop(
                        $('#chatMessages')[0].scrollHeight
                    );

                },

                error: (xhr) => {
                    console.error(xhr.responseJSON);
                }
            });
        },

        // Function Start Polling
        startPolling() {

            this.stopPolling();

            this.pollingTimer = setInterval(() => {

                if (!this.activeConversationId) {
                    return;
                }

                // Kalau request sebelumnya belum selesai, jangan kirim request baru
                if (this.isPolling) {
                    return;
                }

                this.isPolling = true;

                this.pollMessages()
                    .done((res) => {
                        if (res.messages.length) {
                            this.appendNewMessages(
                                res.messages
                            );
                        }
                    })

                    .fail(() => {
                        console.error(
                            "Polling gagal"
                        );
                    })

                    .always(() => {
                        // SELALU dijalankan, baik sukses maupun gagal
                        this.isPolling = false;
                    });
            }, 3000);
        },

        // Function Start Inbox Polling
        startInboxPolling() {

            this.stopInboxPolling();

            this.inboxPollingTimer = setInterval(() => {

                // Drawer sudah ditutup?
                if (!$('#chatDrawer').hasClass('show')) {
                    this.stopInboxPolling();
                    return;
                }

                if (this.activeConversationId) {
                    return;
                }

                if (this.isInboxPolling) {
                    return;
                }

                this.isInboxPolling = true;

                this.pollInbox()
                    .done((res) => {

                        // Drawer sudah ditutup saat request berlangsung
                        if (!$('#chatDrawer').hasClass('show')) {
                            return;
                        }

                        if (!res.length) {
                            return;
                        }

                        this.refreshInbox(res);

                    })

                    .fail(() => {
                        console.error(
                            "Inbox polling gagal"
                        );
                    })

                    .always(() => {
                        this.isInboxPolling = false;
                    });
            }, 3000);
        },

        // Function Start Badge Polling
        startBadgePolling() {

            if (this.badgePollingTimer) {
                return;
            }

            this.badgePollingTimer = setInterval(() => {
                this.loadUnreadBadge();
            }, 3000);

        },

        // Function Handle Visibility Change
        handleVisibilityChange() {

            if (document.hidden) {
                this.stopBadgePolling();
            } else {
                this.loadUnreadBadge();
                this.startBadgePolling();
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
    };

})(window, jQuery);