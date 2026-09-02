@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/chat-page.css') }}">
<style>
    /* Sembunyikan floating button saat berada di halaman /chat */
    #chatFloatingButton {
        display: none !important;
    }

    /* Hilangkan padding default pada main container untuk full-height chat */
    #layoutSidenav_content main {
        padding: 0 !important;
    }
</style>
@endpush

@section('content')
<div class="wa-container">

    <!-- ========================================================= -->
    <!-- LEFT SIDEBAR: DAFTAR PERCAKAPAN -->
    <!-- ========================================================= -->
    <div class="wa-sidebar">
        <!-- Sidebar Header -->
        <div class="wa-sidebar-header">
            <div class="d-flex align-items-center gap-2 overflow-hidden">
                <div class="wa-user-avatar">
                    @php
                    $nameParts = explode(' ', trim(auth()->user()->nama ?? 'User'));
                    $initials = (isset($nameParts[0][0]) ? $nameParts[0][0] : '') . (isset($nameParts[1][0]) ? $nameParts[1][0] : '');
                    if(strlen($initials) < 2) $initials=strtoupper(substr(auth()->user()->nama ?? 'U', 0, 2));
                        @endphp
                        {{ strtoupper($initials) }}
                </div>
                <div class="overflow-hidden">
                    <div class="fw-bold text-dark text-truncate" style="font-size: 13.5px;">
                        {{ explode(',', auth()->user()->nama ?? 'Pengguna')[0] }}
                    </div>
                    <div class="text-muted small text-truncate" style="font-size: 11px;">
                        @if(auth()->user()->role->name === 'admin_opd')
                        Admin OPD
                        @elseif(auth()->user()->role->name === 'bidang')
                        Admin Bidang
                        @elseif(auth()->user()->role->name === 'admin_bawah')
                        Admin FO
                        @else
                        Administrator
                        @endif
                    </div>
                </div>
            </div>

            <div class="wa-header-actions">
                <!-- Search Ticket Modal Button (Hanya untuk Admin OPD) -->
                @if(optional(auth()->user()->role)->name === 'admin_opd')
                <button type="button" class="wa-icon-btn" id="waBtnSearchTicketModal" title="Cari Nomor Tiket / Mulai Chat Baru">
                    <i data-feather="plus-circle"></i>
                </button>
                @endif

                <!-- Options Dropdown (Titik Tiga) -->
                <div class="dropdown">
                    <button class="wa-icon-btn" type="button" id="waBtnSidebarMenu" data-bs-toggle="dropdown" aria-expanded="false" title="Menu Opsi">
                        <i data-feather="more-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end chat-dropdown-menu">
                        <li>
                            <a class="dropdown-item d-flex align-items-center" href="#" id="waBtnSelectMessages">
                                <i data-feather="check-square" class="me-2" style="width:14px;height:14px;"></i>
                                Pilih Pesan
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center" href="#" id="waBtnMarkAllRead">
                                <i data-feather="check" class="me-2" style="width:14px;height:14px;"></i>
                                Baca Semua
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Search & Filter Section -->
        <div class="wa-search-section">
            <div class="wa-search-wrapper" id="waSearchWrapper">
                <i data-feather="search" class="wa-search-icon"></i>
                <input type="text" class="wa-search-input" id="waSearchInput" placeholder="Cari tiket, layanan, nama, pesan...">
            </div>

            <!-- Selection Bar (Muncul saat Pilih Pesan aktif) -->
            <div class="wa-selection-bar d-none" id="waSelectionBar">
                <div class="d-flex align-items-center gap-2">
                    <div class="form-check m-0 d-flex align-items-center gap-1">
                        <input class="form-check-input conversation-checkbox" type="checkbox" id="waCheckSelectAll">
                        <label class="form-check-label small fw-semibold text-dark mb-0" for="waCheckSelectAll" style="cursor:pointer;">
                            Semua
                        </label>
                    </div>
                    <span class="small fw-semibold text-primary" id="waSelectedCountText">0 Dipilih</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" id="waBtnDeleteSelected" disabled style="border-radius: 8px; font-size: 11.5px; font-weight: 600;">
                        <i data-feather="trash-2" style="width:13px;height:13px;"></i>
                        Hapus Chat
                    </button>
                    <button type="button" class="btn btn-sm btn-light" id="waBtnCancelSelection" style="border-radius: 8px; font-size: 11.5px;">
                        Batal
                    </button>
                </div>
            </div>
        </div>

        <!-- Conversation Items List -->
        <div class="wa-conv-list" id="waConvList">
            <div class="chat-skeleton-wrapper p-3">
                <div class="chat-skeleton-item"></div>
                <div class="chat-skeleton-item"></div>
                <div class="chat-skeleton-item"></div>
                <div class="chat-skeleton-item"></div>
            </div>
        </div>
    </div>

    <!-- ========================================================= -->
    <!-- RIGHT MAIN PANEL: RUANG PERCAKAPAN (CHAT ROOM) -->
    <!-- ========================================================= -->
    <div class="wa-main">

        <!-- 1. EMPTY STATE (Ketika belum ada obrolan yang dipilih) -->
        <div class="wa-empty-state" id="waEmptyState">
            <div class="wa-empty-icon">
                <i data-feather="message-square"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Pusat Komunikasi & Bantuan PILKB</h4>
            @if(optional(auth()->user()->role)->name === 'admin_opd')
            <p class="text-muted small mb-4" style="max-width: 440px;">
                Pilih salah satu percakapan di sebelah kiri untuk melihat pesan, atau mulai percakapan baru dengan memasukkan nomor tiket layanan kepegawaian Anda.
            </p>
            <button class="btn chat-gradient-btn px-4 d-inline-flex align-items-center" id="btnOpenSearchModal">
                <i data-feather="search" class="me-2"></i>
                Cari Nomor Tiket
            </button>
            @else
            <p class="text-muted small mb-4" style="max-width: 440px;">
                Pilih salah satu percakapan di sebelah kiri untuk melihat dan membalas pesan tiket atau tamu yang masuk ke bidang Anda.
            </p>
            @endif
            <!-- <div class="mt-5 text-muted small d-flex align-items-center gap-1 opacity-75">
                <i data-feather="lock" style="width: 13px; height: 13px;"></i>
                Pesan terenkripsi dan tersimpan aman di server BKPSDM Buleleng
            </div> -->
        </div>

        <!-- 2. ACTIVE ROOM VIEW -->
        <div class="d-none h-100 d-flex flex-column" id="waActiveRoom">
            <!-- Room Header -->
            <div class="wa-room-header">
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                    <!-- Mobile Back Button -->
                    <button type="button" class="btn btn-light chat-back-btn d-md-none me-1" id="waBtnBackToList" title="Kembali ke daftar">
                        <i data-feather="arrow-left"></i>
                    </button>

                    <div class="wa-user-avatar" id="waRoomAvatar" style="width: 38px; height: 38px; font-size: 13px;">
                        KP
                    </div>

                    <div class="wa-room-details overflow-hidden">
                        <div class="wa-room-title">
                            <span id="waRoomTitle">-</span>
                            <span id="waRoomRoleBadge"></span>
                            <span class="chat-item-ticket d-none" id="waRoomTicketBadge">
                                <i data-feather="tag"></i>
                                <span id="waRoomTicketNo">-</span>
                            </span>
                            <span id="waRoomStatusBadge" class="chat-status-pill open">
                                Open
                            </span>
                        </div>
                        <div class="wa-room-subtitle" id="waRoomSubtitle">
                            Pusat Bantuan PILKB
                        </div>
                    </div>
                </div>

                <!-- Room Action Menu -->
                <div class="dropdown">
                    <button class="wa-icon-btn" type="button" id="waBtnRoomMenu" data-bs-toggle="dropdown" aria-expanded="false" title="Menu opsi percakapan">
                        <i data-feather="more-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end chat-dropdown-menu">
                        <li id="waLiCloseChat">
                            <a class="dropdown-item d-flex align-items-center text-danger" href="#" id="waBtnCloseChat">
                                <i data-feather="check-circle" class="me-2" style="width:14px;height:14px;"></i>
                                Tutup Chat
                            </a>
                        </li>
                        <li id="waLiReopenChat" class="d-none">
                            <a class="dropdown-item d-flex align-items-center text-success" href="#" id="waBtnReopenChat">
                                <i data-feather="rotate-cw" class="me-2" style="width:14px;height:14px;"></i>
                                Buka Chat
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Messages Stream Box -->
            <div class="wa-messages-container" id="waMessagesBox">
            </div>

            <!-- Closed Notice -->
            <div id="waChatClosedNotice" class="chat-closed-notice d-none px-3 py-2 text-center">
                <i data-feather="lock" class="me-1" style="width:13px;height:13px;"></i> Percakapan ini telah ditutup
            </div>

            <!-- Input Footer -->
            <div class="wa-input-footer position-relative">
                <!-- Emoji Picker Tray (Muncul tepat di atas tombol emoji) -->
                <div class="chat-emoji-picker d-none" id="waChatEmojiPicker">
                    <div class="chat-emoji-header">
                        <span>Pilih Emoji</span>
                        <button type="button" class="btn-close btn-close-sm" id="waCloseEmojiPicker" aria-label="Tutup"></button>
                    </div>
                    <div class="chat-emoji-grid">
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="😊">😊</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="👍">👍</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="🙏">🙏</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="👋">👋</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="😄">😄</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="🤝">🤝</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="👌">👌</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="✅">✅</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="🙌">🙌</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="✨">✨</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="💡">💡</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="🎉">🎉</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="😁">😁</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="😉">😉</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="🤔">🤔</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="🫡">🫡</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="😎">😎</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="👏">👏</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="💪">💪</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="❤️">❤️</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="🔥">🔥</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="💯">💯</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="📌">📌</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="📝">📝</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="📋">📋</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="💼">💼</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="📂">📂</button>
                        <button type="button" class="wa-emoji-item emoji-item" data-emoji="☕">☕</button>
                    </div>
                </div>

                <div class="wa-input-box">
                    <textarea class="wa-textarea" id="waChatInput" rows="1" placeholder="Tulis pesan..."></textarea>
                    <button type="button" class="wa-emoji-trigger" id="waChatEmojiBtn" title="Pilih Emoji">
                        <i data-feather="smile"></i>
                    </button>
                </div>

                <button type="button" class="wa-send-btn" id="waSendMessage" disabled title="Kirim Pesan">
                    <i data-feather="navigation"></i>
                </button>
            </div>
        </div>

    </div>

