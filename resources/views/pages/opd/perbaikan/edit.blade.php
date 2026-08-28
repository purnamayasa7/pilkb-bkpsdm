@extends('layouts.app')

@section('content')

<style>
    .efile-cell {
        width: 110px;
        min-width: 110px;
        vertical-align: middle !important;
        text-align: center !important;
    }

    .efile-action {
        width: 100%;
        min-height: 60px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        gap: 8px;
    }

    .efile-btn {
        width: 90px !important;
        min-width: 90px !important;
        max-width: 90px !important;

        height: 31px !important;
        min-height: 31px !important;
        max-height: 31px !important;

        padding: 0 8px !important;
        margin: 0 !important;

        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        box-sizing: border-box !important;

        font-size: .8125rem !important;
        font-weight: 600 !important;

        line-height: 1 !important;
        gap: 4px;

        white-space: nowrap;
    }

    .efile-btn svg {
        width: 14px !important;
        height: 14px !important;
        flex-shrink: 0;
    }

    .btn-lihat-dokumen {
        position: relative;
    }

    .btn-lihat-dokumen .badge {
        position: absolute;

        top: -6px;
        right: -6px;

        min-width: 18px;
        height: 18px;

        padding: 0 4px !important;
        margin: 0 !important;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        border-radius: 9px;

        font-size: .65rem !important;

        z-index: 2;
    }

    .efile-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }

    .table-hover tbody tr {
        transition: background-color .15s ease;
    }

    .table-hover tbody tr:hover {
        background-color: rgba(13, 110, 253, .025);
    }

    .table thead th {
        vertical-align: middle;
        white-space: nowrap;

        font-size: .8125rem;
        font-weight: 600;
    }

    .table tbody td {
        vertical-align: middle;
        font-size: .875rem;
    }

    .dokumen-item {
        border: 1px solid #e5e7eb;
        border-radius: 8px;

        transition: all .2s ease;
    }

    .dokumen-item:hover {
        border-color: #cbd5e1;
        background-color: #f8fafc;
    }

    .dokumen-icon {
        width: 40px;
        height: 40px;

        display: flex;
        align-items: center;
        justify-content: center;

        background-color: #f1f5f9;
        border-radius: 8px;

        flex-shrink: 0;
    }

    .dokumen-icon svg {
        width: 20px;
        height: 20px;
    }

    .dokumen-nama {
        font-weight: 600;
        line-height: 1.4;
        word-break: break-word;
    }

    .dokumen-meta {
        font-size: .8125rem;
        color: #6b7280;
    }

    .upload-wrapper {
        min-width: 220px;
    }

    .upload-wrapper input[type="file"] {
        font-size: .8125rem;
    }

    .status-btl {
        font-size: .75rem;
    }

    .status-valid {
        font-size: .75rem;
    }
</style>


{{-- =========================================================
     HEADER
========================================================= --}}

<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">

    <div class="container-fluid px-4">

        <div class="page-header-content">

            <div class="row align-items-center justify-content-between pt-3">

                <div class="col-auto mb-3">

                    <h1 class="page-header-title">

                        <div class="page-header-icon">
                            <i data-feather="edit"></i>
                        </div>

                        Perbaikan Usulan

                    </h1>

                </div>


                <div class="col-12 col-xl-auto mb-3">

                    <a
                        class="btn btn-sm btn-light text-primary"
                        href="{{ route('adminOpd.perbaikan.index') }}">

                        <i
                            class="me-1"
                            data-feather="arrow-left">
                        </i>

                        Kembali ke List Perbaikan

                    </a>

                </div>

            </div>

        </div>

    </div>

</header>


