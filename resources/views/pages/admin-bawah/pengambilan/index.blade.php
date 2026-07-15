@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="download"></i></div>
                        List Pengambilan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-primary" href="#" data-bs-toggle="modal"
                            data-bs-target="#modalTambahPengambilan">

                            <i class="me-1" data-feather="plus-circle"></i>
                            Tambah Pengambilan
                        </a>
                    </div>
                    <div class="btn-group">
                        <a class="btn btn-sm btn-light text-success" href="{{ route('adminBawah.pengambilan.exportPdf', request()->query()) }}" target="_blank"
                            target="_blank">
                            <i class="me-1" data-feather="download"></i>
                            Export PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

{{-- Modal Tambah Pengambilan --}}
<div class="modal fade" id="modalTambahPengambilan" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <form method="POST" action="{{ route('adminBawah.pengambilan.store') }}">
                @csrf

                <div class="modal-header">
                    <h5 class="modal-title">
                        Tambah Pengambilan
                    </h5>
                    <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    {{-- No Tiket --}}
                    <div class="mb-3">

                        <label class="form-label">
                            No Tiket
                        </label>

                        <div class="input-group">
                            <input type="text" name="no_tiket" id="no_tiket" class="form-control"
                                placeholder="Masukkan no tiket" required>
                            <button type="button" class="btn btn-primary" id="btnCekTiket">
                                Cek
                            </button>
                        </div>
                        <small id="infoTiket" class="text-muted"></small>
                    </div>

                    {{-- Nama Pengambil --}}
                    <div class="mb-3">
                        <label class="form-label">
                            Nama Pengambil
                        </label>

                        <input type="text" name="nama_pengambil" id="nama_pengambil" class="form-control"
                            placeholder="Masukkan nama pengambil" disabled required>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-light" data-bs-dismiss="modal" type="button">
                        Batal
                    </button>

                    <button type="submit" id="btnSimpan" class="btn btn-primary" disabled>
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- <div class="container-xl px-4 mt-4"> --}}
<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminBawah.pengambilan.indexPengambilan') }}" id="filterForm">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        {{-- Tahun --}}
                        <div class="col-md-4">
                            <label class="form-label">Tahun</label>
                            <select name="year" class="form-select">
                                @for ($y = date('Y') - 10; $y <= date('Y'); $y++)
                                    <option value="{{ $y }}" {{ $year == $y ? 'selected' : '' }}>
                                    {{ $y }}
                                    </option>
                                    @endfor
                            </select>
                        </div>

                        {{-- Tombol --}}
                        <div class="col-md-6">
                            <label class="form-label d-block">&nbsp;</label>
                            <button type="submit" class="btn btn-primary">
                                <i data-feather="search" class="me-1"></i>
                                Tampilkan
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <table id="datatablesSimple">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>No Tiket</th>
                        <th>NIP</th>
                        <th>Unit Kerja</th>
                        <th>Nama Layanan</th>
                        <th>Tanggal Diambil</th>
                        <th>Status Diambil</th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <th>No</th>
                        <th>No Tiket</th>
                        <th>NIP</th>
                        <th>Unit Kerja</th>
                        <th>Nama Layanan</th>
                        <th>Tanggal Diambil</th>
                        <th>Status Diambil</th>
                    </tr>
                </tfoot>
                <tbody>
                    @foreach ($pengambilan as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->tiket->no_tiket ?? '-' }}</td>
                        <td>
                            {{ $item->tiket->nip ?? '-' }} <br>

                            <small class="text-muted">
                                {{ $pegawaiList[$item->tiket->nip]['nama_lengkap'] ?? '-' }}
                            </small>
                        </td>
                        <td> {{ $pegawaiList[$item->tiket->nip]['ket_ukerja'] ?? '-' }}</td>
                        <td>{{ $item->tiket->layanan->nama_layanan ?? '-' }}</td>
                        <td>{{ $item->tanggal_pengambilan }}</td>
                        <td>
                            <div class="d-flex align-items-center justify-content-center">
                                <span class="badge bg-light text-success border d-inline-flex align-items-center">
                                    Sudah Diambil
                                </span>
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        const btnCek = document.getElementById('btnCekTiket');

        btnCek.addEventListener('click', function() {

            const noTiket = document.getElementById('no_tiket').value;

            fetch(`/adminBawah/pengambilan/cek-tiket/${noTiket}`)
                .then(res => res.json())
                .then(data => {

                    const inputTiket = document.getElementById('no_tiket');
                    const info = document.getElementById('infoTiket');

                    if (data.success) {

                        inputTiket.classList.remove('is-invalid');
                        inputTiket.classList.add('is-valid');

                        info.innerHTML =
                            `<span class="text-success">✓ Tiket ditemukan</span>`;
                        document.getElementById('nama_pengambil').disabled = false;
                        document.getElementById('btnSimpan').disabled = false;

                    } else {
                        inputTiket.classList.remove('is-valid');
                        inputTiket.classList.add('is-invalid');

                        info.innerHTML =
                            `<span class="text-danger">✕ Tiket tidak ditemukan</span>`;

                        document.getElementById('nama_pengambil').disabled = true;
                        document.getElementById('btnSimpan').disabled = true;
                    }

                })
                .catch(() => {
                    document.getElementById('infoTiket').innerHTML =
                        `<span class="text-danger">Terjadi kesalahan</span>`;
                });
        });

        document.getElementById('no_tiket').addEventListener('input', function() {

            this.classList.remove('is-valid');
            this.classList.remove('is-invalid');

            document.getElementById('infoTiket').innerHTML = '';

            document.getElementById('nama_pengambil').disabled = true;

            document.getElementById('btnSimpan').disabled = true;

        });
    });
</script>
@endsection