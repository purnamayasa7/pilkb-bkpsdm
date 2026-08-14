@extends('layouts.app')

@section('content')
<div class="modal fade" id="modalSimpan" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Data Status</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                Apakah anda yakin menyimpan perubahan status ini?
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i>
                    Kembali
                </button>
                <button class="btn btn-primary" type="button" id="confirmSimpan">
                    <span class="btn-text">
                        <i data-feather="save" class="me-1"></i>
                        Simpan
                    </span>

                    <span class="btn-loading d-none">
                        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Menyimpan...
                    </span>
                </button>
            </div>
        </div>
    </div>
</div>

<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="edit"></i></div>
                        Update Status
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                        <i class="me-1" data-feather="arrow-left"></i>
                        Kembali ke List Status
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card mb-4">
        <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Status</div>
        <div class="card-body">
            <form
                id="formUpdate"
                method="POST"
                action="{{ route('root.status.update', $status->id) }}">

                @csrf
                @method('PUT')


                <!-- Bidang -->
                <div class="mb-3">

                    <label class="small mb-1">
                        Bidang
                    </label>

                    <input
                        type="text"
                        class="form-control"
                        value="{{ optional($status->layanan->bidang)->nama_bidang ?? '-' }}"
                        disabled>

                </div>


                <!-- Layanan -->
                <div class="mb-3">

                    <label class="small mb-1">
                        Layanan
                    </label>

                    <input
                        type="text"
                        class="form-control"
                        value="{{ optional($status->layanan)->nama_layanan ?? '-' }}"
                        disabled>

                </div>


                <!-- Status -->
                <div class="mb-3">

                    <label
                        class="small mb-1"
                        for="status">

                        Status

                    </label>

                    @error('status')
                    <div class="text-danger mb-1">
                        {{ $message }}
                    </div>
                    @enderror

                    <input
                        class="form-control @error('status') is-invalid @enderror"
                        id="status"
                        name="status"
                        type="text"
                        value="{{ old('status', $status->status) }}"
                        placeholder="Masukkan status"
                        required>

                </div>


                <!-- Button -->
                <button
                    class="btn btn-primary"
                    type="button"
                    id="btnUpdate">

                    <i
                        data-feather="save"
                        class="me-1">
                    </i>

                    Update Status

                </button>

            </form>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {

        const form = document.getElementById('formUpdate');
        const btnUpdate = document.getElementById('btnUpdate');
        const modalEl = document.getElementById('modalSimpan');
        const btnSimpan = document.getElementById('confirmSimpan');

        /*
        |--------------------------------------------------------------------------
        | Tombol Update
        |--------------------------------------------------------------------------
        */

        btnUpdate.addEventListener('click', function() {

            // Validasi HTML5
            if (!form.checkValidity()) {

                form.reportValidity();

                return;
            }

            const modal = new bootstrap.Modal(modalEl);

            modal.show();

        });


        /*
        |--------------------------------------------------------------------------
        | Konfirmasi Simpan
        |--------------------------------------------------------------------------
        */

        btnSimpan.addEventListener('click', function() {

            // Cegah double submit
            btnSimpan.disabled = true;

            // Tampilkan loading
            btnSimpan
                .querySelector('.btn-text')
                .classList.add('d-none');

            btnSimpan
                .querySelector('.btn-loading')
                .classList.remove('d-none');

            // Submit form
            form.submit();

        });

    });
</script>


@endsection