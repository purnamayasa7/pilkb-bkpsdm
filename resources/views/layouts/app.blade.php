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
    <link id="appThemeStylesheet" href="{{ asset('templatepro/css/styles.css') }}" rel="stylesheet" />
    <link id="appDarkThemeStylesheet" href="{{ asset('templatepro/css/styles-dark.css') }}" rel="stylesheet" media="not all" />
    <link rel="stylesheet" href="{{ asset('css/dark-mode-navbar.css') }}">
    <script>
        document.documentElement.classList.add('page-loading');

        (function () {
            const savedTheme = localStorage.getItem('pilkb-dark-mode');
            const useDarkMode = savedTheme === 'dark';
            const darkStylesheet = document.getElementById('appDarkThemeStylesheet');

            if (useDarkMode) {
                document.documentElement.classList.add('dark-mode');
                darkStylesheet.media = 'all';
            }
        })();
    </script>
    <style>
        html.dark-mode,
        html.dark-mode body {
            background-color: #0f172a !important;
        }

        html.dark-mode #layoutSidenav_content,
        html.dark-mode main {
            background-color: #0f172a !important;
        }

        html.dark-mode #sidenavAccordion {
            background-color: #162238 !important;
        }

        html.dark-mode #layoutSidenav_nav,
        html.dark-mode .sidenav {
            background-color: #111c2f !important;
        }

        html.dark-mode .card,
        html.dark-mode .modal-content,
        html.dark-mode .dropdown-menu {
            background-color: #182235 !important;
        }
    </style>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">

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
    <script>
        if (document.documentElement.classList.contains('dark-mode')) {
            document.body.classList.add('dark-mode');
        }
    </script>
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
            <form id="logoutForm" action="{{ route('logout') }}" method="post">
                @csrf
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Konfirmasi Logout?</h5>
                        <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">Apakah anda yakin keluar dari aplikasi?</div>
                    <div class="modal-footer"><button class="btn btn-light" type="button"
                            data-bs-dismiss="modal">
                            <i class="me-1" data-feather="arrow-left"></i>
                            Kembali
                        </button>
                        <button type="submit"
                            id="btnLogout"
                            class="btn btn-danger">
                            <i class="me-1" data-feather="log-out"></i>
                            Logout
                        </button>
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
     <div id="chatDrawer"
    class="{{ optional(Auth::user()->role)->name === 'admin_opd' ? 'chat-drawer-admin-opd' : '' }}">
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
    <script src="https://js.pusher.com/8.3.0/pusher.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/laravel-echo@1.16.1/dist/echo.iife.js"></script>
    <script>
        window.Pusher = Pusher;
        const isHttps = window.location.protocol === 'https:';
        @if(config('broadcasting.default') === 'pusher')
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: '{{ config("broadcasting.connections.pusher.key", env("PUSHER_APP_KEY")) }}',
            cluster: '{{ config("broadcasting.connections.pusher.options.cluster", env("PUSHER_APP_CLUSTER", "ap1")) }}',
            forceTLS: true,
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                }
            }
        });
        @else
        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: '{{ config("reverb.apps.apps.0.key", env("REVERB_APP_KEY")) }}',
            wsHost: isHttps ? window.location.hostname : '{{ env("REVERB_HOST", "localhost") }}',
            wsPort: isHttps ? (window.location.port || 443) : {{ env("REVERB_PORT", 8080) }},
            wssPort: isHttps ? (window.location.port || 443) : {{ env("REVERB_PORT", 8080) }},
            forceTLS: isHttps,
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                }
            }
        });
        @endif

        window.ChatAuth = {
            id: Number({{ Auth::id() }}),
            name: @json(optional(Auth::user())->nama),
            role: @json(optional(Auth::user()->role)->name)
        };
    </script>
    <script src="{{ asset('js/chat/chat-widget-app.js') }}"></script>
    <script src="{{ asset('js/dark-mode.js') }}"></script>
    @stack('scripts')
    <script>
        $(document).ready(function() {

            // =====================
            // STATE
            // =====================
            ChatWidgetApp.activeConversationStatus = 'open';
            ChatWidgetApp.activeConversationId = null;
            ChatWidgetApp.isSearching = false;

            ChatWidgetApp.init();

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

        <button
            class="btn chat-secondary-btn w-100 d-flex align-items-center justify-content-center position-relative mt-2"
            id="btnConversationList">

            <i data-feather="message-square" class="me-2 text-primary"></i>
            <span class="fw-semibold">List Percakapan</span>

            <span class="badge bg-danger rounded-pill chat-btn-unread-badge position-absolute d-none"
                style="top: 50%; right: 16px; transform: translateY(-50%); font-size: 11px; font-weight: 700; padding: 4px 8px; box-shadow: 0 2px 6px rgba(220,53,69,0.35);">
                0
            </span>

        </button>

    `, direction, animate);

                ChatWidgetApp.loadUnreadBadge();
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

            // =====================
            // LOGOUT SPINNER
            // =====================
            $('#logoutForm').on('submit', function () {

            const btn = $('#btnLogout');

            // Cegah double click
            btn.prop('disabled', true);

            // Ubah isi tombol
            btn.html(`
                <span class="spinner-border spinner-border-sm me-2"
                    role="status"
                aria-hidden="true"></span>
                Logout...
            `);
            });

            ChatWidgetApp.loadUnreadBadge();

            document.addEventListener('visibilitychange', function () {
                ChatWidgetApp.handleVisibilityChange();
            });

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
                    role === 'bidang' ||
                    ChatWidgetApp.previousView === 'inbox'
                ) {
                    loadInboxAdminFo();
                    return;
                }

                if (ChatWidgetApp.previousView === 'list') {
                    ChatWidgetApp.loadConversationList();
                    return;
                }

                loadTicketSearch('back');
            });

            $(document).on('click', '.openConversation', function(e) {
                if (ChatWidgetApp.isSelectionMode) {
                    if ($(e.target).is('.item-select-checkbox')) return;
                    const checkbox = $(this).find('.item-select-checkbox');
                    const isChecked = !checkbox.prop('checked');
                    checkbox.prop('checked', isChecked);
                    const id = Number($(this).data('id'));
                    if (isChecked) {
                        ChatWidgetApp.selectedConversationIds.add(id);
                        $(this).addClass('selected');
                    } else {
                        ChatWidgetApp.selectedConversationIds.delete(id);
                        $(this).removeClass('selected');
                    }
                    ChatWidgetApp.updateSelectionUI();
                    return;
                }

                let conversationId = $(this).data('id');
                const role = @json(optional(Auth::user()->role)->name);
                const source = (role === 'admin_bawah' || role === 'bidang') ? 'inbox' : 'list';

                ChatWidgetApp.loadChat(conversationId, source);
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

                ChatWidgetApp.stopConversationListPolling();
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
                    ChatWidgetApp.stopConversationListPolling();
                }
            });

            // =====================
            // LIST PERCAKAPAN
            // =====================
            $(document).on('click', '#btnConversationList', function(e) {
                e.preventDefault();
                ChatWidgetApp.loadConversationList();
            });

            // Btn Kembali Chat Admin OPD
            $(document).on('click', '#btnBackToChatHome', function(e) {

                e.preventDefault();

                ChatWidgetApp.stopPolling();
                ChatWidgetApp.stopInboxPolling();
                ChatWidgetApp.stopConversationListPolling();

                ChatWidgetApp.activeConversationId = null;
                ChatWidgetApp.previousView = 'search';

                loadTicketSearch('back');

            });

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

                            ChatWidgetApp.loadChat(res.conversation_id, 'search');

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
        });
    </script>
</body>

</html>