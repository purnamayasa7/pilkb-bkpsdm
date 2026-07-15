@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="briefcase"></i></div>
                        List Permintaan Layanan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <!-- Dropdown Export -->
                    <div class="btn-group">
                        <button class="btn btn-sm btn-light text-success dropdown-toggle" type="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="me-1" data-feather="download"></i>
                            Export
                        </button>
                        <ul class="dropdown-menu">
                            <li>
                                <a class="dropdown-item" href="#">
                                    <i class="me-1" data-feather="file-text"></i> Export Excel
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="#">
                                    <i class="me-1" data-feather="file"></i> Export PDF
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

{{-- Modal Lihat Data --}}
<div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Riwayat Permintaan</h5>
                <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="row">
                    <div class="col-12">
                        <div class="card shadow-sm">
                            <div class="card-body">

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="layers" class="me-1"></i> Bidang</span>
                                    <span id="detailBidang" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="briefcase" class="me-1"></i> Nama Layanan</span>
                                    <span id="detailNama" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="copy" class="me-1"></i> Rangkap</span>
                                    <span id="detailRangkap" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="clock" class="me-1"></i> Waktu Penyelesaian</span>
                                    <span id="detailWaktu" class="text-end"></span>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span><i data-feather="toggle-right" class="me-1"></i> Status</span>
                                    <span id="detailStatus" class="text-end"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('root.tiket') }}" id="filterForm">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        <!-- BIDANG -->
                        <div class="col-md-4">
                            <label class="form-label">Bidang</label>
                            <select name="bidang" id="bidangSelect" class="form-select">
                                <option value="">-- Pilih Bidang --</option>
                                @foreach ($bidang as $b)
                                <option value="{{ $b->id }}" {{ $bidangId == $b->id ? 'selected' : '' }}>
                                    {{ $b->nama_bidang }}
                                </option>
                                @endforeach
                            </select>
                        </div>

                        <!-- DATE RANGE -->
                        <div class="col-md-4">
                            <label class="form-label">Rentang Tanggal</label>
                            <div class="input-group input-group-joined border-1" style="width: 16.5rem">
                                <span class="input-group-text"><i data-feather="calendar"></i></span>
                                <input class="form-control ps-0 pointer" id="myCustomDateRange"
                                    value="{{ $start && $end ? $start . ' - ' . $end : '' }}"
                                    placeholder="Pilih rentang tanggal" />
                            </div>
                        </div>
                    </div>
                    <!-- HIDDEN INPUT -->
                    <input type="hidden" name="start_date" id="startDate">
                    <input type="hidden" name="end_date" id="endDate">
                </div>
            </form>
            <table id="datatablesSimple">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>No Tiket</th>
                        <th>NIP</th>
                        <th>Unit Kerja</th>
                        <th>Layanan</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <th>No</th>
                        <th>No Tiket</th>
                        <th>NIP</th>
                        <th>Unit Kerja</th>
                        <th>Layanan</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </tfoot>
                <tbody>
                    @foreach ($tiket as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->no_tiket }}</td>
                        <td>
                            {{ $item->nip }} <br>
                            <small class="text-muted">
                                {{ $pegawaiList[$item->nip]['nama_lengkap'] ?? '-' }}
                            </small>
                        </td>
                        <td> {{ $pegawaiList[$item->nip]['ket_ukerja'] ?? '-' }}</td>
                        <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                        <td>{{ $item->tanggal }}</td>
                        <td>{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <a class="btn btn-datatable btn-icon btn-transparent-dark me-1 btnDetail"
                                    href="#" data-id="{{ $item->id }}" title="Lihat riwayat">

                                    <i data-feather="eye" class="text-primary"></i>
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

        const bidangSelect = document.getElementById('bidangSelect');
        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');
        const form = document.getElementById('filterForm');

        const picker = new Litepicker({
            element: document.getElementById('myCustomDateRange'),
            singleMode: false,
            format: 'YYYY-MM-DD',
            autoApply: true,

            setup: (picker) => {

                picker.on('selected', (startDate, endDate) => {
                    if (!startDate || !endDate) return;

                    if (!bidangSelect.value) {
                        alert('Pilih bidang terlebih dahulu');
                        return;
                    }

                    startInput.value = startDate.format('YYYY-MM-DD');
                    endInput.value = endDate.format('YYYY-MM-DD');

                    form.submit();
                });

            }
        });

    });
</script>
@endsection