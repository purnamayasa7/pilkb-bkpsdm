@extends('layouts.app')

@section('content')

{{-- HEADER --}}
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon">
                            <i data-feather="activity"></i>
                        </div>
                        Log Aktivitas
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">

                        @if(request()->has('tanggal_awal') && request()->has('tanggal_akhir'))

                        <a class="btn btn-sm btn-light text-success"
                            href="{{ route('log.exportExcel', [
                    'tanggal_awal' => request('tanggal_awal'),
                    'tanggal_akhir' => request('tanggal_akhir')
               ]) }}">

                            <i class="me-1" data-feather="download"></i>
                            Export Excel

                        </a>

                        @endif

                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">

            {{-- FILTER --}}
            <form method="GET" action="{{ route('log.index') }}">

                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">

                        <div class="col-md-4">
                            <label class="form-label">Tanggal Awal</label>
                            <input type="date"
                                name="tanggal_awal"
                                class="form-control"
                                value="{{ $tanggal_awal }}">
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Tanggal Akhir</label>
                            <input type="date"
                                name="tanggal_akhir"
                                class="form-control"
                                value="{{ $tanggal_akhir }}">
                        </div>

                        <div class="col-md-4">
                            <button type="submit" class="btn btn-primary">
                                <i data-feather="search" class="me-1"></i>
                                Tampilkan
                            </button>
                        </div>

                    </div>
                </div>

            </form>

            {{-- TABLE (ONLY SHOW AFTER CLICK TAMPILKAN) --}}
            @if(request()->has('tanggal_awal') || request()->has('tanggal_akhir'))

            <div class="table-responsive">
                <table id="datatablesSimple" class="table table-bordered table-hover">

                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>NIP</th>
                            <th>Nama</th>
                            <th>Module</th>
                            <th>Action</th>
                            <th>Description</th>
                        </tr>
                    </thead>

                    <tbody>
                        @forelse($logs as $log)
                        <tr>
                            <td>{{ $log->created_at->format('d-m-Y H:i:s') }}</td>
                            <td>{{ $log->user->username ?? '-' }}</td>
                            <td>{{ $log->user->nama ?? '-' }}</td>
                            <td>{{ $log->module }}</td>
                            <td>{{ $log->action }}</td>
                            <td>{{ \Illuminate\Support\Str::limit($log->description, 150) }}</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center">
                                Tidak ada data log
                            </td>
                        </tr>
                        @endforelse
                    </tbody>

                </table>
            </div>

            @else

            <div class="alert alert-info mt-3">
                Silakan pilih tanggal awal dan akhir lalu klik <b>Tampilkan</b> untuk melihat log aktivitas.
            </div>

            @endif

        </div>
    </div>
</div>

{{-- SCRIPT --}}
<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>

<script>

</script>

@endsection