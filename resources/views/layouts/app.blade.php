<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <title>PILKB</title>
    <link href="https://cdn.jsdelivr.net/npm/litepicker/dist/css/litepicker.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/style.min.css" rel="stylesheet" />
    <link href="{{ asset('templatepro/css/styles.css') }}" rel="stylesheet" />
    <link rel="icon" type="image/png" href="{{ asset('images/KabBuleleng.png') }}">
    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-datepicker@1.10.0/dist/css/bootstrap-datepicker.min.css">
    <link rel="stylesheet" href="{{ asset('css/chat-widget.css') }}">
    <script data-search-pseudo-elements defer src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/js/all.min.js"
        crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.29.0/feather.min.js" crossorigin="anonymous">
    </script>
    @stack('styles')
</head>

<body class="nav-fixed">
    {{-- Navbar --}}
    @include('layouts.navbar')

    @include('components.toast')

    <div id="layoutSidenav">
        {{-- Sidebar --}}
        @include('layouts.sidebar')
        <div id="layoutSidenav_content">
            <main>
                @yield('content')
            </main>
            {{-- Footer --}}
            @include('layouts.footer')
        </div>
    </div>

    <!-- Logout Modal-->
    {{-- <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <form action="{{ route('logout') }}" method="post">
    @csrf
    @method('POST')
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Konfirmasi Logout?</h5>
            <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
            </button>
        </div>
        <div class="modal-body">Apakah anda yakin keluar dari aplikasi?</div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" type="button"
                data-dismiss="modal">Kembali</button>
            <button type="submit" class="btn btn-primary">Logout</a>
        </div>
    </div>
    </form>
    </div>
    </div> --}}

    <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <form action="{{ route('logout') }}" method="post">
                @csrf
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Konfirmasi Logout?</h5>
                        <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">Apakah anda yakin keluar dari aplikasi?</div>
                    <div class="modal-footer"><button class="btn btn-light" type="button"
                            data-bs-dismiss="modal">Kembali</button><button type="submit"
                            class="btn btn-primary">Logout</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Floating Chat Button -->
    <div id="chatFloatingButton">
        <button type="button" id="openChatDrawer">
            <i data-feather="message-square"></i>
        </button>
    </div>

    <!-- Chat Drawer -->
    <div id="chatDrawer">
        <!-- Header -->
        <div class="chat-header">
            <div class="chat-header-info">
                <!-- <div class="chat-avatar">
                    <i data-feather="message-square"></i>
                </div> -->

                <div>
                    <div class="fw-bold">
                        Pusat Bantuan PILKB
                    </div>

                    <small class="text-white-50">
                        BKPSDM Kabupaten Buleleng
                    </small>
                </div>
            </div>

            <button
                type="button"
                class="btn-close btn-close-white"
                id="closeChatDrawer">
            </button>
        </div>

        <!-- Body -->
        <div class="chat-body">
            <div class="text-center text-muted p-4">
                Loading...
            </div>
        </div>
    </div>


    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous">
    </script>
    <script src="{{ asset('templatepro/js/scripts.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.min.js" crossorigin="anonymous"></script>
    {{-- <script src="{{ asset('templatepro/assets/demo/chart-area-demo.js') }}"></script>
    <script src="{{ asset('templatepro/assets/demo/chart-bar-demo.js') }}"></script>
    <script src="{{ asset('templatepro/assets/demo/chart-pie-demo.js') }}"></script> --}}
    <script src="https://cdn.jsdelivr.net/npm/litepicker/dist/bundle.js" crossorigin="anonymous"></script>
    <script src="{{ asset('templatepro/js/litepicker.js') }}"></script>
    <!-- <script src="https://unpkg.com/feather-icons"></script> -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap-datepicker@1.10.0/dist/js/bootstrap-datepicker.min.js"></script>
    @stack('scripts')
    <script>
