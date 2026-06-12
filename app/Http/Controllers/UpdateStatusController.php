<?php

namespace App\Http\Controllers;

use App\Models\DetailTiket;
use App\Models\Regtiket;
use App\Models\Status;
use App\Models\Tahap;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UpdateStatusController extends Controller
{
    public function index(Request $request)
    {
        $keyword = $request->keyword;

        $user = Auth::user();

        $data = collect();

        if ($keyword) {

            $data = Regtiket::with([
                'layanan.bidang',
                'tahapTerakhir.statusRel'
            ])
                // FILTER NO TIKET / NIP
                ->where(function ($q) use ($keyword) {
                    $q->where('no_tiket', 'like', "%{$keyword}%")
                        ->orWhere('nip', 'like', "%{$keyword}%");
                })

                // FILTER SESUAI BIDANG
                ->whereHas('layanan', function ($q) use ($user) {
                    $q->where('kode_bidang', $user->bidang_id);
                })
                ->where('archives', 0)
                ->orderByDesc('tanggal')
                ->get();
        }

        return view('pages.bidang.update-status.index', compact(
            'data'
        ));
    }

    public function edit($no_tiket)
    {
        $user = Auth::user();

        $tiket = Regtiket::with([
            'layanan.bidang'
        ])
            ->where('no_tiket', $no_tiket)

            ->whereHas('layanan', function ($query) use ($user) {
                $query->where('kode_bidang', $user->bidang_id);
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

        return view('pages.bidang.update-status.edit', compact(
            'tiket',
            'detail',
            'dataPegawai',
            'statusList'
        ));
    }

    public function update(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();

            $semuaValid = true;

            foreach ($detailList as $detail) {

                $checked = isset($request->status[$detail->id]);

                if ($checked) {

                    $detail->update([
                        'status' => 1,
                        'comment' => null
                    ]);
                } else {
                    $semuaValid = false;

                    $detail->update([
                        'status' => 2,
                        'comment' => $request->comment[$detail->id] ?? null
                    ]);
                }
            }

            if ($semuaValid) {

                $tahap = Tahap::create([
                    'no_tiket' => $no_tiket,
                    'tanggal' => now(),
                    'status' => $request->status_tahap,
                    'operator' => Auth::user()->username,
                    'comment' => $request->catatan ?? '-'
                ]);

                DB::commit();

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Menambah Tahap Tiket ID: ' . $tahap->no_tiket,
                    [],
                    $tahap->toArray()
                );

                return redirect()
                    ->route('adminBidang.status.index')
                    ->with('success', 'Status usulan berhasil dirubah.');
            }

            DB::commit();

            return redirect()
                ->route('adminBidang.status.index');
        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }
}
