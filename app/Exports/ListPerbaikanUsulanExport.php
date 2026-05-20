<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class ListPerbaikanUsulanExport implements FromView
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function view(): View
    {
        return view('pages.opd.perbaikan.export.export-excel', [
            'data' => $this->data
        ]);
    }
}
