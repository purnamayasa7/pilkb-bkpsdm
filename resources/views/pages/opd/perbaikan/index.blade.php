@extends('layouts.app')

@section('content')
{{-- MODAL KONFIRMASI --}}
<div class="modal fade" id="modalKonfirmasi" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">
                    Konfirmasi Perbaikan
                </h5>

                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <form method="POST" id="formKonfirmasi">
                @csrf

                <div class="modal-body">
                    Apakah yakin usulan ini sudah diperbaiki?
                </div>

                <div class="modal-footer">
                    <button type="button"
                        class="btn btn-light"
                        data-bs-dismiss="modal">
                        <i data-feather="arrow-left" class="me-1"></i> Batal
                    </button>

                    <button type="submit"
                        class="btn btn-primary"
                        id="btnConfirmPerbaikan">
                        <span class="btn-text">
                            <i data-feather="check" class="me-1"></i> Ya, Konfirmasi
                        </span>
                        <span class="btn-loading d-none">
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Memproses...
                        </span>
                    </button>
                </div>

            </form>

        </div>
    </div>
</div>

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
                    <!-- Dropdown Export -->
                    <div class="btn-group">
                        <button class="btn btn-sm btn-light text-success dropdown-toggle" type="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="me-1" data-feather="download"></i>
                            Export
                        </button>
                        <ul class="dropdown-menu">
                            <li>
                                <a id="btnExportExcel" class="dropdown-item" href="{{ route('adminOpd.perbaikan.exportExcel', request()->all()) }}">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a id="btnExportPdf" class="dropdown-item" href="{{ route('adminOpd.perbaikan.exportPdf', request()->all()) }}">
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
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-xl" role="document">
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
                        Detail BTL
                    </div>
                    <div class="card-body">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Syarat</th>
                                            <th>Comment</th>
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

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i> Tutup
                </button>
            </div>
        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form id="filterForm" onsubmit="event.preventDefault()" class="mb-3">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        <!-- LAYANAN -->
                        <div class="col-md-4">
                            <label class="form-label small mb-1">Layanan</label>
                            <select name="layanan" id="layananSelect" class="form-select">
                                <option value="">Semua Layanan</option>
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

                <div id="tableContainer" style="min-height: 250px; opacity: 0; transition: opacity 0.25s ease-in-out;">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Diperbaiki</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Syarat BTL</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>Diperbaiki</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Syarat BTL</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($data as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>

                                <td>
                                    @if ($item->diperbaiki == 0)
                                    <span class="badge bg-red-soft text-danger border d-inline-flex align-items-center">
                                        <i data-feather="x" class="me-1"></i>
                                        Belum
                                    </span>
                                    @else
                                    <span class="badge bg-green-soft text-green d-inline-flex align-items-center">
                                        <i data-feather="check" class="me-1"></i>
                                        Sudah
                                    </span>
                                    @endif
                                </td>

                                <td><span class="fw-semibold text-primary">{{ $item->no_tiket }}</span></td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $item->nama ?? '-' }}
                                    </small>
                                </td>
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
                                        {{-- KONFIRMASI --}}
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark btnKonfirmasi"
                                            href="#"
                                            data-notiket="{{ $item->no_tiket }}"
                                            title="Konfirmasi Perbaikan">
                                            <i data-feather="upload" class="text-success"></i>
                                        </a>
                                        {{-- EDIT / PERBAIKI --}}
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark btnEditPerbaikan"
                                            href="{{ route('adminOpd.perbaikan.edit', $item->no_tiket) }}"
                                            title="Perbaiki Dokumen">
                                            <i data-feather="edit" class="text-warning"></i>
                                        </a>
                                        {{-- DETAIL --}}
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#"
                                            data-notiket="{{ $item->no_tiket }}"
                                            title="Lihat Detail">
                                            <i data-feather="eye" class="text-primary"></i>
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
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        const tableLoading = document.getElementById('tableLoading');
        const tableContainer = document.getElementById('tableContainer');
        const layananSelect = document.getElementById('layananSelect');
        const btnExportExcel = document.getElementById('btnExportExcel');
        const btnExportPdf = document.getElementById('btnExportPdf');
        const formKonfirmasi = document.getElementById('formKonfirmasi');
        const btnConfirmPerbaikan = document.getElementById('btnConfirmPerbaikan');

        const baseUrlExcel = "{{ route('adminOpd.perbaikan.exportExcel') }}";
        const baseUrlPdf = "{{ route('adminOpd.perbaikan.exportPdf') }}";
        const getDataUrl = "{{ route('adminOpd.perbaikan.getData') }}";
        const konfirmasiRouteTemplate = "{{ route('adminOpd.perbaikan.konfirmasi', ':id') }}";

        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            window.dataTable = new simpleDatatables.DataTable(initialTable);
        }

        // Prevent FOUC: reveal container smoothly on initial load
        if (tableContainer) {
            tableContainer.style.opacity = '1';
        }
        if (tableLoading) {
            tableLoading.classList.add('d-none');
        }

        function escapeHtml(text) {
            if (text === null || text === undefined) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function updateExportUrls(layananVal) {
            const params = new URLSearchParams();
            if (layananVal) params.append('layanan', layananVal);

            const queryString = params.toString() ? '?' + params.toString() : '';

            if (btnExportExcel) btnExportExcel.href = baseUrlExcel + queryString;
            if (btnExportPdf) btnExportPdf.href = baseUrlPdf + queryString;
        }

        function renderTable(rowsHtml = '') {
            if (window.dataTable) {
                try {
                    window.dataTable.destroy();
                } catch (e) {
                    console.warn('Error destroying datatable:', e);
                }
                window.dataTable = null;
            }

            const container = document.getElementById('tableContainer');
            if (!container) return;

            container.innerHTML = `
                <table id="datatablesSimple">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Diperbaiki</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Syarat BTL</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Diperbaiki</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Syarat BTL</th>
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

            if (typeof feather !== 'undefined') {
                feather.replace();
            }

            container.style.opacity = '1';
        }

        function loadData() {
            const layananVal = layananSelect ? layananSelect.value : '';

            updateExportUrls(layananVal);

            if (tableLoading) tableLoading.classList.remove('d-none');
            if (tableContainer) tableContainer.style.opacity = '0.3';

            const params = new URLSearchParams();
            if (layananVal) params.append('layanan', layananVal);

            const fetchUrl = `${getDataUrl}?${params.toString()}`;

            fetch(fetchUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                let rowsHtml = '';

                data.forEach((item, index) => {
                    const noTiket = item.no_tiket || '-';
                    const nip = item.nip || '-';
                    const nama = item.nama || '-';
                    const layananName = item.nama_layanan || '-';
                    const jumlahBtl = item.jumlah_btl || 0;
                    const diperbaiki = item.diperbaiki;
                    const urlEdit = item.url_edit || '#';

                    const badgeDiperbaiki = (diperbaiki == 0)
                        ? `<span class="badge bg-red-soft text-danger border d-inline-flex align-items-center"><i data-feather="x" class="me-1"></i>Belum</span>`
                        : `<span class="badge bg-green-soft text-green d-inline-flex align-items-center"><i data-feather="check" class="me-1"></i>Sudah</span>`;

                    rowsHtml += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${badgeDiperbaiki}</td>
                            <td><span class="fw-semibold text-primary">${escapeHtml(noTiket)}</span></td>
                            <td>
                                ${escapeHtml(nip)} <br>
                                <small class="text-muted">${escapeHtml(nama)}</small>
                            </td>
                            <td>${escapeHtml(layananName)}</td>
                            <td>
                                <div class="d-flex align-items-center justify-content-center">
                                    <span class="badge bg-light text-danger border d-inline-flex align-items-center">
                                        ${jumlahBtl}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center justify-content-center">
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark btnKonfirmasi"
                                        href="#"
                                        data-notiket="${escapeHtml(noTiket)}"
                                        title="Konfirmasi Perbaikan">
                                        <i data-feather="upload" class="text-success"></i>
                                    </a>
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark btnEditPerbaikan"
                                        href="${urlEdit}"
                                        title="Perbaiki Dokumen">
                                        <i data-feather="edit" class="text-warning"></i>
                                    </a>
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                        href="#"
                                        data-notiket="${escapeHtml(noTiket)}"
                                        title="Lihat Detail">
                                        <i data-feather="eye" class="text-primary"></i>
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

        layananSelect?.addEventListener('change', loadData);

        // MODAL DETAIL
        const modalDetailEl = document.getElementById('modalDetail');
        const modalDetail = modalDetailEl ? new bootstrap.Modal(modalDetailEl) : null;

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDetail');
            if (!btn || !modalDetail) return;

            e.preventDefault();

            let noTiket = btn.dataset.notiket;
            document.getElementById('mdNoTiket').innerText = noTiket || '-';
            document.getElementById('historyTable').innerHTML = `<tr><td colspan="3" class="text-center py-3 text-muted"><span class="spinner-border spinner-border-sm me-1" role="status"></span>Memuat...</td></tr>`;

            modalDetail.show();

            fetch(`/adminOpd/perbaikan/detail/${encodeURIComponent(noTiket)}`)
                .then(res => res.json())
                .then(data => {
                    let html = '';

                    if (!data || data.length === 0) {
                        html = `<tr><td colspan="3" class="text-center py-3 text-muted">Tidak ada data</td></tr>`;
                    } else {
                        data.forEach((item, index) => {
                            html += `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${escapeHtml(item.syarat?.syarat ?? '-')}</td>
                                    <td>${escapeHtml(item.comment ?? '-')}</td>
                                </tr>
                            `;
                        });
                    }

                    document.getElementById('historyTable').innerHTML = html;
                })
                .catch(() => {
                    document.getElementById('historyTable').innerHTML = `<tr><td colspan="3" class="text-danger text-center py-3">Gagal memuat detail</td></tr>`;
                });
        });

        // MODAL KONFIRMASI
        const modalKonfirmasiEl = document.getElementById('modalKonfirmasi');
        const modalKonfirmasi = modalKonfirmasiEl ? new bootstrap.Modal(modalKonfirmasiEl) : null;

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnKonfirmasi');
            if (!btn || !modalKonfirmasi) return;

            e.preventDefault();

            let noTiket = btn.dataset.notiket;
            const actionUrl = konfirmasiRouteTemplate.replace(':id', encodeURIComponent(noTiket));

            if (formKonfirmasi) {
                formKonfirmasi.setAttribute('action', actionUrl);
            }

            modalKonfirmasi.show();
        });

        if (formKonfirmasi) {
            formKonfirmasi.addEventListener('submit', function() {
                if (btnConfirmPerbaikan) {
                    btnConfirmPerbaikan.disabled = true;
                    btnConfirmPerbaikan.querySelector('.btn-text')?.classList.add('d-none');
                    btnConfirmPerbaikan.querySelector('.btn-loading')?.classList.remove('d-none');
                }
            });
        }
    });
</script>
@endsection