<?php

namespace App\Exports;

use App\Models\Layanan;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromView;

class LaporanLayananExport implements FromView
{
    protected $req;

    public function __construct($req)
    {
        $this->req = $req;
    }

    public function view(): View
    {
        $data = Layanan::with('bidang')
            ->orderBy('kode_bidang', 'asc')
            ->get();

        return view('pages.admin.layanan.export.export-excel', [
            'data' => $data
        ]);
    }
}
