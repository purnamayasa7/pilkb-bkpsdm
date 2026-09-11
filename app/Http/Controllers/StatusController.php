<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Status;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StatusController extends Controller
{
    public function index(Request $request)
    {
        $bidang = Bidang::orderBy('nama_bidang')->get();

        $bidangId = $request->bidang;
        $layananId = $request->layanan;

        $allLayanan = Layanan::orderBy('kode_bidang')->orderBy('nama_layanan')->get();

        $layanan = ($bidangId && $bidangId !== 'all')
            ? $allLayanan->where('kode_bidang', $bidangId)->values()
            : $allLayanan;

        $query = Status::with(['layanan.bidang']);

        if ($bidangId && $bidangId !== 'all') {
            $query->whereHas('layanan', function ($q) use ($bidangId) {
                $q->where('kode_bidang', $bidangId);
            });
        }

        if ($layananId && $layananId !== 'all') {
            $query->where('kode_layanan', $layananId);
        }

        $status = $query->get();

        return Inertia::render('Root/Status/Index', [
            'status'     => $status,
            'bidang'     => $bidang,
            'bidangId'   => $bidangId ?? 'all',
            'layanan'    => $layanan,
            'layananId'  => $layananId ?? 'all',
            'allLayanan' => $allLayanan,
        ]);
    }

    // Menu Admin Bidang
    public function indexBidang(Request $request)
    {
        $user = Auth::user();

        $layanan = Layanan::where('kode_bidang', $user->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        $layananId = $request->filled('layanan')
            ? $request->layanan
            : null;

        $status = Status::with(['layanan.bidang'])
            ->whereHas('layanan', function ($q) use ($user) {
                $q->where('kode_bidang', $user->bidang_id);
            })
            ->when($layananId, function ($q) use ($layananId) {
                $q->where('kode_layanan', $layananId);
            })
            ->get();

        return view('pages.bidang.status.index', compact(
            'status',
            'layanan',
            'layananId'
        ));
    }

    public function create(Request $request)
    {
        $bidang = Bidang::orderBy('nama_bidang')->get();
        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $allLayanan = Layanan::orderBy('kode_bidang')->orderBy('nama_layanan')->get();

        $layanan = ($bidangId && $bidangId !== 'all')
            ? $allLayanan->where('kode_bidang', $bidangId)->values()
            : collect();

        return Inertia::render('Root/Status/Create', [
            'bidang'            => $bidang,
            'bidangId'          => $bidangId ? (string) $bidangId : null,
            'layanan'           => $layanan,
            'allLayanan'        => $allLayanan,
            'selectedLayananId' => $request->filled('layanan') ? (string) $request->layanan : null,
        ]);
    }

    // Menu Admin Bidang
    public function createBidang()
    {
        $user = Auth::user();

        $layanan = Layanan::where('kode_bidang', $user->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        return view('pages.bidang.status.create', compact('layanan'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_layanan' => 'required|exists:tb_layanan,id',
            'status' => 'required',
        ]);

        $kode_layanan = $request->kode_layanan;

        $status = Status::create([
            'kode_layanan' => $kode_layanan,
            'status' => $request->status,
        ]);

        ActivityLogService::log(
            'Master Data Status',
            'CREATE',
            'Menambah Status Baru',
            [],
            $status->toArray()
        );

        return redirect()->route('root.status')
            ->with('success', 'Status berhasil ditambahkan');
    }

    // Menu Admin Bidang
    public function storeBidang(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'kode_layanan' => 'required|exists:tb_layanan,id',
            'status'       => 'required|string|max:255',
        ]);

        $layanan = Layanan::where('id', $request->kode_layanan)
            ->where('kode_bidang', $user->bidang_id)
            ->firstOrFail();

        $status = Status::create([
            'kode_layanan' => $layanan->id,
            'status'       => $request->status,
        ]);

        ActivityLogService::log(
            'Master Data Status',
            'CREATE',
            'Menambah Status Baru',
            [],
            $status->toArray()
        );

        return redirect()
            ->route('adminBidang.status.indexBidang')
            ->with('success', 'Status berhasil ditambahkan.');
    }

    public function update(Request $request, $statusId)
    {
        $status = Status::with('layanan.bidang')
            ->findOrFail($statusId);

        $request->validate([
            'status' => 'required|string|max:255',
        ]);

        $olddata = [
            'kode_layanan' => $status->kode_layanan,
            'status'       => $status->status,
        ];

        $status->update([
            'status' => $request->status,
        ]);

        $newdata = [
            'kode_layanan' => $status->kode_layanan,
            'status'       => $status->status,
        ];

        ActivityLogService::log(
            'Master Data Status',
            'UPDATE',
            'Mengubah Data Status',
            $olddata,
            $newdata
        );

        return redirect()
            ->route('root.status')
            ->with('success', 'Status berhasil diupdate.');
    }

    // Menu Admin Bidang
    public function updateBidang(Request $request, $statusId)
    {
        $user = Auth::user();

        $status = Status::with('layanan')
            ->whereHas('layanan', function ($q) use ($user) {
                $q->where('kode_bidang', $user->bidang_id);
            })
            ->findOrFail($statusId);

        $request->validate([
            'status' => 'required|string|max:255',
        ]);

        $olddata = [
            'kode_layanan' => $status->kode_layanan,
            'status'       => $status->status,
        ];

        // Hanya update status
        $status->update([
            'status' => $request->status,
        ]);

        $newdata = [
            'kode_layanan' => $status->kode_layanan,
            'status'       => $status->status,
        ];

        ActivityLogService::log(
            'Master Data Status',
            'UPDATE',
            'Mengubah Data Status',
            $olddata,
            $newdata
        );

        return redirect()
            ->route('adminBidang.status.indexBidang')
            ->with('success', 'Status berhasil diupdate.');
    }

    public function edit($id)
    {
        $status = Status::with('layanan.bidang')->findOrFail($id);

        return Inertia::render('Root/Status/Edit', [
            'status' => $status,
        ]);
    }

    // Menu Admin Bidang
    public function editBidang($id)
    {
        $user = Auth::user();

        $status = Status::with('layanan.bidang')
            ->whereHas('layanan', function ($q) use ($user) {
                $q->where('kode_bidang', $user->bidang_id);
            })
            ->findOrFail($id);

        $layanan = Layanan::where('kode_bidang', $user->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        return view('pages.bidang.status.edit', compact(
            'status',
            'layanan'
        ));
    }

    public function destroy($id)
    {
        $status = Status::findOrFail($id);

        $olddata = [
            'id' => $status->id,
            'kode_layanan' => $status->kode_layanan,
            'status' => $status->status,
        ];

        $status->delete();

        ActivityLogService::log(
            'Master Data Status',
            'DELETE',
            'Menghapus Data Status',
            $olddata,
            []
        );

        return redirect()->route('root.status')
            ->with('success', 'Status berhasil dihapus');
    }

    // Menu Admin Bidang
    public function destroyBidang($id)
    {
        $user = Auth::user();

        $status = Status::with('layanan')
            ->whereHas('layanan', function ($q) use ($user) {
                $q->where('kode_bidang', $user->bidang_id);
            })
            ->findOrFail($id);

        $olddata = [
            'id'            => $status->id,
            'kode_layanan'  => $status->kode_layanan,
            'status'        => $status->status,
        ];

        $status->delete();

        ActivityLogService::log(
            'Master Data Status',
            'DELETE',
            'Menghapus Data Status',
            $olddata,
            []
        );

        return redirect()
            ->route('adminBidang.status.indexBidang')
            ->with('success', 'Status berhasil dihapus.');
    }

    public function getLayanan($bidangId)
    {
        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        return response()->json($layanan);
    }

    public function getByBidang($bidangId)
    {
        $status = Status::with(['layanan.bidang'])
            ->whereHas('layanan', function ($query) use ($bidangId) {
                $query->where('kode_bidang', $bidangId);
            })
            ->get();

        return response()->json($status);
    }
}