<div class="container-fluid px-4">


    {{-- =====================================================
         FORM
    ====================================================== --}}

    <form
        id="formPerbaikan"
        method="POST"
        action="{{ route(
            'adminOpd.perbaikan.update',
            $tiket->no_tiket
        ) }}"
        enctype="multipart/form-data">

        @csrf


        <div class="card mb-4">


            {{-- =================================================
                 HEADER CARD
            ================================================== --}}

            <div class="card-header bg-gradient-primary-to-secondary text-white">

                Perbaikan Dokumen Usulan

            </div>


            <div class="card-body">


                {{-- =================================================
                     DATA DIRI
                ================================================== --}}

                <div class="row mb-4">


                    {{-- KIRI --}}

                    <div class="col-md-8">

                        <h6 class="fw-bold mb-3">
                            Data Diri
                        </h6>


                        <div class="row mb-2">

                            <div class="col-md-6">

                                <label class="fw-semibold">
                                    NIP
                                </label>

                                <div>
                                    {{ $tiket->nip ?? '-' }}
                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="fw-semibold">
                                    Bidang
                                </label>

                                <div>
                                    {{ $tiket->layanan->bidang->nama_bidang ?? '-' }}
                                </div>

                            </div>

                        </div>


                        <div class="row mb-2">

                            <div class="col-md-6">

                                <label class="fw-semibold">
                                    Nama
                                </label>

                                <div>
                                    {{ $dataPegawai['nama'] ?? '-' }}
                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="fw-semibold">
                                    Layanan
                                </label>

                                <div>
                                    {{ $tiket->layanan->nama_layanan ?? '-' }}
                                </div>

                            </div>

                        </div>


                        <div class="row mb-2">

                            <div class="col-md-6">

                                <label class="fw-semibold">
                                    Golongan
                                </label>

                                <div>
                                    {{ $dataPegawai['golongan'] ?? '-' }}
                                </div>

                            </div>


                            <div class="col-md-6">

                                <label class="fw-semibold">
                                    Unit Kerja
                                </label>

                                <div>
                                    {{ $dataPegawai['unit'] ?? '-' }}
                                </div>

                            </div>

                        </div>

                    </div>


                    {{-- KANAN --}}

                    <div class="col-md-4 text-center">

                        <div class="mb-2">

                            <label class="fw-bold">
                                No Tiket
                            </label>

                            <div class="fw-bold text-primary">
                                {{ $tiket->no_tiket }}
                            </div>

                        </div>


                        @if(!empty($qr))

                        <a
                            href="{{ route(
                                'tiket.qr',
                                [
                                    'no_tiket' =>
                                    $tiket->no_tiket
                                ]
                            ) }}"
                            target="_blank"
                            title="Lihat QR Tiket">

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


                {{-- =================================================
                     INFORMASI
                ================================================== --}}

                <div class="alert alert-info mb-4">

                    <div class="d-flex align-items-start">

                        <i
                            data-feather="info"
                            class="me-2 mt-1">
                        </i>

                        <div>

                            <strong>
                                Perhatian
                            </strong>

                            <div class="small mt-1">

                                Silakan upload ulang dokumen yang perlu
                                diperbaiki. Anda juga dapat mengganti
                                dokumen pada syarat lainnya jika diperlukan.

                                Status verifikasi dan komentar tidak dapat
                                diubah pada halaman ini dan tetap menjadi
                                kewenangan BKPSDM.

                            </div>

                        </div>

                    </div>

                </div>


                {{-- =================================================
                     TABLE SYARAT
                ================================================== --}}

                <div class="card shadow-none border">

                    <div class="card-body p-0">

                        <div class="table-responsive">

                            <table class="table table-hover mb-0">

                                <thead>

                                    <tr>

                                        <th>
                                            No
                                        </th>

                                        <th>
                                            Syarat
                                        </th>

                                        <th>
                                            Dokumen
                                        </th>

                                        <th>
                                            Status Verifikasi
                                        </th>

                                        <th>
                                            Catatan Admin
                                        </th>

                                        <th>
                                            Upload / Ganti
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    @forelse($detail as $i => $d)

                                    @php

                                    $dokumenReview =
                                    $d->dokumen_review ?? [];

                                    $metode =
                                    $dokumenReview['metode']
                                    ?? null;

                                    $tersedia =
                                    $dokumenReview['tersedia']
                                    ?? false;

                                    $namaDokumen =
                                    $dokumenReview['nama']
                                    ?? null;

                                    $urlDokumen =
                                    $dokumenReview['url']
                                    ?? null;

                                    $daftarDokumen =
                                    $dokumenReview['dokumen']
                                    ?? [];

                                    @endphp


                                    <tr>

                                        {{-- NO --}}

                                        <td>
                                            {{ $i + 1 }}
                                        </td>


                                        {{-- SYARAT --}}

                                        <td>

                                            <div class="fw-semibold">

                                                {{ $d->syarat->syarat ?? '-' }}

                                            </div>

                                            @if($d->syarat)

                                            <div class="small text-muted mt-1">

                                                Metode:
                                                {{ strtoupper(
                                                    $d->syarat->metode
                                                ) }}

                                            </div>

                                            @endif

                                        </td>


                                        {{-- DOKUMEN --}}

                                        <td class="efile-cell">

                                            {{-- =====================================================
         FILE LOCAL / UPLOAD
    ====================================================== --}}

                                            @if(
                                            $d->file_path &&
                                            $urlDokumen
                                            )

                                            <a
                                                href="{{ $urlDokumen }}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="btn btn-outline-primary efile-btn"
                                                title="{{ $namaDokumen }}">

                                                <i
                                                    data-feather="file-text"
                                                    class="me-1">
                                                </i>

                                                Lihat

                                            </a>


                                            {{-- =====================================================
         SIMPEG
    ====================================================== --}}

                                            @elseif(
                                            $metode === 'simpeg' &&
                                            $tersedia &&
                                            count($daftarDokumen) > 0
                                            )

                                            {{-- =================================================
             SIMPEG HANYA 1 DOKUMEN
             LANGSUNG BUKA
        ================================================== --}}

                                            @if(count($daftarDokumen) === 1)

                                            @php
                                            $dokumenSimpeg = $daftarDokumen[0];
                                            @endphp

                                            @if(!empty($dokumenSimpeg['url']))

                                            <a
                                                href="{{ $dokumenSimpeg['url'] }}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="btn btn-outline-primary efile-btn"
                                                title="{{ $dokumenSimpeg['nama'] ?? 'Dokumen SIMPEG' }}">

                                                <i
                                                    data-feather="file-text"
                                                    class="me-1">
                                                </i>

                                                Lihat

                                            </a>

                                            @else

                                            <span class="badge bg-light text-danger border">

                                                Dokumen tidak tersedia

                                            </span>

                                            @endif


                                            @else

                                            <button
                                                type="button"
                                                class="btn btn-outline-primary efile-btn btn-lihat-dokumen"
                                                data-dokumen='@json($daftarDokumen)'
                                                data-syarat="{{ $d->syarat->syarat ?? 'Dokumen SIMPEG' }}">
                                                <i data-feather="file-text" class="me-1">
                                                </i>

                                                Lihat

                                                <span class="badge bg-primary">
                                                    {{ count($daftarDokumen) }}
                                                </span>
                                            </button>

                                            @endif

                                            <!-- TIDAK TERSEDIA -->

                                            @else
                                            <span class="badge bg-light text-danger border">
                                                Dokumen belum tersedia
                                            </span>
                                            @endif
                                        </td>


                                        {{-- STATUS --}}

                                        <td>
                                            @if($d->status == 2)

                                            {{-- TIDAK VALID --}}
                                            <span class="badge bg-light text-danger border d-inline-flex align-items-center status-btl">

                                                <i
                                                    data-feather="x-circle"
                                                    style="width:13px;height:13px;"
                                                    class="me-1">
                                                </i>

                                                Tidak Valid

                                            </span>

                                            @elseif($d->status == 1)

                                            {{-- VALID --}}
                                            <span class="badge bg-light text-success border d-inline-flex align-items-center status-valid">

                                                <i
                                                    data-feather="check-circle"
                                                    style="width:13px;height:13px;"
                                                    class="me-1">
                                                </i>

                                                Valid

                                            </span>

                                            @else

                                            {{-- MENUNGGU VERIFIKASI --}}
                                            <span class="badge bg-light text-warning border d-inline-flex align-items-center">

                                                <i
                                                    data-feather="clock"
                                                    style="width:13px;height:13px;"
                                                    class="me-1">
                                                </i>

                                                Menunggu Verifikasi

                                            </span>

                                            @endif
                                        </td>


                                        {{-- COMMENT --}}
                                        {{-- READ ONLY --}}

                                        <td>

                                            @if($d->comment)

                                            <div class="small text-danger">

                                                {{ $d->comment }}

                                            </div>

                                            @else

                                            <span class="text-muted">
                                                -
                                            </span>

                                            @endif
                                        </td>

                                        {{-- UPLOAD --}}

                                        <td>
                                            <div class="upload-wrapper">
                                                <input
                                                    type="file"
                                                    name="dokumen[{{ $d->id }}]"
                                                    class="form-control form-control-sm input-dokumen"
                                                    accept="application/pdf,.pdf">

                                                <div class="small text-muted mt-1 file-info">
                                                    PDF, maksimal 1 MB
                                                </div>

                                            </div>
                                        </td>
                                    </tr>

                                    @empty

                                    <tr>
                                        <td
                                            colspan="6"
                                            class="text-center text-muted py-4">
                                            Tidak ada data syarat.
                                        </td>
                                    </tr>

                                    @endforelse

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-end mt-4">

                    <button
                        type="submit"
                        class="btn btn-primary"
                        id="btnSimpan">

                        <span id="btnSimpanNormal">
                            <i
                                data-feather="save"
                                class="me-1">
                            </i>

                            Simpan Perbaikan
                        </span>

                        <span
                            id="btnSimpanLoading"
                            class="d-none">

                            <span
                                class="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true">
                            </span>

                            Menyimpan...
                        </span>
                    </button>

                </div>

            </div>

        </div>

    </form>


    {{-- =========================================================
         MODAL DOKUMEN SIMPEG
    ========================================================== --}}

    <div
        class="modal fade"
        id="modalDokumen"
        tabindex="-1"
        aria-hidden="true">

        <div class="modal-dialog modal-lg modal-dialog-centered">

            <div class="modal-content">


                <div class="modal-header">

                    <div>

                        <h5
                            class="modal-title"
                            id="modalDokumenTitle">

                            Dokumen SIMPEG

                        </h5>

                        <div
                            class="small text-muted"
                            id="modalDokumenSubtitle">
                        </div>

                    </div>


                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal">
                    </button>

                </div>


                <div class="modal-body">


                    <div class="mb-3">

                        <label
                            class="form-label fw-semibold">

                            Tampilkan Dokumen

                        </label>


                        <select
                            id="filterDokumen"
                            class="form-select form-select-sm">

                            <option value="all">
                                Semua
                            </option>

                            <option value="latest">
                                Terbaru
                            </option>

                        </select>

                    </div>


                    <div id="dokumenList">

                        <div class="text-center text-muted py-4">

                            Memuat dokumen...

                        </div>

                    </div>

                </div>


                <div class="modal-footer">

                    <button
                        type="button"
                        class="btn btn-light"
                        data-bs-dismiss="modal">
                        <i data-feather="arrow-left" class="me-1"></i> Tutup
                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

