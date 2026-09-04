@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="bar-chart-2"></i></div>
                        Laporan Permintaan Layanan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success {{ $start && $end ? '' : 'disabled' }}"
                            id="btnExportPdf"
                            href="{{ $start && $end ? route('adminOpd.laporan.exportPdfOpd', ['start_date' => $start, 'end_date' => $end]) : 'javascript:void(0)' }}"
                            target="_blank"
                            {!! !$start || !$end ? 'style="pointer-events: none; opacity: 0.6;" title="Pilih rentang tanggal terlebih dahulu"' : '' !!}>
                            <i class="me-1" data-feather="download"></i>
                            Export PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form id="filterForm" onsubmit="event.preventDefault()">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        <!-- DATE RANGE -->
                        <div class="col-md-5 col-xl-4">
                            <label class="form-label small mb-1">Pilih Rentang Tanggal</label>
                            <div class="input-group input-group-joined border-1">
                                <span class="input-group-text"><i data-feather="calendar"></i></span>
                                <input class="form-control ps-0 pointer" id="myCustomDateRange"
                                    value="{{ $start && $end ? $start . ' - ' . $end : '' }}"
                                    placeholder="Pilih rentang tanggal laporan" autocomplete="off" />
                            </div>
                        </div>
                    </div>
                    <!-- HIDDEN INPUT -->
                    <input type="hidden" name="start_date" id="startDate" value="{{ $start }}">
                    <input type="hidden" name="end_date" id="endDate" value="{{ $end }}">
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
                    @if ($start && $end && count($tiket) > 0)
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Tanggal</th>
                                <th>Status Terakhir</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Tanggal</th>
                                <th>Status Terakhir</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($tiket as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td><span class="fw-semibold text-primary">{{ $item->no_tiket }}</span></td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $item->nama ?? '-' }}
                                    </small>
                                </td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>{{ $item->tanggal ? \Carbon\Carbon::parse($item->tanggal)->format('d-m-Y') : '-' }}</td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        {{ $item->tahapTerakhir->statusRel->status ?? '-' }}
                                    </span>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @else
                    <div class="text-center py-5 text-muted">
                        <i data-feather="calendar" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                        <h5 class="fw-bold text-dark">Rentang Tanggal Belum Dipilih</h5>
                        <p class="mb-0 text-muted">Silakan pilih rentang tanggal pada filter di atas untuk memuat data laporan.</p>
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
        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');
        const btnExportPdf = document.getElementById('btnExportPdf');
        const dateRangeEl = document.getElementById('myCustomDateRange');

        // Initial DataTables setup if server rendered
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

        function formatDate(dateString) {
            if (!dateString) return '-';
            const parts = dateString.split(' ')[0].split('-');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateString;
        }

        function updateExportLink(sDate, eDate) {
            if (!btnExportPdf) return;
            if (!sDate || !eDate) {
                btnExportPdf.classList.add('disabled');
                btnExportPdf.style.pointerEvents = 'none';
                btnExportPdf.style.opacity = '0.6';
                btnExportPdf.href = 'javascript:void(0)';
                return;
            }

            btnExportPdf.classList.remove('disabled');
            btnExportPdf.style.pointerEvents = '';
            btnExportPdf.style.opacity = '';
            btnExportPdf.href = `{{ route('adminOpd.laporan.exportPdfOpd') }}?start_date=${encodeURIComponent(sDate)}&end_date=${encodeURIComponent(eDate)}`;
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
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status Terakhir</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status Terakhir</th>
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

        function loadLaporan() {
            const sDate = startInput ? startInput.value : '';
            const eDate = endInput ? endInput.value : '';

            if (!sDate || !eDate) {
                if (window.dataTable) {
                    try { window.dataTable.destroy(); } catch (e) {}
                    window.dataTable = null;
                }
                if (tableContainer) {
                    tableContainer.innerHTML = `
                        <div class="text-center py-5 text-muted">
                            <i data-feather="calendar" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                            <h5 class="fw-bold text-dark">Rentang Tanggal Belum Dipilih</h5>
                            <p class="mb-0 text-muted">Silakan pilih rentang tanggal pada filter di atas untuk memuat data laporan.</p>
                        </div>
                    `;
                    feather.replace();
                    tableContainer.style.opacity = '1';
                }
                updateExportLink('', '');
                return;
            }

            updateExportLink(sDate, eDate);

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            fetch(`{{ route('adminOpd.laporan.getData') }}?start_date=${encodeURIComponent(sDate)}&end_date=${encodeURIComponent(eDate)}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const noTiket = item.no_tiket || '-';
                        const nip = item.nip || '-';
                        const nama = item.nama ? `<br><small class="text-muted">${escapeHtml(item.nama)}</small>` : '';
                        const namaLayanan = item.nama_layanan || '-';
                        const tgl = item.tanggal || formatDate(item.tanggal);
                        const status = item.status || '-';

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td><span class="fw-semibold text-primary">${escapeHtml(noTiket)}</span></td>
                                <td>${escapeHtml(nip)} ${nama}</td>
                                <td>${escapeHtml(namaLayanan)}</td>
                                <td>${escapeHtml(tgl)}</td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        ${escapeHtml(status)}
                                    </span>
                                </td>
                            </tr>
                        `;
                    });

                    renderTable(rowsHtml);
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal memuat data laporan:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        if (dateRangeEl) {
            new Litepicker({
                element: dateRangeEl,
                singleMode: false,
                format: 'YYYY-MM-DD',
                autoApply: true,
                setup: (picker) => {
                    picker.on('selected', (startDate, endDate) => {
                        if (!startDate || !endDate) return;

                        const sDate = startDate.format('YYYY-MM-DD');
                        const eDate = endDate.format('YYYY-MM-DD');

                        if (startInput) startInput.value = sDate;
                        if (endInput) endInput.value = eDate;

                        loadLaporan();
                    });
                }
            });
        }
    });
</script>
@endsection