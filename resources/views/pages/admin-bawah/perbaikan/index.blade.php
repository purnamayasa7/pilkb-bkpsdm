@extends('layouts.app')

@section('content')
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
                        <a class="btn btn-sm btn-light text-success"
                            href="{{ route('adminBawah.perbaikan.exportPdf', request()->query()) }}"
                            target="_blank" target="_blank">
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
            <form method="GET" action="{{ route('adminBawah.perbaikan.indexAdminBawah') }}" id="filterForm"
                class="mb-3">
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
                    </div>
                </div>
            </form>
            <table id="datatablesSimple">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>No Tiket</th>
                        <th>NIP</th>
                        <th>Unit Kerja</th>
                        <th>Layanan</th>
                        <th>Syarat BTL</th>
                        <th>Jumlah Tahapan</th>
                        <th>Proses</th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <th>No</th>
                        <th>No Tiket</th>
                        <th>NIP</th>
                        <th>Unit Kerja</th>
                        <th>Layanan</th>
                        <th>Syarat BTL</th>
                        <th>Jumlah Tahapan</th>
                        <th>Proses</th>
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
                                <span class="badge bg-light text-info border d-inline-flex align-items-center">
                                    {{ $item->jumlah_tahap }} Tahapan
                                </span>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-items-center justify-content-center">
                                <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                    href="{{ route('adminBawah.perbaikan.review', $item->no_tiket) }}"
                                    title="Review">

                                    <i data-feather="edit" class="text-warning"></i>
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
    });
</script>
@endsection