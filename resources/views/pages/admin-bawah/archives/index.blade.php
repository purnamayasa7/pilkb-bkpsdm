@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="archive"></i></div>
                        Archives Usulan Layanan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <!-- Dropdown Export -->
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success"
                            href="{{ route('adminBawah.archives.exportArchivesPdf', request()->query()) }}"
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

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminBawah.archives.indexArchives') }}" id="filterForm">

                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">

                        <!-- BIDANG -->
                        <div class="col-md-3">
                            <label class="small mb-1">Bidang</label>

                            <select name="bidang" class="form-select">
                                <option value="">Semua Bidang</option>

                                @foreach ($bidangList as $bidang)
                                <option value="{{ $bidang->id }}"
                                    {{ request('bidang') == $bidang->id ? 'selected' : '' }}>

                                    {{ $bidang->nama_bidang }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <!-- TANGGAL AWAL -->
                        <div class="col-md-3">
                            <label class="small mb-1">Tanggal Awal</label>

                            <input type="date" name="tanggal_awal" class="form-control"
                                value="{{ request('tanggal_awal') }}">
                        </div>

                        <!-- TANGGAL AKHIR -->
                        <div class="col-md-3">
                            <label class="small mb-1">Tanggal Akhir</label>

                            <input type="date" name="tanggal_akhir" class="form-control"
                                value="{{ request('tanggal_akhir') }}">
                        </div>

                        <div class="col-md-3">
                            <button type="submit" name="filter" value="1" class="btn btn-primary">
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
                            <th>Unit Kerja</th>
                            <th>Layanan</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Operator Archives</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Layanan</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Operator Archives</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        @foreach ($data as $item)
                        <tr>
                            <td>{{ $item->no_tiket }}</td>
                            <td>
                                {{ $item->nip }} <br>
                                <small class="text-muted">
                                    {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? '-' }}
                                </small>
                            </td>
                            <td> {{ $pegawaiList[$item->nip]['ket_ukerja'] ?? '-' }}</td>
                            <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                            <td>{{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y H:i') }}</td>
                            <td>{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                            <td>{{ $item->operatorArchives->nama ?? '-' }}</td>
                            <td>
                                <div class="d-flex align-items-center justify-content-center">
                                    <button class="btn btn-sm btn-light text-warning" type="button"
                                        data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="me-1" data-feather="corner-up-left"></i>
                                        Kembalikan
                                    </button>
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