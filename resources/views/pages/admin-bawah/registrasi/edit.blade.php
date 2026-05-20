@extends('layouts.app')

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
                            Review Usulan
                        </h1>
                    </div>

                    <div class="col-12 col-xl-auto mb-3">
                        <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                            <i class="me-1" data-feather="arrow-left"></i>
                            Kembali ke List Permintaan
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </header>

    <div class="container-fluid px-4">

        <form method="POST" action="{{ route('adminBawah.permintaan.submitPermintaan', $tiket->no_tiket) }}">
            @csrf
            <div class="card mb-4">

                <div class="card-header bg-gradient-primary-to-secondary text-white">
                    Detail Tiket
                </div>

                <div class="card-body">

                    {{-- DATA DIRI --}}
                    <div class="row mb-4">

                        {{-- KIRI --}}
                        <div class="col-md-8">

                            <h6 class="fw-bold mb-3">Data Diri</h6>

                            <div class="row mb-2">
                                <div class="col-md-6">
                                    <label class="fw-semibold">NIP</label>
                                    <div>{{ $tiket->nip ?? '-' }}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="fw-semibold">Bidang</label>
                                    <div>{{ $tiket->layanan->bidang->nama_bidang ?? '-' }}</div>
                                </div>
                            </div>

                            <div class="row mb-2">
                                <div class="col-md-6">
                                    <label class="fw-semibold">Nama</label>
                                    <div>{{ $dataPegawai['nama'] ?? '-' }}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="fw-semibold">Layanan</label>
                                    <div>{{ $tiket->layanan->nama_layanan ?? '-' }}</div>
                                </div>
                            </div>

                            <div class="row mb-2">
                                <div class="col-md-6">
                                    <label class="fw-semibold">Golongan</label>
                                    <div>{{ $dataPegawai['golongan'] ?? '-' }}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="fw-semibold">Unit Kerja</label>
                                    <div>{{ $dataPegawai['unit'] ?? '-' }}</div>
                                </div>
                            </div>

                        </div>

                        {{-- KANAN --}}
                        <div class="col-md-4 text-center">

                            <div class="mb-2">
                                <label class="fw-bold">No Tiket</label>
                                <div class="fw-bold text-primary">
                                    {{ $tiket->no_tiket }}
                                </div>
                            </div>

                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data={{ $tiket->no_tiket }}">
                        </div>

                    </div>


                    {{-- TABLE SYARAT --}}
                    <div class="card shadow-none">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Syarat</th>
                                            <th width='65'>E-file</th>
                                            <th>Verifikasi</th>
                                            <th>Comment</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        @forelse ($detail as $i => $d)
                                            <tr>
                                                <td>{{ $i + 1 }}</td>
                                                <td>{{ $d->syarat->syarat ?? '-' }}</td>
                                                <td class="text-center">
                                                    <a class="btn btn-sm {{ $d->status == 2 ? 'btn-light text-danger' : 'btn-light text-success' }} btnEditStatus"
                                                        href="#">

                                                        <i class="me-1"
                                                            data-feather="{{ $d->status == 1 ? 'check' : 'x' }}"></i>
                                                    </a>
                                                </td>
                                                <td>
                                                    <input type="hidden" name="detail_id[]" value="{{ $d->id }}">

                                                    <div class="d-flex justify-content-center align-items-center">
                                                        <input type="checkbox" class="form-check-input checkSyarat"
                                                            name="status[{{ $d->id }}]"
                                                            data-id="{{ $d->id }}"
                                                            {{ $d->status == 1 ? 'checked' : '' }}>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="comment-wrapper">
                                                        <input type="text" name="comment[{{ $d->id }}]"
                                                            class="form-control form-control-sm comment-input"
                                                            value="{{ $d->comment }}" placeholder="Isi alasan"
                                                            style="{{ $d->status == 2 ? '' : 'display:none;' }}">

                                                        <span class="comment-text"
                                                            style="{{ $d->status == 2 ? 'display:none;' : '' }}">
                                                            -
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        @empty
                                            <tr>
                                                <td colspan="5" class="text-center text-muted">
                                                    Tidak ada data
                                                </td>
                                            </tr>
                                        @endforelse
                                    </tbody>

                                </table>

                            </div>
                        </div>
                    </div>


                    {{-- BUTTON --}}
                    <div class="d-flex justify-content-end mt-4">
                        <button type="submit" class="btn btn-primary me-2">
                            <i data-feather="save" class="me-1"></i>
                            Simpan
                        </button>
                    </div>

                </div>
            </div>
        </form>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {

            feather.replace();

            document.addEventListener('change', function(e) {

                const checkbox = e.target.closest('.checkSyarat');
                if (!checkbox) return;

                const row = checkbox.closest('tr');
                const input = row.querySelector('.comment-input');
                const text = row.querySelector('.comment-text');

                if (checkbox.checked) {
                    input.style.display = 'none';
                    text.style.display = '';
                    input.value = '';
                } else {
                    input.style.display = '';
                    text.style.display = 'none';
                }

            });

        });
    </script>
@endsection
