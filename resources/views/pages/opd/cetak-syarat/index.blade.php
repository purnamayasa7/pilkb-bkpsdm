@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="file-text"></i></div>
                        Cetak Syarat
                    </h1>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminOpd.cetakSyarat.index') }}" id="filterForm" class="mb-3">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">

                        <!-- BIDANG -->
                        <div class="col-md-4">
                            <label class="form-label">Bidang</label>
                            <select name="bidang" id="bidangSelect" class="form-select">
                                @foreach ($bidang as $b)
                                <option value="{{ $b->id }}" {{ $bidangId == $b->id ? 'selected' : '' }}>
                                    {{ $b->nama_bidang }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <!-- LAYANAN -->
                        <div class="col-md-4">
                            <label class="form-label">Layanan</label>
                            <select name="layanan" id="layananSelect" class="form-select">
                                <option value="" disabled selected>Pilih Layanan</option>
                            </select>
                        </div>

                        @if ($layananId)
                        <div class="col-md-4">
                            <a href="{{ route('adminOpd.cetakSyarat.export', [
                                        'bidang' => $bidangId,
                                        'layanan' => $layananId,
                                    ]) }}" target="_blank"
                                class="btn btn-primary">
                                <i data-feather="download" class="me-1"></i> Export PDF
                            </a>
                        </div>
                        @endif

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
                            <th>Nama Layanan</th>
                            <th>Syarat</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Syarat</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        @foreach ($syarat as $item)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>
                                {{ $item->layanan->nama_layanan ?? '-' }}
                            </td>
                            <td>{{ $item->syarat }}</td>
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

        let selectedLayanan = "{{ request('layanan') ?? '' }}";

        function loadLayanan(bidangId) {

            layananSelect.innerHTML = '';
            layananSelect.disabled = true;

            const loadingOption = document.createElement('option');
            loadingOption.textContent = 'Loading...';
            loadingOption.disabled = true;
            loadingOption.selected = true;
            layananSelect.appendChild(loadingOption);

            fetch(`/adminOpd/get-layanan-syarat/${bidangId}`)
                .then(res => res.json())
                .then(data => {

                    layananSelect.innerHTML = '';

                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Pilih Layanan';
                    defaultOption.selected = !selectedLayanan;
                    layananSelect.appendChild(defaultOption);

                    if (data.length === 0) {
                        const emptyOption = document.createElement('option');
                        emptyOption.textContent = 'Tidak ada layanan';
                        emptyOption.disabled = true;
                        layananSelect.appendChild(emptyOption);
                    } else {
                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = item.id;
                            option.textContent = item.nama_layanan;

                            if (item.id == selectedLayanan) {
                                option.selected = true;
                            }

                            layananSelect.appendChild(option);
                        });
                    }

                    layananSelect.disabled = false;
                })
                .catch(() => {
                    layananSelect.innerHTML = '';

                    const errorOption = document.createElement('option');
                    errorOption.textContent = 'Gagal load data';
                    errorOption.disabled = true;
                    layananSelect.appendChild(errorOption);

                    layananSelect.disabled = false;
                });
        }

        loadLayanan(bidangSelect.value);

        bidangSelect.addEventListener('change', function() {
            selectedLayanan = '';
            loadLayanan(this.value);
        });

        layananSelect.addEventListener('change', function() {
            if (this.value !== '') {
                document.getElementById('filterForm').submit();
            }
        });

    });
</script>
@endsection