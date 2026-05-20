<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Pengambilan;
use App\Models\Regtiket;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PengambilanController extends Controller
{
    public function indexArchives(Request $request)
    {
        $bidangList = Bidang::orderBy('nama_bidang')->get();

        $data = collect();

        if ($request->has('filter')) {

            $query = Regtiket::with([
                'layanan.bidang',
                'operatorArchives',
                'tahapTerakhir.statusRel'
            ])
                ->where('archives', 1);

            // FILTER BIDANG
            if ($request->filled('bidang')) {

                $query->whereHas('layanan', function ($q) use ($request) {
                    $q->where('kode_bidang', $request->bidang);
                });
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
        }

        return view('pages.admin-bawah.archives.index', compact(
            'data',
            'bidangList'
        ));
    }

    public function indexPengambilan(Request $request)
    {
        $year = $request->year ?? Carbon::now()->year;

        $pengambilan = Pengambilan::with([
            'tiket.layanan'
        ])
            ->whereYear('tanggal_pengambilan', $year)
            ->orderBy('tanggal_pengambilan', 'desc')
            ->get();

        return view('pages.admin-bawah.pengambilan.index', compact(
            'pengambilan',
            'year'
        ));
    }

    // CEK TIKET DI TAMBAH PENGAMBILAN MODAL
    public function cekTiket($no_tiket)
    {
        $tiket = Regtiket::where('no_tiket', $no_tiket)->first();

        if (!$tiket) {
            return response()->json([
                'success' => false
            ]);
        }

        return response()->json([
            'success' => true,
            'no_tiket' => $tiket->no_tiket,
            'nip' => $tiket->nip
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'no_tiket' => 'required',
            'nama_pengambil' => 'required',
            'no_hp' => 'nullable'
        ]);

        $tiket = Regtiket::where('no_tiket', $request->no_tiket)->first();

        if (!$tiket) {
            return back()->with('error', 'No tiket tidak ditemukan');
        }

        // CEGAH DOUBLE
        $cekPengambilan = Pengambilan::where('no_tiket', $request->no_tiket)->first();

        if ($cekPengambilan) {
            return back()->with('error', 'Tiket sudah diambil');
        }

        Pengambilan::create([
            'no_tiket' => $request->no_tiket,
            'tanggal_pengambilan' => Carbon::now(),
            'nama_pengambil' => $request->nama_pengambil,
            'no_hp' => $request->no_hp,
        ]);

        $tiket->diambil = 1;
        $tiket->save();

        return back()->with('success', 'Data pengambilan berhasil ditambahkan');
    }

    // EXPORT PDF
    public function exportPdf(Request $request)
    {
        $year = $request->year ?? Carbon::now()->year;

        $pengambilan = Pengambilan::with([
            'tiket.layanan'
        ])
            ->whereYear('tanggal_pengambilan', $year)
            ->orderBy('tanggal_pengambilan', 'desc')
            ->get();

        $pdf = Pdf::loadView('pages.admin-bawah.pengambilan.pdf', [
            'pengambilan' => $pengambilan,
            'year' => $year
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-pengambilan.pdf');
    }

    // EXPORT ARCHIVES
    public function exportArchivesPdf(Request $request)
    {
        $query = Regtiket::with([
            'layanan.bidang',
            'operatorArchives',
            'tahapTerakhir.statusRel'
        ])
            ->where('archives', 1);

        // FILTER BIDANG
        if ($request->filled('bidang')) {

            $query->whereHas('layanan', function ($q) use ($request) {

                $q->where('kode_bidang', $request->bidang);
            });
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

        $tanggal_awal = $request->tanggal_awal;
        $tanggal_akhir = $request->tanggal_akhir;

        $pdf = Pdf::loadView(
            'pages.admin-bawah.archives.pdf',
            compact('data', 'tanggal_awal', 'tanggal_akhir')
        );

        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('archives-usulan.pdf');
    }
}
