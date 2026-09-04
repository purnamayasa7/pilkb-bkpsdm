@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="edit"></i></div>
                        Update Status Tiket - {{ auth()->user()->nama_bidang }}
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
            <form method="GET" action="{{ route('adminBidang.status.index') }}" class="mb-4" id="searchForm">
                <div class="bg-white p-3 rounded-3 border">
                    <div class="row g-3 align-items-end">

                        <div class="col-md-5 col-xl-4">
                            <label class="small mb-1">No Tiket / NIP</label>
                            <div class="input-group">
                                <input type="text" name="keyword" id="keywordInput" class="form-control"
                                    placeholder="Masukkan No Tiket / NIP..." value="{{ request('keyword') }}" autofocus>
                                <button type="submit" class="btn btn-primary" id="btnCari">
                                    <i data-feather="search" class="me-1"></i> Cari
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </form>

            <div class="position-relative">
                <div id="tableContainer" style="min-height: 200px;">
                    @if (request('keyword') && $data->count() > 0)
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Unit Kerja</th>
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th>No</th>
                                <th>No Tiket</th>
                                <th>NIP</th>
                                <th>Layanan</th>
                                <th>Unit Kerja</th>
                                <th>Tanggal Masuk</th>
                                <th>Status Terakhir</th>
                                <th>Aksi</th>
                            </tr>
                        </tfoot>
                        <tbody>
                            @foreach ($data as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td><span class="fw-semibold text-primary">{{ $item->no_tiket }}</span></td>
                                <td>
                                    {{ $item->nip }} <br>
                                    <small class="text-muted">
                                        {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? ($item->nama ?? '-') }}
                                    </small>
                                </td>
                                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                <td>
                                    {{ $pegawaiList[$item->nip]['ket_ukerja'] ?? ($item->nama_ukerja ?? '-') }}
                                </td>
                                <td>{{ $item->tanggal ? \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d F Y H:i') : '-' }}</td>
                                <td>
                                    <span class="badge bg-primary-soft text-primary">
                                        {{ optional($item->tahapTerakhir->statusRel)->status ?? '-' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="{{ route('adminBidang.status.edit', $item->no_tiket) }}"
                                            data-bs-toggle="tooltip"
                                            title="Update Status">
                                            <i data-feather="edit" class="text-warning"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @elseif (request('keyword') && $data->isEmpty())
                    <div class="alert alert-warning mb-0" role="alert">
                        <i data-feather="alert-triangle" class="me-1"></i> Data tiket dengan kata kunci <strong>"{{ request('keyword') }}"</strong> tidak ditemukan.
                    </div>
                    @else
                    <div class="text-center py-5 text-muted">
                        <i data-feather="edit" class="mb-3" style="width: 48px; height: 48px; opacity: 0.5;"></i>
                        <h5 class="fw-bold text-dark">Pencarian Tiket</h5>
                        <p class="mb-0 text-muted">Silakan masukkan Nomor Tiket atau NIP pada kolom di atas untuk mencari tiket yang akan diupdate statusnya.</p>
                    </div>
                    @endif
                </div>
            </div>

        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        feather.replace();

        const initialTable = document.getElementById('datatablesSimple');
        if (initialTable && typeof simpleDatatables !== 'undefined') {
            new simpleDatatables.DataTable(initialTable);
        }
    });
</script>
@endsection