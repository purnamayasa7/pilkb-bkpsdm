 @extends('layouts.app')

 @section('content')
 <!-- Modal -->
 <div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
     aria-hidden="true">
     <div class="modal-dialog modal-dialog-centered" role="document">
         <div class="modal-content">
             <div class="modal-header">
                 <h5 class="modal-title" id="exampleModalCenterTitle">Simpan Data User</h5>
                 <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
             </div>
             <div class="modal-body">Apakah anda yakin menyimpan data user ini?</div>
             <div class="modal-footer"><button class="btn btn-light" type="button"
                     data-bs-dismiss="modal">Batal</button><button class="btn btn-primary" type="button"
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
                         <div class="page-header-icon"><i data-feather="user-plus"></i></div>
                         Tambah User
                     </h1>
                 </div>
                 <div class="col-12 col-xl-auto mb-3">
                     <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                         <i class="me-1" data-feather="arrow-left"></i>
                         Kembali ke List User
                     </a>
                 </div>
             </div>
         </div>
     </div>
 </header>
 <!-- Main page content-->
 <div class="container-fluid px-4 mt-4">
     <div class="row">
         <div class="col-xl-4">
             <!-- Profile picture card-->
             <div class="card mb-4 mb-xl-0">
                 <div class="card-header bg-gradient-primary-to-secondary text-white">Foto Profil</div>
                 <div class="card-body text-center">
                     <!-- Profile picture image-->
                     <img id="fotoPreview"
                         class="img-account-profile rounded-circle mb-2 shadow"
                         src="{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}"
                         alt=""
                         style="width: 180px; height: 180px; object-fit: cover;">
                     <!-- Profile picture help block-->
                     <div class="small font-italic text-muted mb-4">JPG atau PNG tidak lebih dari 2 MB</div>
                     <!-- Profile picture upload button-->
                     <button class="btn btn-primary" type="button">Upload Foto</button>
                 </div>
             </div>
         </div>
         <div class="col-xl-8">
             <!-- Account details card-->
             <div class="card mb-4">
                 <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Akun</div>
                 <div class="card-body">
                     <form id="formRegister" method="POST" action="{{ route('root.store') }}">
                         @csrf
                         <div class="mb-3">
                             <label class="small mb-1" for="nip">NIP</label>

                             <div class="input-group">

                                 <input
                                     class="form-control @error('username') is-invalid @enderror"
                                     id="nip"
                                     name="username"
                                     type="text"
                                     placeholder="Masukkan NIP"
                                     value="{{ old('username') }}"
                                     required />

                                 <button class="btn btn-primary" type="button" id="btnCekPegawai">
                                     <i data-feather="search"></i>
                                 </button>

                             </div>

                             @error('username')
                             <div class="text-danger small mt-1">
                                 {{ $message }}
                             </div>
                             @enderror

                             <div id="nipError" class="text-danger small mt-1 d-none"></div>

                             <!-- <div id="nipError" class="text-danger small mt-1 d-none">
                                 Data pegawai tidak ditemukan
                             </div> -->
                         </div>
                         <div class="mb-3">
                             <label class="small mb-1" for="nama">Nama Lengkap</label>
                             <input class="form-control" id="nama" name="nama" type="text"
                                 placeholder="Masukkan nama lengkap" value="{{ old('nama') }}" required />
                         </div>

                         <div class="mb-3">
                             <label class="small mb-1">Bidang</label>
                             <select name="bidang_id" id="bidang_id" class="form-select" required>
                                 aria-label="Default select example" required>
                                 <option value="" selected disabled>Pilih Bidang</option>
                                 <option value="admin_bawah">Admin Bawah</option>
                                 <option value="admin_opd">Admin OPD</option>
                                 @foreach ($bidang as $b)
                                 <option value="{{ $b->id }}">
                                     {{ $b->nama_bidang }}
                                 </option>
                                 @endforeach
                             </select>
                         </div>

                         {{-- <div class="mb-3">
                                 <input type="hidden" id="role_id" name="role_id" />
                             </div> --}}

                         <div class="mb-3">
                             <label class="small mb-1">Unit Kerja</label>

                             <input
                                 class="form-control"
                                 id="unitKerjaText"
                                 type="text"
                                 placeholder="Unit kerja otomatis"
                                 readonly />

                             <input
                                 type="hidden"
                                 id="kode_ukerja"
                                 name="kode_ukerja">
                         </div>
                         <!-- <div class="mb-3">
                             <label class="small mb-1" for="ukerja">Unit Kerja</label>
                             <input class="form-control" id="kode_ukerja" name="kode_ukerja" type="text"
                                 placeholder="Masukkan unit kerja" value="{{ old('ukerja') }}" required />
                         </div> -->
                         <!-- 
                         <div class="mb-3">
                             <label class="small mb-1" for="password">Password</label>
                             <input class="form-control" id="password" name="password" type="password"
                                 placeholder="Masukkan Password" required />
                         </div> -->

                         <div class="mb-3">
                             <label class="small mb-1" for="email">Alamat Email</label>
                             @error('email')
                             <div class="text-danger mb-1">{{ $message }}</div>
                             @enderror
                             <input class="form-control @error('email') is-invalid @enderror" id="email"
                                 name="email" type="email" placeholder="Masukkan Alamat Email"
                                 value="{{ old('email') }}" required />
                         </div>

                         <button class="btn btn-primary" type="button" id="btnTambah">Tambah User</button>
                     </form>
                 </div>
             </div>
         </div>
     </div>
 </div>

 <script>
     document.addEventListener('DOMContentLoaded', function() {

         feather.replace();

         const form = document.getElementById('formRegister');
         const btnTambah = document.getElementById('btnTambah');
         const modalEl = document.getElementById('modalSimpan');

         const btnCekPegawai = document.getElementById('btnCekPegawai');
         const nipInput = document.getElementById('nip');
         const nipError = document.getElementById('nipError');

         let nipValid = false;
         let verifiedNip = '';

         // RESET
         nipInput.addEventListener('input', function() {

             nipValid = false;
             verifiedNip = '';

             nipError.classList.add('d-none');
             nipError.innerText = '';

             nipInput.classList.remove('is-invalid');
         });

         btnTambah.addEventListener('click', function() {

             if (!form.checkValidity()) {
                 form.reportValidity();
                 return;
             }

             if (!nipValid || verifiedNip !== nipInput.value) {

                 nipError.innerText = 'Silakan cek NIP terlebih dahulu';

                 nipError.classList.remove('d-none');

                 nipInput.classList.add('is-invalid');

                 return;
             }

             const modal = new bootstrap.Modal(modalEl);
             modal.show();
         });

         // CONFIRM
         document.getElementById('confirmSimpan')
             .addEventListener('click', function() {
                 form.submit();
             });

         // CEK PEGAWAI
         btnCekPegawai.addEventListener('click', function() {

             const nip = nipInput.value.trim();

             // RESET
             nipError.classList.add('d-none');
             nipError.innerText = '';

             nipInput.classList.remove('is-invalid');

             if (!nip) {
                 alert('Masukkan NIP terlebih dahulu');
                 return;
             }

             fetch(`/root/api/pegawai/${nip}`)
                 .then(res => res.json())
                 .then(data => {

                     if (!data || data.status == false) {

                         nipValid = false;
                         verifiedNip = '';

                         // RESET
                         document.getElementById('nama').value = '';
                         document.getElementById('unitKerjaText').value = '';
                         document.getElementById('kode_ukerja').value = '';

                         nipError.innerText = data.message ??
                             'NIP tidak ditemukan';

                         nipError.classList.remove('d-none');

                         nipInput.classList.add('is-invalid');

                         return;
                     }

                     nipValid = true;
                     verifiedNip = nip;

                     // RESET
                     nipError.classList.add('d-none');
                     nipError.innerText = '';

                     nipInput.classList.remove('is-invalid');

                     const pegawai = data.data;


                     document.getElementById('nama').value =
                         pegawai.nama_lengkap ?? '';

                     document.getElementById('unitKerjaText').value =
                         pegawai.ket_ukerja ?? '';

                     document.getElementById('kode_ukerja').value =
                         pegawai.kode_ukerja ?? '';

                     const foto = document.getElementById('fotoPreview');

                     foto.src =
                         `https://simpegdev.bllkom.info/pegawai/foto/${nip}`;

                     foto.onerror = function() {

                         this.onerror = null;

                         this.src =
                             "{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}";
                     };

                 })
                 .catch(error => {
                     console.log(error);

                     nipValid = false;
                     verifiedNip = '';

                     nipError.innerText = 'Terjadi kesalahan server';

                     nipError.classList.remove('d-none');

                     nipInput.classList.add('is-invalid');
                 });
         });
     });
 </script>
 @endsection