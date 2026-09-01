<?php

namespace App\Exports;

use App\Models\Bidang;
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
        $query = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ]);

        if ($this->req->filled('bidang')) {
            $query->whereHas('layanan', function ($q) {
                $q->where('kode_bidang', $this->req->bidang);
            });
        }

        if ($this->req->filled('start_date') && $this->req->filled('end_date')) {
            $query->whereBetween('tanggal', [
                $this->req->start_date . ' 00:00:00',
                $this->req->end_date . ' 23:59:59'
            ]);
        }

        $data = $query->orderBy('tanggal', 'desc')->get();
        $bidang = $this->req->filled('bidang') ? Bidang::find($this->req->bidang) : null;

        return view('pages.all.layanan.export.export-excel', [
            'data'   => $data,
            'bidang' => $bidang,
            'start'  => $this->req->start_date,
            'end'    => $this->req->end_date,
        ]);
    }
}
