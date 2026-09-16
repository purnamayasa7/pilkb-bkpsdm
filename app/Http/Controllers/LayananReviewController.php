<?php

namespace App\Http\Controllers;

use App\Models\LayananReview;
use App\Models\Regtiket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LayananReviewController extends Controller
{
    /**
     * Simpan review kepuasan SKM dari Admin OPD.
     * Hanya bisa disubmit jika tiket sudah selesai (archives = 1)
     * dan belum pernah diulas.
     */
    public function store(Request $request, string $no_tiket)
    {
        $request->validate([
            'rating'          => 'required|integer|min:1|max:5',
            'aspek_penilaian' => 'nullable|array',
            'komentar'        => 'nullable|string|max:1000',
        ]);

        $user  = Auth::user();
        $tiket = Regtiket::where('no_tiket', $no_tiket)
            ->where('kode_ukerja', $user->kode_ukerja)
            ->where('archives', 1)
            ->firstOrFail();

        // Cegah duplikasi review untuk tiket yang sama
        if ($tiket->review()->exists()) {
            return back()->with('error', 'Ulasan untuk tiket ini sudah pernah dikirimkan.');
        }

        LayananReview::create([
            'no_tiket'        => $no_tiket,
            'kode_layanan'    => $tiket->kode_layanan,
            'user_id'         => $user->id,
            'rating'          => $request->rating,
            'aspek_penilaian' => $request->aspek_penilaian,
            'komentar'        => $request->komentar,
        ]);

        return back()->with('success', 'Terima kasih! Ulasan kepuasan Anda berhasil dikirim.');
    }
}
