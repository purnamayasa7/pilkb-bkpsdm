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
