<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\LayananReview;
use App\Models\Regtiket;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PimpinanController extends Controller
{
    /**
     * Dashboard Eksekutif — aggregasi metrik utama untuk Kepala Badan / Sekretaris
     * berdasarkan periode tahun (default tahun berjalan / sekarang).
     */
    public function dashboard(Request $request)
    {
        // 1. Ambil tahun terpilih (default tahun berjalan / sekarang)
        $currentYear = (int) date('Y');
        $year        = (int) $request->input('year', $currentYear);
        if ($year < 2000 || $year > 2100) {
            $year = $currentYear;
        }

        // Rentang waktu 1 tahun (mengoptimalkan index B-Tree MySQL pada kolom 'tanggal')
        $startOfYear = Carbon::create($year, 1, 1)->startOfDay();
        $endOfYear   = Carbon::create($year, 12, 31)->endOfDay();

        // 2. Daftar tahun tersedia (di-cache 1 jam agar zero query overhead)
        $availableYears = Cache::remember('pimpinan_available_years', 3600, function () use ($currentYear) {
            $years = Regtiket::where('dihapus', 0)
                ->selectRaw('DISTINCT YEAR(tanggal) as yr')
                ->whereNotNull('tanggal')
                ->orderByDesc('yr')
                ->pluck('yr')
                ->map(fn($y) => (int) $y)
                ->toArray();

            if (empty($years)) {
                $years = [$currentYear];
            } elseif (!in_array($currentYear, $years)) {
                array_unshift($years, $currentYear);
                rsort($years);
            }
            return $years;
        });

        // 3. Metrik Utama untuk Tahun Terpilih (1 Query Agregat Tunggal)
        $metricsRow = Regtiket::where('dihapus', 0)
            ->whereBetween('tanggal', [$startOfYear, $endOfYear])
            ->selectRaw("
                COUNT(*) as total_usulan,
                SUM(CASE WHEN archives = 1 THEN 1 ELSE 0 END) as total_selesai,
                SUM(CASE WHEN EXISTS(SELECT 1 FROM tb_det_tiket d WHERE d.no_tiket = tb_regtiket.no_tiket AND d.status = 2) THEN 1 ELSE 0 END) as total_btl
            ")
            ->first();

        $totalUsulan  = (int) ($metricsRow->total_usulan ?? 0);
        $totalSelesai = (int) ($metricsRow->total_selesai ?? 0);
        $pctSelesai   = $totalUsulan > 0 ? round(($totalSelesai / $totalUsulan) * 100, 1) : 0;
        $totalBtl     = (int) ($metricsRow->total_btl ?? 0);
        $ratioBtl     = $totalUsulan > 0 ? round(($totalBtl / $totalUsulan) * 100, 1) : 0;

        // 4. Rata-rata Skor IKM / Kepuasan Tahun Terpilih (1 Query Agregat Tunggal)
        $reviewRow = LayananReview::whereBetween('created_at', [$startOfYear, $endOfYear])
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_review')
            ->first();

        $avgRating   = round((float) ($reviewRow->avg_rating ?? 0), 2);
        $totalReview = (int) ($reviewRow->total_review ?? 0);

        // 5. Performa Per Bidang Tahun Terpilih (Efisien dengan 2 query agregat)
        $bidang = Bidang::orderBy('id')->get();

        $usulanByBidang = Regtiket::join('tb_layanan', 'tb_regtiket.kode_layanan', '=', 'tb_layanan.id')
            ->where('tb_regtiket.dihapus', 0)
            ->whereBetween('tb_regtiket.tanggal', [$startOfYear, $endOfYear])
            ->select(
                'tb_layanan.kode_bidang',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN tb_regtiket.archives = 1 THEN 1 ELSE 0 END) as selesai'),
                DB::raw("SUM(CASE WHEN EXISTS(SELECT 1 FROM tb_det_tiket d WHERE d.no_tiket = tb_regtiket.no_tiket AND d.status = 2) THEN 1 ELSE 0 END) as btl")
            )
            ->groupBy('tb_layanan.kode_bidang')
            ->get()
            ->keyBy('kode_bidang');

        $reviewByBidang = LayananReview::join('tb_layanan', 'tb_layanan_review.kode_layanan', '=', 'tb_layanan.id')
            ->whereBetween('tb_layanan_review.created_at', [$startOfYear, $endOfYear])
            ->select(
                'tb_layanan.kode_bidang',
                DB::raw('COUNT(*) as total_review'),
                DB::raw('AVG(tb_layanan_review.rating) as avg_rating')
            )
            ->groupBy('tb_layanan.kode_bidang')
            ->get()
            ->keyBy('kode_bidang');

        $statPerBidang = [];
        foreach ($bidang as $b) {
            $u = $usulanByBidang->get($b->id);
            $r = $reviewByBidang->get($b->id);
            $statPerBidang[] = [
                'bidang'       => $b->nama_bidang ?? $b->name ?? $b->id,
                'total'        => (int) ($u->total ?? 0),
                'selesai'      => (int) ($u->selesai ?? 0),
                'btl'          => (int) ($u->btl ?? 0),
                'avg_rating'   => round((float) ($r->avg_rating ?? 0), 2),
                'total_review' => (int) ($r->total_review ?? 0),
            ];
        }

        // 6. Tren Bulanan 12 Bulan Penuh (Januari - Desember Tahun Terpilih)
        $rawTrend = Regtiket::where('dihapus', 0)
            ->whereBetween('tanggal', [$startOfYear, $endOfYear])
            ->selectRaw("MONTH(tanggal) as bln, COUNT(*) as total")
            ->groupBy('bln')
            ->pluck('total', 'bln');

        $trendBulanan = [];
        $monthNames = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];
        $monthFullNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        for ($m = 1; $m <= 12; $m++) {
            $trendBulanan[] = [
                'bulan'      => sprintf('%04d-%02d', $year, $m),
                'label'      => $monthNames[$m] . ' ' . substr((string)$year, -2),
                'label_full' => $monthFullNames[$m] . ' ' . $year,
                'total'      => (int) ($rawTrend[$m] ?? 0),
            ];
        }

        // 7. Top 10 OPD Tahun Terpilih (Paling aktif mengajukan dan menyelesaikan)
        $topOpd = Regtiket::where('dihapus', 0)
            ->whereBetween('tanggal', [$startOfYear, $endOfYear])
            ->select(
                'nama_ukerja',
                'kode_ukerja',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN archives = 1 THEN 1 ELSE 0 END) as selesai')
            )
            ->groupBy('nama_ukerja', 'kode_ukerja')
            ->orderByDesc('selesai')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return Inertia::render('Pimpinan/Dashboard/Index', [
            'metrics' => [
                'total_usulan'   => $totalUsulan,
                'total_selesai'  => $totalSelesai,
                'pct_selesai'    => $pctSelesai,
                'total_btl'      => $totalBtl,
                'ratio_btl'      => $ratioBtl,
                'avg_rating'     => round($avgRating, 2),
                'total_review'   => $totalReview,
            ],
            'stat_per_bidang' => $statPerBidang,
            'trend_bulanan'   => $trendBulanan,
            'top_opd'         => $topOpd,
            'selected_year'   => $year,
            'available_years' => $availableYears,
        ]);
    }

    /**
     * Halaman Evaluasi Kepuasan (SKM) — detail review per bidang.
     */
    public function kepuasan(Request $request)
    {
        $bidangFilter = $request->bidang;

        $reviews = LayananReview::with(['layanan.bidang', 'tiket', 'user'])
            ->when($bidangFilter, function ($q) use ($bidangFilter) {
                $q->whereHas('layanan', fn($q2) => $q2->where('kode_bidang', $bidangFilter));
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        // Distribusi bintang global
        $distribusi = LayananReview::selectRaw('rating, COUNT(*) as jumlah')
            ->groupBy('rating')
            ->orderBy('rating')
            ->get()
            ->keyBy('rating');

        // Rata-rata per bidang (dioptimasi 1 query agregat join)
        $reviewStats = LayananReview::join('tb_layanan', 'tb_layanan_review.kode_layanan', '=', 'tb_layanan.id')
            ->select(
                'tb_layanan.kode_bidang',
                DB::raw('AVG(rating) as avg_rating'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tb_layanan.kode_bidang')
            ->get()
            ->keyBy('kode_bidang');

        $bidangList = Bidang::orderBy('nama_bidang')->get();
        $rataPerBidang = $bidangList->map(function ($b) use ($reviewStats) {
            $stat = $reviewStats->get($b->id);
            $namaLengkap = $b->nama_bidang ?? $b->name ?? $b->id;
            return [
                'id'           => $b->id,
                'nama'         => $this->formatNamaBidangSingkat($namaLengkap),
                'nama_lengkap' => $namaLengkap,
                'avg_rating'   => round($stat->avg_rating ?? 0, 2),
                'total'        => (int) ($stat->total ?? 0),
            ];
        });

        return Inertia::render('Pimpinan/Kepuasan/Index', [
            'reviews'        => $reviews,
            'distribusi'     => $distribusi,
            'rata_per_bidang'=> $rataPerBidang,
            'bidang'         => Bidang::all(),
            'bidangFilter'   => $bidangFilter,
        ]);
    }

    /**
     * Monitoring Beban & Antrean (SLA) Layanan - Dioptimasi dengan SQL Aggregates & Server-side Pagination
     */
    public function monitoring(Request $request)
    {
        // 1. Filter Tahun (Default Tahun Berjalan)
        $currentYear  = (int) date('Y');
        $year         = (int) $request->input('year', $currentYear);
        if ($year < 2000 || $year > 2100) {
            $year = $currentYear;
        }

        $startOfYear  = Carbon::create($year, 1, 1)->startOfDay();
        $endOfYear    = Carbon::create($year, 12, 31)->endOfDay();

        $bidangFilter = $request->bidang;
        $slaFilter    = $request->sla_status; // 'all', 'on_track', 'warning', 'overdue', 'btl'
        $searchQuery  = $request->search;

        // 2. Daftar tahun tersedia dari cache
        $availableYears = Cache::remember('pimpinan_available_years', 3600, function () use ($currentYear) {
            $years = Regtiket::where('dihapus', 0)
                ->selectRaw('DISTINCT YEAR(tanggal) as yr')
                ->whereNotNull('tanggal')
                ->orderByDesc('yr')
                ->pluck('yr')
                ->map(fn($y) => (int) $y)
                ->toArray();

            if (empty($years)) {
                $years = [$currentYear];
            } elseif (!in_array($currentYear, $years)) {
                array_unshift($years, $currentYear);
                rsort($years);
            }
            return $years;
        });

        // 3. Metrik Keseluruhan (1 Query Agregat Cepat)
        $metricsRow = DB::table('tb_regtiket')
            ->leftJoin('tb_layanan', 'tb_regtiket.kode_layanan', '=', 'tb_layanan.id')
            ->where('tb_regtiket.dihapus', 0)
            ->whereBetween('tb_regtiket.tanggal', [$startOfYear, $endOfYear])
            ->selectRaw("
                SUM(CASE WHEN tb_regtiket.archives = 0 THEN 1 ELSE 0 END) as total_antrean_aktif,
                SUM(CASE WHEN tb_regtiket.archives = 0 AND EXISTS(SELECT 1 FROM tb_det_tiket d WHERE d.no_tiket = tb_regtiket.no_tiket AND d.status = 2) THEN 1 ELSE 0 END) as total_btl,
                SUM(CASE WHEN tb_regtiket.archives = 1 THEN 1 ELSE 0 END) as total_selesai,
                SUM(CASE WHEN tb_regtiket.archives = 0
                    AND NOT EXISTS(SELECT 1 FROM tb_det_tiket d WHERE d.no_tiket = tb_regtiket.no_tiket AND d.status = 2)
                    AND DATEDIFF(NOW(), tb_regtiket.tanggal) > (CASE WHEN tb_layanan.satuan_waktu LIKE '%bulan%' THEN COALESCE(tb_layanan.target_waktu, 1) * 30 WHEN tb_layanan.satuan_waktu LIKE '%minggu%' THEN COALESCE(tb_layanan.target_waktu, 1) * 7 ELSE COALESCE(tb_layanan.target_waktu, 7) END)
                THEN 1 ELSE 0 END) as total_overdue
            ")
            ->first();

        $totalAntreanAktif  = (int) ($metricsRow->total_antrean_aktif ?? 0);
        $totalOverdueGlobal = (int) ($metricsRow->total_overdue ?? 0);
        $totalBtl           = (int) ($metricsRow->total_btl ?? 0);
        $totalSelesai       = (int) ($metricsRow->total_selesai ?? 0);

        // 4. Distribusi Beban Per Bidang (Satu Query Group By Efisien)
        $bidangList = Bidang::orderBy('nama_bidang')->get();
        $bidangStats = DB::table('tb_regtiket')
            ->join('tb_layanan', 'tb_regtiket.kode_layanan', '=', 'tb_layanan.id')
            ->where('tb_regtiket.archives', 0)
            ->where('tb_regtiket.dihapus', 0)
            ->whereBetween('tb_regtiket.tanggal', [$startOfYear, $endOfYear])
            ->select(
                'tb_layanan.kode_bidang',
                DB::raw('COUNT(*) as total_aktif'),
                DB::raw("SUM(CASE WHEN EXISTS(SELECT 1 FROM tb_det_tiket d WHERE d.no_tiket = tb_regtiket.no_tiket AND d.status = 2) THEN 1 ELSE 0 END) as total_btl"),
                DB::raw("SUM(CASE WHEN NOT EXISTS(SELECT 1 FROM tb_det_tiket d WHERE d.no_tiket = tb_regtiket.no_tiket AND d.status = 2) AND DATEDIFF(NOW(), tb_regtiket.tanggal) > (CASE WHEN tb_layanan.satuan_waktu LIKE '%bulan%' THEN COALESCE(tb_layanan.target_waktu, 1) * 30 WHEN tb_layanan.satuan_waktu LIKE '%minggu%' THEN COALESCE(tb_layanan.target_waktu, 1) * 7 ELSE COALESCE(tb_layanan.target_waktu, 7) END) THEN 1 ELSE 0 END) as total_overdue")
            )
            ->groupBy('tb_layanan.kode_bidang')
            ->get()
            ->keyBy('kode_bidang');

        $bebanPerBidang = $bidangList->map(function ($b) use ($bidangStats) {
            $stat = $bidangStats->get($b->id);
            $totalAktif = (int) ($stat->total_aktif ?? 0);
            $totalOverdue = (int) ($stat->total_overdue ?? 0);
            $totalBtl = (int) ($stat->total_btl ?? 0);

            $namaLengkap = $b->nama_bidang ?? $b->name ?? $b->id;
            $namaSingkat = $this->formatNamaBidangSingkat($namaLengkap);

            return [
                'id'            => $b->id,
                'nama'          => $namaSingkat,
                'nama_lengkap'  => $namaLengkap,
                'total_aktif'   => $totalAktif,
                'total_overdue' => $totalOverdue,
                'total_btl'     => $totalBtl,
            ];
        });

        // 5. Query Daftar Antrean Aktif dengan Server-side Pagination (Hanya 20 data per halaman)
        $query = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel',
            // Eager-load hanya detail BTL (status=2) untuk efisiensi transform SLA
            'detail' => fn($q) => $q->where('status', 2)->select('no_tiket', 'status'),
        ])
        ->where('tb_regtiket.archives', 0)
        ->where('tb_regtiket.dihapus', 0)
        ->whereBetween('tb_regtiket.tanggal', [$startOfYear, $endOfYear]);

        if ($bidangFilter && $bidangFilter !== 'all') {
            $query->whereHas('layanan', fn($q) => $q->where('kode_bidang', $bidangFilter));
        }

        if ($searchQuery) {
            $query->where(function ($q) use ($searchQuery) {
                $q->where('no_tiket', 'like', "%{$searchQuery}%")
                  ->orWhere('nama', 'like', "%{$searchQuery}%")
                  ->orWhere('nip', 'like', "%{$searchQuery}%")
                  ->orWhere('nama_ukerja', 'like', "%{$searchQuery}%");
            });
        }

        if ($slaFilter && $slaFilter !== 'all') {
            if ($slaFilter === 'btl') {
                // BTL = ada syarat berkas dengan status = 2 di tb_det_tiket
                $query->whereHas('detail', fn($q) => $q->where('status', 2));
            } elseif ($slaFilter === 'overdue') {
                // Overdue = melewati target, bukan BTL
                $query->whereDoesntHave('detail', fn($q) => $q->where('status', 2))
                      ->whereRaw("DATEDIFF(NOW(), tb_regtiket.tanggal) > (SELECT (CASE WHEN l.satuan_waktu LIKE '%bulan%' THEN COALESCE(l.target_waktu, 1) * 30 WHEN l.satuan_waktu LIKE '%minggu%' THEN COALESCE(l.target_waktu, 1) * 7 ELSE COALESCE(l.target_waktu, 7) END) FROM tb_layanan l WHERE l.id = tb_regtiket.kode_layanan)");
            } elseif ($slaFilter === 'warning') {
                // Warning = 70%-100% dari target, bukan BTL
                $query->whereDoesntHave('detail', fn($q) => $q->where('status', 2))
                      ->whereRaw("DATEDIFF(NOW(), tb_regtiket.tanggal) <= (SELECT (CASE WHEN l.satuan_waktu LIKE '%bulan%' THEN COALESCE(l.target_waktu, 1) * 30 WHEN l.satuan_waktu LIKE '%minggu%' THEN COALESCE(l.target_waktu, 1) * 7 ELSE COALESCE(l.target_waktu, 7) END) FROM tb_layanan l WHERE l.id = tb_regtiket.kode_layanan)")
                      ->whereRaw("DATEDIFF(NOW(), tb_regtiket.tanggal) >= (SELECT (CASE WHEN l.satuan_waktu LIKE '%bulan%' THEN COALESCE(l.target_waktu, 1) * 30 WHEN l.satuan_waktu LIKE '%minggu%' THEN COALESCE(l.target_waktu, 1) * 7 ELSE COALESCE(l.target_waktu, 7) END) * 0.7 FROM tb_layanan l WHERE l.id = tb_regtiket.kode_layanan)");
            } elseif ($slaFilter === 'on_track') {
                // On-Track = di bawah 70% target, bukan BTL
                $query->whereDoesntHave('detail', fn($q) => $q->where('status', 2))
                      ->whereRaw("DATEDIFF(NOW(), tb_regtiket.tanggal) < (SELECT (CASE WHEN l.satuan_waktu LIKE '%bulan%' THEN COALESCE(l.target_waktu, 1) * 30 WHEN l.satuan_waktu LIKE '%minggu%' THEN COALESCE(l.target_waktu, 1) * 7 ELSE COALESCE(l.target_waktu, 7) END) * 0.7 FROM tb_layanan l WHERE l.id = tb_regtiket.kode_layanan)");
            }
        }

        $antreanPaginated = $query->orderBy('tb_regtiket.tanggal', 'desc')->paginate(20)->withQueryString();

        // Transformasi SLA hanya untuk 20 item yang sedang aktif di halaman ini
        $antreanPaginated->getCollection()->transform(function ($tiket) {
            $tgl = $tiket->tanggal ? Carbon::parse($tiket->tanggal) : Carbon::now();
            $hariBerjalan = (int) $tgl->diffInDays(now());

            $layanan = $tiket->layanan;
            $targetHari = 7;
            if ($layanan) {
                $targetVal = (int) ($layanan->target_waktu ?: 0);
                if ($targetVal > 0) {
                    $satuan = strtolower($layanan->satuan_waktu ?? 'hari');
                    if (str_contains($satuan, 'bulan')) {
                        $targetHari = $targetVal * 30;
                    } elseif (str_contains($satuan, 'minggu')) {
                        $targetHari = $targetVal * 7;
                    } else {
                        $targetHari = $targetVal;
                    }
                }
            }

            // BTL: eager-loaded detail sudah difilter hanya status=2 — zero extra query
            $isBtl     = $tiket->detail->isNotEmpty();
            $isOverdue = !$isBtl && ($hariBerjalan > $targetHari);
            $isWarning = !$isBtl && !$isOverdue && ($hariBerjalan >= ($targetHari * 0.7));

            $slaStatus = 'on_track';
            if ($isBtl) {
                $slaStatus = 'btl';
            } elseif ($isOverdue) {
                $slaStatus = 'overdue';
            } elseif ($isWarning) {
                $slaStatus = 'warning';
            }

            $tiket->hari_berjalan = $hariBerjalan;
            $tiket->target_hari = $targetHari;
            $tiket->sla_status = $slaStatus;

            return $tiket;
        });

        return Inertia::render('Pimpinan/Monitoring/Index', [
            'metrics' => [
                'total_antrean_aktif' => $totalAntreanAktif,
                'total_overdue'       => $totalOverdueGlobal,
                'total_btl'           => $totalBtl,
                'total_selesai'       => $totalSelesai,
            ],
            'beban_per_bidang' => $bebanPerBidang,
            'antrean'          => $antreanPaginated,
            'bidangList'       => $bidangList,
            'selected_year'    => $year,
            'available_years'  => $availableYears,
            'filters'          => [
                'year'       => $year,
                'bidang'     => $bidangFilter ?? 'all',
                'sla_status' => $slaFilter ?? 'all',
                'search'     => $searchQuery ?? '',
            ],
        ]);
    }

    /**
     * Laporan Eksekutif — rekapitulasi data layanan dengan filter komprehensif & metrik KPI.
     */
    public function laporan(Request $request)
    {
        $bidangFilter = $request->bidang;
        $layananFilter= $request->layanan;
        $statusFilter = $request->input('status', 'all');
        $preset       = $request->preset;
        $tglAwal      = $request->tanggal_awal;
        $tglAkhir     = $request->tanggal_akhir;

        // Jika rentang tanggal belum ditentukan, gunakan preset atau default bulan berjalan
        if (!$tglAwal || !$tglAkhir) {
            if ($preset) {
                switch ($preset) {
                    case 'hari_ini':
                        $tglAwal  = now()->startOfDay()->toDateString();
                        $tglAkhir = now()->endOfDay()->toDateString();
                        break;
                    case 'minggu_ini':
                        $tglAwal  = now()->startOfWeek()->toDateString();
                        $tglAkhir = now()->endOfWeek()->toDateString();
                        break;
                    case 'bulan_lalu':
                        $tglAwal  = now()->subMonth()->startOfMonth()->toDateString();
                        $tglAkhir = now()->subMonth()->endOfMonth()->toDateString();
                        break;
                    case 'triwulan_1':
                        $tglAwal  = now()->startOfYear()->toDateString();
                        $tglAkhir = now()->startOfYear()->addMonths(2)->endOfMonth()->toDateString();
                        break;
                    case 'triwulan_2':
                        $tglAwal  = now()->startOfYear()->addMonths(3)->startOfMonth()->toDateString();
                        $tglAkhir = now()->startOfYear()->addMonths(5)->endOfMonth()->toDateString();
                        break;
                    case 'triwulan_3':
                        $tglAwal  = now()->startOfYear()->addMonths(6)->startOfMonth()->toDateString();
                        $tglAkhir = now()->startOfYear()->addMonths(8)->endOfMonth()->toDateString();
                        break;
                    case 'triwulan_4':
                        $tglAwal  = now()->startOfYear()->addMonths(9)->startOfMonth()->toDateString();
                        $tglAkhir = now()->endOfYear()->toDateString();
                        break;
                    case 'tahun_ini':
                        $tglAwal  = now()->startOfYear()->toDateString();
                        $tglAkhir = now()->endOfYear()->toDateString();
                        break;
                    case 'bulan_ini':
                    default:
                        $tglAwal  = now()->startOfMonth()->toDateString();
                        $tglAkhir = now()->endOfMonth()->toDateString();
                        break;
                }
            } else {
                $tglAwal  = now()->startOfMonth()->toDateString();
                $tglAkhir = now()->endOfMonth()->toDateString();
            }
        }

        $baseQuery = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel',
        ])
        ->where('tb_regtiket.dihapus', 0)
        ->whereBetween('tb_regtiket.tanggal', [
            $tglAwal . ' 00:00:00',
            $tglAkhir . ' 23:59:59',
        ]);

        if ($bidangFilter && $bidangFilter !== 'all') {
            $baseQuery->whereHas('layanan', fn($q) => $q->where('kode_bidang', $bidangFilter));
        }

        if ($layananFilter && $layananFilter !== 'all') {
            $baseQuery->where('tb_regtiket.kode_layanan', $layananFilter);
        }

        if ($statusFilter && $statusFilter !== 'all') {
            if ($statusFilter === 'selesai') {
                $baseQuery->where('tb_regtiket.archives', 1);
            } elseif ($statusFilter === 'proses') {
                $baseQuery->where('tb_regtiket.archives', 0)
                          ->whereDoesntHave('detail', fn($q) => $q->where('status', 2));
            } elseif ($statusFilter === 'btl') {
                // BTL = ada berkas dengan status = 2 di tb_det_tiket
                $baseQuery->whereHas('detail', fn($q) => $q->where('status', 2));
            }
        }

        // Metrik periode ini dioptimasi dalam 1 query agregat tunggal
        $metrikRow = (clone $baseQuery)
            ->selectRaw("
                COUNT(*) as total_usulan,
                SUM(CASE WHEN tb_regtiket.archives = 1 THEN 1 ELSE 0 END) as total_selesai,
                SUM(CASE WHEN EXISTS(SELECT 1 FROM tb_det_tiket d WHERE d.no_tiket = tb_regtiket.no_tiket AND d.status = 2) THEN 1 ELSE 0 END) as total_btl
            ")
            ->first();

        $totalUsulan  = (int) ($metrikRow->total_usulan ?? 0);
        $totalSelesai = (int) ($metrikRow->total_selesai ?? 0);
        $pctSelesai   = $totalUsulan > 0 ? round(($totalSelesai / $totalUsulan) * 100, 1) : 0;
        $totalBtl     = (int) ($metrikRow->total_btl ?? 0);
        $ratioBtl     = $totalUsulan > 0 ? round(($totalBtl / $totalUsulan) * 100, 1) : 0;

        // Rata-rata kepuasan pada periode dan filter terpilih
        $reviewQuery = LayananReview::whereBetween('tb_layanan_review.created_at', [
            $tglAwal . ' 00:00:00',
            $tglAkhir . ' 23:59:59',
        ]);
        if ($bidangFilter && $bidangFilter !== 'all') {
            $reviewQuery->whereHas('layanan', fn($q) => $q->where('kode_bidang', $bidangFilter));
        }
        if ($layananFilter && $layananFilter !== 'all') {
            $reviewQuery->where('tb_layanan_review.kode_layanan', $layananFilter);
        }
        $avgRating = $reviewQuery->avg('rating') ?? 0;

        $usulanList = $baseQuery->latest('tb_regtiket.tanggal')->paginate(20)->withQueryString();

        $bidangList = Bidang::orderBy('nama_bidang')->get()->map(function ($b) {
            $namaLengkap = $b->nama_bidang ?? $b->name ?? $b->id;
            $b->nama_singkat = $this->formatNamaBidangSingkat($namaLengkap);
            return $b;
        });
        $layananList = Layanan::orderBy('nama_layanan')->get();

        return Inertia::render('Pimpinan/Laporan/Index', [
            'metrics' => [
                'total_usulan'  => $totalUsulan,
                'total_selesai' => $totalSelesai,
                'pct_selesai'   => $pctSelesai,
                'total_btl'     => $totalBtl,
                'ratio_btl'     => $ratioBtl,
                'avg_rating'    => round($avgRating, 2),
            ],
            'usulan'      => $usulanList,
            'bidangList'  => $bidangList,
            'layananList' => $layananList,
            'filters'     => [
                'preset'        => $preset,
                'bidang'        => $bidangFilter ?? 'all',
                'layanan'       => $layananFilter ?? 'all',
                'status'        => $statusFilter ?? 'all',
                'tanggal_awal'  => $tglAwal,
                'tanggal_akhir' => $tglAkhir,
            ],
        ]);
    }

    /**
     * Export PDF Laporan Eksekutif
     */
    public function exportPdfLaporan(Request $request)
    {
        $tglAwal  = $request->tanggal_awal ?: now()->startOfMonth()->toDateString();
        $tglAkhir = $request->tanggal_akhir ?: now()->endOfMonth()->toDateString();

        $query = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel',
        ])
        ->where('tb_regtiket.dihapus', 0)
        ->whereBetween('tb_regtiket.tanggal', [
            $tglAwal . ' 00:00:00',
            $tglAkhir . ' 23:59:59',
        ]);

        if ($request->filled('bidang') && $request->bidang !== 'all') {
            $query->whereHas('layanan', fn($q) => $q->where('kode_bidang', $request->bidang));
        }

        if ($request->filled('layanan') && $request->layanan !== 'all') {
            $query->where('tb_regtiket.kode_layanan', $request->layanan);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'selesai') {
                $query->where('tb_regtiket.archives', 1);
            } elseif ($request->status === 'proses') {
                $query->where('tb_regtiket.archives', 0)
                      ->whereDoesntHave('detail', fn($q) => $q->where('status', 2));
            } elseif ($request->status === 'btl') {
                $query->whereHas('detail', fn($q) => $q->where('status', 2));
            }
        }

        $data = $query->latest('tb_regtiket.tanggal')->get();

        $pdf = Pdf::loadView('pages.admin.laporan.pdf', compact('data'))
            ->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-eksekutif-' . $tglAwal . '-sd-' . $tglAkhir . '.pdf');
    }

    /**
     * Helper penyingkat nama bidang resmi BKPSDM
     */
    private function formatNamaBidangSingkat($namaLengkap)
    {
        return match(trim($namaLengkap)) {
            'Bidang Mutasi dan Penghargaan' => 'Bidang MP',
            'Bidang Pengadaan, Pemberhentian, dan Informasi' => 'Bidang PPI',
            'Bidang Pengembangan Kompetensi Aparatur' => 'Bidang PKA',
            'Bidang Penilaian Kinerja Aparatur dan Promosi' => 'Bidang PKAP',
            default => (function() use ($namaLengkap) {
                if (preg_match('/^Bidang\s+(.+)$/i', trim($namaLengkap), $m)) {
                    $words = preg_split('/[\s,\-]+/', $m[1], -1, PREG_SPLIT_NO_EMPTY);
                    $initials = '';
                    foreach ($words as $w) {
                        if (!in_array(strtolower($w), ['dan', 'di', 'ke', 'dari', '&'])) {
                            $initials .= strtoupper($w[0]);
                        }
                    }
                    return 'Bidang ' . $initials;
                }
                return $namaLengkap;
            })(),
        };
    }
}
