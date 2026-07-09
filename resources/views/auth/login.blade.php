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
                                NIP
                            </label>

                            <div class="input-group">

                                <input
                                    type="text"
                                    class="form-control"
                                    id="guestNip"
                                    maxlength="18"
                                    placeholder="Masukkan NIP">

                                <button
                                    class="btn btn-gradient-search"
                                    type="button"
                                    id="btnCariNip">

                                    <i data-feather="search"></i>

                                </button>

                            </div>

                            <div
                                id="nipLoading"
                                class="small text-primary mt-2 d-none">

                                Mencari data pegawai...

                            </div>

                            <div
                                id="nipError"
                                class="small text-danger mt-2 d-none">
                            </div>

                        </div>

                        <div class="mb-3">

                            <label class="form-label fw-semibold">

                                Nama

                            </label>

                            <input
                                type="text"
                                class="form-control"
                                id="guestNama"
                                readonly>

                        </div>

                        <div class="mb-3">

                            <label class="form-label fw-semibold">

                                Unit Kerja

                            </label>

                            <input
                                type="text"
                                class="form-control"
                                id="guestUnitKerja"
                                readonly>

                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">
                                Email
                            </label>

                            <input
                                type="email"
                                class="form-control"
                                id="guestEmail"
                                placeholder="Masukkan email aktif">
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
                            id="btnStartChat"
                            >

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
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="{{ asset('js/chat/chat-widget-login.js') }}"></script>
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

                    resetGuestSession();

                    showPage(el.pageHome);
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

                ChatWidgetLogin.init();
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
        document.addEventListener('input', function(e) {

            if (e.target.id === 'chatInput') {

                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';

            }

        });
    </script>
</body>

<footer class="footer">
    © 2026 BKPSDM Kabupaten Buleleng
</footer>

</html>