<?php

namespace App\Exports;

use App\Models\Tahap;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Support\Facades\Auth;

class LaporanPermintaanExport implements FromView
{
    protected $req;

    public function __construct($req)
    {
        $this->req = $req;
    }

    public function view(): View
    {
        $query = Tahap::with([
            'statusRel',
            'regtiket.layanan'
        ])
            ->whereHas('regtiket', function ($q) {
                $q->where('kode_ukerja', Auth::user()->kode_ukerja);
            });

        if ($this->req->filled('start_date') && $this->req->filled('end_date')) {
            $query->whereBetween('tanggal', [
                $this->req->start_date,
                $this->req->end_date
            ]);
        }

        if (Auth::user()->kode_ukerja) {
            $query->whereHas('regtiket', function ($q) {
                $q->where('kode_ukerja', Auth::user()->kode_ukerja);
            });
        }

        return view('pages.opd.laporan.export.export-excel', [
            'data' => $query->orderBy('tanggal', 'desc')->get()
        ]);
    }
}