$(document).ready(function() {

    // =====================
    // AUTH
    // =====================
    window.ChatAuth = {
        id: Number({{ Auth::id() }}),
        name: @json(optional(Auth::user())->nama)
    };

    // =====================
    // STATE
    // =====================
    let activeConversationId = null;
    let isSearching = false;

    // =====================
    // INIT
    // =====================
    function initUI() {

    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    document.querySelectorAll('.toast').forEach(function(el) {
        new bootstrap.Toast(el, {
            delay: 5000
        }).show();
    });

    const role = @json(optional(Auth::user()->role)->name);

    if (
    role === 'admin_bawah' ||
    role === 'bidang'
) {
    loadInboxAdminFo();
} else {
    loadMainMenu();
}
    }

    initUI();

    // =====================
    // SAFE HTML ESCAPE (WAJIB)
    // =====================
    function escapeHtml(text) {
        return String(text ?? '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Format Jam pada pengirim dan penerima chat
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
        'id-ID',
        {
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
            'id-ID',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }
        ) +
        ' ' +
        jam
    );
}

    // =====================
    // RENDER PAGE
    // =====================
    function renderPage(html, direction = 'forward') {

        const body = $('.chat-body');
        const currentPage = body.find('.chat-page');

        const newPage = $(`<div class="chat-page">${html}</div>`);

        if (!currentPage.length) {
    body.html(newPage);

    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    return;
}

        if (direction === 'forward') {
            newPage.addClass('page-enter-right');
            body.append(newPage);

            requestAnimationFrame(() => {
                newPage.addClass('page-enter-right-active');
                currentPage.addClass('page-exit-left-active');
            });

        } else {
            newPage.addClass('page-enter-left');
            body.append(newPage);

            requestAnimationFrame(() => {
                newPage.addClass('page-enter-left-active');
                currentPage.addClass('page-exit-right-active');
            });
        }

        setTimeout(() => {
            currentPage.remove();
            newPage.removeClass(
                'page-enter-right page-enter-right-active page-enter-left page-enter-left-active'
            );
            feather.replace();
        }, 300);
    }

    // =====================
    // MAIN MENU
    // =====================
    function loadMainMenu(direction = 'back') {

        renderPage(`
            <div class="help-card" id="btnCekTiket">
                <div>
                    <h6 class="mb-1">Cek Tiket</h6>
                    <small>Cari tiket & mulai chat</small>
                </div>
                <i data-feather="chevron-right"></i>
            </div>

            <div class="help-card" id="btnTanyaAdmin">
                <div>
                    <h6 class="mb-1">Tanya Admin FO</h6>
                    <small>Chat langsung dengan FO</small>
                </div>
                <i data-feather="chevron-right"></i>
            </div>
        `, direction);
    }

    function loadInboxAdminFo() {

    $.get('/chat/admin/inbox', function(res) {

        let html = `<div class="chat-list">`;

        if (!res.length) {

            html += `
                <div class="chat-empty">
                    Belum ada pesan masuk
                </div>
            `;

        } else {

            res.forEach(item => {

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

                html += `
                    <div
                        class="chat-item openConversation"
                        data-id="${item.id}">

                        <div class="chat-avatar">
                            ${getInitials(item.nama_pengirim)}
                        </div>

                        <div class="chat-content">

                            <div class="d-flex justify-content-between align-items-center mb-1">

                                <div class="chat-name">
                                    ${escapeHtml(item.nama_pengirim)}
                                </div>

                                ${badge}

                            </div>

                            <div class="chat-preview">
                                ${escapeHtml(item.last_message ?? 'Belum ada pesan')}
                            </div>

                        </div>

                        <div class="chat-meta">
                            <i data-feather="chevron-right"></i>
                        </div>

                    </div>
                `;
            });
        }

        html += `</div>`;

        $('.chat-body').html(html);

        feather.replace();
    });
}

$(document).on('click', '#btnBackInbox', function() {

    activeConversationId = null;

    const role = @json(optional(Auth::user()->role)->name);

    if (
        role === 'admin_bawah' ||
        role === 'bidang'
    ) {
        loadInboxAdminFo();
    } else {
        loadMainMenu();
    }
});

// setInterval(function() {

//     if (!activeConversationId) {
//         return;
//     }

//     $.get(
//         `/chat/${activeConversationId}/messages`,
//         function(res) {

//             renderMessages(res);
//         }
//     );

// }, 3000);

$(document).on('click', '.openConversation', function() {

    let conversationId = $(this).data('id');

    loadChat(conversationId);
});

    // =====================
    // DRAWER
    // =====================
    $('#openChatDrawer').on('click', function(e) {
        e.stopPropagation();
        $('#chatDrawer').toggleClass('show');
    });

    $('#closeChatDrawer').on('click', function() {
        $('#chatDrawer').removeClass('show');
    });

    $(document).on('mouseup', function(e) {
        let drawer = $('#chatDrawer');
        let button = $('#openChatDrawer');

        if (
            drawer.hasClass('show') &&
            !drawer.is(e.target) &&
            drawer.has(e.target).length === 0 &&
            !button.is(e.target) &&
            button.has(e.target).length === 0
        ) {
            drawer.removeClass('show');
        }
    });

    // =====================
    // CEK TIKET
    // =====================
    $(document).on('click', '#btnCekTiket', function() {

        renderPage(`
            <button class="btn btn-link p-0 mb-3" id="backToMenu">← Kembali</button>

            <div class="mb-3">
                <label>Nomor Tiket</label>
                <input type="text" class="form-control" id="ticketNumber">
            </div>

            <button class="btn btn-primary w-100" id="searchTicket">
                Cari Tiket
            </button>
        `, 'forward');
    });

    // =====================
    // SEARCH TIKET
    // =====================
    $(document).on('click', '#searchTicket', function(e) {

        e.preventDefault();

        if (isSearching) return;
        isSearching = true;

        const btn = $(this);
        let nomorTiket = $('#ticketNumber').val();

        if (!nomorTiket) {
            alert('Masukkan nomor tiket');
            isSearching = false;
            return;
        }

        btn.prop('disabled', true).html(`
            <span class="spinner-border spinner-border-sm"></span> Mencari...
        `);

        $.ajax({
            url: '/chat/search-ticket',
            method: 'POST',
            data: {
                no_tiket: nomorTiket,
                _token: "{{ csrf_token() }}"
            },
            success: function(res) {

                isSearching = false;
                btn.prop('disabled', false).html('Cari Tiket');

                if (!res.success) {
                    alert(res.message);
                    return;
                }

                renderPage(`
                    <button class="btn btn-link p-0 mb-3" id="backToMenu">← Kembali</button>

                    <div class="card p-3 mb-3">
                        <b>${escapeHtml(res.tiket.no_tiket)}</b><br>
                        ${escapeHtml(res.tiket.layanan)}<br>
                        Status: ${escapeHtml(res.tiket.status)}
                    </div>

                    <button class="btn btn-primary w-100"
                        id="startChat"
                        data-id="${res.tiket.no_tiket}">
                        Mulai Chat
                    </button>
                `, 'forward');
            },
            error: function(xhr) {

                isSearching = false;
                btn.prop('disabled', false).html('Cari Tiket');

                console.log(xhr.responseText);
                alert('Gagal mencari tiket');
            }
        });
    });

    // =====================
    // START CHAT
    // =====================
    $(document).on('click', '#startChat', function() {

        let noTiket = $(this).data('id');

        $.ajax({
            url: '/chat/start-ticket',
            method: 'POST',
            data: {
                no_tiket: noTiket,
                _token: "{{ csrf_token() }}"
            },
            success: function(res) {

                if (res.conversation_id) {
                    loadChat(res.conversation_id);
                    $('#chatDrawer').addClass('show');
                } else {
                    alert('Chat gagal dibuat');
                }
            },
            error: function(xhr) {
                console.log(xhr.responseText);
                alert('Server error saat membuat chat');
            }
        });
    });

    // =====================
    // GLOBAL CHAT
    // =====================
    $(document).on('click', '#btnTanyaAdmin', function() {

        $.ajax({
            url: '/chat/start-global',
            method: 'POST',
            data: {
                _token: "{{ csrf_token() }}"
            },
            success: function(res) {

                if (res.conversation_id) {
                    loadChat(res.conversation_id);
                    $('#chatDrawer').addClass('show');
                } else {
                    alert('Gagal membuka chat FO');
                }
            },
            error: function(xhr) {
                console.log(xhr.responseText);
                alert('Server error FO chat');
            }
        });
    });

    // =====================
    // LOAD CHAT
    // =====================
   function loadChat(conversationId) {

    activeConversationId = conversationId;

    $.get(`/chat/${conversationId}/messages`, function(res) {

        let html = `
        <div class="d-flex flex-column h-100">

           <div class="border-bottom bg-white p-3">

    <div class="d-flex align-items-center gap-2">

        <button
            class="btn btn-light chat-back-btn"
            id="btnBackInbox">

            <i data-feather="arrow-left"></i>
        </button>

        <div class="small d-flex align-items-center gap-1">

    <span class="fw-bold">No Tiket :</span>

    <span
        class="fw-bold"
        id="roomTicketNo">
        -
    </span>

</div>

    </div>

</div>

            <div
                id="chatMessages"
                class="flex-grow-1 overflow-auto p-3">
            </div>

            <div class="border-top p-2">

                <div class="chat-input-wrapper">

    <input
        type="text"
        id="chatInput"
        class="form-control"
        placeholder="Tulis pesan...">

    <button
        class="chat-send-btn"
        id="sendMessage">

        <i data-feather="navigation"></i>

    </button>

</div>

            </div>

        </div>
        `;

        $('.chat-body').html(html);

        renderMessages(res.messages);

        $('#roomTicketNo').text(
    res.ticket_number || '-'
);

        feather.replace();
    });
}

    // =====================
    // RENDER MESSAGES (FIXED)
    // =====================
    function renderMessages(messages) {

    let box = $('#chatMessages');

    if (!box.length) return;

    box.html('');

    messages.forEach(msg => {

        let isMe =
            Number(msg.sender_user_id) ===
            Number(window.ChatAuth.id);

        let senderName =
            msg.sender_name || 'Unknown';

        let chatTime =
    formatChatTime(
        msg.created_at
    );

        box.append(`

<div class="message-row ${isMe ? 'me' : 'other'}">

    <div class="message-wrapper">

        <div class="message-info ${isMe ? 'me' : 'other'}">

            <span class="sender-name">
                ${escapeHtml(senderName)}
            </span>

            <span class="message-time">
                ${chatTime}
            </span>

        </div>

        <div class="message-bubble ${isMe ? 'me' : 'other'}">

            ${escapeHtml(msg.message)}

        </div>

    </div>

</div>

`);
    });

    box.scrollTop(box[0].scrollHeight);
}

    // =====================
    // SEND MESSAGE (FIXED)
    // =====================
    $(document).on('click', '#sendMessage', function() {

        let input = $('#chatInput');
        let message = input.val();

        if (!message.trim()) return;

        $.ajax({
            url: `/chat/${activeConversationId}/message`,
            method: 'POST',
            data: {
                message: message,
                _token: "{{ csrf_token() }}"
            },
            success: function(res) {

    input.val('');

    let box = $('#chatMessages');

    if (!box.length) return;

    box.append(`

<div class="message-row me">

    <div class="message-wrapper">

        <div class="message-info me">

            <span class="sender-name">
                ${escapeHtml(window.ChatAuth.name)}
            </span>

            <span class="message-time">
    ${formatChatTime(
        res.message.created_at ??
        new Date()
    )}
</span>

        </div>

        <div class="message-bubble me">

            ${escapeHtml(res.message.message)}

        </div>

    </div>

</div>

`);

    box.scrollTop(box[0].scrollHeight);
}
        });
    });

    // =====================
    // BACK
    // =====================
    $(document).on('click', '#backToMenu', function() {
        loadMainMenu('back');
    });

    function getInitials(name) {

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
}

// Enter
$(document).on('keypress', '#chatInput', function(e){

    if(e.which === 13){

        e.preventDefault();

        $('#sendMessage').click();
    }
});
});
</script>
</body>

</html>