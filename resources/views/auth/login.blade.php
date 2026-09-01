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
                                BKPSDM BULELENG
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

                                @if (session('warning'))
                                    <div class="alert alert-warning alert-dismissible fade show d-flex align-items-center mb-3 rounded-3 border-0 shadow-sm" role="alert">
                                        <i data-feather="alert-triangle" class="me-2 flex-shrink-0 text-warning"></i>
                                        <div class="small fw-medium">{{ session('warning') }}</div>
                                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                @endif

                                @if (session('status'))
                                    <div class="alert alert-success alert-dismissible fade show d-flex align-items-center mb-3 rounded-3 border-0 shadow-sm" role="alert">
                                        <i data-feather="check-circle" class="me-2 flex-shrink-0 text-success"></i>
                                        <div class="small fw-medium">{{ session('status') }}</div>
                                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                @endif

                                @if (session('error'))
                                    <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-3 rounded-3 border-0 shadow-sm" role="alert">
                                        <i data-feather="alert-circle" class="me-2 flex-shrink-0 text-danger"></i>
                                        <div class="small fw-medium">{{ session('error') }}</div>
                                        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                @endif

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

                                    <!-- DIVIDER -->
                                    <div class="d-flex align-items-center my-3">
                                        <hr class="flex-grow-1 my-0 text-muted opacity-25">
                                        <span class="px-2 text-muted small fw-medium" style="font-size: 11.5px; letter-spacing: 0.5px;">LAYANAN BANTUAN</span>
                                        <hr class="flex-grow-1 my-0 text-muted opacity-25">
                                    </div>

                                    <!-- PUSAT LAYANAN BANTUAN & CEK STATUS TIKET (TERPUSAT DI CHAT WIDGET) -->
                                    <button type="button"
                                        id="btnOpenPusatBantuanFromCard"
                                        class="btn-login-outline w-100 d-flex align-items-center justify-content-center gap-2">
                                        <i data-feather="message-square" class="text-primary" style="width: 16px; height: 16px;"></i>
                                        <span class="fw-semibold text-dark" style="font-size: 13px;">Pusat Bantuan &amp; Informasi Tiket</span>
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
            <div class="chat-header-info d-flex align-items-center gap-2">
                <div class="position-relative flex-shrink-0">
                    <div class="chat-header-avatar">
                        <i data-feather="message-circle"></i>
                    </div>
                    <span class="chat-header-live-dot" title="Layanan Bantuan &amp; AI Aktif"></span>
                </div>
                <div>
                    <div class="chat-header-main-title">
                        Pusat Bantuan PILKB
                    </div>
                    <div class="chat-header-sub-title">
                        BKPSDM Kabupaten Buleleng
                    </div>
                </div>
            </div>

            <div class="d-flex align-items-center gap-1">
                <button
                    type="button"
                    class="btn-toggle-expand-chat d-none d-md-inline-flex"
                    id="btnToggleExpandChat"
                    title="Perbesar / Perkecil Ukuran Layar">
                    <i data-feather="maximize-2"></i>
                </button>
                <button
                    type="button"
                    class="btn-close btn-close-white"
                    id="closeChatDrawer"
                    aria-label="Tutup">
                </button>
            </div>
        </div>
        <div class="chat-body">

            <!-- PAGE 1: HOME -->
            <div class="chat-page p-0 d-flex flex-column h-100" id="pageHome">
                <div class="chat-room-header d-flex align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <i data-feather="grid" class="text-primary" style="width:16px;height:16px;"></i>
                        <span class="fw-bold text-dark" style="font-size: 13.5px;">Menu Bantuan &amp; Layanan</span>
                    </div>
                </div>

                <div class="chat-page-body flex-grow-1 overflow-y-auto">
                    <div class="chat-welcome-card mb-3">
                        <div class="chat-welcome-icon">
                            <span class="wave-hand">👋</span>
                        </div>
                        <h6 class="fw-bold mb-1">Halo!</h6>
                        <p class="text-muted small mb-0">
                            Silakan pilih layanan bantuan yang Anda butuhkan di bawah ini:
                        </p>
                    </div>

                    <div class="d-flex flex-column gap-2">
                        <!-- OPSI 1: CEK STATUS USULAN -->
                        <div class="help-card" id="btnDirectCekUsulan">
                            <div class="help-card-icon" style="background:#eff6ff; color:#2563eb;">
                                <i data-feather="search"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-semibold text-dark">Cek Status Usulan</div>
                                <small class="text-muted">Cek progres pengajuan layanan</small>
                            </div>
                            <i data-feather="chevron-right" class="help-card-chevron"></i>
                        </div>

                        <!-- OPSI 2: PUSAT BANTUAN -->
                        <div class="help-card" id="btnNewChat">
                            <div class="help-card-icon" style="background:#f5f3ff; color:#6366f1;">
                                <i data-feather="message-circle"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-semibold text-dark">Pusat Bantuan</div>
                                <small class="text-muted">Informasi Layanan, Konsultasi ke Admin BKPSDM atau AI Asisten</small>
                            </div>
                            <i data-feather="chevron-right" class="help-card-chevron"></i>
                        </div>

                        <!-- OPSI 3: LANJUTKAN PERCAKAPAN CHAT -->
                        <div class="help-card" id="btnOpenTicket">
                            <div class="help-card-icon" style="background:#ecfdf5; color:#059669;">
                                <i data-feather="tag"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-semibold text-dark">Lanjutkan Percakapan</div>
                                <small class="text-muted">Buka kembali obrolan dengan nomor tiket</small>
                            </div>
                            <i data-feather="chevron-right" class="help-card-chevron"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PAGE: CEK STATUS USULAN (OPSI 1) -->
            <div class="chat-page d-none p-0 d-flex flex-column h-100" id="pageCekUsulan">
                <div class="chat-room-header d-flex align-items-center">
                    <button
                        class="btn btn-light chat-back-btn me-2"
                        id="backHomeCekUsulan"
                        title="Kembali ke Menu Awal">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <div class="d-flex align-items-center gap-1">
                        <i data-feather="search" class="text-primary" style="width:15px;height:15px;"></i>
                        <span class="fw-bold text-dark" style="font-size: 13.5px;">Cek Status Usulan Layanan</span>
                    </div>
                </div>

                <div class="chat-page-body flex-grow-1 overflow-y-auto">
                    <div class="card border-0 shadow-sm" style="border-radius: 16px;">
                        <div class="card-body p-3">
                            <form id="formDrawerCekUsulan">
                                <div class="mb-3">
                                    <label class="form-label fw-semibold text-dark small mb-1">
                                        Masukkan Nomor Tiket
                                    </label>
                                    <div class="input-group">
                                        <input
                                            type="text"
                                            class="form-control text-dark font-monospace text-uppercase"
                                            id="inputDrawerTiketUsulan"
                                            placeholder="Contoh: 010126ABCD"
                                            autocomplete="off"
                                            required>
                                        <button
                                            class="btn btn-gradient-search px-3"
                                            type="submit"
                                            id="btnSubmitDrawerCekUsulan"
                                            title="Cari Tiket">
                                            <i data-feather="search"></i>
                                        </button>
                                    </div>
                                    <div id="drawerCekTiketFeedback" class="small mt-2 d-none"></div>
                                </div>

                                <button
                                    type="submit"
                                    id="btnCekTiketTabBaru"
                                    class="btn chat-gradient-btn w-100 d-flex align-items-center justify-content-center">
                                    <span class="cek-normal d-flex align-items-center">
                                        <i data-feather="external-link" class="me-2"></i>
                                        Cek &amp; Buka Halaman Tiket
                                    </span>
                                    <span class="cek-loading d-none">
                                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Memeriksa Tiket...
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PAGE 2: CHAT BARU -->
            <div class="chat-page d-none p-0 d-flex flex-column h-100" id="pageNewChat">
                <div class="chat-room-header d-flex align-items-center">
                    <button
                        class="btn btn-light chat-back-btn me-2"
                        id="backHome1"
                        title="Kembali ke Menu Awal">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <div class="d-flex align-items-center gap-1">
                        <i data-feather="user" class="text-primary" style="width:15px;height:15px;"></i>
                        <span class="fw-bold text-dark" style="font-size: 13.5px;">Mulai Percakapan</span>
                    </div>
                </div>

                <div class="chat-page-body flex-grow-1 overflow-y-auto">
                    <div class="card border-0 shadow-sm" style="border-radius: 16px;">
                        <div class="card-body p-3">
                            <div class="mb-2">
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
                                    class="small text-primary mt-1 d-none">
                                    <span class="spinner-border spinner-border-sm me-1"></span> Mencari data pegawai...
                                </div>
                                <div
                                    id="nipError"
                                    class="small text-danger mt-1 d-none">
                                </div>
                            </div>

                            <div class="mb-2">
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

                            <div class="mb-2">
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
                                    placeholder="Email otomatis terisi atau masukkan email aktif">
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
            </div>

            <!-- PAGE 3: TIKET -->
            <div class="chat-page d-none p-0 d-flex flex-column h-100" id="pageTicket">
                <div class="chat-room-header d-flex align-items-center">
                    <button
                        class="btn btn-light chat-back-btn me-2"
                        id="backHome2"
                        title="Kembali ke Menu Awal">
                        <i data-feather="arrow-left"></i>
                    </button>
                    <div class="d-flex align-items-center gap-1">
                        <i data-feather="tag" class="text-primary" style="width:15px;height:15px;"></i>
                        <span class="fw-bold text-dark" style="font-size: 13.5px;">Buka Tiket Percakapan</span>
                    </div>
                </div>

                <div class="chat-page-body flex-grow-1 overflow-y-auto">
                    <div class="card border-0 shadow-sm" style="border-radius: 16px;">
                        <div class="card-body p-3">
                            <div class="mb-2">
                                <label class="form-label fw-semibold text-dark small mb-1">
                                    Nomor Tiket
                                </label>
                                <input
                                    type="text"
                                    class="form-control text-dark"
                                    id="guestTicket"
                                    placeholder="Contoh: TK-2026-0001">
                            </div>

                            <div class="mb-3">
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
            </div>

            <!-- PAGE 4: ROOM CHAT -->
            <div class="chat-page d-none p-0 d-flex flex-column h-100" id="pageRoom">

                <div class="chat-room-header d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2 overflow-hidden flex-grow-1 me-2">
                        <button
                            class="btn btn-light chat-back-btn"
                            id="btnBackInbox"
                            title="Tutup / Kembali">
                            <i data-feather="arrow-left"></i>
                        </button>
                        <div class="chat-room-info overflow-hidden">
                            <!-- Header Sesi Bot (Default Saat Belum Ada Tiket) -->
                            <div id="roomBotHeaderWrap" class="d-flex align-items-center gap-1">
                                <i data-feather="cpu" class="text-primary" style="width:15px;height:15px;"></i>
                                <span class="fw-bold text-dark" style="font-size: 13.5px;">Asisten Virtual BKPSDM</span>
                            </div>

                            <!-- Header Sesi LILI AI Kepegawaian -->
                            <div id="roomLiliHeaderWrap" class="d-none">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="position-relative flex-shrink-0">
                                        <img src="{{ asset('images/lili-avatar.png') }}" alt="LILI" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1.5px solid #6366f1; box-shadow: 0 2px 6px rgba(99,102,241,0.25);">
                                        <span style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; background: #10b981; border: 1.5px solid #fff; border-radius: 50%;"></span>
                                    </div>
                                    <div class="overflow-hidden">
                                        <div class="d-flex align-items-center gap-1">
                                            <span class="fw-bold text-dark text-truncate" style="font-size: 13.5px;">LILI - AI Asisten Kepegawaian</span>
                                            <button type="button" id="btnPlayLiliVoice" class="btn btn-sm btn-link p-0 ms-1" title="Putar Ulang Suara LILI" style="line-height:1; vertical-align: middle;">
                                                <i data-feather="volume-2" style="width:14px; height:14px; color:#6366f1;"></i>
                                            </button>
                                        </div>
                                        <div class="chat-room-sub text-truncate" style="font-size: 10.5px; color: #64748b;">
                                            Layanan Informasi &amp; Literasi Kepegawaian
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Header Sesi Tiket / Tanya Admin (Muncul Saat Sudah Ada Tiket) -->
                            <div id="roomTicketHeaderWrap" class="d-none">
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
                    </div>

                    <!-- Dropdown Titik Tiga (Hanya Muncul Saat Sudah Ada Nomor Tiket) -->
                    <div class="dropdown d-none flex-shrink-0" id="roomActionDropdownWrap">
                        <button class="btn btn-light chat-back-btn" type="button" id="roomActionMenuBtn" data-bs-toggle="dropdown" aria-expanded="false" title="Menu Opsi Chat">
                            <i data-feather="more-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 py-1" style="border-radius: 12px; font-size: 13px; min-width: 190px;" aria-labelledby="roomActionMenuBtn">
                            <li>
                                <a class="dropdown-item py-2 d-flex align-items-center gap-2" href="javascript:void(0)" id="menuActionCopyTicket">
                                    <i data-feather="copy" style="width: 14px; height: 14px;" class="text-primary"></i>
                                    <span>Salin No. Tiket</span>
                                </a>
                            </li>
                            <li><hr class="dropdown-divider my-1"></li>
                            <li>
                                <a class="dropdown-item py-2 d-flex align-items-center gap-2 text-danger" href="javascript:void(0)" id="menuActionEndChat">
                                    <i data-feather="power" style="width: 14px; height: 14px;" class="text-danger"></i>
                                    <span>Tutup / Akhiri Chat</span>
                                </a>
                            </li>
                        </ul>
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
    <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js"></script>
    <script>
        const firebaseConfig = {
            apiKey: "{{ config('services.firebase.api_key') }}",
            authDomain: "{{ config('services.firebase.auth_domain') }}",
            databaseURL: "{{ config('services.firebase.database_url') }}",
            projectId: "{{ config('services.firebase.project_id') }}",
            storageBucket: "{{ config('services.firebase.storage_bucket') }}",
            messagingSenderId: "{{ config('services.firebase.messaging_sender_id') }}",
            appId: "{{ config('services.firebase.app_id') }}"
        };
        if (!window.firebase?.apps?.length) {
            window.firebase?.initializeApp(firebaseConfig);
        }
        window.FirebaseDB = window.firebase ? window.firebase.database() : null;
    </script>
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
                    drawer.classList.remove('show', 'is-expanded');
                    const expandBtn = document.getElementById('btnToggleExpandChat');
                    if (expandBtn) {
                        expandBtn.innerHTML = '<i data-feather="maximize-2"></i>';
                        if (window.feather) feather.replace();
                    }
                    if (typeof resetGuestSession === 'function') {
                        resetGuestSession();
                    }
                    if (typeof showPage === 'function' && typeof el !== 'undefined' && el.pageHome) {
                        showPage(el.pageHome);
                    }
                });

                document.addEventListener('click', function(e) {
                    const clickedInsideDrawer = (e.composedPath && e.composedPath().includes(drawer)) || drawer.contains(e.target);
                    const clickedOpenBtn = (e.composedPath && e.composedPath().includes(openBtn)) || openBtn.contains(e.target);
                    const clickedCardHelpBtn = document.getElementById('btnOpenPusatBantuanFromCard')?.contains(e.target);

                    if (
                        drawer.classList.contains('show') &&
                        !clickedInsideDrawer &&
                        !clickedOpenBtn &&
                        !clickedCardHelpBtn
                    ) {
                        drawer.classList.remove('show', 'is-expanded');
                        const expandBtn = document.getElementById('btnToggleExpandChat');
                        if (expandBtn) {
                            expandBtn.innerHTML = '<i data-feather="maximize-2"></i>';
                            if (window.feather) feather.replace();
                        }
                    }
                });

                // Trigger Pusat Bantuan dari Tombol Card Login
                const btnCardHelp = document.getElementById('btnOpenPusatBantuanFromCard');
                if (btnCardHelp) {
                    btnCardHelp.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        drawer.classList.add('show');
                        if (typeof showPage === 'function' && typeof el !== 'undefined' && el.pageHome) {
                            showPage(el.pageHome);
                        }
                    });
                }

                ChatWidgetLogin.init();
            }
        });

        // Slider Navigation & Fallback Helper
        function showRegister() {
            const drawer = document.getElementById('chatDrawer');
            if (drawer) {
                drawer.classList.add('show');
                if (typeof showPage === 'function' && typeof el !== 'undefined' && el.pageHome) {
                    showPage(el.pageHome);
                }
            } else {
                document.getElementById('formSlider')?.classList.add('active');
            }
            if (window.feather) feather.replace();
        }

        function showLogin() {
            document.getElementById('formSlider')?.classList.remove('active');
            if (window.feather) feather.replace();
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