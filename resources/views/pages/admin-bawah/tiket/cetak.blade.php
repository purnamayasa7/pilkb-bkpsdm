@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="printer"></i></div>
                        Cetak Tiket
                    </h1>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">

            <!-- FORM PENCARIAN -->
            <form id="searchForm" onsubmit="event.preventDefault();" class="mb-4">
                <div class="bg-white p-3 rounded-3 border">
                    <div class="row g-3 align-items-end">

                        <div class="col-md-5 col-xl-4">
                            <label class="small mb-1">No Tiket / NIP</label>
                            <div class="input-group">
                                <input type="text" name="keyword" id="keywordInput" class="form-control"
                                    placeholder="Masukkan No Tiket / NIP..." value="{{ request('keyword') }}" autofocus>
                                <button type="submit" class="btn btn-primary" id="btnCari">
                                    <i data-feather="search" class="me-1"></i> Cari
                                </button>
                            </div>
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
                    @if (request('keyword') && $data->count() > 0)
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Layanan</th>
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
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
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
                                <th>Aksi</th>
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
                                <td>{{ $item->tanggal ? \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y H:i') : '-' }}</td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        {{ optional($item->tahapTerakhir->statusRel)->status ?? '-' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('tiket.cetak', $item->no_tiket) }}" target="_blank"
                                            title="Cetak Tiket">
                                            <i data-feather="printer" class="text-warning"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @elseif (request('keyword') && $data->isEmpty())
                    <div class="alert alert-danger mb-0">
                        <i data-feather="alert-circle" class="me-2"></i> Data tidak ditemukan untuk kata kunci "{{ request('keyword') }}".
                    </div>
                    @else
                    <div class="text-center py-5 text-muted">
                        <i data-feather="search" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                        <h5 class="fw-bold text-dark">Pencarian Tiket</h5>
                        <p class="mb-0 text-muted">Silakan masukkan Nomor Tiket atau NIP pada kolom di atas untuk mencari tiket yang akan dicetak.</p>
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
        const keywordInput = document.getElementById('keywordInput');
        const searchForm = document.getElementById('searchForm');

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
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Layanan</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
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
                            <th>Tanggal Masuk</th>
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

        function searchTiket() {
            const keyword = keywordInput ? keywordInput.value.trim() : '';

            if (!keyword) {
                if (window.dataTable) {
                    try { window.dataTable.destroy(); } catch (e) {}
                    window.dataTable = null;
                }
                if (tableContainer) {
                    tableContainer.innerHTML = `
                        <div class="text-center py-5 text-muted">
                            <i data-feather="search" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                            <h5 class="fw-bold text-dark">Pencarian Tiket</h5>
                            <p class="mb-0 text-muted">Silakan masukkan Nomor Tiket atau NIP pada kolom di atas untuk mencari tiket yang akan dicetak.</p>
                        </div>
                    `;
                    feather.replace();
                    tableContainer.style.opacity = '1';
                }
                return;
            }

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            fetch(`/adminBawah/tiket/get-cetak-data?keyword=${encodeURIComponent(keyword)}`)
                .then(res => res.json())
                .then(data => {
                    if (!data || data.length === 0) {
                        if (window.dataTable) {
                            try { window.dataTable.destroy(); } catch (e) {}
                            window.dataTable = null;
                        }
                        if (tableContainer) {
                            tableContainer.innerHTML = `
                                <div class="alert alert-danger mb-0">
                                    <i data-feather="alert-circle" class="me-2"></i> Data tidak ditemukan untuk kata kunci "<strong>${escapeHtml(keyword)}</strong>".
                                </div>
                            `;
                            feather.replace();
                            tableContainer.style.opacity = '1';
                        }
                    } else {
                        let rowsHtml = '';
                        data.forEach((item, index) => {
                            const noTiket = item.no_tiket || '-';
                            const nip = item.nip || '-';
                            const nama = item.nama || '-';
                            const ukerja = item.nama_ukerja || '-';
                            const layanan = item.nama_layanan || '-';
                            const tgl = item.tanggal || '-';
                            const status = item.status || '-';

                            rowsHtml += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td><span class="fw-semibold text-primary">${escapeHtml(noTiket)}</span></td>
                                    <td>
                                        ${escapeHtml(nip)} <br>
                                        <small class="text-muted">${escapeHtml(nama)}</small>
                                    </td>
                                    <td>${escapeHtml(ukerja)}</td>
                                    <td>${escapeHtml(layanan)}</td>
                                    <td>${escapeHtml(tgl)}</td>
                                    <td>
                                        <span class="badge bg-primary-soft text-primary">
                                            ${escapeHtml(status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center justify-content-center">
                                            <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                                href="${item.url_cetak}" target="_blank"
                                                title="Cetak Tiket">
                                                <i data-feather="printer" class="text-warning"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        });

                        renderTable(rowsHtml);
                    }

                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal mencari tiket:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        searchForm?.addEventListener('submit', function(e) {
            e.preventDefault();
            searchTiket();
        });

    });
</script>
@endsection