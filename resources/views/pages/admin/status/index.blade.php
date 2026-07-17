@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="info"></i></div>
                        Manajemen Status
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ route('root.status.create') }}">
                        <i class="me-1" data-feather="plus"></i>
                        Tambah Status Baru
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

{{-- Modal Lihat Data --}}
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Detail Status</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="row">
                    <div class="col-12">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="layers" class="me-1"></i> Bidang</span>
                                    <span id="detailBidang" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="briefcase" class="me-1"></i> Nama Layanan</span>
                                    <span id="detailLayanan" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="info" class="me-1"></i> Status</span>
                                    <span id="detailNama" class="text-end"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

{{-- Modal Delete Data --}}
<div class="modal fade" id="modalDelete" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Hapus Status</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <p id="textDelete"></p>
            </div>

            <div class="modal-footer">
                <button class="btn btn-light" data-bs-dismiss="modal">Batal</button>

                <form id="formDelete" method="POST">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-danger">Ya, Hapus</button>
                </form>
            </div>
        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('root.status') }}" class="mb-3">
                <div class="row">
                    <div class="col-md-5">
                        <select name="bidang" class="form-select" onchange="this.form.submit()">

                            @foreach ($bidang as $b)
                            <option value="{{ $b->id }}" {{ $bidangId == $b->id ? 'selected' : '' }}>
                                {{ $b->nama_bidang }}
                            </option>
                            @endforeach

                        </select>
                    </div>
                </div>
            </form>
            <div class="position-relative">
                <div id="tableLoading" class="table-loading">
                    <div class="loading-content">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <table id="datatablesSimple">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        @foreach ($status as $item)
                        <tr>
                            <td>{{ $loop->iteration }}</td>
                            <td>
                                {{ $item->layanan->nama_layanan ?? '-' }} <br>
                                <small class="text-muted">
                                    {{ $item->layanan->bidang->nama_bidang ?? '-' }}
                                </small>
                            </td>
                            <td>{{ $item->status }}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                        href="#" data-id="{{ $item->id }}"
                                        data-layanan="{{ $item->layanan->nama_layanan ?? '-' }}"
                                        data-bidang="{{ $item->layanan->bidang->nama_bidang ?? '-' }}"
                                        data-status="{{ $item->status }}" title="Lihat layanan">
                                        <i data-feather="eye" class="text-primary"></i>
                                    </a>
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                        href="{{ route('root.status.edit', $item->id) }}" data-bs-toggle="tooltip"
                                        title="Edit Status"><i data-feather="edit" class="text-warning"></i></a>
                                    <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDelete"
                                        href="#" data-id="{{ $item->id }}"
                                        data-nama="{{ $item->status }}"
                                        data-layanan="{{ $item->layanan->nama_layanan }}" title="Hapus Status">
                                        <i data-feather="trash" class="text-danger"></i>
                                    </a>
                                </div>

                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        window.addEventListener('load', function() {
            document.getElementById('tableLoading').classList.add('d-none');
        });

        //Modal Detail
        const modalDetailEl = document.getElementById('modalDetail');
        const modalDetail = new bootstrap.Modal(modalDetailEl);

        document.addEventListener('click', function(e) {

            const btn = e.target.closest('.btnDetail');
            if (!btn) return;

            e.preventDefault();

            document.getElementById('detailBidang').innerText = btn.dataset.bidang;
            document.getElementById('detailLayanan').innerText = btn.dataset.layanan;
            document.getElementById('detailNama').innerText = btn.dataset.status;

            modalDetail.show();
        });

        //Delete Data
        const modalDelete = new bootstrap.Modal(document.getElementById('modalDelete'));

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.btnDelete');
            if (!btn) return;

            e.preventDefault();

            const id = btn.dataset.id;
            const nama = btn.dataset.nama;
            const layanan = btn.dataset.layanan;

            document.getElementById('textDelete').innerHTML =
                `Apakah anda yakin ingin menghapus status <b>${nama}</b> pada layanan <b>${layanan}</b>?`;

            document.getElementById('formDelete').action = `/root/status/${id}`;

            modalDelete.show();
        });
    });
</script>
@endsection