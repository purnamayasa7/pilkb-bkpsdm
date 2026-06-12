<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\DetailTiket;
use App\Models\Regtiket;
use App\Services\PegawaiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $pegawaiService;

    public function __construct(PegawaiService $pegawaiService)
    {
        $this->pegawaiService = $pegawaiService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        // GET DATA API
        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($user->username);

        $ket_ukerja = $pegawai['ket_ukerja'] ?? '-';

        // Filter Bulan
        if ($request->filled('bulan')) {

            $selectedDate = Carbon::createFromFormat(
                'Y-m',
                $request->bulan
            );
        } else {

            $selectedDate = Carbon::now();
        }

        $month = $selectedDate->month;
        $year = $selectedDate->year;

        $lastMonthDate = $selectedDate->copy()->subMonth();

        $lastMonth = $lastMonthDate->month;
        $lastMonthYear = $lastMonthDate->year;

        $user = Auth::user();

        $baseQuery = Regtiket::query();

        $baseLastMonthQuery = Regtiket::query();

        // Filter untuk Role Bidang
        if ($user->role->name == 'bidang') {

            $baseQuery->where(
                'kode_ukerja',
                $user->kode_ukerja
            );

            $baseLastMonthQuery->where(
                'kode_ukerja',
                $user->kode_ukerja
            );
        }

        // Widget 1 Pengajuan Hari ini

        $pengajuanHariIniQuery = Regtiket::query();
        $pengajuanKemarinQuery = Regtiket::query();

        if ($user->role->name == 'bidang') {

            $pengajuanHariIniQuery->where(
                'kode_ukerja',
                $user->kode_ukerja
            );

            $pengajuanKemarinQuery->where(
                'kode_ukerja',
                $user->kode_ukerja
            );
        }

        $pengajuanHariIni = $pengajuanHariIniQuery
            ->whereDate('tanggal', today())
            ->count();

        $pengajuanKemarin = $pengajuanKemarinQuery
            ->whereDate('tanggal', today()->subDay())
            ->count();

        $trendHariIni = $this->calculateTrend(
            $pengajuanHariIni,
            $pengajuanKemarin
        );

        // Widget 2 Pengajuan Bulan ini

        $pengajuanBulanIni = (clone $baseQuery)
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->count();

        $pengajuanBulanLalu = (clone $baseLastMonthQuery)
            ->whereMonth('tanggal', $lastMonth)
            ->whereYear('tanggal', $lastMonthYear)
            ->count();

        $trendPengajuan = $this->calculateTrend(
            $pengajuanBulanIni,
            $pengajuanBulanLalu
        );

        // Widget 3 Jumlah BTL

        $btlBulanIni = DetailTiket::where('status', 2)
            ->whereHas('regtiket', function ($query) use (
                $month,
                $year,
                $user
            ) {
                $query->whereMonth('tanggal', $month)
                    ->whereYear('tanggal', $year);

                if ($user->role->name == 'bidang') {
                    $query->where(
                        'kode_ukerja',
                        $user->kode_ukerja
                    );
                }
            })
            ->count();

        $btlBulanLalu = DetailTiket::where('status', 2)
            ->whereHas('regtiket', function ($query) use (
                $lastMonth,
                $lastMonthYear,
                $user
            ) {
                $query->whereMonth('tanggal', $lastMonth)
                    ->whereYear('tanggal', $lastMonthYear);

                if ($user->role->name == 'bidang') {
                    $query->where(
                        'kode_ukerja',
                        $user->kode_ukerja
                    );
                }
            })
            ->count();

        $trendBTL = $this->calculateReverseTrend(
            $btlBulanIni,
            $btlBulanLalu
        );

       // Widget 4 Pengajuan Selesai (Archives)

        $tiketArchives = (clone $baseQuery)
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->where('archives', 1)
            ->count();

        $tiketArchivesBulanLalu = (clone $baseLastMonthQuery)
            ->whereMonth('tanggal', $lastMonth)
            ->whereYear('tanggal', $lastMonthYear)
            ->where('archives', 1)
            ->count();

        $trendTahap = $this->calculateTrend(
            $tiketArchives,
            $tiketArchivesBulanLalu
        );

        // Chart Jumlah Pengajuan Per Bidang

        $chartBidang = Regtiket::join(
            'tb_layanan',
            'tb_regtiket.kode_layanan',
            '=',
            'tb_layanan.id'
        )
            ->join(
                'tb_bidang',
                'tb_layanan.kode_bidang',
                '=',
                'tb_bidang.id'
            )
            ->whereYear('tb_regtiket.tanggal', $year)
            ->selectRaw('
        tb_bidang.nama_bidang,
        COUNT(*) as total_pengajuan
    ')
            ->groupBy('tb_bidang.nama_bidang')
            ->get();


        // SINGKATAN BIDANG
        $singkatanBidang = [

            'Bidang Pengembangan Kompetensi Aparatur'
            => 'PKA',

            'Bidang Penilaian Kinerja Aparatur dan Promosi'
            => 'PKAP',

            'Bidang Pengadaan, Pemberhentian, dan Informasi'
            => 'PPI',

            'Bidang Mutasi dan Penghargaan'
            => 'MP',
        ];


        // LABEL CHART
        $chartBidangLabels = $chartBidang->map(function ($item) use ($singkatanBidang) {

            return $singkatanBidang[$item->nama_bidang]
                ?? $item->nama_bidang;
        });


        // DATA CHART
        $chartBidangData = $chartBidang
            ->pluck('total_pengajuan');

        // Chart Pengajuan Tahun ini

        $chartTahunLabels = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'Mei',
            'Jun',
            'Jul',
            'Ags',
            'Sep',
            'Okt',
            'Nov',
            'Des'
        ];

        $chartTahunQuery = Regtiket::selectRaw('
        MONTH(tanggal) as bulan,
        COUNT(*) as total
    ')
            ->whereYear('tanggal', $year);

        // FILTER ADMIN OPD
        if ($user->role->name == 'admin_opd') {

            $chartTahunQuery->where(
                'kode_ukerja',
                $user->kode_ukerja
            );
        }

        $chartTahun = $chartTahunQuery
            ->groupBy(DB::raw('MONTH(tanggal)'))
            ->pluck('total', 'bulan');

        $chartTahunData = [];

        for ($i = 1; $i <= 12; $i++) {

            $chartTahunData[] = $chartTahun[$i] ?? 0;
        }

        return view('pages.dashboard', compact(
            'user',
            'ket_ukerja',

            'selectedDate',

            'pengajuanHariIni',
            'pengajuanBulanIni',
            'btlBulanIni',
            'tiketArchives',

            'trendHariIni',
            'trendPengajuan',
            'trendBTL',
            'trendTahap',

            'chartBidangLabels',
            'chartBidangData',

            'chartTahunLabels',
            'chartTahunData'
        ));
    }

    // Helper Trend
    
    private function calculateTrend($current, $previous)
    {
        $difference = $current - $previous;

        // Naik
        if ($difference > 0) {

            return [
                'jumlah' => '+' . $difference,
                'icon' => 'arrow-up-circle',
                'class' => 'success',
            ];
        }

        // Turun
        if ($difference < 0) {

            return [
                'jumlah' => $difference,
                'icon' => 'arrow-down-circle',
                'class' => 'danger',
            ];
        }

        // Tetap
        return [
            'jumlah' => 0,
            'icon' => 'minus-circle',
            'class' => 'secondary',
        ];
    }

    // Helper trend - Semakin Kecil semakin baik
    private function calculateReverseTrend($current, $previous)
    {
        $difference = $current - $previous;

        // Naik = buruk
        if ($difference > 0) {

            return [
                'jumlah' => '+' . $difference,
                'icon' => 'arrow-up-circle',
                'class' => 'danger',
            ];
        }

        // Turun = bagus
        if ($difference < 0) {

            return [
                'jumlah' => $difference,
                'icon' => 'arrow-down-circle',
                'class' => 'success',
            ];
        }

        // Tetap
        return [
            'jumlah' => 0,
            'icon' => 'minus-circle',
            'class' => 'secondary',
        ];
    }
}
