@extends('layouts.app')
@push('styles')
    <link rel="stylesheet" href="{{ asset('css/dashboard.css') }}">
@endpush
@section('content')
    <!-- Main page content-->
    <div class="container-fluid px-4 mt-4">
        <!-- Custom page header alternative example-->
        <div class="d-flex justify-content-between align-items-sm-center flex-column flex-sm-row mb-4">
            <div class="me-4 mb-3 mb-sm-0">

                <h1 class="mb-0">Dashboard</h1>

                <div class="small">
                    <span class="fw-500 text-primary">
                        {{ now()->translatedFormat('l') }}
                    </span>

                    &middot;

                    {{ now()->translatedFormat('d F Y') }}

                    &middot;

                    <span id="clock">
                        {{ now()->format('H:i') }}
                    </span>

                    Wita
                </div>
            </div>

            <!-- Date range picker -->
            <form method="GET" action="{{ route('dashboard') }}" id="filterBulanForm">
                <div class="input-group input-group-joined border-0 shadow" style="width: 11.5rem">
                    <span class="input-group-text">
                        <i data-feather="calendar"></i>
                    </span>

                    <input type="text" name="bulan" class="form-control ps-0" id="monthPicker"
                        placeholder="Pilih bulan">
                </div>
            </form>
            {{-- <div class="input-group input-group-joined border-0 shadow" style="width: 16.5rem">

                <span class="input-group-text">
                    <i data-feather="calendar"></i>
                </span>

                <input class="form-control ps-0 pointer" id="litepickerRangePlugin" placeholder="Select date range..." />
            </div> --}}
        </div>
        <!-- Illustration dashboard card example-->
        <div class="card card-waves mb-4 mt-4">
            @php
                $role = auth()->user()->role->name ?? '';

                $dashboardConfig = [
                    'admin_bawah' => [
                        'text' =>
                            'Silakan melakukan <b>verifikasi permintaan layanan</b> secara berkala untuk memastikan proses pelayanan berjalan dengan baik, tepat, dan sesuai ketentuan.',
                        'button' => 'List Permintaan',
                        'url' => route('adminBawah.permintaan.indexPermintaan'),
                    ],

                    'admin_opd' => [
                        'text' =>
                            'Silakan melakukan <b>pengajuan</b> dan <b>monitoring usulan</b> secara berkala untuk memastikan seluruh proses berjalan dengan baik dan sesuai tahapan.',
                        'button' => 'Pengajuan',
                        'url' => route('adminOpd.tiket.create'),
                    ],

                    'bidang' => [
                        'text' =>
                            'Silakan melakukan <b>verifikasi permintaan layanan</b> secara berkala untuk memastikan proses pelayanan berjalan dengan baik, tepat, dan sesuai ketentuan.',
                        'button' => 'List Permintaan',
                        'url' => route('adminBidang.permintaan.index'),
                    ],

                    'root' => [
                        'text' =>
                            'Silakan melakukan pengelolaan master data, pemantauan sistem, serta pelaksanaan <i><b>backup database</b></i> secara berkala untuk menjaga keamanan dan konsistensi data.',
                        'button' => 'Backup Database',
                        'url' => route('root.backup.database'),
                    ],
                ];

                // fallback ke root jika role tidak ditemukan
                $config = $dashboardConfig[$role] ?? $dashboardConfig['root'];
            @endphp

            <div class="card-body p-4">
                <div class="row align-items-center justify-content-between">

                    <div class="col-12 col-lg-7 col-xl-6">
                        <h2 class="text-primary">
                            Selamat datang, {{ auth()->user()->nama }}!
                        </h2>

                        <p class="text-gray-700">
                            {!! $config['text'] !!}
                        </p>

                        <a class="btn btn-primary p-3" href="{{ $config['url'] }}">
                            {{ $config['button'] }}
                            <i class="ms-1" data-feather="arrow-right"></i>
                        </a>
                    </div>

                    <div class="col-12 col-lg-5 col-xl-4 d-none d-lg-block">

                        <div class="user-info-card">

                            <!-- Header -->
                            <div class="d-flex justify-content-between align-items-start mb-1">

                                <div>
                                    <div class="small fw-bold text-primary">
                                        Data Pengguna
                                    </div>

                                    <div class="small">
                                        Informasi akun login
                                    </div>
                                </div>

                                <div class="icon-box bg-primary-soft text-primary">
                                    <i data-feather="user"></i>
                                </div>

                            </div>

                            <!-- NIP -->
                            <div class="d-flex mb-1">

                                <div class="icon-box-sm bg-light-primary text-primary me-3">
                                    <i data-feather="credit-card"></i>
                                </div>

                                <div style="min-width: 0;">
                                    <div class="fw-semibold small">
                                        NIP
                                    </div>

                                    <div class="small">
                                        {{ auth()->user()->username ?? '-' }}
                                    </div>
                                </div>

                            </div>

                            <!-- UNIT KERJA -->
                            <div class="d-flex mb-1">

                                <div class="icon-box-sm bg-light-success text-success me-3">
                                    <i data-feather="briefcase"></i>
                                </div>

                                <div style="min-width: 0;">
                                    <div class="fw-semibold small">
                                        Unit Kerja
                                    </div>

                                    <div class="small">
                                        {{ $ket_ukerja ?? '-' }}
                                    </div>
                                </div>

                            </div>

                            <!-- EMAIL -->
                            <div class="d-flex">

                                <div class="icon-box-sm bg-light-info text-info me-3">
                                    <i data-feather="mail"></i>
                                </div>

                                <div style="min-width: 0;">
                                    <div class="fw-semibold small">
                                        Email
                                    </div>

                                    <div class="small">
                                        {{ auth()->user()->email ?? '-' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {{-- <div class="col-12 col-lg-5 col-xl-4 text-end d-none d-lg-block">
                        <img class="img-fluid" src="{{ asset('images/statistics.svg') }}" style="max-width: 320px">
                    </div> --}}

                </div>
            </div>
        </div>
        <div class="row">

            <!-- Widget 1 -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-start-lg border-start-primary h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">

                                <div class="small fw-bold text-primary mb-1">
                                    Pengajuan Hari Ini
                                </div>

                                <div class="h5">
                                    {{ number_format($pengajuanHariIni) }}
                                </div>

                                <div
                                    class="text-xs fw-bold text-{{ $trendHariIni['class'] }} d-inline-flex align-items-center">
                                    <i class="me-1" data-feather="{{ $trendHariIni['icon'] }}"></i>
                                    {{ $trendHariIni['jumlah'] }} <span class="text-muted fw-normal ms-1"> Dibanding
                                        kemarin</span>
                                </div>
                            </div>

                            <div class="ms-2">
                                <i class="fas fa-file-alt fa-2x text-gray-200"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Widget 2 -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-start-lg border-start-secondary h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">

                                <div class="small fw-bold text-secondary mb-1">
                                    Pengajuan Bulan Ini
                                </div>

                                <div class="h5">
                                    {{ number_format($pengajuanBulanIni) }}
                                </div>

                                <div
                                    class="text-xs fw-bold text-{{ $trendPengajuan['class'] }} d-inline-flex align-items-center">
                                    <i class="me-1" data-feather="{{ $trendPengajuan['icon'] }}">
                                    </i>

                                    {{ $trendPengajuan['jumlah'] }} <span class="text-muted fw-normal ms-1"> Dibanding
                                        bulan lalu</span>
                                </div>
                            </div>

                            <div class="ms-2">
                                <i class="fas fa-calendar-alt fa-2x text-gray-200"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Widget 3 -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-start-lg border-start-danger h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">

                                <div class="small fw-bold text-danger mb-1">
                                    Jumlah BTL Bulan ini
                                </div>

                                <div class="h5">
                                    {{ number_format($btlBulanIni) }}
                                </div>

                                <div
                                    class="text-xs fw-bold text-{{ $trendBTL['class'] }} d-inline-flex align-items-center">
                                    <i class="me-1" data-feather="{{ $trendBTL['icon'] }}">
                                    </i>

                                    {{ $trendBTL['jumlah'] }} <span class="text-muted fw-normal ms-1"> Dibanding bulan
                                        lalu</span>
                                </div>
                            </div>

                            <div class="ms-2">
                                <i class="fas fa-times-circle fa-2x text-gray-200"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Widget 4 -->
            <div class="col-xl-3 col-md-6 mb-4">
                <div class="card border-start-lg border-start-success h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="flex-grow-1">

                                <div class="small fw-bold text-success mb-1">
                                    Tiket Selesai Diproses
                                </div>

                                <div class="h5">
                                    {{ number_format($tiketArchives) }}
                                </div>
                                <div
                                    class="text-xs fw-bold text-{{ $trendTahap['class'] }} d-inline-flex align-items-center">
                                    <i class="me-1" data-feather="{{ $trendTahap['icon'] }}">
                                    </i>

                                    {{ $trendTahap['jumlah'] }} <span class="text-muted fw-normal ms-1"> Dibanding bulan
                                        lalu</span>
                                </div>
                            </div>

                            <div class="ms-2">
                                <i class="fas fa-check-circle fa-2x text-gray-200"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        @php
            $isAdminOpd = auth()->user()->role->name == 'admin_opd';
        @endphp
        <div class="row">

            {{-- CHART BIDANG --}}
            @if (!$isAdminOpd)
                <div class="col-lg-4 mb-4">
                    <div class="card mb-4">
                        <div class="card-header">
                            Pengajuan Per Bidang
                        </div>
                        <div class="card-body d-flex flex-column justify-content-center">
                            <div class="chart-bar">
                                <canvas id="myBarChart" width="100%" height="30"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            @endif


            {{-- CHART TAHUNAN --}}
            <div class="{{ $isAdminOpd ? 'col-lg-12' : 'col-lg-8' }} mb-4">
                <div class="card mb-4">
                    <div class="card-header">
                        Jumlah Pengajuan Tahun Ini
                    </div>
                    <div class="card-body">
                        <div class="chart-area">
                            <canvas id="myAreaChart" width="100%" height="30"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    @push('scripts')
        <script>
            $(document).ready(function() {

                // MONTH PICKER
                $('#monthPicker').datepicker({
                    format: "yyyy-mm",
                    startView: "months",
                    minViewMode: "months",
                    autoclose: true
                });

                // DEFAULT BULAN
                $('#monthPicker').datepicker(
                    'setDate',
                    '{{ request('bulan') ?? now()->format('Y-m') }}'
                );

                // SUBMIT FILTER
                $('#monthPicker').on('change', function() {
                    document.getElementById('filterBulanForm').submit();
                });

                // CLOCK
                function updateClock() {

                    const now = new Date();

                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');

                    $('#clock').html(`${hours}:${minutes}`);
                }

                updateClock();

                setInterval(updateClock, 1000);

                // CHART BAR PENGAJUAN PER BIDANG
                var ctxBar = document.getElementById("myBarChart");

                if (ctxBar) {

                    var myBarChart = new Chart(ctxBar, {
                        type: 'bar',

                        data: {
                            labels: @json($chartBidangLabels),

                            datasets: [{
                                label: "Jumlah Pengajuan",
                                backgroundColor: "#4e73df",
                                hoverBackgroundColor: "#2e59d9",
                                borderColor: "#4e73df",

                                data: @json($chartBidangData),
                            }],
                        },

                        options: {

                            maintainAspectRatio: false,

                            layout: {
                                padding: {
                                    left: 10,
                                    right: 25,
                                    top: 25,
                                    bottom: 0
                                }
                            },

                            scales: {

                                xAxes: [{
                                    gridLines: {
                                        display: false,
                                        drawBorder: false
                                    },

                                    ticks: {
                                        maxTicksLimit: 6
                                    },

                                    maxBarThickness: 40,
                                }],

                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                        precision: 0,
                                        padding: 10,
                                    },

                                    gridLines: {
                                        color: "rgb(234, 236, 244)",
                                        zeroLineColor: "rgb(234, 236, 244)",
                                        drawBorder: false,
                                        borderDash: [2],
                                        zeroLineBorderDash: [2]
                                    }
                                }],
                            },

                            legend: {
                                display: false
                            },

                            tooltips: {
                                backgroundColor: "rgb(255,255,255)",
                                bodyFontColor: "#858796",
                                titleMarginBottom: 10,
                                titleFontColor: '#6e707e',
                                titleFontSize: 14,
                                borderColor: '#dddfeb',
                                borderWidth: 1,
                                xPadding: 15,
                                yPadding: 15,
                                displayColors: false,
                                intersect: false,
                                mode: 'index',
                                caretPadding: 10,

                                callbacks: {
                                    label: function(tooltipItem, chart) {

                                        var datasetLabel =
                                            chart.datasets[tooltipItem.datasetIndex].label || '';

                                        return datasetLabel + ': ' + tooltipItem.yLabel;
                                    }
                                }
                            }
                        }
                    });
                }

                // CHART PENGAJUAN TAHUNAN 
                var ctxArea = document.getElementById("myAreaChart");

                if (ctxArea) {

                    var myLineChart = new Chart(ctxArea, {

                        type: 'line',

                        data: {
                            labels: @json($chartTahunLabels),

                            datasets: [{
                                label: "Jumlah Pengajuan",

                                lineTension: 0.3,

                                backgroundColor: "rgba(78, 115, 223, 0.05)",
                                borderColor: "rgba(78, 115, 223, 1)",

                                pointRadius: 3,
                                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                                pointBorderColor: "rgba(78, 115, 223, 1)",

                                pointHoverRadius: 3,
                                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                                pointHoverBorderColor: "rgba(78, 115, 223, 1)",

                                pointHitRadius: 10,
                                pointBorderWidth: 2,

                                data: @json($chartTahunData),
                            }],
                        },

                        options: {

                            maintainAspectRatio: false,

                            layout: {
                                padding: {
                                    left: 10,
                                    right: 25,
                                    top: 25,
                                    bottom: 0
                                }
                            },

                            scales: {

                                xAxes: [{
                                    gridLines: {
                                        display: false,
                                        drawBorder: false
                                    },

                                    ticks: {
                                        maxTicksLimit: 12
                                    }
                                }],

                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                        precision: 0,
                                        padding: 10,
                                    },

                                    gridLines: {
                                        color: "rgb(234, 236, 244)",
                                        zeroLineColor: "rgb(234, 236, 244)",
                                        drawBorder: false,
                                        borderDash: [2],
                                        zeroLineBorderDash: [2]
                                    }
                                }],
                            },

                            legend: {
                                display: false
                            },

                            tooltips: {

                                backgroundColor: "rgb(255,255,255)",
                                bodyFontColor: "#858796",

                                titleMarginBottom: 10,
                                titleFontColor: '#6e707e',
                                titleFontSize: 14,

                                borderColor: '#dddfeb',
                                borderWidth: 1,

                                xPadding: 15,
                                yPadding: 15,

                                displayColors: false,
                                intersect: false,
                                mode: 'index',
                                caretPadding: 10,

                                callbacks: {
                                    label: function(tooltipItem, chart) {

                                        var datasetLabel =
                                            chart.datasets[tooltipItem.datasetIndex].label || '';

                                        return datasetLabel + ': ' + tooltipItem.yLabel;
                                    }
                                }
                            }
                        }
                    });
                }
            });
        </script>
    @endpush
@endsection
