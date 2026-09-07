@extends('layouts.app')

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
