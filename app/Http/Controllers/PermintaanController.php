<?php

namespace App\Http\Controllers;

use App\Models\DetailTiket;
use App\Models\Regtiket;
use App\Models\Status;
use App\Models\Tahap;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PermintaanController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->month ?? Carbon::now()->month;
        $year = $request->year ?? Carbon::now()->year;

        $user = Auth::user();

        $tiket = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ])
            ->where('archives', 0)
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->has('tahap', '>', 1)
            ->has('detail')

            // semua detail status = 1
            // ->whereDoesntHave('detail', function ($q) {
            //     $q->where('status', '!=', 1);
            // })

            // FILTER BIDANG USER LOGIN
            ->whereHas('layanan', function ($q) use ($user) {
                $q->where('kode_bidang', $user->bidang_id);
            })

            ->orderByDesc('tanggal')

            ->get();

        return view('pages.bidang.permintaan.index', compact(
            'tiket',
            'month',
            'year'
        ));
    }

    public function editPermintaan($no_tiket)
    {
        $user = Auth::user();

        $tiket = Regtiket::with([
            'layanan.bidang'
        ])
            ->where('no_tiket', $no_tiket)

            ->whereHas('layanan', function ($q) use ($user) {
                $q->where('kode_bidang', $user->bidang_id);
            })

            ->firstOrFail();

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();

        $statusList = Status::where(
            'kode_layanan',
            $tiket->kode_layanan
        )->get();

        $dataPegawai = [
            'nama' => '-',
            'golongan' => '-',
            'unit' => 'BKPSDM Kabupaten Buleleng'
        ];

        return view('pages.bidang.permintaan.edit', compact(
            'tiket',
            'detail',
            'dataPegawai',
            'statusList'
        ));
    }

    public function updatePermintaan(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            $request->validate([
                'status_tahap' => 'required'
            ]);

            $detailList = DetailTiket::where(
                'no_tiket',
                $no_tiket
            )->get();

            foreach ($detailList as $detail) {
                $checked = isset($request->status[$detail->id]);

                if ($checked) {

                    $detail->update([
                        'status' => 1,
                        'comment' => null
                    ]);
                } else {
                    $detail->update([
                        'status' => 2,
                        'comment' => $request->comment[$detail->id] ?? null
                    ]);
                }
            }

            Tahap::create([
                'no_tiket' => $no_tiket,
                'tanggal' => now(),

                'status' => $request->status_tahap,

                'operator' => Auth::user()->username,
                'comment' => $request->catatan ?? '-'
            ]);

            Regtiket::where('no_tiket', $no_tiket)
            ->update([
                'data_baru' => 0,
                'diperbaiki_tgl' => now()
            ]);

            DB::commit();

            return redirect()
                ->route('adminBidang.permintaan.index')
                ->with('success', 'Review berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with(
                'error',
                $e->getMessage()
            );
        }
    }

    public function selesaiPermintaan($no_tiket)
    {
        try {
            $tiket = Regtiket::where(
                'no_tiket',
                $no_tiket
            )->firstOrFail();

            $tiket->update([
                'archives' => 1,
                'operator_archives' => Auth::user()->username
            ]);

            return redirect()
                ->route('adminBidang.permintaan.index')
                ->with('success','Pengajuan Layanan berhasil diselesaikan.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    // public function updatePermintaan(Request $request, $no_tiket)
    // {
    //     DB::beginTransaction();

    //     try {

    //         $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();

    //         $semuaValid = true;

    //         foreach ($detailList as $detail) {

    //             // CHECKBOX CHECKED
    //             $checked = isset($request->status[$detail->id]);

    //             if ($checked) {

    //                 $detail->update([
    //                     'status' => 1,
    //                     'comment' => null
    //                 ]);
    //             } else {

    //                 $semuaValid = false;

    //                 $detail->update([
    //                     'status' => 2,
    //                     'comment' => $request->comment[$detail->id] ?? null
    //                 ]);
    //             }
    //         }

    //         if ($semuaValid) {

    //             Tahap::create([
    //                 'no_tiket' => $no_tiket,
    //                 'tanggal' => now(),
    //                 'status' => 1,
    //                 'operator' => Auth::user()->username,
    //                 'comment' => 'Berkas Sudah Diterima BKPSDM'
    //             ]);

    //             DB::commit();

    //             return redirect()
    //                 ->route('adminBidang.permintaan.index')
    //                 ->with('success', 'Berkas berhasil diterima.');
    //         }

    //         DB::commit();

    //         return redirect()
    //             ->route('adminBidang.permintaan.index');
    //     } catch (\Exception $e) {

    //         DB::rollBack();

    //         return back()->with('error', $e->getMessage());
    //     }
    // }
}
