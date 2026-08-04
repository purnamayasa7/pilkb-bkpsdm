<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Syarat;
use App\Services\ActivityLogService;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SyaratController extends Controller
{
    public function index(Request $request)
    {

        $bidang = Bidang::all();

        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        $layananId = $request->filled('layanan') ? $request->layanan : null;

        $syarat = Syarat::with('layanan')
            ->when($layananId, function ($query) use ($layananId) {
                $query->where('kode_layanan', $layananId);
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->get();

        return view('pages.admin.syarat.index', compact(
            'syarat',
            'bidang',
            'bidangId',
            'layanan',
            'layananId'
        ));
    }

    // Menu Admin Bidang
    public function indexBidang(Request $request)
    {
        $user = Auth::user();

        $layanan = Layanan::where('kode_bidang', $user->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        $layananId = $request->layanan;

        $syarat = collect();

        if ($layananId) {

            $validLayanan = $layanan->contains('id', $layananId);

            if ($validLayanan) {
                $syarat = Syarat::with('layanan')
                    ->where('kode_layanan', $layananId)
                    ->get();
            }
        }

        return view('pages.bidang.syarat.index', compact(
            'layanan',
            'layananId',
            'syarat'
        ));
    }

    public function create(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        return view('pages.admin.syarat.create', compact(
            'bidang',
            'bidangId',
            'layanan'
        ));
    }

    // Menu Admin Bidang
    public function createBidang(Request $request)
    {
        $user = Auth::user();

        $bidang = $user->bidang;

        $layanan = Layanan::where('kode_bidang', $user->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        return view('pages.bidang.syarat.create', compact(
            'bidang',
            'layanan'
        ));
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_layanan' => 'required|exists:tb_layanan,id',
            'syarat' => 'required',
        ]);

        $kode_layanan = $request->kode_layanan;

        $syarat = Syarat::create([
            'kode_layanan' => $kode_layanan,
            'syarat' => $request->syarat,
            'metode' => $request->metode,
            'kode_efile' => $request->kode_efile,
            'deskripsi' => $request->deskripsi,
        ]);

        ActivityLogService::log(
            'Master Data Syarat',
            'CREATE',
            'Menambah Syarat Baru',
            [],
            $syarat->toArray()
        );

        return redirect()->route('root.syarat')
            ->with('success', 'Syarat berhasil ditambahkan');
    }

    // Menu Admin Bidang
    public function storeBidang(Request $request)
    {
        $request->validate([
            'kode_layanan' => 'required|exists:tb_layanan,id',
            'syarat' => 'required',
        ]);

        $kode_layanan = $request->kode_layanan;

        $syarat = Syarat::create([
            'kode_layanan' => $kode_layanan,
            'syarat' => $request->syarat,
            'metode' => $request->metode,
            'kode_efile' => $request->kode_efile,
            'deskripsi' => $request->deskripsi,
        ]);

        ActivityLogService::log(
            'Master Data Syarat',
            'CREATE',
            'Menambah Syarat Baru',
            [],
            $syarat->toArray()
        );

        return redirect()->route('root.syarat')
            ->with('success', 'Syarat berhasil ditambahkan');
    }

    public function update(Request $request, $syaratId)
    {
        $syarat = Syarat::findOrFail($syaratId);

        $request->validate([
            'syarat' => 'required',
            'metode' => 'required|in:simpeg,upload',
        ]);

        $olddata = [
            'kode_layanan' => $syarat->kode_layanan,
            'syarat' => $syarat->syarat,
            'metode' => $syarat->metode,
            'kode_efile' => $syarat->kode_efile,
            'deskripsi' => $syarat->deskripsi,
        ];

        $syarat->syarat = $request->syarat;
        $syarat->metode = $request->metode;

        $syarat->save();

        $newdata = [
            'kode_layanan' => $syarat->fresh()->kode_layanan,
            'syarat' => $syarat->fresh()->syarat,
            'metode' => $syarat->fresh()->metode,
            'kode_efile' => $syarat->fresh()->kode_efile,
            'deskripsi' => $syarat->fresh()->deskripsi,
        ];

        ActivityLogService::log(
            'Master Data Syarat',
            'UPDATE',
            'Mengubah Data Syarat',
            $olddata,
            $newdata
        );

        return redirect()->route('root.syarat')
            ->with('success', 'Syarat berhasil diupdate');
    }

    // Menu Admin Bidang
    public function updateBidang(Request $request, $syaratId)
    {
        $syarat = Syarat::whereHas('layanan', function ($q) {
            $q->where('kode_bidang', Auth::user()->bidang_id);
        })
            ->findOrFail($syaratId);

        $request->validate([
            'syarat' => 'required|string|max:255',
            'metode' => 'required|in:simpeg,upload',
        ]);

        $olddata = [
            'kode_layanan' => $syarat->kode_layanan,
            'syarat' => $syarat->syarat,
            'metode' => $syarat->metode,
            'kode_efile' => $syarat->kode_efile,
            'deskripsi' => $syarat->deskripsi,
        ];

        $syarat->update([
            'syarat' => $request->syarat,
            'metode' => $request->metode,
        ]);

        $newdata = [
            'kode_layanan' => $syarat->fresh()->kode_layanan,
            'syarat' => $syarat->fresh()->syarat,
            'metode' => $syarat->fresh()->metode,
            'kode_efile' => $syarat->fresh()->kode_efile,
            'deskripsi' => $syarat->fresh()->deskripsi,
        ];

        ActivityLogService::log(
            'Master Data Syarat',
            'UPDATE',
            'Mengubah Data Syarat',
            $olddata,
            $newdata
        );

        return redirect()
            ->route('adminBidang.syarat.indexBidang')
            ->with('success', 'Syarat berhasil diupdate.');
    }

    public function edit($id)
    {
        $syarat = Syarat::with('layanan.bidang')->findOrFail($id);

        return view('pages.admin.syarat.edit', compact('syarat'));
    }

    // Menu Admin Bidang
    public function editBidang($id)
    {
        $syarat = Syarat::whereHas('layanan', function ($q) {
            $q->where('kode_bidang', Auth::user()->bidang_id);
        })
            ->with('layanan.bidang')
            ->findOrFail($id);

        return view('pages.bidang.syarat.edit', compact('syarat'));
    }

    public function destroy($id)
    {
        $syarat = Syarat::findOrFail($id);

        $olddata = [
            'kode_layanan' => $syarat->kode_layanan,
            'syarat' => $syarat->syarat,
            'metode' => $syarat->metode,
            'kode_efile' => $syarat->kode_efile,
            'deskripsi' => $syarat->deskripsi,
        ];

        $syarat->delete();

        ActivityLogService::log(
            'Master Data Syarat',
            'DELETE',
            'Menghapus Data Syarat',
            $olddata,
            []
        );

        return redirect()->route('root.syarat')
            ->with('success', 'Syarat berhasil dihapus');
    }

    // Menu Admin Bidang
    public function destroyBidang($id)
    {
        $syarat = Syarat::whereHas('layanan', function ($query) {
            $query->where('kode_bidang', Auth::user()->bidang_id);
        })
            ->with('layanan')
            ->findOrFail($id);

        $olddata = [
            'kode_layanan' => $syarat->kode_layanan,
            'syarat'        => $syarat->syarat,
            'metode'        => $syarat->metode,
            'kode_efile'    => $syarat->kode_efile,
            'deskripsi'     => $syarat->deskripsi,
        ];

        $syarat->delete();

        ActivityLogService::log(
            'Master Data Syarat',
            'DELETE',
            'Menghapus Data Syarat',
            $olddata,
            []
        );

        return redirect()
            ->route('adminBidang.syarat.indexBidang')
            ->with('success', 'Syarat berhasil dihapus.');
    }

    public function getLayanan($bidangId)
    {
        return response()->json(
            Layanan::where('kode_bidang', $bidangId)->get()
        );
    }

    // Cetak Syarat Menu Admin OPD
    public function indexCetak(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        $layananId = $request->filled('layanan') ? $request->layanan : null;

        $syarat = Syarat::with('layanan')
            ->when($layananId, function ($query) use ($layananId) {
                $query->where('kode_layanan', $layananId);
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->get();

        $selectedLayanan = $layanan->firstWhere('id', $layananId);
        $selectedBidang  = $bidang->firstWhere('id', $bidangId);

        return view('pages.opd.cetak-syarat.index', compact(
            'syarat',
            'bidang',
            'bidangId',
            'layanan',
            'layananId',
            'selectedLayanan',
            'selectedBidang'
        ));
    }

    // Cetak Syarat Menu Admin Bawah
    public function indexCetakAdminBawah(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        $layananId = $request->filled('layanan') ? $request->layanan : null;

        $syarat = Syarat::with('layanan')
            ->when($layananId, function ($query) use ($layananId) {
                $query->where('kode_layanan', $layananId);
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->get();

        $selectedLayanan = $layanan->firstWhere('id', $layananId);
        $selectedBidang  = $bidang->firstWhere('id', $bidangId);

        return view('pages.admin-bawah.cetak-syarat.index', compact(
            'syarat',
            'bidang',
            'bidangId',
            'layanan',
            'layananId',
            'selectedLayanan',
            'selectedBidang'
        ));
    }

    // Cetak Syarat Menu Admin Bidang
    public function indexCetakAdminBidang(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        $layananId = $request->filled('layanan') ? $request->layanan : null;

        $syarat = Syarat::with('layanan')
            ->when($layananId, function ($query) use ($layananId) {
                $query->where('kode_layanan', $layananId);
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->get();

        $selectedLayanan = $layanan->firstWhere('id', $layananId);
        $selectedBidang  = $bidang->firstWhere('id', $bidangId);

        return view('pages.bidang.cetak-syarat.index', compact(
            'syarat',
            'bidang',
            'bidangId',
            'layanan',
            'layananId',
            'selectedLayanan',
            'selectedBidang'
        ));
    }



    // Cetak PDF Menu Admin OPD
    public function exportPdf(Request $request)
    {
        $bidangId = $request->bidang;
        $layananId = $request->layanan;

        if (!$layananId) {
            return back()->with('error', 'Pilih layanan terlebih dahulu');
        }

        $syarat = Syarat::with('layanan')
            ->where('kode_layanan', $layananId)
            ->get();

        $layanan = Layanan::findOrFail($layananId);
        $bidang = Bidang::findOrFail($bidangId);

        $pdf = Pdf::loadView('pages.opd.cetak-syarat.pdf', compact(
            'syarat',
            'layanan',
            'bidang'
        ))->setPaper('A4', 'portrait');

        $filename = 'syarat-' . Str::slug($layanan->nama_layanan) . '.pdf';

        return $pdf->stream($filename);
    }

    // Cetak PDF Menu Admin Bidang
    public function exportPdfBidang(Request $request)
    {
        $bidangId = $request->bidang;
        $layananId = $request->layanan;

        if (!$layananId) {
            return back()->with('error', 'Pilih layanan terlebih dahulu');
        }

        $syarat = Syarat::with('layanan')
            ->where('kode_layanan', $layananId)
            ->get();

        $layanan = Layanan::find($layananId);
        $bidang = Bidang::find($bidangId);

        $pdf = Pdf::loadView('pages.bidang.cetak-syarat.pdf', compact(
            'syarat',
            'layanan',
            'bidang'
        ))->setPaper('A4', 'portrait');

        return $pdf->stream('Syarat_' . $layanan->nama_layanan . '.pdf');
    }
}
