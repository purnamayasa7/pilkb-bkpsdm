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

            // HANYA YANG ADA BTL
            ->whereHas('detail', function ($q) {
                $q->where('status', 2);
            });

        // FILTER LAYANAN
        if ($request->layanan) {
            $query->where('kode_layanan', $request->layanan);
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

        $pegawaiList = $this->pegawaiService->getPegawaiByNips(
            $data->pluck('nip')
        );

        return view('pages.bidang.perbaikan.index', [
            'data' => $data,
            'pegawaiList' => $pegawaiList,
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
