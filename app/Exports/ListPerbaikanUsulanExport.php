<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class ListPerbaikanUsulanExport implements FromView
{
    protected $data;
    protected $pegawaiList;

    public function __construct($data, $pegawaiList)
    {
        $this->data = $data;
        $this->pegawaiList = $pegawaiList;
    }

    public function view(): View
    {
        return view('pages.opd.perbaikan.export.export-excel', [
            'data' => $this->data,
            'pegawaiList' => $this->pegawaiList
        ]);
    }
}
