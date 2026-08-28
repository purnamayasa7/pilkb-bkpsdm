 @extends('layouts.app')

 @section('content')
 <!-- Modal -->
<div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Edit Data Syarat</h5>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">Apakah anda yakin menyimpan perubahan syarat ini?</div>
            <div class="modal-footer">
                <button class="btn btn-light" type="button" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i> Kembali
                </button>
                <button class="btn btn-primary" type="button" id="confirmSimpan">
                    <span class="btn-text">
                        <i data-feather="save" class="me-1"></i> Simpan
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
                        Update Syarat
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
<!-- Main page content-->
<div class="container-fluid px-4 mt-4">
    <div class="row">
        <div class="col-12">
            <!-- Account details card-->
            <div class="card mb-4">
                <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Syarat</div>
                <div class="card-body">
                    <form id="formUpdate" method="POST" action="{{ route('root.syarat.update', $syarat->id) }}">
                        @csrf
                        @method('PUT')
                        <div class="mb-3">
                            <label class="small mb-1">Bidang</label>
                            <input class="form-control" value="{{ $syarat->layanan->bidang->nama_bidang }}" disabled>
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1" for="nama_layanan">Nama Layanan</label>
                            <input class="form-control" id="nama_layanan" name="nama_layanan" type="text"
                                value="{{ $syarat->layanan->nama_layanan }}" disabled />
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1" for="syarat">Syarat</label>
                            <input class="form-control" id="syarat" name="syarat" type="text"
                                value="{{ old('syarat', $syarat->syarat )}}" required />
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1">Metode e-file</label>
                            <select name="metode" id="metode" class="form-select" required>
                                <option value="simpeg"
                                    {{ old('metode', $syarat->metode) == 'simpeg' ? 'selected' : '' }}>
                                    SIMPEG
                                </option>

                                <option value="upload"
                                    {{ old('metode', $syarat->metode) == 'upload' ? 'selected' : '' }}>
                                    Upload
                                </option>
                            </select>
                        </div>

                        <!-- Jenis E-File -->
                        <div class="mb-3" id="efileGroup">
                            <label class="small mb-1">Jenis E-File</label>

                            <select
                                name="kode_efile"
                                id="kode_efile"
                                class="form-select">

                                <option value="">Pilih Jenis E-File</option>

                                @foreach ($syaratEfile as $item)
                                <option value="{{ $item->efile }}"
                                    {{ old('kode_efile', $syarat->kode_efile) == $item->efile ? 'selected' : '' }}>
                                    {{ $item->syarat }}
                                </option>
                                @endforeach

                            </select>

                            <div class="form-text">
                                Pilih jenis dokumen yang sesuai dengan jenis e-file pada SIMPEG.
                            </div>
                        </div>

                        <button class="btn btn-primary" type="button" id="btnUpdate">
                            <i data-feather="save" class="me-1"></i> Update Syarat
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        // ==========================================
        // Element
        // ==========================================

        const form = document.getElementById('formUpdate');
        const btnUpdate = document.getElementById('btnUpdate');
        const modalEl = document.getElementById('modalSimpan');
        const confirmSimpan = document.getElementById('confirmSimpan');

        const metode = document.getElementById('metode');

        // Jenis E-File
        const efileGroup = document.getElementById('efileGroup');
        const kodeEfile = document.getElementById('kode_efile');

        // ==========================================
        // Tampilkan / Sembunyikan Field SIMPEG
        // ==========================================

        function toggleMetode() {

            if (metode.value === 'simpeg') {

                // Tampilkan Jenis E-File
                efileGroup.style.display = '';
                kodeEfile.required = true;

            } else {

                // Sembunyikan Jenis E-File
                efileGroup.style.display = 'none';

                // Tidak wajib
                kodeEfile.required = false;

                // Bersihkan nilai
                kodeEfile.value = '';
            }
        }

        // ==========================================
        // Jalankan Saat Halaman Dibuka
        // ==========================================

        toggleMetode();


        // ==========================================
        // Jalankan Saat Metode Berubah
        // ==========================================

        metode.addEventListener('change', function() {

            toggleMetode();

        });


        // ==========================================
        // Tombol Update
        // ==========================================

        btnUpdate.addEventListener('click', function() {

            // Validasi HTML5
            if (!form.checkValidity()) {

                form.reportValidity();

                return;
            }


            // Tampilkan modal konfirmasi
            const modal = new bootstrap.Modal(modalEl);

            modal.show();

        });


        // ==========================================
        // Konfirmasi Update
        // ==========================================

        confirmSimpan.addEventListener('click', function() {

            // Cegah klik berkali-kali
            confirmSimpan.disabled = true;
            confirmSimpan.querySelector('.btn-text')?.classList.add('d-none');
            confirmSimpan.querySelector('.btn-loading')?.classList.remove('d-none');

            // Submit form
            form.submit();

        });

    });
</script>
@endsection