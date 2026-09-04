@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="shuffle"></i></div>
                        Pindah Layanan Tiket
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ route('adminBawah.pindah.indexPindah') }}">
                        <i class="me-1" data-feather="arrow-left"></i>
                        Kembali
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <!-- Alert Container untuk validasi form -->
            <div id="alertContainer" class="d-none alert alert-danger alert-dismissible fade show" role="alert">
                <i data-feather="alert-circle" class="me-1"></i>
                <span id="alertMessage">Semua syarat wajib dicentang terlebih dahulu.</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>

            <form id="formPindah" method="POST"
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
                                {{ $b->id == optional($tiket->layanan)->kode_bidang ? 'selected' : '' }}>
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
                                        <th width="120" class="text-center">Validasi</th>
                                    </tr>
                                </thead>

                                <tbody id="syaratTable">

                                    @forelse($syarat as $i => $s)
                                    <tr>
                                        <td>{{ $i + 1 }}</td>

                                        <td>{{ $s->syarat }}</td>

                                        <td class="text-center">

                                            <input
                                                type="checkbox"
                                                class="form-check-input syarat-check"
                                                name="syarat_id[]"
                                                value="{{ $s->id }}">
                                        </td>

                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="3" class="text-center text-muted">
                                            Tidak ada syarat untuk layanan ini
                                        </td>
                                    </tr>
                                    @endforelse

                                </tbody>

                            </table>

                        </div>
                    </div>
                </div>

                <div class="text-end mt-3">

                    <button
                        type="submit"
                        class="btn btn-primary"
                        id="btnSubmitPindah">

                        <span class="btn-text">
                            <i data-feather="save" class="me-1"></i> Simpan Perubahan
                        </span>
                        <span class="btn-loading d-none">
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Menyimpan...
                        </span>
                    </button>

                </div>

            </form>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        const bidangSelect = document.getElementById('bidang');
        const layananSelect = document.getElementById('layanan');
        const syaratTable = document.getElementById('syaratTable');
        const alertContainer = document.getElementById('alertContainer');
        const alertMessage = document.getElementById('alertMessage');

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
                                        class="form-check-input syarat-check"
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
                    } else {
                        syaratTable.innerHTML = `
                            <tr>
                                <td colspan="3" class="text-center text-muted">
                                    Tidak ada layanan pada bidang ini
                                </td>
                            </tr>
                        `;
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

                if (checkboxes.length === 0) {
                    e.preventDefault();
                    if (alertContainer && alertMessage) {
                        alertMessage.innerText = 'Layanan ini tidak memiliki syarat atau belum dimuat.';
                        alertContainer.classList.remove('d-none');
                        alertContainer.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        alert('Layanan ini tidak memiliki syarat atau belum dimuat.');
                    }
                    return false;
                }

                let semuaCentang = true;

                checkboxes.forEach(item => {

                    if (!item.checked) {
                        semuaCentang = false;
                    }

                });

                if (!semuaCentang) {

                    e.preventDefault();

                    if (alertContainer && alertMessage) {
                        alertMessage.innerText = 'Semua syarat wajib dicentang terlebih dahulu.';
                        alertContainer.classList.remove('d-none');
                        alertContainer.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        alert('Semua syarat wajib dicentang terlebih dahulu.');
                    }

                    return false;
                }

                if (alertContainer) {
                    alertContainer.classList.add('d-none');
                }

                const btnSubmitPindah = document.getElementById('btnSubmitPindah');
                btnSubmitPindah.disabled = true;
                btnSubmitPindah.querySelector('.btn-text')?.classList.add('d-none');
                btnSubmitPindah.querySelector('.btn-loading')?.classList.remove('d-none');
            });
    });
</script>
@endsection