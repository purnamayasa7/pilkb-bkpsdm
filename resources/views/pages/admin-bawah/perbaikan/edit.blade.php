@extends('layouts.app')

@section('content')

<style>
    /* =========================================================
       E-FILE TABLE
    ========================================================= */

    .efile-cell {
        width: 100px;
        min-width: 100px;
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


    /* =========================================================
       SEMUA BUTTON E-FILE / LIHAT
    ========================================================= */

    .efile-btn {
        position: relative;

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

        font-size: 0.8125rem !important;
        font-weight: 600 !important;

        line-height: 1 !important;

        gap: 4px;

        white-space: nowrap;

        vertical-align: middle;
    }


    /* =========================================================
       BUTTON LIHAT DOKUMEN SIMPEG
    ========================================================= */

    .btn-lihat-dokumen {
        position: relative;

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

        font-size: 0.8125rem !important;
        font-weight: 600 !important;

        line-height: 1 !important;

        gap: 4px;

        white-space: nowrap;

        vertical-align: middle;
    }


    /* =========================================================
       ICON BUTTON
    ========================================================= */

    .efile-btn svg,
    .btn-lihat-dokumen svg {
        width: 14px !important;
        height: 14px !important;

        min-width: 14px;
        max-width: 14px;

        flex-shrink: 0;
    }


    /* =========================================================
       BADGE JUMLAH DOKUMEN
    ========================================================= */

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

        font-size: 0.65rem !important;
        font-weight: 600;

        line-height: 1 !important;

        z-index: 2;
    }


    /* =========================================================
       STATUS DOKUMEN
    ========================================================= */

    .efile-status {
        display: inline-flex;

        align-items: center;
        justify-content: center;

        gap: 5px;
    }


    /* =========================================================
       BADGE DOKUMEN TIDAK TERSEDIA
    ========================================================= */

    .efile-cell>.badge {
        min-width: 90px;

        min-height: 31px;

        display: inline-flex;

        align-items: center;
        justify-content: center;

        box-sizing: border-box;

        font-size: 0.75rem;
        font-weight: 500;

        padding: 0.4rem 0.55rem;
    }


    /* =========================================================
       TABLE REVIEW
    ========================================================= */

    .table-hover tbody tr {
        transition: background-color .15s ease;
    }

    .table-hover tbody tr:hover {
        background-color: rgba(13, 110, 253, .025);
    }

    .table thead th {
        vertical-align: middle;

        white-space: nowrap;

        font-size: 0.8125rem;
        font-weight: 600;
    }

    .table tbody td {
        vertical-align: middle;

        font-size: 0.875rem;
    }


    /* =========================================================
       KOLOM E-FILE
    ========================================================= */

    .table th:nth-child(3),
    .table td:nth-child(3) {
        width: 100px !important;
        min-width: 100px !important;

        text-align: center !important;
        vertical-align: middle !important;
    }


    /* =========================================================
       KOLOM VERIFIKASI
    ========================================================= */

    .table th:nth-child(4),
    .table td:nth-child(4) {
        text-align: center;
        vertical-align: middle;
    }


    /* =========================================================
       WRAPPER CHECKBOX
    ========================================================= */

    .table td .d-flex.justify-content-center {
        min-height: 31px;

        display: flex !important;

        align-items: center !important;
        justify-content: center !important;
    }


    /* =========================================================
       CHECKBOX
    ========================================================= */

    .checkSyarat {
        width: 1.15rem;
        height: 1.15rem;

        cursor: pointer;
    }


    /* =========================================================
       COMMENT
    ========================================================= */

    .comment-input {
        min-width: 180px;
    }


    /* =========================================================
       MODAL DOKUMEN SIMPEG
    ========================================================= */

    .dokumen-item {
        border: 1px solid #e5e7eb;

        border-radius: 8px;

        transition: all .2s ease;
    }

    .dokumen-item:hover {
        border-color: #cbd5e1;

        background-color: #f8fafc;
    }


    /* =========================================================
       ICON DOKUMEN
    ========================================================= */

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


    /* =========================================================
       NAMA DOKUMEN
    ========================================================= */

    .dokumen-nama {
        font-weight: 600;

        line-height: 1.4;

        word-break: break-word;
    }


    /* =========================================================
       META DOKUMEN
    ========================================================= */

    .dokumen-meta {
        font-size: 0.8125rem;

        color: #6b7280;
    }


    /* =========================================================
       BUTTON LIHAT DI MODAL
    ========================================================= */

    .dokumen-lihat {
        min-width: 75px;

        white-space: nowrap;
    }


    /* =========================================================
       EMPTY STATE MODAL
    ========================================================= */

    .dokumen-empty {
        padding: 40px 20px;

        text-align: center;

        color: #6b7280;
    }

    .dokumen-empty svg {
        width: 40px;
        height: 40px;

        margin-bottom: 10px;
    }
