 @extends('layouts.app')

 @section('content')
     <!-- Modal -->
     <div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
         aria-hidden="true">
         <div class="modal-dialog modal-dialog-centered" role="document">
             <div class="modal-content">
                 <div class="modal-header">
                     <h5 class="modal-title" id="exampleModalCenterTitle">Edit Data User</h5>
                     <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                 </div>
                 <div class="modal-body">Apakah anda yakin menyimpan perubahan user ini?</div>
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
                             Update User
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
                         <img class="img-account-profile rounded-circle mb-2"
                             src="{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}" alt="" />
                         <!-- Profile picture help block-->
                         <div class="small font-italic text-muted mb-4">JPG or PNG tidak lebih dari 2 MB</div>
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
                         <form id="formUpdate" method="POST" action="{{ route('root.update', $profile->id) }}">
                             @csrf
                             @method('PUT')
                             <div class="mb-3">
                                 <label class="small mb-1" for="username">Username</label>
                                 <input class="form-control" id="username" name="username" type="text"
                                     placeholder="Masukkan username" value="{{ $profile->username }}" disabled />
                             </div>
                             <div class="mb-3">
                                 <label class="small mb-1" for="nama">Nama Lengkap</label>
                                 <input class="form-control" id="nama" name="nama" type="text"
                                     placeholder="Masukkan nama lengkap" value="{{ $profile->nama }}" required />
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1">Bidang</label>
                                 <select name="bidang_id" class="form-select" required>
                                     <option disabled>Pilih Bidang</option>

                                     <option value="admin_bawah"
                                         {{ $profile->bidang_id == 'admin_bawah' ? 'selected' : '' }}>
                                         Admin Bawah
                                     </option>

                                     <option value="admin_opd" {{ $profile->bidang_id == 'admin_opd' ? 'selected' : '' }}>
                                         Admin OPD
                                     </option>

                                     @foreach ($bidang as $b)
                                         <option value="{{ $b->id }}"
                                             {{ $profile->bidang_id == $b->id ? 'selected' : '' }}>
                                             {{ $b->nama_bidang }}
                                         </option>
                                     @endforeach
                                 </select>
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1" for="jabatan">Jabatan</label>
                                 <input class="form-control" id="jabatan" name="jabatan" type="text"
                                     placeholder="Masukkan jabatan" value="{{ $profile->jabatan }}" required />
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1" for="ukerja">Unit Kerja</label>
                                 <input class="form-control" id="kode_ukerja" name="kode_ukerja" type="text"
                                     placeholder="Masukkan unit kerja" value="{{ $profile->kode_ukerja }}" required />
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1" for="password">Password</label>
                                 <input class="form-control" id="password" name="password" type="password"
                                     placeholder="Kosongkan jika tidak mengubah password" />
                             </div>

                             <div class="mb-3">
                                 <label class="small mb-1" for="email">Alamat Email</label>
                                 @error('email')
                                     <div class="text-danger mb-1">{{ $message }}</div>
                                 @enderror
                                 <input class="form-control @error('email') is-invalid @enderror" id="email"
                                     name="email" type="email" placeholder="Masukkan Alamat Email"
                                     value="{{ $profile->email }}" required />
                             </div>

                             <button class="btn btn-primary" type="button" id="btnUpdate">Update User</button>
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
