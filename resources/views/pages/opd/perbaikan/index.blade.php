@extends('layouts.app')

@section('content')
{{-- MODAL KONFIRMASI --}}
<div class="modal fade" id="modalKonfirmasi" tabindex="-1">
    <div class="modal-dialog">
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
                        Batal
                    </button>

                    <button type="submit"
                        class="btn btn-primary">
                        Ya, Konfirmasi
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
                                <a class="dropdown-item" href="{{ route('adminOpd.perbaikan.exportExcel', request()->all()) }}">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="{{ route('adminOpd.perbaikan.exportPdf', request()->all()) }}">
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
        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminOpd.perbaikan.index') }}" id="filterForm" class="mb-3">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">

                        <!-- LAYANAN -->
                        <div class="col-md-4">
                            <label class="form-label">Layanan</label>
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
                        <!-- TOMBOL RESET -->
                        {{-- <div class="col-md-4 d-flex gap-2">
                            <a href="{{ route('root.syarat') }}" class="btn btn-secondary w-50">
                        Reset
                        </a>
                    </div> --}}

                </div>
        </div>
        </form>
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

                    <td>{{ $item->no_tiket }}</td>
                    <td>
                        {{ $item->nip }} <br>
                        <small class="text-muted">
                            {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? '-' }}
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

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        const layananSelect = document.getElementById('layananSelect');

        layananSelect.addEventListener('change', function() {
            document.getElementById('filterForm').submit();
        });

        // MODAL DETAIL (biarkan tetap)
        const modalDetail = new bootstrap.Modal(document.getElementById('modalDetail'));

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDetail');
            if (!btn) return;

            e.preventDefault();

            let noTiket = btn.dataset.notiket;

            document.getElementById('mdNoTiket').innerText = noTiket;

            fetch(`/adminOpd/perbaikan/detail/${noTiket}`)
                .then(res => res.json())
                .then(data => {

                    let html = '';

                    if (data.length === 0) {
                        html = `<tr><td colspan="3" class="text-center">Tidak ada data</td></tr>`;
                    } else {
                        data.forEach((item, index) => {
                            html += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.syarat?.syarat ?? '-'}</td>
                                <td>${item.comment ?? '-'}</td>
                            </tr>
                        `;
                        });
                    }

                    document.getElementById('historyTable').innerHTML = html;

                    modalDetail.show();
                });
        });

        // Konfirmasi
        const modalKonfirmasi = new bootstrap.Modal(
            document.getElementById('modalKonfirmasi')
        );

        document.addEventListener('click', function(e) {

            const btn = e.target.closest('.btnKonfirmasi');

            if (!btn) return;

            e.preventDefault();

            let noTiket = btn.dataset.notiket;

            const actionUrl =
                `{{ route('adminOpd.perbaikan.konfirmasi', ':id') }}`
                .replace(':id', noTiket);

            document.getElementById('formKonfirmasi')
                .setAttribute('action', actionUrl);

            modalKonfirmasi.show();
        });
    });
</script>
@endsection