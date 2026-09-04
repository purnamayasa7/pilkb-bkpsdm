@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="download"></i></div>
                        List Pengambilan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group me-2">
                        <a class="btn btn-sm btn-light text-primary" href="#" data-bs-toggle="modal"
                            data-bs-target="#modalTambahPengambilan">
                            <i class="me-1" data-feather="plus-circle"></i>
                            Tambah Pengambilan
                        </a>
                    </div>
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success" id="btnExportPdf" href="{{ route('adminBawah.pengambilan.exportPdf', ['year' => $year]) }}" target="_blank">
                            <i class="me-1" data-feather="download"></i>
                            Export PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

{{-- Modal Tambah Pengambilan --}}
<div class="modal fade" id="modalTambahPengambilan" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <form method="POST" action="{{ route('adminBawah.pengambilan.store') }}">
                @csrf

                <div class="modal-header">
                    <h5 class="modal-title">
                        Tambah Pengambilan
                    </h5>
                    <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
                </div>

                <div class="modal-body">
                    {{-- No Tiket --}}
                    <div class="mb-3">
                        <label class="form-label">
                            No Tiket
                        </label>
                        <div class="input-group">
                            <input type="text" name="no_tiket" id="no_tiket" class="form-control"
                                placeholder="Masukkan no tiket" required>
                            <button type="button" class="btn btn-primary" id="btnCekTiket">
                                <i data-feather="search" class="me-1"></i> Cek
                            </button>
                        </div>
                        <small id="infoTiket" class="text-muted"></small>
                    </div>

                    {{-- Nama Pengambil --}}
                    <div class="mb-3">
                        <label class="form-label">
                            Nama Pengambil
                        </label>
                        <input type="text" name="nama_pengambil" id="nama_pengambil" class="form-control"
                            placeholder="Masukkan nama pengambil" disabled required>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-light" data-bs-dismiss="modal" type="button">
                        <i data-feather="arrow-left" class="me-1"></i> Batal
                    </button>

                    <button type="submit" id="btnSimpan" class="btn btn-primary" disabled>
                        <span class="btn-text">
                            <i data-feather="save" class="me-1"></i> Simpan
                        </span>
                        <span class="btn-loading d-none">
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Menyimpan...
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form id="filterForm" onsubmit="event.preventDefault()">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        {{-- Tahun --}}
                        <div class="col-xl-3 col-md-4">
                            <label class="form-label small mb-1">Tahun Pengambilan</label>
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

                <div id="tableContainer" style="opacity: 0; transition: opacity 0.25s ease-in-out; min-height: 250px;">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Nama Layanan</th>
                                <th>Tanggal Diambil</th>
                                <th>Status Diambil</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Unit Kerja</th>
                                <th>Nama Layanan</th>
                                <th>Tanggal Diambil</th>
                                <th>Status Diambil</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($pengambilan as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $item->tiket->no_tiket ?? '-' }}</td>
                                <td>
                                    {{ $item->tiket->nip ?? '-' }} <br>
                                    <small class="text-muted">
                                        {{ $pegawaiList[$item->tiket->nip]['nama_lengkap'] ?? ($item->tiket->nama ?? '-') }}
                                    </small>
                                </td>
                                <td>{{ $pegawaiList[$item->tiket->nip]['ket_ukerja'] ?? ($item->tiket->nama_ukerja ?? '-') }}</td>
                                <td>{{ $item->tiket->layanan->nama_layanan ?? '-' }}</td>
                                <td>{{ $item->tanggal_pengambilan ? \Carbon\Carbon::parse($item->tanggal_pengambilan)->translatedFormat('d F Y H:i') : '-' }}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-success border d-inline-flex align-items-center">
                                            Sudah Diambil
                                        </span>
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
        const yearSelect = document.getElementById('yearSelect');
        const btnExportPdf = document.getElementById('btnExportPdf');

        // Initial datatable
        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        const tableContainer = document.getElementById('tableContainer');
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

        function updateExportLink(year) {
            if (!btnExportPdf) return;
            btnExportPdf.href = `{{ route('adminBawah.pengambilan.exportPdf') }}?year=${encodeURIComponent(year)}`;
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
                            <th>Tanggal Diambil</th>
                            <th>Status Diambil</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Nama Layanan</th>
                            <th>Tanggal Diambil</th>
                            <th>Status Diambil</th>
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

        function loadPengambilan() {
            const year = yearSelect ? yearSelect.value : '{{ date('Y') }}';
            updateExportLink(year);

            if (tableLoading) tableLoading.classList.remove('d-none');

            fetch(`/adminBawah/pengambilan/get-data?year=${encodeURIComponent(year)}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach((item, index) => {
                        const noTiket = item.no_tiket || '-';
                        const nip = item.nip || '-';
                        const nama = item.nama || '-';
                        const ukerja = item.ukerja || '-';
                        const layanan = item.layanan || '-';
                        const tgl = item.tanggal_pengambilan || '-';

                        rowsHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${escapeHtml(noTiket)}</td>
                                <td>
                                    ${escapeHtml(nip)} <br>
                                    <small class="text-muted">${escapeHtml(nama)}</small>
                                </td>
                                <td>${escapeHtml(ukerja)}</td>
                                <td>${escapeHtml(layanan)}</td>
                                <td>${escapeHtml(tgl)}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="badge bg-light text-success border d-inline-flex align-items-center">
                                            Sudah Diambil
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });

                    renderTable(rowsHtml);
                    if (tableLoading) tableLoading.classList.add('d-none');
                })
                .catch(err => {
                    console.error('Gagal memuat data pengambilan:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                });
        }

        yearSelect?.addEventListener('change', function() {
            loadPengambilan();
        });

        // CEK TIKET PADA MODAL TAMBAH
        const btnCek = document.getElementById('btnCekTiket');
        const inputTiket = document.getElementById('no_tiket');
        const info = document.getElementById('infoTiket');
        const inputNamaPengambil = document.getElementById('nama_pengambil');
        const btnSimpan = document.getElementById('btnSimpan');

        btnCek?.addEventListener('click', function() {
            const noTiket = inputTiket.value.trim();
            if (!noTiket) return;

            fetch(`{{ url('adminBawah/pengambilan/cek-tiket') }}/${encodeURIComponent(noTiket)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        inputTiket.classList.remove('is-invalid');
                        inputTiket.classList.add('is-valid');
                        info.innerHTML = `<span class="text-success">✓ Tiket ditemukan</span>`;
                        if (inputNamaPengambil) inputNamaPengambil.disabled = false;
                        if (btnSimpan) btnSimpan.disabled = false;
                    } else {
                        inputTiket.classList.remove('is-valid');
                        inputTiket.classList.add('is-invalid');
                        info.innerHTML = `<span class="text-danger">✕ Tiket tidak ditemukan</span>`;
                        if (inputNamaPengambil) inputNamaPengambil.disabled = true;
                        if (btnSimpan) btnSimpan.disabled = true;
                    }
                })
                .catch(() => {
                    info.innerHTML = `<span class="text-danger">Terjadi kesalahan saat memeriksa tiket</span>`;
                });
        });

        inputTiket?.addEventListener('input', function() {
            this.classList.remove('is-valid');
            this.classList.remove('is-invalid');
            if (info) info.innerHTML = '';
            if (inputNamaPengambil) inputNamaPengambil.disabled = true;
            if (btnSimpan) btnSimpan.disabled = true;
        });

        const formTambah = document.getElementById('modalTambahPengambilan')?.querySelector('form');
        formTambah?.addEventListener('submit', function() {
            if (btnSimpan) {
                btnSimpan.disabled = true;
                btnSimpan.querySelector('.btn-text')?.classList.add('d-none');
                btnSimpan.querySelector('.btn-loading')?.classList.remove('d-none');
            }
        });

    });
</script>
@endsection