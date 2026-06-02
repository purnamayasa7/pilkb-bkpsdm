<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Support\Facades\Auth;

class LaporanUserExport implements FromView
{
    protected $req;

    public function __construct($req)
    {
        $this->req = $req;
    }

    public function view(): View
    {
        $data = User::with(['role', 'bidang'])
            ->orderBy('nama')
            ->get();

        return view('pages.admin.user.export.export-excel', [
            'data' => $data
        ]);
    }
}
