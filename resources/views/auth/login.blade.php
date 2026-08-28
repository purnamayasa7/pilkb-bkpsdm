<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="PILKB - Pusat Informasi Layanan Kepegawaian BKPSDM Kabupaten Buleleng">
    <title>PILKB - BKPSDM Kabupaten Buleleng</title>

    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Stylesheets -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    <link rel="stylesheet" href="{{ asset('css/chat-widget.css') }}">
</head>

<body>
    <!-- Modal FAQ -->
    <div class="modal fade" id="modalFaq" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                {{-- Header --}}
                <div class="modal-header bg-gradient-header">
                    <h5 class="modal-title d-flex align-items-center">
                        <i data-feather="help-circle" class="me-2"></i>
                        Pusat Bantuan & Tanya Jawab (FAQ)
                    </h5>

                    <button
                        type="button"
                        class="btn-close btn-close-white"
                        data-bs-dismiss="modal"
                        aria-label="Tutup">
                    </button>
                </div>

                {{-- Body --}}
                <div class="modal-body">
                    {{-- Informasi --}}
                    <div class="alert alert-primary d-flex align-items-center mb-4 rounded-3 border-0 shadow-sm">
                        <i data-feather="info" class="me-2 flex-shrink-0"></i>
                        <span>
                            Cari topik pertanyaan atau klik salah satu FAQ untuk melihat rincian jawaban.
                        </span>
                    </div>

                    {{-- Search --}}
                    <div class="mb-4">
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i data-feather="search"></i>
                            </span>

                            <input
                                type="text"
                                id="faqSearch"
                                class="form-control border-start-0"
                                placeholder="Cari pertanyaan atau kata kunci...">
                        </div>
                    </div>

                    {{-- FAQ List --}}
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
                                        class="me-2 text-primary flex-shrink-0">
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
                        <i data-feather="alert-circle" class="me-1"></i> FAQ yang Anda cari tidak ditemukan.
                    </div>
                </div>

                {{-- Footer --}}
                <div class="modal-footer">
                    <button
                        class="btn btn-light"
                        data-bs-dismiss="modal">
                        <i data-feather="arrow-left" class="me-1"></i> Tutup
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Syarat Layanan -->
    <div class="modal fade"
        id="modalSyarat"
        tabindex="-1">

        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-gradient-header">
                    <h5 class="modal-title d-flex align-items-center">
                        <i data-feather="file-text" class="me-2"></i>
                        Syarat & Ketentuan Layanan
                    </h5>
                    <button
                        type="button"
                        class="btn-close btn-close-white"
                        data-bs-dismiss="modal"
                        aria-label="Tutup">
                    </button>
                </div>

                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold small text-dark mb-1">
                            Pilih Bidang
                        </label>

                        <select
                            id="modalBidang"
                            class="form-select">

                            <option value="">
                                -- Pilih Bidang --
                            </option>

                            @foreach($bidang as $item)

                            <option value="{{ $item->id }}">
                                {{ $item->nama_bidang }}
                            </option>

                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold small text-dark mb-1">
                            Pilih Layanan
                        </label>

                        <select
                            id="modalLayanan"
                            class="form-select"
                            disabled>

                            <option>
                                Silakan pilih bidang terlebih dahulu
                            </option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer">

                    <button
                        class="btn btn-light"
                        data-bs-dismiss="modal">
                        <i data-feather="arrow-left" class="me-1"></i>
                        Tutup
                    </button>

                    <button
                        type="button"
                        id="btnLihatPdf"
                        class="btn btn-primary">

                        <i data-feather="download" class="me-1"></i>
                        Unduh Syarat PDF
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Card Container -->
    <div class="card login-card border-0">
        <div class="row g-0">

            <!-- LEFT BRANDING PANEL -->
            <div class="col-md-6 left-box">
                <div class="left-content">

                    <!-- Institution Header Badge -->
                    <div class="brand-badge">
                        <img src="{{ asset('images/KabBuleleng.png') }}" class="logo" alt="Logo Kabupaten Buleleng">
                        <div class="brand-text-wrap">
                            <div class="brand-text text-uppercase">
                                BKPSDM KAB. BULELENG
                            </div>
                            <div class="brand-subtext">Pemerintah Kabupaten Buleleng</div>
                        </div>
                    </div>

                    <!-- Application Title & Accent -->
                    <div class="app-title-wrap">
                        <h1 class="app-title">PILKB</h1>
                        <div class="accent-line"></div>
                    </div>

                    <!-- Tagline -->
                    <p class="tagline">
                        Pusat Informasi Layanan Kepegawaian BKPSDM<br>Buleleng
                    </p>

                    <!-- System Badge -->
                    <div class="version-badge-wrap">
                        <span class="version-badge">
                            <span class="pulse-dot"></span>
                            Sistem Layanan Kepegawaian
                        </span>
                    </div>

                </div>
            </div>

            <!-- RIGHT FORM PANEL -->
            <div class="col-md-6 right-box">
                <div class="slider-wrapper">
                    <div class="form-slider" id="formSlider">

                        <!-- SLIDE 1: LOGIN FORM -->
                        <div class="form-slide">
                            <div class="form-content">

                                <!-- Mobile Header (visible only on small screens) -->
                                <div class="mobile-brand-header">
                                    <img src="{{ asset('images/KabBuleleng.png') }}" class="mobile-logo" alt="Logo Buleleng">
                                    <h5>PILKB</h5>
                                    <small>BKPSDM Kabupaten Buleleng</small>
                                </div>

                                <h4 class="form-title">Selamat Datang</h4>
                                <p class="form-subtitle">Masukkan akun Anda untuk mengakses sistem</p>

                                <form id="formLogin" class="user" method="POST" action="{{ route('login') }}">
                                    @csrf

                                    <!-- NIP INPUT -->
                                    <div class="form-group-custom">
                                        <label for="username" class="form-label-custom">NIP (Nomor Induk Pegawai)</label>
                                        <div class="input-icon-wrap">
                                            <i data-feather="user" class="input-icon"></i>
                                            <input type="text" id="username" name="username"
                                                class="form-control @error('username') is-invalid @enderror"
                                                value="{{ old('username') }}" placeholder="Masukkan 18 digit NIP" required autofocus>
                                        </div>
                                        @error('username')
                                        <div class="invalid-feedback d-block mt-1">
                                            {{ $message }}
                                        </div>
                                        @enderror
                                    </div>

                                    <!-- PASSWORD INPUT -->
                                    <div class="form-group-custom">
                                        <label for="password" class="form-label-custom">Password</label>
                                        <div class="input-icon-wrap">
                                            <i data-feather="lock" class="input-icon"></i>
                                            <input type="password" id="password" name="password" class="form-control pe-5"
                                                placeholder="Masukkan password" required>
                                            <i class="bi bi-eye toggle-password" onclick="togglePassword()" title="Tampilkan / Sembunyikan Password"></i>
                                        </div>
                                    </div>

                                    <!-- SUBMIT BUTTON -->
                                    <button type="submit"
                                        id="btnLogin"
                                        class="btn-login-primary mb-3">

                                        <span class="login-normal">
                                            <i data-feather="log-in" class="me-1"></i>
                                            Masuk
                                        </span>

                                        <span class="login-loading d-none">
                                            <span
                                                class="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true">
                                            </span>
                                            Memproses...
                                        </span>

                                    </button>

                                    <!-- CEK TIKET BUTTON -->
                                    <button type="button"
                                        onclick="showRegister()"
                                        class="btn-login-outline">
                                        <span>Cek Tiket & Pusat Bantuan</span>
                                        <i data-feather="arrow-right" class="ms-1"></i>
                                    </button>
                                </form>
                            </div>
                        </div>

                        <!-- SLIDE 2: CEK TIKET & PUSAT BANTUAN -->
                        <div class="form-slide">
                            <div class="form-content">

                                <!-- Mobile Header -->
                                <div class="mobile-brand-header">
                                    <img src="{{ asset('images/KabBuleleng.png') }}" class="mobile-logo" alt="Logo Buleleng">
                                    <h5>BKPSDM</h5>
                                    <small>Pemerintah Kabupaten Buleleng</small>
                                </div>

                                <h4 class="form-title">Cek Tiket & Bantuan</h4>
                                <p class="form-subtitle">
                                    Lacak status usulan atau akses informasi layanan
                                </p>

                                <form id="formCekTiket" action="{{ route('tiket.cek') }}" method="POST" class="mb-2">
                                    @csrf

                                    <div class="form-group-custom mb-2">
                                        <label for="no_tiket" class="form-label-custom">Masukkan No Tiket</label>
                                        <div class="input-icon-wrap">
                                            <i data-feather="tag" class="input-icon"></i>
                                            <input
                                                type="text"
                                                id="no_tiket"
                                                name="no_tiket"
                                                class="form-control"
                                                placeholder="Contoh: CH01012026-ABC12345"
                                                autocomplete="off"
                                                required>
                                        </div>
                                    </div>

                                    <!-- Feedback Alert / Status Message -->
                                    <div id="cekTiketFeedback" class="d-none mb-2"></div>

                                    <button
                                        type="submit"
                                        id="btnCekTiket"
                                        class="btn-login-primary mb-2">
                                        <span class="cek-normal">
                                            <i data-feather="search" class="me-1"></i>
                                            Cek Tiket
                                        </span>
                                        <span class="cek-loading d-none">
                                            <span
                                                class="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true">
                                            </span>
                                            Memeriksa Tiket...
                                        </span>
                                    </button>
                                </form>

                                <!-- Quick Navigation Options -->
                                <div class="slide-option-btn"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modalFaq">
                                    <div class="d-flex align-items-center">
                                        <div class="btn-icon-box">
                                            <i data-feather="help-circle"></i>
                                        </div>
                                        <div>
                                            <div>Tanya Jawab (FAQ)</div>
                                            <small class="text-muted fw-normal">Panduan & jawaban umum</small>
                                        </div>
                                    </div>
                                    <i data-feather="chevron-right" class="text-muted"></i>
                                </div>

                                <div class="slide-option-btn"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modalSyarat">
                                    <div class="d-flex align-items-center">
                                        <div class="btn-icon-box">
                                            <i data-feather="file-text"></i>
                                        </div>
                                        <div>
                                            <div>Syarat & Ketentuan Layanan</div>
                                            <small class="text-muted fw-normal">Dokumen & e-file persyaratan</small>
                                        </div>
                                    </div>
                                    <i data-feather="chevron-right" class="text-muted"></i>
                                </div>

                                <!-- Back to Login Link -->
                                <div class="text-center mt-3">
                                    <a href="javascript:void(0)"
                                        onclick="showLogin()"
                                        class="link-back-login">
                                        <i data-feather="arrow-left" class="me-1"></i>
                                        Kembali ke Login
                                    </a>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Page Footer -->
    <footer class="footer">
        &copy; {{ date('Y') }} BKPSDM Kabupaten Buleleng. All rights reserved.
    </footer>

    <!-- Live Chat Floating Trigger Button -->
    <div id="chatFloatingButton">
        <button type="button" id="openChatDrawer" title="Pusat Bantuan & Chat Admin">
            <i data-feather="message-square"></i>
        </button>
    </div>

    <!-- Live Chat Drawer Widget -->
    <div id="chatDrawer">
        <div class="chat-header">
            <div class="chat-header-info">
                <div class="chat-header-avatar">
                    <i data-feather="message-circle"></i>
                </div>
                <div>
                    <div class="fw-bold fs-6">
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
                id="closeChatDrawer"
                aria-label="Tutup">
            </button>
        </div>
        <div class="chat-body">

            <!-- PAGE 1: HOME -->
            <div class="chat-page" id="pageHome">

                <div class="chat-welcome-card mb-3">
                    <div class="chat-welcome-icon">
                        <span class="wave-hand">👋</span>
                    </div>
                    <h6 class="fw-bold mb-1">Halo!</h6>
                    <p class="text-muted small mb-0">
                        Silakan pilih menu bantuan di bawah untuk berkonsultasi dengan tim BKPSDM.
                    </p>
                </div>

                <div class="d-flex flex-column gap-2">
                    <div class="help-card" id="btnNewChat">
                        <div class="help-card-icon bg-primary-soft text-primary">
                            <i data-feather="message-square"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-semibold text-dark">Tanya Admin</div>
                            <small class="text-muted">Mulai konsultasi & percakapan baru</small>
                        </div>
                        <i data-feather="chevron-right" class="text-muted"></i>
                    </div>

                    <div class="help-card" id="btnOpenTicket">
                        <div class="help-card-icon bg-success-soft text-success">
                            <i data-feather="tag"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-semibold text-dark">Sudah Punya Tiket</div>
                            <small class="text-muted">Lanjutkan percakapan dengan nomor tiket</small>
                        </div>
                        <i data-feather="chevron-right" class="text-muted"></i>
                    </div>
                </div>

            </div>

            <!-- PAGE 2: CHAT BARU -->
            <div class="chat-page d-none" id="pageNewChat">

                <!-- Header -->
                <div class="chat-list-header mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <button
                            class="btn btn-light chat-back-btn"
                            id="backHome1"
                            title="Kembali">
                            <i data-feather="arrow-left"></i>
                        </button>
                        <div>
                            <div class="chat-header-title">Mulai Percakapan</div>
                            <div class="chat-header-subtitle">Lengkapi data untuk memulai chat</div>
                        </div>
                    </div>
                </div>

                <!-- Form -->
                <div class="card border-0 shadow-sm" style="border-radius: 16px;">
                    <div class="card-body p-3">

                        <div class="mb-3">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                NIP Pegawai
                            </label>
                            <div class="input-group">
                                <input
                                    type="text"
                                    class="form-control text-dark"
                                    id="guestNip"
                                    maxlength="18"
                                    placeholder="Masukkan 18 digit NIP">
                                <button
                                    class="btn btn-gradient-search px-3"
                                    type="button"
                                    id="btnCariNip"
                                    title="Cari NIP">
                                    <i data-feather="search"></i>
                                </button>
                            </div>
                            <div
                                id="nipLoading"
                                class="small text-primary mt-2 d-none">
                                <span class="spinner-border spinner-border-sm me-1"></span> Mencari data pegawai...
                            </div>
                            <div
                                id="nipError"
                                class="small text-danger mt-2 d-none">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                class="form-control text-dark bg-light"
                                id="guestNama"
                                readonly
                                placeholder="Nama otomatis terisi">
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                Unit Kerja / Instansi
                            </label>
                            <input
                                type="text"
                                class="form-control text-dark bg-light"
                                id="guestUnitKerja"
                                readonly
                                placeholder="Unit kerja otomatis terisi">
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                Email Aktif
                            </label>
                            <input
                                type="email"
                                class="form-control text-dark"
                                id="guestEmail"
                                placeholder="Masukkan email aktif Anda">
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                Bidang Tujuan
                            </label>
                            <select
                                class="form-select text-dark"
                                id="guestBidang">
                                <option value="">Pilih Bidang</option>
                                @foreach($bidang as $item)
                                <option value="{{ $item->id }}">
                                    {{ $item->nama_bidang }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                Layanan
                            </label>
                            <select
                                class="form-select text-dark"
                                id="guestLayanan"
                                disabled>
                                <option value="">Pilih bidang terlebih dahulu</option>
                            </select>
                        </div>

                        <button
                            class="btn chat-gradient-btn w-100 d-flex align-items-center justify-content-center"
                            id="btnStartChat">
                            <i data-feather="message-square" class="me-2"></i>
                            Mulai Percakapan
                        </button>

                    </div>
                </div>

            </div>

            <!-- PAGE 3: TIKET -->
            <div class="chat-page d-none" id="pageTicket">

                <!-- Header -->
                <div class="chat-list-header mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <button
                            class="btn btn-light chat-back-btn"
                            id="backHome2"
                            title="Kembali">
                            <i data-feather="arrow-left"></i>
                        </button>
                        <div>
                            <div class="chat-header-title">Buka Tiket Percakapan</div>
                            <div class="chat-header-subtitle">Lanjutkan obrolan yang sudah tersimpan</div>
                        </div>
                    </div>
                </div>

                <!-- Form -->
                <div class="card border-0 shadow-sm" style="border-radius: 16px;">
                    <div class="card-body p-3">

                        <div class="mb-3">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                Nomor Tiket
                            </label>
                            <input
                                type="text"
                                class="form-control text-dark"
                                id="guestTicket"
                                placeholder="Contoh: TK-2026-0001">
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-semibold text-dark small mb-1">
                                Email Terdaftar
                            </label>
                            <input
                                type="email"
                                class="form-control text-dark"
                                id="guestTicketEmail"
                                placeholder="nama@email.com">
                        </div>

                        <button
                            class="btn chat-gradient-btn w-100 d-flex align-items-center justify-content-center"
                            id="btnOpenConversation">
                            <i data-feather="message-square" class="me-2"></i>
                            Buka Percakapan
                        </button>

                    </div>
                </div>

            </div>

            <!-- PAGE 4: ROOM CHAT -->
            <div class="chat-page d-none p-0 d-flex flex-column h-100" id="pageRoom">

                <div class="chat-room-header">
                    <div class="d-flex align-items-center gap-2 overflow-hidden">
                        <button
                            class="btn btn-light chat-back-btn"
                            id="btnBackInbox"
                            title="Tutup / Kembali">
                            <i data-feather="arrow-left"></i>
                        </button>
                        <div class="chat-room-info overflow-hidden">
                            <div class="d-flex align-items-center gap-1 flex-wrap">
                                <span class="chat-item-ticket" id="roomTicketBadge">
                                    <i data-feather="tag"></i>
                                    <span id="roomTicketNo">-</span>
                                </span>
                                <span
                                    id="chatStatusBadge"
                                    class="chat-status-pill open">
                                    Open
                                </span>
                            </div>
                            <div id="roomSubtitle" class="chat-room-sub text-truncate">
                                Pusat Bantuan PILKB (Guest)
                            </div>
                        </div>
                    </div>
                    <input type="hidden" id="conversationId">
                </div>

                <div
                    id="chatMessages"
                    class="chat-messages flex-grow-1">
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
                            id="sendChatBtn"
                            disabled
                            title="Kirim pesan">
                            <i data-feather="navigation"></i>
                        </button>
                    </div>
                </div>

            </div>

        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/feather-icons"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="{{ asset('js/chat/chat-widget-login.js') }}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {

            feather.replace();

            // Spinner Login
            const formLogin = document.getElementById('formLogin');
            const btnLogin = document.getElementById('btnLogin');

            if (formLogin && btnLogin) {
                formLogin.addEventListener('submit', function(e) {
                    // Cegah double submit
                    if (btnLogin.disabled || btnLogin.classList.contains('is-submitting')) {
                        e.preventDefault();
                        return;
                    }

                    // Disable tombol
                    btnLogin.disabled = true;
                    btnLogin.classList.add('is-submitting');

                    // Ganti tampilan tombol
                    const normalSpan = btnLogin.querySelector('.login-normal');
                    const loadingSpan = btnLogin.querySelector('.login-loading');
                    if (normalSpan) normalSpan.classList.add('d-none');
                    if (loadingSpan) loadingSpan.classList.remove('d-none');
                });
            }

            // Spinner & AJAX Cek Tiket
            const formCekTiket = document.getElementById('formCekTiket');
            const btnCekTiket = document.getElementById('btnCekTiket');
            const noTiketInput = document.getElementById('no_tiket');
            const feedbackContainer = document.getElementById('cekTiketFeedback');

            if (formCekTiket && btnCekTiket) {
                formCekTiket.addEventListener('submit', function(e) {
                    e.preventDefault();

                    const noTiket = noTiketInput ? noTiketInput.value.trim() : '';
                    if (!noTiket) {
                        if (noTiketInput) noTiketInput.focus();
                        return;
                    }

                    // Disable button and show spinner
                    btnCekTiket.disabled = true;
                    btnCekTiket.classList.add('is-submitting');
                    const normalSpan = btnCekTiket.querySelector('.cek-normal');
                    const loadingSpan = btnCekTiket.querySelector('.cek-loading');
                    if (normalSpan) normalSpan.classList.add('d-none');
                    if (loadingSpan) loadingSpan.classList.remove('d-none');

                    if (feedbackContainer) {
                        feedbackContainer.className = 'd-none mb-2';
                        feedbackContainer.innerHTML = '';
                    }

                    fetch('{{ route('tiket.cek') }}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ no_tiket: noTiket })
                    })
                    .then(async response => {
                        const data = await response.json().catch(() => ({}));
                        if (response.ok && data.status === 'found') {
                            if (feedbackContainer) {
                                feedbackContainer.className = 'alert alert-success d-flex align-items-center py-2 px-3 small rounded-3 mb-2';
                                feedbackContainer.innerHTML = `
                                    <i data-feather="check-circle" class="me-2 flex-shrink-0" style="width: 16px; height: 16px;"></i>
                                    <div>Tiket ditemukan! Membuka data tiket...</div>
                                `;
                                feather.replace();
                            }

                            // Tunggu 1 detik baru buka tab baru, lalu hilangkan label
                            const targetUrl = data.url || ('/cek-tiket/' + encodeURIComponent(noTiket));
                            setTimeout(function() {
                                window.open(targetUrl, '_blank');

                                // Reset button
                                btnCekTiket.disabled = false;
                                btnCekTiket.classList.remove('is-submitting');
                                if (normalSpan) normalSpan.classList.remove('d-none');
                                if (loadingSpan) loadingSpan.classList.add('d-none');
                                feather.replace();

                                // Fade out & sembunyikan label setelah 1 detik lagi
                                if (feedbackContainer) {
                                    feedbackContainer.style.transition = 'opacity 0.5s ease';
                                    feedbackContainer.style.opacity = '0';
                                    setTimeout(function() {
                                        feedbackContainer.className = 'd-none mb-2';
                                        feedbackContainer.innerHTML = '';
                                        feedbackContainer.style.opacity = '';
                                        feedbackContainer.style.transition = '';
                                    }, 500);
                                }
                            }, 1000);
                        } else {
                            if (feedbackContainer) {
                                feedbackContainer.className = 'alert alert-danger d-flex align-items-center py-2 px-3 small rounded-3 mb-2';
                                feedbackContainer.innerHTML = `
                                    <i data-feather="alert-circle" class="me-2 flex-shrink-0" style="width: 16px; height: 16px;"></i>
                                    <div>${data.message || 'No tiket tidak ditemukan.'}</div>
                                `;
                                feather.replace();
                            }
                            btnCekTiket.disabled = false;
                            btnCekTiket.classList.remove('is-submitting');
                            if (normalSpan) normalSpan.classList.remove('d-none');
                            if (loadingSpan) loadingSpan.classList.add('d-none');
                            feather.replace();
                        }
                    })
                    .catch(err => {
                        if (feedbackContainer) {
                            feedbackContainer.className = 'alert alert-danger d-flex align-items-center py-2 px-3 small rounded-3 mb-3';
                            feedbackContainer.innerHTML = `
                                <i data-feather="alert-circle" class="me-2 flex-shrink-0" style="width: 16px; height: 16px;"></i>
                                <div>Terjadi kesalahan saat memeriksa tiket. Silakan coba lagi.</div>
                            `;
                            feather.replace();
                        }
                        btnCekTiket.disabled = false;
                        btnCekTiket.classList.remove('is-submitting');
                        if (normalSpan) normalSpan.classList.remove('d-none');
                        if (loadingSpan) loadingSpan.classList.add('d-none');
                        feather.replace();
                    });
                });
            }

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
                        layanan.innerHTML = '<option>Silakan pilih bidang terlebih dahulu</option>';
                        layanan.disabled = true;
                        return;
                    }

                    layanan.innerHTML = '<option>Memuat data layanan...</option>';
                    layanan.disabled = true;

                    fetch(`/get-layanan-syarat/${this.value}`)
                        .then(response => response.json())
                        .then(data => {

                            layanan.innerHTML = '<option value="">-- Pilih Layanan --</option>';

                            if (data.length === 0) {
                                layanan.innerHTML += '<option disabled>Tidak ada layanan aktif</option>';
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

            // Chat Drawer Widget Trigger
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
                    if (typeof resetGuestSession === 'function') {
                        resetGuestSession();
                    }
                    if (typeof showPage === 'function' && typeof el !== 'undefined' && el.pageHome) {
                        showPage(el.pageHome);
                    }
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

                ChatWidgetLogin.init();
            }
        });

        // Slider Navigation
        function showRegister() {
            document.getElementById('formSlider').classList.add('active');
            feather.replace();
        }

        function showLogin() {
            document.getElementById('formSlider').classList.remove('active');
            feather.replace();
        }

        // Show - Hide Password Toggle
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

</html>