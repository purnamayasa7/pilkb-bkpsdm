@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="database"></i></div>
                        Manajemen Backup Database
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
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

<div class="container-fluid px-4">
    <!-- Stat Cards -->
    <div class="row mb-4">
        <div class="col-xl-4 col-md-6 mb-4">
            <div class="card border-start-lg border-start-primary h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="small fw-bold text-primary mb-1">Total File Backup</div>
                            <div class="h3 fw-bold text-gray-800">{{ $stats['total_backups'] }} file</div>
                            <div class="text-xs text-muted">Tersimpan di storage lokal aplikasi</div>
                        </div>
                        <div class="ms-2">
                            <div class="icon-circle bg-primary-soft text-primary p-3 rounded-circle">
                                <i data-feather="archive" style="width: 24px; height: 24px;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-md-6 mb-4">
            <div class="card border-start-lg border-start-info h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="small fw-bold text-info mb-1">Total Ukuran Penyimpanan</div>
                            <div class="h3 fw-bold text-gray-800">{{ $stats['total_size'] }}</div>
                            <div class="text-xs text-muted">Kapasitas disk backup terpakai</div>
                        </div>
                        <div class="ms-2">
                            <div class="icon-circle bg-info-soft text-info p-3 rounded-circle">
                                <i data-feather="hard-drive" style="width: 24px; height: 24px;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-4 col-md-6 mb-4">
            <div class="card border-start-lg border-start-success h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <div class="small fw-bold text-success mb-1">Backup Terakhir</div>
                            <div class="h5 fw-bold text-gray-800">
                                @if ($stats['latest_backup'])
                                    {{ $stats['latest_backup']->isoFormat('D MMMM Y, HH:mm') }} WITA
                                @else
                                    <span class="text-muted">Belum ada backup</span>
                                @endif
                            </div>
                            <div class="text-xs text-muted">
                                @if ($stats['latest_backup'])
                                    {{ $stats['latest_backup']->diffForHumans() }}
                                @else
                                    -
                                @endif
                            </div>
                        </div>
                        <div class="ms-2">
                            <div class="icon-circle bg-success-soft text-success p-3 rounded-circle">
                                <i data-feather="clock" style="width: 24px; height: 24px;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Table Card -->
    <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">
                <i data-feather="list" class="me-1"></i> Daftar File Backup Database
            </h6>
        </div>
        <div class="card-body">
            <div class="alert alert-primary-soft d-flex align-items-center mb-4" role="alert">
                <i data-feather="info" class="me-2 flex-shrink-0"></i>
                <div class="small">
                    Backup database mencakup seluruh skema dan data tabel aplikasi PILKB dalam bentuk file terkompresi <code>.zip</code>. Anda dapat mengunduh salinan berkas backup ke perangkat lokal atau menghapus salinan lama jika ruang penyimpanan hampir penuh.
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-bordered table-hover align-middle mb-0" id="datatablesSimple">
                    <thead class="table-light">
                        <tr>
                            <th style="width: 50px;">No</th>
                            <th>Nama Berkas Backup</th>
                            <th style="width: 130px;">Ukuran File</th>
                            <th style="width: 220px;">Waktu Pembuatan</th>
                            <th style="width: 140px;" class="text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse ($backups as $backup)
                        <tr>
                            <td class="text-center">{{ $loop->iteration }}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <i data-feather="file-text" class="text-primary me-2"></i>
                                    <div>
                                        <span class="fw-semibold text-dark">{{ $backup['filename'] }}</span>
                                        <div class="text-muted small">{{ $backup['path'] }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge bg-light text-dark border">
                                    {{ $backup['size'] }}
                                </span>
                            </td>
                            <td>
                                <div>{{ $backup['created_at']->isoFormat('D MMMM Y, HH:mm:ss') }}</div>
                                <div class="text-muted small">{{ $backup['created_at']->diffForHumans() }}</div>
                            </td>
                            <td class="text-center">
                                <div class="d-inline-flex gap-1">
                                    <a class="btn btn-sm btn-outline-primary"
                                       href="{{ route('root.backup.download', $backup['filename']) }}"
                                       data-bs-toggle="tooltip"
                                       title="Download Backup">
                                        <i data-feather="download" style="width: 14px; height: 14px;"></i>
                                        <span class="d-none d-md-inline ms-1">Unduh</span>
                                    </a>

                                    <button type="button"
                                            class="btn btn-sm btn-outline-danger btnDelete"
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
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Konfirmasi Hapus Backup</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <p id="textDelete" class="mb-0"></p>
                <div class="text-danger small mt-2">
                    <i data-feather="alert-triangle" class="me-1" style="width: 14px; height: 14px;"></i>
                    Tindakan ini permanen dan file tidak dapat dipulihkan.
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="x" class="me-1"></i> Batal
                </button>

                <form id="formDelete" method="POST">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-danger" type="submit" id="btnConfirmDelete">
                        <span class="btn-delete-text">
                            <i data-feather="trash-2" class="me-1"></i> Ya, Hapus
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
