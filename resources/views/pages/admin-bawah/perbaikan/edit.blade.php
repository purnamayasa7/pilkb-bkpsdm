@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/tiket.css') }}">
@endpush

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon">
                            <i data-feather="edit"></i>
                        </div>
                        Review Perbaikan Usulan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                        <i class="me-1" data-feather="arrow-left"></i>
                        Kembali ke List Perbaikan
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4">
    <form id="formPerbaikan" method="POST" action="{{ route('adminBawah.perbaikan.submitReview', $tiket->no_tiket) }}">
        @csrf

        {{-- INFORMASI PEMOHON & QR CODE (STEP 4 STYLE) --}}
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
                                <div class="fw-bold">{{ $tiket->nama ?? ($dataPegawai['nama'] ?? '-') }}</div>
                            </div>
                            <div class="col-sm-6">
                                <div class="small text-muted mb-1">Nama Layanan</div>
                                <div class="fw-bold text-primary">{{ $tiket->layanan->nama_layanan ?? '-' }}</div>
                            </div>
                            <div class="col-sm-6">
                                <div class="small text-muted mb-1">Golongan</div>
                                <div class="fw-bold">{{ $dataPegawai['golongan'] ?? '-' }}</div>
                            </div>
                            <div class="col-sm-6">
                                <div class="small text-muted mb-1">Unit Kerja</div>
                                <div class="fw-bold">{{ $tiket->nama_ukerja ?? ($dataPegawai['unit'] ?? '-') }}</div>
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
                        <h4 class="fw-bold text-primary mb-3">
                            {{ $tiket->no_tiket }}
                        </h4>

                        @if(!empty($qr))
                        <div class="ticket-qr-frame mb-2">
                            <a href="{{ route('tiket.public', ['no_tiket' => $tiket->no_tiket]) }}" target="_blank" title="Buka tiket publik">
                                <img src="data:image/svg+xml;base64,{{ $qr }}" width="140" height="140" alt="QR Code">
                            </a>
                        </div>
                        <div class="text-muted small">
                            <i data-feather="maximize-2" style="width: 12px; height: 12px;" class="me-1"></i> Klik QR untuk membuka tiket
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        {{-- TABLE SYARAT & REVIEW (STEP 4 STYLE) --}}
        <div class="card summary-info-card border shadow-none mb-4">
            <div class="card-header py-2 px-3 fw-bold small d-flex align-items-center">
                <i data-feather="check-square" class="me-2 text-primary" style="width: 16px; height: 16px;"></i>
                Daftar Persyaratan & Validasi Perbaikan
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 table-checklist">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 55px;" class="text-center">No</th>
                                <th>Persyaratan Dokumen</th>
                                <th class="text-center text-nowrap" style="width: 180px;">E-File / Berkas</th>
                                <th class="text-center" style="width: 110px;">Verifikasi</th>
                                <th style="min-width: 200px;">Catatan / Alasan</th>
                            </tr>
                        </thead>

                        <tbody>
                            @forelse ($detail as $i => $d)
                            <tr>
                                {{-- NO --}}
                                <td class="text-center fw-semibold text-muted">
                                    {{ $i + 1 }}
                                </td>

                                {{-- SYARAT --}}
                                <td>
                                    <div class="fw-semibold">
                                        {{ $d->syarat->syarat ?? '-' }}
                                    </div>
                                    @if(optional($d->syarat)->deskripsi)
                                    <div class="small text-muted mt-1">
                                        {{ $d->syarat->deskripsi }}
                                    </div>
                                    @endif
                                </td>

                                {{-- E-FILE --}}
                                <td class="efile-cell">
                                    @php
                                    $dokumenReview = $d->dokumen_review ?? [];
                                    $metode = $dokumenReview['metode'] ?? null;
                                    $tersedia = $dokumenReview['tersedia'] ?? false;
                                    $namaDokumen = $dokumenReview['nama'] ?? null;
                                    $urlDokumen = $dokumenReview['url'] ?? null;
                                    $daftarDokumen = $dokumenReview['dokumen'] ?? [];
                                    @endphp

                                    @if($metode === 'upload')
                                        @if($tersedia && $urlDokumen)
                                        <div class="efile-action">
                                            <a href="{{ $urlDokumen }}" target="_blank" rel="noopener noreferrer"
                                                class="btn btn-sm btn-outline-primary efile-btn"
                                                title="{{ $namaDokumen ?? 'Lihat dokumen' }}">
                                                <i data-feather="file-text"></i>
                                                Lihat
                                            </a>
                                        </div>
                                        @else
                                        <div class="efile-action">
                                            <span class="badge bg-light text-danger border">
                                                Dokumen tidak tersedia
                                            </span>
                                        </div>
                                        @endif
                                    @elseif($metode === 'simpeg')
                                        @if($tersedia && count($daftarDokumen) > 0)
                                            @if(count($daftarDokumen) === 1)
                                                @php
                                                $dokumenSimpeg = $daftarDokumen[0] ?? [];
                                                $urlSimpeg = $dokumenSimpeg['url'] ?? null;
                                                $namaSimpeg = $dokumenSimpeg['nama'] ?? 'Dokumen SIMPEG';
                                                @endphp

                                                @if($urlSimpeg)
                                                <div class="efile-action">
                                                    <a href="{{ $urlSimpeg }}" target="_blank" rel="noopener noreferrer"
                                                        class="btn btn-sm btn-outline-primary efile-btn"
                                                        title="{{ $namaSimpeg }}">
                                                        <i data-feather="file-text"></i>
                                                        Lihat
                                                    </a>
                                                </div>
                                                @else
                                                <div class="efile-action">
                                                    <span class="badge bg-light text-danger border">
                                                        Dokumen tidak tersedia
                                                    </span>
                                                </div>
                                                @endif
                                            @else
                                                <div class="efile-action">
                                                    <button type="button"
                                                        class="btn btn-sm btn-outline-primary efile-btn btn-lihat-dokumen"
                                                        data-dokumen='@json($daftarDokumen)'
                                                        data-syarat="{{ $d->syarat->syarat ?? 'Dokumen SIMPEG' }}">
                                                        <i data-feather="file-text"></i>
                                                        Lihat
                                                        <span class="badge bg-primary ms-1">
                                                            {{ count($daftarDokumen) }}
                                                        </span>
                                                    </button>
                                                </div>
                                            @endif
                                        @else
                                        <div class="efile-action">
                                            <span class="badge bg-light text-danger border">
                                                Dokumen tidak tersedia
                                            </span>
                                        </div>
                                        @endif
                                    @else
                                    <div class="efile-action">
                                        <span class="badge bg-light text-muted border">
                                            -
                                        </span>
                                    </div>
                                    @endif
                                </td>

                                {{-- VERIFIKASI --}}
                                <td class="text-center">
                                    <input type="hidden" name="detail_id[]" value="{{ $d->id }}">
                                    <div class="d-flex justify-content-center align-items-center">
                                        <input type="checkbox" class="form-check-input checkSyarat"
                                            name="status[{{ $d->id }}]"
                                            data-id="{{ $d->id }}"
                                            {{ $d->status == 1 ? 'checked' : '' }}>
                                    </div>
                                </td>

                                {{-- COMMENT --}}
                                <td>
                                    <div class="comment-wrapper">
                                        <input type="text" name="comment[{{ $d->id }}]"
                                            class="form-control form-control-sm comment-input"
                                            value="{{ $d->comment }}" placeholder="Isi alasan jika tidak valid..."
                                            style="{{ $d->status == 2 ? '' : 'display:none;' }}">

                                        <span class="comment-text text-muted small"
                                            style="{{ $d->status == 2 ? 'display:none;' : '' }}">
                                            <i data-feather="check-circle" class="text-success me-1" style="width: 14px; height: 14px;"></i>
                                            Tervalidasi
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center text-muted py-4">
                                    Tidak ada data persyaratan untuk tiket ini.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {{-- BUTTONS (RESPONSIVE) --}}
        <div class="d-flex justify-content-end gap-2 pt-3 border-top wizard-actions-end">
            <button type="submit" class="btn btn-primary px-4 d-inline-flex align-items-center" id="btnSimpan">
                <span id="btnSimpanNormal" class="d-inline-flex align-items-center">
                    <i data-feather="save" class="me-2"></i>
                    Simpan Hasil Review
                </span>
                <span id="btnSimpanLoading" class="d-none d-inline-flex align-items-center">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Menyimpan...
                </span>
            </button>
        </div>
    </form>
