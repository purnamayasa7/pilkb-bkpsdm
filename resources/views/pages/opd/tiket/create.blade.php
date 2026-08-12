@extends('layouts.app')

@section('content')

@if (session('error'))
<div class="alert alert-danger">
    {{ session('error') }}
</div>
@endif

@if(session('warning'))
<input type="hidden"
    id="showWarningModal"
    value="1">
@endif

@php
$step = $step ?? 1;
$data = $data ?? [];

$stepTitle = [
1 => 'Masukkan NIP',
2 => 'Pilih Pengajuan Layanan',
3 => 'Checklist Syarat',
4 => 'Tiket Anda Berhasil Dibuat!',
];

$stepHeader = [
1 => 'Tahap 1',
2 => 'Tahap 2',
3 => 'Tahap 3',
4 => 'Tahap 4',
];
@endphp

<style>
    .progress {
        background-color: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
        height: 8px;
    }

    .progress-bar {
        position: relative;
        overflow: hidden;
        transition: width .6s ease;
        background: linear-gradient(90deg,
                #0061f2,
                #3b82f6,
                #4dabf7);
    }

    .progress-bar::after {
        content: "";
        position: absolute;
        top: -40%;
        left: -35%;
        width: 35%;
        height: 180%;

        background: linear-gradient(90deg,
                rgba(255, 255, 255, 0),
                rgba(255, 255, 255, .95),
                rgba(255, 255, 255, 0));

        filter: blur(6px);
        transform: skewX(-25deg);

        animation: shine 2.8s linear infinite;
    }

    @keyframes shine {
        from {
            left: -35%;
        }

        to {
            left: 130%;
        }
    }

    /* ========================================
   E-FILE TABLE
======================================== */

    .efile-cell {
        vertical-align: middle !important;
        text-align: center !important;
    }

    .efile-action {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 60px;
    }

    .efile-action .btn,
    .efile-action .badge {
        margin: 0;
    }

    /* Nama file */
    .efile-filename {
        max-width: 220px;
        word-break: break-word;
        line-height: 1.4;
    }

    /* Status dokumen tersedia */
    .efile-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }

    /* Tombol upload */
    .btn-upload {
        border-color: #f59e0b;
        color: #f59e0b;
        background-color: #fff;
    }

    .btn-upload:hover {
        background-color: #f59e0b;
        color: #fff;
    }

    /* Tombol ganti */
    .btn-ganti {
        border-color: #f59e0b;
        color: #f59e0b;
        background-color: #fff;
    }

    .btn-ganti:hover {
        background-color: #f59e0b;
        color: #fff;
    }
</style>

{{-- Modal Cek Data --}}
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    Detail Pegawai
                </h5>

                <button
                    class="btn-close"
                    data-bs-dismiss="modal">
                </button>
            </div>

            <div class="modal-body">
                <div class="row align-items-start">

                    {{-- FOTO --}}
                    <div class="col-md-3 d-flex justify-content-center ps-md-4">
                        <div class="text-center">
                            <img
                                id="detailFoto"
                                src="{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}"
                                class="shadow rounded-3 border"
                                style="
                                    width:190px;
                                    height:235px;
                                    object-fit:cover;
                                    object-position:center;
                                ">

                            <div class="small mt-3 text-muted">
                                <i>Data pada SIMPEG</i>
                            </div>
                        </div>
                    </div>

                    {{-- DATA --}}
                    <div class="col-md-9">
                        <div class="card border shadow-sm">
                            <div class="card-body">
                                {{-- Header --}}
                                <div class="mb-4">
                                    <div class="small">
                                        Nama Pegawai
                                    </div>

                                    <h4
                                        class="fw-bold text-primary mb-0"
                                        id="detailNama">
                                        -
                                    </h4>
                                </div>

                                {{-- NIP --}}
                                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                                    <span>
                                        <i data-feather="hash" class="me-2 text-danger"></i>
                                        NIP
                                    </span>

                                    <span
                                        id="detailNip"
                                        class="fw-semibold text-end">
                                        -
                                    </span>
                                </div>

                                {{-- Golongan --}}
                                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">

                                    <span>
                                        <i data-feather="award" class="me-2 text-success"></i>
                                        Golongan
                                    </span>

                                    <span
                                        id="detailGol"
                                        class="fw-semibold text-end">
                                        -
                                    </span>
                                </div>

                                {{-- Jabatan --}}
                                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">

                                    <span>
                                        <i data-feather="briefcase" class="me-2 text-secondary"></i>
                                        Jabatan
                                    </span>

                                    <span
                                        id="detailJabatan"
                                        class="fw-semibold text-end">
                                        -
                                    </span>

                                </div>

                                {{-- Unit Kerja --}}
                                <div class="d-flex justify-content-between align-items-center pt-2">

                                    <span>
                                        <i data-feather="home" class="me-2 text-warning"></i>
                                        Unit Kerja
                                    </span>

                                    <span
                                        id="detailUkerja"
                                        class="fw-semibold text-end">
                                        -
                                    </span>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">

                <button
                    class="btn btn-light"
                    type="button"
                    data-bs-dismiss="modal">

                    <i data-feather="x" class="me-1"></i>
                    Batal

                </button>

                <button
                    class="btn btn-primary"
                    type="button"
                    id="confirmSimpan">

                    <i data-feather="check" class="me-1"></i>
                    Pilih Pegawai

                </button>

            </div>

        </div>

    </div>

