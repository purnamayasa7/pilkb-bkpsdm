@extends('layouts.app')

@section('content')
<!-- Modal -->
<div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Simpan Data Syarat</h5>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">Apakah anda yakin menyimpan data syarat ini?</div>
            <div class="modal-footer">
                <button class="btn btn-light" type="button"
                    data-bs-dismiss="modal">
                    <i data-feather="x" class="me-1"></i>
                    Batal
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
                        <div class="page-header-icon"><i data-feather="plus-circle"></i></div>
                        Tambah Syarat
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                        <i class="me-1" data-feather="arrow-left"></i>
                        Kembali ke List Syarat
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="row">
        <div class="col-12">
            <div class="card mb-4">
                <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Syarat</div>
                <div class="card-body">
                    <form id="formRegister" action="{{ route('adminBidang.syarat.storeBidang') }}" method="POST">
                        @csrf

                        <div class="mb-3">
                            <label class="small mb-1">Bidang</label>

                            <input
                                type="text"
                                class="form-control"
                                value="{{ $bidang->nama_bidang }}"
                                disabled>

                            <input
                                type="hidden"
                                name="kode_bidang"
                                value="{{ $bidang->id }}">
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1">Layanan</label>

                            <select
                                id="layananSelect"
                                name="kode_layanan"
                                class="form-select"
                                required>

                                <option value="">Pilih Layanan</option>

                                @foreach($layanan as $item)
                                <option value="{{ $item->id }}">
                                    {{ $item->nama_layanan }}
                                </option>
                                @endforeach

                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1">Syarat</label>
                            <textarea name="syarat" class="form-control" rows="3" required></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1">Metode Dokumen</label>

                            <select
                                name="metode"
                                id="metode"
                                class="form-select"
                                required>

                                <option value="simpeg">SIMPEG</option>
                                <option value="upload">Upload PILKB</option>

                            </select>
                        </div>

                        <div class="mb-3" id="efileGroup">
                            <label class="small mb-1">Jenis E-File SIMPEG</label>

                            <select
                                name="kode_efile"
                                id="kode_efile"
                                class="form-select">

                                <option value="">Pilih Jenis E-File</option>

                                @foreach ($syaratEfile as $item)
                                <option value="{{ $item->efile }}">
                                    {{ $item->syarat }}
                                </option>
                                @endforeach

                            </select>

                            <div class="form-text">
                                Pilih jenis dokumen yang sesuai dengan jenis e-file pada SIMPEG.
                            </div>
                        </div>

                        <button class="btn btn-primary" type="button" id="btnTambah">
                            <i data-feather="save" class="me-1"></i>
                            Simpan Syarat
                        </button>

                    </form>

                </div>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {

        const form = document.getElementById('formRegister');
        const btnTambah = document.getElementById('btnTambah');
        const modalEl = document.getElementById('modalSimpan');
        const btnSimpan = document.getElementById('confirmSimpan');

        const metode = document.getElementById('metode');

        const efileGroup = document.getElementById('efileGroup');
        const kodeEfile = document.getElementById('kode_efile');

        /**
         * Tampilkan / sembunyikan field berdasarkan metode
         */
        function toggleMetode() {

            if (metode.value === 'simpeg') {

                efileGroup.style.display = '';
                kodeEfile.required = true;

            } else {

                efileGroup.style.display = 'none';
                kodeEfile.required = false;
                kodeEfile.value = '';
            }
        }

        /**
         * Jalankan saat halaman pertama dibuka
         */
        toggleMetode();

        /**
         * Jalankan ketika metode berubah
         */
        metode.addEventListener('change', toggleMetode);

        /**
         * Tombol Simpan
         */
        btnTambah.addEventListener('click', function() {

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        });

        /**
         * Konfirmasi Simpan
         */
        btnSimpan.addEventListener('click', function() {

            btnSimpan.disabled = true;

            btnSimpan.querySelector('.btn-text').classList.add('d-none');
            btnSimpan.querySelector('.btn-loading').classList.remove('d-none');

            form.submit();
        });


    });
</script>
@endsection