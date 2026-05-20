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
                    <div class="col-12 col-xl-auto mb-3">
                        <div class="btn-group">
                            <a class="btn btn-sm btn-light text-success"
                                href="{{ route('adminBawah.cetakSyarat.export', [
                                    'bidang' => $bidangId,
                                    'layanan' => $layananId,
                                ]) }}"
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
                <form method="GET" action="{{ route('adminBawah.cetakSyarat.indexCetakAdminBawah') }}" id="filterForm"
                    class="mb-3">
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

                            {{-- @if ($layananId)
                                <div class="col-md-4">
                                    <a href="{{ route('adminBawah.cetakSyarat.export', [
                                        'bidang' => $bidangId,
                                        'layanan' => $layananId,
                                    ]) }}"
                                        target="_blank" class="btn btn-primary">
                                        <i data-feather="download" class="me-1"></i> Export PDF
                                    </a>
                                </div>
                            @endif --}}

                        </div>
                    </div>
                </form>
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

    <script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
    <script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {

            feather.replace();

            const bidangSelect = document.getElementById('bidangSelect');
            const layananSelect = document.getElementById('layananSelect');

            // Cegah error jika element tidak ditemukan
            if (!bidangSelect || !layananSelect) {
                return;
            }

            let selectedLayanan = "{{ request('layanan') ?? '' }}";

            function loadLayanan(bidangId) {

                layananSelect.innerHTML = `
            <option selected disabled>
                Loading...
            </option>
        `;

                layananSelect.disabled = true;

                fetch(`/adminBawah/get-layanan-syarat/${bidangId}`)
                    .then(response => response.json())
                    .then(data => {

                        layananSelect.innerHTML = '';

                        const defaultOption = document.createElement('option');

                        defaultOption.value = '';
                        defaultOption.textContent = 'Pilih Layanan';

                        layananSelect.appendChild(defaultOption);

                        // JIKA TIDAK ADA DATA
                        if (data.length === 0) {
                            const emptyOption = document.createElement('option');

                            emptyOption.disabled = true;
                            emptyOption.textContent = 'Tidak ada layanan';

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
                    .catch(error => {
                        console.error(error);
                        layananSelect.innerHTML = `
                    <option selected disabled>
                        Gagal load data
                    </option>
                `;
                        layananSelect.disabled = false;
                    });
            }

            // LOAD PERTAMA
            if (bidangSelect.value) {
                loadLayanan(bidangSelect.value);
            }

            // GANTI BIDANG
            bidangSelect.addEventListener('change', function() {
                selectedLayanan = '';
                loadLayanan(this.value);
            });
        });
    </script>
@endsection