<script>
    document.addEventListener(
        'DOMContentLoaded',
        function() {

            if (window.feather) {
                feather.replace();
            }

            const modalElement =
                document.getElementById('modalDokumen');

            const modalTitle =
                document.getElementById('modalDokumenTitle');

            const modalSubtitle =
                document.getElementById('modalDokumenSubtitle');

            const dokumenList =
                document.getElementById('dokumenList');

            const filterDokumen =
                document.getElementById('filterDokumen');

            let modal = null;

            if (modalElement) {
                modal = new bootstrap.Modal(modalElement);
            }

            let dokumenAktif = [];

            function renderDokumen(dokumen) {

                if (!dokumenList) {
                    return;
                }

                dokumenList.innerHTML = '';

                if (
                    !Array.isArray(dokumen) ||
                    dokumen.length === 0
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

                    return;
                }

                dokumen.forEach(function(doc, index) {

                    const nama =
                        doc.nama ||
                        'Dokumen ' + (index + 1);

                    const tanggal =
                        doc.tanggal || null;

                    const url =
                        doc.url || null;

                    const urutan =
                        doc.urutan ?? '-';

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

                    dokumenList.innerHTML += `
                        <div class="card border mb-2">

                            <div class="card-body py-3">

                                <div
                                    class="d-flex
                                    justify-content-between
                                    align-items-center">

                                    <div
                                        class="d-flex
                                        align-items-start">

                                        <div class="me-3">

                                            <div
                                                class="bg-light
                                                rounded
                                                p-2">

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
            }

            if (filterDokumen) {

                filterDokumen.addEventListener(
                    'change',
                    function() {

                        if (this.value === 'latest') {

                            renderDokumen(
                                dokumenAktif.length ? [dokumenAktif[0]] : []
                            );

                        } else {

                            renderDokumen(
                                dokumenAktif
                            );
                        }
                    }
                );
            }

            document
                .querySelectorAll('.btn-lihat-dokumen')
                .forEach(function(button) {

                    button.addEventListener(
                        'click',
                        function() {

                            if (!modal) {
                                return;
                            }

                            let dokumen = [];

                            try {

                                dokumen =
                                    JSON.parse(
                                        this.dataset.dokumen || '[]'
                                    );

                            } catch (error) {

                                dokumen = [];

                                console.error(error);
                            }

                            dokumenAktif =
                                Array.isArray(dokumen) ?
                                dokumen : [];

                            const syarat =
                                this.dataset.syarat ||
                                'Dokumen SIMPEG';

                            modalTitle.innerText =
                                'Dokumen SIMPEG';

                            modalSubtitle.innerText =
                                syarat;

                            if (filterDokumen) {
                                filterDokumen.value = 'all';
                            }

                            renderDokumen(dokumenAktif);

                            modal.show();
                        }
                    );
                });

            document
                .querySelectorAll('.input-dokumen')
                .forEach(function(input) {

                    input.addEventListener(
                        'change',
                        function() {

                            const file = this.files[0];

                            const info = this
                                .closest('.upload-wrapper')
                                .querySelector('.file-info');

                            const maxSize =
                                1 * 1024 * 1024;

                            if (!file) {

                                info.textContent =
                                    'PDF, maksimal 1 MB';

                                info.classList.remove(
                                    'text-danger'
                                );

                                return;
                            }

                            const isPdf =
                                file.type ===
                                'application/pdf' ||
                                file.name
                                .toLowerCase()
                                .endsWith('.pdf');

                            if (!isPdf) {

                                info.textContent =
                                    'File harus berformat PDF.';

                                info.classList.add(
                                    'text-danger'
                                );

                                this.value = '';

                                return;
                            }

                            if (file.size > maxSize) {

                                info.textContent =
                                    'Ukuran file maksimal 1 MB.';

                                info.classList.add(
                                    'text-danger'
                                );

                                this.value = '';

                                return;
                            }

                            info.textContent =
                                'PDF, maksimal 1 MB';

                            info.classList.remove(
                                'text-danger'
                            );
                        }
                    );
                });

            const formPerbaikan = document.getElementById('formPerbaikan');
            const btnSimpan = document.getElementById('btnSimpan');
            const btnSimpanNormal = document.getElementById('btnSimpanNormal');
            const btnSimpanLoading = document.getElementById('btnSimpanLoading');

            if (formPerbaikan && btnSimpan) {

                formPerbaikan.addEventListener('submit', function(e) {

                    if (!formPerbaikan.checkValidity()) {
                        e.preventDefault();
                        formPerbaikan.reportValidity();
                        return;
                    }

                    btnSimpan.disabled = true;

                    btnSimpanNormal.classList.add('d-none');
                    btnSimpanLoading.classList.remove('d-none');
                });
            }
        }
    );
</script>

@endsection