@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="message-circle"></i></div>
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
                <button class="btn btn-light" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i> Batal
                </button>

                <form id="formDelete" method="POST">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-danger" type="submit" id="btnConfirmDelete">
                        <span class="btn-delete-text">
                            <i data-feather="trash-2" class="me-1"></i> Ya, Hapus
                        </span>
                        <span class="btn-delete-loading d-none">
                            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Menghapus...
                        </span>
                    </button>
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
                                    title="Edit FAQ"><i data-feather="edit" class="text-warning"></i></a>
                                <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDelete"
                                    href="#" data-id="{{ $item->id }}"
                                    data-pertanyaan="{{ $item->pertanyaan }}"
                                    title="Hapus FAQ">
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

        const modalDeleteEl = document.getElementById('modalDelete');
        const modalDelete = new bootstrap.Modal(modalDeleteEl);
        const formDelete = document.getElementById('formDelete');
        const btnConfirmDelete = document.getElementById('btnConfirmDelete');

        document.addEventListener('click', function(e) {

            const btn = e.target.closest('.btnDelete');

            if (!btn) return;

            e.preventDefault();

            const id = btn.dataset.id;
            const pertanyaan = btn.dataset.pertanyaan || 'FAQ ini';

            document.getElementById('textDelete').innerHTML =
                `Apakah anda yakin ingin menghapus FAQ <b>${pertanyaan}</b>?`;

            formDelete.action = `/root/faq/${id}`;

            modalDelete.show();
        });

        formDelete.addEventListener('submit', function() {
            btnConfirmDelete.disabled = true;
            btnConfirmDelete.querySelector('.btn-delete-text')?.classList.add('d-none');
            btnConfirmDelete.querySelector('.btn-delete-loading')?.classList.remove('d-none');
        });

    });
</script>
@endsection