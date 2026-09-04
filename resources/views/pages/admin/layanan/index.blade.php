@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="briefcase"></i></div>
                        Manajemen Layanan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <!-- Dropdown Export -->
                    <div class="btn-group">
                        <button class="btn btn-sm btn-light text-success dropdown-toggle" type="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="me-1" data-feather="download"></i>
                            Export
                        </button>
                        <ul class="dropdown-menu">
                            <li>
                                <a class="dropdown-item" href="{{ route('root.layanan.exportExcelList') }}">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="{{ route('root.layanan.exportPdfList') }}" target="_blank">
                                    <i class="me-1" data-feather="file"></i> Export PDF
                                </a>
                            </li>
                        </ul>
                    </div>
                    <a class="btn btn-sm btn-light text-primary" href="{{ route('root.layanan.create') }}">
                        <i class="me-1" data-feather="plus"></i>
                        Tambah Layanan Baru
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

{{-- Modal Aktif/Nonaktif --}}
<div class="modal fade" id="modalAktif" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Ubah Status Layanan</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <p id="textModal"></p>
            </div>

            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i> Batal
                </button>

                <form id="formToggle" method="POST">
                    @csrf
                    @method('PUT')
                    <button class="btn btn-primary" type="submit" id="btnConfirmToggle">
                        <span class="btn-toggle-text">
                            <i data-feather="check" class="me-1"></i> Ya, Lanjutkan
                        </span>
                        <span class="btn-toggle-loading d-none">
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Memproses...
                        </span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

{{-- Modal Lihat Data --}}
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Detail Layanan</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="row">
                    <div class="col-12">
                        <div class="card shadow-sm">
                            <div class="card-body">

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="layers" class="me-1"></i> Bidang</span>
                                    <span id="detailBidang" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="briefcase" class="me-1"></i> Nama Layanan</span>
                                    <span id="detailNama" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="copy" class="me-1"></i> Rangkap</span>
                                    <span id="detailRangkap" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="clock" class="me-1"></i> Waktu Penyelesaian</span>
                                    <span id="detailWaktu" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="toggle-right" class="me-1"></i> Status</span>
                                    <span id="detailStatus" class="text-end"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

