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
            <div class="modal-footer">
                <button class="btn btn-light" type="button" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i> Batal
                </button>
                <button class="btn btn-primary" type="button" id="confirmSimpan">
                    <span class="btn-text">
                        <i data-feather="save" class="me-1"></i> Simpan
                    </span>
                    <span class="btn-loading d-none">
                        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Menyimpan...
                    </span>
                </button>
            </div>
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
            <div class="card mb-4 mb-xl-0 shadow-sm border">
                <div class="card-header bg-gradient-primary-to-secondary text-white">Foto &amp; Data Pegawai</div>
                <div class="card-body text-center p-4">
                    <!-- Profile picture image-->
                    <img id="fotoPreview"
                        class="img-account-profile rounded-circle mb-3 shadow border border-3 border-white"
                        src="{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}"
                        alt="Foto Profil"
                        style="width: 140px; height: 140px; object-fit: cover;">

                    <h5 class="fw-bold text-dark mb-1" id="previewNama">-</h5>
                    <div class="badge bg-light text-primary border mb-3 fw-semibold px-3 py-2" id="previewNip">
                        NIP: -
                    </div>

                    <!-- Detail Keterangan Pegawai SIMPEG -->
                    <div class="text-start mt-2 pt-3 border-top">
                        <div class="d-flex align-items-start mb-2 pb-2 border-bottom">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="calendar" class="me-1 text-primary" style="width: 14px; height: 14px;"></i>
                                TTL
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end" id="detailTtl">
                                -
                            </div>
                        </div>

                        <div class="d-flex align-items-start mb-2 pb-2 border-bottom">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="award" class="me-1 text-success" style="width: 14px; height: 14px;"></i>
                                Golongan
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end" id="detailGol">
                                -
                            </div>
                        </div>

                        <div class="d-flex align-items-start mb-2 pb-2 border-bottom">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="briefcase" class="me-1 text-secondary" style="width: 14px; height: 14px;"></i>
                                Jabatan
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end" id="detailJabatan">
                                -
                            </div>
                        </div>

                        <div class="d-flex align-items-start">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="book-open" class="me-1 text-warning" style="width: 14px; height: 14px;"></i>
                                Agama
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end" id="detailAgama">
                                -
                            </div>
                        </div>
                    </div>
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

                         <button class="btn btn-primary" type="button" id="btnTambah">
                              <i data-feather="save" class="me-1"></i> Tambah User
                          </button>
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
         const confirmSimpan = document.getElementById('confirmSimpan');

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
         confirmSimpan.addEventListener('click', function() {
             confirmSimpan.disabled = true;
             confirmSimpan.querySelector('.btn-text')?.classList.add('d-none');
             confirmSimpan.querySelector('.btn-loading')?.classList.remove('d-none');
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

                         document.getElementById('previewNama').innerText = '-';
                         document.getElementById('previewNip').innerText = 'NIP: -';
                         document.getElementById('detailTtl').innerText = '-';
                         document.getElementById('detailGol').innerText = '-';
                         document.getElementById('detailJabatan').innerText = '-';
                         document.getElementById('detailAgama').innerText = '-';
                         document.getElementById('fotoPreview').src = "{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}";

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

                     document.getElementById('previewNama').innerText =
                         pegawai.nama_lengkap ?? '-';

                     document.getElementById('previewNip').innerText =
                         'NIP: ' + nip;

                     document.getElementById('detailTtl').innerText =
                         pegawai.ttl ?? '-';

                     document.getElementById('detailGol').innerText =
                         pegawai.ket_gol ?? '-';

                     document.getElementById('detailJabatan').innerText =
                         pegawai.nama_jab ?? '-';

                     document.getElementById('detailAgama').innerText =
                         pegawai.ket_agama ?? '-';

                      if (pegawai.email && document.getElementById('email') && !document.getElementById('email').value) {
                          document.getElementById('email').value = pegawai.email;
                      }

                      const foto = document.getElementById('fotoPreview');

                      foto.src = pegawai.foto_url ||
                          `https://simpegdev.bllkom.site/pegawai/foto/${nip}`;

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

                     document.getElementById('previewNama').innerText = '-';
                     document.getElementById('previewNip').innerText = 'NIP: -';
                     document.getElementById('detailTtl').innerText = '-';
                     document.getElementById('detailGol').innerText = '-';
                     document.getElementById('detailJabatan').innerText = '-';
                     document.getElementById('detailAgama').innerText = '-';
                     document.getElementById('fotoPreview').src = "{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}";

                     nipError.innerText = 'Terjadi kesalahan server';

                     nipError.classList.remove('d-none');

                     nipInput.classList.add('is-invalid');
                 });
         });
     });
 </script>
 @endsection