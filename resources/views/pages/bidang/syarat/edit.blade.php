 @extends('layouts.app')

 @section('content')
 <!-- Modal -->
 <div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
     aria-hidden="true">
     <div class="modal-dialog modal-dialog-centered" role="document">
         <div class="modal-content">
             <div class="modal-header">
                 <h5 class="modal-title" id="exampleModalCenterTitle">Edit Data Syarat</h5>
                 <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
             </div>
             <div class="modal-body">Apakah anda yakin menyimpan perubahan syarat ini?</div>
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
                         Update Syarat
                     </h1>
                 </div>
                 <div class="col-12 col-xl-auto mb-3">
                     <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                         <i class="me-1" data-feather="arrow-left"></i>
                         Kembali ke List Syarat
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
                 <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Syarat</div>
                 <div class="card-body">
                     <form id="formUpdate" method="POST" action="{{ route('adminBidang.syarat.updateBidang', $syarat->id) }}">
                         @csrf
                         @method('PUT')
                         <div class="mb-3">
                             <label class="small mb-1">Bidang</label>
                             <input class="form-control" value="{{ $syarat->layanan->bidang->nama_bidang }}" disabled>
                         </div>

                         <div class="mb-3">
                             <label class="small mb-1" for="nama_layanan">Nama Layanan</label>
                             <input class="form-control" id="nama_layanan" name="nama_layanan" type="text"
                                 value="{{ $syarat->layanan->nama_layanan }}" disabled />
                         </div>

                         <div class="mb-3">
                             <label class="small mb-1" for="syarat">Syarat</label>
                             <input class="form-control" id="syarat" name="syarat" type="text"
                                 value="{{ old('syarat', $syarat->syarat )}}" required />
                         </div>

                         <div class="mb-3">
                             <label class="small mb-1">Metode e-file</label>
                             <select name="metode" id="metode" class="form-select" required>
                                 <option value="simpeg"
                                     {{ old('metode', $syarat->metode) == 'simpeg' ? 'selected' : '' }}>
                                     SIMPEG
                                 </option>

                                 <option value="upload"
                                     {{ old('metode', $syarat->metode) == 'upload' ? 'selected' : '' }}>
                                     Upload
                                 </option>
                             </select>
                         </div>

                         <div class="mb-3" id="modeGroup">
                             <label class="small mb-1">Pengambilan Dokumen</label>

                             <select
                                 name="mode_efile"
                                 id="mode_efile"
                                 class="form-select">

                                 <option value="latest"
                                     {{ old('mode_efile', $syarat->mode_efile) == 'latest' ? 'selected' : '' }}>
                                     Dokumen Terbaru
                                 </option>

                                 <option value="all"
                                     {{ old('mode_efile', $syarat->mode_efile) == 'all' ? 'selected' : '' }}>
                                     Semua Dokumen
                                 </option>

                             </select>

                             <div class="form-text">
                                 Berlaku hanya untuk dokumen yang diambil dari SIMPEG.
                             </div>
                         </div>

                         <button class="btn btn-primary" type="button" id="btnUpdate">Update Syarat</button>
                     </form>
                 </div>
             </div>
         </div>
     </div>
 </div>

 <script>
     document.addEventListener('DOMContentLoaded', function() {

         const form = document.getElementById('formUpdate');
         const btnUpdate = document.getElementById('btnUpdate');
         const modalEl = document.getElementById('modalSimpan');

         const metode = document.getElementById('metode');
         const modeGroup = document.getElementById('modeGroup');
         const modeEfile = document.getElementById('mode_efile');

         function toggleMetode() {

             if (metode.value === 'simpeg') {

                 modeGroup.style.display = '';
                 modeEfile.required = true;

             } else {

                 modeGroup.style.display = 'none';
                 modeEfile.required = false;
                 modeEfile.value = '';
             }
         }

         // Saat halaman dibuka
         toggleMetode();

         // Saat metode berubah
         metode.addEventListener('change', toggleMetode);

         // Tombol Update
         btnUpdate.addEventListener('click', function() {

             if (!form.checkValidity()) {
                 form.reportValidity();
                 return;
             }

             const modal = new bootstrap.Modal(modalEl);
             modal.show();
         });

         // Konfirmasi
         document.getElementById('confirmSimpan')
             .addEventListener('click', function() {
                 form.submit();
             });

     });
 </script>
 @endsection