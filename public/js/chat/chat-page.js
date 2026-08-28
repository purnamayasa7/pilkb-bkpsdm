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
        pollingTimer: null,
        convListPollingTimer: null,
        isPolling: false,
        isConvListPolling: false,
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
            this.startConversationListPolling();
            this.bindEvents();
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
            this.stopPolling();
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
                    this.startPolling();

                    // Update unread in local state
                    const found = this.conversationsData.find(i => Number(i.id) === Number(conversationId));
                    if (found) {
                        found.unread = 0;
                        this.renderConversationList(this.conversationsData);
                    }
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

            if (shouldPlaySound && this.notificationSound) {
                this.notificationSound.pause();
                this.notificationSound.currentTime = 0;
                this.notificationSound.play().catch(() => {});
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

        sendMessage() {
            if (this.activeConversationStatus === 'closed') return;
            const input = $('#waChatInput');
            const message = input.val().trim();
            if (!message) {
                $('#waSendMessage').prop('disabled', true);
                return;
            }

            $('#waSendMessage').prop('disabled', true);

            $.ajax({
                url: `/chat/${this.activeConversationId}/message`,
                method: 'POST',
                data: { message: message },
                success: (res) => {
                    input.val('');
                    $('#waSendMessage').prop('disabled', true);

                    const box = $('#waMessagesBox');
                    box.append(this.renderMessageItem({
                        sender_user_id: window.ChatAuth?.id,
                        sender_name: window.ChatAuth?.name,
                        message: res.message.message,
                        created_at: res.message.created_at
                    }));

                    this.renderedMessageIds.add(res.message.id);
                    this.lastMessageId = res.message.id;
                    box.scrollTop(box[0].scrollHeight);

                    // Update last message in list
                    const found = this.conversationsData.find(i => Number(i.id) === Number(this.activeConversationId));
                    if (found) {
                        found.last_message = res.message.message;
                        found.last_message_time = res.message.created_at;
                        found.is_last_from_me = true;
                        this.renderConversationList(this.conversationsData);
                    }
                },
                error: (xhr) => {
                    console.error(xhr.responseJSON);
                    const hasText = input.val().trim().length > 0;
                    $('#waSendMessage').prop('disabled', this.activeConversationStatus === 'closed' || !hasText);
                }
            });
        },

        // Polling Room
        startPolling() {
            this.stopPolling();
            this.pollingTimer = setInterval(() => {
                if (!this.activeConversationId || this.isPolling) return;
                this.isPolling = true;

                $.get(`/chat/${this.activeConversationId}/poll`, {
                    last_message_id: this.lastMessageId ?? 0
                })
                .done((res) => {
                    if (res.status && res.status !== this.activeConversationStatus) {
                        this.activeConversationStatus = res.status;
                        if (this.activeConversationData) {
                            this.activeConversationData.status = res.status;
                            this.renderRoomHeader(this.activeConversationData);
                            this.updateChatInput(res.status);
                        }
                    }

                    if (res.messages && res.messages.length) {
                        this.appendNewMessages(res.messages);
                    }
                })
                .always(() => {
                    this.isPolling = false;
                });
            }, 2500);
        },

        stopPolling() {
            if (this.pollingTimer) {
                clearInterval(this.pollingTimer);
                this.pollingTimer = null;
            }
        },

        // Polling List
        startConversationListPolling() {
            this.stopConversationListPolling();
            this.convListPollingTimer = setInterval(() => {
                if (this.isConvListPolling) return;
                this.isConvListPolling = true;

                const role = window.ChatAuth?.role || '';
                const url = (role === 'admin_bawah' || role === 'bidang') ? '/chat/admin/inbox/poll' : '/chat/my-conversations';

                $.get(url)
                    .done((res) => {
                        if (Array.isArray(res) && res.length) {
                            this.conversationsData = res;
                            if (!this.isSelectionMode) {
                                this.renderConversationList(this.conversationsData);
                            }
                        }
                    })
                    .always(() => {
                        this.isConvListPolling = false;
                    });
            }, 4000);
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
            });

            $(document).on('keydown', '#waChatInput', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!$('#waSendMessage').prop('disabled')) {
                        self.sendMessage();
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
