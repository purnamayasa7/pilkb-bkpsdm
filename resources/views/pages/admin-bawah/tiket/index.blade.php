@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="clipboard"></i></div>
                        List Tiket Pengajuan Usulan
                    </h1>
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
                    <div class="row g-3 align-items-end">
                        {{-- Tahun --}}
                        <div class="col-xl-3 col-md-6">
                            <label class="form-label small mb-1">Tahun</label>
                            <select name="year" id="yearSelect" class="form-select">
                                @for ($y = date('Y') - 10; $y <= date('Y'); $y++)
                                    <option value="{{ $y }}" {{ $year == $y ? 'selected' : '' }}>
                                    {{ $y }}
                                    </option>
                                @endfor
                            </select>
                        </div>

                        {{-- Status Diambil --}}
                        <div class="col-xl-3 col-md-6">
                            <label class="form-label small mb-1">Status Diambil</label>
                            <select name="diambil" id="statusDiambilSelect" class="form-select">
                                <option value="">Semua Status</option>
                                <option value="0" {{ request('diambil') === '0' ? 'selected' : '' }}>Belum Diambil</option>
                                <option value="1" {{ request('diambil') === '1' ? 'selected' : '' }}>Sudah Diambil</option>
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
                                <th>Nama Layanan</th>
                                <th>Tanggal</th>
                                <th>Status Diambil</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Nama Layanan</th>
                                <th>Tanggal</th>
                                <th>Status Diambil</th>
                                <th>Aksi</th>
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
                                <td>{{ $item->nama_ukerja ?? '-' }}</td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>{{ $item->tanggal ? \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y H:i') : '-' }}</td>
                                <td>
                                    @if ($item->diambil == 1)
                                    <span class="badge bg-light text-success border d-inline-flex align-items-center">
                                        Sudah
                                    </span>
                                    @else
                                    <span class="badge bg-light text-warning border d-inline-flex align-items-center">
                                        Belum
                                    </span>
                                    @endif
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('tiket.public', $item->no_tiket) }}" target="_blank"
                                            title="Lihat Tiket">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>

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
        const yearSelect = document.getElementById('yearSelect');
        const statusDiambilSelect = document.getElementById('statusDiambilSelect');

        // Initial Datatable
        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        // Tampilkan tabel setelah simpleDatatables siap dan sembunyikan spinner
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
                            <th>Tanggal</th>
                            <th>Status Diambil</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Nama Layanan</th>
                            <th>Tanggal</th>
                            <th>Status Diambil</th>
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

        function loadTiket() {
            const year = yearSelect ? yearSelect.value : '{{ date('Y') }}';
            const diambil = statusDiambilSelect ? statusDiambilSelect.value : '';

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            const params = new URLSearchParams();
            if (year) params.append('year', year);
            if (diambil !== '') params.append('diambil', diambil);

            fetch(`/adminBawah/tiket/get-data?${params.toString()}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const noTiket = item.no_tiket || '-';
                        const nip = item.nip || '-';
                        const nama = item.nama || '-';
                        const ukerja = item.nama_ukerja || '-';
                        const layanan = item.nama_layanan || '-';
                        const tgl = item.tanggal || '-';
                        const statusBadge = item.diambil === 1
                            ? '<span class="badge bg-light text-success border d-inline-flex align-items-center">Sudah</span>'
                            : '<span class="badge bg-light text-warning border d-inline-flex align-items-center">Belum</span>';

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
                                <td>${statusBadge}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="${item.url_public}" target="_blank"
                                            title="Lihat Tiket">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>

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
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal memuat data tiket:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        yearSelect?.addEventListener('change', function() {
            loadTiket();
        });

        statusDiambilSelect?.addEventListener('change', function() {
            loadTiket();
        });

    });
</script>
@endsection