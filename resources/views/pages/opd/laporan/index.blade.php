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
                </div>
            </div>
        </div>
    </header>

    <div class="container-fluid px-4 mt-4">
        <div class="card">
            <div class="card-body">
                <form method="GET" action="{{ route('adminOpd.laporan.indexLaporan') }}" id="filterForm">
                    <div class="bg-white p-3 rounded-3 mb-4 border">
                        <div class="row align-items-end">
                            <!-- DATE RANGE -->
                            <div class="col-md-4">
                                <label class="form-label">Pilih Rentang Tanggal</label>
                                <div class="input-group input-group-joined border-1" style="width: 19.5rem">
                                    <span class="input-group-text"><i data-feather="calendar"></i></span>
                                    <input class="form-control ps-0 pointer" id="myCustomDateRange"
                                        value="{{ $start && $end ? $start . ' - ' . $end : '' }}"
                                        placeholder="Pilih rentang tanggal" />
                                </div>
                            </div>

                            @if ($start && $end)
                                <div class="col-md-4">
                                    <label class="form-label d-block">&nbsp;</label>

                                    <a href="{{ route('adminOpd.laporan.exportLaporan', ['start_date' => $start, 'end_date' => $end]) }}"
                                        class="btn btn-success">
                                        <i data-feather="download" class="me-1"></i>
                                        Export Excel
                                    </a>
                                </div>
                            @endif
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

                        form.submit();
                    });
                }
            });

        });
    </script>
@endsection
