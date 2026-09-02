@extends('layouts.app')

@section('content')
<!-- Modal Simpan User -->
<div class="modal fade" id="modalSimpan" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Edit Data User</h5>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">Apakah anda yakin menyimpan perubahan ini?</div>
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

<!-- Modal Lihat Riwayat Tiket -->
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    No Tiket: <span id="mdNoTiket"></span>
                </h5>
                <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="card mb-4">
                    <div class="card-header bg-gradient-primary-to-secondary text-white">
                        Riwayat Proses Layanan
                    </div>
                    <div class="card-body">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-bordered table-sm">
                                    <thead>
                                        <tr>
                                            <th>Tahap</th>
                                            <th>Tanggal</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody id="historyTable">
                                        <tr>
                                            <td colspan="3" class="text-center">Loading...</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="mt-3 d-flex justify-content-end" id="historyPagination"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-xl px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="user"></i></div>
                        Profil Pengguna
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <a class="btn btn-sm btn-light text-primary" href="{{ url()->previous() }}">
                        <i class="me-1" data-feather="arrow-left"></i>
                        Kembali
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

<!-- Main page content-->
<div class="container-xl px-4 mt-4">
    <!-- Account page navigation-->
    <nav class="nav nav-borders">
        <a class="nav-link active ms-0" id="profile-tab" data-bs-toggle="tab" href="#tabProfile" role="tab" aria-controls="tabProfile" aria-selected="true">Profil</a>
        <a class="nav-link" id="tiket-tab" data-bs-toggle="tab" href="#tabTiket" role="tab" aria-controls="tabTiket" aria-selected="false">Tiket Anda</a>
    </nav>
    <hr class="mt-0 mb-4" />

    <div class="tab-content" id="profileTabContent">
        <!-- Tab 1: Profil -->
        <div class="tab-pane fade show active" id="tabProfile" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <div class="row">
                <div class="col-xl-4">
                    <!-- Profile picture card-->
                    <div class="card mb-4 mb-xl-0 shadow-sm border">
                        <div class="card-header bg-gradient-primary-to-secondary text-white">Foto &amp; Data Pegawai</div>
                        <div class="card-body text-center p-4">
                            <!-- Profile picture image-->
                            <img id="fotoPreview"
                                class="img-account-profile rounded-circle mb-3 shadow border border-3 border-white"
                                src="{{ $foto_url ?? $user->foto_url }}"
                                onerror="this.src='{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}'"
                                alt="Foto Profil"
                                style="width: 140px; height: 140px; object-fit: cover;" />

                            <h5 class="fw-bold text-dark mb-1">{{ $nama_lengkap ?? $user->nama ?? '-' }}</h5>
                            <div class="badge bg-light text-primary border mb-3 fw-semibold px-3 py-2">
                                NIP: {{ $user->username ?? '-' }}
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
                            <form id="formUpdate" method="POST" action="{{ route('profile.update') }}">
                                @csrf
                                @method('PUT')
                                <div class="mb-3">
                                    <label class="small mb-1" for="username">Username / NIP</label>
                                    <input class="form-control" id="username" name="username" type="text"
                                        placeholder="Masukkan username" value="{{ $user->username }}" readonly />
                                </div>
                                <div class="mb-3">
                                    <label class="small mb-1" for="nama">Nama Lengkap</label>
                                    <input class="form-control" id="nama" type="text" value="{{ $nama_lengkap }}" readonly />
                                </div>

                                <div class="mb-3">
                                    <label class="small mb-1">Bidang</label>
                                    <input class="form-control" type="text" value="{{ $user->bidang->nama_bidang ?? '-' }}" readonly />
                                </div>

                                <div class="mb-3">
                                    <label class="small mb-1">Unit Kerja</label>
                                    <input class="form-control" type="text" value="{{ $ket_ukerja }}" readonly />
                                </div>

                                <div class="mb-3">
                                    <label class="small mb-1" for="password">Password</label>
                                    <input class="form-control"
                                        id="password"
                                        name="password"
                                        type="password"
                                        autocomplete="new-password"
                                        placeholder="Kosongkan jika tidak mengubah password" />
                                </div>

                                <div class="mb-3">
                                    <label class="small mb-1" for="email">Alamat Email</label>
                                    @error('email')
                                    <div class="text-danger mb-1">{{ $message }}</div>
                                    @enderror
                                    <input class="form-control @error('email') is-invalid @enderror" id="email"
                                        name="email" type="email" placeholder="Masukkan Alamat Email"
                                        value="{{ $user->email }}" required />
                                </div>

                                <button class="btn btn-primary"
                                    type="button"
                                    id="btnUpdate">
                                    <i data-feather="save" class="me-1"></i> Simpan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab 2: Tiket Anda -->
        <div class="tab-pane fade" id="tabTiket" role="tabpanel" aria-labelledby="tiket-tab" tabindex="0">
            <div class="card mb-4">
                <div class="card-header bg-gradient-primary-to-secondary text-white d-flex justify-content-between align-items-center">
                    <div>
                        <i data-feather="clipboard" class="me-1"></i> List Pengajuan Tiket Anda
                    </div>
                    <div>
                        <span class="badge bg-white text-primary">NIP: {{ $user->username }}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="position-relative">
                        <table id="datatablesTiket">
                            <thead>
                                <tr>
                                    <th>No Tiket</th>
                                    <th>NIP & Nama</th>
                                    <th>Layanan</th>
                                    <th>Tanggal</th>
                                    <th>Status Terakhir</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tfoot>
                                <tr>
                                    <th>No Tiket</th>
                                    <th>NIP & Nama</th>
                                    <th>Layanan</th>
                                    <th>Tanggal</th>
                                    <th>Status Terakhir</th>
                                    <th>Aksi</th>
                                </tr>
                            </tfoot>
                            <tbody>
                                @foreach ($tiket as $item)
                                <tr>
                                    <td>{{ $item->no_tiket }}</td>
                                    <td>
                                        {{ $item->nip }} <br>
                                        <small class="text-muted">
                                            {{ $item->nama ?? '-' }}
                                        </small>
                                    </td>
                                    <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                                    <td>{{ $item->tanggal }}</td>
                                    <td>{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                                href="#"
                                                data-notiket="{{ $item->no_tiket }}"
                                                data-bs-toggle="tooltip"
                                                title="Lihat Riwayat">
                                                <i data-feather="eye" class="text-primary"></i>
                                            </a>

                                            <a class="btn btn-datatable btn-icon btn-transparent-dark me-1"
                                                href="{{ route('tiket.cetak', $item->no_tiket) }}"
                                                target="_blank"
                                                data-bs-toggle="tooltip"
                                                title="Cetak Tiket">
                                                <i data-feather="printer" class="text-warning"></i>
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
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {

        feather.replace();

        // Inisialisasi DataTable untuk Tiket Anda
        const tableTiketEl = document.getElementById('datatablesTiket');
        if (tableTiketEl) {
            new simpleDatatables.DataTable(tableTiketEl);
        }

        // Re-render feather icons saat tab diubah
        const tabTriggerList = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabTriggerList.forEach(function(tabTriggerEl) {
            tabTriggerEl.addEventListener('shown.bs.tab', function() {
                feather.replace();
            });
        });

        // FORM PROFILE UPDATE
        const form = document.getElementById('formUpdate');
        const btnUpdate = document.getElementById('btnUpdate');
        const modalEl = document.getElementById('modalSimpan');
        const confirmSimpan = document.getElementById('confirmSimpan');

        const foto = document.getElementById('fotoPreview');

        if (foto) {
            foto.onerror = function() {
                this.onerror = null;
                this.src = "{{ asset('templatepro/assets/img/demo/user-placeholder.svg') }}";
            };
        }

        // BUTTON UPDATE
        if (btnUpdate && form && modalEl) {
            btnUpdate.addEventListener('click', function() {
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }

                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            });
        }

        // CONFIRM SIMPAN
        if (confirmSimpan && form) {
            confirmSimpan.addEventListener('click', function() {
                confirmSimpan.disabled = true;
                confirmSimpan.querySelector('.btn-text')?.classList.add('d-none');
                confirmSimpan.querySelector('.btn-loading')?.classList.remove('d-none');
                form.submit();
            });
        }

        // RIWAYAT TIKET MODAL & PAGINATION
        const modalDetailEl = document.getElementById('modalDetail');
        if (modalDetailEl) {
            const modalHistory = new bootstrap.Modal(modalDetailEl);
            const baseUrl = "{{ url('tiket/history') }}";

            let historyData = [];
            let currentPage = 1;
            const perPage = 5;

            function renderTable() {
                let start = (currentPage - 1) * perPage;
                let end = start + perPage;
                let pageData = historyData.slice(start, end);
                let html = '';

                if (pageData.length === 0) {
                    html = `<tr><td colspan="3" class="text-center">Tidak ada data</td></tr>`;
                } else {
                    pageData.forEach((item, index) => {
                        html += `
                        <tr>
                            <td>Tahap ${start + index + 1}</td>
                            <td>${item.tanggal}</td>
                            <td>${item.status_rel ? item.status_rel.status : '-'}</td>
                        </tr>
                    `;
                    });
                }

                document.getElementById('historyTable').innerHTML = html;
                renderPagination();
            }

            function renderPagination() {
                let totalPage = Math.ceil(historyData.length / perPage);
                let html = '';

                if (totalPage > 1) {
                    if (currentPage > 1) {
                        html += `<button type="button" class="btn btn-sm btn-outline-primary me-1" onclick="prevHistoryPage()">Prev</button>`;
                    }

                    html += `<span class="me-2 align-self-center small">Page ${currentPage} / ${totalPage}</span>`;

                    if (currentPage < totalPage) {
                        html += `<button type="button" class="btn btn-sm btn-outline-primary" onclick="nextHistoryPage()">Next</button>`;
                    }
                }

                document.getElementById('historyPagination').innerHTML = html;
            }

            window.nextHistoryPage = function() {
                currentPage++;
                renderTable();
            };

            window.prevHistoryPage = function() {
                currentPage--;
                renderTable();
            };

            document.addEventListener('click', function(e) {
                const btn = e.target.closest('.btnDetail');
                if (!btn) return;

                e.preventDefault();
                const noTiket = btn.dataset.notiket;

                document.getElementById('mdNoTiket').innerText = noTiket;
                document.getElementById('historyTable').innerHTML =
                    `<tr><td colspan="3" class="text-center">Loading...</td></tr>`;

                fetch(`${baseUrl}/${noTiket}`)
                    .then(res => res.json())
                    .then(data => {
                        historyData = data;
                        currentPage = 1;
                        renderTable();
                    })
                    .catch(() => {
                        document.getElementById('historyTable').innerHTML =
                            `<tr><td colspan="3" class="text-danger text-center">Gagal load data</td></tr>`;
                    });

                modalHistory.show();
            });
        }

    });
</script>
@endsection