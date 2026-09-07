@extends('layouts.app')

@push('styles')
<style>
    /* Reset Button */
    .btn {
        box-shadow: none !important;
    }

    /* Canvas Latar Belakang */
    .notif-body-bg {
        background-color: #f8fafc;
    }
    html.dark-mode .notif-body-bg {
        background-color: #0b1329 !important;
    }

    /* Notice Banner (Flat & Ringan) */
    .notif-info-box {
        background-color: #eff6ff;
        border: 1px solid #dbeafe;
    }
    .notif-info-icon {
        background-color: #ffffff;
        border: 1px solid #bfdbfe;
        color: #2563eb;
        width: 36px;
        height: 36px;
    }
    .notif-info-title {
        color: #1e40af;
        font-size: 0.9rem;
        font-weight: 700;
    }
    .notif-info-desc {
        color: #1e293b;
        font-size: 0.84rem;
    }

    html.dark-mode .notif-info-box {
        background-color: rgba(30, 58, 138, 0.25) !important;
        border-color: rgba(59, 130, 246, 0.3) !important;
    }
    html.dark-mode .notif-info-icon {
        background-color: #1e293b !important;
        border-color: #334155 !important;
        color: #60a5fa !important;
    }
    html.dark-mode .notif-info-title {
        color: #93c5fd !important;
    }
    html.dark-mode .notif-info-desc {
        color: #cbd5e1 !important;
    }

    /* Floating Card Notifikasi (Ringan, tanpa efek shadow/transform berat) */
    .notif-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        text-decoration: none !important;
        transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .notif-card:hover {
        background-color: #f8fafc;
        border-color: #cbd5e1;
    }
    .notif-card,
    .notif-card:hover,
    .notif-card:focus,
    .notif-card:active,
    .notif-card * {
        text-decoration: none !important;
    }

    /* Unread Card: Garis aksen kiri */
    .notif-card.is-unread {
        border-left: 4px solid #2563eb !important;
    }
    .notif-card.is-unread:hover {
        border-left-color: #1d4ed8 !important;
    }

    /* Unread Dot (Flat & Bersih) */
    .unread-dot {
        width: 8px;
        height: 8px;
        background-color: #2563eb;
        border-radius: 50%;
        display: inline-block;
        flex-shrink: 0;
    }
    html.dark-mode .unread-dot {
        background-color: #60a5fa !important;
    }

    /* Ikon Avatar */
    .notif-icon-wrap {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .notif-icon-wrap i {
        width: 18px;
        height: 18px;
    }

    /* Teks & Label */
    .notif-title {
        color: #0f172a;
        font-size: 0.93rem;
    }
    .notif-desc {
        color: #334155;
        font-size: 0.85rem;
        line-height: 1.45;
    }
    .notif-time {
        color: #475569;
        font-size: 0.76rem;
        font-weight: 600;
    }
    .notif-badge {
        background-color: #f1f5f9;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 4px;
    }

    /* Pagination SVG constraint */
    .pagination svg {
        width: 14px !important;
        height: 14px !important;
        display: inline-block;
        vertical-align: middle;
    }
    .pagination .page-item .page-link {
        font-size: 0.85rem;
        padding: 0.35rem 0.7rem;
        border-radius: 4px;
        margin: 0 2px;
    }
    .pagination {
        margin: 0;
    }

    /* Dark Mode Minimal & Cepat */
    html.dark-mode .page-header {
        background-color: #111c2f !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
    }
    html.dark-mode .page-header-title {
        color: #f8fafc !important;
    }
    html.dark-mode .page-header .btn-light {
        background-color: #1e293b !important;
        border-color: #334155 !important;
        color: #e2e8f0 !important;
    }
    html.dark-mode .notif-card {
        background-color: #182235 !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
    }
    html.dark-mode .notif-card:hover {
        background-color: #1e2d44 !important;
        border-color: rgba(99, 102, 241, 0.35) !important;
    }
    html.dark-mode .notif-card.is-unread {
        border-left: 4px solid #3b82f6 !important;
    }
    html.dark-mode .notif-title {
        color: #f8fafc !important;
    }
    html.dark-mode .notif-desc {
        color: #cbd5e1 !important;
    }
    html.dark-mode .notif-time {
        color: #94a3b8 !important;
    }
    html.dark-mode .notif-badge {
        background-color: #24344d !important;
        color: #e2e8f0 !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
    }
    html.dark-mode .notification-card-footer {
        background-color: #182235 !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
        color: #cbd5e1 !important;
    }
    html.dark-mode .pagination .page-item .page-link {
        background-color: #1e293b !important;
        border-color: #334155 !important;
        color: #e2e8f0 !important;
    }
    html.dark-mode .pagination .page-item.active .page-link {
        background-color: #2563eb !important;
        border-color: #2563eb !important;
        color: #ffffff !important;
    }
    html.dark-mode .notif-empty-card {
        background-color: #182235 !important;
        border-color: rgba(255, 255, 255, 0.08) !important;
    }
    html.dark-mode .notif-empty-title {
        color: #f8fafc !important;
    }
    html.dark-mode .notif-empty-desc {
        color: #94a3b8 !important;
    }
</style>
@endpush

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="bell"></i></div>
                        Notifikasi
                    </h1>
                </div>
                <div class="col-auto mb-3 d-flex gap-2">
                    <form action="{{ route('notifications.readAll') }}" method="POST">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-light text-primary border" title="Tandai semua notifikasi telah dibaca">
                            <i class="me-1" data-feather="check"></i>
                            Tandai Semua Dibaca
                        </button>
                    </form>

                    <form action="{{ route('notifications.deleteAll') }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus semua notifikasi?')">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-light text-danger border" title="Hapus seluruh riwayat notifikasi">
                            <i class="me-1" data-feather="trash-2"></i>
                            Hapus Semua
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-xl px-4 mt-2">

    <!-- Notice Banner (Flat & Ringan) -->
    <div class="alert notif-info-box d-flex align-items-center mb-4 py-2.5 px-3 rounded-3">
        <div class="me-3 notif-info-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
            <i data-feather="clock" style="width: 17px; height: 17px;"></i>
        </div>
        <div class="flex-grow-1">
            <div class="notif-info-title">Pembersihan Notifikasi Otomatis</div>
            <div class="notif-info-desc mb-0">
                Notifikasi yang berumur lebih dari <strong>90 hari</strong> akan dihapus secara berkala oleh sistem.
            </div>
        </div>
    </div>

    <!-- Outer Card Notifikasi -->
    <div class="card border-0 mb-4 rounded-3 overflow-hidden border">

        <!-- Card Header: Identik dengan Profile Index -->
        <div class="card-header bg-gradient-primary-to-secondary text-white py-3 px-4 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                <span class="fw-bold text-white" style="font-size: 1rem;">Semua Notifikasi</span>
                <span class="badge bg-white text-primary rounded-pill px-2.5 py-1 fw-bold" style="font-size: 0.78rem;">
                    {{ $notifications->total() }} Total
                </span>
            </div>

            @php
                $unreadCount = $notifications->whereNull('read_at')->count();
            @endphp
            @if($unreadCount > 0)
                <span class="badge bg-white text-danger rounded-pill px-2.5 py-1 fw-bold" style="font-size: 0.78rem;">
                    {{ $unreadCount }} Belum Dibaca
                </span>
            @endif
        </div>

        <!-- Body dengan latar bersih dan floating card ringan -->
        <div class="card-body notif-body-bg p-3 p-md-4">

            @php
                $notificationTypes = [
                    'usulan_baru' => ['class' => 'bg-success-soft text-success', 'icon' => 'file-text', 'label' => 'Usulan Baru'],
                    'berkas_diterima' => ['class' => 'bg-primary-soft text-primary', 'icon' => 'check', 'label' => 'Berkas Diterima'],
                    'berkas_tidak_lengkap' => ['class' => 'bg-warning-soft text-warning', 'icon' => 'alert-triangle', 'label' => 'Perlu Perbaikan'],
                    'review_perbaikan' => ['class' => 'bg-info-soft text-info', 'icon' => 'edit-3', 'label' => 'Review Perbaikan'],
                    'status_update' => ['class' => 'bg-info-soft text-info', 'icon' => 'refresh-cw', 'label' => 'Update Status'],
                    'pengambilan' => ['class' => 'bg-dark-soft text-dark', 'icon' => 'archive', 'label' => 'Pengambilan'],
                    'pindah_layanan' => ['class' => 'bg-secondary-soft text-secondary', 'icon' => 'shuffle', 'label' => 'Pindah Layanan'],
                    'selesai' => ['class' => 'bg-success-soft text-success', 'icon' => 'check-circle', 'label' => 'Selesai'],
                ];
            @endphp

            @forelse($notifications as $notification)
                @php
                    $type = $notification->data['type'] ?? 'default';
                    $config = $notificationTypes[$type] ?? [
                        'class' => 'bg-primary-soft text-primary',
                        'icon' => 'bell',
                        'label' => 'Notifikasi'
                    ];
                    $isUnread = is_null($notification->read_at);
                @endphp

                <!-- Card Item Ringan -->
                <a href="{{ route('notifications.read', $notification->id) }}"
                   class="notif-card text-decoration-none d-block p-3 mb-2.5 {{ $isUnread ? 'is-unread' : 'is-read' }}">
                    <div class="d-flex align-items-start gap-3">
                        <!-- Icon Avatar -->
                        <div class="notif-icon-wrap {{ $config['class'] }}">
                            <i data-feather="{{ $config['icon'] }}"></i>
                        </div>

                        <!-- Content -->
                        <div class="flex-grow-1 min-w-0">
                            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                <div class="d-flex align-items-center gap-2 flex-wrap">
                                    @if($isUnread)
                                        <span class="unread-dot" title="Belum dibaca"></span>
                                    @endif

                                    <span class="notif-title {{ $isUnread ? 'fw-bold' : 'fw-semibold' }}">
                                        {{ $notification->data['title'] ?? 'Pemberitahuan' }}
                                    </span>

                                    @if($isUnread)
                                        <span class="badge bg-danger-soft text-danger border border-danger-subtle px-2 py-0.5 fw-bold" style="font-size: 0.70rem;">
                                            Baru
                                        </span>
                                    @endif
                                </div>

                                <!-- Waktu -->
                                <span class="notif-time d-flex align-items-center flex-shrink-0">
                                    <i data-feather="clock" class="me-1" style="width: 12px; height: 12px;"></i>
                                    {{ $notification->created_at->diffForHumans() }}
                                </span>
                            </div>

                            <div class="notif-desc mb-2">
                                {{ $notification->data['message'] ?? '-' }}
                            </div>

                            <!-- Badges -->
                            <div class="d-flex flex-wrap align-items-center gap-1.5">
                                @if(!empty($notification->data['no_tiket']))
                                    <span class="notif-badge font-monospace">
                                        <i data-feather="tag" class="me-1" style="width: 11px; height: 11px;"></i>#{{ $notification->data['no_tiket'] }}
                                    </span>
                                @endif
                                @if(!empty($notification->data['nama_layanan']))
                                    <span class="notif-badge">
                                        <i data-feather="briefcase" class="me-1" style="width: 11px; height: 11px;"></i>{{ $notification->data['nama_layanan'] }}
                                    </span>
                                @endif
                                <span class="badge {{ $config['class'] }} py-1 px-2 fw-semibold" style="font-size: 0.72rem;">
                                    {{ $config['label'] }}
                                </span>
                            </div>
                        </div>

                        <!-- Right Chevron -->
                        <div class="flex-shrink-0 align-self-center text-muted ps-1 d-none d-sm-block" style="opacity: 0.5;">
                            <i data-feather="chevron-right" style="width: 16px; height: 16px;"></i>
                        </div>
                    </div>
                </a>
            @empty
                <div class="text-center py-5 px-3 notif-empty-card rounded-3 border bg-white">
                    <div class="d-inline-flex p-3 rounded-circle bg-light mb-3 text-muted">
                        <i data-feather="bell-off" style="width: 36px; height: 36px;"></i>
                    </div>
                    <h5 class="notif-empty-title fw-bold mb-1">Belum Ada Notifikasi</h5>
                    <p class="notif-empty-desc small mb-0" style="max-width: 420px; margin: 0 auto;">
                        Semua pemberitahuan aktivitas tiket layanan, verifikasi berkas, dan informasi kepegawaian Anda akan tampil di sini.
                    </p>
                </div>
            @endforelse

        </div>

        @if($notifications->hasPages())
        <div class="card-footer notification-card-footer bg-white border-top py-2.5 px-4">
            <div class="pagination-wrapper">
                {{ $notifications->links('pagination::bootstrap-5') }}
            </div>
        </div>
        @endif

    </div>

</div>
@endsection