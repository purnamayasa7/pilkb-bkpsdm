@extends('layouts.app')

@section('content')

{{-- HEADER --}}
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon">
                            <i data-feather="activity"></i>
                        </div>
                        Log Aktivitas
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        <a id="btnExportExcel" class="btn btn-sm btn-light text-success {{ (!$tanggal_awal || !$tanggal_akhir) ? 'd-none' : '' }}"
                            href="{{ route('log.exportExcel', [
                                'tanggal_awal' => $tanggal_awal,
                                'tanggal_akhir' => $tanggal_akhir
                            ]) }}">
                            <i class="me-1" data-feather="download"></i>
                            Export Excel
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

            {{-- FILTER --}}
            <form id="filterForm" onsubmit="event.preventDefault()">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        <div class="col-md-5">
                            <label class="form-label">Rentang Tanggal</label>
                            <div class="input-group input-group-joined border-1">
                                <span class="input-group-text"><i data-feather="calendar"></i></span>
                                <input class="form-control ps-0 pointer" id="myCustomDateRange"
                                    value="{{ $tanggal_awal && $tanggal_akhir ? $tanggal_awal . ' - ' . $tanggal_akhir : '' }}"
                                    placeholder="Pilih rentang tanggal log" />
                            </div>
                            <input type="hidden" name="tanggal_awal" id="tanggalAwal" value="{{ $tanggal_awal }}">
                            <input type="hidden" name="tanggal_akhir" id="tanggalAkhir" value="{{ $tanggal_akhir }}">
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
                <div id="tableContainer">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>NIP</th>
                                <th>Nama</th>
                                <th>Module</th>
                                <th>Action</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>Tanggal</th>
                                <th>NIP</th>
                                <th>Nama</th>
                                <th>Module</th>
                                <th>Action</th>
                                <th>Description</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach($logs as $log)
                            <tr>
                                <td>{{ $log->created_at->format('d-m-Y H:i:s') }}</td>
                                <td>{{ $log->user->username ?? '-' }}</td>
                                <td>{{ $log->user->nama ?? '-' }}</td>
                                <td>{{ $log->module }}</td>
                                <td>{{ $log->action }}</td>
                                <td>{{ \Illuminate\Support\Str::limit($log->description, 150) }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</div>

{{-- SCRIPT --}}
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

        const startInput = document.getElementById('tanggalAwal');
        const endInput = document.getElementById('tanggalAkhir');
        const btnExportExcel = document.getElementById('btnExportExcel');

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

        function formatDateTime(isoString) {
            if (!isoString) return '-';
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
        }

        function updateExportLink(startDate, endDate) {
            if (!btnExportExcel) return;
            if (startDate && endDate) {
                btnExportExcel.href = `{{ route('log.exportExcel') }}?tanggal_awal=${startDate}&tanggal_akhir=${endDate}`;
                btnExportExcel.classList.remove('d-none');
            } else {
                btnExportExcel.classList.add('d-none');
            }
        }

        function renderLogTable(rowsHtml = '') {
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
                            <th>Tanggal</th>
                            <th>NIP</th>
                            <th>Nama</th>
                            <th>Module</th>
                            <th>Action</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>Tanggal</th>
                            <th>NIP</th>
                            <th>Nama</th>
                            <th>Module</th>
                            <th>Action</th>
                            <th>Description</th>
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

        function loadLogs(startDate, endDate) {
            if (!startDate || !endDate) {
                renderLogTable('');
                return;
            }

            if (tableLoading) tableLoading.classList.remove('d-none');
            updateExportLink(startDate, endDate);

            fetch(`/log-aktivitas/get-data?tanggal_awal=${startDate}&tanggal_akhir=${endDate}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach(item => {
                        const tgl = formatDateTime(item.created_at);
                        const nip = item.user ? (item.user.username || '-') : '-';
                        const nama = item.user ? (item.user.nama || '-') : '-';
                        const module = item.module || '-';
                        const action = item.action || '-';
                        const desc = item.description || '-';

                        rowsHtml += `
                            <tr>
                                <td>${escapeHtml(tgl)}</td>
                                <td>${escapeHtml(nip)}</td>
                                <td>${escapeHtml(nama)}</td>
                                <td>${escapeHtml(module)}</td>
                                <td>${escapeHtml(action)}</td>
                                <td>${escapeHtml(desc)}</td>
                            </tr>
                        `;
                    });

                    renderLogTable(rowsHtml);
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal mengambil data log:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                });
        }

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

                    loadLogs(sDate, eDate);
                });
            }
        });

    });
</script>

@endsection