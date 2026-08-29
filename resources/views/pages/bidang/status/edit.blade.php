@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/tiket.css') }}">
@endpush

@section('content')
{{-- MODAL KONFIRMASI SIMPAN --}}
<div class="modal fade" id="modalSimpan" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Konfirmasi Perubahan Status</h5>
                <button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                Apakah Anda yakin ingin menyimpan perubahan data status ini?
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="x" class="me-1"></i>
                    Batal
                </button>
                <button class="btn btn-primary" type="button" id="confirmSimpan">
                    <span class="btn-text d-inline-flex align-items-center">
                        <i data-feather="save" class="me-1"></i>
                        Ya, Simpan
                    </span>
                    <span class="btn-loading d-none d-inline-flex align-items-center">
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
                        <div class="page-header-icon">
                            <i data-feather="edit"></i>
                        </div>
                        Update Data Status
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
    <div class="row">
        <div class="col-lg-8">
            <div class="card summary-info-card border shadow-none mb-4">
                <div class="card-header py-2 px-3 fw-bold small d-flex align-items-center">
                    <i data-feather="layers" class="me-2 text-primary" style="width: 16px; height: 16px;"></i>
                    Formulir Update Status Layanan
                </div>
                <div class="card-body p-4">
                    <form id="formRegister"
                        method="POST"
                        action="{{ route('adminBidang.status.updateBidang', $status->id) }}">
                        @csrf
                        @method('PUT')

                        {{-- BIDANG --}}
                        <div class="mb-3">
                            <label class="form-label fw-semibold small mb-1">Bidang Layanan</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i data-feather="grid" style="width: 16px; height: 16px;"></i>
                                </span>
                                <input class="form-control"
                                    value="{{ $status->layanan->bidang->nama_bidang }}"
                                    disabled>
                            </div>
                        </div>

                        {{-- LAYANAN --}}
                        <div class="mb-3">
                            <label class="form-label fw-semibold small mb-1">Nama Layanan</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i data-feather="file-text" style="width: 16px; height: 16px;"></i>
                                </span>
                                <input
                                    type="text"
                                    class="form-control"
                                    value="{{ $status->layanan->nama_layanan }}"
                                    disabled>
                            </div>
                        </div>

                        {{-- NAMA STATUS --}}
                        <div class="mb-4">
                            <label class="form-label fw-semibold small mb-1">Nama Status <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i data-feather="tag" style="width: 16px; height: 16px;"></i>
                                </span>
                                <input class="form-control" name="status" type="text"
                                    value="{{ old('status', $status->status) }}" placeholder="Contoh: Proses Validasi, Selesai..." required>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 pt-3 border-top wizard-actions-end">
                            <a href="{{ url()->previous() }}" class="btn btn-outline-secondary px-4 d-inline-flex align-items-center">
                                <i data-feather="arrow-left" class="me-2"></i>
                                Batal
                            </a>
                            <button class="btn btn-primary px-4 d-inline-flex align-items-center" type="button" id="btnTambah">
                                <i data-feather="save" class="me-2"></i>
                                Update Status
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        if (window.feather) {
            feather.replace();
        }

        const form = document.getElementById('formRegister');
        const btnTambah = document.getElementById('btnTambah');
        const modalEl = document.getElementById('modalSimpan');
        const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
        const btnSimpan = document.getElementById('confirmSimpan');

        if (btnTambah && form) {
            btnTambah.addEventListener('click', function() {
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                if (modal) {
                    modal.show();
                }
            });
        }

        if (btnSimpan && form) {
            btnSimpan.addEventListener('click', function() {
                btnSimpan.disabled = true;
                const btnText = btnSimpan.querySelector('.btn-text');
                const btnLoading = btnSimpan.querySelector('.btn-loading');

                if (btnText) btnText.classList.add('d-none');
                if (btnLoading) btnLoading.classList.remove('d-none');

                form.submit();
            });
        }
    });
</script>
@endsection