</div>

<!-- ========================================================= -->
<!-- MODAL CARI TIKET PERCAKAPAN BARU -->
<!-- ========================================================= -->
<div class="modal fade" id="modalSearchTicket" tabindex="-1" aria-labelledby="modalSearchTicketLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow" style="border-radius: 16px;">
            <div class="modal-header border-bottom-0 pb-0">
                <div class="d-flex align-items-center gap-2">
                    <div class="p-2 rounded-circle bg-primary-soft text-primary">
                        <i data-feather="search" style="width: 18px; height: 18px;"></i>
                    </div>
                    <div>
                        <h6 class="modal-title fw-bold text-dark" id="modalSearchTicketLabel">Cari & Buka Obrolan Tiket</h6>
                        <small class="text-muted">Masukkan nomor tiket layanan Anda</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body py-3">
                <div class="mb-3">
                    <label class="form-label fw-semibold text-dark small">Nomor Tiket</label>
                    <input type="text" class="form-control text-dark" id="waModalTicketInput" placeholder="Contoh: 010126ABCD">
                </div>
            </div>
            <div class="modal-footer border-top-0 pt-0">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn chat-gradient-btn d-flex align-items-center" id="waBtnSubmitSearchTicket">
                    <i data-feather="search" class="me-1"></i>
                    Cari & Buka
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
@php
$chatAuthData = [
'id' => (int) Auth::id(),
'name' => optional(Auth::user())->nama,
'role' => optional(Auth::user()->role)->name,
];
@endphp
<script>
    window.ChatAuth = {!! json_encode($chatAuthData) !!};
</script>
<script src="{{ asset('js/chat/chat-page.js') }}"></script>
@endpush