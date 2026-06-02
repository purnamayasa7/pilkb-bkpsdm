<?php

namespace App\Http\Controllers;

use App\Exports\LaporanLayananExport;
use App\Exports\LaporanPermintaanExport;
use App\Exports\ListProsesPengajuanExport;
use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Tahap;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class LayananController extends Controller
{
    public function index()
    {
        $layanan = Layanan::with('bidang')
            ->orderBy('kode_bidang', 'asc')
            ->get();

        return view('pages.admin.layanan.index', compact('layanan'));
    }

    public function create()
    {
        $bidang = Bidang::all();

        return view('pages.admin.layanan.create', compact('bidang'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_bidang' => 'required|exists:tb_bidang,id',
            'nama_layanan' => 'required',
            'waktu_penyelesaian' => 'required',
        ]);

        $kode_bidang = $request->kode_bidang;

        Layanan::create([
            'kode_bidang' => $kode_bidang,
            'nama_layanan' => $request->nama_layanan,
            'rangkap' => $request->rangkap,
            'waktu_penyelesaian' => $request->waktu_penyelesaian,
            'aktif' => true,
            'no_wa' => $request->no_wa,
            'deskripsi' => $request->deskripsi,
        ]);

        return redirect()->route('root.layanan')
            ->with('success', 'Layanan berhasil ditambahkan');
    }

    public function update(Request $request, $layananId)
    {
        $layanan = Layanan::findOrFail($layananId);

        $request->validate([
            'kode_bidang' => 'required|exists:tb_bidang,id',
            'nama_layanan' => 'required',
            'waktu_penyelesaian' => 'required',
        ]);

        $layanan->kode_bidang = $request->kode_bidang;
        $layanan->nama_layanan = $request->nama_layanan;
        $layanan->rangkap = $request->rangkap;
        $layanan->waktu_penyelesaian = $request->waktu_penyelesaian;
        $layanan->no_wa = $request->no_wa;
        $layanan->deskripsi = $request->deskripsi;
        $layanan->aktif = $request->aktif;

        $layanan->save();

        return redirect()->route('root.layanan')
            ->with('success', 'Layanan berhasil diupdate');
    }

    public function edit($id)
    {
        $layanan = Layanan::findOrFail($id);
        $bidang = Bidang::all();

        return view('pages.admin.layanan.edit', compact('layanan', 'bidang'));
    }

    //Aktif/Nonaktif Layanan
    public function toggleAktif($id)
    {
        $layanan = Layanan::findOrFail($id);

        $layanan->aktif = !$layanan->aktif;
        $layanan->save();

        return redirect()->back()->with('success', 'Status layanan berhasil diubah');
    }

    //List Laporan Pengajuan Layanan - Admin OPD
    public function indexLaporan(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $tiket = collect();

        if ($start && $end) {

            $tiket = Tahap::with([
                'statusRel',
                'regtiket.layanan'
            ])
                ->whereBetween('tanggal', [$start, $end])
                ->whereHas('regtiket', function ($q) {
                    $q->where('kode_ukerja', Auth::user()->kode_ukerja);
                })
                ->orderBy('tanggal', 'desc')
                ->get();
        }

        return view('pages.opd.laporan.index', compact(
            'tiket',
            'start',
            'end'
        ));
    }

    //Export Excel Laporan Pengajuan Layanan - Admin OPD
    public function exportLaporan(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date'
        ]);

        $start = Carbon::parse($request->start_date)->format('d-m-Y');
        $end   = Carbon::parse($request->end_date)->format('d-m-Y');

        $fileName = "Laporan_Permintaan_{$start}_sd_{$end}.xlsx";

        return Excel::download(
            new LaporanPermintaanExport($request),
            $fileName
        );
    }

    //Export Excel List Proses Pengajuan - Admin OPD
    public function exportExcel(Request $request)
    {
        $request->validate([
            'month' => 'required|numeric|min:1|max:12',
            'year'  => 'required|numeric'
        ]);

        $month = (int) $request->month;
        $year  = (int) $request->year;

        $namaBulan = Carbon::create()->month($month)->translatedFormat('F');

        $fileName = "Laporan_Proses_{$namaBulan}_{$year}.xlsx";

        return Excel::download(
            new ListProsesPengajuanExport($request),
            $fileName
        );
    }

    //Export PDF List Proses Pengajuan - Admin OPD
    public function exportPdf(Request $request)
    {
        $request->validate([
            'month' => 'required|numeric|min:1|max:12',
            'year'  => 'required|numeric'
        ]);

        $month = (int) $request->month;
        $year  = (int) $request->year;

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

        $namaBulan = Carbon::create()->month($month)->translatedFormat('F');

        $pdf = Pdf::loadView('pages.opd.layanan.export.export-pdf', [
            'data'  => $data,
            'month' => $namaBulan,
            'year'  => $year
        ]);

        return $pdf->stream("Laporan_Proses_{$namaBulan}_{$year}.pdf");
    }

    //Export Excel Master Data Layanan - Root
    public function exportExcelList(Request $request)
    {
        return Excel::download(new LaporanLayananExport($request), 'laporan-layanan.xlsx');    
    }
}
