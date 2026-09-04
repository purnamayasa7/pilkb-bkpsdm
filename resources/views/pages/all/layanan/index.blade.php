@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="briefcase"></i></div>
                        List Permintaan Layanan
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
                                <a id="btnExportExcel" class="dropdown-item" href="{{ route('root.tiket.exportExcel', request()->query()) }}">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a id="btnExportPdf" class="dropdown-item" href="{{ route('root.tiket.exportPdf', request()->query()) }}" target="_blank">
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
<!-- <div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Riwayat Permintaan</h5>
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
</div> -->

<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">
                    No Tiket: <span id="mdNoTiket"></span>
                </h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
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
                                            <td colspan="3" class="text-center">Loading...</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="mt-3 d-flex justify-content-end" id="historyPagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('root.tiket') }}" id="filterForm">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        <!-- BIDANG -->
                        <div class="col-md-4">
                            <label class="form-label">Bidang</label>
                            <select name="bidang" id="bidangSelect" class="form-select">
                                <option value="">-- Pilih Bidang --</option>
                                @foreach ($bidang as $b)
                                <option value="{{ $b->id }}" {{ $bidangId == $b->id ? 'selected' : '' }}>
                                    {{ $b->nama_bidang }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <!-- DATE RANGE -->
                        <div class="col-md-4">
                            <label class="form-label">Rentang Tanggal</label>
                            <div class="input-group input-group-joined border-1" style="width: 16.5rem">
                                <span class="input-group-text"><i data-feather="calendar"></i></span>
                                <input class="form-control ps-0 pointer" id="myCustomDateRange"
                                    value="{{ $start && $end ? $start . ' - ' . $end : '' }}"
                                    placeholder="Pilih rentang tanggal" />
                            </div>
                        </div>
                    </div>
                    <!-- HIDDEN INPUT -->
                    <input type="hidden" name="start_date" id="startDate" value="{{ $start }}">
                    <input type="hidden" name="end_date" id="endDate" value="{{ $end }}">
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
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Layanan</th>
                                <th>Tanggal</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Layanan</th>
                                <th>Tanggal</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($tiket as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $item->no_tiket }}</td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $item->nama ?? '-' }}
                                    </small>
                                </td>
                                <td>
                                    {{ $item->nama_ukerja ?? '-' }}
                                </td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>{{ $item->tanggal }}</td>
                                <td>{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                                <td>
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                        href="#"
                                        data-notiket="{{ $item->no_tiket }}"
                                        title="Lihat Riwayat">

                                        <i data-feather="eye" class="text-primary"></i>
                                    </a>
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

        const filterForm = document.getElementById('filterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', function(e) {
                e.preventDefault();
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('modalDetail'));
        const baseUrl = "{{ url('root/tiket/history') }}";

        let historyData = [];
        let currentPage = 1;
        const perPage = 5;

        function renderHistoryTable() {
            let start = (currentPage - 1) * perPage;
            let end = start + perPage;
            let pageData = historyData.slice(start, end);
            let html = '';

            if (pageData.length === 0) {
                html = `
                    <tr>
                        <td colspan="3" class="text-center">Tidak ada data</td>
                    </tr>`;
            } else {
                pageData.forEach((item, index) => {
                    html += `
                        <tr>
                            <td>Tahap ${start + index + 1}</td>
                            <td>${item.tanggal}</td>
                            <td>${item.status_rel ? item.status_rel.status : '-'}</td>
                        </tr>`;
                });
            }

            document.getElementById('historyTable').innerHTML = html;
            renderHistoryPagination();
        }

        function renderHistoryPagination() {
            let totalPage = Math.ceil(historyData.length / perPage);
            let html = '';

            if (totalPage > 1) {
                if (currentPage > 1) {
                    html += `
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="prevPage()">
                            Prev
                        </button>`;
                }

                html += `
                    <span class="me-2">
                        Page ${currentPage} / ${totalPage}
                    </span>`;

                if (currentPage < totalPage) {
                    html += `
                        <button class="btn btn-sm btn-outline-primary" onclick="nextPage()">
                            Next
                        </button>`;
                }
            }

            document.getElementById('historyPagination').innerHTML = html;
        }

        window.nextPage = function() {
            currentPage++;
            renderHistoryTable();
        };

        window.prevPage = function() {
            currentPage--;
            renderHistoryTable();
        };

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

        function updateExportLinks(bidangId, startDate, endDate) {
            const btnExcel = document.getElementById('btnExportExcel');
            const btnPdf = document.getElementById('btnExportPdf');
            const params = new URLSearchParams();
            if (bidangId) params.append('bidang', bidangId);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            const queryString = params.toString() ? `?${params.toString()}` : '';

            if (btnExcel) btnExcel.href = `{{ route('root.tiket.exportExcel') }}${queryString}`;
            if (btnPdf) btnPdf.href = `{{ route('root.tiket.exportPdf') }}${queryString}`;
        }

        function renderTiketTable(rowsHtml = '') {
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
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
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

        function loadTiket(bidangId, startDate, endDate) {
            if (!bidangId || !startDate || !endDate) {
                renderTiketTable('');
                return;
            }

            if (tableLoading) tableLoading.classList.remove('d-none');
            updateExportLinks(bidangId, startDate, endDate);

            fetch(`/root/tiket/get-data?bidang=${bidangId}&start_date=${startDate}&end_date=${endDate}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const nama = item.nama ? item.nama : '-';
                        const ukerja = item.nama_ukerja || '-';
                        const layanan = item.layanan ? item.layanan.nama_layanan : '-';
                        const tgl = item.tanggal || '-';
                        const statusText = (item.tahap_terakhir && item.tahap_terakhir.status_rel)
                            ? item.tahap_terakhir.status_rel.status
                            : '-';

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(item.no_tiket)}</td>
                                <td>
                                    ${escapeHtml(item.nip)} <br>
                                    <small class="text-muted">
                                        ${escapeHtml(nama)}
                                    </small>
                                </td>
                                <td>${escapeHtml(ukerja)}</td>
                                <td>${escapeHtml(layanan)}</td>
                                <td>${escapeHtml(tgl)}</td>
                                <td>${escapeHtml(statusText)}</td>
                                <td>
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                        href="#"
                                        data-notiket="${escapeHtml(item.no_tiket)}"
                                        title="Lihat Riwayat">
                                        <i data-feather="eye" class="text-primary"></i>
                                    </a>
                                </td>
                            </tr>
                        `;
                    });

                    renderTiketTable(rowsHtml);
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal mengambil data tiket:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                });
        }

        // Event Modal Detail Tiket History
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDetail');
            if (!btn) return;

            e.preventDefault();
            const noTiket = btn.dataset.notiket;

            document.getElementById('mdNoTiket').innerText = noTiket;
            document.getElementById('historyTable').innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">Loading...</td>
                </tr>`;

            fetch(`${baseUrl}/${noTiket}`)
                .then(res => res.json())
                .then(data => {
                    historyData = data;
                    currentPage = 1;
                    renderHistoryTable();
                    modal.show();
                })
                .catch(() => {
                    document.getElementById('historyTable').innerHTML = `
                        <tr>
                            <td colspan="3" class="text-danger text-center">Gagal load data</td>
                        </tr>`;
                });
        });

        const bidangSelect = document.getElementById('bidangSelect');
        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');

        // GANTI BIDANG
        bidangSelect?.addEventListener('change', function() {
            if (this.value && startInput.value && endInput.value) {
                loadTiket(this.value, startInput.value, endInput.value);
            } else {
                updateExportLinks(this.value, startInput.value, endInput.value);
                renderTiketTable('');
            }
        });

        // DATE RANGE PICKER
        new Litepicker({
            element: document.getElementById('myCustomDateRange'),
            singleMode: false,
            format: 'YYYY-MM-DD',
            autoApply: true,
            setup: (picker) => {
                picker.on('selected', (startDate, endDate) => {
                    if (!startDate || !endDate) return;

                    const sDate = startDate.format('YYYY-MM-DD');
                    const eDate = endDate.format('YYYY-MM-DD');

                    startInput.value = sDate;
                    endInput.value = eDate;

                    if (!bidangSelect.value) {
                        alert('Pilih bidang terlebih dahulu');
                        return;
                    }

                    loadTiket(bidangSelect.value, sDate, eDate);
                });
            }
        });

    });
</script>
@endsection