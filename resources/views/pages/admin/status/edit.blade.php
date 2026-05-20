@extends('layouts.app')

@section('content')
    <div class="modal fade" id="modalSimpan" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Data Status</h5>
                    <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    Apakah anda yakin menyimpan perubahan status ini?
                </div>
                <div class="modal-footer">
                    <button class="btn btn-light" data-bs-dismiss="modal">Kembali</button>
                    <button class="btn btn-primary" type="button" id="confirmSimpan">Simpan</button>
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
                            Update Status
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

    <div class="container-fluid px-4 mt-4">
        <div class="card mb-4">
            <div class="card-header bg-gradient-primary-to-secondary text-white">Detail Status</div>
            <div class="card-body">

                <form id="formRegister" method="POST" action="{{ route('root.status.update', $status->id) }}">
                    @csrf
                    @method('PUT')

                    <div class="mb-3">
                        <label class="small mb-1">Bidang</label>
                        <select name="kode_bidang" id="kode_bidang" class="form-select" required>
                            <option value="" disabled>Pilih Bidang</option>
                            @foreach ($bidang as $b)
                                <option value="{{ $b->id }}"
                                    {{ optional($status->layanan)->kode_bidang == $b->id ? 'selected' : '' }}>
                                    {{ $b->nama_bidang }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="small mb-1">Layanan</label>
                        <select name="kode_layanan" id="kode_layanan" class="form-select" required>
                            <option disabled selected>Loading...</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="small mb-1">Status</label>
                        <input class="form-control" name="status" type="text"
                            value="{{ old('status', $status->status) }}" required>
                    </div>

                    <button class="btn btn-primary" type="button" id="btnTambah">
                        Update Status
                    </button>
                </form>

            </div>
        </div>
    </div>

    <script>
        const selectedBidang = "{{ optional($status->layanan)->kode_bidang }}";
        const selectedLayanan = "{{ $status->kode_layanan }}";
    </script>

    <script>
        const bidangSelect = document.getElementById('kode_bidang');
        const layananSelect = document.getElementById('kode_layanan');

        function loadLayanan(bidangId, selected = null) {

            layananSelect.disabled = true;
            layananSelect.innerHTML = '<option disabled selected>Loading...</option>';

            fetch(`/root/get-layanan-status/${bidangId}`)
                .then(res => res.json())
                .then(data => {

                    if (data.length === 0) {
                        layananSelect.innerHTML =
                            '<option disabled selected>Tidak ada layanan</option>';
                        layananSelect.disabled = true;
                        return;
                    }

                    layananSelect.disabled = false;
                    layananSelect.innerHTML = '<option disabled>Pilih Layanan</option>';

                    data.forEach(item => {
                        let selectedAttr = (selected == item.id) ? 'selected' : '';
                        layananSelect.innerHTML +=
                            `<option value="${item.id}" ${selectedAttr}>${item.nama_layanan}</option>`;
                    });
                })
                .catch(() => {
                    layananSelect.innerHTML =
                        '<option disabled selected>Error load data</option>';
                });
        }

        document.addEventListener('DOMContentLoaded', function() {

            if (selectedBidang) {
                loadLayanan(selectedBidang, selectedLayanan);
            }

            const form = document.getElementById('formRegister');
            const btnTambah = document.getElementById('btnTambah');
            const modal = new bootstrap.Modal(document.getElementById('modalSimpan'));

            btnTambah.addEventListener('click', function() {
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                modal.show();
            });

            document.getElementById('confirmSimpan').addEventListener('click', function() {
                form.submit();
            });
        });

        bidangSelect.addEventListener('change', function() {
            loadLayanan(this.value);
        });
    </script>
@endsection
