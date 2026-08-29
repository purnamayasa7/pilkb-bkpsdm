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

@push('styles')
<link rel="stylesheet" href="{{ asset('css/tiket.css') }}?v={{ filemtime(public_path('css/tiket.css')) }}">
@endpush

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

            {{-- HEADER --}}
            <div class="modal-header">

                <div>
                    <h5 class="modal-title mb-1" id="modalDokumenTitle">
                        Dokumen SIMPEG
                    </h5>

                    <div
                        class="small text-muted"
                        id="modalDokumenSubtitle">
                        -
                    </div>
                </div>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close">
                </button>

            </div>


            {{-- BODY --}}
            <div class="modal-body">

                {{-- FILTER DOKUMEN --}}
                <div class="mb-4">

                    <label
                        for="filterDokumen"
                        class="small fw-semibold mb-1">

                        Tampilkan Dokumen

                    </label>

                    <select
                        id="filterDokumen"
                        class="form-select">

                        <option value="all">
                            Semua
                        </option>

                        <option value="latest">
                            Terbaru
                        </option>

                    </select>

                </div>


                {{-- LIST DOKUMEN --}}
                <div id="dokumenList">

                    {{-- Diisi melalui JavaScript --}}

                </div>

            </div>


            {{-- FOOTER --}}
            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-light"
                    data-bs-dismiss="modal">

                    <i
                        data-feather="x"
                        class="me-1">
                    </i>

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
                <button class="btn btn-primary" id="btnSubmitFinal" type="button">
                    <span
                        class="spinner-border spinner-border-sm me-1 d-none"
                        id="submitFinalSpinner"
                        role="status"
                        aria-hidden="true">
                    </span>

                    <i
                        data-feather="check"
                        class="me-1"
                        id="submitFinalIcon">
                    </i>

                    <span id="submitFinalText">
                        Ya, Lanjutkan
                    </span>
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

    {{-- STEPPER WIZARD INDICATOR --}}
    @php
        $progressWidth = [
            1 => '0%',
            2 => '25%',
            3 => '50%',
            4 => '75%',
        ];
    @endphp

    <div class="stepper-container mb-4">
        <div class="stepper-nav">
            <div class="stepper-track-bg"></div>
            <div class="stepper-track-progress" style="width: {{ $progressWidth[$step] ?? '0%' }};"></div>

            <div class="stepper-step {{ $step > 1 ? 'completed' : ($step == 1 ? 'active' : '') }}">
                <div class="stepper-icon">
                    @if($step > 1) <i data-feather="check"></i> @else 1 @endif
                </div>
                <div class="stepper-title">Input NIP</div>
            </div>

            <div class="stepper-step {{ $step > 2 ? 'completed' : ($step == 2 ? 'active' : '') }}">
                <div class="stepper-icon">
                    @if($step > 2) <i data-feather="check"></i> @else 2 @endif
                </div>
                <div class="stepper-title">Pilih Layanan</div>
            </div>

            <div class="stepper-step {{ $step > 3 ? 'completed' : ($step == 3 ? 'active' : '') }}">
                <div class="stepper-icon">
                    @if($step > 3) <i data-feather="check"></i> @else 3 @endif
                </div>
                <div class="stepper-title">Checklist Syarat</div>
            </div>

            <div class="stepper-step {{ $step == 4 ? 'active completed' : '' }}">
                <div class="stepper-icon">
                    @if($step == 4) <i data-feather="check"></i> @else 4 @endif
                </div>
                <div class="stepper-title">Tiket Dibuat</div>
            </div>
        </div>
    </div>

    {{-- MAIN FORM CARD --}}
    <div class="card form-wizard-card mb-4">
        <div class="form-wizard-header d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold" style="font-size: 0.8125rem;">
                    {{ $stepHeader[$step] ?? 'Tahap ' . $step }}
                </span>
                <h5 class="mb-0 fw-bold">{{ $stepTitle[$step] ?? 'Pengajuan Layanan' }}</h5>
            </div>
            <span class="text-muted small d-none d-sm-inline">Langkah {{ $step }} dari 4</span>
        </div>

        <div class="card-body p-4 p-md-5">

            {{-- STEP 1: INPUT NIP --}}
            @if ($step == 1)
            <form method="POST" action="{{ route('adminOpd.tiket.step') }}">
                @csrf
                <input type="hidden" name="step" value="1">

                <div class="row justify-content-center">
                    <div class="col-lg-7 col-md-9">
                        <div class="text-center mb-4">
                            <div class="p-3 bg-light rounded-circle text-primary d-inline-flex align-items-center justify-content-center mb-2" style="width: 52px; height: 52px;">
                                <i data-feather="user-check" style="width: 26px; height: 26px;"></i>
                            </div>
                            <h6 class="fw-bold mb-1 step-section-heading">Cari Data Pegawai</h6>
                            <p class="text-muted small mb-0">Masukkan NIP untuk menarik data profil dari SIMPEG</p>
                        </div>

                        <!-- NIP Input -->
                        <div class="mb-3">
                            <label class="form-label fw-semibold small mb-1" for="nipInput">
                                Nomor Induk Pegawai (NIP) <span class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i data-feather="hash" style="width: 16px; height: 16px;"></i>
                                </span>
                                <input type="text" id="nipInput" name="nip" class="form-control"
                                    placeholder="Masukkan 18 digit NIP..." autocomplete="off">
                            </div>

                            <div id="nipError" class="text-danger small mt-2 d-none">
                                <i data-feather="alert-triangle" style="width: 14px; height: 14px;" class="me-1"></i>
                                NIP tidak ditemukan pada database SIMPEG
                            </div>
                        </div>

                        <!-- EMAIL Input -->
                        <div class="mb-4 d-none" id="emailWrapper">
                            <label class="form-label fw-semibold small mb-1" for="emailInput">
                                Email Aktif Notifikasi <span class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i data-feather="mail" style="width: 16px; height: 16px;"></i>
                                </span>
                                <input type="email" name="email" id="emailInput" class="form-control"
                                    placeholder="nama@email.com" required>
                            </div>
                            <div class="form-text text-muted small">
                                Email ini digunakan untuk pengiriman notifikasi pembaruan status tiket.
                            </div>
                        </div>

                        <div class="pt-3 border-top mt-4 d-flex justify-content-end gap-2 wizard-actions-end">
                            <button type="button" id="btnCek" class="btn btn-primary btnDetail px-4">
                                <span id="loadingSpinner"
                                    class="spinner-border spinner-border-sm me-1 d-none"
                                    role="status"
                                    aria-hidden="true">
                                </span>

                                <span id="btnCekText">
                                    <i data-feather="search" class="me-1"></i>
                                    Cek Data Pegawai
                                </span>
                            </button>

                            <button type="submit" id="btnNext" class="btn btn-primary px-4 d-none">
                                Selanjutnya <i class="ms-2" data-feather="arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            @endif


            {{-- STEP 2: PILIH LAYANAN --}}
            @if ($step == 2)
            <form method="POST" action="{{ route('adminOpd.tiket.step') }}">
                @csrf
                <input type="hidden" name="step" value="2">

                <div class="row justify-content-center">
                    <div class="col-lg-8 col-md-10">
                        <div class="mb-4">
                            <label class="form-label fw-semibold small mb-1" for="bidang">
                                Bidang Layanan <span class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i data-feather="grid" style="width: 16px; height: 16px;"></i>
                                </span>
                                <select name="bidang_id" id="bidang" class="form-select" required>
                                    <option value="">-- Pilih Bidang Layanan --</option>
                                    @foreach ($bidang as $b)
                                    <option value="{{ $b->id }}">{{ $b->nama_bidang }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-semibold small mb-1" for="layanan">
                                Jenis Layanan <span class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i data-feather="layers" style="width: 16px; height: 16px;"></i>
                                </span>
                                <select name="layanan_id" id="layanan" class="form-select" required>
                                    <option value="">-- Pilih Layanan --</option>
                                </select>
                            </div>
                            <div class="form-text text-muted small mt-1">
                                Pilihan layanan akan otomatis dimuat berdasarkan Bidang yang dipilih.
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4 wizard-actions">
                            <a href="{{ route('adminOpd.tiket.create', ['step' => 1]) }}"
                                class="btn btn-outline-secondary px-4 d-inline-flex align-items-center">
                                <i class="me-2" data-feather="arrow-left"></i>
                                Kembali
                            </a>

                            <button
                                type="submit"
                                id="btnNextStep2"
                                class="btn btn-primary px-4 d-inline-flex align-items-center btn-loading">

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
                        </div>
                    </div>
                </div>
            </form>
            @endif


            {{-- STEP 3: CHECKLIST SYARAT --}}
            @if ($step == 3)
            <form
                method="POST"
                action="{{ route('adminOpd.tiket.step') }}"
                enctype="multipart/form-data">

                @csrf
                <input type="hidden" name="step" value="3">

                {{-- Banner Layanan --}}
                <div class="service-banner-box p-3 mb-4 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div class="d-flex align-items-center">
                        <div class="p-2 rounded-circle bg-primary bg-opacity-10 text-primary me-3 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
                            <i data-feather="file-text" style="width: 22px; height: 22px;"></i>
                        </div>
                        <div>
                            <div class="small text-muted fw-semibold">Layanan Terpilih:</div>
                            <h6 class="mb-0 fw-bold">{{ $nama_layanan ?? '-' }}</h6>
                        </div>
                    </div>
                    <div>
                        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                            {{ count($syarat ?? []) }} Persyaratan
                        </span>
                    </div>
                </div>

                <div class="table-responsive rounded-3 border">
                    <table class="table table-hover align-middle mb-0 table-checklist">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 55px;" class="text-center">No</th>
                                <th>Persyaratan Dokumen</th>
                                <th class="text-center text-nowrap" style="width: 190px">
                                    E-File / Berkas
                                </th>
                                <th class="text-center" style="width: 110px">
                                    Validasi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            @forelse ($syarat as $i => $item)
                            @php
                            $s = $item->syarat;
                            $tersedia = $item->tersedia ?? false;
                            $dokumen = $item->dokumen ?? [];
                            @endphp

                            <tr>
                                {{-- NO --}}
                                <td class="text-center fw-semibold text-muted">
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
                                    @if($s->metode === 'upload')
                                    <div class="efile-action">
                                        <input
                                            type="file"
                                            name="dokumen[{{ $s->id }}]"
                                            id="dokumen_{{ $s->id }}"
                                            class="d-none upload-syarat"
                                            data-syarat-id="{{ $s->id }}"
                                            accept=".pdf,application/pdf">

                                        <label
                                            for="dokumen_{{ $s->id }}"
                                            class="btn btn-sm btn-upload efile-btn">
                                            <i data-feather="upload"></i>
                                            <span class="upload-label-{{ $s->id }}">
                                                Upload
                                            </span>
                                        </label>

                                        <div
                                            id="file-name-{{ $s->id }}"
                                            class="small text-muted efile-filename">
                                        </div>
                                    </div>

                                    @elseif(!$tersedia)
                                    <div class="efile-action">
                                        <input
                                            type="file"
                                            name="dokumen[{{ $s->id }}]"
                                            id="dokumen_{{ $s->id }}"
                                            class="d-none upload-syarat"
                                            data-syarat-id="{{ $s->id }}"
                                            accept=".pdf,application/pdf">

                                        <label
                                            for="dokumen_{{ $s->id }}"
                                            class="btn btn-sm btn-upload efile-btn">
                                            <i data-feather="upload"></i>
                                            <span class="upload-label-{{ $s->id }}">
                                                Upload
                                            </span>
                                        </label>

                                        <div
                                            id="file-name-{{ $s->id }}"
                                            class="small text-muted efile-filename">
                                        </div>
                                    </div>

                                    @else
                                    @if(count($dokumen) === 1)
                                    @php
                                    $dokumenSingle = $dokumen[0] ?? null;
                                    $urlSingle = $dokumenSingle['preview_url'] ?? $dokumenSingle['url'] ?? null;
                                    @endphp

                                    <div class="efile-action">
                                        @if($urlSingle)
                                        <a
                                            href="{{ $urlSingle }}"
                                            target="_blank"
                                            rel="noopener noreferrer"
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

                                    @elseif(count($dokumen) > 1)
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
                                    @else
                                    <div class="efile-action">
                                        <span class="badge bg-light text-danger border">
                                            Dokumen tidak tersedia
                                        </span>
                                    </div>
                                    @endif
                                    @endif
                                </td>

                                {{-- VALIDASI --}}
                                <td class="text-center">
                                    <div class="d-flex justify-content-center align-items-center">
                                        @if($s->metode === 'simpeg' && $tersedia)
                                        <input
                                            type="checkbox"
                                            name="syarat_id[]"
                                            value="{{ $s->id }}"
                                            class="form-check-input checklist-syarat"
                                            style="width: 20px; height: 20px; cursor: pointer;"
                                            data-syarat-id="{{ $s->id }}">
                                        @else
                                        <input
                                            type="checkbox"
                                            name="syarat_id[]"
                                            value="{{ $s->id }}"
                                            class="form-check-input checklist-syarat"
                                            style="width: 20px; height: 20px;"
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

                {{-- BUTTONS --}}
                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4 wizard-actions">
                    <a
                        href="{{ route('adminOpd.tiket.create', ['step' => 2]) }}"
                        class="btn btn-outline-secondary px-4 d-inline-flex align-items-center">
                        <i class="me-2" data-feather="arrow-left"></i>
                        Kembali
                    </a>

                    <button
                        type="button"
                        id="btnNextStep3"
                        class="btn btn-primary px-4 d-inline-flex align-items-center">
                        Selanjutnya
                        <i class="ms-2" data-feather="arrow-right"></i>
                    </button>
                </div>
            </form>
            @endif


            {{-- STEP 4: TIKET BERHASIL DIBUAT --}}
            @if ($step == 4)
            {{-- Alert Success --}}
            <div class="alert alert-success border-0 bg-success bg-opacity-10 d-flex align-items-center p-3 mb-4 rounded-3">
                <div class="p-2 rounded-circle bg-success text-white me-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                    <i data-feather="check" style="width: 22px; height: 22px;"></i>
                </div>
                <div>
                    <h6 class="alert-heading fw-bold mb-0 text-success">Tiket Pengajuan Berhasil Dibuat!</h6>
                    <div class="small text-muted">Simpan atau cetak nomor tiket berikut sebagai bukti sah pengajuan berkas layanan.</div>
                </div>
            </div>

            {{-- DATA DIRI & QR CODE --}}
            <div class="row g-4 mb-4">
                <div class="col-lg-8">
                    <div class="card summary-info-card border h-100 shadow-none">
                        <div class="card-header py-2 px-3 fw-bold small d-flex align-items-center">
                            <i data-feather="user" class="me-2 text-primary" style="width: 16px; height: 16px;"></i>
                            Informasi Pemohon & Layanan
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div class="row g-3">
                                <div class="col-sm-6">
                                    <div class="small text-muted mb-1">Nomor Induk Pegawai (NIP)</div>
                                    <div class="fw-bold">{{ $tiket->nip ?? '-' }}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="small text-muted mb-1">Bidang Layanan</div>
                                    <div class="fw-bold">{{ $tiket->layanan->bidang->nama_bidang ?? '-' }}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="small text-muted mb-1">Nama Pegawai</div>
                                    <div class="fw-bold">{{ $data['nama'] ?? '-' }}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="small text-muted mb-1">Nama Layanan</div>
                                    <div class="fw-bold text-primary">{{ $nama_layanan ?? '-' }}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="small text-muted mb-1">Golongan</div>
                                    <div class="fw-bold">{{ $data['ket_gol'] ?? '-' }}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="small text-muted mb-1">Unit Kerja</div>
                                    <div class="fw-bold">{{ $data['unit'] ?? '-' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="card ticket-qr-box border text-center h-100 shadow-none">
                        <div class="card-body d-flex flex-column align-items-center justify-content-center p-4">
                            <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill fw-semibold mb-2">
                                Nomor Tiket
                            </span>
                            <h4 class="fw-bold text-primary mb-3 letter-spacing-1">
                                {{ $tiket->no_tiket ?? '-' }}
                            </h4>

                            @if($qr)
                            <div class="ticket-qr-frame mb-2">
                                <a href="{{ route('tiket.qr',$tiket->no_tiket) }}" target="_blank" title="Klik untuk memperbesar">
                                    <img src="data:image/svg+xml;base64,{{ $qr }}" width="140" height="140" alt="QR Code">
                                </a>
                            </div>
                            <div class="text-muted small">
                                <i data-feather="maximize-2" style="width: 12px; height: 12px;" class="me-1"></i> Klik QR untuk memperbesar
                            </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            {{-- Table Syarat --}}
            <div class="card summary-info-card border shadow-none mb-4">
                <div class="card-header py-2 px-3 fw-bold small d-flex align-items-center">
                    <i data-feather="check-square" class="me-2 text-primary" style="width: 16px; height: 16px;"></i>
                    Daftar Persyaratan & Status Dokumen
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th style="width: 60px;" class="text-center">No</th>
                                    <th>Syarat</th>
                                    <th class="text-center text-nowrap" style="width: 180px;">
                                        E-File
                                    </th>
                                    <th class="text-center" style="width: 120px;">
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
                                    <td class="text-center fw-semibold text-muted">
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
                                        <span class="badge bg-light text-primary border d-inline-flex align-items-center">
                                            <i data-feather="upload" class="me-1" style="width:14px;"></i>
                                            Diunggah
                                        </span>
                                        @elseif($syaratData && $syaratData->metode === 'simpeg')
                                        <span class="badge bg-light text-success border d-inline-flex align-items-center">
                                            <i data-feather="database" class="me-1" style="width:14px;"></i>
                                            Dari SIMPEG
                                        </span>
                                        @elseif($syaratData && $syaratData->metode === 'upload')
                                        <span class="badge bg-light text-warning border d-inline-flex align-items-center">
                                            <i data-feather="upload-cloud" class="me-1" style="width:14px;"></i>
                                            Menunggu Upload
                                        </span>
                                        @else
                                        <span class="badge bg-light text-muted border d-inline-flex align-items-center">
                                            <i data-feather="file" class="me-1" style="width:14px;"></i>
                                            Tidak tersedia
                                        </span>
                                        @endif
                                    </td>

                                    {{-- VERIFIKASI --}}
                                    <td class="text-center">
                                        @if($detail->status == 1)
                                        <span class="badge bg-light text-success border d-inline-flex align-items-center">
                                            <i data-feather="check-circle" class="me-1"></i>
                                            Valid
                                        </span>
                                        @elseif($detail->status == 2)
                                        <span class="badge bg-light text-danger border d-inline-flex align-items-center">
                                            <i data-feather="x-circle" class="me-1"></i>
                                            Tidak Valid
                                        </span>
                                        @else
                                        <span class="badge bg-light text-warning border d-inline-flex align-items-center">
                                            <i data-feather="clock" class="me-1"></i>
                                            Menunggu
                                        </span>
                                        @endif
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted py-4">
                                        Tidak ada syarat untuk tiket ini.
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {{-- Buttons --}}
            <div class="d-flex justify-content-end gap-2 pt-3 border-top wizard-actions-end">
                <a href="{{ route('tiket.cetak', $tiket->no_tiket) }}" target="_blank"
                    class="btn btn-outline-secondary d-inline-flex align-items-center px-4">
                    <i data-feather="printer" class="me-2"></i> Cetak Tiket
                </a>

                <a href="{{ route('adminOpd.tiket.reset') }}" class="btn btn-primary d-inline-flex align-items-center px-4">
                    <i data-feather="check" class="me-2"></i> Selesai
                </a>
            </div>

            @endif
        </div>
    </div>

    <!-- TOAST CONTAINER -->
    <div
        id="toastContainer"
        class="toast-container position-fixed top-0 end-0 p-3"
        style="z-index: 9999;">
    </div>
</div>

{{-- simple-datatables tidak digunakan pada halaman ini --}}
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

        // =========================================================
        // SUBMIT FINAL STEP 3
        // =========================================================

        if (btnSubmitFinal && btnNextStep3) {

            btnSubmitFinal.addEventListener('click', function() {

                const form = btnNextStep3.form;

                if (!form) {
                    return;
                }

                // =========================================
                // CEGAH DOUBLE SUBMIT
                // =========================================

                btnSubmitFinal.disabled = true;


                // =========================================
                // ELEMENT BUTTON
                // =========================================

                const submitFinalSpinner =
                    document.getElementById('submitFinalSpinner');

                const submitFinalIcon =
                    document.getElementById('submitFinalIcon');

                const submitFinalText =
                    document.getElementById('submitFinalText');


                // =========================================
                // TAMPILKAN LOADING
                // =========================================

                if (submitFinalSpinner) {

                    submitFinalSpinner.classList.remove('d-none');

                }

                if (submitFinalIcon) {

                    submitFinalIcon.classList.add('d-none');

                }

                if (submitFinalText) {

                    submitFinalText.innerText =
                        'Memproses...';

                }


                // =========================================
                // SUBMIT FORM
                // =========================================

                form.submit();

            });

        }


        // =========================================================
        // MODAL DOKUMEN SIMPEG
        // MENAMPILKAN RIWAYAT DOKUMEN
        // =========================================================

        const modalDokumenEl =
            document.getElementById('modalDokumen');

        let modalDokumen = null;

        if (modalDokumenEl) {

            modalDokumen =
                new bootstrap.Modal(modalDokumenEl);

        }

        const modalDokumenTitle =
            document.getElementById('modalDokumenTitle');

        const modalDokumenSubtitle =
            document.getElementById('modalDokumenSubtitle');

        const dokumenList =
            document.getElementById('dokumenList');

        const filterDokumen =
            document.getElementById('filterDokumen');


        // =========================================================
        // DATA DOKUMEN AKTIF
        // =========================================================

        let currentDokumen = [];


        // =========================================================
        // RENDER DOKUMEN
        // =========================================================

        function renderDokumen(dokumen) {

            if (!dokumenList) {
                return;
            }

            dokumenList.innerHTML = '';


            // =====================================================
            // TIDAK ADA DOKUMEN
            // =====================================================

            if (
                !Array.isArray(dokumen) ||
                dokumen.length === 0
            ) {

                dokumenList.innerHTML = `
            <div class="dokumen-empty">

                <i
                    data-feather="file"
                    class="text-muted">
                </i>

                <div>
                    Tidak ada dokumen tersedia.
                </div>

            </div>
        `;

                if (window.feather) {
                    feather.replace();
                }

                return;
            }


            // =====================================================
            // RENDER SETIAP DOKUMEN
            // =====================================================

            dokumen.forEach(function(doc, index) {

                const nama =
                    doc.nama_file ??
                    doc.nama ??
                    doc.file_name ??
                    'Dokumen ' + (index + 1);


                const url =
                    doc.preview_url ??
                    doc.url ??
                    null;


                const urutan =
                    doc.urutan ??
                    '-';


                // =================================================
                // TOMBOL LIHAT
                // =================================================

                let buttonHtml = '';

                if (url) {

                    buttonHtml = `
                <a
                    href="${url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-sm btn-outline-primary dokumen-lihat">

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

                    Tidak tersedia

                </span>
            `;

                }


                // =================================================
                // CARD DOKUMEN
                // =================================================

                dokumenList.innerHTML += `

            <div class="dokumen-item mb-2">

                <div class="p-3">

                    <div class="
                        d-flex
                        justify-content-between
                        align-items-center
                        gap-3
                    ">

                        {{-- INFORMASI DOKUMEN --}}
                        <div class="
                            d-flex
                            align-items-center
                            flex-grow-1
                            min-width-0
                        ">

                            <div class="dokumen-icon me-3">

                                <i
                                    data-feather="file-text"
                                    class="text-primary">
                                </i>

                            </div>


                            <div class="min-width-0">

                                <div class="dokumen-nama">

                                    ${nama}

                                </div>

                                <div class="dokumen-meta mt-1">

                                    Urutan: ${urutan}

                                </div>

                            </div>

                        </div>


                        {{-- ACTION --}}
                        <div class="flex-shrink-0">

                            ${buttonHtml}

                        </div>

                    </div>

                </div>

            </div>

        `;

            });


            // =====================================================
            // REFRESH FEATHER
            // =====================================================

            if (window.feather) {

                feather.replace();

            }

        }


        // =========================================================
        // FILTER DOKUMEN
        // =========================================================

        function applyDokumenFilter() {

            if (!Array.isArray(currentDokumen)) {
                return;
            }


            // =====================================================
            // SEMUA
            // =====================================================

            if (
                !filterDokumen ||
                filterDokumen.value === 'all'
            ) {

                renderDokumen(currentDokumen);

                return;
            }


            // =====================================================
            // TERBARU
            //
            // Urutan terbesar = dokumen terbaru
            // =====================================================

            if (filterDokumen.value === 'latest') {

                if (currentDokumen.length === 0) {

                    renderDokumen([]);

                    return;
                }


                const dokumenTerbaru = [...currentDokumen]
                    .sort(function(a, b) {

                        const urutanA =
                            Number(a.urutan ?? 0);

                        const urutanB =
                            Number(b.urutan ?? 0);

                        return urutanB - urutanA;

                    })
                    .slice(0, 1);


                renderDokumen(
                    dokumenTerbaru
                );

            }

        }


        // =========================================================
        // CHANGE FILTER
        // =========================================================

        if (filterDokumen) {

            filterDokumen.addEventListener(
                'change',
                function() {

                    applyDokumenFilter();

                }
            );

        }


        // =========================================================
        // TOMBOL LIHAT DOKUMEN
        // =========================================================

        document
            .querySelectorAll('.btn-lihat-dokumen')
            .forEach(function(button) {

                button.addEventListener(
                    'click',
                    function() {

                        // =========================================
                        // PASTIKAN MODAL TERSEDIA
                        // =========================================

                        if (
                            !modalDokumen ||
                            !dokumenList
                        ) {

                            console.error(
                                'Modal dokumen tidak ditemukan.'
                            );

                            return;
                        }


                        // =========================================
                        // AMBIL DATA DOKUMEN
                        // =========================================

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


                        // =========================================
                        // SIMPAN DATA AKTIF
                        // =========================================

                        currentDokumen =
                            Array.isArray(dokumen) ?
                            dokumen : [];


                        // =========================================
                        // NAMA SYARAT
                        // =========================================

                        const syarat =
                            this.dataset.syarat ||
                            'Dokumen SIMPEG';


                        // =========================================
                        // HEADER MODAL
                        // =========================================

                        if (modalDokumenTitle) {

                            modalDokumenTitle.innerText =
                                'Dokumen SIMPEG';

                        }


                        if (modalDokumenSubtitle) {

                            modalDokumenSubtitle.innerText =
                                syarat;

                        }


                        // =========================================
                        // RESET FILTER
                        // =========================================

                        if (filterDokumen) {

                            filterDokumen.value =
                                'all';

                        }


                        // =========================================
                        // TAMPILKAN SEMUA DOKUMEN
                        // =========================================

                        renderDokumen(
                            currentDokumen
                        );


                        // =========================================
                        // TAMPILKAN MODAL
                        // =========================================

                        modalDokumen.show();

                    }
                );

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
                    // VALIDASI PDF
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
                    // VALIDASI UKURAN FILE
                    // MAKSIMAL 1 MB
                    // =================================================

                    const maxFileSize = 1024 * 1024;

                    if (file.size > maxFileSize) {

                        // Kosongkan input
                        this.value = '';

                        // Tampilkan pesan error
                        if (fileNameElement) {

                            fileNameElement.textContent =
                                'Ukuran file maksimal 1 MB.';

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
                    // FILE PDF + UKURAN VALID
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