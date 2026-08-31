<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Syarat;
use App\Services\KepegawaianAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GuestBotController extends Controller
{
    /**
     * Cek status tiket dari nomor tiket (Optimized Single Query & Column Selection)
     */
    public function cekStatusTiket(Request $request)
    {
        $request->validate([
            'no_tiket' => 'required|string|max:100',
        ]);

        $noTiket = trim($request->no_tiket);

        $tiket = Regtiket::with(['layanan.bidang', 'tahapTerakhir.statusRel'])
            ->where('no_tiket', $noTiket)
            ->orWhere('no_tiket', 'LIKE', '%' . $noTiket . '%')
            ->first();

        if (!$tiket) {
            return response()->json([
                'status'  => 'not_found',
                'message' => "Nomor tiket \"{$noTiket}\" tidak ditemukan di sistem. Pastikan nomor tiket yang Anda masukkan sudah benar.",
            ]);
        }

        $tahapTerakhir = $tiket->tahapTerakhir;
        $statusNama = $tahapTerakhir?->statusRel?->status ?? 'Sedang Diproses';
        $tanggalUpdate = $tahapTerakhir?->tanggal 
            ? date('d M Y, H:i', strtotime($tahapTerakhir->tanggal)) 
            : ($tiket->tanggal ? date('d M Y', strtotime($tiket->tanggal)) : '-');
        $catatan = $tahapTerakhir?->comment ?? '-';

        return response()->json([
            'status' => 'found',
            'data'   => [
                'no_tiket'       => $tiket->no_tiket,
                'nama'           => $tiket->nama,
                'nip'            => $tiket->nip ?: '-',
                'unit_kerja'     => $tiket->nama_ukerja ?: '-',
                'layanan'        => $tiket->layanan?->nama_layanan ?? '-',
                'bidang'         => $tiket->layanan?->bidang?->nama_bidang ?? '-',
                'status_nama'    => $statusNama,
                'tanggal_update' => $tanggalUpdate,
                'catatan'        => $catatan,
                'url_detail'     => url('/cek-tiket/' . urlencode($tiket->no_tiket)),
            ]
        ]);
    }

    /**
     * Ambil semua layanan yang aktif (Cached in-memory 10 mins)
     */
    public function getSemuaLayanan()
    {
        $data = Cache::remember('guest_bot_semua_layanan', 600, function () {
            $layanan = Layanan::with(['bidang' => function ($q) {
                $q->select('id', 'nama_bidang');
            }])
                ->where(function ($q) {
                    $q->where('aktif', 1)->orWhereNull('aktif');
                })
                ->orderBy('nama_layanan')
                ->get(['id', 'nama_layanan', 'kode_bidang']);

            return $layanan->map(function ($l) {
                return [
                    'id'           => $l->id,
                    'nama_layanan' => $l->nama_layanan,
                    'bidang_id'    => $l->kode_bidang,
                    'nama_bidang'  => $l->bidang?->nama_bidang ?? '-',
                ];
            })->values()->all();
        });

        return response()->json($data);
    }

    /**
     * Ambil daftar bidang dan layanan yang aktif (Cached in-memory 10 mins)
     */
    public function getBidangLayanan()
    {
        $data = Cache::remember('guest_bot_bidang_layanan', 600, function () {
            $bidangList = Bidang::with(['layanan' => function ($q) {
                $q->select('id', 'nama_layanan', 'kode_bidang')
                    ->where(function ($sub) {
                        $sub->where('aktif', 1)->orWhereNull('aktif');
                    })
                    ->orderBy('nama_layanan');
            }])
                ->orderBy('nama_bidang')
                ->get(['id', 'nama_bidang']);

            return $bidangList->map(function ($b) {
                return [
                    'id'          => $b->id,
                    'nama_bidang' => $b->nama_bidang,
                    'layanan'     => $b->layanan->map(function ($l) {
                        return [
                            'id'           => $l->id,
                            'nama_layanan' => $l->nama_layanan,
                        ];
                    }),
                ];
            })->values()->all();
        });

        return response()->json($data);
    }

    /**
     * Ambil daftar syarat untuk layanan tertentu (Cached in-memory 10 mins)
     */
    public function getSyaratLayanan($layananId)
    {
        $cacheKey = "guest_bot_syarat_{$layananId}";

        $data = Cache::remember($cacheKey, 600, function () use ($layananId) {
            $layanan = Layanan::select('id', 'nama_layanan', 'kode_bidang', 'waktu_penyelesaian', 'deskripsi')
                ->with([
                    'bidang' => function ($q) {
                        $q->select('id', 'nama_bidang');
                    },
                    'syarat' => function ($q) {
                        $q->select('id', 'kode_layanan', 'syarat', 'metode', 'deskripsi');
                    }
                ])
                ->where('id', $layananId)
                ->first();

            if (!$layanan) {
                return null;
            }

            $syaratList = $layanan->syarat->map(function ($s) {
                return [
                    'id'        => $s->id,
                    'syarat'    => $s->syarat,
                    'metode'    => $s->metode,
                    'deskripsi' => $s->deskripsi,
                ];
            });

            $pdfUrl = route('exportPdf', [
                'bidang'  => $layanan->kode_bidang,
                'layanan' => $layanan->id,
            ]);

            return [
                'id'                 => $layanan->id,
                'nama_layanan'       => $layanan->nama_layanan,
                'nama_bidang'        => $layanan->bidang?->nama_bidang ?? '-',
                'kode_bidang'        => $layanan->kode_bidang,
                'waktu_penyelesaian' => $layanan->waktu_penyelesaian ?: 'Sesuai SOP Layanan',
                'deskripsi'          => $layanan->deskripsi ?: '',
                'syarat'             => $syaratList,
                'pdf_url'            => $pdfUrl,
            ];
        });

        if (!$data) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Layanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    /**
     * Tanya AI Kepegawaian
     */
    public function tanyaAi(Request $request, KepegawaianAiService $aiService)
    {
        $request->validate([
            'pertanyaan' => 'required|string|max:1000',
            'history'    => 'nullable|array',
        ]);

        $pertanyaan = $request->input('pertanyaan');
        $history = $request->input('history', []);

        $result = $aiService->ask($pertanyaan, $history);

        return response()->json($result);
    }
}
