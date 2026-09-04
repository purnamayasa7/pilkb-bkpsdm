@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon">
                            <i data-feather="bar-chart-2"></i>
                        </div>
                        Laporan Usulan Layanan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success {{ request('tanggal_awal') && request('tanggal_akhir') ? '' : 'disabled' }}"
                            id="btnExportPdf"
                            href="{{ request('tanggal_awal') && request('tanggal_akhir') ? route('adminBawah.laporan.exportPdf', request()->query()) : 'javascript:void(0)' }}"
                            target="_blank"
                            {!! !request('tanggal_awal') || !request('tanggal_akhir') ? 'style="pointer-events: none; opacity: 0.6;" title="Pilih rentang tanggal terlebih dahulu"' : '' !!}>
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
            <form id="laporanFilterForm" onsubmit="event.preventDefault()">
                <div class="bg-white p-3 rounded-3 border mb-4">
                    <div class="row g-3 align-items-end">

                        <!-- BIDANG -->
                        <div class="col-xl-4 col-md-6">
                            <label class="small mb-1">
                                Bidang
                            </label>

                            <select name="bidang" id="bidangSelect" class="form-select">
                                <option value="all">
                                    Semua Bidang
                                </option>
                                @foreach ($bidangList as $bidang)
                                <option value="{{ $bidang->id }}"
                                    {{ request('bidang') == $bidang->id ? 'selected' : '' }}>
                                    {{ $bidang->nama_bidang }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <!-- LAYANAN -->
                        <div class="col-xl-4 col-md-6">
                            <label class="small mb-1">
                                Layanan
                            </label>

                            <select name="layanan" id="layananSelect" class="form-select">
                                <option value="all">
                                    Semua Layanan
                                </option>
                                @foreach ($layananList as $layanan)
                                <option value="{{ $layanan->id }}"
                                    {{ request('layanan') == $layanan->id ? 'selected' : '' }}>
                                    {{ $layanan->nama_layanan }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <!-- RENTANG TANGGAL -->
                        <div class="col-xl-4 col-md-12">
                            <label class="small mb-1">
                                Rentang Tanggal
                            </label>
                            <div class="input-group input-group-joined border-1">
                                <span class="input-group-text"><i data-feather="calendar"></i></span>
                                <input class="form-control ps-0 pointer" id="myCustomDateRange"
                                    value="{{ request('tanggal_awal') && request('tanggal_akhir') ? request('tanggal_awal') . ' - ' . request('tanggal_akhir') : '' }}"
                                    placeholder="Pilih rentang tanggal laporan" />
                            </div>
                            <input type="hidden" name="tanggal_awal" id="tanggalAwal" value="{{ request('tanggal_awal') }}">
                            <input type="hidden" name="tanggal_akhir" id="tanggalAkhir" value="{{ request('tanggal_akhir') }}">
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
                    @if (request('tanggal_awal') && request('tanggal_akhir') && count($data) > 0)
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Nama Layanan</th>
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
                                <th>Nama Penerima</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Nama Layanan</th>
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
                                <th>Nama Penerima</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($data as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td><span class="fw-semibold text-primary">{{ $item->no_tiket }}</span></td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $item->nama ?? '-' }}
                                    </small>
                                </td>
                                <td>
                                    {{ $item->nama_ukerja ?? '-' }}
                                </td>
                                <td>
                                    {{ $item->layanan->nama_layanan ?? '-' }}
                                </td>
                                <td>
                                    {{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y H:i') }}
                                </td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        {{ $item->tahapTerakhir->statusRel->status ?? '-' }}
                                    </span>
                                </td>
                                <td>{{ $item->nama_penerima ?? '-' }}</td>
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
        const bidangSelect = document.getElementById('bidangSelect');
        const layananSelect = document.getElementById('layananSelect');
        const startInput = document.getElementById('tanggalAwal');
        const endInput = document.getElementById('tanggalAkhir');
        const btnExportPdf = document.getElementById('btnExportPdf');

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

        function formatDateTime(isoString) {
            if (!isoString) return '-';
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const day = String(date.getDate()).padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day} ${month} ${year} ${hours}:${minutes}`;
        }

        function updateExportLink(bidang, layanan, tglAwal, tglAkhir) {
            if (!btnExportPdf) return;
            if (!tglAwal || !tglAkhir) {
                btnExportPdf.classList.add('disabled');
                btnExportPdf.style.pointerEvents = 'none';
                btnExportPdf.style.opacity = '0.6';
                btnExportPdf.href = 'javascript:void(0)';
                return;
            }

            btnExportPdf.classList.remove('disabled');
            btnExportPdf.style.pointerEvents = '';
            btnExportPdf.style.opacity = '';

            const params = new URLSearchParams();
            if (bidang && bidang !== 'all') params.append('bidang', bidang);
            if (layanan && layanan !== 'all') params.append('layanan', layanan);
            params.append('tanggal_awal', tglAwal);
            params.append('tanggal_akhir', tglAkhir);

            btnExportPdf.href = `{{ route('adminBawah.laporan.exportPdf') }}?${params.toString()}`;
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
                            <th>Unit Kerja</th>
                            <th>Nama Layanan</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Nama Penerima</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Nama Layanan</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Nama Penerima</th>
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
            const bidang = bidangSelect ? bidangSelect.value : 'all';
            const layanan = layananSelect ? layananSelect.value : 'all';
            const tglAwal = startInput ? startInput.value : '';
            const tglAkhir = endInput ? endInput.value : '';

            if (!tglAwal || !tglAkhir) {
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
                updateExportLink(bidang, layanan, '', '');
                return;
            }

            updateExportLink(bidang, layanan, tglAwal, tglAkhir);

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            const params = new URLSearchParams();
            if (bidang && bidang !== 'all') params.append('bidang', bidang);
            if (layanan && layanan !== 'all') params.append('layanan', layanan);
            params.append('tanggal_awal', tglAwal);
            params.append('tanggal_akhir', tglAkhir);

            fetch(`/adminBawah/laporan/get-data?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const noTiket = item.no_tiket || '-';
                        const nip = item.nip || '-';
                        const nama = item.nama || '-';
                        const ukerja = item.nama_ukerja || '-';
                        const namaLayanan = item.layanan ? item.layanan.nama_layanan : '-';
                        const tgl = formatDateTime(item.tanggal);
                        const status = (item.tahap_terakhir && item.tahap_terakhir.status_rel)
                            ? item.tahap_terakhir.status_rel.status
                            : '-';
                        const penerima = item.nama_penerima || '-';

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td><span class="fw-semibold text-primary">${escapeHtml(noTiket)}</span></td>
                                <td>
                                    ${escapeHtml(nip)} <br>
                                    <small class="text-muted">${escapeHtml(nama)}</small>
                                </td>
                                <td>${escapeHtml(ukerja)}</td>
                                <td>${escapeHtml(namaLayanan)}</td>
                                <td>${escapeHtml(tgl)}</td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        ${escapeHtml(status)}
                                    </span>
                                </td>
                                <td>${escapeHtml(penerima)}</td>
                            </tr>
                        `;
                    });

                    renderTable(rowsHtml);
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal mengambil data laporan:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        // GANTI BIDANG
        bidangSelect?.addEventListener('change', function() {
            const bidangId = this.value;
            if (layananSelect) {
                layananSelect.innerHTML = '<option value="all">Semua Layanan</option>';
            }

            fetch(`{{ route('adminBawah.laporan.getLayananByBidang') }}?bidang_id=${bidangId}`)
                .then(response => response.json())
                .then(data => {
                    if (layananSelect) {
                        data.forEach(item => {
                            layananSelect.innerHTML += `
                                <option value="${item.id}">
                                    ${item.nama_layanan}
                                </option>
                            `;
                        });
                    }
                    if (startInput?.value && endInput?.value) {
                        loadLaporan();
                    }
                })
                .catch(() => {
                    if (startInput?.value && endInput?.value) {
                        loadLaporan();
                    }
                });
        });

        // GANTI LAYANAN
        layananSelect?.addEventListener('change', function() {
            if (startInput?.value && endInput?.value) {
                loadLaporan();
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

                    if (startInput) startInput.value = sDate;
                    if (endInput) endInput.value = eDate;

                    loadLaporan();
                });
            }
        });

    });
</script>
@endsection