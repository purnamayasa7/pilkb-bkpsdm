@extends('layouts.app')

@push('styles')
<style>
    /* DataTables Search Box Shadow Fix & Input */
    .datatable-top {
        padding: 0.9rem 1.15rem !important;
        overflow: visible !important;
    }

    .datatable-search {
        padding: 4px 6px !important;
        overflow: visible !important;
    }

    .datatable-input {
        margin: 2px !important;
        padding: 0.45rem 0.85rem !important;
        border-radius: 0.375rem !important;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
    }

    .datatable-input:focus {
        outline: 0 !important;
        box-shadow: 0 0 0 0.22rem rgba(0, 97, 242, 0.22) !important;
    }

    html.dark-mode .datatable-input:focus,
    body.dark-mode .datatable-input:focus {
        box-shadow: 0 0 0 0.22rem rgba(79, 111, 255, 0.25) !important;
    }

    /* DataTables Controls on Mobile Screens */
    @media (max-width: 575.98px) {
        .datatable-top {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.6rem !important;
            align-items: stretch !important;
            padding: 0.75rem !important;
        }

        .datatable-dropdown,
        .datatable-search {
            float: none !important;
            width: 100% !important;
            padding: 0 !important;
        }

        .datatable-input {
            width: 100% !important;
            min-width: 0 !important;
            margin: 2px 0 !important;
        }

        .datatable-bottom {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.6rem !important;
            align-items: center !important;
            text-align: center !important;
            padding: 0.75rem !important;
        }

        .datatable-info,
        .datatable-pagination {
            float: none !important;
            margin: 0 !important;
        }
    }

    /* Header Halaman di Dark Mode */
    html.dark-mode .backup-page-header,
    body.dark-mode .backup-page-header {
        background-color: #182235 !important;
        border-bottom-color: #253247 !important;
    }

    html.dark-mode .backup-page-title,
    body.dark-mode .backup-page-title {
        color: #f1f5f9 !important;
    }

    html.dark-mode .backup-page-icon,
    body.dark-mode .backup-page-icon {
        color: #818cf8 !important;
    }

    /* Kartu Statistik di Dark Mode */
    html.dark-mode .backup-stat-card,
    body.dark-mode .backup-stat-card {
        background-color: #182235 !important;
        border-color: #253247 !important;
    }

    html.dark-mode .backup-stat-val,
    body.dark-mode .backup-stat-val {
        color: #f1f5f9 !important;
    }

    html.dark-mode .backup-stat-sub,
    body.dark-mode .backup-stat-sub {
        color: #94a3b8 !important;
    }

    /* Ikon Lingkaran Kartu Statistik di Dark Mode */
    html.dark-mode .bg-primary-soft,
    body.dark-mode .bg-primary-soft {
        background-color: rgba(79, 111, 255, 0.18) !important;
        color: #818cf8 !important;
    }

    html.dark-mode .bg-info-soft,
    body.dark-mode .bg-info-soft {
        background-color: rgba(14, 165, 233, 0.18) !important;
        color: #38bdf8 !important;
    }

    html.dark-mode .bg-success-soft,
    body.dark-mode .bg-success-soft {
        background-color: rgba(34, 197, 94, 0.18) !important;
        color: #4ade80 !important;
    }

    /* Header Kartu Utama & Badge Jadwal di Dark Mode */
    html.dark-mode .card-header-backup,
    body.dark-mode .card-header-backup {
        background-color: #182235 !important;
        border-bottom-color: #253247 !important;
    }

    html.dark-mode .card-header-backup h6,
    body.dark-mode .card-header-backup h6 {
        color: #818cf8 !important;
    }

    html.dark-mode .badge-schedule-info,
    body.dark-mode .badge-schedule-info {
        background-color: #101a2c !important;
        color: #818cf8 !important;
        border-color: #34445b !important;
    }

    html.dark-mode .badge-schedule-success,
    body.dark-mode .badge-schedule-success {
        background-color: rgba(34, 197, 94, 0.15) !important;
        color: #4ade80 !important;
        border-color: rgba(34, 197, 94, 0.3) !important;
    }

    html.dark-mode .badge-schedule-missed,
    body.dark-mode .badge-schedule-missed {
        background-color: rgba(239, 68, 68, 0.15) !important;
        color: #f87171 !important;
        border-color: rgba(239, 68, 68, 0.3) !important;
    }

    html.dark-mode .badge-schedule-waiting,
    body.dark-mode .badge-schedule-waiting {
        background-color: rgba(148, 163, 184, 0.15) !important;
        color: #cbd5e1 !important;
        border-color: #334155 !important;
    }

    /* Kotak Alert Informasi di Dark Mode */
    html.dark-mode .backup-info-alert,
    body.dark-mode .backup-info-alert {
        background-color: rgba(30, 58, 138, 0.25) !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
        color: #bfdbfe !important;
    }

    html.dark-mode .backup-info-alert code,
    body.dark-mode .backup-info-alert code {
        background-color: #0f172a !important;
        color: #93c5fd !important;
        border: 1px solid #1e293b !important;
    }

    /* Tabel di Dark Mode */
    html.dark-mode .table-backup-head th,
    body.dark-mode .table-backup-head th {
        background-color: #101a2c !important;
        color: #cbd5e1 !important;
        border-color: #253247 !important;
    }

    html.dark-mode .table-backup-filename,
    body.dark-mode .table-backup-filename {
        color: #f1f5f9 !important;
    }

    html.dark-mode .table-backup-path,
    body.dark-mode .table-backup-path {
        color: #94a3b8 !important;
    }

    html.dark-mode .table-backup-badge-size,
    body.dark-mode .table-backup-badge-size {
        background-color: #101a2c !important;
        color: #cbd5e1 !important;
        border-color: #253247 !important;
    }

    html.dark-mode .table-backup-date,
    body.dark-mode .table-backup-date {
        color: #e2e8f0 !important;
    }

    html.dark-mode .table-backup-diff,
    body.dark-mode .table-backup-diff {
        color: #94a3b8 !important;
    }

    /* Tombol Aksi Tabel di Dark Mode */
    html.dark-mode .btn-backup-download,
    body.dark-mode .btn-backup-download {
        border-color: #4f6fff !important;
        color: #818cf8 !important;
    }

    html.dark-mode .btn-backup-download:hover,
    body.dark-mode .btn-backup-download:hover {
        background-color: #4f6fff !important;
        color: #ffffff !important;
    }

    html.dark-mode .btn-backup-delete,
    body.dark-mode .btn-backup-delete {
        border-color: #ef4444 !important;
        color: #f87171 !important;
    }

    html.dark-mode .btn-backup-delete:hover,
    body.dark-mode .btn-backup-delete:hover {
        background-color: #ef4444 !important;
        color: #ffffff !important;
    }

    /* Modal Konfirmasi Hapus di Dark Mode */
    html.dark-mode .modal-content,
    body.dark-mode .modal-content {
        background-color: #182235 !important;
        border-color: #253247 !important;
    }

    html.dark-mode .modal-header,
    html.dark-mode .modal-footer,
    body.dark-mode .modal-header,
    body.dark-mode .modal-footer {
        border-color: #253247 !important;
    }

    html.dark-mode .modal-title,
    body.dark-mode .modal-title {
        color: #f1f5f9 !important;
    }

    html.dark-mode .btn-close,
    body.dark-mode .btn-close {
        filter: invert(1) grayscale(100%) brightness(200%);
    }

    html.dark-mode #textDelete,
    body.dark-mode #textDelete {
        color: #cbd5e1 !important;
    }

    html.dark-mode #textDelete b,
    body.dark-mode #textDelete b {
        color: #f1f5f9 !important;
    }

    /* Responsif Mobile Khusus Halaman Backup */
    @media (max-width: 767.98px) {
        .backup-page-header .page-header-content .row {
            flex-direction: column !important;
            align-items: stretch !important;
        }

        .backup-page-title {
            font-size: 1.25rem !important;
        }

        #btnCreateBackup {
            width: 100% !important;
            justify-content: center !important;
            padding: 0.55rem 1rem !important;
            font-size: 0.9rem !important;
        }

        #formCreateBackup {
            display: block !important;
            width: 100% !important;
        }

        .backup-stat-card .card-body {
            padding: 0.9rem 1rem !important;
        }

        .backup-stat-val {
            font-size: 1.35rem !important;
        }

        .backup-stat-icon {
            width: 20px !important;
            height: 20px !important;
        }

        .backup-icon-circle {
            padding: 0.65rem !important;
        }
    }

    @media (max-width: 575.98px) {
        .card-header-backup {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
        }

        .card-header-backup .header-badges {
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 0.35rem !important;
        }

        .card-header-backup .header-badges .badge {
            font-size: 0.72rem !important;
        }
    }
