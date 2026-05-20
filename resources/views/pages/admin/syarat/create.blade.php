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
                <div class="modal-footer"><button class="btn btn-light" type="button"
                        data-bs-dismiss="modal">Batal</button><button class="btn btn-primary" type="button"
                        id="confirmSimpan">Simpan</button></div>
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
                        <form id="formRegister" action="{{ route('root.syarat.store') }}" method="POST">
                            @csrf

                            <div class="mb-3">
                                <label class="small mb-1">Bidang</label>
                                <select id="bidangSelect" name="kode_bidang" class="form-select">
                                    @foreach ($bidang as $b)
                                        <option value="{{ $b->id }}" {{ $bidangId == $b->id ? 'selected' : '' }}>
                                            {{ $b->nama_bidang }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="small mb-1">Layanan</label>
                                <select id="layananSelect" name="kode_layanan" class="form-select" required>
                                    <option value="">Pilih Layanan</option>

                                    @foreach ($layanan as $l)
                                        <option value="{{ $l->id }}">
                                            {{ $l->nama_layanan }}
                                        </option>
                                    @endforeach

                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="small mb-1">Syarat</label>
                                <textarea name="syarat" class="form-control" rows="3" required></textarea>
                            </div>

                            <button class="btn btn-primary" type="button" id="btnTambah">
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
            const bidangSelect = document.getElementById('bidangSelect');
            const layananSelect = document.getElementById('layananSelect');

            btnTambah.addEventListener('click', function() {

                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            });

            document.getElementById('confirmSimpan').addEventListener('click', function() {
                form.submit();
            });

            function loadLayanan(bidangId) {

                if (!bidangId) {
                    layananSelect.innerHTML = `<option value="">Pilih Bidang terlebih dahulu</option>`;
                    return;
                }

                layananSelect.innerHTML = `<option value="">Loading...</option>`;

                fetch(`/root/get-layanan-syarat/${bidangId}`)
                    .then(res => res.json())
                    .then(data => {

                        layananSelect.innerHTML = `<option value="">Pilih Layanan</option>`;

                        if (data.length === 0) {
                            layananSelect.innerHTML = `<option value="">Tidak ada layanan</option>`;
                            return;
                        }

                        data.forEach(item => {
                            layananSelect.innerHTML += `
                    <option value="${item.id}">
                        ${item.nama_layanan}
                    </option>
                `;
                        });

                    })
                    .catch(() => {
                        layananSelect.innerHTML = `<option value="">Gagal load data</option>`;
                    });
            }

            // load awal
            loadLayanan(bidangSelect.value);

            // ganti bidang
            bidangSelect.addEventListener('change', function() {
                layananSelect.innerHTML = `<option value="">Pilih Layanan</option>`;
                loadLayanan(this.value);
            });

        });
    </script>
@endsection
