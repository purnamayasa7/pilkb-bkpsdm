<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
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

}