{{-- Modal Deskripsi Layanan --}}
<div class="modal fade" id="modalDeskripsi" tabindex="-1" aria-labelledby="modalDeskripsiLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="modalDeskripsiLabel">
                    <i data-feather="file-text" class="me-1"></i>
                    Deskripsi Layanan
                </h5>

                <button type="button" class="btn-close" data-bs-dismiss="modal"
                    aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <h6 class="fw-bold mb-3" id="deskripsiNamaLayanan"></h6>
                        <div id="deskripsiContent"
                            style="white-space: pre-line; line-height: 1.7;">
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i> Tutup
                </button>
            </div>

        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('root.layanan') }}" id="filterForm" class="mb-3">
                <div class="row">
                    <div class="col-md-5">
                        <select name="bidang" id="bidangSelect" class="form-select">
                            <option value="all" {{ empty($bidangId) || $bidangId === 'all' ? 'selected' : '' }}>Semua Bidang</option>
                            @foreach ($bidang as $b)
                            <option value="{{ $b->id }}" {{ (isset($bidangId) && $bidangId == $b->id) ? 'selected' : '' }}>
                                {{ $b->nama_bidang }}
                            </option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </form>
            <div class="position-relative">
                <div id="tableLoading" class="table-loading">
                    <div class="loading-content">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <div id="tableContainer">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Bidang</th>
                                <th>Nama Layanan</th>
                                <th>Waktu Penyelesaian</th>
                                <th>Deskripsi</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>Nama Bidang</th>
                                <th>Nama Layanan</th>
                                <th>Waktu Penyelesaian</th>
                                <th>Deskripsi</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($layanan as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $item->bidang->nama_bidang ?? '-' }}</td>
                                <td>{{ $item->nama_layanan }}</td>
                                <td>{{ $item->waktu_penyelesaian ?? '-' }}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDeskripsi"
                                            href="#"
                                            data-nama="{{ $item->nama_layanan }}"
                                            data-deskripsi="{{ $item->deskripsi }}"
                                            data-bs-toggle="tooltip"
                                            title="Lihat deskripsi">

                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>
                                    </div>
                                </td>
                                <td>
                                    @if ($item->aktif === 1)
                                    <span class="badge bg-green-soft text-green">Aktif</span>
                                    @elseif ($item->aktif === 0)
                                    <span class="badge bg-red-soft text-red">Tidak Aktif</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('root.layanan.edit', $item->id) }}" data-bs-toggle="tooltip"
                                            title="Edit layanan"><i data-feather="edit" class="text-warning"></i></a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnToggle"
                                            href="#" data-id="{{ $item->id }}"
                                            data-nama="{{ $item->nama_layanan }}" data-status="{{ $item->aktif }}"
                                            data-bs-toggle="tooltip" title="Aktif/Nonaktif">

                                            <i data-feather="slash"
                                                class="{{ $item->aktif ? 'text-success' : 'text-danger' }}"></i>
                                        </a>
                                    </div>

                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
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
        if (tableLoading) tableLoading.classList.add('d-none');

        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        const bidangSelect = document.getElementById('bidangSelect');
        const filterForm = document.getElementById('filterForm');

        if (filterForm) {
            filterForm.addEventListener('submit', function(e) {
                e.preventDefault();
            });
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
                            <th>Nama Bidang</th>
                            <th>Nama Layanan</th>
                            <th>Waktu Penyelesaian</th>
                            <th>Deskripsi</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Nama Bidang</th>
                            <th>Nama Layanan</th>
                            <th>Waktu Penyelesaian</th>
                            <th>Deskripsi</th>
                            <th>Status</th>
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
        }

        function loadLayanan(bidangId) {
            if (tableLoading) tableLoading.classList.remove('d-none');

            const targetUrl = (!bidangId || bidangId === 'all')
                ? `/root/get-layanan-by-bidang/all`
                : `/root/get-layanan-by-bidang/${bidangId}`;

            fetch(targetUrl)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const namaBidang = item.bidang ? item.bidang.nama_bidang : '-';
                        const namaLayanan = item.nama_layanan || '-';
                        const waktu = item.waktu_penyelesaian || '-';
                        const deskripsi = item.deskripsi || '';

                        const statusBadge = item.aktif === 1
                            ? '<span class="badge bg-green-soft text-green">Aktif</span>'
                            : '<span class="badge bg-red-soft text-red">Tidak Aktif</span>';

                        const slashClass = item.aktif ? 'text-success' : 'text-danger';

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(namaBidang)}</td>
                                <td>${escapeHtml(namaLayanan)}</td>
                                <td>${escapeHtml(waktu)}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDeskripsi"
                                            href="#"
                                            data-nama="${escapeHtml(namaLayanan)}"
                                            data-deskripsi="${escapeHtml(deskripsi)}"
                                            data-bs-toggle="tooltip"
                                            title="Lihat deskripsi">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>
                                    </div>
                                </td>
                                <td>${statusBadge}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="/root/layanan/${item.id}"
                                            data-bs-toggle="tooltip"
                                            title="Edit layanan">
                                            <i data-feather="edit" class="text-warning"></i>
                                        </a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnToggle"
                                            href="#"
                                            data-id="${item.id}"
                                            data-nama="${escapeHtml(namaLayanan)}"
                                            data-status="${item.aktif}"
                                            data-bs-toggle="tooltip"
                                            title="Aktif/Nonaktif">
                                            <i data-feather="slash" class="${slashClass}"></i>
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
                    console.error('Gagal mengambil data layanan:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                });
        }

        // GANTI BIDANG -> LOAD TANPA RELOAD
        bidangSelect?.addEventListener('change', function() {
            loadLayanan(this.value);
        });

        // Modal Aktif/Nonaktif
        const modalAktifEl = document.getElementById('modalAktif');
        const modalAktif = modalAktifEl ? new bootstrap.Modal(modalAktifEl) : null;

        const textModal = document.getElementById('textModal');
        const formToggle = document.getElementById('formToggle');
        const btnConfirmToggle = document.getElementById('btnConfirmToggle');

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnToggle');
            if (!btn || !modalAktif) return;

            e.preventDefault();

            const id = btn.dataset.id;
            const nama = btn.dataset.nama;
            const status = btn.dataset.status;

            let actionText = status == 1 ? 'menonaktifkan' : 'mengaktifkan';

            if (textModal) {
                textModal.innerHTML =
                    `Apakah anda yakin ingin <b>${actionText}</b> layanan <b>${escapeHtml(nama)}</b>?`;
            }

            if (formToggle) {
                formToggle.action = `/root/layanan/${id}/toggle-aktif`;
            }

            modalAktif.show();
        });

        formToggle?.addEventListener('submit', function() {
            if (btnConfirmToggle) {
                btnConfirmToggle.disabled = true;
                btnConfirmToggle.querySelector('.btn-toggle-text')?.classList.add('d-none');
                btnConfirmToggle.querySelector('.btn-toggle-loading')?.classList.remove('d-none');
            }
        });

        // Modal Detail
        const modalDetailEl = document.getElementById('modalDetail');
        const modalDetail = modalDetailEl ? new bootstrap.Modal(modalDetailEl) : null;

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDetail');
            if (!btn || !modalDetail) return;

            e.preventDefault();

            document.getElementById('detailBidang').innerText = btn.dataset.bidang || '-';
            document.getElementById('detailNama').innerText = btn.dataset.nama || '-';
            document.getElementById('detailWaktu').innerText = btn.dataset.waktu || '-';

            let status = btn.dataset.status == 1 ? 'Aktif' : 'Nonaktif';
            document.getElementById('detailStatus').innerText = status;

            modalDetail.show();
        });

        // Modal Deskripsi
        const modalDeskripsiEl = document.getElementById('modalDeskripsi');
        const modalDeskripsi = modalDeskripsiEl ? new bootstrap.Modal(modalDeskripsiEl) : null;

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDeskripsi');
            if (!btn || !modalDeskripsi) return;

            e.preventDefault();

            const nama = btn.dataset.nama || '-';
            const deskripsi = btn.dataset.deskripsi || 'Deskripsi belum tersedia.';

            document.getElementById('deskripsiNamaLayanan').innerText = nama;
            document.getElementById('deskripsiContent').innerText = deskripsi;

            modalDeskripsi.show();
        });

    });
</script>
@endsection