@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="layers"></i></div>
                        Manajemen FAQ
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ route('root.faq.create') }}">
                        <i class="me-1" data-feather="plus"></i>
                        Tambah FAQ
                    </a>
                </div>
            </div> 
        </div>
    </div>
</header>

{{-- Modal Delete Data --}}
<div class="modal fade" id="modalDelete" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Hapus FAQ</h5>
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
            <table id="datatablesSimple">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Pertanyaan</th>
                        <th>Jawaban</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <th>No</th>
                        <th>Pertanyaan</th>
                        <th>Jawaban</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </tfoot>
                <tbody>
                    @foreach ($faq as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->pertanyaan }}</td>
                        <td>{{ $item->jawaban }}</td>
                        <td>{{ $item->created_at }}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                    href="{{ route('root.faq.edit', $item->id) }}" data-bs-toggle="tooltip"
                                    title="Edit bidang"><i data-feather="edit" class="text-warning"></i></a>
                                <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDelete"
                                    href="#" data-id="{{ $item->id }}"
                                    title="Hapus Status">
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

        const modalDelete = new bootstrap.Modal(
            document.getElementById('modalDelete')
        );

        document.addEventListener('click', function(e) {

            const btn = e.target.closest('.btnDelete');

            if (!btn) return;

            e.preventDefault();

            const id = btn.dataset.id;

            document.getElementById('textDelete').innerHTML =
                'Apakah anda yakin ingin menghapus FAQ ini?';

            document.getElementById('formDelete').action =
                `/root/faq/${id}`;

            modalDelete.show();
        });

    });
</script>
@endsection