</style>


{{-- ================================================================
     PAGE HEADER
================================================================ --}}

<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">

    <div class="container-fluid px-4">

        <div class="page-header-content">

            <div class="row align-items-center justify-content-between pt-3">


                {{-- TITLE --}}

                <div class="col-auto mb-3">

                    <h1 class="page-header-title">

                        <div class="page-header-icon">

                            <i data-feather="edit"></i>

                        </div>

                        Review Perbaikan Usulan

                    </h1>

                </div>


                {{-- BACK BUTTON --}}

                <div class="col-12 col-xl-auto mb-3">

                    <a
                        class="btn btn-sm btn-light text-primary"
                        href="{{ url()->previous() }}">

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


    {{-- =============================================================
         FORM
    ============================================================= --}}

    <form
        id="formPerbaikan"
        method="POST"
        action="{{ route('adminBawah.perbaikan.submitReview', $tiket->no_tiket) }}">

        @csrf


        <div class="card mb-4">


            {{-- =====================================================
                 CARD HEADER
            ====================================================== --}}

            <div class="card-header bg-gradient-primary-to-secondary text-white">

                Detail Tiket

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


                        {{-- NIP / BIDANG --}}

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



                        {{-- NAMA / LAYANAN --}}

                        <div class="row mb-2">


                            <div class="col-md-6">

                                <label class="fw-semibold">

                                    Nama

                                </label>

                                <div>

                                    {{ $tiket->nama ?? '-' }}

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



                        {{-- GOLONGAN / UNIT KERJA --}}

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

                                    {{ $tiket->nama_ukerja ?? '-' }}

                                </div>

                            </div>

                        </div>

                    </div>



                    {{-- =================================================
                         KANAN / QR
                    ================================================== --}}

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
                            href="{{ route('tiket.public', ['no_tiket' => $tiket->no_tiket]) }}"
                            target="_blank"
                            title="Buka tiket publik">


                            <img
                                src="data:image/svg+xml;base64,{{ $qr }}"
                                alt="QR Tiket"
                                width="160"
                                height="160">


                        </a>

                        <div class="small mt-2">

                            Klik QR untuk membuka tiket

                        </div>

                        @endif

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

                                        <th width="65">
                                            E-file
                                        </th>

                                        <th>
                                            Verifikasi
                                        </th>

                                        <th>
                                            Comment
                                        </th>

                                    </tr>

                                </thead>



                                <tbody>


                                    @forelse ($detail as $i => $d)


                                    <tr>


                                        {{-- =================================================
                                             NO
                                        ================================================== --}}

                                        <td>

                                            {{ $i + 1 }}

                                        </td>



                                        {{-- =================================================
                                             SYARAT
                                        ================================================== --}}

                                        <td>

                                            {{ $d->syarat->syarat ?? '-' }}

                                        </td>



                                        {{-- =================================================
                                             E-FILE
                                        ================================================== --}}

                                        <td class="text-center">


                                            @php

                                            $dokumenReview =
                                            $d->dokumen_review ?? [];

                                            $metode =
                                            $dokumenReview['metode'] ?? null;

                                            $tersedia =
                                            $dokumenReview['tersedia'] ?? false;

                                            $namaDokumen =
                                            $dokumenReview['nama'] ?? null;

                                            $urlDokumen =
                                            $dokumenReview['url'] ?? null;

                                            $daftarDokumen =
                                            $dokumenReview['dokumen'] ?? [];

                                            @endphp



                                            {{-- =================================================
                                                 METODE UPLOAD
                                            ================================================== --}}

                                            @if($metode === 'upload')


                                            @if($tersedia && $urlDokumen)


                                            <a
                                                href="{{ $urlDokumen }}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="btn btn-outline-primary efile-btn"
                                                title="{{ $namaDokumen ?? 'Lihat dokumen' }}">


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



                                            {{-- =================================================
                                                 METODE SIMPEG
                                            ================================================== --}}

                                            @elseif($metode === 'simpeg')


                                            @if($tersedia && count($daftarDokumen) > 0)


                                            {{-- =================================================
                                                         SIMPEG SATU DOKUMEN
                                                    ================================================== --}}

                                            @if(count($daftarDokumen) === 1)


                                            @php

                                            $dokumenSimpeg =
                                            $daftarDokumen[0] ?? [];

                                            $urlSimpeg =
                                            $dokumenSimpeg['url'] ?? null;

                                            $namaSimpeg =
                                            $dokumenSimpeg['nama']
                                            ?? 'Dokumen SIMPEG';

                                            @endphp


                                            @if($urlSimpeg)


                                            <a
                                                href="{{ $urlSimpeg }}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="btn btn-outline-primary efile-btn"
                                                title="{{ $namaSimpeg }}">


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



                                            {{-- =================================================
                                                         SIMPEG LEBIH DARI SATU
                                                    ================================================== --}}

                                            @else


                                            <button
                                                type="button"
                                                class="btn btn-outline-primary efile-btn btn-lihat-dokumen"
                                                data-dokumen='@json($daftarDokumen)'
                                                data-syarat="{{ $d->syarat->syarat ?? 'Dokumen SIMPEG' }}">


                                                <i
                                                    data-feather="file-text"
                                                    class="me-1">
                                                </i>


                                                Lihat


                                                <span class="badge bg-primary">

                                                    {{ count($daftarDokumen) }}

                                                </span>


                                            </button>


                                            @endif


                                            @else


                                            <span class="badge bg-light text-danger border">

                                                Dokumen tidak tersedia

                                            </span>


                                            @endif



                                            {{-- =================================================
                                                 METODE TIDAK DIKENAL
                                            ================================================== --}}

                                            @else


                                            <span class="badge bg-light text-muted border">

                                                -

                                            </span>


                                            @endif

                                        </td>



                                        {{-- =================================================
                                             VERIFIKASI
                                        ================================================== --}}

                                        <td>


                                            <input
                                                type="hidden"
                                                name="detail_id[]"
                                                value="{{ $d->id }}">


                                            <div class="d-flex justify-content-center align-items-center">


                                                <input
                                                    type="checkbox"
                                                    class="form-check-input checkSyarat"
                                                    name="status[{{ $d->id }}]"
                                                    data-id="{{ $d->id }}"
                                                    {{ $d->status != 2 ? 'checked' : '' }}>


                                            </div>

                                        </td>



                                        {{-- =================================================
                                             COMMENT
                                        ================================================== --}}

                                        <td>


                                            <div class="comment-wrapper">


                                                <input
                                                    type="text"
                                                    name="comment[{{ $d->id }}]"
                                                    class="form-control form-control-sm comment-input"
                                                    value="{{ $d->comment }}"
                                                    placeholder="Isi alasan"
                                                    style="{{ $d->status == 2 ? '' : 'display:none;' }}">


                                                <span
                                                    class="comment-text"
                                                    style="{{ $d->status == 2 ? 'display:none;' : '' }}">

                                                    -

                                                </span>


                                            </div>

                                        </td>


                                    </tr>


                                    @empty


                                    <tr>

                                        <td
                                            colspan="5"
                                            class="text-center text-muted py-4">

                                            Tidak ada data

                                        </td>

                                    </tr>


                                    @endforelse


                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>



                {{-- =================================================
                     BUTTON SIMPAN
                ================================================== --}}

                <div class="d-flex justify-content-end mt-4">


                    <button
                        type="submit"
                        class="btn btn-primary me-2"
                        id="btnSimpan">


                        <span id="btnSimpanNormal">

                            <i
                                data-feather="save"
                                class="me-1">
                            </i>

                            Simpan

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



    {{-- =============================================================
         MODAL DOKUMEN SIMPEG
    ============================================================= --}}

    <div
        class="modal fade"
        id="modalDokumen"
        tabindex="-1"
        aria-hidden="true">


        <div class="modal-dialog modal-lg modal-dialog-centered">


            <div class="modal-content">


                {{-- HEADER --}}

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
                        data-bs-dismiss="modal"
                        aria-label="Close">
                    </button>


                </div>



                {{-- BODY --}}

                <div class="modal-body">


                    {{-- FILTER --}}

                    <div class="mb-3">


                        <label
                            for="filterDokumen"
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



                    {{-- LIST --}}

                    <div id="dokumenList">


                        <div class="text-center text-muted py-4">

                            Memuat dokumen...

                        </div>


                    </div>

                </div>



                {{-- FOOTER --}}

                <div class="modal-footer">


                    <button
                        type="button"
                        class="btn btn-light"
                        data-bs-dismiss="modal">

                        Tutup

                    </button>


                </div>

            </div>

        </div>

    </div>