</div>

{{-- MODAL DOKUMEN SIMPEG --}}
<div class="modal fade" id="modalDokumen" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h5 class="modal-title mb-1" id="modalDokumenTitle">Dokumen SIMPEG</h5>
                    <div class="small text-muted" id="modalDokumenSubtitle">-</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <div class="mb-3">
                    <label for="filterDokumen" class="form-label fw-semibold small">Tampilkan Dokumen</label>
                    <select id="filterDokumen" class="form-select form-select-sm">
                        <option value="all">Semua</option>
                        <option value="latest">Terbaru</option>
                    </select>
                </div>

                <div id="dokumenList">
                    <div class="text-center text-muted py-4">Memuat dokumen...</div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="x" class="me-1"></i> Tutup
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttribute(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (window.feather) {
            feather.replace();
        }

        // TOGGLE COMMENT BERDASARKAN CHECKBOX
        document.addEventListener('change', function(e) {
            const checkbox = e.target.closest('.checkSyarat');
            if (!checkbox) return;

            const row = checkbox.closest('tr');
            const input = row.querySelector('.comment-input');
            const text = row.querySelector('.comment-text');
            if (!input || !text) return;

            if (checkbox.checked) {
                input.style.display = 'none';
                text.style.display = '';
                input.value = '';
            } else {
                input.style.display = '';
                text.style.display = 'none';
                input.focus();
            }
        });

        // MODAL DOKUMEN SIMPEG
        const modalDokumenEl = document.getElementById('modalDokumen');
        const modalDokumenTitle = document.getElementById('modalDokumenTitle');
        const modalDokumenSubtitle = document.getElementById('modalDokumenSubtitle');
        const dokumenList = document.getElementById('dokumenList');
        const filterDokumen = document.getElementById('filterDokumen');

        let modalDokumen = modalDokumenEl ? new bootstrap.Modal(modalDokumenEl) : null;
        let dokumenAktif = [];

        function renderDokumen(dokumen) {
            if (!dokumenList) return;
            dokumenList.innerHTML = '';

            if (!Array.isArray(dokumen) || dokumen.length === 0) {
                dokumenList.innerHTML = `
                    <div class="text-center text-muted py-5">
                        <i data-feather="file" style="width:40px;height:40px;"></i>
                        <div class="mt-2">Tidak ada dokumen tersedia.</div>
                    </div>
                `;
                if (window.feather) feather.replace();
                return;
            }

            dokumen.forEach(function(doc, index) {
                const nama = doc.nama || 'Dokumen ' + (index + 1);
                const tanggal = doc.tanggal || null;
                const url = doc.url || null;
                const urutan = doc.urutan ?? '-';

                let tanggalHtml = tanggal ? `
                    <div class="small text-muted mt-1">
                        <i data-feather="calendar" class="me-1" style="width:14px;height:14px;"></i>
                        ${escapeHtml(tanggal)}
                    </div>
                ` : '';

                let buttonHtml = url ? `
                    <a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary dokumen-lihat">
                        <i data-feather="eye" class="me-1"></i> Lihat
                    </a>
                ` : `
                    <span class="badge bg-light text-danger border">Dokumen tidak tersedia</span>
                `;

                dokumenList.innerHTML += `
                    <div class="card border mb-2 dokumen-item">
                        <div class="card-body py-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex align-items-start">
                                    <div class="me-3">
                                        <div class="dokumen-icon">
                                            <i data-feather="file-text" class="text-primary"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="fw-semibold dokumen-nama">${escapeHtml(nama)}</div>
                                        <div class="small text-muted">Urutan: ${escapeHtml(String(urutan))}</div>
                                        ${tanggalHtml}
                                    </div>
                                </div>
                                <div>${buttonHtml}</div>
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
            filterDokumen.addEventListener('change', function() {
                if (this.value === 'latest') {
                    renderDokumen(dokumenAktif.length > 0 ? [dokumenAktif[0]] : []);
                } else {
                    renderDokumen(dokumenAktif);
                }
            });
        }

        document.querySelectorAll('.btn-lihat-dokumen').forEach(function(button) {
            button.addEventListener('click', function() {
                if (!modalDokumen || !dokumenList) return;

                let dokumen = [];
                try {
                    dokumen = JSON.parse(this.dataset.dokumen || '[]');
                } catch (error) {
                    dokumen = [];
                }

                dokumenAktif = Array.isArray(dokumen) ? dokumen : [];
                modalDokumenTitle.innerText = 'Dokumen SIMPEG';
                modalDokumenSubtitle.innerText = this.dataset.syarat || 'Dokumen SIMPEG';

                if (filterDokumen) {
                    filterDokumen.value = 'all';
                }

                renderDokumen(dokumenAktif);
                modalDokumen.show();
            });
        });

        // SPINNER SUBMIT
        const formReview = document.getElementById('formPerbaikan');
        const btnSimpan = document.getElementById('btnSimpan');
        const btnSimpanNormal = document.getElementById('btnSimpanNormal');
        const btnSimpanLoading = document.getElementById('btnSimpanLoading');

        if (formReview && btnSimpan && btnSimpanNormal && btnSimpanLoading) {
            formReview.addEventListener('submit', function(e) {
                if (btnSimpan.disabled) {
                    e.preventDefault();
                    return;
                }
                btnSimpanNormal.classList.add('d-none');
                btnSimpanLoading.classList.remove('d-none');
                btnSimpan.disabled = true;
            });
        }
    });
</script>
@endsection