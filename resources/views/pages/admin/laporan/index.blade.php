@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon">
                            <i data-feather="bar-chart-2"></i>
                        </div>
                        Laporan Usulan Layanan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success" href="{{ route('root.laporan.exportPdf', request()->query()) }}"
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
            <form method="GET" action="{{ route('root.laporan.index') }}">
                <div class="bg-white p-3 rounded-3 border mb-4">
                    <div class="row">

                        <div class="col-md-6">
                            <div class="row">
                                <!-- BIDANG -->
                                <div class="col-md-6">
                                    <label class="small mb-1">
                                        Bidang
                                    </label>

                                    <select name="bidang" id="bidangSelect" class="form-select">
                                        <option value="all">
                                            Semua Bidang
                                        </option>
                                        @foreach ($bidangList as $bidang)
                                        <option value="{{ $bidang->id }}"
                                            {{ request('bidang') == $bidang->id ? 'selected' : '' }}>
                                            {{ $bidang->nama_bidang }}
                                        </option>
                                        @endforeach
                                    </select>
                                </div>

                                <!-- LAYANAN -->
                                <div class="col-md-6">
                                    <label class="small mb-1">
                                        Layanan
                                    </label>

                                    <select name="layanan" id="layananSelect" class="form-select">
                                        <option value="all">
                                            Semua Layanan
                                        </option>
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

                        <div class="col-md-6">
                            <div class="row">
                                <!-- TANGGAL AWAL -->
                                <div class="col-md-4">
                                    <label class="small mb-1">
                                        Tanggal Awal
                                    </label>

                                    <input type="date" name="tanggal_awal" class="form-control"
                                        value="{{ request('tanggal_awal') }}">
                                </div>

                                <!-- TANGGAL AKHIR -->
                                <div class="col-md-4">
                                    <label class="small mb-1">
                                        Tanggal Akhir
                                    </label>
                                    <input type="date" name="tanggal_akhir" class="form-control"
                                        value="{{ request('tanggal_akhir') }}">
                                </div>

                                <!-- BUTTON -->
                                <div class="col-md-4">
                                    <label class="small mb-1 d-block">
                                        &nbsp;
                                    </label>

                                    <div class="d-flex gap-2">
                                        <button type="submit" name="filter" value="1" class="btn btn-primary">
                                            <i data-feather="search" class="me-1"></i>
                                            Tampilkan
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Nama Penerima</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>No Tiket</th>
                            <th>NIP</th>
                            <th>Unit Kerja</th>
                            <th>Nama Layanan</th>
                            <th>Tanggal Masuk</th>
                            <th>Status Terakhir</th>
                            <th>Nama Penerima</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        @foreach ($data as $item)
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
                            <td>
                                {{ $item->layanan->nama_layanan ?? '-' }}
                            </td>
                            <td>
                                {{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y H:i') }}
                            </td>
                            <td>{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                            <td>{{ $item->nama_penerima }}</td>
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

        const bidangSelect = document.getElementById('bidangSelect');
        const layananSelect = document.getElementById('layananSelect');

        bidangSelect.addEventListener('change', function() {
            const bidangId = this.value;
            layananSelect.innerHTML =
                '<option value="all">Semua Layanan</option>';
            if (bidangId) {
                fetch(
                        `{{ route('root.laporan.getLayananByBidang') }}?bidang_id=${bidangId}`
                    )

                    .then(response => response.json())
                    .then(data => {
                        data.forEach(item => {
                            layananSelect.innerHTML += `
                        <option value="${item.id}">
                            ${item.nama_layanan}
                        </option>
                    `;
                        });
                    });
            }
        });
    });
</script>
@endsection