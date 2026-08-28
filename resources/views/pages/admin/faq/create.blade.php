@extends('layouts.app')

@section('content')
    <!-- Modal -->
    <div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalCenterTitle">Simpan FAQ</h5>
                    <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">Apakah anda yakin menyimpan FAQ ini?</div>
                <div class="modal-footer">
                    <button class="btn btn-light" type="button" data-bs-dismiss="modal">
                        <i data-feather="arrow-left" class="me-1"></i> Batal
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
                            <div class="page-header-icon"><i data-feather="plus-circle"></i></div>
                            Tambah FAQ
                        </h1>
                    </div>
                    <div class="col-12 col-xl-auto mb-3">
                        <a class="btn btn-sm btn-light text-primary" href="{{ route('root.faq.index') }}">
                            <i class="me-1" data-feather="arrow-left"></i>
                            Kembali ke List FAQ
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
                <div class="card mb-4">
                    <div class="card-header bg-gradient-primary-to-secondary text-white">Detail FAQ</div>
                    <div class="card-body">
                        <form id="formRegister" method="POST" action="{{ route('root.faq.store') }}">
                            @csrf

                            <div class="mb-3">
                                <label class="small mb-1" for="pertanyaan">Pertanyaan</label>
                                @error('pertanyaan')
                                    <div class="text-danger mb-1">{{ $message }}</div>
                                @enderror
                                <input class="form-control @error('pertanyaan') is-invalid @enderror" id="pertanyaan"
                                    name="pertanyaan" type="text" placeholder="Masukkan pertanyaan FAQ"
                                    value="{{ old('pertanyaan') }}" required />
                            </div>

                            <div class="mb-3">
                                <label class="small mb-1" for="jawaban">Jawaban</label>
                                @error('jawaban')
                                    <div class="text-danger mb-1">{{ $message }}</div>
                                @enderror
                                <textarea class="form-control @error('jawaban') is-invalid @enderror" id="jawaban"
                                    name="jawaban" rows="5" placeholder="Masukkan jawaban FAQ" required>{{ old('jawaban') }}</textarea>
                            </div>

                            <button class="btn btn-primary" type="button" id="btnTambah">
                                <i data-feather="save" class="me-1"></i> Tambah FAQ
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

            const form = document.getElementById('formRegister');
            const btnTambah = document.getElementById('btnTambah');
            const modalEl = document.getElementById('modalSimpan');
            const confirmSimpan = document.getElementById('confirmSimpan');

            btnTambah.addEventListener('click', function() {

                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            });

            confirmSimpan.addEventListener('click', function() {
                confirmSimpan.disabled = true;
                confirmSimpan.querySelector('.btn-text')?.classList.add('d-none');
                confirmSimpan.querySelector('.btn-loading')?.classList.remove('d-none');
                form.submit();
            });

        });
    </script>
@endsection
