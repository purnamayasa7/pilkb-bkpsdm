@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="tool"></i></div>
                        List Perbaikan Usulan - {{ auth()->user()->nama_bidang }}
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
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item" id="btnExportExcel" href="{{ route('adminBidang.perbaikan.exportExcel', request()->query()) }}">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" id="btnExportPdf" href="{{ route('adminBidang.perbaikan.exportPdf', request()->query()) }}" target="_blank">
                                    <i class="me-1" data-feather="file"></i> Export PDF
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

{{-- Modal Lihat Data --}}
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">
                    Detail BTL - No Tiket: <span id="mdNoTiket" class="text-primary fw-bold"></span>
                </h5>
                <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
            </div>

            <div class="modal-body p-0">
                <div class="table-responsive">
                    <table class="table table-bordered table-striped mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 50px;" class="text-center">No</th>
                                <th>Syarat</th>
                                <th>Catatan / Keterangan</th>
                            </tr>
                        </thead>
                        <tbody id="historyTable">
                            <tr>
                                <td colspan="3" class="text-center py-3">Memuat...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal" type="button">
                    <i data-feather="x" class="me-1"></i> Tutup
                </button>
            </div>
        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form id="filterForm" onsubmit="event.preventDefault();" class="mb-3">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">

                        <!-- LAYANAN -->
                        <div class="col-md-5 col-xl-4">
                            <label class="form-label small mb-1">Layanan</label>
                            <select name="layanan" id="layananSelect" class="form-select">
                                <option value="">Semua Layanan</option>

                                @foreach ($layananList as $layanan)
                                <option value="{{ $layanan->id }}"
                                    {{ request('layanan') == $layanan->id ? 'selected' : '' }}>
                                    {{ $layanan->nama_layanan }}
                                </option>
                                @endforeach
                            </select>
                        </div>

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

                <div id="tableContainer" style="min-height: 250px; opacity: 0; transition: opacity 0.25s ease-in-out;">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Diperbaiki</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Unit Kerja</th>
                                <th>Syarat BTL</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>Diperbaiki</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Unit Kerja</th>
                                <th>Syarat BTL</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($data as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>

                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        @if ($item->diperbaiki == 0)
                                        <span class="badge bg-red-soft text-danger border d-inline-flex align-items-center">
                                            Belum
                                        </span>
                                        @else
                                        <span class="badge bg-green-soft text-green d-inline-flex align-items-center">
                                            Sudah
                                        </span>
                                        @endif
                                    </div>
                                </td>

                                <td><span class="fw-semibold text-primary">{{ $item->no_tiket }}</span></td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $item->nama ?? '-' }}
                                    </small>
                                </td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>
                                    {{ $item->nama_ukerja ?? '-' }}
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-danger border d-inline-flex align-items-center fw-bold">
                                            {{ $item->jumlah_btl }}
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#" data-notiket="{{ $item->no_tiket }}" title="Lihat Detail BTL">
                                            <i data-feather="eye" class="text-primary"></i>
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
        const tableContainer = document.getElementById('tableContainer');
        const layananSelect = document.getElementById('layananSelect');
        const btnExportExcel = document.getElementById('btnExportExcel');
        const btnExportPdf = document.getElementById('btnExportPdf');

        // Initial DataTables setup
        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        // Smooth initial fade in
        if (tableContainer) {
            tableContainer.style.opacity = '1';
        }
        if (tableLoading) {
            tableLoading.classList.add('d-none');
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
                            <th>Diperbaiki</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Unit Kerja</th>
                            <th>Syarat BTL</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Diperbaiki</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Unit Kerja</th>
                            <th>Syarat BTL</th>
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

        function loadData() {
            const layananVal = layananSelect ? layananSelect.value : '';

            // Update Export URLs
            if (btnExportExcel) {
                btnExportExcel.href = `{{ route('adminBidang.perbaikan.exportExcel') }}?layanan=${encodeURIComponent(layananVal)}`;
            }
            if (btnExportPdf) {
                btnExportPdf.href = `{{ route('adminBidang.perbaikan.exportPdf') }}?layanan=${encodeURIComponent(layananVal)}`;
            }

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            fetch(`/adminBidang/perbaikan/get-data?layanan=${encodeURIComponent(layananVal)}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const noTiket = item.no_tiket || '';
                        const nip = item.nip || '-';
                        const nama = item.nama ? `<br><small class="text-muted">${escapeHtml(item.nama)}</small>` : '';
                        const layanan = (item.layanan && item.layanan.nama_layanan) ? item.layanan.nama_layanan : '-';
                        const unitKerja = item.nama_ukerja || '-';
                        const jumlahBtl = item.jumlah_btl !== undefined ? item.jumlah_btl : 0;

                        const diperbaikiBadge = item.diperbaiki == 0
                            ? '<span class="badge bg-red-soft text-danger border d-inline-flex align-items-center">Belum</span>'
                            : '<span class="badge bg-green-soft text-green d-inline-flex align-items-center">Sudah</span>';

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        ${diperbaikiBadge}
                                    </div>
                                </td>
                                <td><span class="fw-semibold text-primary">${escapeHtml(noTiket)}</span></td>
                                <td>${escapeHtml(nip)} ${nama}</td>
                                <td>${escapeHtml(layanan)}</td>
                                <td>${escapeHtml(unitKerja)}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-danger border d-inline-flex align-items-center fw-bold">
                                            ${escapeHtml(jumlahBtl)}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#" data-notiket="${escapeHtml(noTiket)}" title="Lihat Detail BTL">
                                            <i data-feather="eye" class="text-primary"></i>
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
                    console.error('Gagal memuat data perbaikan:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        layananSelect?.addEventListener('change', loadData);

        // MODAL DETAIL
        const modalDetailEl = document.getElementById('modalDetail');
        const modalDetail = modalDetailEl ? new bootstrap.Modal(modalDetailEl) : null;

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDetail');
            if (!btn || !modalDetail) return;

            e.preventDefault();

            const noTiket = btn.dataset.notiket;
            document.getElementById('mdNoTiket').innerText = noTiket || '-';
            document.getElementById('historyTable').innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-3 text-muted">
                        <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                        Memuat data...
                    </td>
                </tr>
            `;

            modalDetail.show();

            fetch(`/adminBidang/perbaikan/detail/${encodeURIComponent(noTiket)}`)
                .then(res => res.json())
                .then(data => {
                    let html = '';

                    if (!data || data.length === 0) {
                        html = `<tr><td colspan="3" class="text-center py-3 text-muted">Tidak ada data syarat BTL.</td></tr>`;
                    } else {
                        data.forEach((item, index) => {
                            const syaratText = (item.syarat && item.syarat.syarat) ? item.syarat.syarat : '-';
                            const commentText = item.comment || '-';
                            html += `
                                <tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td>${escapeHtml(syaratText)}</td>
                                    <td><span class="text-danger">${escapeHtml(commentText)}</span></td>
                                </tr>
                            `;
                        });
                    }

                    document.getElementById('historyTable').innerHTML = html;
                    feather.replace();
                })
                .catch(err => {
                    console.error('Gagal mengambil detail BTL:', err);
                    document.getElementById('historyTable').innerHTML = `<tr><td colspan="3" class="text-center text-danger py-3">Gagal memuat data detail</td></tr>`;
                });
        });
    });
</script>
@endsection