</div>

{{-- Modal Petunjuk --}}
<div class="modal fade" id="modalPetunjuk" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Petunjuk Pengajuan Layanan</h5>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <div class="d-flex mb-4">
                    <div class="me-3">
                        <span class="badge bg-primary p-3">
                            1
                        </span>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Input NIP</h6>
                        <p class="mb-0">
                            Masukkan NIP, kemudian klik <b>Cek Data</b> untuk memastikan data pegawai ada.
                        </p>
                    </div>
                </div>

                <div class="d-flex mb-4">
                    <div class="me-3">
                        <span class="badge bg-primary p-3">
                            2
                        </span>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Pilih Layanan</h6>
                        <p class="mb-0">
                            Pilih <b>Bidang</b> terlebih dahulu, lalu pilih layanan yang tersedia sesuai kebutuhan.
                        </p>
                    </div>
                </div>

                <div class="d-flex mb-4">
                    <div class="me-3">
                        <span class="badge bg-primary p-3">
                            3
                        </span>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Checklist Syarat & Pengajuan Layanan</h6>
                        <p class="mb-0">
                            Centang semua syarat yang harus dipenuhi. Pastikan dokumen lengkap sebelum melanjutkan,
                            kemudian Ajukan Layanan.
                        </p>
                    </div>
                </div>

                <div class="d-flex">
                    <div class="me-3">
                        <span class="badge bg-primary p-3">
                            4
                        </span>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Cetak Tiket</h6>
                        <p class="mb-0">
                            Simpan atau cetak tiket sebagai bukti pengajuan layanan.
                        </p>
                    </div>
                </div>

                <hr>

                <div class="alert alert-light border">
                    <i data-feather="alert-circle" class="me-2 text-primary"></i>
                    <span class="text-primary">Pastikan semua data dan syarat telah sesuai untuk mempercepat proses
                        layanan.</span>
                </div>

            </div>

            <div class="modal-footer">
                <button class="btn btn-primary" data-bs-dismiss="modal">
                    <i data-feather="check" class="me-1"></i>Mengerti
                </button>
            </div>

        </div>
    </div>
</div>

{{-- Modal Dokumen SIMPEG --}}
<div class="modal fade" id="modalDokumen" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">

            <div class="modal-header">
                <div>
                    <h5 class="modal-title mb-1" id="modalDokumenTitle">
                        Dokumen SIMPEG
                    </h5>

                    <div class="small text-muted" id="modalDokumenSubtitle">
                        -
                    </div>
                </div>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal">
                </button>
            </div>

            <div class="modal-body">

                <div id="dokumenList">
                    {{-- Diisi melalui JavaScript --}}
                </div>

            </div>

            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-light"
                    data-bs-dismiss="modal">

                    <i data-feather="x" class="me-1"></i>
                    Tutup

                </button>
            </div>

        </div>
    </div>
</div>

{{-- Modal Konfirmasi --}}
<div class="modal fade" id="modalKonfirmasi" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Konfirmasi Pengajuan</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                Apakah Anda yakin semua syarat sudah divalidasi dan ingin melanjutkan pembuatan tiket?
            </div>
            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                <button class="btn btn-primary" id="btnSubmitFinal">
                    Ya, Lanjutkan
                </button>
            </div>
        </div>
    </div>
</div>

