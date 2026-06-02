@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="bar-chart-2"></i></div>
                        Laporan Permintaan Layanan
                    </h1>
                </div>
                <div class="col-12 col-xl-auto mb-3">
                    <div class="btn-group">
                        @if ($start && $end)
                        <a class="btn btn-sm btn-light text-success"
                            href="{{ route('adminBidang.laporan.exportPdfBidang', ['start_date' => $start, 'end_date' => $end]) }}"
                            target="_blank">

                            <i class="me-1" data-feather="download"></i>
                            Export PDF
                        </a>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-fluid px-4 mt-4">
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('adminBidang.laporan.indexBidang') }}" id="filterForm">
                <div class="bg-white p-3 rounded-3 mb-4 border">
                    <div class="row align-items-end">
                        <!-- DATE RANGE -->
                        <div class="col-md-3">
                            <label class="form-label">Pilih Rentang Tanggal</label>
                            <div class="input-group input-group-joined border-1">
                                <span class="input-group-text"><i data-feather="calendar"></i></span>
                                <input class="form-control ps-0 pointer" id="myCustomDateRange"
                                    value="{{ $start && $end ? $start . ' - ' . $end : '' }}"
                                    placeholder="Pilih rentang tanggal" />
                            </div>
                        </div>

                        <div class="col-md-2">
                            <label class="form-label d-block">&nbsp;</label>

                            <button type="submit" class="btn btn-primary">
                                <i data-feather="search" class="me-1"></i>
                                Tampilkan
                            </button>
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
                        <th>Nama</th>
                        <th>Layanan</th>
                        <th>Unit Kerja</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <th>No</th>
                        <th>No Tiket</th>
                        <th>NIP</th>
                        <th>Nama</th>
                        <th>Layanan</th>
                        <th>Unit Kerja</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                    </tr>
                </tfoot>
                <tbody>
                    @foreach ($tiket as $item)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $item->no_tiket }}</td>
                        <td>{{ $item->regtiket->nip }}</td>
                        <td>-</td>
                        <td>{{ $item->regtiket->layanan->nama_layanan ?? '-' }}</td>
                        <td>{{ $item->regtiket->kode_ukerja}}</td>
                        <td>{{ $item->tanggal }}</td>
                        <td>{{ $item->statusRel->status ?? '-' }}</td>
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

        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');
        const form = document.getElementById('filterForm');
        const btnExport = document.getElementById('btnExport');

        const baseExportUrl = "{{ route('adminOpd.laporan.exportLaporan') }}";

        const picker = new Litepicker({
            element: document.getElementById('myCustomDateRange'),
            singleMode: false,
            format: 'YYYY-MM-DD',
            autoApply: true,

            setup: (picker) => {
                picker.on('selected', (startDate, endDate) => {

                    if (!startDate || !endDate) return;

                    startInput.value = startDate.format('YYYY-MM-DD');
                    endInput.value = endDate.format('YYYY-MM-DD');
                });
            }
        });

    });
</script>
@endsection