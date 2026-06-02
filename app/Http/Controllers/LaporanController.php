<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Tahap;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $bidangList = Bidang::orderBy('nama_bidang')->get();

        $layananList = [];

        $data = collect();

        // LOAD LAYANAN
        if ($request->filled('bidang')) {

            $layananList = Layanan::where('kode_bidang', $request->bidang)
                ->orderBy('nama_layanan')
                ->get();
        }

        // FILTER DATA
        if ($request->has('filter')) {

            $query = Regtiket::with([
                'layanan.bidang',
                'tahapTerakhir.statusRel'
            ]);

            // FILTER BIDANG
            if ($request->filled('bidang')) {

                $query->whereHas('layanan', function ($q) use ($request) {

                    $q->where('kode_bidang', $request->bidang);
                });
            }

            // FILTER LAYANAN
            if (
                $request->filled('layanan') &&
                $request->layanan != 'all'
            ) {

                $query->where('kode_layanan', $request->layanan);
            }

            // FILTER RENTANG TANGGAL
            if (
                $request->filled('tanggal_awal') &&
                $request->filled('tanggal_akhir')
            ) {

                $query->whereBetween('tanggal', [
                    $request->tanggal_awal . ' 00:00:00',
                    $request->tanggal_akhir . ' 23:59:59'
                ]);
            } elseif ($request->filled('tanggal_awal')) {

                $query->whereDate('tanggal', '>=', $request->tanggal_awal);
            } elseif ($request->filled('tanggal_akhir')) {

                $query->whereDate('tanggal', '<=', $request->tanggal_akhir);
            }

            $data = $query
                ->latest('tanggal')
                ->get();
        }

        return view('pages.admin-bawah.laporan.index', compact(
            'bidangList',
            'layananList',
            'data'
        ));
    }

    public function getLayananByBidang(Request $request)
    {
        $layanan = Layanan::where('kode_bidang', $request->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        return response()->json($layanan);
    }

    public function exportPdf(Request $request)
    {
        $query = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ]);

        // FILTER BIDANG
        if ($request->filled('bidang')) {
            $query->whereHas('layanan', function ($q) use ($request) {
                $q->where('kode_bidang', $request->bidang);
            });
        }

        // FILTER LAYANAN
        if (
            $request->filled('layanan') &&
            $request->layanan != 'all'
        ) {
            $query->where('kode_layanan', $request->layanan);
        }

        // FILTER TANGGAL
        if (
            $request->filled('tanggal_awal') &&
            $request->filled('tanggal_akhir')
        ) {
            $query->whereBetween('tanggal', [
                $request->tanggal_awal . ' 00:00:00',
                $request->tanggal_akhir . ' 23:59:59'
            ]);
        } elseif ($request->filled('tanggal_awal')) {
            $query->whereDate('tanggal', '>=', $request->tanggal_awal);
        } elseif ($request->filled('tanggal_akhir')) {
            $query->whereDate('tanggal', '<=', $request->tanggal_akhir);
        }

        $data = $query
            ->latest('tanggal')
            ->get();

        $pdf = Pdf::loadView(
            'pages.admin-bawah.laporan.pdf',
            compact('data')
        );

        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-usulan.pdf');
    }

    // Laporan Admin Bidang
    public function indexBidang(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $tiket = collect();

        if ($start && $end) {

            $tiket = Tahap::with([
                'statusRel',
                'regtiket.layanan'
            ])
                ->whereBetween('tanggal', [$start, $end])
                ->whereHas('regtiket')
                ->orderBy('tanggal', 'desc')
                ->get();
        }

        return view('pages.bidang.laporan.index', compact(
            'tiket',
            'start',
            'end'
        ));
    }

    // Export Laporan PDF Admin Bidang
    public function exportPdfBidang(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $data = Tahap::with([
            'statusRel',
            'regtiket.layanan'
        ])
            ->whereBetween('tanggal', [$start, $end])
            ->whereHas('regtiket')
            ->orderBy('tanggal', 'desc')
            ->get();

        $pdf = Pdf::loadView('pages.bidang.laporan.pdf', [
            'data' => $data,
            'start' => $start,
            'end' => $end
        ])->setPaper('A4', 'landscape');

        return $pdf->stream('laporan-layanan.pdf');
    }
}
