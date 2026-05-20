 @extends('layouts.app')

 @section('content')
     <!-- Modal -->
     <div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered" role="document">
             <div class="modal-content">
                 <div class="modal-header">
                     <h5 class="modal-title" id="exampleModalCenterTitle">Simpan Data Status</h5>
                     <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                 </div>
                 <div class="modal-body">Apakah anda yakin menyimpan data status ini?</div>
                 <div class="modal-footer"><button class="btn btn-light" type="button"
                         data-bs-dismiss="modal">Close</button><button class="btn btn-primary" type="button"
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
                             <div class="page-header-icon"><i data-feather="plus-circle"></i></div>
                             Tambah Status
                         </h1>
                     </div>
                     <div class="col-12 col-xl-auto mb-3">
                         <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                             <i class="me-1" data-feather="arrow-left"></i>
                             Kembali ke List Status
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
                 <div class="card mb-4">
                     <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Status</div>
                     <div class="card-body">
                         <form id="formRegister" method="POST" action="{{ route('root.status.store') }}">
                             @csrf

                             <div class="mb-3">
                                 <label class="small mb-1">Bidang</label>
                                 <select name="kode_bidang" id="kode_bidang" class="form-select"
                                     aria-label="Default select example" required>
                                     <option value="" selected disabled>Pilih Bidang:</option>
                                     @foreach ($bidang as $b)
                                         <option value="{{ $b->id }}">
                                             {{ $b->nama_bidang }}
                                         </option>
                                     @endforeach
                                 </select>
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1">Layanan</label>
                                 <select name="kode_layanan" id="kode_layanan" class="form-select" required>
                                     <option value="" selected disabled>Pilih Layanan</option>
                                 </select>
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1" for="status">Status</label>
                                 <input class="form-control" id="status" name="status" type="text"
                                     placeholder="Masukkan status" value="{{ old('status') }}">
                             </div>

                             <button class="btn btn-primary" type="button" id="btnTambah">
                                 Tambah Status
                             </button>
                         </form>
                     </div>
                 </div>
             </div>
         </div>
     </div>

     <script>
         document.addEventListener('DOMContentLoaded', function() {

             const form = document.getElementById('formRegister');
             const btnTambah = document.getElementById('btnTambah');
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

         const bidangSelect = document.getElementById('kode_bidang');
         const layananSelect = document.getElementById('kode_layanan');

         layananSelect.disabled = true;

         bidangSelect.addEventListener('change', function() {

             let bidangId = this.value;

             // tampilkan loading dulu (bukan "tidak ada layanan")
             layananSelect.disabled = true;
             layananSelect.innerHTML = '<option disabled selected>Loading...</option>';

             fetch(`/root/get-layanan-status/${bidangId}`)
                 .then(response => response.json())
                 .then(data => {

                     if (data.length === 0) {
                         layananSelect.innerHTML = '<option disabled selected>Tidak ada layanan</option>';
                         layananSelect.disabled = true;
                         return;
                     }

                     layananSelect.disabled = false;
                     layananSelect.innerHTML = '<option disabled selected>Pilih Layanan</option>';

                     data.forEach(item => {
                         let option = `<option value="${item.id}">${item.nama_layanan}</option>`;
                         layananSelect.innerHTML += option;
                     });
                 })
                 .catch(() => {
                     layananSelect.innerHTML = '<option disabled selected>Error load data</option>';
                     layananSelect.disabled = true;
                 });
         });
     </script>
 @endsection
