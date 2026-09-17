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
        $tanggal_awal = $request->tanggal_awal;
        $tanggal_akhir = $request->tanggal_akhir;

        $is_search = $request->has('tanggal_awal') || $request->has('tanggal_akhir');

        $query = Log::with(['user', 'user.role', 'user.bidang']);

        if ($is_search) {
            $query->whereBetween('created_at', [
                $tanggal_awal . ' 00:00:00',
                $tanggal_akhir . ' 23:59:59'
            ]);
        }

        $logs = $is_search ? $query->latest()->get() : collect();

        return inertia('Log/Index', [
            'logs'          => $logs,
            'tanggal_awal'  => $tanggal_awal,
            'tanggal_akhir' => $tanggal_akhir,
            'is_search'     => $is_search,
        ]);
    }

    public function getData(Request $request)
    {
        $tanggal_awal = $request->tanggal_awal;
        $tanggal_akhir = $request->tanggal_akhir;

        $query = Log::with(['user', 'user.role', 'user.bidang']);

        if ($tanggal_awal && $tanggal_akhir) {
            $query->whereBetween('created_at', [
                $tanggal_awal . ' 00:00:00',
                $tanggal_akhir . ' 23:59:59'
            ]);
        }

        $logs = $query->latest()->get();

        return response()->json($logs);
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
