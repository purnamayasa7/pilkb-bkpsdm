<?php

namespace App\Http\Controllers;

use App\Exports\ListPerbaikanUsulanExport;
use App\Models\DetailTiket;
use App\Models\Layanan;
use App\Models\Regtiket;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class PerbaikanController extends Controller
{

    public function getData($request)
    {
        $user = Auth::user();
        $query = Regtiket::with([
            'layanan',
            'tahap',
            'detail',
            'tahapTerakhir.statusRel'
        ])
            ->whereHas('layanan', function ($q) use ($user) {
                if ($user && $user->bidang_id) {
                    $q->where('kode_bidang', $user->bidang_id);
                }
            })
            ->where(function ($query) {
                $query->whereHas('detail', function ($q) {
                    $q->where('status', 2);
                })
                    ->orWhere(function ($q) {
                        $q->where('diperbaiki', 1)
                            ->whereHas('detail', function ($q) {
                                $q->whereNull('status');
                            });
                    });
            });

        if ($request->filled('layanan') && $request->layanan !== 'all') {
            $query->where(
                'kode_layanan',
                $request->layanan
            );
        }

        if ($request->filled('btl')) {
            $query->whereHas('detail', function ($q) {
                $q->where('status', 2);
            });
        }

        return $query
            ->withCount([
                'detail as jumlah_btl' => function ($q) {
                    $q->where('status', 2);
                },
                'tahap as jumlah_tahap'
            ])
            ->withExists([
                'detail as is_belum' => function ($q) {
                    $q->where('status', 2);
                }
            ])
            ->orderByDesc('tanggal')
            ->get();
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $data = $this->getData($request);
        $layananList = Layanan::where('aktif', 1);
        if ($user && $user->bidang_id) {
            $layananList->where('kode_bidang', $user->bidang_id);
        }

        return inertia('Bidang/Perbaikan/Index', [
            'data' => $data,
            'layananList' => $layananList->get(),
            'namaBidang' => $user->nama_bidang ?? 'Bidang',
        ]);
    }

    public function getPerbaikanData(Request $request)
    {
        $data = $this->getData($request);
        return response()->json($data);
    }

    public function detail($no_tiket)
    {
        $user = Auth::user();
        if ($user && $user->bidang_id) {
            $isMilikBidang = Regtiket::where('no_tiket', $no_tiket)
                ->whereHas('layanan', function ($q) use ($user) {
                    $q->where('kode_bidang', $user->bidang_id);
                })
                ->exists();

            if (!$isMilikBidang) {
                abort(403);
            }
        }

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->where('status', 2)
            ->get();

        return response()->json($detail);
    }

    public function exportPdf(Request $request)
    {
        $data = $this->getData($request);

        $pdf = Pdf::loadView(
            'pages.bidang.perbaikan.export-pdf',
            compact('data')
        );

        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('perbaikan_usulan.pdf');
    }

    public function exportExcel(Request $request)
    {
        $data = $this->getData($request);

        return Excel::download(
            new ListPerbaikanUsulanExport($data, [], 'pages.bidang.perbaikan.export-excel'),
            'perbaikan_usulan.xlsx'
        );
    }
}
