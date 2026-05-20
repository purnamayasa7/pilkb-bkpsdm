<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Status;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function index(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang ?? $bidang->first()?->id;

        $status = Status::with(['layanan.bidang'])
            ->when($bidangId, function ($query) use ($bidangId) {
                $query->whereHas('layanan', function ($q) use ($bidangId) {
                    $q->where('kode_bidang', $bidangId);
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

        Status::create([
            'kode_layanan' => $kode_layanan,
            'status' => $request->status,
        ]);

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

        $status->kode_layanan = $request->kode_layanan;
        $status->status = $request->status;

        $status->save();

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
        $status->delete();

        return redirect()->route('root.status')
            ->with('success', 'Status berhasil dihapus');
    }

    public function getLayanan($bidangId)
    {
        $layanan = Layanan::where('kode_bidang', $bidangId)->get();

        return response()->json($layanan);
    }
}
