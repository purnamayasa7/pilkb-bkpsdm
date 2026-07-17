<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>PILKB</title>
    <link href="https://cdn.jsdelivr.net/npm/litepicker/dist/css/litepicker.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/style.min.css" rel="stylesheet" />
    <link href="{{ asset('templatepro/css/styles.css') }}" rel="stylesheet" />
    <link rel="icon" type="image/png" href="{{ asset('images/KabBuleleng.png') }}">
    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-datepicker@1.10.0/dist/css/bootstrap-datepicker.min.css">
    <link rel="stylesheet" href="{{ asset('css/chat-widget.css') }}">
    <link rel="stylesheet" href="{{ asset('css/index.css') }}">
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

            <span
                id="chatUnreadBadge"
                class="chat-unread-badge d-none">
                0
            </span>

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
    <script src="{{ asset('js/chat/chat-widget-app.js') }}"></script>
    @stack('scripts')
    <script>
        $(document).ready(function() {
            ChatWidgetApp.init();

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
            ChatWidgetApp.activeConversationStatus = 'open';
            ChatWidgetApp.activeConversationId = null;
            ChatWidgetApp.isSearching = false;

            function loadTicketSearch(direction = 'back', animate = true) {

                const userName = ChatWidgetApp.shortName(
    window.ChatAuth.name || 'Pengguna'
);

                renderPage(`

        <div class="chat-welcome-card">

            <div class="chat-welcome-icon">
                <span class="wave-hand">👋</span>
            </div>

            <h6>Hai, ${ChatWidgetApp.escapeHtml(userName)}!</h6>

            <p>
                Silakan masukkan nomor tiket untuk memulai percakapan.
            </p>

        </div>

        <div class="mb-3">

            <label class="form-label fw-semibold text-dark">
                Nomor Tiket
            </label>

            <input
                type="text"
                class="form-control text-dark"
                id="ticketNumber"
                placeholder="Masukkan nomor tiket">

        </div>

        <button
    class="btn chat-gradient-btn w-100 d-flex align-items-center justify-content-center"
    id="searchTicket">

    <i data-feather="search" class="me-2"></i>
    Cari Tiket

</button>

    `, direction, animate);
            }

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
            }

            initUI();

            ChatWidgetApp.loadUnreadBadge();
            ChatWidgetApp.startBadgePolling();

            document.addEventListener(
    "visibilitychange",
    function () {

        ChatWidgetApp.handleVisibilityChange();

    }
);
            
            // =====================
            // RENDER PAGE
            // =====================
            function renderPage(html, direction = 'forward', animate = true) {

    const body = $('.chat-body');
    const currentPage = body.find('.chat-page');

    const newPage = $(`<div class="chat-page">${html}</div>`);

    // Tidak ada halaman sebelumnya
    if (!currentPage.length || !animate) {

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

            function loadInboxAdminFo() {

    $.get('/chat/admin/inbox')
    .done(function(res){

        ChatWidgetApp.renderInboxList(res);

        ChatWidgetApp.startInboxPolling();

    })
    .fail(function(){

        console.error("Gagal memuat inbox");

    });


}

            $(document).on('click', '#btnBackInbox', function() {

            ChatWidgetApp.stopPolling();
            
                ChatWidgetApp.activeConversationId = null;

                const role = @json(optional(Auth::user()->role)->name);

                if (
                    role === 'admin_bawah' ||
                    role === 'bidang'
                ) {
                    loadInboxAdminFo();
                    return;
                }

                loadTicketSearch('back');
            });

            // setInterval(function() {

            //     if (!window.activeConversationId) {
            //         return;
            //     }

            //     $.get(
            //         `/chat/${window.activeConversationId}/messages`,
            //         function(res) {

            //             renderMessages(res);
            //         }
            //     );

            // }, 3000);

            $(document).on('click', '.openConversation', function() {

                let conversationId = $(this).data('id');

                ChatWidgetApp.loadChat(conversationId);
            });

            // =====================
            // DRAWER
            // =====================
            $('#openChatDrawer').on('click', function(e){

    e.stopPropagation();

    const drawer = $('#chatDrawer');

    drawer.toggleClass('show');

    if(!drawer.hasClass('show')){
        return;
    }

    const role = @json(optional(Auth::user()->role)->name);

    if(
        role === 'admin_bawah' ||
        role === 'bidang'
    ){

        if(!ChatWidgetApp.activeConversationId){
            loadInboxAdminFo();
        }

    }else{

       if(!ChatWidgetApp.activeConversationId){

        loadTicketSearch('back', false);

    }

    }

});

            $('#closeChatDrawer').on('click', function() {

    $('#chatDrawer').removeClass('show');

    ChatWidgetApp.stopPolling();

    ChatWidgetApp.stopInboxPolling();
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
                    ChatWidgetApp.stopPolling();

ChatWidgetApp.stopInboxPolling();

                }
            });

            // =====================
            // CEK TIKET
            // =====================
            // $(document).on('click', '#btnCekTiket', function() {

            //     renderPage(`
            //         <button class="btn btn-link p-0 mb-3" id="backToMenu">← Kembali</button>

            //         <div class="mb-3">
            //             <label>Nomor Tiket</label>
            //             <input type="text" class="form-control" id="ticketNumber">
            //         </div>

            //         <button class="btn btn-primary w-100" id="searchTicket">
            //             Cari Tiket
            //         </button>
            //     `, 'forward');
            // });

            // =====================
            // SEARCH TIKET
            // =====================
            $(document).on('click', '#searchTicket', function(e) {

                e.preventDefault();

                if (ChatWidgetApp.isSearching) return;
                ChatWidgetApp.isSearching = true;

                const btn = $(this);
                let nomorTiket = $('#ticketNumber').val();

                if (!nomorTiket) {
                    alert('Masukkan nomor tiket');
                    ChatWidgetApp.isSearching = false;
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

                        ChatWidgetApp.isSearching = false;
                        btn.prop('disabled', false).html('Cari Tiket');

                        if (!res.success) {
                            alert(res.message);
                            return;
                        }

                        renderPage(`
                    <button class="btn btn-link p-0 mb-3" id="backToMenu">← Kembali</button>

                    <div class="ticket-result-card mb-3">

    <div class="ticket-result-header">

        <i data-feather="tag"></i>

        <span>
            Tiket Ditemukan!
        </span>

    </div>

    <div class="ticket-result-number">

        ${ChatWidgetApp.escapeHtml(res.tiket.no_tiket)}

    </div>

    <div class="ticket-result-service">

        ${ChatWidgetApp.escapeHtml(res.tiket.layanan)}

    </div>

    <div class="ticket-result-status">

        <span class="
            badge
            ${res.tiket.status === 'open'
                ? 'bg-success-soft text-success'
                : 'bg-danger-soft text-danger'}
        ">

            ${ChatWidgetApp.escapeHtml(res.tiket.status)}

        </span>

    </div>

</div>

                    <button
    class="btn chat-gradient-btn w-100"
    id="startChat"
    data-id="${res.tiket.no_tiket}">

    <i
        data-feather="message-circle"
        class="me-2">
    </i>

    Mulai Chat

</button>
                `, 'forward');
                    },
                    error: function(xhr) {

                        ChatWidgetApp.isSearching = false;
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

                const btn = $(this);

                const originalHtml = btn.html();

                btn.prop('disabled', true);

                btn.html(`
        <span
            class="spinner-border spinner-border-sm me-2">
        </span>
        Membuka Chat...
    `);

                let noTiket = btn.data('id');

                $.ajax({
                    url: '/chat/start-ticket',
                    method: 'POST',
                    data: {
                        no_tiket: noTiket,
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(res) {

                        btn.prop('disabled', false);
                        btn.html(originalHtml);

                        if (res.conversation_id) {

                            ChatWidgetApp.loadChat(res.conversation_id);

                            $('#chatDrawer').addClass('show');

                        } else {

                            alert('Chat gagal dibuat');
                        }

                        feather.replace();
                    },
                    error: function(xhr) {

                        btn.prop('disabled', false);

                        btn.html(`
    <span class="spinner-border spinner-border-sm me-2"></span>
    Menyiapkan Percakapan...
`);

                        btn.html(originalHtml);

                        feather.replace();

                        console.log(xhr.responseText);

                        alert('Server error saat membuat chat');
                    }
                });
            });

            // =====================
            // GLOBAL CHAT
            // =====================
            // $(document).on('click', '#btnTanyaAdmin', function() {

            //     $.ajax({
            //         url: '/chat/start-global',
            //         method: 'POST',
            //         data: {
            //             _token: "{{ csrf_token() }}"
            //         },
            //         success: function(res) {

            //             if (res.conversation_id) {
            //                 loadChat(res.conversation_id);
            //                 $('#chatDrawer').addClass('show');
            //             } else {
            //                 alert('Gagal membuka chat FO');
            //             }
            //         },
            //         error: function(xhr) {
            //             console.log(xhr.responseText);
            //             alert('Server error FO chat');
            //         }
            //     });
            // });


            // =====================
            // SEND MESSAGE (FIXED)
            // =====================
            $(document).on('click', '#sendMessage', function () {
                ChatWidgetApp.sendMessage();
            });

            // =====================
            // BACK
            // =====================
            $(document).on('click', '#backToMenu', function() {
                loadTicketSearch('back');
            });

            $(document).on(
    'click',
    '#btnCloseChat',
    function(e) {

        e.preventDefault();

        ChatWidgetApp.closeChat();

    }
);

            $(document).on(
    'click',
    '#btnReopenChat',
    function(e) {

        e.preventDefault();

        ChatWidgetApp.reopenChat();

    }
);

            // Enter
            $(document).on('keydown', '#chatInput', function(e) {

                if (e.key === 'Enter' && !e.shiftKey) {

                    e.preventDefault();

                    $('#sendMessage').click();
                }
            });

            // Auto Height Text
            $(document).on('input', '#chatInput', function() {

                this.style.height = 'auto';

                this.style.height = this.scrollHeight + 'px';
            });

            $(window).on('beforeunload', function () {

    ChatWidgetApp.stopBadgePolling();

});
        });
    </script>
</body>

</html>