<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class ListPerbaikanUsulanExport implements FromView
{
    protected $data;
    protected $pegawaiList;
    protected $view;

    public function __construct($data, $pegawaiList = [], $view = 'pages.opd.perbaikan.export.export-excel')
    {
        $this->data = $data;
        $this->pegawaiList = $pegawaiList;
        $this->view = $view;
    }

    public function view(): View
    {
        return view($this->view, [
            'data' => $this->data,
            'pegawaiList' => $this->pegawaiList
        ]);
    }
}
