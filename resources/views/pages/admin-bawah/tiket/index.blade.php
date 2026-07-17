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

{{-- <div class="container-xl px-4 mt-4"> --}}
<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminBawah.tiket.indexList') }}" id="filterForm">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
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

                        {{-- Status Diambil --}}
                        <div class="col-md-4">
                            <label class="form-label">Status Diambil</label>
                            <select name="diambil" class="form-select">
                                <option value="">-- Semua --</option>
                                <option value="0" {{ request('diambil') === '0' ? 'selected' : '' }}>Belum Diambil
                                </option>
                                <option value="1" {{ request('diambil') === '1' ? 'selected' : '' }}>Sudah Diambil
                                </option>
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
                            <td>{{ $item->no_tiket }}</td>
                            <td>
                                {{ $item->nip }} <br>
                                <small class="text-muted">
                                    {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? '-' }}
                                </small>
                            </td>
                            <td> {{ $pegawaiList[$item->nip]['ket_ukerja'] ?? '-' }}</td>
                            <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                            <td>{{ $item->tanggal }}</td>
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
        feather.replace();
    });
</script>
@endsection