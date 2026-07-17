@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="clipboard"></i></div>
                        List Proses Pengajuan
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
                                <a class="dropdown-item"
                                    href="{{ route('adminOpd.tiket.exportExcel', ['month' => $month, 'year' => $year]) }}">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item"
                                    href="{{ route('adminOpd.tiket.exportPdf', ['month' => $month, 'year' => $year]) }}" target="_blank">
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
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
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
                        Riwayat Proses Layanan
                    </div>
                    <div class="card-body">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <th>Tahap</th>
                                            <th>Tanggal</th>
                                            <th>Status</th>
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
        </div>
    </div>
</div>

{{-- <div class="container-xl px-4 mt-4"> --}}
<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminOpd.tiket.indexProses') }}" id="filterForm">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        {{-- Bulan --}}
                        <div class="col-md-4">
                            <label class="form-label">Bulan</label>
                            <select name="month" class="form-select">
                                @for ($m = 1; $m <= 12; $m++)
                                    <option value="{{ $m }}" {{ $month == $m ? 'selected' : '' }}>
                                    {{ \Carbon\Carbon::create()->month($m)->translatedFormat('F') }}
                                    </option>
                                    @endfor
                            </select>
                        </div>

                        {{-- Tahun --}}
                        <div class="col-md-4">
                            <label class="form-label">Tahun</label>
                            <select name="year" class="form-select">
                                @for ($y = date('Y') - 10; $y <= date('Y'); $y++)
                                    <option value="{{ $y }}" {{ $year == $y ? 'selected' : '' }}>
                                    {{ $y }}
                                    </option>
                                    @endfor
                            </select>
                        </div>

                        {{-- Tombol --}}
                        <div class="col-md-4">
                            <label class="form-label d-block">&nbsp;</label>
                            <button type="submit" class="btn btn-primary">
                                <i data-feather="search" class="me-1"></i>
                                Tampilkan
                            </button>
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
                <table id="datatablesSimple">
                    <thead>
                        <tr>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status Terakhir</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status Terakhir</th>
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
                                    Kadek Purnamayasa, S.Kom
                                </small>
                            </td>
                            <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                            <td>{{ $item->tanggal }}</td>
                            <td>{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                        href="#" data-notiket="{{ $item->no_tiket }}"
                                        data-nip="{{ $item->nip }}" data-nama="Kadek Purnamayasa, S.Kom"
                                        data-layanan="{{ $item->layanan->nama_layanan ?? '-' }}" title="Lihat Riwayat">

                                        <i data-feather="eye" class="text-primary"></i>
                                    </a>

                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                        href="{{ route('tiket.cetak', $item->no_tiket) }}" data-bs-toggle="tooltip"
                                        title="Cetak Tiket"><i data-feather="printer" class="text-warning"></i></a>
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
<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        window.addEventListener('load', function() {
            document.getElementById('tableLoading').classList.add('d-none');
        });

        const modal = new bootstrap.Modal(document.getElementById('modalDetail'));
        const baseUrl = "{{ url('adminOpd/tiket/history') }}";

        let historyData = [];
        let currentPage = 1;
        const perPage = 5;

        function renderTable() {

            let start = (currentPage - 1) * perPage;
            let end = start + perPage;

            let pageData = historyData.slice(start, end);

            let html = '';

            if (pageData.length === 0) {
                html = `<tr><td colspan="3" class="text-center">Tidak ada data</td></tr>`;
            } else {
                pageData.forEach((item, index) => {
                    html += `
                    <tr>
                        <td>Tahap ${start + index + 1}</td>
                        <td>${item.tanggal}</td>
                        <td>${item.status_rel ? item.status_rel.status : '-'}</td>
                    </tr>
                `;
                });
            }

            document.getElementById('historyTable').innerHTML = html;

            renderPagination();
        }

        function renderPagination() {

            let totalPage = Math.ceil(historyData.length / perPage);
            let html = '';

            if (totalPage > 1) {

                if (currentPage > 1) {
                    html +=
                        `<button class="btn btn-sm btn-outline-primary me-1" onclick="prevPage()">Prev</button>`;
                }

                html += `<span class="me-2">Page ${currentPage} / ${totalPage}</span>`;

                if (currentPage < totalPage) {
                    html += `<button class="btn btn-sm btn-outline-primary" onclick="nextPage()">Next</button>`;
                }
            }

            document.getElementById('historyPagination').innerHTML = html;
        }

        window.nextPage = function() {
            currentPage++;
            renderTable();
        }

        window.prevPage = function() {
            currentPage--;
            renderTable();
        }

        document.addEventListener('click', function(e) {

            const btn = e.target.closest('.btnDetail');
            if (!btn) return;

            e.preventDefault();

            const noTiket = btn.dataset.notiket;

            document.getElementById('mdNoTiket').innerText = noTiket;

            document.getElementById('historyTable').innerHTML =
                `<tr><td colspan="3" class="text-center">Loading...</td></tr>`;

            fetch(`${baseUrl}/${noTiket}`)
                .then(res => res.json())
                .then(data => {

                    historyData = data;
                    currentPage = 1;

                    renderTable();
                })
                .catch(() => {
                    document.getElementById('historyTable').innerHTML =
                        `<tr><td colspan="3" class="text-danger text-center">Gagal load data</td></tr>`;
                });

            modal.show();
        });

    });
</script>
@endsection