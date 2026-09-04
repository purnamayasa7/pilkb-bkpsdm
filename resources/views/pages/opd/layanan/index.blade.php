@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="clipboard"></i></div>
                        List Proses Pengajuan
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
                                <a class="dropdown-item" id="btnExportExcel"
                                    href="{{ route('adminOpd.tiket.exportExcel', ['month' => $month, 'year' => $year]) }}">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" id="btnExportPdf"
                                    href="{{ route('adminOpd.tiket.exportPdf', ['month' => $month, 'year' => $year]) }}" target="_blank">
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
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">
                    No Tiket: <span id="mdNoTiket" class="text-primary fw-bold"></span>
                </h5>
                <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
            </div>

            <div class="modal-body">
                <div class="card mb-4">
                    <div class="card-header bg-gradient-primary-to-secondary text-white">
                        Riwayat Proses Layanan
                    </div>
                    <div class="card-body">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <th>Tahap</th>
                                            <th>Tanggal</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="historyTable">
                                        <tr>
                                            <td colspan="3" class="text-center py-3">Memuat...</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="mt-3 d-flex justify-content-end" id="historyPagination"></div>
                            </div>
                        </div>
                    </div>
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
            <form id="filterForm" onsubmit="event.preventDefault()">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        {{-- Bulan --}}
                        <div class="col-md-4">
                            <label class="form-label small mb-1">Bulan</label>
                            <select name="month" id="monthSelect" class="form-select">
                                @for ($m = 1; $m <= 12; $m++)
                                    <option value="{{ $m }}" {{ $month == $m ? 'selected' : '' }}>
                                    {{ \Carbon\Carbon::create()->month($m)->translatedFormat('F') }}
                                    </option>
                                @endfor
                            </select>
                        </div>

                        {{-- Tahun --}}
                        <div class="col-md-4">
                            <label class="form-label small mb-1">Tahun</label>
                            <select name="year" id="yearSelect" class="form-select">
                                @for ($y = date('Y') - 10; $y <= date('Y'); $y++)
                                    <option value="{{ $y }}" {{ $year == $y ? 'selected' : '' }}>
                                    {{ $y }}
                                    </option>
                                @endfor
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
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Tanggal</th>
                                <th>Status Terakhir</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Tanggal</th>
                                <th>Status Terakhir</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($tiket as $item)
                            <tr>
                                <td><span class="fw-semibold text-primary">{{ $item->no_tiket }}</span></td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $item->nama ?? '-' }}
                                    </small>
                                </td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>{{ $item->tanggal }}</td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        {{ optional($item->tahapTerakhir->statusRel)->status ?? '-' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#"
                                            data-notiket="{{ $item->no_tiket }}"
                                            title="Lihat Riwayat">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>

                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('tiket.cetak', $item->no_tiket) }}" data-bs-toggle="tooltip"
                                            title="Cetak Tiket"><i data-feather="printer" class="text-warning"></i></a>
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
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');
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

        function updateExportLinks(month, year) {
            if (btnExportExcel) {
                btnExportExcel.href = `{{ route('adminOpd.tiket.exportExcel') }}?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`;
            }
            if (btnExportPdf) {
                btnExportPdf.href = `{{ route('adminOpd.tiket.exportPdf') }}?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`;
            }
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
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status Terakhir</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status Terakhir</th>
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
            const month = monthSelect ? monthSelect.value : '';
            const year = yearSelect ? yearSelect.value : '';

            updateExportLinks(month, year);

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            fetch(`/adminOpd/tiket/get-proses-data?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach(item => {
                        const noTiket = item.no_tiket || '';
                        const nip = item.nip || '-';
                        const nama = item.nama ? `<br><small class="text-muted">${escapeHtml(item.nama)}</small>` : '';
                        const layanan = (item.layanan && item.layanan.nama_layanan) ? item.layanan.nama_layanan : '-';
                        const tanggal = item.tanggal || '-';
                        const statusTerakhir = (item.tahap_terakhir && item.tahap_terakhir.status_rel && item.tahap_terakhir.status_rel.status)
                            ? item.tahap_terakhir.status_rel.status
                            : '-';

                        const cetakUrl = `{{ url('tiket/cetak') }}/${encodeURIComponent(noTiket)}`;

                        rowsHtml += `
                            <tr>
                                <td><span class="fw-semibold text-primary">${escapeHtml(noTiket)}</span></td>
                                <td>${escapeHtml(nip)} ${nama}</td>
                                <td>${escapeHtml(layanan)}</td>
                                <td>${escapeHtml(tanggal)}</td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        ${escapeHtml(statusTerakhir)}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#"
                                            data-notiket="${escapeHtml(noTiket)}"
                                            title="Lihat Riwayat">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>

                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="${cetakUrl}" data-bs-toggle="tooltip"
                                            title="Cetak Tiket"><i data-feather="printer" class="text-warning"></i></a>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });

                    renderTable(rowsHtml);
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal memuat data tiket:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        monthSelect?.addEventListener('change', loadData);
        yearSelect?.addEventListener('change', loadData);

        // MODAL RIWAYAT
        const modalEl = document.getElementById('modalDetail');
        const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
        const baseUrl = "{{ url('adminOpd/tiket/history') }}";

        let historyData = [];
        let currentPage = 1;
        const perPage = 5;

        function renderHistoryTable() {
            let start = (currentPage - 1) * perPage;
            let end = start + perPage;

            let pageData = historyData.slice(start, end);
            let html = '';

            if (pageData.length === 0) {
                html = `<tr><td colspan="3" class="text-center py-3 text-muted">Tidak ada data riwayat</td></tr>`;
            } else {
                pageData.forEach((item, index) => {
                    const statusName = (item.status_rel && item.status_rel.status) ? item.status_rel.status : '-';
                    html += `
                        <tr>
                            <td>Tahap ${start + index + 1}</td>
                            <td>${escapeHtml(item.tanggal || '-')}</td>
                            <td>${escapeHtml(statusName)}</td>
                        </tr>
                    `;
                });
            }

            const historyTable = document.getElementById('historyTable');
            if (historyTable) historyTable.innerHTML = html;

            renderPagination();
        }

        function renderPagination() {
            let totalPage = Math.ceil(historyData.length / perPage);
            let html = '';

            if (totalPage > 1) {
                if (currentPage > 1) {
                    html += `<button class="btn btn-sm btn-outline-primary me-1" type="button" onclick="prevPage()">Prev</button>`;
                }

                html += `<span class="me-2 align-self-center small">Page ${currentPage} / ${totalPage}</span>`;

                if (currentPage < totalPage) {
                    html += `<button class="btn btn-sm btn-outline-primary" type="button" onclick="nextPage()">Next</button>`;
                }
            }

            const historyPagination = document.getElementById('historyPagination');
            if (historyPagination) historyPagination.innerHTML = html;
        }

        window.nextPage = function() {
            currentPage++;
            renderHistoryTable();
        };

        window.prevPage = function() {
            currentPage--;
            renderHistoryTable();
        };

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDetail');
            if (!btn || !modal) return;

            e.preventDefault();

            const noTiket = btn.dataset.notiket;
            document.getElementById('mdNoTiket').innerText = noTiket || '-';
            document.getElementById('historyTable').innerHTML = `
                <tr><td colspan="3" class="text-center py-3 text-muted">
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Memuat...
                </td></tr>
            `;

            modal.show();

            fetch(`${baseUrl}/${encodeURIComponent(noTiket)}`)
                .then(res => res.json())
                .then(data => {
                    historyData = data || [];
                    currentPage = 1;
                    renderHistoryTable();
                })
                .catch(() => {
                    document.getElementById('historyTable').innerHTML =
                        `<tr><td colspan="3" class="text-danger text-center py-3">Gagal memuat data</td></tr>`;
                });
        });
    });
</script>
@endsection