@extends('layouts.app')

@section('content')
    <header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
        <div class="container-fluid px-4">
            <div class="page-header-content">
                <div class="row align-items-center justify-content-between pt-3">
                    <div class="col-auto mb-3">
                        <h1 class="page-header-title">
                            <div class="page-header-icon"><i data-feather="check-square"></i></div>
                            Manajemen Syarat
                        </h1>
                    </div>
                    <div class="col-12 col-xl-auto mb-3">
                        <a class="btn btn-sm btn-light text-primary" href="{{ route('root.syarat.create') }}">
                            <i class="me-1" data-feather="plus"></i>
                            Tambah Syarat Baru
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
                    <h5 class="modal-title">Detail Syarat</h5>
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
                                        <span><i data-feather="check-square" class="me-1"></i> Syarat</span>
                                        <span id="detailSyarat" class="text-end"></span>
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
                    <h5 class="modal-title">Hapus Syarat</h5>
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
                <form method="GET" action="{{ route('root.syarat') }}" id="filterForm" class="mb-3">
                    <div class="bg-white p-3 rounded-3 mb-4 border">
                        <div class="row align-items-end">

                            <!-- BIDANG -->
                            <div class="col-md-4">
                                <label class="form-label">Bidang</label>
                                <select name="bidang" id="bidangSelect" class="form-select">
                                    @foreach ($bidang as $b)
                                        <option value="{{ $b->id }}" {{ $bidangId == $b->id ? 'selected' : '' }}>
                                            {{ $b->nama_bidang }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <!-- LAYANAN -->
                            <div class="col-md-4">
                                <label class="form-label">Layanan</label>
                                <select name="layanan" id="layananSelect" class="form-select">
                                    <option value="" disabled selected>Pilih Layanan</option>
                                </select>
                            </div>

                            <!-- TOMBOL RESET -->
                            {{-- <div class="col-md-4 d-flex gap-2">
                            <a href="{{ route('root.syarat') }}" class="btn btn-secondary w-50">
                                Reset
                            </a>
                        </div> --}}

                        </div>
                    </div>
                </form>
                <table id="datatablesSimple">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Syarat</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Nama Layanan</th>
                            <th>Syarat</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        @foreach ($syarat as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>
                                    {{ $item->layanan->nama_layanan ?? '-' }}
                                </td>
                                <td>{{ $item->syarat }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                            href="#" data-layanan="{{ $item->layanan->nama_layanan ?? '-' }}"
                                            data-bidang="{{ $item->layanan->bidang->nama_bidang ?? '-' }}"
                                            data-syarat="{{ $item->syarat }}" title="Lihat layanan">
                                            <i data-feather="eye" class="text-primary"></i>
                                        </a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('root.syarat.edit', $item->id) }}" data-bs-toggle="tooltip"
                                            title="Edit Syarat"><i data-feather="edit" class="text-warning"></i></a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDelete"
                                            href="#" data-id="{{ $item->id }}"
                                            data-nama="{{ $item->syarat }}"
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

    <script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
    <script src="{{ asset('templatepro/js/datatables/datatables-simple-demo.js') }}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {

            feather.replace();

            const bidangSelect = document.getElementById('bidangSelect');
            const layananSelect = document.getElementById('layananSelect');

            let selectedLayanan = "{{ request('layanan') ?? '' }}";

            function loadLayanan(bidangId) {
                fetch(`/root/get-layanan-syarat/${bidangId}`)
                    .then(res => res.json())
                    .then(data => {

                        layananSelect.innerHTML = '';

                        const defaultOption = document.createElement('option');
                        defaultOption.value = '';
                        defaultOption.textContent = 'Pilih Layanan';
                        defaultOption.disabled = true;
                        defaultOption.selected = !selectedLayanan;

                        layananSelect.appendChild(defaultOption);

                        if (data.length === 0) return;

                        const fragment = document.createDocumentFragment();

                        data.forEach(item => {
                            const option = document.createElement('option');
                            option.value = item.id;
                            option.textContent = item.nama_layanan;

                            if (item.id == selectedLayanan) {
                                option.selected = true;
                            }

                            fragment.appendChild(option);
                        });

                        layananSelect.appendChild(fragment);
                    });
            }

            // load awal
            loadLayanan(bidangSelect.value);

            // GANTI BIDANG
            bidangSelect.addEventListener('change', function() {
                selectedLayanan = '';
                loadLayanan(this.value);
            });

            // PILIH LAYANAN
            layananSelect.addEventListener('change', function() {
                if (this.value !== '') {
                    document.getElementById('filterForm').submit();
                }
            });

            // MODAL DETAIL
            const modalDetail = new bootstrap.Modal(document.getElementById('modalDetail'));

            document.addEventListener('click', function(e) {
                const btn = e.target.closest('.btnDetail');
                if (!btn) return;

                e.preventDefault();

                document.getElementById('detailBidang').innerText = btn.dataset.bidang;
                document.getElementById('detailLayanan').innerText = btn.dataset.layanan;
                document.getElementById('detailSyarat').innerText = btn.dataset.syarat;

                modalDetail.show();
            });

            // DELETE DATA
            const modalDelete = new bootstrap.Modal(document.getElementById('modalDelete'));

            document.addEventListener('click', function(e) {
                const btn = e.target.closest('.btnDelete');
                if (!btn) return;

                e.preventDefault();

                const id = btn.dataset.id;
                const layanan = btn.dataset.layanan;

                document.getElementById('textDelete').innerHTML =
                    `Apakah anda yakin ingin menghapus syarat ini pada layanan <b>${layanan}</b>?`;

                document.getElementById('formDelete').action = `/root/syarat/${id}`;

                modalDelete.show();
            });
        });
    </script>
@endsection