</style>
@endpush

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4 backup-page-header">
    <div class="container-fluid px-3 px-md-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-12 col-md-auto mb-2 mb-md-3">
                    <h1 class="page-header-title backup-page-title d-flex align-items-center">
                        <div class="page-header-icon backup-page-icon me-2"><i data-feather="database"></i></div>
                        Manajemen Backup Database
                    </h1>
                </div>
                <div class="col-12 col-md-auto mb-3">
                    <form action="{{ route('root.backup.create') }}" method="POST" id="formCreateBackup" class="d-inline">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-primary shadow-sm" id="btnCreateBackup">
                            <span class="btn-create-text">
                                <i class="me-1" data-feather="plus-circle"></i>
                                Buat Backup Sekarang
                            </span>
                            <span class="btn-create-loading d-none">
                                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Memproses Backup...
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-3 px-md-4">
    <!-- Stat Cards -->
    <div class="row mb-3 mb-md-4">
        <div class="col-12 col-md-6 col-xl-4 mb-3 mb-xl-4">
            <div class="card border-start-lg border-start-primary h-100 shadow-sm backup-stat-card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="small fw-bold text-primary mb-1">Total File Backup</div>
                            <div class="h3 fw-bold text-gray-800 backup-stat-val mb-1">{{ $stats['total_backups'] }} file</div>
                            <div class="text-xs text-muted backup-stat-sub">Tersimpan di storage lokal aplikasi</div>
                        </div>
                        <div class="ms-2">
                            <div class="icon-circle bg-primary-soft text-primary rounded-circle backup-icon-circle p-3">
                                <i data-feather="archive" class="backup-stat-icon" style="width: 24px; height: 24px;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 col-md-6 col-xl-4 mb-3 mb-xl-4">
            <div class="card border-start-lg border-start-info h-100 shadow-sm backup-stat-card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="small fw-bold text-info mb-1">Total Ukuran Penyimpanan</div>
                            <div class="h3 fw-bold text-gray-800 backup-stat-val mb-1">{{ $stats['total_size'] }}</div>
                            <div class="text-xs text-muted backup-stat-sub">Kapasitas disk backup terpakai</div>
                        </div>
                        <div class="ms-2">
                            <div class="icon-circle bg-info-soft text-info rounded-circle backup-icon-circle p-3">
                                <i data-feather="hard-drive" class="backup-stat-icon" style="width: 24px; height: 24px;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 col-md-12 col-xl-4 mb-3 mb-xl-4">
            <div class="card border-start-lg border-start-success h-100 shadow-sm backup-stat-card">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="small fw-bold text-success mb-1">Backup Terakhir</div>
                            <div class="h5 fw-bold text-gray-800 backup-stat-val mb-1">
                                @if ($stats['latest_backup'])
                                    {{ $stats['latest_backup']->isoFormat('D MMMM Y, HH:mm') }} WITA
                                @else
                                    <span class="text-muted">Belum ada backup</span>
                                @endif
                            </div>
                            <div class="text-xs text-muted backup-stat-sub">
                                @if ($stats['latest_backup'])
                                    {{ $stats['latest_backup']->diffForHumans() }}
                                @else
                                    -
                                @endif
                            </div>
                        </div>
                        <div class="ms-2">
                            <div class="icon-circle bg-success-soft text-success rounded-circle backup-icon-circle p-3">
                                <i data-feather="clock" class="backup-stat-icon" style="width: 24px; height: 24px;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Table Card -->
    <div class="card shadow-sm mb-4 backup-stat-card">
        <div class="card-header bg-white py-3 card-header-backup d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h6 class="m-0 font-weight-bold text-primary d-flex align-items-center">
                <i data-feather="list" class="me-2" style="width: 18px; height: 18px;"></i>
                Daftar File Backup Database
            </h6>
            <div class="header-badges d-flex align-items-center gap-2">
                <span class="badge bg-light text-primary border badge-schedule-info">
                    <i data-feather="calendar" class="me-1" style="width: 12px; height: 12px;"></i>
                    Jadwal Otomatis: <strong>01:00 WITA</strong>
                </span>
                @if ($stats['has_backup_today'])
                    <span class="badge bg-success-soft text-success border border-success badge-schedule-success">
                        <i data-feather="check-circle" class="me-1" style="width: 12px; height: 12px;"></i>
                        Backup Hari Ini Selesai
                    </span>
                @elseif ($stats['is_missed_today'])
                    <span class="badge bg-danger-soft text-danger border border-danger badge-schedule-missed">
                        <i data-feather="alert-triangle" class="me-1" style="width: 12px; height: 12px;"></i>
                        Jadwal Terlewat (Server Offline)
                    </span>
                @else
                    <span class="badge bg-secondary-soft text-secondary border badge-schedule-waiting">
                        <i data-feather="clock" class="me-1" style="width: 12px; height: 12px;"></i>
                        Menunggu Jadwal 01:00 WITA
                    </span>
                @endif
            </div>
        </div>

        <div class="card-body p-3 p-md-4">
            <div class="alert alert-primary-soft d-flex align-items-start align-items-md-center mb-3 mb-md-4 backup-info-alert" role="alert">
                <i data-feather="info" class="me-2 mt-1 mt-md-0 flex-shrink-0" style="width: 18px; height: 18px;"></i>
                <div class="small">
                    Backup database mencakup seluruh skema dan data tabel aplikasi PILKB dalam format berkas terkompresi <code>.zip</code>. Anda dapat mengunduh salinan berkas ke perangkat lokal atau menghapus salinan lama jika ruang penyimpanan hampir penuh.
                </div>
            </div>

            <div class="table-responsive" style="-webkit-overflow-scrolling: touch;">
                <table class="table table-bordered table-hover align-middle mb-0" id="datatablesSimple">
                    <thead class="table-light table-backup-head">
                        <tr>
                            <th class="text-center" style="width: 50px;">No</th>
                            <th>Nama Berkas Backup</th>
                            <th class="text-nowrap" style="width: 130px;">Ukuran File</th>
                            <th class="text-nowrap" style="width: 230px;">Waktu Pembuatan</th>
                            <th class="text-center text-nowrap" style="width: 140px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($backups as $backup)
                        <tr>
                            <td class="text-center">{{ $loop->iteration }}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <i data-feather="file-text" class="text-primary me-2 flex-shrink-0" style="width: 18px; height: 18px;"></i>
                                    <div class="text-break">
                                        <span class="fw-semibold table-backup-filename">{{ $backup['filename'] }}</span>
                                        <div class="small table-backup-path">{{ $backup['path'] }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-nowrap">
                                <span class="badge bg-light text-dark border table-backup-badge-size">
                                    {{ $backup['size'] }}
                                </span>
                            </td>
                            <td class="text-nowrap">
                                <div class="table-backup-date">{{ $backup['created_at']->isoFormat('D MMMM Y, HH:mm:ss') }} WITA</div>
                                <div class="small table-backup-diff">{{ $backup['created_at']->diffForHumans() }}</div>
                            </td>
                            <td class="text-center text-nowrap">
                                <div class="d-inline-flex gap-1">
                                    <a class="btn btn-sm btn-outline-primary btn-backup-download"
                                       href="{{ route('root.backup.download', $backup['filename']) }}"
                                       data-bs-toggle="tooltip"
                                       title="Download Backup">
                                        <i data-feather="download" style="width: 14px; height: 14px;"></i>
                                        <span class="d-none d-md-inline ms-1">Unduh</span>
                                    </a>

                                    <button type="button"
                                            class="btn btn-sm btn-outline-danger btn-backup-delete btnDelete"
                                            data-filename="{{ $backup['filename'] }}"
                                            data-bs-toggle="tooltip"
                                            title="Hapus File">
                                        <i data-feather="trash-2" style="width: 14px; height: 14px;"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="5" class="text-center py-4 text-muted">
                                <i data-feather="database" class="mb-2" style="width: 32px; height: 32px; opacity: 0.5;"></i>
                                <div>Belum ada file backup database yang tersedia.</div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- Modal Delete Backup --}}
