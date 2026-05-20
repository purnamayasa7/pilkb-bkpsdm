 @extends('layouts.app')

 @section('content')
     <!-- Modal -->
     <div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered" role="document">
             <div class="modal-content">
                 <div class="modal-header">
                     <h5 class="modal-title" id="exampleModalCenterTitle">Edit Data Bidang</h5>
                     <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                 </div>
                 <div class="modal-body">Apakah anda yakin menyimpan perubahan bidang ini?</div>
                 <div class="modal-footer"><button class="btn btn-light" type="button"
                         data-bs-dismiss="modal">Kembali</button><button class="btn btn-primary" type="button"
                         id="confirmSimpan">Simpan</button></div>
             </div>
         </div>
     </div>
     <header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
         <div class="container-fluid px-4">
             <div class="page-header-content">
                 <div class="row align-items-center justify-content-between pt-3">
                     <div class="col-auto mb-3">
                         <h1 class="page-header-title">
                             <div class="page-header-icon"><i data-feather="edit"></i></div>
                             Update Bidang
                         </h1>
                     </div>
                     <div class="col-12 col-xl-auto mb-3">
                         <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                             <i class="me-1" data-feather="arrow-left"></i>
                             Kembali ke List Bidang
                         </a>
                     </div>
                 </div>
             </div>
         </div>
     </header>
     <!-- Main page content-->
     <div class="container-fluid px-4 mt-4">
         <div class="row">
             <div class="col-12">
                 <!-- Account details card-->
                 <div class="card mb-4">
                     <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Bidang</div>
                     <div class="card-body">
                         <form id="formUpdate" method="POST" action="{{ route('root.bidang.update', $bidang->id) }}">
                             @csrf
                             @method('PUT')
                             <div class="mb-3">
                                 <label class="small mb-1" for="nama_bidang">Nama Bidang</label>
                                 <input class="form-control" id="nama_bidang" name="nama_bidang" type="text"
                                     placeholder="Masukkan nama bidang" value="{{ $bidang->nama_bidang }}" required />
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1">Status</label>
                                 <select name="aktif" class="form-select" required>
                                     <option disabled>Pilih Status</option>

                                     <option value="1" {{ old('aktif', $bidang->aktif ?? '') == 1 ? 'selected' : '' }}>
                                         Aktif
                                     </option>

                                     <option value="0" {{ old('aktif', $bidang->aktif ?? '') == 0 ? 'selected' : '' }}>
                                         Tidak Aktif
                                     </option>
                                 </select>
                             </div>
                             <button class="btn btn-primary" type="button" id="btnUpdate">Update Bidang</button>
                         </form>
                     </div>
                 </div>
             </div>
         </div>
     </div>

     <script>
         document.addEventListener('DOMContentLoaded', function() {

             const form = document.getElementById('formUpdate');
             const btnTambah = document.getElementById('btnUpdate');
             const modalEl = document.getElementById('modalSimpan');

             btnTambah.addEventListener('click', function() {

                 if (!form.checkValidity()) {
                     form.reportValidity();
                     return;
                 }

                 const modal = new bootstrap.Modal(modalEl);
                 modal.show();
             });

             document.getElementById('confirmSimpan').addEventListener('click', function() {
                 form.submit();
             });

         });
     </script>
 @endsection
