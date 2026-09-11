<?php

namespace App\Exports;

use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromView;

class RootLayananTiketExport implements FromView
{
    protected $req;

    public function __construct(Request $request)
    {
        $this->req = $request;
    }

    public function view(): View
    {
        $month = (int) ($this->req->month ?? \Carbon\Carbon::now()->month);
        $year = (int) ($this->req->year ?? \Carbon\Carbon::now()->year);

        $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth()->format('Y-m-d');

        $query = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ])
            ->whereBetween('tanggal', [$startDate, $endDate]);

        if ($this->req->filled('bidang')) {
            $layananIds = Layanan::where('kode_bidang', $this->req->bidang)->pluck('id');
            $query->whereIn('kode_layanan', $layananIds);
        }

        $start = $startDate;
        $end = $endDate;

        $data = $query->orderBy('tanggal', 'desc')->get();
        $bidang = $this->req->filled('bidang') ? Bidang::find($this->req->bidang) : null;

        return view('pages.all.layanan.export.export-excel', [
            'data'   => $data,
            'bidang' => $bidang,
            'start'  => $start,
            'end'    => $end,
        ]);
    }
}
