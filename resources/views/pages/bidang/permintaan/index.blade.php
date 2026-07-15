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

                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                Apakah Anda yakin layanan sudah selesai dan ingin mengarsipkan tiket?
            </div>

            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal">
                    Batal
                </button>

                <button class="btn btn-primary" id="btnSubmitFinal">
                    Ya, Lanjutkan
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
                <div class="col-12 col-xl-auto mb-3">
                    <!-- Dropdown Export -->
                    {{-- <div class="btn-group">
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
                </div> --}}
            </div>
        </div>
    </div>
    </div>
</header>

{{-- <div class="container-xl px-4 mt-4"> --}}
<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminBidang.permintaan.index') }}" id="filterForm">
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
                                {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? '-' }}
                            </small>
                        </td>
                        <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                        <td> {{ $pegawaiList[$item->nip]['ket_ukerja'] ?? '-' }}</td>
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
<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        const modalKonfirmasi = new bootstrap.Modal(
            document.getElementById('modalKonfirmasi')
        );

        const btnSubmitFinal = document.getElementById('btnSubmitFinal');

        const formSelesai = document.getElementById('formSelesai');

        let selectedNoTiket = null;

        // klik tombol checklist
        document.addEventListener('click', function(e) {

            const btn = e.target.closest('.btnSelesai');

            if (!btn) return;

            e.preventDefault();

            selectedNoTiket = btn.dataset.notiket;

            // set action form dinamis
            formSelesai.action =
                `/adminBidang/permintaan/${selectedNoTiket}/selesai`;

            modalKonfirmasi.show();

        });

        // klik ya lanjutkan
        btnSubmitFinal.addEventListener('click', function() {

            formSelesai.submit();

        });

    });
</script>
@endsection