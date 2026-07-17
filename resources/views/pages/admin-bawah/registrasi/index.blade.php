@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="clipboard"></i></div>
                        List Permintaan Layanan Admin SKPD
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <!-- Dropdown Export -->
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success"
                            href="{{ route('adminBawah.permintaan.exportPermintaanPdf', request()->query()) }}" target="_blank"
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

{{-- <div class="container-xl px-4 mt-4"> --}}
<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
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
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status</th>
                            <th>Diperbaiki</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status</th>
                            <th>Diperbaiki</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        @foreach ($tiket as $item)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>{{ $item->no_tiket }}</td>
                            <td>
                                {{ $item->nip }} <br>
                                <small class="text-muted">
                                    {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? '-' }}
                                </small>
                            </td>
                            <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                            <td>{{ $item->tanggal }}</td>
                            <td>
                                <div class="d-flex align-items-center justify-content-center">
                                    @if ($item->detail->contains('status', 2))
                                    <span
                                        class="badge bg-light text-danger border d-inline-flex align-items-center">
                                        BTL
                                    </span>
                                    @else
                                    <span>
                                        {{ $item->tahapTerakhir->statusRel->status ?? '-' }}
                                    </span>
                                    @endif
                                </div>
                            </td>

                            <td>
                                <div class="d-flex align-items-center justify-content-center">
                                    @if ($item->detail->contains('status', 2))
                                    <span
                                        class="badge bg-light text-warning border d-inline-flex align-items-center">
                                        Belum
                                    </span>
                                    @else
                                    -
                                    @endif
                                </div>
                            </td>

                            <div class="d-flex align-items-center">
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('adminBawah.permintaan.reviewPermintaan', $item->no_tiket) }}"
                                            data-bs-toggle="tooltip" title="Validasi"><i data-feather="edit"
                                                class="text-primary"></i></a>
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
        feather.replace();
        window.addEventListener('load', function() {
            document.getElementById('tableLoading').classList.add('d-none');
        });
    });
</script>
@endsection