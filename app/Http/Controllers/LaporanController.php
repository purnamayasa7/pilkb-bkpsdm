<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Tahap;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $bidangList = Bidang::orderBy('nama_bidang')->get();

        $layananList = collect();

        $data = collect();

        /**
         * LOAD DROPDOWN LAYANAN
         */
        if ($request->filled('bidang')) {
            if ($request->bidang == 'all') {
                $layananList = Layanan::orderBy('nama_layanan')
                    ->get();
            } else {
                $layananList = Layanan::where(
                    'kode_bidang',
                    $request->bidang
                )
                    ->orderBy('nama_layanan')
                    ->get();
            }
        }

        /**
         * FILTER DATA
         */
        if ($request->has('filter')) {

            $query = Regtiket::with([
                'layanan.bidang',
                'tahapTerakhir.statusRel'
            ]);

            /**
             * FILTER BIDANG
             */
            if (
                $request->filled('bidang') &&
                $request->bidang != 'all'
            ) {
                $query->whereHas('layanan', function ($q) use ($request) {
                    $q->where(
                        'kode_bidang',
                        $request->bidang
                    );
                });
            }

            /**
             * FILTER LAYANAN
             */
            if (
                $request->filled('layanan') &&
                $request->layanan != 'all'
            ) {
                $query->where(
                    'kode_layanan',
                    $request->layanan
                );
            }

            /**
             * FILTER TANGGAL
             */
            if (
                $request->filled('tanggal_awal') &&
                $request->filled('tanggal_akhir')
            ) {
                $query->whereBetween('tanggal', [
                    $request->tanggal_awal . ' 00:00:00',
                    $request->tanggal_akhir . ' 23:59:59'
                ]);
            } elseif ($request->filled('tanggal_awal')) {
                $query->whereDate(
                    'tanggal',
                    '>=',
                    $request->tanggal_awal
                );
            } elseif ($request->filled('tanggal_akhir')) {
                $query->whereDate(
                    'tanggal',
                    '<=',
                    $request->tanggal_akhir
                );
            }

            $data = $query
                ->latest('tanggal')
                ->get();
        }

        $user = Auth::user();

        if ($user->role->name == 'root') {
            $view = 'pages.admin.laporan.index';
        } elseif ($user->role->name == 'admin_bawah') {
            $view = 'pages.admin-bawah.laporan.index';
        } else {
            abort(403);
        }

        return view($view, compact(
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
        if (
            $request->filled('bidang') &&
            $request->bidang != 'all'
        ) {

            $query->whereHas('layanan', function ($q) use ($request) {

                $q->where(
                    'kode_bidang',
                    $request->bidang
                );
            });
        }

        // FILTER LAYANAN
        if (
            $request->filled('layanan') &&
            $request->layanan != 'all'
        ) {

            $query->where(
                'kode_layanan',
                $request->layanan
            );
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

            $query->whereDate(
                'tanggal',
                '>=',
                $request->tanggal_awal
            );
        } elseif ($request->filled('tanggal_akhir')) {

            $query->whereDate(
                'tanggal',
                '<=',
                $request->tanggal_akhir
            );
        }

        $data = $query
            ->latest('tanggal')
            ->get();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role->name == 'root') {

            $view = 'pages.admin.laporan.pdf';
        } elseif ($user->role->name == 'admin_bawah') {

            $view = 'pages.admin-bawah.laporan.pdf';
        } else {

            abort(403);
        }

        $pdf = Pdf::loadView(
            $view,
            compact('data')
        );

        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-usulan.pdf');
    }

    // Export Laporan PDF Admin Bidang
    public function exportPdfBidang(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $data = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ])
            ->whereBetween('tanggal', [
                $start . ' 00:00:00',
                $end . ' 23:59:59'
            ])
            ->orderByDesc('tanggal')
            ->get();

        $pdf = Pdf::loadView('pages.bidang.laporan.pdf', [
            'data' => $data,
            'start' => $start,
            'end' => $end
        ])->setPaper('A4', 'landscape');

        return $pdf->stream('laporan-layanan.pdf');
    }
}
