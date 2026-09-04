@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="shuffle"></i></div>
                        Pindah Data Tiket
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
            <form method="GET" action="{{ route('adminBawah.pindah.indexPindah') }}" class="mb-4">
                <div class="bg-white p-3 rounded-3 border">
                    <div class="row align-items-end">

                        <div class="col-md-4">
                            <label class="small mb-1">No Tiket</label>
                            <input type="text" name="keyword" class="form-control"
                                placeholder="Masukkan No Tiket" value="{{ request('keyword') }}" required>
                        </div>

                        <div class="col-md-4">
                            <button type="submit" class="btn btn-primary">
                                <i data-feather="search" class="me-1"></i> Cari
                            </button>
                            @if(request('keyword'))
                            <a href="{{ route('adminBawah.pindah.indexPindah') }}" class="btn btn-light ms-1">
                                <i data-feather="refresh-cw" class="me-1"></i> Reset
                            </a>
                            @endif
                        </div>

                    </div>
                </div>
            </form>

            <!-- NOT FOUND -->
            @if (request('keyword') && $data->isEmpty())
            <div class="alert alert-warning" role="alert">
                <i data-feather="alert-triangle" class="me-1"></i> Data tiket dengan nomor <strong>"{{ request('keyword') }}"</strong> tidak ditemukan.
            </div>
            @endif

            <!-- TABLE -->
            @if ($data->count())
            <div class="table-responsive">
                <table id="datatablesSimple" class="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>No Tiket</th>
                            <th>NIP &amp; Nama</th>
                            <th>Unit Kerja</th>
                            <th>Layanan</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No Tiket</th>
                            <th>NIP &amp; Nama</th>
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
                            <td><span class="fw-semibold text-primary">{{ $item->no_tiket }}</span></td>
                            <td>
                                {{ $item->nip }} <br>
                                <small class="text-muted">
                                    {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? ($item->nama ?? '-') }}
                                </small>
                            </td>
                            <td> {{ $pegawaiList[$item->nip]['ket_ukerja'] ?? ($item->nama_ukerja ?? '-') }}</td>
                            <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                            <td>{{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y H:i') }}</td>
                            <td>
                                <span class="badge bg-primary-soft text-primary">
                                    {{ optional($item->tahapTerakhir->statusRel)->status ?? '-' }}
                                </span>
                            </td>
                            <td>
                                <div class="d-flex align-items-center justify-content-center">
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                        href="{{ route('adminBawah.pindah.editPindah', $item->no_tiket) }}"
                                        data-bs-toggle="tooltip"
                                        title="Pindah Layanan">

                                        <i data-feather="shuffle" class="text-primary"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif

        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        feather.replace();
    });
</script>
@endsection