<div class="modal fade" id="modalDelete" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg">
            <div class="modal-header">
                <h5 class="modal-title d-flex align-items-center">
                    <i data-feather="alert-circle" class="text-danger me-2" style="width: 20px; height: 20px;"></i>
                    Konfirmasi Hapus Backup
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <p id="textDelete" class="mb-0"></p>
                <div class="text-danger small mt-2 d-flex align-items-center">
                    <i data-feather="alert-triangle" class="me-1 flex-shrink-0" style="width: 14px; height: 14px;"></i>
                    <span>Tindakan ini permanen dan berkas tidak dapat dipulihkan.</span>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="x" class="me-1" style="width: 14px; height: 14px;"></i> Batal
                </button>

                <form id="formDelete" method="POST">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-danger" type="submit" id="btnConfirmDelete">
                        <span class="btn-delete-text">
                            <i data-feather="trash-2" class="me-1" style="width: 14px; height: 14px;"></i> Ya, Hapus
                        </span>
                        <span class="btn-delete-loading d-none">
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Menghapus...
                        </span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Handle Create Backup Loading State
        const formCreateBackup = document.getElementById('formCreateBackup');
        const btnCreateBackup = document.getElementById('btnCreateBackup');

        if (formCreateBackup && btnCreateBackup) {
            formCreateBackup.addEventListener('submit', function() {
                btnCreateBackup.disabled = true;
                btnCreateBackup.querySelector('.btn-create-text')?.classList.add('d-none');
                btnCreateBackup.querySelector('.btn-create-loading')?.classList.remove('d-none');
            });
        }

        // Handle Delete Modal
        const modalDeleteEl = document.getElementById('modalDelete');
        const modalDelete = new bootstrap.Modal(modalDeleteEl);
        const formDelete = document.getElementById('formDelete');
        const btnConfirmDelete = document.getElementById('btnConfirmDelete');

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDelete');
            if (!btn) return;

            e.preventDefault();
            const filename = btn.dataset.filename;

            document.getElementById('textDelete').innerHTML =
                `Apakah Anda yakin ingin menghapus file backup <b>${filename}</b>?`;

            formDelete.action = `/root/backup/${encodeURIComponent(filename)}`;
            modalDelete.show();
        });

        if (formDelete && btnConfirmDelete) {
            formDelete.addEventListener('submit', function() {
                btnConfirmDelete.disabled = true;
                btnConfirmDelete.querySelector('.btn-delete-text')?.classList.add('d-none');
                btnConfirmDelete.querySelector('.btn-delete-loading')?.classList.remove('d-none');
            });
        }
    });
</script>
@endsection
