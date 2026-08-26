<?php

namespace App\Http\Controllers;

use App\Models\DetailTiket;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Services\PegawaiService;
use Illuminate\Http\Request;

class PerbaikanController extends Controller
{
    public function __construct(
        protected PegawaiService $pegawaiService
    ) {}

    public function getData($request)
    {
        $query = Regtiket::with([
            'layanan',
            'tahap',
            'detail',
            'tahapTerakhir.statusRel'
        ])

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
        $data = $this->getData($request);

        return view('pages.bidang.perbaikan.index', [
            'data' => $data,
            'layananList' => Layanan::where('aktif', 1)->get()
        ]);
    }

    public function detail($no_tiket)
    {
        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->where('status', 2)
            ->get();

        return response()->json($detail);
    }
}
