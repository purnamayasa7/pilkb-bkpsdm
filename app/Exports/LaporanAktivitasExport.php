<?php

namespace App\Exports;

use App\Models\Layanan;
use App\Models\Log;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromView;

class LaporanAktivitasExport implements FromView
{
    protected $request;

    public function __construct($request)
    {
        $this->request = $request;
    }

    public function view(): View
    {
        $query = Log::with(['user', 'user.role', 'user.bidang']);

        $user = Auth::user();

        // ROLE FILTER
        switch ($user->role_id) {

            case 1: // ROOT
                break;

            case 2: // ADMIN BAWAH
                $query->where('user_id', $user->id);
                break;

            case 3: // ADMIN OPD
                $query->where('kode_ukerja', $user->kode_ukerja);
                break;

            case 4: // BIDANG
                $query->whereHas('user', function ($q) use ($user) {
                    $q->where('bidang_id', $user->bidang_id);
                });
                break;
        }

        // FILTER TANGGAL
        if ($this->request->filled('tanggal_awal') && $this->request->filled('tanggal_akhir')) {
            $query->whereBetween('created_at', [
                $this->request->tanggal_awal . ' 00:00:00',
                $this->request->tanggal_akhir . ' 23:59:59'
            ]);
        }

        $data = $query->latest()->get();

        return view('pages.log.export-excel', [
            'data' => $data
        ]);
    }
}
