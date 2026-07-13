<?php

namespace App\Http\Controllers;

use App\Models\Regtiket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\PegawaiService;

class SearchController extends Controller
{
    public function ticket(Request $request)
    {
        $keyword = trim($request->q);

        if (strlen($keyword) < 3) {
            return response()->json([]);
        }

        $tiket = Regtiket::query()
            ->visibleBy(Auth::user())
            ->select([
                'no_tiket',
                'nip',
                'kode_layanan',
                'tanggal',
                'kode_ukerja'
            ])
            ->with([
                'layanan:id,kode_bidang,nama_layanan',
                'tahapTerakhir.statusRel:id,status'
            ])
            ->where(function ($query) use ($keyword) {

                $query->where('no_tiket', 'like', "%{$keyword}%")
                    ->orWhere('nip', 'like', "%{$keyword}%");
            })
            ->latest('tanggal')
            ->limit(5)
            ->get();

        return response()->json(
            $tiket->map(function ($item) {
                return [
                    'no_tiket' => $item->no_tiket,
                    'layanan' => $item->layanan?->nama_layanan,
                    'status' => $item->tahapTerakhir?->statusRel?->status,
                ];
            })
        );
    }

    public function detail($no_tiket)
    {
        $ticket = Regtiket::query()
            ->visibleBy(Auth::user())
            ->with([
                'layanan.bidang',
                'tahapTerakhir.statusRel',
            ])
            ->findOrFail($no_tiket);

        $user = Auth::user();

        $totalTahap = $ticket->tahap()->count();

        $canReview = false;

        if ($user->role_id == 2 && $totalTahap == 1) {

            $canReview = true;
        } elseif (
            $user->role_id == 4 &&
            $totalTahap > 1 &&
            optional($ticket->layanan)->kode_bidang == $user->bidang_id
        ) {

            $canReview = true;
        }

        $pegawai = app(PegawaiService::class)
            ->getPegawaiByNip($ticket->nip);

        return response()->json([

            'no_tiket' => $ticket->no_tiket,
            'nip' => $ticket->nip,
            'nama' => $pegawai['nama_lengkap']
                ?? $pegawai['nama']
                ?? '-',
            'tanggal' => Carbon::parse($ticket->tanggal)
                ->translatedFormat('d F Y'),
            'layanan' => $ticket->layanan?->nama_layanan,
            'bidang' => $ticket->layanan?->bidang?->nama_bidang,
            'status' => $ticket->tahapTerakhir?->statusRel?->status,
            'can_review' => $canReview,
            'review_url' => $this->getReviewUrl($ticket),
            'print_url' => route('tiket.cetak', $ticket->no_tiket),
            'total_tahap' => $totalTahap,
        ]);
    }

    private function getReviewUrl(Regtiket $ticket)
    {
        $user = Auth::user();

        $totalTahap = $ticket->tahap()->count();

        // Admin Bawah
        if ($user->role_id == 2 && $totalTahap == 1) {
            return route(
                'adminBawah.permintaan.reviewPermintaan',
                $ticket->no_tiket
            );
        }

        // Bidang
        if (
            $user->role_id == 4 &&
            $totalTahap > 1 &&
            optional($ticket->layanan)->kode_bidang == $user->bidang_id
        ) {
            return route(
                'adminBidang.permintaan.editPermintaan',
                $ticket->no_tiket
            );
        }

        return null;
    }
}
