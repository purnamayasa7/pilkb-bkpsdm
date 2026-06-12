@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="shuffle"></i></div>
                        Edit Data Tiket
                    </h1>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="POST"
                action="{{ route('adminBawah.pindah.updatePindah', $tiket->no_tiket) }}">

                @csrf

                <div class="row mb-3">

                    <div class="col-md-6">
                        <label class="form-label">
                            No Tiket
                        </label>

                        <input type="text"
                            class="form-control"
                            value="{{ $tiket->no_tiket }}"
                            readonly>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">
                            NIP
                        </label>

                        <input type="text"
                            class="form-control"
                            value="{{ $tiket->nip }}"
                            readonly>
                    </div>

                </div>

                <div class="row mb-3">

                    <div class="col-md-6">
                        <label class="form-label">
                            Bidang
                        </label>

                        <select
                            class="form-select"
                            id="bidang">

                            @foreach ($bidang as $b)
                            <option
                                value="{{ $b->id }}"
                                {{ $b->id == $tiket->layanan->kode_bidang ? 'selected' : '' }}>
                                {{ $b->nama_bidang }}
                            </option>
                            @endforeach

                        </select>
                    </div>

                    <div class="col-md-6">

                        <label class="form-label">
                            Layanan
                        </label>

                        <select
                            name="kode_layanan"
                            id="layanan"
                            class="form-select">

                            @foreach ($layanan as $l)
                            <option
                                value="{{ $l->id }}"
                                {{ $l->id == $tiket->kode_layanan ? 'selected' : '' }}>
                                {{ $l->nama_layanan }}
                            </option>
                            @endforeach

                        </select>

                    </div>

                </div>

                <div class="card mt-4">
                    <div class="card-header">
                        Syarat Layanan
                    </div>

                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th width="50">No</th>
                                        <th>Syarat</th>
                                        <th width="120">Validasi</th>
                                    </tr>
                                </thead>

                                <tbody id="syaratTable">

                                    @foreach($syarat as $i => $s)
                                    <tr>
                                        <td>{{ $i + 1 }}</td>

                                        <td>{{ $s->syarat }}</td>

                                        <td class="text-center">

                                            <input
                                                type="checkbox"
                                                class="syarat-check"
                                                name="syarat_id[]"
                                                value="{{ $s->id }}">
                                        </td>

                                    </tr>
                                    @endforeach

                                </tbody>

                            </table>

                        </div>
                    </div>
                </div>

                <div class="text-end mt-3">

                    <button
                        type="submit"
                        class="btn btn-primary">

                        <i data-feather="save"></i>
                        Simpan Perubahan
                    </button>

                </div>

            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        const bidangSelect = document.getElementById('bidang');
        const layananSelect = document.getElementById('layanan');
        const syaratTable = document.getElementById('syaratTable');

        function loadSyarat(kodeLayanan) {

            fetch(
                    "{{ route('adminBawah.pindah.getSyarat', ':id') }}"
                    .replace(':id', kodeLayanan)
                )
                .then(res => res.json())
                .then(data => {

                    let html = '';

                    if (data.length === 0) {

                        html = `
                        <tr>
                            <td colspan="3" class="text-center text-muted">
                                Tidak ada syarat
                            </td>
                        </tr>
                    `;
                    } else {
                        data.forEach((item, index) => {
                            html += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.syarat}</td>
                                <td class="text-center">
                                    <input
                                        type="checkbox"
                                        name="syarat_id[]"
                                        value="${item.id}"
                                        >
                                </td>
                            </tr>
                        `;
                        });
                    }
                    syaratTable.innerHTML = html;
                })
                .catch(err => {
                    console.error(err);
                    syaratTable.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-danger text-center">
                            Gagal memuat syarat
                        </td>
                    </tr>
                `;
                });
        }


        bidangSelect.addEventListener('change', function() {

            let bidang = this.value;

            fetch(
                    "{{ route('adminBawah.pindah.getLayanan', ':id') }}"
                    .replace(':id', bidang)
                )
                .then(res => res.json())
                .then(data => {

                    let html = '';

                    data.forEach(item => {

                        html += `
                        <option value="${item.id}">
                            ${item.nama_layanan}
                        </option>
                    `;

                    });

                    layananSelect.innerHTML = html;

                    if (data.length > 0) {
                        loadSyarat(data[0].id);
                    }

                })
                .catch(err => {
                    console.error(err);
                });

        });


        layananSelect.addEventListener('change', function() {
            loadSyarat(this.value);
        });

        document.getElementById('formPindah')
            .addEventListener('submit', function(e) {

                const checkboxes =
                    document.querySelectorAll('.syarat-check');

                let semuaCentang = true;

                checkboxes.forEach(item => {

                    if (!item.checked) {
                        semuaCentang = false;
                    }

                });

                if (!semuaCentang) {

                    e.preventDefault();

                    Swal.fire({
                        icon: 'warning',
                        title: 'Validasi gagal',
                        text: 'Semua syarat wajib dicentang terlebih dahulu.'
                    });

                    return false;
                }

            });
    });
</script>
@endsection