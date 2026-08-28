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

        pollingTimer: null,
        inboxPollingTimer: null,
        badgePollingTimer: null,
        convListPollingTimer: null,

        lastMessageId: null,
        lastInboxMessageId: 0,

        isPolling: false,
        isInboxPolling: false,
        isConvListPolling: false,

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

            let badgeHtml = '';
            if (item.no_tiket) {
                badgeHtml = `
                    <span class="chat-item-ticket">
                        <i data-feather="tag"></i>
                        ${this.escapeHtml(item.no_tiket)}
                    </span>
                `;
            } else {
                switch (item.type) {
                    case 'guest':
                        badgeHtml = `<span class="badge bg-success-soft text-success">Tamu</span>`;
                        break;
                    case 'ticket':
                        badgeHtml = `<span class="badge bg-primary-soft text-primary">OPD</span>`;
                        break;
                    case 'admin':
                        badgeHtml = `<span class="badge bg-info-soft text-info">Admin</span>`;
                        break;
                }
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
                ${badgeHtml}
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

            const ticketNumber = item.no_tiket
                ? this.escapeHtml(item.no_tiket)
                : 'Tanpa tiket';

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
                <span class="chat-item-ticket">
                    <i data-feather="tag"></i>
                    ${ticketNumber}
                </span>
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
        loadConversationList() {
            this.stopPolling();
            this.stopInboxPolling();
            this.stopConversationListPolling();

            this.activeConversationId = null;
            this.previousView = 'list';
            this.isSelectionMode = false;
            this.selectedConversationIds.clear();

            const body = $('.chat-body');

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

                <div class="chat-skeleton-wrapper">
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                    <div class="chat-skeleton-item"></div>
                </div>

            </div>

        </div>
    `);

            feather.replace();

            this.fetchAndRenderConversationList();
            this.startConversationListPolling();
        },

        // Function Fetch and Render Conversation List
        fetchAndRenderConversationList() {
            $.get('/chat/my-conversations')
                .done((res) => {
                    this.conversationsData = Array.isArray(res) ? res : [];
                    this.renderConversationListItems(this.conversationsData);
                })
                .fail((xhr) => {
                    console.error('Gagal memuat percakapan:', xhr.responseText);
                    $('#conversationList').html(`
                        <div class="text-center text-danger p-4">
                            <i data-feather="alert-circle" class="mb-2 text-danger" style="width:28px;height:28px;"></i>
                            <div>Gagal memuat percakapan. Silakan coba beberapa saat lagi.</div>
                        </div>
                    `);
                    feather.replace();
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

        // Function Start Conversation List Polling
        startConversationListPolling() {
            this.stopConversationListPolling();

            this.convListPollingTimer = setInterval(() => {
                if (!$('#chatDrawer').hasClass('show')) {
                    this.stopConversationListPolling();
                    return;
                }

                if (this.activeConversationId || !$('#conversationList').length) {
                    this.stopConversationListPolling();
                    return;
                }

                if (this.isConvListPolling) return;
                this.isConvListPolling = true;

                $.get('/chat/my-conversations')
                    .done((res) => {
                        if (!$('#chatDrawer').hasClass('show') || this.activeConversationId || !$('#conversationList').length) {
                            return;
                        }
                        this.conversationsData = Array.isArray(res) ? res : [];
                        const currentQuery = $('#searchMyConversations').val();
                        if (currentQuery) {
                            this.filterConversations(currentQuery);
                        } else {
                            this.renderConversationListItems(this.conversationsData);
                        }
                    })
                    .always(() => {
                        this.isConvListPolling = false;
                    });
            }, 5000);
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
            this.stopInboxPolling();
            this.stopConversationListPolling();

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

            if (!message) {
                $('#sendMessage').prop('disabled', true);
                return;
            }

            $('#sendMessage').prop('disabled', true);

            $.ajax({
                url: `/chat/${this.activeConversationId}/message`,
                method: 'POST',
                data: {
                    message: message
                },
                success: (res) => {
                    input.val('');
                    $('#sendMessage').prop('disabled', true);

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
                    const hasText = input.val().trim().length > 0;
                    $('#sendMessage').prop('disabled', this.activeConversationStatus === 'closed' || !hasText);
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