</div>



<script>
    document.addEventListener('DOMContentLoaded', function() {


        /* =========================================================
           FEATHER
        ========================================================= */

        if (window.feather) {

            feather.replace();

        }



        /* =========================================================
           CHECKBOX SYARAT
        ========================================================= */

        document.addEventListener('change', function(e) {


            const checkbox =
                e.target.closest('.checkSyarat');


            if (!checkbox) {

                return;

            }


            const row =
                checkbox.closest('tr');


            const input =
                row.querySelector('.comment-input');


            const text =
                row.querySelector('.comment-text');


            if (!input || !text) {

                return;

            }


            if (checkbox.checked) {


                input.style.display =
                    'none';


                text.style.display =
                    '';


                input.value =
                    '';


            } else {


                input.style.display =
                    '';


                text.style.display =
                    'none';


            }

        });



        /* =========================================================
           MODAL DOKUMEN SIMPEG
        ========================================================= */

        const modalDokumenEl =
            document.getElementById('modalDokumen');


        const modalDokumenTitle =
            document.getElementById('modalDokumenTitle');


        const modalDokumenSubtitle =
            document.getElementById('modalDokumenSubtitle');


        const dokumenList =
            document.getElementById('dokumenList');


        const filterDokumen =
            document.getElementById('filterDokumen');


        let modalDokumen = null;


        if (modalDokumenEl) {

            modalDokumen =
                new bootstrap.Modal(modalDokumenEl);

        }



        /* =========================================================
           DATA DOKUMEN AKTIF
        ========================================================= */

        let dokumenAktif = [];



        /* =========================================================
           RENDER DOKUMEN
        ========================================================= */

        function renderDokumen(dokumen) {


            if (!dokumenList) {

                return;

            }


            dokumenList.innerHTML = '';



            /* -----------------------------------------------------
               EMPTY
            ----------------------------------------------------- */

            if (
                !Array.isArray(dokumen) ||
                dokumen.length === 0
            ) {


                dokumenList.innerHTML = `

                    <div class="dokumen-empty">

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



            /* -----------------------------------------------------
               RENDER
            ----------------------------------------------------- */

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



                /* -------------------------------------------------
                   TANGGAL
                ------------------------------------------------- */

                let tanggalHtml = '';


                if (tanggal) {


                    tanggalHtml = `

                        <div class="dokumen-meta mt-1">

                            <i
                                data-feather="calendar"
                                class="me-1"
                                style="width:14px;height:14px;">
                            </i>

                            ${escapeHtml(tanggal)}

                        </div>

                    `;

                }



                /* -------------------------------------------------
                   BUTTON
                ------------------------------------------------- */

                let buttonHtml = '';


                if (url) {


                    buttonHtml = `

                        <a
                            href="${escapeAttribute(url)}"
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

                            Dokumen tidak tersedia

                        </span>

                    `;

                }



                /* -------------------------------------------------
                   CARD DOKUMEN
                ------------------------------------------------- */

                dokumenList.innerHTML += `

                    <div class="dokumen-item mb-2">

                        <div class="p-3">

                            <div
                                class="d-flex
                                       justify-content-between
                                       align-items-center">


                                <div
                                    class="d-flex
                                           align-items-start
                                           flex-grow-1">


                                    <div class="dokumen-icon me-3">

                                        <i
                                            data-feather="file-text"
                                            class="text-primary">
                                        </i>

                                    </div>


                                    <div class="flex-grow-1">


                                        <div class="dokumen-nama">

                                            ${escapeHtml(nama)}

                                        </div>


                                        <div class="dokumen-meta">

                                            Urutan: ${escapeHtml(String(urutan))}

                                        </div>


                                        ${tanggalHtml}


                                    </div>

                                </div>


                                <div class="ms-3">

                                    ${buttonHtml}

                                </div>


                            </div>

                        </div>

                    </div>

                `;

            });



            /* -----------------------------------------------------
               REFRESH FEATHER
            ----------------------------------------------------- */

            if (window.feather) {

                feather.replace();

            }

        }



        /* =========================================================
           FILTER
        ========================================================= */

        if (filterDokumen) {


            filterDokumen.addEventListener(
                'change',
                function() {


                    const value =
                        this.value;


                    if (value === 'latest') {


                        /*
                         * Controller sudah mengurutkan dokumen
                         * berdasarkan urutan DESC.
                         */

                        renderDokumen(

                            dokumenAktif.length > 0 ?
                            [dokumenAktif[0]] :
                            []

                        );


                    } else {


                        renderDokumen(

                            dokumenAktif

                        );

                    }

                }
            );

        }



        /* =========================================================
           TOMBOL LIHAT DOKUMEN
        ========================================================= */

        document
            .querySelectorAll('.btn-lihat-dokumen')
            .forEach(function(button) {


                button.addEventListener(
                    'click',
                    function() {


                        if (
                            !modalDokumen ||
                            !dokumenList
                        ) {


                            console.error(
                                'Modal dokumen tidak ditemukan.'
                            );


                            return;

                        }



                        /* -------------------------------------------------
                           BACA DATA
                        ------------------------------------------------- */

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


                        dokumenAktif =
                            Array.isArray(dokumen) ?
                            dokumen :
                            [];



                        /* -------------------------------------------------
                           NAMA SYARAT
                        ------------------------------------------------- */

                        const syarat =
                            this.dataset.syarat ||
                            'Dokumen SIMPEG';



                        modalDokumenTitle.innerText =
                            'Dokumen SIMPEG';


                        modalDokumenSubtitle.innerText =
                            syarat;



                        /* -------------------------------------------------
                           RESET FILTER
                        ------------------------------------------------- */

                        if (filterDokumen) {

                            filterDokumen.value =
                                'all';

                        }



                        /* -------------------------------------------------
                           RENDER SEMUA
                        ------------------------------------------------- */

                        renderDokumen(
                            dokumenAktif
                        );



                        /* -------------------------------------------------
                           SHOW MODAL
                        ------------------------------------------------- */

                        modalDokumen.show();

                    }
                );

            });



        /* =========================================================
           SPINNER SUBMIT
        ========================================================= */

        const formReview =
            document.getElementById('formPerbaikan');


        const btnSimpan =
            document.getElementById('btnSimpan');


        const btnSimpanNormal =
            document.getElementById('btnSimpanNormal');


        const btnSimpanLoading =
            document.getElementById('btnSimpanLoading');



        if (
            formReview &&
            btnSimpan &&
            btnSimpanNormal &&
            btnSimpanLoading
        ) {


            formReview.addEventListener(
                'submit',
                function(e) {


                    if (btnSimpan.disabled) {

                        e.preventDefault();

                        return;

                    }


                    btnSimpanNormal.classList.add(
                        'd-none'
                    );


                    btnSimpanLoading.classList.remove(
                        'd-none'
                    );


                    btnSimpan.disabled =
                        true;

                }
            );

        }

    });



    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }


    /* =========================================================
       ESCAPE ATTRIBUTE
    ========================================================= */

    function escapeAttribute(value) {

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    }
</script>

@endsection