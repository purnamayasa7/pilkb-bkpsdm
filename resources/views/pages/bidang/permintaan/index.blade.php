@extends('layouts.app')

@section('content')
{{-- FORM SELESAI --}}
<form id="formSelesai" method="POST">
    @csrf
    <input type="hidden" name="no_tiket" id="noTiketSelesai">
</form>

{{-- Modal Konfirmasi --}}
<div class="modal fade" id="modalKonfirmasi" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">
                    Konfirmasi Layanan Selesai
                </h5>

                <button class="btn-close" data-bs-dismiss="modal" type="button"></button>
            </div>

            <div class="modal-body">
                Apakah Anda yakin layanan sudah selesai dan ingin mengarsipkan tiket?
            </div>

            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal" type="button">
                    <i data-feather="arrow-left" class="me-1"></i>
                    Batal
                </button>

                <button class="btn btn-primary" type="button" id="btnSubmitFinal">

                    <span class="btn-submit-text">
                        <i data-feather="check" class="me-1"></i>
                        Ya, Lanjutkan
                    </span>

                    <span class="btn-submit-loading d-none">
                        <span class="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"></span>
                        Mengarsipkan...
                    </span>

                </button>
            </div>

        </div>
    </div>
</div>

<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="clipboard"></i></div>
                        List Permintaan - {{ auth()->user()->nama_bidang }}
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
                                <th>Unit Kerja</th>
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
                                <th>Selesai</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Unit Kerja</th>
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
                                <th>Selesai</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($tiket as $item)
                            <tr>
                                <td>{{ $item->no_tiket }}</td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $item->nama ?? '-' }}
                                    </small>
                                </td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>
                                    {{ $item->nama_ukerja ?? '-' }}
                                </td>
                                <td>{{ $item->tanggal }}</td>
                                <td>{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        @if ($item->archives == 1)
                                        <span class="badge bg-light text-success border d-inline-flex align-items-center">
                                            Selesai
                                        </span>
                                        @else
                                        <span class="badge bg-light text-warning border d-inline-flex align-items-center">
                                            Proses
                                        </span>
                                        @endif
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="{{ route('adminBidang.permintaan.editPermintaan', $item->no_tiket) }}"
                                            title="Update">
                                            <i data-feather="edit" class="text-warning"></i>
                                        </a>

                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnSelesai"
                                            href="#" data-notiket="{{ $item->no_tiket }}" data-bs-toggle="tooltip"
                                            title="Proses Selesai">
                                            <i data-feather="check" class="text-success"></i>
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
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');

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
                            <th>Unit Kerja</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Selesai</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Unit Kerja</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Selesai</th>
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

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            fetch(`/adminBidang/permintaan/get-data?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`)
                .then(res => res.json())
                .then(data => {
                    let rowsHtml = '';

                    data.forEach(item => {
                        const noTiket = item.no_tiket || '';
                        const nip = item.nip || '-';
                        const nama = item.nama ? `<br><small class="text-muted">${escapeHtml(item.nama)}</small>` : '';
                        const layanan = (item.layanan && item.layanan.nama_layanan) ? item.layanan.nama_layanan : '-';
                        const unitKerja = item.nama_ukerja || '-';
                        const tanggal = item.tanggal || '-';
                        const statusTerakhir = (item.tahap_terakhir && item.tahap_terakhir.status_rel && item.tahap_terakhir.status_rel.status)
                            ? item.tahap_terakhir.status_rel.status
                            : '-';

                        const statusBadge = item.archives == 1
                            ? `<span class="badge bg-light text-success border d-inline-flex align-items-center">Selesai</span>`
                            : `<span class="badge bg-light text-warning border d-inline-flex align-items-center">Proses</span>`;

                        const editUrl = `/adminBidang/permintaan/${encodeURIComponent(noTiket)}/edit`;

                        rowsHtml += `
                            <tr>
                                <td>${escapeHtml(noTiket)}</td>
                                <td>${escapeHtml(nip)} ${nama}</td>
                                <td>${escapeHtml(layanan)}</td>
                                <td>${escapeHtml(unitKerja)}</td>
                                <td>${escapeHtml(tanggal)}</td>
                                <td>${escapeHtml(statusTerakhir)}</td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        ${statusBadge}
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="${editUrl}"
                                            title="Update">
                                            <i data-feather="edit" class="text-warning"></i>
                                        </a>

                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnSelesai"
                                            href="#" data-notiket="${escapeHtml(noTiket)}" data-bs-toggle="tooltip"
                                            title="Proses Selesai">
                                            <i data-feather="check" class="text-success"></i>
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
                    console.error('Gagal memuat data permintaan:', err);
                    if (tableLoading) tableLoading.classList.add('d-none');
                    if (tableContainer) tableContainer.style.opacity = '1';
                });
        }

        monthSelect?.addEventListener('change', loadData);
        yearSelect?.addEventListener('change', loadData);

        // Modal Konfirmasi Selesai
        const modalKonfirmasiEl = document.getElementById('modalKonfirmasi');
        const btnSubmitFinal = document.getElementById('btnSubmitFinal');
        const formSelesai = document.getElementById('formSelesai');
        const btnSubmitText = btnSubmitFinal?.querySelector('.btn-submit-text');
        const btnSubmitLoading = btnSubmitFinal?.querySelector('.btn-submit-loading');

        let modalKonfirmasi = null;
        if (modalKonfirmasiEl) {
            modalKonfirmasi = new bootstrap.Modal(modalKonfirmasiEl);
        }

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnSelesai');
            if (!btn) return;

            e.preventDefault();
            const selectedNoTiket = btn.dataset.notiket;
            if (!selectedNoTiket) return;

            if (formSelesai) {
                formSelesai.action = `/adminBidang/permintaan/${encodeURIComponent(selectedNoTiket)}/selesai`;
            }

            if (btnSubmitFinal) {
                btnSubmitFinal.disabled = false;
                btnSubmitText?.classList.remove('d-none');
                btnSubmitLoading?.classList.add('d-none');
            }

            if (modalKonfirmasi) {
                modalKonfirmasi.show();
            }
        });

        btnSubmitFinal?.addEventListener('click', function() {
            btnSubmitFinal.disabled = true;
            btnSubmitText?.classList.add('d-none');
            btnSubmitLoading?.classList.remove('d-none');

            if (formSelesai) {
                formSelesai.submit();
            }
        });
    });
</script>
@endsection