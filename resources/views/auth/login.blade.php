<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="PILKB">
    <title>PILKB</title>

    {{-- <link rel="stylesheet" href="{{ asset('resources/css/login.css') }}"> --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    <link rel="stylesheet" href="{{ asset('css/chat-widget.css') }}">
</head>

<body>
    <!-- Modal FAQ -->
    <div class="modal fade" id="modalFaq" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content border-0 shadow">
                {{-- Header --}}
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title d-flex align-items-center">
                        <i data-feather="help-circle" class="me-2"></i>
                        Pusat Bantuan & FAQ
                    </h5>

                    <button
                        type="button"
                        class="btn-close btn-close-white"
                        data-bs-dismiss="modal">
                    </button>
                </div>

                {{-- Body --}}
                <div class="modal-body">
                    {{-- Informasi --}}
                    <div class="alert alert-primary d-flex align-items-center">
                        <i data-feather="info" class="me-2"></i>
                        <span>
                            Cari pertanyaan atau klik salah satu FAQ untuk melihat jawaban.
                        </span>
                    </div>

                    {{-- Search --}}
                    <div class="mb-4">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i data-feather="search"></i>
                            </span>

                            <input
                                type="text"
                                id="faqSearch"
                                class="form-control"
                                placeholder="Cari pertanyaan atau jawaban...">
                        </div>
                    </div>

                    {{-- FAQ --}}
                    @if($faq->count())
                    <div class="accordion accordion-flush" id="accordionFaq">
                        @foreach($faq as $index => $item)
                        <div class="accordion-item faq-item">
                            <h2 class="accordion-header">
                                <button
                                    class="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#faq{{ $item->id }}"
                                    aria-expanded="{{ $index == 0 ? 'true' : 'false' }}">
                                    <i
                                        data-feather="help-circle"
                                        class="me-2 text-primary">
                                    </i>
                                    {{ $item->pertanyaan }}
                                </button>
                            </h2>

                            <div
                                id="faq{{ $item->id }}"
                                class="accordion-collapse collapse"
                                data-bs-parent="#accordionFaq">

                                <div class="accordion-body">
                                    {!! nl2br(e($item->jawaban)) !!}
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>

                    @else

                    <div class="text-center py-5">
                        <i
                            data-feather="help-circle"
                            style="width:60px;height:60px"
                            class="text-muted mb-3">
                        </i>

                        <h5 class="text-muted">
                            Belum ada FAQ tersedia
                        </h5>
                    </div>

                    @endif

                    {{-- Pesan jika hasil pencarian kosong --}}
                    <div
                        id="faqNotFound"
                        class="alert alert-warning mt-3 d-none">
                        FAQ tidak ditemukan.
                    </div>
                </div>

                {{-- Footer --}}
                <div class="modal-footer">
                    <button
                        class="btn btn-primary"
                        data-bs-dismiss="modal">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Syarat -->
    <div class="modal fade"
        id="modalSyarat"
        tabindex="-1">

        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        Lihat Syarat Layanan
                    </h5>
                    <button
                        type="button"
                        class="btn-close btn-close-white"
                        data-bs-dismiss="modal">
                    </button>
                </div>

                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">
                            Bidang
                        </label>

                        <select
                            id="modalBidang"
                            class="form-select">

                            <option value="">
                                Pilih Bidang
                            </option>

                            @foreach($bidang as $item)

                            <option value="{{ $item->id }}">
                                {{ $item->nama_bidang }}
                            </option>

                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">
                            Layanan
                        </label>

                        <select
                            id="modalLayanan"
                            class="form-select"
                            disabled>

                            <option>
                                Pilih bidang terlebih dahulu
                            </option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer">

                    <button
                        class="btn btn-light"
                        data-bs-dismiss="modal">
                        Tutup
                    </button>

                    <button
                        type="button"
                        id="btnLihatPdf"
                        class="btn btn-primary">

                        <i data-feather="file-text"></i>
                        Lihat PDF
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="card login-card border-0">
        <div class="row g-0">

            <!-- LEFT -->
            <div class="col-md-6 left-box">
                <div class="left-content">

                    <!-- HEADER -->
                    <div class="d-flex align-items-center mb-3">
                        <img src="{{ asset('images/KabBuleleng.png') }}" class="logo me-3">
                        <div>
                            <h6 class="mb-0 fw-semibold text-uppercase small; brand-text">
                                BKPSDM Kabupaten Buleleng
                            </h6>
                            <small class="opacity-75">Sistem Layanan Kepegawaian</small>
                        </div>
                    </div>

                    <!-- TITLE -->
                    <h1 class="fw-bold display-6 mb-2">PILKB</h1>

                    <!-- ACCENT LINE -->
                    <div class="accent-line mb-2"></div>

                    <!-- TAGLINE -->
                    <p class="lead mb-3">Pusat Informasi Layanan Kepegawaian BKPSDM Buleleng</p>

                    {{-- <div class="badge bg-light text-dark px-3 py-2 rounded-pill">
                        Versi 2.0
                    </div> --}}

                </div>
            </div>

            <!-- RIGHT -->
            <div class="col-md-6 right-box">
                <div class="slider-wrapper">
                    <div class="form-slider" id="formSlider">

                        <!-- LOGIN -->
                        <div class="form-slide">
                            <div class="form-content">
                                <h4 class="text-primary fw-bold">Login</h4>
                                <p class="text-muted mb-4">Masukkan akun anda</p>

                                <form id="formLogin" class="user" method="POST" action="{{ route('login') }}">
                                    @csrf
                                    <div class="form-floating mb-3">
                                        <input type="text" id="username" name="username"
                                            class="form-control @error('username') is-invalid
                                        @enderror"
                                            value="{{ old('username') }}" placeholder="Username" required autofocus>
                                        @error('username')
                                        <div class="invalid-feedback">
                                            {{ $message }}
                                        </div>
                                        @enderror
                                        <label>NIP</label>
                                    </div>

                                    <div class="form-floating mb-3 position-relative">
                                        <input type="password" id="password" name="password" class="form-control pe-5"
                                            placeholder="Password" required>
                                        <label>Password</label>

                                        <!-- ICON MATA -->
                                        <i class="bi bi-eye toggle-password" onclick="togglePassword()"></i>
                                    </div>

                                    <button type="submit" class="btn btn-primary w-100 btn-login mb-3">
                                        <i data-feather="log-in" class="me-1"></i>
                                        LOGIN
                                    </button>

                                    <button type="button" onclick="showRegister()"
                                        class="btn btn-light border border-primary text-primary w-100 btn-login mb-3">

                                        <span>Cek Tiket & Lainnya</span>
                                        <i class="bi bi-arrow-right"></i>

                                    </button>

                                    {{-- <p class="text-center small">
                                        Belum punya akun?
                                        <a href="javascript:void(0)" onclick="showRegister()">Daftar</a>
                                    </p> --}}
                                </form>
                            </div>
                        </div>

                        <!-- REGISTER -->
                        <div class="form-slide">
                            <div class="form-content">
                                <h4 class="text-primary fw-bold">Cek Tiket</h4>

                                <form action="{{ route('tiket.cek') }}" method="POST">
                                    @csrf

                                    <div class="form-floating mb-3">
                                        <input type="text" name="no_tiket" class="form-control" placeholder="Nama">
                                        <label>Masukkan No Tiket</label>
                                    </div>

                                    <button class="btn btn-primary w-100 btn-login mb-3">
                                        <i data-feather="search" class="me-1"></i>
                                        Cek Tiket
                                    </button>

                                    <button
                                        type="button"
                                        class="btn btn-light border border-primary text-primary w-100 btn-login mb-3"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modalFaq">

                                        <i data-feather="help-circle" class="me-1"></i>
                                        Tanya Jawab (FAQ)
                                    </button>

                                    <button
                                        type="button"
                                        class="btn btn-light border border-primary text-primary w-100 btn-login mb-3"
                                        data-bs-toggle="modal"
                                        data-bs-target="#modalSyarat">
                                        <i data-feather="file-text" class="me-1"></i>

                                        Lihat Syarat Layanan
                                    </button>

                                    <p class="text-center small">
                                        <i class="bi bi-arrow-left"></i>
                                        Kembali ke
                                        <a href="javascript:void(0)" onclick="showLogin()">Login</a>
                                    </p>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>

    <div id="chatFloatingButton">
        <button type="button" id="openChatDrawer">
            <i data-feather="message-square"></i>
        </button>
    </div>

    <div id="chatDrawer">
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
        <div class="chat-body">

            <!-- PAGE 1 -->
            <div class="chat-page" id="pageHome">

                <div class="chat-welcome-card">

                    <div class="chat-welcome-icon">
                        <span class="wave-hand">👋</span>
                    </div>

                    <h6>Halo, ada yang bisa kami bantu?</h6>

                    <p>
                        Silakan pilih salah satu layanan berikut
                    </p>

                </div>

                <div
                    class="help-card"
                    id="btnNewChat">

                    <div>
                        <div class="fw-semibold">
                            Tanya Admin
                        </div>

                        <small class="text-muted">
                            Buat percakapan baru
                        </small>
                    </div>

                    <i data-feather="chevron-right"></i>
                </div>

                <div
                    class="help-card"
                    id="btnOpenTicket">

                    <div>
                        <div class="fw-semibold">
                            Sudah Punya Tiket
                        </div>

                        <small class="text-muted">
                            Lanjutkan percakapan
                        </small>
                    </div>

                    <i data-feather="chevron-right"></i>
                </div>

            </div>

            <!-- PAGE CHAT BARU -->
            <div
                class="chat-page d-none"
                id="pageNewChat">

                <!-- Header -->
                <div class="d-flex align-items-center gap-2 mb-3">

                    <button
                        class="btn btn-light chat-back-btn"
                        id="backHome1">

                        <i data-feather="arrow-left"></i>

                    </button>

                </div>

                <!-- Form -->
                <div class="card border-0 shadow-sm">

                    <div class="card-body">

                        <div class="mb-3">
                            <label class="form-label fw-semibold">
                                Nama
                            </label>

                            <input
                                type="text"
                                class="form-control"
                                id="guestNama"
                                placeholder="Masukkan nama lengkap">
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">
                                Email
                            </label>

                            <input
                                type="email"
                                class="form-control"
                                id="guestEmail"
                                placeholder="nama@email.com">
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">
                                Bidang
                            </label>

                            <select
                                class="form-select"
                                id="guestBidang">

                                <option value="">
                                    Pilih Bidang
                                </option>

                                @foreach($bidang as $item)
                                <option value="{{ $item->id }}">
                                    {{ $item->nama_bidang }}
                                </option>
                                @endforeach

                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-semibold">
                                Layanan
                            </label>

                            <select
                                class="form-select"
                                id="guestLayanan"
                                disabled>

                                <option value="">
                                    Pilih bidang terlebih dahulu
                                </option>

                            </select>
                        </div>

                        <button
                            class="btn chat-gradient-btn w-100"
                            id="btnStartChat">

                            <i data-feather="message-square" class="me-2"></i>
                            Mulai Chat

                        </button>

                    </div>

                </div>

            </div>

            <!-- PAGE TIKET -->
            <div
                class="chat-page d-none"
                id="pageTicket">

                <!-- Header -->
                <div class="d-flex align-items-center gap-2 mb-3">

                    <button
                        class="btn btn-light chat-back-btn"
                        id="backHome2">

                        <i data-feather="arrow-left"></i>

                    </button>

                </div>

                <!-- Form -->
                <div class="card border-0 shadow-sm">

                    <div class="card-body">

                        <div class="mb-3">

                            <label class="form-label fw-semibold">
                                Nomor Tiket
                            </label>

                            <input
                                type="text"
                                class="form-control"
                                id="guestTicket"
                                placeholder="Contoh: TKT-2026-001">

                        </div>

                        <div class="mb-4">

                            <label class="form-label fw-semibold">
                                Email
                            </label>

                            <input
                                type="email"
                                class="form-control"
                                id="guestTicketEmail"
                                placeholder="nama@email.com">

                        </div>

                        <button
                            class="btn chat-gradient-btn w-100"
                            id="btnOpenConversation">

                            <i data-feather="message-square" class="me-2"></i>
                            Buka Percakapan

                        </button>

                    </div>

                </div>

            </div>

            <!-- PAGE ROOM CHAT -->
            <div
                class="chat-page d-none p-0 d-flex flex-column"
                id="pageRoom">

                <div
                    class="border-bottom bg-white p-3">

                    <div class="d-flex align-items-center gap-2">

                        <button
                            class="btn btn-light chat-back-btn"
                            id="btnBackInbox">

                            <i data-feather="arrow-left"></i>

                        </button>

                        <div class="small d-flex align-items-center gap-1">

                            <span>No Tiket :</span>

                            <span
                                class="fw-bold"
                                id="roomTicketNo">
                                -
                            </span>

                            <span id="roomTicketNo">-</span>

                            <span
                                id="chatStatusBadge"
                                class="badge bg-success-soft text-success">
                                Open
                            </span>

                        </div>

                    </div>

                    <input
                        type="hidden"
                        id="conversationId">
                </div>

                <div
                    id="chatMessages"
                    class="flex-grow-1 overflow-auto p-3">
                </div>

                <div class="border-top py-2 px-3 bg-white">

                    <div class="chat-input-wrapper">

                        <textarea
                            id="chatInput"
                            class="form-control"
                            placeholder="Tulis pesan..."
                            rows="1"></textarea>

                        <button
                            class="chat-send-btn"
                            id="sendChatBtn">

                            <i data-feather="navigation"></i>

                        </button>

                    </div>

                </div>

            </div>

        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/feather-icons"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {

            feather.replace();

            // FAQ Search
            const search = document.getElementById('faqSearch');
            if (search) {
                search.addEventListener('keyup', function() {
                    let keyword = this.value.toLowerCase();
                    let found = false;

                    document.querySelectorAll('.faq-item')
                        .forEach(function(item) {
                            let text = item.innerText.toLowerCase();

                            if (text.includes(keyword)) {
                                item.style.display = '';
                                found = true;
                            } else {
                                item.style.display = 'none';
                            }
                        });

                    const notFound =
                        document.getElementById('faqNotFound');

                    if (notFound) {
                        if (found) {
                            notFound.classList.add('d-none');
                        } else {
                            notFound.classList.remove('d-none');
                        }
                    }
                });
            }

            // Modal Syarat Layanan
            const bidang = document.getElementById('modalBidang');

            const layanan = document.getElementById('modalLayanan');

            if (bidang && layanan) {
                bidang.addEventListener('change', function() {
                    if (!this.value) {
                        layanan.innerHTML = '<option>Pilih bidang terlebih dahulu</option>';
                        layanan.disabled = true;
                        return;
                    }

                    layanan.innerHTML = '<option>Loading...</option>';
                    layanan.disabled = true;

                    fetch(`/get-layanan-syarat/${this.value}`)
                        .then(response => response.json())
                        .then(data => {

                            layanan.innerHTML = '<option value="">Pilih Layanan</option>';

                            if (data.length === 0) {
                                layanan.innerHTML += '<option disabled>Tidak ada layanan</option>';
                            } else {
                                data.forEach(item => {
                                    layanan.innerHTML += `<option value="${item.id}">
                                    ${item.nama_layanan}</option>`;
                                });
                            }
                            layanan.disabled = false;
                        })
                        .catch(error => {
                            console.error(error);
                            layanan.innerHTML = '<option>Gagal memuat layanan</option>';
                            layanan.disabled = false;
                        });
                });
            }

            // Button Lihat PDF
            const btnPdf = document.getElementById('btnLihatPdf');

            if (btnPdf) {
                btnPdf.addEventListener('click', function() {
                    const bidangId = document.getElementById('modalBidang').value;
                    const layananId = document.getElementById('modalLayanan').value;

                    if (!bidangId) {
                        alert('Silakan pilih bidang terlebih dahulu.');
                        return;
                    }

                    if (!layananId) {
                        alert('Silakan pilih layanan terlebih dahulu.');
                        return;
                    }

                    window.open(`{{ route('exportPdf') }}?bidang=${bidangId}&layanan=${layananId}`, '_blank');
                });
            }

            // Chat
            function initGuestChat() {

                function updateChatStatus(status) {
                    const badge =
                        document.getElementById('chatStatusBadge');

                    if (!badge) return;

                    if (status === 'closed') {
                        badge.className = 'badge bg-danger-soft text-danger';
                        badge.innerText = 'Closed';
                        messageInput.disabled = true;
                        sendButton.disabled = true;
                    } else {
                        badge.className = 'badge bg-success-soft text-success';
                        badge.innerText = 'Open';
                        messageInput.disabled = false;
                        sendButton.disabled = false;
                    }
                }

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

                const pageHome =
                    document.getElementById('pageHome');

                const pageNewChat =
                    document.getElementById('pageNewChat');

                const pageTicket =
                    document.getElementById('pageTicket');

                const pageRoom =
                    document.getElementById('pageRoom');

                const chatMessages =
                    document.getElementById('chatMessages');

                const conversationIdInput =
                    document.getElementById('conversationId');

                const sendButton =
                    document.getElementById('sendChatBtn');

                const messageInput =
                    document.getElementById('chatInput');

                messageInput?.addEventListener('keydown', function(e) {

                    if (e.key === 'Enter' && !e.shiftKey) {

                        e.preventDefault();

                        sendButton?.click();
                    }
                });

                function showPage(page) {

                    [
                        pageHome,
                        pageNewChat,
                        pageTicket,
                        pageRoom
                    ].forEach(item => {

                        item.classList.add('d-none');

                    });

                    page.classList.remove('d-none');
                }

                document.getElementById('btnBackInbox')
                    ?.addEventListener('click', function() {

                        const keluar = confirm(
                            'Anda akan menutup chat. Percakapan tetap tersimpan dan dapat dibuka kembali menggunakan nomor tiket. Lanjutkan?'
                        );

                        if (!keluar) {
                            return;
                        }

                        showPage(pageHome);

                        conversationIdInput.value = '';

                        document.getElementById('roomTicketNo').innerHTML = '-';

                        chatMessages.innerHTML = '';

                        document.getElementById('guestTicketEmail').value = '';
                        document.getElementById('guestTicket').value = '';
                        document.getElementById('guestNama').value = '';
                        document.getElementById('guestEmail').value = '';
                        document.getElementById('guestBidang').selectedIndex = 0;
                        document.getElementById('guestLayanan').innerHTML =
                            '<option>Pilih bidang terlebih dahulu</option>';
                        document.getElementById('guestLayanan').disabled = true;

                        guestSession = null;
                    });

                // COMBOBOX LAYANAN

                const guestBidang =
                    document.getElementById('guestBidang');

                const guestLayanan =
                    document.getElementById('guestLayanan');

                if (guestBidang && guestLayanan) {

                    guestBidang.addEventListener('change', function() {

                        if (!this.value) {

                            guestLayanan.innerHTML =
                                '<option>Pilih bidang terlebih dahulu</option>';

                            guestLayanan.disabled = true;

                            return;
                        }

                        guestLayanan.innerHTML =
                            '<option>Loading...</option>';

                        guestLayanan.disabled = true;

                        fetch(`/get-layanan-syarat/${this.value}`)

                            .then(response => response.json())

                            .then(data => {

                                guestLayanan.innerHTML =
                                    '<option value="">Pilih Layanan</option>';

                                if (data.length === 0) {

                                    guestLayanan.innerHTML +=
                                        '<option disabled>Tidak ada layanan</option>';

                                } else {

                                    data.forEach(item => {

                                        guestLayanan.innerHTML += `
                            <option value="${item.id}">
                                ${item.nama_layanan}
                            </option>
                        `;
                                    });
                                }

                                guestLayanan.disabled = false;
                            })

                            .catch(error => {

                                console.error(error);

                                guestLayanan.innerHTML =
                                    '<option>Gagal memuat layanan</option>';

                                guestLayanan.disabled = false;
                            });
                    });
                }

                document.getElementById('btnNewChat')
                    ?.addEventListener('click', function() {
                        showPage(pageNewChat);
                    });

                document.getElementById('btnOpenTicket')
                    ?.addEventListener('click', function() {
                        showPage(pageTicket);
                    });

                document.getElementById('backHome1')
                    ?.addEventListener('click', function() {
                        showPage(pageHome);
                    });

                document.getElementById('backHome2')
                    ?.addEventListener('click', function() {
                        showPage(pageHome);
                    });

                // =====================
                // HOME -> CHAT BARU
                // =====================

                document
                    .getElementById('btnStartChat')
                    ?.addEventListener('click', function() {

                        const nama =
                            document.getElementById('guestNama')
                            .value.trim();

                        const email =
                            document.getElementById('guestEmail')
                            .value.trim();

                        const bidangId =
                            document.getElementById('guestBidang')
                            .value;

                        const layananId =
                            document.getElementById('guestLayanan')
                            .value;

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

                        guestSession = {
                            nama: nama,
                            email: email,
                            bidang_id: bidangId,
                            layanan_id: layananId
                        };

                        document
                            .getElementById('conversationId')
                            .value = '';

                        showPage(pageRoom);

                        document
                            .getElementById('roomTicketNo')
                            .innerHTML = '-';

                        const messages =
                            document.getElementById('chatMessages');

                        messages.innerHTML = `
<div
    class="message-row"
    id="ticketInfoMessage">

    <div class="message-bubble system">

        Silakan tuliskan pertanyaan Anda.

    </div>

</div>
`;
                    });

                // =====================
                // BUKA TIKET
                // =====================

                document
                    .getElementById('btnOpenConversation')
                    ?.addEventListener('click', async function() {

                        const btn = this;
                        const originalHtml = btn.innerHTML;

                        const email =
                            document.getElementById('guestTicketEmail')
                            .value.trim();

                        const noTiket =
                            document.getElementById('guestTicket')
                            .value.trim();

                        if (!email || !noTiket) {

                            alert(
                                'Email dan nomor tiket wajib diisi'
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

                            const response =
                                await fetch(
                                    '/guest-chat/resume', {
                                        method: 'POST',

                                        headers: {
                                            'Content-Type': 'application/json',

                                            'X-CSRF-TOKEN': document
                                                .querySelector(
                                                    'meta[name="csrf-token"]'
                                                )
                                                .content
                                        },

                                        body: JSON.stringify({
                                            email: email,
                                            no_tiket: noTiket
                                        })
                                    }
                                );

                            const result =
                                await response.json();

                            if (!response.ok || !result.success) {

                                alert(
                                    result.message ??
                                    'Percakapan tidak ditemukan'
                                );

                                return;
                            }

                            conversationIdInput.value =
                                result.conversation_id;

                            guestSession = {
                                nama: result.nama_pengirim,
                                email: email
                            };

                            document
                                .getElementById('roomTicketNo')
                                .innerHTML =
                                result.ticket_number;

                            updateChatStatus(result.status);

                            showPage(pageRoom);

                            loadGuestMessages(
                                result.conversation_id,
                                email
                            );

                        } catch (error) {

                            console.error(error);

                            alert(
                                'Terjadi kesalahan sistem'
                            );

                        } finally {

                            btn.disabled = false;
                            btn.innerHTML = originalHtml;

                            feather.replace();
                        }
                    });

                sendButton?.addEventListener(
                    'click',
                    async function() {

                        const message =
                            messageInput.value.trim();

                        if (!message) {
                            return;
                        }

                        try {

                            let conversationId =
                                conversationIdInput.value;

                            /*
                             CHAT BELUM DIBUAT
                             BUAT SAAT PESAN PERTAMA
                            */
                            if (!conversationId) {

                                const response =
                                    await fetch(
                                        '/guest-chat/start', {
                                            method: 'POST',

                                            headers: {
                                                'Content-Type': 'application/json',

                                                'X-CSRF-TOKEN': document.querySelector(
                                                    'meta[name="csrf-token"]'
                                                ).content
                                            },

                                            body: JSON.stringify(
                                                guestSession
                                            )
                                        }
                                    );

                                const result =
                                    await response.json();

                                if (!response.ok) {

                                    alert(
                                        result.message ??
                                        'Gagal membuat percakapan'
                                    );

                                    return;
                                }

                                conversationId =
                                    result.conversation_id;

                                conversationIdInput.value =
                                    conversationId;

                                document
                                    .getElementById(
                                        'roomTicketNo'
                                    )
                                    .innerHTML =
                                    result.no_tiket;

                                const ticketInfo =
                                    document.getElementById(
                                        'ticketInfoMessage'
                                    );

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
                Mohon disimpan untuk melanjutkan
                percakapan di kemudian hari.
            </small>

        </div>
    `;
                                }
                            }

                            /*
                             KIRIM PESAN
                            */

                            const sendResponse =
                                await fetch(
                                    `/guest-chat/${conversationId}/message`, {
                                        method: 'POST',

                                        headers: {
                                            'Content-Type': 'application/json',

                                            'X-CSRF-TOKEN': document.querySelector(
                                                'meta[name="csrf-token"]'
                                            ).content
                                        },

                                        body: JSON.stringify({
                                            message: message
                                        })
                                    }
                                );

                            const sendResult =
                                await sendResponse.json();

                            if (!sendResponse.ok) {

                                alert(
                                    sendResult.message ??
                                    'Gagal mengirim pesan'
                                );

                                return;
                            }

                            chatMessages.innerHTML += `

<div class="message-row me">

    <div class="message-wrapper">

        <div class="message-info me">

            <span class="sender-name">
                ${guestSession?.nama ?? 'Saya'}
            </span>

            <span class="message-time">
                ${formatChatTime(new Date().toISOString())}
            </span>

        </div>

        <div class="message-bubble me">

            ${message}

        </div>

    </div>

</div>

`;

                            messageInput.value = '';

                        } catch (error) {

                            console.error(error);

                            alert(
                                'Terjadi kesalahan sistem'
                            );
                        }
                    }
                );

                async function loadGuestMessages(
                    conversationId,
                    email
                ) {

                    try {

                        const response =
                            await fetch(
                                `/guest-chat/${conversationId}/messages?email=${encodeURIComponent(email)}`
                            );

                        const res =
                            await response.json();

                        updateChatStatus(res.status);

                        chatMessages.innerHTML = '';

                        res.messages.forEach(msg => {

                            const isGuest =
                                msg.sender_guest_id !== null;

                            const senderName =
                                msg.sender_name ??
                                (isGuest ? 'Saya' : 'Admin');

                            const chatTime =
                                formatChatTime(
                                    msg.created_at
                                );

                            chatMessages.innerHTML += `

<div class="message-row ${isGuest ? 'me' : 'other'}">

    <div class="message-wrapper">

        <div class="message-info ${isGuest ? 'me' : 'other'}">

            <span class="sender-name">
                ${senderName},
            </span>

            <span class="message-time">
                ${chatTime}
            </span>

        </div>

        <div class="message-bubble ${isGuest ? 'me' : 'other'}">

            ${msg.message}

        </div>

    </div>

</div>

`;
                        });

                        chatMessages.scrollTop =
                            chatMessages.scrollHeight;

                    } catch (error) {

                        console.error(error);
                    }
                }

                document.addEventListener(
                    'click',
                    function(e) {

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

            const drawer = document.getElementById('chatDrawer');
            const openBtn = document.getElementById('openChatDrawer');
            const closeBtn = document.getElementById('closeChatDrawer');

            if (drawer && openBtn && closeBtn) {

                openBtn.addEventListener('click', function(e) {

                    e.stopPropagation();

                    drawer.classList.toggle('show');
                });

                closeBtn.addEventListener('click', function() {

                    drawer.classList.remove('show');
                });

                document.addEventListener('click', function(e) {

                    if (
                        drawer.classList.contains('show') &&
                        !drawer.contains(e.target) &&
                        !openBtn.contains(e.target)
                    ) {
                        drawer.classList.remove('show');
                    }
                });

                let guestSession = null;

                initGuestChat();
            }
        });

        // Slider Login
        function showRegister() {
            document.getElementById('formSlider').classList.add('active');
        }

        function showLogin() {
            document.getElementById('formSlider').classList.remove('active');
        }

        // Show - Hide Password
        function togglePassword() {
            const input = document.getElementById('password');

            const icon = document.querySelector('.toggle-password');

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                input.type = "password";
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        }

        // Auto Height Text
        $(document).on('input', '#chatInput', function() {

            this.style.height = 'auto';

            this.style.height = this.scrollHeight + 'px';
        });
    </script>
</body>

<footer class="footer">
    © 2026 BKPSDM Kabupaten Buleleng
</footer>

</html>