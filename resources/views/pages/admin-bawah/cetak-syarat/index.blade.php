@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="file-text"></i></div>
                        Cetak Syarat
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success {{ $layananId ? '' : 'disabled' }}"
                            id="btnExportPdf"
                            href="{{ $layananId ? route('adminBawah.cetakSyarat.export', ['bidang' => $bidangId, 'layanan' => $layananId]) : 'javascript:void(0)' }}"
                            target="_blank"
                            {!! !$layananId ? 'style="pointer-events: none; opacity: 0.6;" title="Pilih layanan terlebih dahulu"' : '' !!}>
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
            <form id="filterForm" onsubmit="event.preventDefault()" class="mb-3">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row g-3 align-items-end">

                        <!-- BIDANG -->
                        <div class="col-xl-4 col-md-6">
                            <label class="form-label small mb-1">Bidang</label>
                            <select name="bidang" id="bidangSelect" class="form-select">
                                <option value="" disabled {{ !$bidangId ? 'selected' : '' }}>Pilih Bidang</option>
                                @foreach ($bidang as $b)
                                    <option value="{{ $b->id }}" {{ $bidangId == $b->id ? 'selected' : '' }}>
                                        {{ $b->nama_bidang }}
                                    </option>
                                @endforeach
                            </select>
                        </div>

                        <!-- LAYANAN -->
                        <div class="col-xl-4 col-md-6">
                            <label class="form-label small mb-1">Layanan</label>
                            <select name="layanan" id="layananSelect" class="form-select">
                                <option value="" disabled {{ !$layananId ? 'selected' : '' }}>Pilih Layanan</option>
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
                    @if ($layananId && $syarat->count())
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Layanan</th>
                                <th>Syarat</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>Nama Layanan</th>
                                <th>Syarat</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($syarat as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                    <td>{{ $item->syarat }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @else
                    <div class="text-center py-5 text-muted">
                        <i data-feather="file-text" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                        <h5 class="fw-bold text-dark">Layanan Belum Dipilih</h5>
                        <p class="mb-0 text-muted">Silakan pilih Bidang dan Layanan pada filter di atas untuk memuat daftar syarat layanan.</p>
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
        const btnExportPdf = document.getElementById('btnExportPdf');

        // Initial Datatable if server rendered
        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        let selectedLayanan = "{{ $layananId ?? request('layanan') ?? '' }}";

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

        function updateExportLink(bidangId, layananId) {
            if (!btnExportPdf) return;
            if (!bidangId || !layananId) {
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
            params.append('bidang', bidangId);
            params.append('layanan', layananId);

            btnExportPdf.href = `{{ route('adminBawah.cetakSyarat.export') }}?${params.toString()}`;
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
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Syarat</th>
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
            const bidangId = bidangSelect ? bidangSelect.value : '';

            if (!layananId) {
                if (window.dataTable) {
                    try { window.dataTable.destroy(); } catch (e) {}
                    window.dataTable = null;
                }
                if (tableContainer) {
                    tableContainer.innerHTML = `
                        <div class="text-center py-5 text-muted">
                            <i data-feather="file-text" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                            <h5 class="fw-bold text-dark">Layanan Belum Dipilih</h5>
                            <p class="mb-0 text-muted">Silakan pilih Bidang dan Layanan pada filter di atas untuk memuat daftar syarat layanan.</p>
                        </div>
                    `;
                    feather.replace();
                    tableContainer.style.opacity = '1';
                }
                updateExportLink(bidangId, '');
                return;
            }

            updateExportLink(bidangId, layananId);

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            fetch(`/adminBawah/get-syarat-by-layanan/${layananId}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const namaLayanan = (item.layanan && item.layanan.nama_layanan) ? item.layanan.nama_layanan : '-';
                        const syaratText = item.syarat || '-';

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(namaLayanan)}</td>
                                <td>${escapeHtml(syaratText)}</td>
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

        function loadLayanan(bidangId, autoLoadFirst = false) {
            if (!layananSelect) return;

            layananSelect.innerHTML = '<option selected disabled>Loading...</option>';
            layananSelect.disabled = true;

            fetch(`/adminBawah/get-layanan-syarat/${bidangId}`)
                .then(response => response.json())
                .then(data => {
                    layananSelect.innerHTML = '<option value="" disabled selected>Pilih Layanan</option>';

                    if (data.length === 0) {
                        const emptyOption = document.createElement('option');
                        emptyOption.disabled = true;
                        emptyOption.textContent = 'Tidak ada layanan';
                        layananSelect.appendChild(emptyOption);
                    } else {
                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = item.id;
                            option.textContent = item.nama_layanan;

                            if (item.id == selectedLayanan) {
                                option.selected = true;
                            }
                            layananSelect.appendChild(option);
                        });
                    }
                    layananSelect.disabled = false;

                    if (selectedLayanan) {
                        loadSyarat(selectedLayanan);
                    }
                })
                .catch(error => {
                    console.error('Gagal load layanan:', error);
                    layananSelect.innerHTML = '<option selected disabled>Gagal load data</option>';
                    layananSelect.disabled = false;
                });
        }

        // GANTI BIDANG
        bidangSelect?.addEventListener('change', function() {
            selectedLayanan = '';
            loadLayanan(this.value);
            loadSyarat('');
        });

        // GANTI LAYANAN
        layananSelect?.addEventListener('change', function() {
            selectedLayanan = this.value;
            loadSyarat(this.value);
        });

        // LOAD PERTAMA
        if (bidangSelect?.value) {
            loadLayanan(bidangSelect.value);
        }

    });
</script>
@endsection
