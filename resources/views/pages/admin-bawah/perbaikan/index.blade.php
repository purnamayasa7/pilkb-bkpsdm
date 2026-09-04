@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="edit"></i></div>
                        List Perbaikan Usulan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success"
                            id="btnExportPdf"
                            href="{{ route('adminBawah.perbaikan.exportPdf', request()->query()) }}"
                            target="_blank">
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
                    <div class="row align-items-end">
                        <!-- LAYANAN -->
                        <div class="col-xl-4 col-md-6">
                            <label class="form-label small mb-1">Layanan</label>
                            <select name="layanan" id="layananSelect" class="form-select">
                                <option value="all">Semua Layanan</option>
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

                <div id="tableContainer" style="opacity: 0; transition: opacity 0.25s ease-in-out; min-height: 250px;">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Layanan</th>
                                <th>Syarat BTL</th>
                                <th>Jumlah Tahapan</th>
                                <th>Proses</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Layanan</th>
                                <th>Syarat BTL</th>
                                <th>Jumlah Tahapan</th>
                                <th>Proses</th>
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
                                <td>{{ $item->nama_ukerja ?? '-' }}</td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-danger border d-inline-flex align-items-center">
                                            {{ $item->jumlah_btl }}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-info border d-inline-flex align-items-center">
                                            {{ $item->jumlah_tahap }} Tahapan
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('adminBawah.perbaikan.review', $item->no_tiket) }}"
                                            title="Review">
                                            <i data-feather="edit" class="text-warning"></i>
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
        const btnExportPdf = document.getElementById('btnExportPdf');

        // Initial Datatable
        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        // Tampilkan tabel setelah siap dan sembunyikan loading
        if (tableContainer) tableContainer.style.opacity = '1';
        if (tableLoading) tableLoading.classList.add('d-none');

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

        function updateExportLink(layanan) {
            if (!btnExportPdf) return;
            const params = new URLSearchParams();
            if (layanan && layanan !== 'all') params.append('layanan', layanan);
            const qs = params.toString() ? `?${params.toString()}` : '';

            btnExportPdf.href = `{{ route('adminBawah.perbaikan.exportPdf') }}${qs}`;
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
                            <th>Layanan</th>
                            <th>Syarat BTL</th>
                            <th>Jumlah Tahapan</th>
                            <th>Proses</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Layanan</th>
                            <th>Syarat BTL</th>
                            <th>Jumlah Tahapan</th>
                            <th>Proses</th>
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

        function loadPerbaikan() {
            const layanan = layananSelect ? layananSelect.value : 'all';

            updateExportLink(layanan);

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            const params = new URLSearchParams();
            if (layanan && layanan !== 'all') params.append('layanan', layanan);

            fetch(`/adminBawah/perbaikan/get-data?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const noTiket = item.no_tiket || '-';
                        const nip = item.nip || '-';
                        const nama = item.nama || '-';
                        const ukerja = item.nama_ukerja || '-';
                        const namaLayanan = item.nama_layanan || '-';
                        const jumlahBtl = item.jumlah_btl ?? 0;
                        const jumlahTahap = item.jumlah_tahap ?? 0;
                        const urlReview = item.url_review || '#';

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
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-danger border d-inline-flex align-items-center">
                                            ${jumlahBtl}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-info border d-inline-flex align-items-center">
                                            ${jumlahTahap} Tahapan
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="${urlReview}"
                                            title="Review">
                                            <i data-feather="edit" class="text-warning"></i>
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

        layananSelect?.addEventListener('change', function() {
            loadPerbaikan();
        });

    });
</script>
@endsection