{{-- Modal Pengajuan Sudah Ada --}}
<div class="modal fade" id="modalPengajuanAda" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header bg-warning">
                <h5 class="modal-title text-white">
                    Pengajuan Masih Diproses
                </h5>

                <button class="btn-close"
                    data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                Data pengajuan usulan dengan NIP dan layanan yang sama
                sudah pernah diajukan dan saat ini masih dalam proses.
            </div>

            <div class="modal-footer">
                <button class="btn btn-primary" data-bs-dismiss="modal">
                    <i data-feather="check" class="me-1"></i>Mengerti
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
                        Pengajuan Layanan - {{ $stepHeader[$step] ?? 'Pengajuan Layanan' }}
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" data-bs-toggle="modal"
                        data-bs-target="#modalPetunjuk">
                        <i class="me-1" data-feather="info"></i>
                        Petunjuk Pengajuan
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">

    {{-- STEP INDICATOR --}}
    <div class="card mb-4">
        <div class="card-header bg-gradient-primary-to-secondary text-white">
            <div class="fw-bold">{{ $stepTitle[$step] ?? 'Pengajuan Layanan' }}</div>
        </div>

        <div class="card-body">
            <div class="d-flex justify-content-between text-center">

                <div class="flex-fill">
                    <div class="{{ $step == 1 ? 'text-primary fw-bold' : ($step > 1 ? 'text-muted' : '') }}">
                        1. NIP
                    </div>
                </div>

                <div class="flex-fill">
                    <div class="{{ $step == 2 ? 'text-primary fw-bold' : ($step > 2 ? 'text-muted' : '') }}">
                        2. Layanan
                    </div>
                </div>

                <div class="flex-fill">
                    <div class="{{ $step == 3 ? 'text-primary fw-bold' : ($step > 3 ? 'text-muted' : '') }}">
                        3. Syarat
                    </div>
                </div>

                <div class="flex-fill">
                    <div class="{{ $step == 4 ? 'text-primary fw-bold' : '' }}">
                        4. Tiket
                    </div>
                </div>

            </div>

            <div class="progress mt-3">

                <div
                    class="progress-bar"
                    style="width: {{ ($step / 4) * 100 }}%">
                </div>

            </div>
        </div>

        <div class="card-body">
            <div class="bg-white p-0 rounded-3 mb-0 border">
                <div class="card-body">

                    {{-- STEP 1 --}}
                    @if ($step == 1)
                    <form method="POST" action="{{ route('adminOpd.tiket.step') }}">
                        @csrf
                        <input type="hidden" name="step" value="1">

                        <div class="row">

                            <!-- NIP -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="small mb-1">NIP</label>
                                    <input type="text" id="nipInput" name="nip" class="form-control"
                                        placeholder="Masukkan NIP">
                                </div>

                                <div id="nipError" class="text-danger small mt-1 d-none">
                                    NIP tidak ditemukan
                                </div>
                            </div>

                            <!-- EMAIL -->
                            <div class="col-md-6 d-none" id="emailWrapper">
                                <div class="mb-3">
                                    <label class="small mb-1">Email Aktif</label>
                                    <input type="email" name="email" id="emailInput" class="form-control"
                                        placeholder="Masukkan Email Aktif" required>
                                </div>
                            </div>

                        </div>

                        <div class="mt-1">
                            <button type="button" id="btnCek" class="btn btn-primary btnDetail">
                                <span id="loadingSpinner"
                                    class="spinner-border spinner-border-sm me-1 d-none"
                                    role="status"
                                    aria-hidden="true">
                                </span>

                                <span id="btnCekText">
                                    Cek Data
                                </span>
                            </button>

                            <button type="submit" id="btnNext" class="btn btn-primary d-none">
                                Selanjutnya<i class="ms-2" data-feather="arrow-right"></i>
                            </button>
                        </div>
                    </form>
                    @endif


                    {{-- STEP 2 --}}
                    @if ($step == 2)
                    <form method="POST" action="{{ route('adminOpd.tiket.step') }}">
                        @csrf

                        <input type="hidden" name="step" value="2">

                        <div class="mb-3">
                            <label class="small mb-1">Bidang</label>
                            <select name="bidang_id" id="bidang" class="form-select" required>
                                <option value="">Pilih Bidang</option>
                                @foreach ($bidang as $b)
                                <option value="{{ $b->id }}">{{ $b->nama_bidang }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1">Layanan</label>
                            <select name="layanan_id" id="layanan" class="form-select" required>
                                <option value="">Pilih Layanan</option>
                            </select>
                        </div>

                        <div class="d-flex justify-content-between mt-3">

                            <button class="btn btn-primary d-inline-flex align-items-center">
                                Selanjutnya
                                <i class="ms-2" data-feather="arrow-right"></i>
                            </button>

                            <a href="{{ route('adminOpd.tiket.create', ['step' => 1]) }}"
                                class="btn btn-light d-inline-flex align-items-center">

                                <i class="me-2" data-feather="arrow-left"></i>
                                Kembali
                            </a>

                        </div>
                    </form>
                    @endif


                    {{-- STEP 3 --}}
                    @if ($step == 3)

                    <form
                        method="POST"
                        action="{{ route('adminOpd.tiket.step') }}"
                        enctype="multipart/form-data">

                        @csrf

                        <input type="hidden" name="step" value="3">

                        <div class="mb-3">
                            <div class="small text-muted">
                                Syarat Layanan
                            </div>

                            <strong>
                                {{ $nama_layanan ?? '-' }}
                            </strong>
                        </div>

                        <div class="table-responsive">

                            <table id="datatablesSimple" class="table table-hover align-middle">

                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Syarat</th>
                                        <th class="text-center text-nowrap" style="width: 180px">
                                            E-File
                                        </th>
                                        <th class="text-center" style="width: 120px">
                                            Validasi
                                        </th>
                                    </tr>
                                </thead>

                                <tfoot>
                                    <tr>
                                        <th>No</th>
                                        <th>Syarat</th>
                                        <th class="text-center text-nowrap">
                                            E-File
                                        </th>
                                        <th class="text-center">
                                            Validasi
                                        </th>
                                    </tr>
                                </tfoot>

                                <tbody>

                                    @forelse ($syarat as $i => $item)

                                    @php
                                    /*
                                    * Karena pada STEP 3 controller
                                    * sudah menjalankan prepareSyaratKelengkapan(),
                                    * maka struktur $item adalah array.
                                    */
                                    $s = $item['syarat'];

                                    $tersedia = $item['tersedia'] ?? false;
                                    $mode = $item['mode'] ?? null;
                                    $dokumen = $item['dokumen'] ?? [];
                                    @endphp

                                    <tr>

                                        {{-- NO --}}
                                        <td>
                                            {{ $i + 1 }}
                                        </td>

                                        {{-- SYARAT --}}
                                        <td>

                                            <div class="fw-semibold">
                                                {{ $s->syarat }}
                                            </div>

                                            @if($s->deskripsi)
                                            <div class="small text-muted mt-1">
                                                {{ $s->deskripsi }}
                                            </div>
                                            @endif

                                        </td>

                                        {{-- E-FILE --}}
                                        <td class="efile-cell">

                                            {{-- ================================================== --}}
                                            {{-- METODE UPLOAD --}}
                                            {{-- ================================================== --}}
                                            @if($s->metode === 'upload')

                                            <div class="efile-action">

                                                {{-- INPUT FILE --}}
                                                <input
                                                    type="file"
                                                    name="dokumen[{{ $s->id }}]"
                                                    id="dokumen_{{ $s->id }}"
                                                    class="d-none upload-syarat"
                                                    data-syarat-id="{{ $s->id }}"
                                                    accept=".pdf,.jpg,.jpeg,.png">

                                                {{-- BUTTON UPLOAD --}}
                                                <label
                                                    for="dokumen_{{ $s->id }}"
                                                    class="btn btn-sm btn-outline-warning btn-upload d-inline-flex align-items-center"
                                                    style="height: 31px;">

                                                    <i
                                                        data-feather="upload"
                                                        class="me-1"
                                                        style="width:14px; height:14px;">
                                                    </i>

                                                    <span class="upload-label-{{ $s->id }}">
                                                        Upload
                                                    </span>

                                                </label>

                                                {{-- NAMA FILE --}}
                                                <div
                                                    id="file-name-{{ $s->id }}"
                                                    class="small text-muted efile-filename">
                                                </div>

                                            </div>


                                            {{-- ================================================== --}}
                                            {{-- SIMPEG TIDAK ADA --}}
                                            {{-- SEKARANG BISA UPLOAD --}}
                                            {{-- ================================================== --}}
                                            @elseif(!$tersedia)

                                            <div class="efile-action">

                                                {{-- INPUT FILE --}}
                                                <input
                                                    type="file"
                                                    name="dokumen[{{ $s->id }}]"
                                                    id="dokumen_{{ $s->id }}"
                                                    class="d-none upload-syarat"
                                                    data-syarat-id="{{ $s->id }}"
                                                    accept=".pdf,.jpg,.jpeg,.png">

                                                {{-- BUTTON UPLOAD --}}
                                                <label
                                                    for="dokumen_{{ $s->id }}"
                                                    class="btn btn-sm btn-outline-warning btn-upload d-inline-flex align-items-center"
                                                    style="height: 31px;">

                                                    <i
                                                        data-feather="upload"
                                                        class="me-1"
                                                        style="width:14px; height:14px;">
                                                    </i>

                                                    <span class="upload-label-{{ $s->id }}">
                                                        Upload
                                                    </span>

                                                </label>

                                                {{-- NAMA FILE --}}
                                                <div
                                                    id="file-name-{{ $s->id }}"
                                                    class="small text-muted efile-filename">
                                                </div>

                                            </div>


                                            {{-- ================================================== --}}
                                            {{-- SIMPEG ADA --}}
                                            {{-- ================================================== --}}
                                            @else

                                            {{-- ========================= --}}
                                            {{-- DOKUMEN TERBARU --}}
                                            {{-- ========================= --}}
                                            @if($mode === 'latest')

                                            <div class="efile-action">

                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-outline-primary btn-lihat-dokumen d-inline-flex align-items-center"
                                                    style="height: 31px;"
                                                    data-dokumen='@json($dokumen)'
                                                    data-syarat="{{ $s->syarat }}">

                                                    <i
                                                        data-feather="file-text"
                                                        class="me-1"
                                                        style="width:14px; height:14px;">
                                                    </i>

                                                    Lihat

                                                </button>

                                            </div>


                                            {{-- ========================= --}}
                                            {{-- SEMUA DOKUMEN --}}
                                            {{-- ========================= --}}
                                            @elseif($mode === 'all')

                                            <div class="efile-action">

                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-outline-primary btn-lihat-dokumen d-inline-flex align-items-center"
                                                    style="height: 31px;"
                                                    data-dokumen='@json($dokumen)'
                                                    data-syarat="{{ $s->syarat }}">

                                                    <i
                                                        data-feather="files"
                                                        class="me-1"
                                                        style="width:14px; height:14px;">
                                                    </i>

                                                    Lihat

                                                    <span class="badge bg-primary ms-1">
                                                        {{ count($dokumen) }}
                                                    </span>

                                                </button>

                                            </div>

                                            @endif

                                            @endif

                                        </td>

                                        {{-- VALIDASI --}}
                                        <td class="text-center">

                                            <div class="d-flex justify-content-center align-items-center">

                                                @if($s->metode === 'simpeg' && $tersedia)

                                                {{-- ======================================== --}}
                                                {{-- SIMPEG ADA --}}
                                                {{-- CHECKLIST LANGSUNG AKTIF --}}
                                                {{-- ======================================== --}}

                                                <input
                                                    type="checkbox"
                                                    name="syarat_id[]"
                                                    value="{{ $s->id }}"
                                                    class="form-check-input checklist-syarat"
                                                    style="width: 18px; height: 18px;"
                                                    data-syarat-id="{{ $s->id }}">

                                                @else

                                                {{-- ======================================== --}}
                                                {{-- UPLOAD / SIMPEG TIDAK ADA --}}
                                                {{-- CHECKLIST AKTIF SETELAH FILE DIPILIH --}}
                                                {{-- ======================================== --}}

                                                <input
                                                    type="checkbox"
                                                    name="syarat_id[]"
                                                    value="{{ $s->id }}"
                                                    class="form-check-input checklist-syarat"
                                                    style="width: 18px; height: 18px;"
                                                    data-syarat-id="{{ $s->id }}"
                                                    disabled>

                                                @endif

                                            </div>

                                        </td>

                                    </tr>

                                    @empty

                                    <tr>
                                        <td colspan="4" class="text-center text-muted py-4">
                                            Tidak ada syarat untuk layanan ini.
                                        </td>
                                    </tr>

                                    @endforelse

                                </tbody>

                            </table>

                        </div>


                        {{-- BUTTON --}}
                        <div class="d-flex justify-content-between mt-3">

                            <button
                                type="button"
                                id="btnNextStep3"
                                class="btn btn-primary d-inline-flex align-items-center">

                                Selanjutnya

                                <i
                                    class="ms-2"
                                    data-feather="arrow-right">
                                </i>

                            </button>

                            <a
                                href="{{ route('adminOpd.tiket.create', ['step' => 2]) }}"
                                class="btn btn-light d-inline-flex align-items-center">

                                <i
                                    class="me-2"
                                    data-feather="arrow-left">
                                </i>

                                Kembali

                            </a>

                        </div>

                    </form>

                    @endif


                    {{-- STEP 4 --}}
                    @if ($step == 4)
                    {{-- ================= DATA DIRI ================= --}}
                    <div class="row mb-4">

                        {{-- KIRI --}}
                        <div class="col-md-8">

                            <h6 class="fw-bold mb-3">Data Diri</h6>

                            <div class="row mb-1">
                                <div class="col-md-6">
                                    <label class="fw-semibold">NIP</label>
                                    <div class="form-label">{{ $tiket->nip ?? '-' }}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold mb-0">Bidang</label>
                                    <div class="form-label">
                                        {{ $tiket->layanan->bidang->nama_bidang ?? '-' }}
                                    </div>
                                </div>
                            </div>

                            <div class="row mb-1">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold mb-0">Nama</label>
                                    <div class="form-label">{{ $data['nama'] ?? '-' }}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold mb-0">Nama Layanan</label>
                                    <div class="form-label">{{ $nama_layanan ?? '-' }}</div>
                                </div>
                            </div>

                            <div class="row mb-1">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold mb-0">Golongan</label>
                                    <div class="form-label">{{ $data['ket_gol'] ?? '-' }}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold mb-0">Unit Kerja</label>
                                    <div class="form-label">{{ $data['unit'] ?? '-' }}</div>
                                </div>
                            </div>

                        </div>

                        {{-- KANAN --}}
                        <div class="col-md-4 text-center">

                            <div class="mb-2">
                                <label class="fw-bold">No Tiket</label>
                                <div class="fw-bold text-primary">
                                    {{ $tiket->no_tiket ?? '-' }}
                                </div>
                            </div>

                            @if($qr)
                            <a
                                href="{{ route('tiket.qr',$tiket->no_tiket) }}"
                                target="_blank">

                                <img
                                    src="data:image/svg+xml;base64,{{ $qr }}"
                                    width="160">

                            </a>

                            <div class="small mt-2">
                                Klik QR untuk memperbesar
                            </div>
                            @endif
                        </div>
                    </div>


                    {{-- Table Syarat --}}
                    <div class="card shadow-none">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Syarat</th>
                                            <th>E-file</th>
                                            <th>Verifikasi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        @forelse ($syarat as $i => $item)

                                        @php
                                        $s = $item['syarat'];
                                        $tersedia = $item['tersedia'] ?? false;
                                        $jenis = $item['jenis'] ?? null;
                                        $mode = $item['mode'] ?? null;
                                        $dokumen = $item['dokumen'] ?? [];
                                        @endphp

                                        <tr>

                                            {{-- NO --}}
                                            <td>
                                                {{ $i + 1 }}
                                            </td>

                                            {{-- SYARAT --}}
                                            <td>
                                                {{ $s->syarat }}
                                            </td>

                                            {{-- E-FILE --}}
                                            <td class="text-center text-nowrap">

                                                {{-- ========================= --}}
                                                {{-- SYARAT UPLOAD --}}
                                                {{-- ========================= --}}
                                                @if ($s->metode !== 'simpeg')

                                                <span
                                                    class="badge bg-light text-warning border d-inline-flex align-items-center">

                                                    <i data-feather="upload" class="me-1"></i>

                                                    Upload Dokumen
                                                </span>

                                                {{-- ========================= --}}
                                                {{-- SIMPEG TIDAK TERSEDIA --}}
                                                {{-- ========================= --}}
                                                @elseif (!$tersedia)

                                                <span
                                                    class="badge bg-light text-danger border d-inline-flex align-items-center">

                                                    <i data-feather="x" class="me-1"></i>

                                                    Tidak tersedia
                                                </span>

                                                {{-- ========================= --}}
                                                {{-- SIMPEG TERSEDIA --}}
                                                {{-- ========================= --}}
                                                @else

                                                {{-- SINGLE --}}
                                                @if ($mode === 'single')

                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-outline-primary btn-lihat-dokumen"
                                                    data-dokumen='@json($dokumen)'
                                                    data-syarat="{{ $s->syarat }}">

                                                    <i data-feather="file-text" class="me-1"></i>

                                                    Lihat Dokumen
                                                </button>

                                                {{-- ALL --}}
                                                @elseif ($mode === 'all')

                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-outline-primary btn-lihat-dokumen"
                                                    data-dokumen='@json($dokumen)'
                                                    data-syarat="{{ $s->syarat }}">

                                                    <i data-feather="files" class="me-1"></i>

                                                    Lihat Semua

                                                    <span class="badge bg-primary ms-1">
                                                        {{ count($dokumen) }}
                                                    </span>

                                                </button>

                                                {{-- FALLBACK --}}
                                                @else

                                                <span
                                                    class="badge bg-light text-success border d-inline-flex align-items-center">

                                                    <i data-feather="check-circle" class="me-1"></i>

                                                    Tersedia
                                                </span>

                                                @endif

                                                @endif

                                            </td>

                                            {{-- VALIDASI --}}
                                            <td class="text-center">

                                                @if ($s->metode !== 'simpeg')

                                                {{-- UPLOAD BELUM DIDUKUNG DI TAHAP INI --}}
                                                <input
                                                    type="checkbox"
                                                    name="syarat_id[]"
                                                    value="{{ $s->id }}">

                                                @elseif ($tersedia)

                                                {{-- DOKUMEN SIMPEG TERSEDIA --}}
                                                <input
                                                    type="checkbox"
                                                    name="syarat_id[]"
                                                    value="{{ $s->id }}">

                                                @else

                                                {{-- DOKUMEN SIMPEG TIDAK TERSEDIA --}}
                                                <input
                                                    type="checkbox"
                                                    disabled
                                                    title="Dokumen belum tersedia di SIMPEG">

                                                @endif

                                            </td>

                                        </tr>

                                        @empty

                                        <tr>
                                            <td colspan="4" class="text-center text-muted">
                                                Tidak ada syarat
                                            </td>
                                        </tr>

                                        @endforelse
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {{-- Button --}}
                    <div class="d-flex justify-content-end mt-4">

                        <a href="{{ route('tiket.cetak', $tiket->no_tiket) }}" target="_blank"
                            class="btn btn-light me-1">
                            <i data-feather="printer" class="me-1"></i> Cetak
                        </a>

                        <a href="{{ route('adminOpd.tiket.reset') }}" class="btn btn-primary">
                            <i data-feather="x"></i>
                            Tutup
                        </a>

                    </div>

                </div>
                @endif
            </div>

        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
{{-- <script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script> --}}
<script>
    document.addEventListener('DOMContentLoaded', function() {

        const table = document.querySelector("#datatablesSimple");

        if (table) {
            new simpleDatatables.DataTable(table, {
                searchable: false,
                paging: false,
                perPageSelect: false
            });
        }

        const loadingSpinner = document.getElementById('loadingSpinner');
        const btnCekText = document.getElementById('btnCekText');

        const nipError = document.getElementById('nipError');
        const nipInput = document.getElementById('nipInput');
        const btnCek = document.getElementById('btnCek');
        const btnNext = document.getElementById('btnNext');
        const confirmBtn = document.getElementById('confirmSimpan');

        const emailWrapper = document.getElementById('emailWrapper');
        const emailInput = document.getElementById('emailInput');

        const bidang = document.getElementById('bidang');
        const layanan = document.getElementById('layanan');

        const modalEl = document.getElementById('modalDetail');
        let modalDetail = modalEl ? new bootstrap.Modal(modalEl) : null;

        let nipValid = false;

        // Cek Data
        if (btnCek) {

            btnCek.addEventListener('click', async function() {

                const nip = nipInput.value.trim();

                // loading ON
                btnCek.disabled = true;
                loadingSpinner.classList.remove('d-none');
                btnCekText.innerText = 'Memeriksa...';

                // reset
                nipError.classList.add('d-none');
                nipError.innerText = '';

                if (nip === '') {

                    nipError.innerText = 'NIP wajib diisi';
                    nipError.classList.remove('d-none');

                    nipValid = false;

                    // loading OFF
                    btnCek.disabled = false;
                    loadingSpinner.classList.add('d-none');
                    btnCekText.innerText = 'Cek Data';

                    return;
                }

                try {

                    const response = await fetch('/adminOpd/get-pegawai/' + nip);
                    const result = await response.json();

                    console.log(result);

                    if (!result.success || !result.data) {

                        nipError.innerText = result.message ?? 'NIP tidak ditemukan';
                        nipError.classList.remove('d-none');

                        nipValid = false;

                        btnCek.disabled = false;
                        loadingSpinner.classList.add('d-none');
                        btnCekText.innerText = 'Cek Data';

                        return;
                    }

                    const pegawai = result.data;

                    nipValid = true;

                    // DETAIL
                    document.getElementById('detailNip').innerText =
                        pegawai.nip ?? '-';

                    document.getElementById('detailNama').innerText =
                        pegawai.nama_lengkap ?? '-';

                    // document.getElementById('detailTgl').innerText =
                    //     pegawai.tgl_lahir ?
                    //     new Date(pegawai.tgl_lahir).toLocaleDateString('id-ID', {
                    //         day: 'numeric',
                    //         month: 'long',
                    //         year: 'numeric'
                    //     }) :
                    //     '-';

                    document.getElementById('detailGol').innerText =
                        pegawai.ket_gol ?? '-';

                    document.getElementById('detailJabatan').innerText =
                        pegawai.nama_jab ?? '-';

                    document.getElementById('detailUkerja').innerText =
                        pegawai.ket_ukerja ?? '-';

                    const foto = document.getElementById('detailFoto');

                    foto.src =
                        `https://simpegdev.bllkom.site/pegawai/foto/${pegawai.nip}`;

                    foto.onerror = function() {
                        this.src =
                            '/templatepro/assets/img/demo/user-placeholder.svg';
                    };

                    // tampil modal
                    if (modalDetail) {
                        modalDetail.show();
                    }

                } catch (error) {

                    console.error(error);

                    nipError.innerText = 'Terjadi kesalahan server';
                    nipError.classList.remove('d-none');

                    nipValid = false;
                } finally {

                    // loading OFF
                    btnCek.disabled = false;
                    loadingSpinner.classList.add('d-none');
                    btnCekText.innerText = 'Cek Data';
                }

            });

        }

        // ========================================
        // MODAL DOKUMEN SIMPEG
        // ========================================

        const modalDokumenEl = document.getElementById('modalDokumen');

        let modalDokumen = null;

        if (modalDokumenEl) {
            modalDokumen = new bootstrap.Modal(modalDokumenEl);
        }

        const modalDokumenTitle =
            document.getElementById('modalDokumenTitle');

        const modalDokumenSubtitle =
            document.getElementById('modalDokumenSubtitle');

        const dokumenList =
            document.getElementById('dokumenList');


        document.querySelectorAll('.btn-lihat-dokumen')
            .forEach(function(button) {

                button.addEventListener('click', function() {

                    let dokumen = [];

                    try {

                        dokumen = JSON.parse(
                            this.dataset.dokumen || '[]'
                        );

                    } catch (error) {

                        console.error(
                            'Gagal membaca data dokumen:',
                            error
                        );

                        dokumen = [];
                    }

                    const syarat =
                        this.dataset.syarat || 'Dokumen SIMPEG';

                    modalDokumenTitle.innerText =
                        'Dokumen SIMPEG';

                    modalDokumenSubtitle.innerText =
                        syarat;

                    dokumenList.innerHTML = '';

                    if (!dokumen.length) {

                        dokumenList.innerHTML = `
                    <div class="text-center text-muted py-5">

                        <i
                            data-feather="file-x"
                            style="width:40px;height:40px;">
                        </i>

                        <div class="mt-2">
                            Tidak ada dokumen tersedia.
                        </div>

                    </div>
                `;

                        if (window.feather) {
                            feather.replace();
                        }

                        modalDokumen.show();

                        return;
                    }


                    dokumen.forEach(function(doc, index) {

                        const nama =
                            doc.nama_file ??
                            doc.nama ??
                            doc.file_name ??
                            'Dokumen ' + (index + 1);

                        const tanggal =
                            doc.tanggal ??
                            doc.created_at ??
                            doc.tgl_dokumen ??
                            null;

                        const url =
                            doc.preview_url ??
                            doc.url ??
                            null;

                        const urutan =
                            doc.urutan ?? '-';


                        let tanggalHtml = '';

                        if (tanggal) {

                            tanggalHtml = `
                        <div class="small text-muted mt-1">
                            <i
                                data-feather="calendar"
                                class="me-1"
                                style="width:14px;height:14px;">
                            </i>
                            ${tanggal}
                        </div>
                    `;
                        }


                        let buttonHtml = '';

                        if (url) {

                            buttonHtml = `
                        <a
                            href="${url}"
                            target="_blank"
                            class="btn btn-sm btn-outline-primary">

                            <i
                                data-feather="eye"
                                class="me-1">
                            </i>

                            Lihat
                        </a>
                    `;
                        }


                        dokumenList.innerHTML += `

                    <div class="card border mb-2">

                        <div class="card-body py-3">

                            <div class="d-flex
                                justify-content-between
                                align-items-center">

                                <div class="d-flex
                                    align-items-start">

                                    <div class="me-3">

                                        <div
                                            class="bg-light
                                            rounded p-2">

                                            <i
                                                data-feather="file-text"
                                                class="text-primary">
                                            </i>

                                        </div>

                                    </div>


                                    <div>

                                        <div class="fw-semibold">
                                            ${nama}
                                        </div>

                                        <div class="small text-muted">
                                            Urutan: ${urutan}
                                        </div>

                                        ${tanggalHtml}

                                    </div>

                                </div>


                                <div>
                                    ${buttonHtml}
                                </div>

                            </div>

                        </div>

                    </div>

                `;
                    });


                    if (window.feather) {
                        feather.replace();
                    }

                    modalDokumen.show();

                });

            });

        // Confirm
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {

                if (!nipValid) return;

                if (modalDetail) {
                    modalDetail.hide();
                }

                btnCek.classList.add('d-none');
                btnNext.classList.remove('d-none');

                if (emailWrapper) {
                    emailWrapper.classList.remove('d-none');
                }
            });
        }

        // Reset
        if (nipInput) {
            nipInput.addEventListener('input', function() {

                nipError.classList.add('d-none');

                btnCek.classList.remove('d-none');
                btnNext.classList.add('d-none');

                nipValid = false;

                if (emailWrapper) {
                    emailWrapper.classList.add('d-none');
                }

                if (emailInput) {
                    emailInput.value = '';
                }
            });
        }

        function loadLayanan(bidangId) {

            if (!layanan) return;

            if (!bidangId) {
                layanan.innerHTML = '<option value="">Pilih Bidang dahulu</option>';
                return;
            }

            layanan.innerHTML = '<option value="">Loading...</option>';

            fetch('/adminOpd/get-layanan/' + bidangId)
                .then(res => res.json())
                .then(data => {

                    let html = '<option value="">Pilih Layanan</option>';

                    data.forEach(l => {
                        html += `<option value="${l.id}">${l.nama_layanan}</option>`;
                    });

                    layanan.innerHTML = html;
                })
                .catch(() => {
                    layanan.innerHTML = '<option value="">Gagal load data</option>';
                });
        }

        if (bidang) {
            bidang.addEventListener('change', function() {
                loadLayanan(this.value);
            });
        }


        // Confirm
        const btnNextStep3 = document.getElementById('btnNextStep3');
        const modalKonfirmasiEl = document.getElementById('modalKonfirmasi');
        let modalKonfirmasi = modalKonfirmasiEl ? new bootstrap.Modal(modalKonfirmasiEl) : null;

        const btnSubmitFinal = document.getElementById('btnSubmitFinal');

        if (btnNextStep3) {

            btnNextStep3.addEventListener('click', function() {

                const checkboxes =
                    document.querySelectorAll(
                        'input[name="syarat_id[]"]'
                    );

                let allChecked = true;
                let hasDisabled = false;

                checkboxes.forEach(function(cb) {

                    // Ada syarat yang belum upload
                    if (cb.disabled) {
                        hasDisabled = true;
                        allChecked = false;
                        return;
                    }

                    // Ada syarat yang belum dicentang
                    if (!cb.checked) {
                        allChecked = false;
                    }

                });


                // ========================================
                // ADA FILE YANG BELUM DIUPLOAD
                // ========================================

                if (hasDisabled) {

                    alert(
                        'Silakan upload seluruh dokumen yang diperlukan terlebih dahulu.'
                    );

                    return;
                }


                // ========================================
                // ADA CHECKLIST YANG BELUM DICENTANG
                // ========================================

                if (!allChecked) {

                    alert(
                        'Semua syarat wajib divalidasi terlebih dahulu.'
                    );

                    return;
                }


                // ========================================
                // SEMUA SUDAH LENGKAP
                // ========================================

                if (modalKonfirmasi) {
                    modalKonfirmasi.show();
                }

            });

        }

        if (btnSubmitFinal && btnNextStep3) {
            btnSubmitFinal.addEventListener('click', function() {
                const form = btnNextStep3.form;
                if (form) form.submit();
            });
        }

        // ========================================
        // UPLOAD DOKUMEN SYARAT
        // ========================================

        const uploadInputs = document.querySelectorAll('.upload-syarat');

        uploadInputs.forEach(function(input) {

            input.addEventListener('change', function() {

                const syaratId = this.dataset.syaratId;

                const fileNameElement =
                    document.getElementById('file-name-' + syaratId);

                const labelElement =
                    document.querySelector('.upload-label-' + syaratId);

                const checklist =
                    document.querySelector(
                        '.checklist-syarat[data-syarat-id="' + syaratId + '"]'
                    );

                // ========================================
                // TIDAK ADA FILE
                // ========================================

                if (!this.files || !this.files.length) {

                    if (fileNameElement) {
                        fileNameElement.innerHTML = '';
                    }

                    if (labelElement) {
                        labelElement.innerText = 'Upload';
                    }

                    // Checklist kembali disabled
                    if (checklist) {
                        checklist.checked = false;
                        checklist.disabled = true;
                    }

                    return;
                }


                const file = this.files[0];


                // ========================================
                // VALIDASI UKURAN FILE
                // ========================================

                const maxSize = 5 * 1024 * 1024;

                if (file.size > maxSize) {

                    alert('Ukuran file maksimal 5 MB.');

                    this.value = '';

                    if (fileNameElement) {
                        fileNameElement.innerHTML = '';
                    }

                    if (labelElement) {
                        labelElement.innerText = 'Upload';
                    }

                    // Checklist tetap disabled
                    if (checklist) {
                        checklist.checked = false;
                        checklist.disabled = true;
                    }

                    return;
                }


                // ========================================
                // TAMPILKAN NAMA FILE
                // ========================================

                if (fileNameElement) {

                    fileNameElement.innerHTML = `
                <span class="text-success">

              

                    ${file.name}

                </span>
            `;
                }


                // ========================================
                // UBAH LABEL UPLOAD -> GANTI
                // ========================================

                if (labelElement) {
                    labelElement.innerText = 'Ganti';
                }


                // ========================================
                // AKTIFKAN CHECKLIST
                // ========================================

                if (checklist) {
                    checklist.disabled = false;
                }


                // ========================================
                // REFRESH FEATHER ICON
                // ========================================

                if (window.feather) {
                    feather.replace();
                }

            });

        });

        // Modal pengajuan sudah ada
        const showWarningModal = document.getElementById('showWarningModal');

        if (showWarningModal) {
            const modalPengajuanAdaEl =
                document.getElementById('modalPengajuanAda');
            if (modalPengajuanAdaEl) {
                const modalPengajuanAda =
                    new bootstrap.Modal(modalPengajuanAdaEl);
                modalPengajuanAda.show();
            }
        }
    });
</script>
@endsection