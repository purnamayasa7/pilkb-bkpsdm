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
            <div class="modal-footer">
                <button class="btn btn-light" type="button" data-bs-dismiss="modal">
                    <i data-feather="arrow-left" class="me-1"></i> Kembali
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
            <div class="card mb-4 mb-xl-0 shadow-sm border">
                <div class="card-header bg-gradient-primary-to-secondary text-white">Foto &amp; Data Pegawai</div>
                <div class="card-body text-center p-4">
                    <!-- Profile picture image-->
                    <img id="fotoPreview"
                        class="img-account-profile rounded-circle mb-3 shadow border border-3 border-white"
                        src="{{ $foto_url ?? $profile->foto_url }}"
                        onerror="this.src='{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}'"
                        alt="Foto Profil"
                        style="width: 140px; height: 140px; object-fit: cover;" />

                    <h5 class="fw-bold text-dark mb-1">{{ $nama_lengkap ?? $profile->nama ?? '-' }}</h5>
                    <div class="badge bg-light text-primary border mb-3 fw-semibold px-3 py-2">
                        NIP: {{ $profile->username ?? '-' }}
                    </div>

                    <!-- Detail Keterangan Pegawai SIMPEG -->
                    <div class="text-start mt-2 pt-3 border-top">
                        <div class="d-flex align-items-start mb-2 pb-2 border-bottom">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="calendar" class="me-1 text-primary" style="width: 14px; height: 14px;"></i>
                                TTL
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end">
                                {{ $ttl ?? '-' }}
                            </div>
                        </div>

                        <div class="d-flex align-items-start mb-2 pb-2 border-bottom">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="award" class="me-1 text-success" style="width: 14px; height: 14px;"></i>
                                Golongan
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end">
                                {{ $ket_gol ?? '-' }}
                            </div>
                        </div>

                        <div class="d-flex align-items-start mb-2 pb-2 border-bottom">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="briefcase" class="me-1 text-secondary" style="width: 14px; height: 14px;"></i>
                                Jabatan
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end">
                                {{ $nama_jab ?? '-' }}
                            </div>
                        </div>

                        <div class="d-flex align-items-start">
                            <div class="text-muted small me-2" style="width: 120px;">
                                <i data-feather="book-open" class="me-1 text-warning" style="width: 14px; height: 14px;"></i>
                                Agama
                            </div>
                            <div class="fw-semibold small text-dark flex-grow-1 text-end">
                                {{ $ket_agama ?? '-' }}
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
                    <form id="formUpdate" method="POST" action="{{ route('root.update', $profile->id) }}">
                        @csrf
                        @method('PUT')
                        <div class="mb-3">
                            <label class="small mb-1" for="username">NIP</label>

                            <input class="form-control"
                                id="username"
                                name="username"
                                type="text"
                                value="{{ $profile->username }}"
                                disabled />
                        </div>
                        <div class="mb-3">
                            <label class="small mb-1" for="nama">Nama Lengkap</label>
                            <input class="form-control" id="nama" name="nama" type="text"
                                placeholder="Masukkan nama lengkap" value="{{ $nama_lengkap }}" readonly />
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
                            <label class="small mb-1">Unit Kerja</label>

                            <input
                                class="form-control"
                                type="text"
                                value="{{ $ket_ukerja }}"
                                readonly />
                        </div>

                        <div class="mb-3">
                            <label class="small mb-1" for="password">Password</label>
                            <input class="form-control" id="password" name="password" type="password"
                                placeholder="Kosongkan jika tidak mereset password" />
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

                        <button class="btn btn-primary" type="button" id="btnUpdate">
                            <i data-feather="save" class="me-1"></i> Update User
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

        const form = document.getElementById('formUpdate');
        const btnTambah = document.getElementById('btnUpdate');
        const modalEl = document.getElementById('modalSimpan');
        const confirmSimpan = document.getElementById('confirmSimpan');

        const foto = document.getElementById('fotoPreview');

        foto.onerror = function() {

            this.src =
                "{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}";
        };

        btnTambah.addEventListener('click', function() {

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        });

        // Confirm Update
        confirmSimpan.addEventListener('click', function() {
            confirmSimpan.disabled = true;
            confirmSimpan.querySelector('.btn-text')?.classList.add('d-none');
            confirmSimpan.querySelector('.btn-loading')?.classList.remove('d-none');
            form.submit();
        });

    });
</script>
@endsection