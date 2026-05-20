<?php

namespace App\Http\Controllers;

use App\Exports\ListPerbaikanUsulanExport;
use App\Models\DetailTiket;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Tahap;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class DetailTiketController extends Controller
{
    private function getData($request, $isAdminBawah = false)
    {
        $query = Regtiket::with([
            'layanan',
            'tahap'
        ])->whereHas('detail', function ($q) {
            $q->where('status', 2);
        });

        // ADMIN OPD
        if (!$isAdminBawah) {
            $query->where('kode_ukerja', Auth::user()->kode_ukerja);
        }

        // ADMIN BAWAH, TIKET LEBIH DARI 1
        if ($isAdminBawah) {
            $query->has('tahap', '>', 1);
        }

        if ($request->layanan) {
            $query->where('kode_layanan', $request->layanan);
        }

        if ($request->btl) {
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

    // Index Admin OPD
    public function index(Request $request)
    {
        $data = $this->getData($request);

        return view('pages.opd.perbaikan.index', [
            'data' => $data,
            'layananList' => \App\Models\Layanan::where('aktif', 1)->get()
        ]);
    }

    // Index Admin Bawah
    public function indexAdminBawah(Request $request)
    {
        $data = $this->getData($request, true);

        return view('pages.admin-bawah.perbaikan.index', [
            'data' => $data,
            'layananList' => \App\Models\Layanan::where('aktif', 1)->get()
        ]);
    }

    // Index Daftar Penerimaan Layanan
    public function indexPermintaan(Request $request)
    {
        $query = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            // HANYA TAHAP 1
            ->has('tahap', '=', 1);

        if ($request->layanan) {
            $query->where('kode_layanan', $request->layanan);
        }

        $tiket = $query
            ->orderByDesc('tanggal')
            ->get();

        return view('pages.admin-bawah.registrasi.index', [
            'tiket' => $tiket,
            'layananList' => Layanan::where('aktif', 1)->get()
        ]);
    }

    // Tampil Review
    public function review($no_tiket)
    {
        $tiket = Regtiket::with(['layanan.bidang'])
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();

        $dataPegawai = [
            'nama' => '-',
            'golongan' => '-',
            'unit' => 'BKPSDM Kabupaten Buleleng'
        ];

        return view('pages.admin-bawah.perbaikan.edit', [
            'tiket' => $tiket,
            'detail' => $detail,
            'dataPegawai' => $dataPegawai
        ]);
    }

    // Tampil Review Permintaan Admin Bawah
    public function reviewPermintaan($no_tiket)
    {
        $tiket = Regtiket::with(['layanan.bidang'])
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();

        $dataPegawai = [
            'nama' => '-',
            'golongan' => '-',
            'unit' => 'BKPSDM Kabupaten Buleleng'
        ];

        return view('pages.admin-bawah.registrasi.edit', [
            'tiket' => $tiket,
            'detail' => $detail,
            'dataPegawai' => $dataPegawai
        ]);
    }

    // Simpan review
    public function submitReview(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();

            $semuaValid = true;

            foreach ($detailList as $detail) {

                // if checkbox checked
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

                Tahap::create([
                    'no_tiket' => $no_tiket,
                    'tanggal' => now(),
                    'status' => 20000,
                    'operator' => Auth::user()->username,
                    'comment' => 'Berkas Sudah Diterima BKPSDM'
                ]);
            }

            DB::commit();

            return redirect()
                ->route('adminBawah.perbaikan.indexAdminBawah')
                ->with('success', 'Review berhasil disimpan.');
        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }

    // Simpan review permintaan
    public function submitPermintaan(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();

            $semuaValid = true;

            foreach ($detailList as $detail) {

                // CHECKBOX CHECKED
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

                Tahap::create([
                    'no_tiket' => $no_tiket,
                    'tanggal' => now(),
                    'status' => 1,
                    'operator' => Auth::user()->username,
                    'comment' => 'Berkas Sudah Diterima BKPSDM'
                ]);

                DB::commit();

                return redirect()
                    ->route('adminBawah.permintaan.indexPermintaan')
                    ->with('success', 'Berkas berhasil diterima.');
            }

            DB::commit();

            return redirect()
                ->route('adminBawah.permintaan.indexPermintaan');
        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }

    public function detailPerbaikan($no_tiket)
    {
        $data = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->where('status', 2)
            ->get();

        return response()->json($data);
    }

    public function exportExcel(Request $request)
    {
        $data = $this->getData($request);

        return Excel::download(new ListPerbaikanUsulanExport($data), 'perbaikan_usulan.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $data = $this->getData($request);

        $pdf = Pdf::loadView('pages.opd.perbaikan.export.export-pdf', [
            'data' => $data
        ]);

        return $pdf->steam('perbaikan_usulan.pdf');
    }

    // EXPORT PDF LIST PERMINTAAN LAYANAN SKPD
    public function exportPermintaanPdf(Request $request)
    {
        $query = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            // HANYA TAHAP 1
            ->has('tahap', '=', 1);

        // FILTER LAYANAN
        if ($request->layanan) {
            $query->where('kode_layanan', $request->layanan);
        }

        $tiket = $query
            ->orderByDesc('tanggal')
            ->get();

        $pdf = Pdf::loadView(
            'pages.admin-bawah.registrasi.pdf',
            compact('tiket')
        );

        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-permintaan.pdf');
    }
}
