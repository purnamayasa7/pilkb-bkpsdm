(function (window) {

    "use strict";

    window.ChatWidgetLogin = {

        guestSession: null,

        init() {

            console.log("ChatWidgetLogin Init");

            this.initGuestChat();

        },

        initGuestChat() {

            function updateChatStatus(status) {
                const badge = el.chatStatusBadge;

                if (!badge) return;

                if (status === 'closed') {
                    badge.className = 'badge bg-danger-soft text-danger';
                    badge.innerText = 'Closed';
                    el.messageInput.disabled = true;
                    el.sendButton.disabled = true;
                } else {
                    badge.className = 'badge bg-success-soft text-success';
                    badge.innerText = 'Open';
                    el.messageInput.disabled = false;
                    el.sendButton.disabled = false;
                }
            }

            // Function Format Chat Time
            function formatChatTime(dateString) {

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
                    ) + ' ' + jam
                );
            }

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                .content;

            async function apiRequest(
                url,
                method = "GET",
                data = null
            ) {

                const options = {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken
                    }
                };

                if (data !== null) {
                    options.body = JSON.stringify(data);
                }

                const response = await fetch(url, options);

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Terjadi kesalahan sistem."
                    );
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

                soundEnabled: false

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
                guestBidang: document.getElementById('guestBidang'),
                guestLayanan: document.getElementById('guestLayanan'),

                guestTicket: document.getElementById('guestTicket'),
                guestTicketEmail: document.getElementById('guestTicketEmail'),

                roomTicketNo: document.getElementById('roomTicketNo'),

                chatStatusBadge: document.getElementById('chatStatusBadge'),

            };

            const pages = [
                el.pageHome,
                el.pageNewChat,
                el.pageTicket,
                el.pageRoom
            ];

            bindKeyboardEvents();

            // Function Show Page
            function showPage(activePage) {

                pages.forEach(page => {

                    page.classList.add('d-none');

                });

                activePage.classList.remove('d-none');
            }

            // Function Enter
            function bindKeyboardEvents() {
                el.messageInput?.addEventListener(
                    'keydown',
                    function (e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();

                            el.sendButton?.click();
                        }
                    }
                );
            }

            // Function Reset Guest Session
            function resetGuestSession() {
                stopPolling();

                chatState.conversationId = null;

                chatState.lastMessageId = 0;

                chatState.email = null;

                chatState.ticket = null;

                el.conversationId.value = '';

                el.roomTicketNo.innerHTML = '-';

                el.chatMessages.innerHTML = '';

                el.guestTicketEmail.value = '';

                el.guestTicket.value = '';

                el.guestNip.value = '';

                el.guestNama.value = '';

                el.guestUnitKerja.value = '';

                el.nipError.classList.add('d-none');

                el.guestEmail.value = '';

                el.guestBidang.value = '';

                el.guestLayanan.value = '';

                el.guestLayanan.innerHTML =
                    '<option>Pilih bidang terlebih dahulu</option>';

                el.guestLayanan.disabled = true;

                window.ChatWidgetLogin.guestSession = null;

            }

            // Function Bind Navigation Events
            function bindNavigationEvents() {

                document.getElementById('btnNewChat')
                    ?.addEventListener(
                        'click',
                        () => showPage(el.pageNewChat)
                    );

                document.getElementById('btnOpenTicket')
                    ?.addEventListener(
                        'click',
                        () => showPage(el.pageTicket)
                    );

                document.getElementById('backHome1')
                    ?.addEventListener(
                        'click',
                        () => showPage(el.pageHome)
                    );

                document.getElementById('backHome2')
                    ?.addEventListener(
                        'click',
                        () => showPage(el.pageHome)
                    );

            }

            // Function Bidang Change
            function bindBidangChange() {

                if (!el.guestBidang || !el.guestLayanan) {
                    return;
                }

                el.guestBidang.addEventListener(
                    'change',
                    async function () {

                        if (!this.value) {

                            el.guestLayanan.innerHTML =
                                '<option>Pilih bidang terlebih dahulu</option>';

                            el.guestLayanan.disabled = true;

                            return;

                        }

                        el.guestLayanan.innerHTML =
                            '<option>Loading...</option>';

                        el.guestLayanan.disabled = true;

                        try {

                            const response =
                                await fetch(`/get-layanan-syarat/${this.value}`);

                            const data =
                                await response.json();

                            el.guestLayanan.innerHTML =
                                '<option value="">Pilih Layanan</option>';

                            if (data.length === 0) {

                                el.guestLayanan.innerHTML +=
                                    '<option disabled>Tidak ada layanan</option>';

                            } else {

                                data.forEach(item => {

                                    el.guestLayanan.innerHTML += `
<option value="${item.id}">
    ${item.nama_layanan}
</option>
`;

                                });

                            }

                        } catch (error) {

                            console.error(error);

                            el.guestLayanan.innerHTML =
                                '<option>Gagal memuat layanan</option>';

                        } finally {
                            el.guestLayanan.disabled = false;
                            checkFormValid();
                        }
                    }
                );

                el.guestLayanan.addEventListener(
                    'change',
                    function () {

                        checkFormValid();

                    }
                );
            }

            // Function Nip Lookup
            function bindNipLookup() {

                el.btnCariNip.addEventListener(
                    'click',
                    async function () {

                        const nip = el.guestNip.value.trim();

                        el.nipError.classList.add('d-none');

                        if (nip.length !== 18) {

                            el.nipError.innerHTML =
                                'NIP harus terdiri dari 18 digit';

                            el.nipError.classList.remove('d-none');

                            return;

                        }

                        try {

                            el.btnCariNip.disabled = true;

                            el.nipLoading.classList.remove('d-none');

                            const res =
                                await apiRequest(
                                    `/guest-chat/pegawai/${nip}`
                                );

                            el.nipLoading.classList.add('d-none');

                            el.guestNama.value = res.nama;
                            el.guestUnitKerja.value = res.unit_kerja;

                            checkFormValid();

                        }
                        catch (e) {

                            el.nipLoading.classList.add('d-none');

                            el.guestNama.value = '';

                            el.guestUnitKerja.value = '';

                            el.nipError.innerHTML =
                                'NIP tidak ditemukan';

                            el.nipError.classList.remove('d-none');

                            checkFormValid();

                        }
                        finally {

                            el.btnCariNip.disabled = false;

                        }

                    }
                );

            }

            // Function Check Form Valid
            function checkFormValid() {

                const lengkap =
                    el.guestNip.value.trim().length === 18 &&
                    el.guestNama.value.trim() !== '' &&
                    el.guestUnitKerja.value.trim() !== '' &&
                    el.guestEmail.value.trim() !== '' &&
                    el.guestBidang.value !== '' &&
                    el.guestLayanan.value !== '';

                // document.getElementById('btnStartChat').disabled = !lengkap;

            }

            // Function Form Validation
            function bindFormValidation() {
                [
                    el.guestEmail,
                    el.guestBidang,
                    el.guestLayanan

                ].forEach(input => {
                    input.addEventListener(
                        'input',
                        checkFormValid
                    );

                    input.addEventListener(
                        'change',
                        checkFormValid
                    );
                });
            }

            // Function Start Conversation
            function bindStartConversation() {

                document
                    .getElementById('btnStartChat')
                    ?.addEventListener(
                        'click',
                        function () {

                            const nama =
                                el.guestNama.value.trim();

                            const email =
                                el.guestEmail.value.trim();

                            const bidangId =
                                el.guestBidang.value;

                            const layananId =
                                el.guestLayanan.value;

                            if (
                                !nama ||
                                !email ||
                                !bidangId ||
                                !layananId
                            ) {

                                alert(
                                    'Silakan lengkapi data terlebih dahulu.'
                                );

                                return;

                            }

                            window.ChatWidgetLogin.guestSession = {

                                nip: el.guestNip.value.trim(),

                                nama,

                                email,

                                bidang_id: bidangId,

                                layanan_id: layananId

                            };

                            el.conversationId.value = '';

                            showPage(el.pageRoom);

                            el.roomTicketNo.innerHTML = '-';

                            el.chatMessages.innerHTML = `
<div
    class="message-row"
    id="ticketInfoMessage">

    <div class="message-bubble system">

        Silakan tuliskan pertanyaan Anda.

    </div>

</div>
`;
                            enableSound();

                        }
                    );

            }

            // Function Resume Conversation
            function bindResumeConversation() {

                document
                    .getElementById('btnOpenConversation')
                    ?.addEventListener(
                        'click',
                        async function () {

                            const btn = this;

                            const originalHtml = btn.innerHTML;

                            const email =
                                el.guestTicketEmail.value.trim();

                            const noTiket =
                                el.guestTicket.value.trim();

                            if (!email || !noTiket) {

                                alert(
                                    "Email dan nomor tiket wajib diisi"
                                );

                                return;

                            }

                            btn.disabled = true;

                            btn.innerHTML = `
<span
class="spinner-border spinner-border-sm me-2"
role="status">
</span>
Membuka Percakapan...
`;

                            try {

                                const result =
                                    await apiRequest(
                                        "/guest-chat/resume",
                                        "POST",
                                        {
                                            email,
                                            no_tiket: noTiket
                                        }
                                    );

                                chatState.conversationId =
                                    result.conversation_id;

                                el.conversationId.value =
                                    result.conversation_id;

                                window.ChatWidgetLogin.guestSession = {

                                    nama:
                                        result.guest_name,

                                    email

                                };

                                chatState.email = email;
                                chatState.ticket = result.ticket_number;

                                el.roomTicketNo.innerHTML =
                                    result.ticket_number;

                                updateChatStatus(
                                    result.status
                                );

                                showPage(
                                    el.pageRoom
                                );

                                await loadGuestMessages(
                                    result.conversation_id,
                                    email
                                );

                                startPolling();

                            } catch (error) {

                                console.error(error);

                                alert(error.message);

                            } finally {

                                btn.disabled = false;

                                btn.innerHTML =
                                    originalHtml;

                                feather.replace();

                                enableSound();

                            }

                        }
                    );

            }

            // Function Send Message
            function bindSendMessage() {

                el.sendButton?.addEventListener(
                    "click",
                    async function () {

                        const message =
                            el.messageInput.value.trim();

                        if (!message) {
                            return;
                        }

                        try {

                            let conversationId =
                                await createConversationIfNeeded();

                            await sendGuestMessage(
                                conversationId,
                                message
                            );

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

                        }

                    }
                );

            }

            // Function Enable Sound
            function enableSound() {

                if (chatState.soundEnabled) {
                    return;
                }

                notificationSound
                    .play()
                    .then(() => {

                        notificationSound.pause();
                        notificationSound.currentTime = 0;

                        chatState.soundEnabled = true;

                    })
                    .catch(error => {
                        console.error("Enable sound gagal:", error);
                    });

            }

            // Function Play Notification
            function playNotificationSound() {

                if (!chatState.soundEnabled) {
                    return;
                }

                if (!document.hidden) {
                    return;
                }

                notificationSound.currentTime = 0;

                notificationSound.play().catch(() => { });

            }

            document.getElementById('btnBackInbox')
                ?.addEventListener('click', function () {

                    const keluar = confirm(
                        'Anda akan menutup chat. Percakapan tetap tersimpan dan dapat dibuka kembali menggunakan nomor tiket. Lanjutkan?'
                    );

                    if (!keluar) {
                        return;
                    }

                    resetGuestSession();

                    showPage(el.pageHome);
                });

            bindNavigationEvents();
            bindNipLookup();
            bindBidangChange();
            bindFormValidation();
            bindStartConversation();
            bindResumeConversation();
            bindSendMessage();

            // document.addEventListener(
            //     "visibilitychange",
            //     handleVisibilityChange
            // );

            async function createConversationIfNeeded() {

                let conversationId = el.conversationId.value;

                if (conversationId) {
                    return conversationId;
                }

                const result = await apiRequest(
                    "/guest-chat/start",
                    "POST",
                    window.ChatWidgetLogin.guestSession
                );

                conversationId = result.conversation_id;

                chatState.conversationId = conversationId;

                el.conversationId.value = conversationId;

                chatState.email =
                    window.ChatWidgetLogin.guestSession.email;

                chatState.ticket =
                    result.no_tiket;

                el.roomTicketNo.innerHTML = result.no_tiket;

                const ticketInfo =
                    document.getElementById("ticketInfoMessage");

                if (ticketInfo) {

                    ticketInfo.innerHTML = `
<div class="message-bubble system ticket-info">

    <div class="fw-bold mb-2">
        Nomor Tiket
    </div>

    <div class="d-flex align-items-center gap-2 mb-2">

        <span id="ticketNumberText">
            ${result.no_tiket}
        </span>

        <button
            type="button"
            class="btn btn-sm btn-light"
            id="copyTicketBtn">

            📋

        </button>

    </div>

    <small>
        Nomor tiket sudah dikirim ke email.
        Mohon disimpan untuk melanjutkan percakapan.
    </small>

</div>
`;

                }

                startPolling();

                return conversationId;
            }

            async function sendGuestMessage(
                conversationId,
                message
            ) {

                const result = await apiRequest(
                    `/guest-chat/${conversationId}/message`,
                    "POST",
                    {
                        message
                    }
                );

                chatState.lastMessageId = result.message_id;

            }

            function clearMessageInput() {

                el.messageInput.value = "";

                el.messageInput.focus();

            }

            // Function Start Polling
            function startPolling() {

                if (chatState.isPolling) {
                    return;
                }

                chatState.isPolling = true;

                chatState.pollingId = setInterval(() => {

                    checkNewMessages()
                        .catch(console.error);

                }, 2000);

            }

            // Function Stop Polling
            function stopPolling() {

                if (chatState.pollingId) {

                    clearInterval(chatState.pollingId);

                }

                chatState.pollingId = null;

                chatState.isPolling = false;

            }

            // Function Handle Visibility Change
            // function handleVisibilityChange() {
            //     if (document.hidden) {
            //         stopPolling();
            //     } else {
            //         if (chatState.conversationId) {
            //             startPolling();
            //         }
            //     }
            // }

            // Function Append Message
            function appendMessage({
                senderName,
                message,
                createdAt,
                isGuest
            }) {

                const chatTime = formatChatTime(createdAt);

                el.chatMessages.insertAdjacentHTML(
                    "beforeend",
                    `
<div class="message-row ${isGuest ? 'me' : 'other'}">

    <div class="message-wrapper">

        <div class="message-info ${isGuest ? 'me' : 'other'}">

            <span class="sender-name">
                ${senderName}
            </span>

            <span class="message-time">
                ${chatTime}
            </span>

        </div>

        <div class="message-bubble ${isGuest ? 'me' : 'other'}">

            ${message}

        </div>

    </div>

</div>
`
                );

                el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

            }

            async function getConversationMessages(
                conversationId,
                email
            ) {

                const response =
                    await fetch(
                        `/guest-chat/${conversationId}/messages?email=${encodeURIComponent(email)}`
                    );

                return await response.json();

            }

            function renderConversation(messages) {

                el.chatMessages.innerHTML = "";

                messages.forEach(msg => {

                    appendMessage({

                        senderName:
                            msg.sender_guest_id !== null
                                ? "Saya"
                                : "Admin",

                        message: msg.message,

                        createdAt: msg.created_at,

                        isGuest:
                            msg.sender_guest_id !== null

                    });

                });

                if (messages.length > 0) {

                    chatState.lastMessageId =
                        messages[messages.length - 1].id;

                }

            }

            async function loadGuestMessages(
                conversationId,
                email
            ) {

                try {

                    const res =
                        await getConversationMessages(
                            conversationId,
                            email
                        );

                    updateChatStatus(res.status);

                    renderConversation(
                        res.messages
                    );

                    el.chatMessages.scrollTop =
                        el.chatMessages.scrollHeight;

                } catch (error) {

                    console.error(error);
                }
            }

            async function checkNewMessages() {

                if (!chatState.conversationId) {
                    return;
                }

                const response = await fetch(
                    `/guest-chat/${chatState.conversationId}/poll?email=${encodeURIComponent(chatState.email)}&last_message_id=${chatState.lastMessageId}`
                );

                const result = await response.json();

                updateChatStatus(result.status);

                if (!result.messages.length) {
                    return;
                }

                result.messages.forEach(msg => {

                    appendMessage({

                        senderName: "Admin",

                        message: msg.message,

                        createdAt: msg.created_at,

                        isGuest: false

                    });

                    playNotificationSound();

                });

                chatState.lastMessageId =
                    result.messages[result.messages.length - 1].id;

            }

            document.addEventListener(
                'click',
                function (e) {

                    if (
                        e.target.id === 'copyTicketBtn'
                    ) {

                        const ticket =
                            document.getElementById(
                                'ticketNumberText'
                            )?.innerText;

                        navigator.clipboard
                            .writeText(ticket);

                        alert(
                            'Nomor tiket berhasil disalin'
                        );
                    }
                }
            );
        }

    };

})(window);