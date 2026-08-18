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

    /* BUTTON E-FILE */

    .efile-btn {
        width: 90px;
        height: 31px;
        padding: 0 8px;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        font-size: 0.8125rem;
        font-weight: 600;
        line-height: 1;

        gap: 4px;
        line-height: 1;
        white-space: nowrap;
    }

    .efile-btn svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
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

    /* TOMBOL UPLOAD */

    .btn-upload {
        border-color: #f59e0b;
        color: #f59e0b;
        background-color: #fff;
    }

    .btn-upload:hover {
        background-color: #f59e0b;
        color: #fff;
    }

    /* TOMBOL GANTI */

    .btn-ganti {
        border-color: #f59e0b;
        color: #f59e0b;
        background-color: #fff;
    }

    .btn-ganti:hover {
        background-color: #f59e0b;
        color: #fff;
    }

    .btn-loading {
        min-width: 130px;
        justify-content: center;
    }

    .btn-loading .spinner-border {
        width: 1rem;
        height: 1rem;
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
                <button class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i>
                    Batal
                </button>
                <button class="btn btn-primary" id="btnSubmitFinal">
                    <i data-feather="check" class="me-1"></i>
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

                            <button
                                type="submit"
                                id="btnNextStep2"
                                class="btn btn-primary d-inline-flex align-items-center btn-loading">

                                <span class="btn-text">
                                    Selanjutnya
                                </span>

                                <span
                                    class="spinner-border spinner-border-sm ms-2 d-none"
                                    role="status"
                                    aria-hidden="true">
                                </span>

                                <i
                                    class="ms-2 btn-arrow"
                                    data-feather="arrow-right">
                                </i>

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
                                    $s = $item->syarat;

                                    $tersedia = $item->tersedia ?? false;
                                    $mode = $item->mode ?? null;
                                    $dokumen = $item->dokumen ?? [];
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

                                            {{-- METODE UPLOAD --}}

                                            @if($s->metode === 'upload')

                                            <div class="efile-action">

                                                {{-- INPUT FILE --}}
                                                <input
                                                    type="file"
                                                    name="dokumen[{{ $s->id }}]"
                                                    id="dokumen_{{ $s->id }}"
                                                    class="d-none upload-syarat"
                                                    data-syarat-id="{{ $s->id }}"
                                                    accept=".pdf,application/pdf">

                                                {{-- BUTTON UPLOAD --}}
                                                <label
                                                    for="dokumen_{{ $s->id }}"
                                                    class="btn btn-sm btn-outline-warning efile-btn">

                                                    <i data-feather="upload"></i>

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


                                            {{-- SIMPEG TIDAK ADA --}}

                                            @elseif(!$tersedia)

                                            <div class="efile-action">

                                                {{-- INPUT FILE --}}
                                                <input
                                                    type="file"
                                                    name="dokumen[{{ $s->id }}]"
                                                    id="dokumen_{{ $s->id }}"
                                                    class="d-none upload-syarat"
                                                    data-syarat-id="{{ $s->id }}"
                                                    accept=".pdf,application/pdf">

                                                {{-- BUTTON UPLOAD --}}
                                                <label
                                                    for="dokumen_{{ $s->id }}"
                                                    class="btn btn-sm btn-outline-warning btn-upload efile-btn">

                                                    <i data-feather="upload"></i>

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

                                            {{-- SIMPEG ADA --}}

                                            @else

                                            {{-- DOKUMEN TERBARU --}}

                                            @if($mode === 'latest')

                                            @php
                                            $dokumenLatest = $dokumen[0] ?? null;

                                            $urlLatest =
                                            $dokumenLatest['preview_url'] ??
                                            $dokumenLatest['url'] ??
                                            null;

                                            $namaLatest =
                                            $dokumenLatest['nama_file'] ??
                                            $dokumenLatest['nama'] ??
                                            $dokumenLatest['file_name'] ??
                                            'Dokumen';
                                            @endphp

                                            <div class="efile-action">

                                                @if($urlLatest)

                                                <a
                                                    href="{{ $urlLatest }}"
                                                    target="_blank"
                                                    class="btn btn-sm btn-outline-primary efile-btn">

                                                    <i data-feather="file-text"></i>

                                                    Lihat

                                                </a>

                                                @else

                                                <span class="badge bg-light text-danger border">
                                                    Dokumen tidak tersedia
                                                </span>

                                                @endif

                                            </div>

                                            {{-- SEMUA DOKUMEN --}}

                                            @elseif($mode === 'all')

                                            <div class="efile-action">

                                                <button
                                                    type="button"
                                                    class="btn btn-sm btn-outline-primary btn-lihat-dokumen d-inline-flex align-items-center"
                                                    data-dokumen='@json($dokumen)'
                                                    data-syarat="{{ $s->syarat }}">

                                                    <i data-feather="file-text" class="me-1"></i>

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

                                                {{-- SIMPEG ADA --}}

                                                <input
                                                    type="checkbox"
                                                    name="syarat_id[]"
                                                    value="{{ $s->id }}"
                                                    class="form-check-input checklist-syarat"
                                                    style="width: 18px; height: 18px;"
                                                    data-syarat-id="{{ $s->id }}">

                                                @else

                                                {{-- UPLOAD / SIMPEG TIDAK ADA --}}

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

                                <table class="table table-hover mb-0 align-middle">

                                    <thead>
                                        <tr>
                                            <th style="width: 60px;">No</th>

                                            <th>Syarat</th>

                                            <th
                                                class="text-center text-nowrap"
                                                style="width: 180px;">
                                                E-File
                                            </th>

                                            <th
                                                class="text-center"
                                                style="width: 120px;">
                                                Verifikasi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        @forelse ($syarat as $i => $detail)

                                        @php
                                        $syaratData = $detail->syarat;
                                        @endphp

                                        <tr>

                                            {{-- NO --}}
                                            <td>
                                                {{ $i + 1 }}
                                            </td>


                                            {{-- SYARAT --}}
                                            <td>

                                                @if($syaratData)

                                                <div class="fw-semibold">
                                                    {{ $syaratData->syarat }}
                                                </div>

                                                @if($syaratData->deskripsi)

                                                <div class="small text-muted mt-1">
                                                    {{ $syaratData->deskripsi }}
                                                </div>

                                                @endif

                                                @else

                                                <span class="text-muted">
                                                    Syarat tidak ditemukan
                                                </span>

                                                @endif

                                            </td>


                                            {{-- E-FILE --}}
                                            <td class="text-center">

                                                @if($detail->file_path)

                                                {{-- FILE HASIL UPLOAD --}}
                                                <span
                                                    class="badge bg-light text-primary border d-inline-flex align-items-center">

                                                    <i
                                                        data-feather="upload"
                                                        class="me-1"
                                                        style="width:14px;">
                                                    </i>

                                                    Diunggah

                                                </span>

                                                @elseif(
                                                $syaratData &&
                                                $syaratData->metode === 'simpeg'
                                                )

                                                {{-- DOKUMEN DARI SIMPEG --}}
                                                <span
                                                    class="badge bg-light text-success border d-inline-flex align-items-center">

                                                    <i
                                                        data-feather="database"
                                                        class="me-1"
                                                        style="width:14px;">
                                                    </i>

                                                    Dari SIMPEG

                                                </span>

                                                @elseif(
                                                $syaratData &&
                                                $syaratData->metode === 'upload'
                                                )

                                                {{-- MENUNGGU / TIDAK ADA UPLOAD --}}
                                                <span
                                                    class="badge bg-light text-warning border d-inline-flex align-items-center">

                                                    <i
                                                        data-feather="upload-cloud"
                                                        class="me-1"
                                                        style="width:14px;">
                                                    </i>

                                                    Menunggu Upload

                                                </span>

                                                @else

                                                <span
                                                    class="badge bg-light text-muted border d-inline-flex align-items-center">

                                                    <i
                                                        data-feather="file"
                                                        class="me-1"
                                                        style="width:14px;">
                                                    </i>

                                                    Tidak tersedia

                                                </span>

                                                @endif

                                            </td>


                                            {{-- VERIFIKASI --}}
                                            <td class="text-center">

                                                @if($detail->status == 1)

                                                <span
                                                    class="badge bg-light text-success border d-inline-flex align-items-center">

                                                    <i
                                                        data-feather="check-circle"
                                                        class="me-1">
                                                    </i>

                                                    Valid

                                                </span>

                                                @elseif($detail->status == 2)

                                                <span
                                                    class="badge bg-light text-danger border d-inline-flex align-items-center">

                                                    <i
                                                        data-feather="x-circle"
                                                        class="me-1">
                                                    </i>

                                                    Tidak Valid

                                                </span>

                                                @else

                                                <span
                                                    class="badge bg-light text-warning border d-inline-flex align-items-center">

                                                    <i
                                                        data-feather="clock"
                                                        class="me-1">
                                                    </i>

                                                    Menunggu

                                                </span>

                                                @endif

                                            </td>

                                        </tr>

                                        @empty

                                        <tr>

                                            <td
                                                colspan="4"
                                                class="text-center text-muted py-4">

                                                Tidak ada syarat untuk tiket ini.

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

    <!-- TOAST CONTAINER -->
    <div
        id="toastContainer"
        class="toast-container position-fixed top-0 end-0 p-3"
        style="z-index: 9999;">
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
{{-- <script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script> --}}
<script>
    document.addEventListener('DOMContentLoaded', function() {

        // =========================================================
        // TOAST CHECKLIST
        // =========================================================

        function showValidationErrorToast() {

            let toastContainer =
                document.querySelector('.toast-container');

            if (!toastContainer) {

                toastContainer =
                    document.createElement('div');

                toastContainer.className =
                    'toast-container position-fixed top-0 end-0 p-3';

                toastContainer.style.zIndex =
                    '9999';

                document.body.appendChild(
                    toastContainer
                );
            }

            const toastElement =
                document.createElement('div');

            toastElement.className =
                'toast';

            toastElement.setAttribute(
                'role',
                'alert'
            );

            toastElement.setAttribute(
                'aria-live',
                'assertive'
            );

            toastElement.setAttribute(
                'aria-atomic',
                'true'
            );

            toastElement.setAttribute(
                'data-bs-delay',
                '5000'
            );

            toastElement.innerHTML = `
        <div class="toast-header text-warning">

            <i
                data-feather="alert-circle"
                class="me-2">
            </i>

            <strong class="me-auto">
                Validasi Belum Lengkap
            </strong>

            <button
                class="btn-close"
                type="button"
                data-bs-dismiss="toast">
            </button>

        </div>

        <div class="toast-body">
            Semua syarat wajib divalidasi
            terlebih dahulu sebelum melanjutkan.
        </div>
    `;

            toastContainer.appendChild(
                toastElement
            );

            if (window.feather) {
                feather.replace();
            }

            const toast =
                new bootstrap.Toast(
                    toastElement
                );

            toast.show();

            toastElement.addEventListener(
                'hidden.bs.toast',
                function() {
                    toastElement.remove();
                }
            );
        }

        // DATATABLE

        const table = document.querySelector("#datatablesSimple");

        if (table) {
            new simpleDatatables.DataTable(table, {
                searchable: false,
                paging: false,
                perPageSelect: false
            });
        }

        // ELEMENT STEP 1

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

        let modalDetail =
            modalEl ?
            new bootstrap.Modal(modalEl) :
            null;

        let nipValid = false;

        // CEK DATA PEGAWAI

        if (btnCek) {

            btnCek.addEventListener('click', async function() {

                const nip = nipInput.value.trim();

                // loading ON
                btnCek.disabled = true;

                if (loadingSpinner) {
                    loadingSpinner.classList.remove('d-none');
                }

                if (btnCekText) {
                    btnCekText.innerText = 'Memeriksa...';
                }

                // reset
                if (nipError) {
                    nipError.classList.add('d-none');
                    nipError.innerText = '';
                }

                if (nip === '') {

                    if (nipError) {
                        nipError.innerText = 'NIP wajib diisi';
                        nipError.classList.remove('d-none');
                    }

                    nipValid = false;

                    // loading OFF
                    btnCek.disabled = false;

                    if (loadingSpinner) {
                        loadingSpinner.classList.add('d-none');
                    }

                    if (btnCekText) {
                        btnCekText.innerText = 'Cek Data';
                    }

                    return;
                }

                try {

                    const response =
                        await fetch('/adminOpd/get-pegawai/' + nip);

                    const result =
                        await response.json();

                    console.log(result);

                    if (!result.success || !result.data) {

                        if (nipError) {
                            nipError.innerText =
                                result.message ??
                                'NIP tidak ditemukan';

                            nipError.classList.remove('d-none');
                        }

                        nipValid = false;

                        btnCek.disabled = false;

                        if (loadingSpinner) {
                            loadingSpinner.classList.add('d-none');
                        }

                        if (btnCekText) {
                            btnCekText.innerText = 'Cek Data';
                        }

                        return;
                    }

                    const pegawai = result.data;

                    nipValid = true;

                    // DETAIL PEGAWAI

                    document.getElementById('detailNip').innerText =
                        pegawai.nip ?? '-';

                    document.getElementById('detailNama').innerText =
                        pegawai.nama_lengkap ?? '-';

                    document.getElementById('detailGol').innerText =
                        pegawai.ket_gol ?? '-';

                    document.getElementById('detailJabatan').innerText =
                        pegawai.nama_jab ?? '-';

                    document.getElementById('detailUkerja').innerText =
                        pegawai.ket_ukerja ?? '-';

                    // FOTO PEGAWAI

                    const foto =
                        document.getElementById('detailFoto');

                    if (foto) {

                        foto.src =
                            `https://simpegdev.bllkom.site/pegawai/foto/${pegawai.nip}`;

                        foto.onerror = function() {

                            this.src =
                                '/templatepro/assets/img/demo/user-placeholder.svg';

                        };
                    }

                    // TAMPIL MODAL DETAIL

                    if (modalDetail) {
                        modalDetail.show();
                    }

                } catch (error) {

                    console.error(error);

                    if (nipError) {
                        nipError.innerText =
                            'Terjadi kesalahan server';

                        nipError.classList.remove('d-none');
                    }

                    nipValid = false;

                } finally {

                    // loading OFF
                    btnCek.disabled = false;

                    if (loadingSpinner) {
                        loadingSpinner.classList.add('d-none');
                    }

                    if (btnCekText) {
                        btnCekText.innerText = 'Cek Data';
                    }
                }
            });
        }

        // PILIH PEGAWAI

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

        // RESET SAAT NIP DIUBAH

        if (nipInput) {

            nipInput.addEventListener('input', function() {

                if (nipError) {
                    nipError.classList.add('d-none');
                }

                if (btnCek) {
                    btnCek.classList.remove('d-none');
                }

                if (btnNext) {
                    btnNext.classList.add('d-none');
                }

                nipValid = false;

                if (emailWrapper) {
                    emailWrapper.classList.add('d-none');
                }

                if (emailInput) {
                    emailInput.value = '';
                }

            });

        }

        // LOAD LAYANAN BERDASARKAN BIDANG

        function loadLayanan(bidangId) {
            if (!layanan) return;

            if (!bidangId) {
                layanan.innerHTML =
                    '<option value="">Pilih Bidang dahulu</option>';
                return;
            }

            layanan.innerHTML =
                '<option value="">Loading...</option>';

            fetch('/adminOpd/get-layanan/' + bidangId)
                .then(res => res.json())
                .then(data => {

                    let html =
                        '<option value="">Pilih Layanan</option>';

                    data.forEach(l => {

                        html +=
                            `<option value="${l.id}">${l.nama_layanan}</option>`;
                    });

                    layanan.innerHTML = html;
                })
                .catch(() => {
                    layanan.innerHTML =
                        '<option value="">Gagal load data</option>';
                });
        }

        // CHANGE BIDANG

        if (bidang) {
            bidang.addEventListener('change', function() {
                loadLayanan(this.value);
            });
        }

        // =====================================================
        // LOADING BUTTON STEP 2
        // =====================================================

        const btnNextStep2 = document.getElementById('btnNextStep2');

        if (btnNextStep2) {

            btnNextStep2.form.addEventListener('submit', function() {

                btnNextStep2.disabled = true;

                const text = btnNextStep2.querySelector('.btn-text');
                const spinner = btnNextStep2.querySelector('.spinner-border');
                const arrow = btnNextStep2.querySelector('.btn-arrow');

                if (text) {
                    text.innerText = 'Memproses...';
                }

                if (spinner) {
                    spinner.classList.remove('d-none');
                }

                if (arrow) {
                    arrow.classList.add('d-none');
                }

            });

        }

        // MODAL KONFIRMASI STEP 3

        const btnNextStep3 = document.getElementById('btnNextStep3');

        const modalKonfirmasiEl = document.getElementById('modalKonfirmasi');

        let modalKonfirmasi = modalKonfirmasiEl ?
            new bootstrap.Modal(modalKonfirmasiEl) :
            null;

        const btnSubmitFinal = document.getElementById('btnSubmitFinal');

        // NEXT STEP 3

        if (btnNextStep3) {

            btnNextStep3.addEventListener('click', function() {

                // CEK SEMUA FILE UPLOAD HARUS PDF

                const uploadInputs =
                    document.querySelectorAll(
                        '.upload-syarat'
                    );

                let invalidPdf = false;

                uploadInputs.forEach(function(input) {
                    if (
                        input.files &&
                        input.files.length > 0
                    ) {
                        const file = input.files[0];

                        const fileName = file.name.toLowerCase();

                        const isPdfExtension = fileName.endsWith('.pdf');

                        const isPdfMime = file.type === 'application/pdf';

                        if (
                            !isPdfExtension ||
                            !isPdfMime
                        ) {
                            invalidPdf = true;
                        }
                    }
                });

                // JIKA ADA FILE BUKAN PDF

                if (invalidPdf) {
                    showPdfErrorToast();
                    return;
                }

                // CEK CHECKLIST

                const checkboxes =
                    document.querySelectorAll(
                        'input[name="syarat_id[]"]'
                    );

                let allChecked = true;

                checkboxes.forEach(function(cb) {
                    if (!cb.checked) {
                        allChecked = false;
                    }
                });

                // JIKA BELUM SEMUA VALIDASI

                if (!allChecked) {
                    showValidationErrorToast();
                    return;
                }

                // TAMPILKAN MODAL KONFIRMASI

                if (modalKonfirmasi) {
                    modalKonfirmasi.show();
                }
            });
        }

        // SUBMIT FINAL STEP 3

        if (btnSubmitFinal && btnNextStep3) {

            btnSubmitFinal.addEventListener('click', function() {

                const form = btnNextStep3.form;

                if (form) {
                    form.submit();
                }
            });

        }

        // MODAL DOKUMEN SIMPEG
        // KHUSUS MODE EFILE = ALL

        const modalDokumenEl = document.getElementById('modalDokumen');

        let modalDokumen = null;

        if (modalDokumenEl) {

            modalDokumen = new bootstrap.Modal(modalDokumenEl);

        }


        const modalDokumenTitle = document.getElementById('modalDokumenTitle');

        const modalDokumenSubtitle = document.getElementById('modalDokumenSubtitle');

        const dokumenList = document.getElementById('dokumenList');

        // TOMBOL LIHAT SEMUA DOKUMEN

        document
            .querySelectorAll('.btn-lihat-dokumen')
            .forEach(function(button) {

                button.addEventListener('click', function() {

                    // Pastikan modal tersedia
                    if (!modalDokumen || !dokumenList) {

                        console.error(
                            'Modal dokumen tidak ditemukan.'
                        );

                        return;
                    }

                    // AMBIL DATA DOKUMEN

                    let dokumen = [];

                    try {

                        dokumen =
                            JSON.parse(
                                this.dataset.dokumen || '[]'
                            );

                    } catch (error) {

                        console.error(
                            'Gagal membaca data dokumen:',
                            error
                        );

                        dokumen = [];

                    }

                    // NAMA SYARAT

                    const syarat = this.dataset.syarat ||
                        'Dokumen SIMPEG';

                    // SET HEADER MODAL

                    if (modalDokumenTitle) {
                        modalDokumenTitle.innerText =
                            'Dokumen SIMPEG';
                    }

                    if (modalDokumenSubtitle) {
                        modalDokumenSubtitle.innerText =
                            syarat;
                    }

                    // RESET LIST

                    dokumenList.innerHTML = '';

                    // JIKA TIDAK ADA DOKUMEN

                    if (
                        !Array.isArray(dokumen) ||
                        !dokumen.length
                    ) {

                        dokumenList.innerHTML = `
                            <div class="text-center text-muted py-5">

                                <i
                                    data-feather="file"
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

                    // TAMPILKAN DOKUMEN

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
                            doc.urutan ??
                            '-';

                        // TANGGAL

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

                        // BUTTON LIHAT

                        let buttonHtml = '';

                        if (url) {

                            buttonHtml = `
                                <a
                                    href="${url}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="btn btn-sm btn-outline-primary">

                                    <i
                                        data-feather="eye"
                                        class="me-1">
                                    </i>

                                    Lihat

                                </a>
                            `;

                        } else {

                            buttonHtml = `
                                <span
                                    class="badge bg-light text-danger border">

                                    Dokumen tidak tersedia

                                </span>
                            `;

                        }

                        // CARD DOKUMEN

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

                    // REFRESH FEATHER

                    if (window.feather) {
                        feather.replace();
                    }

                    modalDokumen.show();

                });

            });

        // =========================================================
        // TOAST ERROR FILE PDF
        // =========================================================

        function showPdfErrorToast() {

            // Cek apakah container toast sudah ada
            let toastContainer =
                document.querySelector('.toast-container');

            // Jika belum ada, buat container
            if (!toastContainer) {

                toastContainer =
                    document.createElement('div');

                toastContainer.className =
                    'toast-container position-fixed top-0 end-0 p-3';

                toastContainer.style.zIndex =
                    '9999';

                document.body.appendChild(
                    toastContainer
                );
            }

            // Buat toast
            const toastElement =
                document.createElement('div');

            toastElement.className =
                'toast';

            toastElement.setAttribute(
                'role',
                'alert'
            );

            toastElement.setAttribute(
                'aria-live',
                'assertive'
            );

            toastElement.setAttribute(
                'aria-atomic',
                'true'
            );

            toastElement.setAttribute(
                'data-bs-delay',
                '5000'
            );

            toastElement.innerHTML = `
        <div class="toast-header text-danger">

            <i
                data-feather="x-circle"
                class="me-2">
            </i>

            <strong class="me-auto">
                Format File Tidak Valid
            </strong>

            <button
                class="btn-close"
                type="button"
                data-bs-dismiss="toast">
            </button>

        </div>

        <div class="toast-body">
            Dokumen yang diunggah harus dalam
            format <strong>PDF</strong>.
            File JPG, JPEG, PNG, atau format lainnya
            tidak diperbolehkan.
        </div>
    `;

            toastContainer.appendChild(
                toastElement
            );

            // Refresh Feather
            if (window.feather) {
                feather.replace();
            }

            // Bootstrap Toast
            const toast =
                new bootstrap.Toast(
                    toastElement
                );

            toast.show();

            // Hapus element setelah toast selesai
            toastElement.addEventListener(
                'hidden.bs.toast',
                function() {
                    toastElement.remove();
                }
            );
        }

        // =====================================================
        // UPLOAD DOKUMEN SYARAT
        // =====================================================

        document
            .querySelectorAll('.upload-syarat')
            .forEach(function(input) {

                input.addEventListener('change', function() {

                    const syaratId = this.dataset.syaratId;

                    // ELEMENT NAMA FILE
                    const fileNameElement =
                        document.getElementById(
                            'file-name-' + syaratId
                        );

                    // LABEL BUTTON
                    const uploadLabel =
                        document.querySelector(
                            '.upload-label-' + syaratId
                        );

                    // CHECKBOX VALIDASI
                    const checkbox =
                        document.querySelector(
                            '.checklist-syarat[data-syarat-id="' +
                            syaratId +
                            '"]'
                        );

                    // =================================================
                    // TIDAK ADA FILE
                    // =================================================

                    if (
                        !this.files ||
                        this.files.length === 0
                    ) {

                        if (fileNameElement) {

                            fileNameElement.textContent = '';

                            fileNameElement.classList.remove(
                                'text-danger',
                                'text-success'
                            );

                        }

                        if (uploadLabel) {

                            uploadLabel.textContent = 'Upload';

                        }

                        if (checkbox) {

                            checkbox.checked = false;
                            checkbox.disabled = true;

                        }

                        return;
                    }


                    // =================================================
                    // AMBIL FILE
                    // =================================================

                    const file = this.files[0];


                    // =================================================
                    // VALIDASI PDF DI FRONTEND
                    // =================================================

                    const extension =
                        file.name
                        .split('.')
                        .pop()
                        .toLowerCase();

                    const isPdf =
                        extension === 'pdf' &&
                        (
                            file.type === 'application/pdf' ||
                            file.type === ''
                        );


                    // =================================================
                    // JIKA BUKAN PDF
                    // =================================================

                    if (!isPdf) {

                        // Kosongkan input
                        this.value = '';

                        // Reset nama file
                        if (fileNameElement) {

                            fileNameElement.textContent =
                                'File harus berformat PDF.';

                            fileNameElement.classList.remove(
                                'text-success'
                            );

                            fileNameElement.classList.add(
                                'text-danger'
                            );
                        }

                        // Reset tombol
                        if (uploadLabel) {

                            uploadLabel.textContent =
                                'Upload';

                        }

                        // Checkbox tetap tidak aktif
                        if (checkbox) {

                            checkbox.checked = false;
                            checkbox.disabled = true;

                        }

                        return;
                    }


                    // =================================================
                    // FILE PDF VALID
                    // =================================================

                    if (fileNameElement) {

                        fileNameElement.textContent =
                            file.name;

                        fileNameElement.classList.remove(
                            'text-danger'
                        );

                        fileNameElement.classList.add(
                            'text-success'
                        );

                    }


                    // =================================================
                    // UBAH LABEL BUTTON
                    // =================================================

                    if (uploadLabel) {

                        uploadLabel.textContent =
                            'Ganti File';

                    }


                    // =================================================
                    // AKTIFKAN + OTOMATIS CENTANG
                    // =================================================

                    if (checkbox) {

                        checkbox.disabled = false;

                        // LANGSUNG CENTANG
                        checkbox.checked = true;

                    }

                });

            });

        // REFRESH FEATHER ICON

        if (window.feather) {
            feather.replace();
        }

        // MODAL PENGAJUAN SUDAH ADA

        const showWarningModal =
            document.getElementById('showWarningModal');

        if (showWarningModal) {

            const modalPengajuanAdaEl =
                document.getElementById(
                    'modalPengajuanAda'
                );

            if (modalPengajuanAdaEl) {

                const modalPengajuanAda =
                    new bootstrap.Modal(
                        modalPengajuanAdaEl
                    );

                modalPengajuanAda.show();

            }

        }

    });
</script>
@endsection