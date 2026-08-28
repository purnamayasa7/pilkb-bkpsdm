<?php

namespace App\Http\Controllers;

use App\Exports\LaporanLayananExport;
use App\Exports\LaporanPermintaanExport;
use App\Exports\ListProsesPengajuanExport;
use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Tahap;
use App\Services\ActivityLogService;
use App\Services\PegawaiService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class LayananController extends Controller
{
    public function __construct(
        protected PegawaiService $pegawaiService
    ) {}

    public function index()
    {
        $layanan = Layanan::with('bidang')
            ->orderBy('kode_bidang', 'asc')
            ->get();

        return view('pages.admin.layanan.index', compact('layanan'));
    }

    public function indexBidang()
    {
        $user = Auth::user();

        $layanan = Layanan::with('bidang')
            ->where('kode_bidang', $user->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        return view('pages.bidang.layanan.index', compact('layanan'));
    }

    public function getHistory($no_tiket)
    {
        $data = Tahap::with('statusRel')
            ->where('no_tiket', $no_tiket)
            ->orderBy('tanggal', 'asc')
            ->get();

        return response()->json($data);
    }

    public function create()
    {
        $bidang = Bidang::all();

        return view('pages.admin.layanan.create', compact('bidang'));
    }

    // Menu Admin Bidang
    public function createBidang()
    {
        $bidang = Bidang::all();

        return view('pages.bidang.layanan.create', compact('bidang'));
    }

    // Menu Admin Bidang
    public function storeBidang(Request $request)
    {
        $request->validate([
            'nama_layanan' => 'required',
            'waktu_penyelesaian' => 'required',
        ]);

        $kode_bidang = Auth::user()->bidang_id;

        $layanan = Layanan::create([
            'kode_bidang' => $kode_bidang,
            'nama_layanan' => $request->nama_layanan,
            'waktu_penyelesaian' => $request->waktu_penyelesaian,
            'aktif' => true,
            'deskripsi' => $request->deskripsi,
        ]);

        ActivityLogService::log(
            'Master Data Layanan',
            'CREATE',
            'Menambah Layanan Baru',
            [],
            $layanan->toArray()
        );

        return redirect()->route('adminBidang.layanan.indexBidang')
            ->with('success', 'Layanan berhasil ditambahkan');
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_bidang' => 'required|exists:tb_bidang,id',
            'nama_layanan' => 'required',
            'waktu_penyelesaian' => 'required',
        ]);

        $kode_bidang = $request->kode_bidang;

        $layanan = Layanan::create([
            'kode_bidang' => $kode_bidang,
            'nama_layanan' => $request->nama_layanan,
            'waktu_penyelesaian' => $request->waktu_penyelesaian,
            'aktif' => true,
            'deskripsi' => $request->deskripsi,
        ]);

        ActivityLogService::log(
            'Master Data Layanan',
            'CREATE',
            'Menambah Layanan Baru',
            [],
            $layanan->toArray()
        );

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

        $oldData = [
            'nama_layanan' => $layanan->nama_layanan,
            'waktu_penyelesaian' => $layanan->waktu_penyelesaian,
            'deskripsi' => $layanan->deskripsi,
            'aktif' => $layanan->aktif,
        ];

        $layanan->update([
            'kode_bidang' => $request->kode_bidang,
            'nama_layanan' => $request->nama_layanan,
            'waktu_penyelesaian' => $request->waktu_penyelesaian,
            'deskripsi' => $request->deskripsi,
            'aktif' => $request->aktif,
        ]);

        $newData = [
            'nama_layanan' => $layanan->fresh()->nama_layanan,
            'waktu_penyelesaian' => $layanan->fresh()->waktu_penyelesaian,
            'deskripsi' => $layanan->fresh()->deskripsi,
            'aktif' => $layanan->fresh()->aktif,
        ];

        ActivityLogService::log(
            'Master Data Layanan',
            'UPDATE',
            'Mengubah Data Layanan ID: ' . $layanan->id,
            $oldData,
            $newData
        );

        return redirect()->route('root.layanan')
            ->with('success', 'Layanan berhasil diupdate');
    }

    public function updateBidang(Request $request, $layananId)
    {
        $layanan = Layanan::findOrFail($layananId);

        $request->validate([
            'nama_layanan' => 'required',
            'waktu_penyelesaian' => 'required',
        ]);

        $oldData = [
            'nama_layanan' => $layanan->nama_layanan,
            'waktu_penyelesaian' => $layanan->waktu_penyelesaian,
            'deskripsi' => $layanan->deskripsi,
            'aktif' => $layanan->aktif,
        ];

        $layanan->update([
            'nama_layanan' => $request->nama_layanan,
            'waktu_penyelesaian' => $request->waktu_penyelesaian,
            'deskripsi' => $request->deskripsi,
            'aktif' => $request->aktif,
        ]);

        $newData = [
            'nama_layanan' => $layanan->fresh()->nama_layanan,
            'waktu_penyelesaian' => $layanan->fresh()->waktu_penyelesaian,
            'deskripsi' => $layanan->fresh()->deskripsi,
            'aktif' => $layanan->fresh()->aktif,
        ];

        ActivityLogService::log(
            'Master Data Layanan',
            'UPDATE',
            'Mengubah Data Layanan ID: ' . $layanan->id,
            $oldData,
            $newData
        );

        return redirect()->route('adminBidang.layanan.indexBidang')
            ->with('success', 'Layanan berhasil diupdate');
    }

    public function edit($id)
    {
        $layanan = Layanan::findOrFail($id);
        $bidang = Bidang::all();

        return view('pages.admin.layanan.edit', compact('layanan', 'bidang'));
    }

    // Menu Admin Bidang
    public function editBidang($id)
    {
        $layanan = Layanan::findOrFail($id);
        $bidang = Bidang::all();

        return view('pages.bidang.layanan.edit', compact('layanan', 'bidang'));
    }

    //Aktif/Nonaktif Layanan
    public function toggleAktif($id)
    {
        $layanan = Layanan::findOrFail($id);

        $oldData = ['aktif' => $layanan->aktif,];

        $layanan->aktif = !$layanan->aktif;
        $layanan->save();

        $newData = ['aktif' => $layanan->aktif,];

        ActivityLogService::log(
            'Master Data Bidang',
            'UPDATE',
            $layanan->aktif
                ? 'Mengaktifkan layanan ID: ' . $layanan->id
                : 'Menonaktifkan layanan ID: ' . $layanan->id,
            $oldData,
            $newData
        );

        return redirect()->back()->with('success', 'Status layanan berhasil diubah');
    }

    //Aktif/Nonaktif Layanan Admin Bidang
    public function toggleAktifBidang($id)
    {
        $layanan = Layanan::where('id', $id)
            ->where('kode_bidang', Auth::user()->bidang_id)
            ->firstOrFail();

        $oldData = [
            'aktif' => $layanan->aktif,
        ];

        $layanan->update([
            'aktif' => !$layanan->aktif,
        ]);

        $newData = [
            'aktif' => $layanan->aktif,
        ];

        ActivityLogService::log(
            'Master Data Layanan',
            'UPDATE',
            $layanan->aktif
                ? 'Mengaktifkan layanan ID: ' . $layanan->id
                : 'Menonaktifkan layanan ID: ' . $layanan->id,
            $oldData,
            $newData
        );

        return back()->with('success', 'Status layanan berhasil diubah');
    }

    //List Laporan Pengajuan Layanan - Admin OPD
    public function indexLaporan(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $user = Auth::user();

        $tiket = collect();

        if ($start && $end) {

            $tiket = Regtiket::with([
                'layanan.bidang',
                'tahapTerakhir.statusRel'
            ])
                ->whereBetween('tanggal', [
                    $start . ' 00:00:00',
                    $end . ' 23:59:59'
                ])
                ->where('kode_ukerja', $user->kode_ukerja)
                ->orderByDesc('tanggal')
                ->get();
        }

        return view('pages.opd.laporan.index', compact(
            'tiket',
            'start',
            'end'
        ));
    }

    // Export PDF Master Data Layanan - Admin Bidang
    public function exportPdfListBidang()
    {
        $user = Auth::user();

        $layanan = Layanan::with('bidang')
            ->where('kode_bidang', $user->bidang_id)
            ->orderBy('nama_layanan')
            ->get();

        $pdf = Pdf::loadView('pages.bidang.layanan.export-pdf', [
            'layanan' => $layanan,
            'bidang' => $user->bidang,
        ])->setPaper('A4', 'landscape');

        return $pdf->stream('Laporan-Layanan.pdf');
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

    //Export PDF Laporan Pengajuan Layanan - Admin OPD
    public function exportPdfOpd(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $user = Auth::user();

        $data = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ])
            ->whereBetween('tanggal', [
                $start . ' 00:00:00',
                $end . ' 23:59:59'
            ])
            ->where('kode_ukerja', $user->kode_ukerja)
            ->orderByDesc('tanggal')
            ->get();

        $pdf = Pdf::loadView(
            'pages.opd.laporan.export.pdf',
            compact('data', 'start', 'end')
        )->setPaper('A4', 'landscape');

        return $pdf->stream('Laporan-Layanan.pdf');
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
