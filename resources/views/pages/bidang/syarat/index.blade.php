@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="check-square"></i></div>
                        Manajemen Syarat
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ route('adminBidang.syarat.createBidang') }}">
                        <i class="me-1" data-feather="plus"></i>
                        Tambah Syarat Baru
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

{{-- Modal Lihat Data --}}
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Detail Syarat</h5>
                <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
            </div>

            <div class="modal-body">
                <div class="row">
                    <div class="col-12">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="layers" class="me-1"></i> Bidang</span>
                                    <span id="detailBidang" class="text-end fw-semibold"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="briefcase" class="me-1"></i> Nama Layanan</span>
                                    <span id="detailLayanan" class="text-end fw-semibold"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="check-square" class="me-1"></i> Syarat</span>
                                    <span id="detailSyarat" class="text-end fw-semibold"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

{{-- Modal Delete Data --}}
<div class="modal fade" id="modalDelete" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Hapus Syarat</h5>
                <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
            </div>

            <div class="modal-body">
                <p id="textDelete"></p>
            </div>

            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal" type="button">
                    <i data-feather="arrow-left" class="me-1"></i>
                    Batal
                </button>

                <form id="formDelete" method="POST">
                    @csrf
                    @method('DELETE')

                    <button class="btn btn-danger" type="submit" id="btnConfirmDelete">
                        <span class="btn-delete-text">
                            <i data-feather="trash-2" class="me-1"></i>
                            Ya, Hapus
                        </span>

                        <span class="btn-delete-loading d-none">
                            <span class="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"></span>
                            Menghapus...
                        </span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form id="filterForm" onsubmit="event.preventDefault()" class="mb-3">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        <!-- LAYANAN -->
                        <div class="col-xl-4 col-md-6">
                            <label class="form-label small mb-1">Layanan</label>
                            <select name="layanan" id="layananSelect" class="form-select">
                                <option value="" disabled {{ !$layananId ? 'selected' : '' }}>Pilih Layanan</option>
                                @foreach($layanan as $item)
                                <option value="{{ $item->id }}"
                                    {{ $layananId == $item->id ? 'selected' : '' }}>
                                    {{ $item->nama_layanan }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>
            </form>

            <div class="position-relative">
                <div id="tableLoading" class="table-loading d-none">
                    <div class="loading-content">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>

                <div id="tableContainer" style="min-height: 200px; transition: opacity 0.25s ease-in-out;">
                    @if ($layananId && $syarat->count() > 0)
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Layanan</th>
                                <th>Syarat</th>
                                <th>Metode e-File</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>Nama Layanan</th>
                                <th>Syarat</th>
                                <th>Metode e-File</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($syarat as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>{{ $item->syarat }}</td>
                                <td>
                                    @switch($item->metode)
                                    @case('simpeg')
                                    SIMPEG
                                    @break
                                    @case('upload')
                                    Upload
                                    @break
                                    @default
                                    -
                                    @endswitch
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#" data-layanan="{{ $item->layanan->nama_layanan ?? '-' }}"
                                            data-bidang="{{ $item->layanan->bidang->nama_bidang ?? '-' }}"
                                            data-syarat="{{ $item->syarat }}" title="Lihat layanan">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('adminBidang.syarat.editBidang', $item->id) }}"
                                            title="Edit Syarat">
                                            <i data-feather="edit" class="text-warning"></i>
                                        </a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDelete"
                                            href="#" data-id="{{ $item->id }}"
                                            data-nama="{{ $item->syarat }}"
                                            data-layanan="{{ $item->layanan->nama_layanan ?? '-' }}" title="Hapus Syarat">
                                            <i data-feather="trash" class="text-danger"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @else
                    <div class="text-center py-5 text-muted">
                        <i data-feather="check-square" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                        <h5 class="fw-bold text-dark">Layanan Belum Dipilih</h5>
                        <p class="mb-0 text-muted">Silakan pilih Layanan pada filter di atas untuk memuat daftar syarat.</p>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        const tableLoading = document.getElementById('tableLoading');
        const tableContainer = document.getElementById('tableContainer');
        const layananSelect = document.getElementById('layananSelect');

        // Initial Datatable if server rendered
        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
        }

        function renderTable(rowsHtml = '') {
            if (window.dataTable) {
                try {
                    window.dataTable.destroy();
                } catch (e) {}
                window.dataTable = null;
            }

            const container = document.getElementById('tableContainer');
            if (!container) return;

            container.innerHTML = `
                <table id="datatablesSimple">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Syarat</th>
                            <th>Metode e-File</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Syarat</th>
                            <th>Metode e-File</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            `;

            const newTable = document.getElementById('datatablesSimple');
            if (newTable && typeof simpleDatatables !== 'undefined') {
                window.dataTable = new simpleDatatables.DataTable(newTable);
            }

            feather.replace();
            container.style.opacity = '1';
        }

        function loadSyarat(layananId) {
            if (!layananId) {
                if (window.dataTable) {
                    try { window.dataTable.destroy(); } catch (e) {}
                    window.dataTable = null;
                }
                if (tableContainer) {
                    tableContainer.innerHTML = `
                        <div class="text-center py-5 text-muted">
                            <i data-feather="check-square" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                            <h5 class="fw-bold text-dark">Layanan Belum Dipilih</h5>
                            <p class="mb-0 text-muted">Silakan pilih Layanan pada filter di atas untuk memuat daftar syarat.</p>
                        </div>
                    `;
                    feather.replace();
                    tableContainer.style.opacity = '1';
                }
                return;
            }

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            fetch(`/adminBidang/get-syarat-by-layanan/${layananId}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const namaLayanan = (item.layanan && item.layanan.nama_layanan) ? item.layanan.nama_layanan : '-';
                        const namaBidang = (item.layanan && item.layanan.bidang && item.layanan.bidang.nama_bidang) ? item.layanan.bidang.nama_bidang : '-';
                        const syaratText = item.syarat || '-';
                        let metodeText = '-';
                        if (item.metode === 'simpeg') metodeText = 'SIMPEG';
                        else if (item.metode === 'upload') metodeText = 'Upload';

                        const editUrl = `/adminBidang/syarat/${item.id}/edit`;

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(namaLayanan)}</td>
                                <td>${escapeHtml(syaratText)}</td>
                                <td>${escapeHtml(metodeText)}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#"
                                            data-layanan="${escapeHtml(namaLayanan)}"
                                            data-bidang="${escapeHtml(namaBidang)}"
                                            data-syarat="${escapeHtml(syaratText)}"
                                            title="Lihat layanan">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="${editUrl}"
                                            title="Edit Syarat">
                                            <i data-feather="edit" class="text-warning"></i>
                                        </a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDelete"
                                            href="#"
                                            data-id="${item.id}"
                                            data-nama="${escapeHtml(syaratText)}"
                                            data-layanan="${escapeHtml(namaLayanan)}"
                                            title="Hapus Syarat">
                                            <i data-feather="trash" class="text-danger"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });

                    renderTable(rowsHtml);
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal memuat syarat:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        layananSelect?.addEventListener('change', function() {
            loadSyarat(this.value);
        });

        // MODAL DETAIL (EVENT DELEGATION)
        const modalDetailEl = document.getElementById('modalDetail');
        if (modalDetailEl) {
            const modalDetail = new bootstrap.Modal(modalDetailEl);

            document.addEventListener('click', function(e) {
                const btn = e.target.closest('.btnDetail');
                if (!btn) return;

                e.preventDefault();
                document.getElementById('detailBidang').innerText = btn.dataset.bidang || '-';
                document.getElementById('detailLayanan').innerText = btn.dataset.layanan || '-';
                document.getElementById('detailSyarat').innerText = btn.dataset.syarat || '-';

                modalDetail.show();
            });
        }

        // MODAL DELETE (EVENT DELEGATION)
        const modalDeleteEl = document.getElementById('modalDelete');
        if (modalDeleteEl) {
            const modalDelete = new bootstrap.Modal(modalDeleteEl);

            document.addEventListener('click', function(e) {
                const btn = e.target.closest('.btnDelete');
                if (!btn) return;

                e.preventDefault();
                const id = btn.dataset.id;
                const layanan = btn.dataset.layanan || '';

                document.getElementById('textDelete').innerHTML =
                    `Apakah anda yakin ingin menghapus syarat pada layanan <b>${escapeHtml(layanan)}</b>?`;

                document.getElementById('formDelete').action = `/adminBidang/syarat/${id}`;

                modalDelete.show();
            });
        }

        const formDelete = document.getElementById('formDelete');
        const btnConfirmDelete = document.getElementById('btnConfirmDelete');

        formDelete?.addEventListener('submit', function() {
            if (btnConfirmDelete) {
                btnConfirmDelete.disabled = true;
                btnConfirmDelete.querySelector('.btn-delete-text')?.classList.add('d-none');
                btnConfirmDelete.querySelector('.btn-delete-loading')?.classList.remove('d-none');
            }
        });

    });
</script>
@endsection