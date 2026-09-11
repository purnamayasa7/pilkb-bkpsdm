<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BidangController extends Controller
{
    public function index()
    {
        $bidang = Bidang::orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Root/Bidang/Index', [
            'bidang' => $bidang,
        ]);
    }

    public function create()
    {
        return Inertia::render('Root/Bidang/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_bidang' => 'required',
        ]);

        $bidang = Bidang::create([
            'nama_bidang' => $request->nama_bidang,
            'aktif' => true,
            'role_id' => 4,
        ]);

        ActivityLogService::log(
            'Master Data Bidang',
            'CREATE',
            'Menambah Bidang Baru',
            [],
            $bidang->toArray()
        );

        return redirect()->route('root.bidang')
            ->with('success', 'Bidang berhasil ditambahkan');
    }

    public function edit($id)
    {
        $bidang = Bidang::findOrFail($id);

        return Inertia::render('Root/Bidang/Edit', [
            'bidang' => $bidang,
        ]);
    }

    public function update(Request $request, $bidangId)
    {
        $bidang = Bidang::findOrFail($bidangId);

        $validated = $request->validate([
            'nama_bidang' => 'required|string|max:100',
            'aktif' => 'required|boolean',
        ]);

        $oldData = [
            'nama_bidang' => $bidang->nama_bidang,
            'aktif' => $bidang->aktif,
        ];

        $bidang->update([
            'nama_bidang' => $validated['nama_bidang'],
            'aktif' => $validated['aktif'],
        ]);

        $newData = [
            'nama_bidang' => $bidang->fresh()->nama_bidang,
            'aktif' => $bidang->fresh()->aktif,
        ];

        ActivityLogService::log(
            'Master Data Bidang',
            'UPDATE',
            'Mengubah Data Bidang',
            $oldData,
            $newData
        );

        return redirect()->route('root.bidang')
            ->with('success', 'Bidang berhasil diupdate');
    }

    public function toggleAktif($id)
    {
        $bidang = Bidang::findOrFail($id);

        $oldData = ['aktif' => $bidang->aktif,];

        $bidang->aktif = !$bidang->aktif;
        $bidang->save();

        $newData = ['aktif' => $bidang->aktif,];

        ActivityLogService::log(
            'Master Data Bidang',
            'UPDATE',
            $bidang->aktif
                ? 'Mengaktifkan bidang'
                : 'Menonaktifkan bidang',
            $oldData,
            $newData
        );

        return redirect()->back()->with('success', 'Status bidang berhasil diubah');
    }

    // public function update(Request $request, $id){
    //     $validated = $request->validate([
    //         'kode_bidang' => ['required', 'min:10', 'max:16'],
    //         'nama_bidang' => ['required', 'max:100'],
    //     ]);

    //     Bidang::findOrFail($id)->update($request->validated());

    //     return redirect('/bidang')->with('success', 'Berhasil mengubah data');
    // }

}
