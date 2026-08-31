<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Syarat;
use Illuminate\Http\Request;

class GuestBotController extends Controller
{
    /**
     * Cek status tiket dari nomor tiket
     */
    public function cekStatusTiket(Request $request)
    {
        $request->validate([
            'no_tiket' => 'required|string|max:100',
        ]);

        $noTiket = trim($request->no_tiket);

        $tiket = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel',
            'tahap.statusRel',
        ])
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
     * Ambil semua layanan yang aktif
     */
    public function getSemuaLayanan()
    {
        $layanan = Layanan::with('bidang')
            ->where(function($q) {
                $q->where('aktif', 1)->orWhereNull('aktif');
            })
            ->orderBy('nama_layanan')
            ->get(['id', 'nama_layanan', 'kode_bidang']);

        return response()->json($layanan->map(function ($l) {
            return [
                'id'           => $l->id,
                'nama_layanan' => $l->nama_layanan,
                'bidang_id'    => $l->kode_bidang,
                'nama_bidang'  => $l->bidang?->nama_bidang ?? '-',
            ];
        }));
    }

    /**
     * Ambil daftar bidang dan layanan yang aktif
     */
    public function getBidangLayanan()
    {
        $bidangList = Bidang::with(['layanan' => function ($q) {
            $q->where('aktif', 1)->orWhereNull('aktif')->orderBy('nama_layanan');
        }])
            ->orderBy('nama_bidang')
            ->get();

        return response()->json($bidangList->map(function ($b) {
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
        }));
    }

    /**
     * Ambil daftar syarat untuk layanan tertentu
     */
    public function getSyaratLayanan($layananId)
    {
        $layanan = Layanan::with(['bidang', 'syarat'])
            ->where('id', $layananId)
            ->first();

        if (!$layanan) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Layanan tidak ditemukan.',
            ], 404);
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

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'                 => $layanan->id,
                'nama_layanan'       => $layanan->nama_layanan,
                'nama_bidang'        => $layanan->bidang?->nama_bidang ?? '-',
                'kode_bidang'        => $layanan->kode_bidang,
                'waktu_penyelesaian' => $layanan->waktu_penyelesaian ?: 'Sesuai SOP Layanan',
                'deskripsi'          => $layanan->deskripsi ?: '',
                'syarat'             => $syaratList,
                'pdf_url'            => $pdfUrl,
            ]
        ]);
    }
}
