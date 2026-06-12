<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Status;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function index(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $status = Status::with(['layanan.bidang'])
            ->when($bidangId, function ($query) use ($bidangId) {
                $query->whereHas('layanan', function ($query) use ($bidangId) {
                    $query->where('kode_bidang', $bidangId);
                });
            })
            ->get();

        return view('pages.admin.status.index', compact('status', 'bidang', 'bidangId'));
    }

    public function create()
    {
        $layanan = Layanan::all();
        $bidang = Bidang::all();

        return view('pages.admin.status.create', compact('layanan', 'bidang'));
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

    public function update(Request $request, $statusId)
    {
        $status = Status::findOrFail($statusId);

        $request->validate([
            'kode_layanan' => 'nullable|exists:tb_layanan,id',
            'status' => 'required',
        ]);

        $olddata = [
            'kode_layanan' => $status->kode_layanan,
            'status' => $status->status,
        ];

        $status->kode_layanan = $request->kode_layanan;
        $status->status = $request->status;

        $status->save();

        $newdata = [
            'kode_layanan' => $status->fresh()->kode_layanan,
            'status' => $status->fresh()->status,
        ];

        ActivityLogService::log(
            'Master Data Status',
            'UPDATE',
            'Mengubah Data status',
            $olddata,
            $newdata
        );

        return redirect()->route('root.status')
            ->with('success', 'Status berhasil diupdate');
    }

    public function edit($id)
    {
        $status = Status::findOrFail($id);
        $layanan = Layanan::all();
        $bidang = Bidang::all();

        return view('pages.admin.status.edit', compact('status', 'layanan', 'bidang'));
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

    public function getLayanan($bidangId)
    {
        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        return response()->json($layanan);
    }
}
