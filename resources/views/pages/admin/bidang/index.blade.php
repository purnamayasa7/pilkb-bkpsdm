@extends('layouts.app')

@section('content')
    <header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
        <div class="container-fluid px-4">
            <div class="page-header-content">
                <div class="row align-items-center justify-content-between pt-3">
                    <div class="col-auto mb-3">
                        <h1 class="page-header-title">
                            <div class="page-header-icon"><i data-feather="layers"></i></div>
                            Manajemen Bidang
                        </h1>
                    </div>
                    <div class="col-12 col-xl-auto mb-3">
                        <!-- Dropdown Export -->
                        <div class="btn-group">
                            <button class="btn btn-sm btn-light text-success dropdown-toggle" type="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="me-1" data-feather="download"></i>
                                Export
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <i class="me-1" data-feather="file-text"></i> Export Excel
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <i class="me-1" data-feather="file"></i> Export PDF
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <a class="btn btn-sm btn-light text-primary" href="{{ route('root.bidang.create') }}">
                            <i class="me-1" data-feather="plus"></i>
                            Tambah Bidang Baru
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    {{-- Modal Aktif/Nonaktif --}}
    <div class="modal fade" id="modalAktif" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Ubah Status Bidang</h5>
                    <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    <p id="textModal"></p>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-light" data-bs-dismiss="modal">Batal</button>

                    <form id="formToggle" method="POST">
                        @csrf
                        @method('PUT')
                        <button class="btn btn-primary">Ya, Lanjutkan</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid px-4 mt-4">
        <div class="card">
            <div class="card-body">
                <table id="datatablesSimple">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Bidang</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>No</th>
                            <th>Bidang</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        @foreach ($bidang as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $item->nama_bidang }}</td>
                                <td>
                                    @if ($item->aktif === 1)
                                        <span class="badge bg-green-soft text-green">Aktif</span>
                                    @elseif ($item->aktif === 0)
                                        <span class="badge bg-red-soft text-red">Tidak Aktif</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                            href="{{ route('root.bidang.edit', $item->id) }}" data-bs-toggle="tooltip"
                                            title="Edit bidang"><i data-feather="edit" class="text-warning"></i></a>
                                        <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnToggle"
                                            href="#" data-id="{{ $item->id }}"
                                            data-nama="{{ $item->nama_bidang }}" data-status="{{ $item->aktif }}"
                                            data-bs-toggle="tooltip" title="Aktif/Nonaktif">

                                            <i data-feather="slash"
                                                class="{{ $item->aktif ? 'text-success' : 'text-danger' }}"></i>
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

            //Modal Aktif
            const modalAktifEl = document.getElementById('modalAktif');
            const modalAktif = new bootstrap.Modal(modalAktifEl);

            const textModal = document.getElementById('textModal');
            const form = document.getElementById('formToggle');

            document.addEventListener('click', function(e) {

                const btn = e.target.closest('.btnToggle');
                if (!btn) return;

                e.preventDefault();

                const id = btn.dataset.id;
                const nama = btn.dataset.nama;
                const status = btn.dataset.status;

                let actionText = status == 1 ? 'menonaktifkan' : 'mengaktifkan';

                textModal.innerHTML =
                    `Apakah anda yakin ingin <b>${actionText}</b> bidang <b>${nama}</b>?`;

                form.action = `/root/bidang/${id}/toggle-aktif`;

                modalAktif.show();
            });
        });
    </script>
@endsection
