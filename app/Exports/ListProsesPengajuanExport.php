<?php

namespace App\Exports;

use App\Models\Regtiket;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromView;

class ListProsesPengajuanExport implements FromView
{
     protected $req;

    public function __construct(Request $request)
    {
        $this->req = $request;
    }

    public function view(): View
    {
        $month = $this->req->month;
        $year = $this->req->year;

        $data = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            ->where('archives', 0)
            ->where('kode_ukerja', Auth::user()->kode_ukerja)
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->orderBy('tanggal', 'desc')
            ->get();

        return view('pages.opd.layanan.export.export-excel', [
            'data' => $data,
            'month' => $month,
            'year' => $year
        ]);
    }
}
