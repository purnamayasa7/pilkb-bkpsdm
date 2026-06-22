<?php

namespace App\Http\Controllers;

use App\Exports\LaporanAktivitasExport;
use App\Models\Log;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $tanggal_awal = $request->tanggal_awal;
        $tanggal_akhir = $request->tanggal_akhir;

        $is_search = $request->has('tanggal_awal') || $request->has('tanggal_akhir');

        $query = Log::with(['user', 'user.role', 'user.bidang']);

        switch ($user->role_id) {

            case 1:
                break;

            case 2:
                $query->where('user_id', $user->id);
                break;

            case 3:
                $query->where('kode_ukerja', $user->kode_ukerja);
                break;

            case 4:
                $query->whereHas('user', function ($q) use ($user) {
                    $q->where('bidang_id', $user->bidang_id);
                });
                break;
        }

        if ($is_search) {
            $query->whereBetween('created_at', [
                $tanggal_awal . ' 00:00:00',
                $tanggal_akhir . ' 23:59:59'
            ]);
        }

        $logs = $is_search ? $query->latest()->get() : collect();

        return view('pages.log.index', compact(
            'logs',
            'tanggal_awal',
            'tanggal_akhir',
            'is_search'
        ));
    }

    public function exportExcel(Request $request)
    {
        $request->validate([
            'tanggal_awal'  => 'nullable|date',
            'tanggal_akhir' => 'nullable|date',
        ]);

        $start = $request->tanggal_awal;
        $end   = $request->tanggal_akhir;

        $fileName = 'Log_Aktivitas_' .
            ($start ?? 'all') . '_' .
            ($end ?? 'all') . '.xlsx';

        return Excel::download(
            new LaporanAktivitasExport($request),
            $fileName
        );
    }
}
