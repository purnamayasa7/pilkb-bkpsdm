<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\DetailTiket;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Syarat;
use App\Models\Tahap;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Carbon\Carbon;

class TiketController extends Controller
{
    public function index(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang;
        $start = $request->start_date;
        $end = $request->end_date;

        $tiket = collect();

        if ($bidangId && $start && $end) {

            $tiket = Regtiket::with([
                'layanan',
                'tahapTerakhir.statusRel'
            ])
                ->whereHas('layanan', function ($q) use ($bidangId) {
                    $q->where('kode_bidang', $bidangId);
                })
                ->whereBetween('tanggal', [$start, $end])
                ->orderBy('tanggal', 'desc')
                ->get();
        }

        return view('pages.all.layanan.index', compact(
            'tiket',
            'bidang',
            'bidangId',
            'start',
            'end'
        ));
    }

    public function indexProses(Request $request)
    {
        $month = $request->month ?? Carbon::now()->month;
        $year = $request->year ?? Carbon::now()->year;

        $tiket = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            ->where('archives', 0)
            ->where('kode_ukerja', Auth::user()->kode_ukerja)
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->orderBy('tanggal', 'desc')
            ->get();

        return view('pages.opd.layanan.index', compact(
            'tiket',
            'month',
            'year'
        ));
    }

    //List Tiket pada menu Admin Bawah
    public function indexList(Request $request)
    {
        $year = $request->year ?? Carbon::now()->year;
        $diambil = $request->diambil;

        $query = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            ->whereYear('tanggal', $year);

        if ($diambil !== null && $diambil !== '') {
            $query->where('diambil', $diambil);
        }

        $tiket = $query->orderBy('tanggal', 'desc')->get();

        return view('pages.admin-bawah.tiket.index', compact(
            'tiket',
            'year',
            'diambil'
        ));
    }

    private function generateNoTiket()
    {
        return now()->format('dmy') . strtoupper(Str::random(4));
    }

    public function create(Request $request)
    {
        $step = $request->step ?? 1;
        $bidang = Bidang::where('aktif', 1)->get();

        if ($step == 1) {
            session()->forget('pengajuan');
        }

        // Expired check
        if ($this->checkSessionExpired()) {
            return redirect()
                ->route('adminOpd.tiket.create', ['step' => 1])
                ->with('error', 'Sesi pengajuan sudah habis, silakan ulangi.');
        }

        $data = session('pengajuan');

        $syarat = [];
        $nama_layanan = null;
        $tiket = null;

        if (isset($data['layanan_id'])) {

            $layanan = Layanan::find($data['layanan_id']);

            if ($layanan) {
                $nama_layanan = $layanan->nama_layanan;

                $syarat = Syarat::where('kode_layanan', $layanan->id)->get();
            }
        }

        if ($step == 4 && isset($data['no_tiket'])) {

            $tiket = Regtiket::with('layanan')->find($data['no_tiket']);
        }

        return view('pages.opd.tiket.create', compact(
            'step',
            'bidang',
            'data',
            'syarat',
            'nama_layanan',
            'tiket'
        ));
    }

    public function step(Request $request)
    {
        $step = $request->step;

        // STEP 1
        if ($step == 1) {

            $request->validate([
                'nip' => 'required',
                'email' => 'required|email'
            ]);

            session([
                'pengajuan.nip' => $request->nip,
                'pengajuan.email' => $request->email,
                'pengajuan.started_at' => now(),
                // 'pengajuan.nama' => 'Kadek Purnamayasa, S.Kom',
                // 'pengajuan.golongan' => 'III/a',
                // 'pengajuan.unit' => 'BKPSDM'
            ]);

            return redirect()->route('adminOpd.tiket.create', ['step' => 2]);
        }

        // STEP 2
        if ($step == 2) {
            if ($this->checkSessionExpired()) {
                return redirect()->route('adminOpd.tiket.create', ['step' => 1])
                    ->with('error', 'Sesi habis.');
            }

            $request->validate([
                'bidang_id' => 'required',
                'layanan_id' => 'required'
            ]);

            session([
                'pengajuan.bidang_id' => $request->bidang_id,
                'pengajuan.layanan_id' => $request->layanan_id,
            ]);

            return redirect()->route('adminOpd.tiket.create', ['step' => 3]);
        }

        // STEP 3
        if ($step == 3) {
            if ($this->checkSessionExpired()) {
                return redirect()->route('adminOpd.tiket.create', ['step' => 1])
                    ->with('error', 'Sesi habis.');
            }

            $data = session('pengajuan');

            if (!$data || !isset($data['nip'], $data['layanan_id'], $data['email'])) {
                return redirect()->route('adminOpd.tiket.create', ['step' => 1])
                    ->with('error', 'Data tidak lengkap, silakan ulangi.');
            }

            DB::beginTransaction();

            try {

                $noTiket = $this->generateNoTiket();

                Regtiket::create([
                    'no_tiket'      => $noTiket,
                    'nip'           => $data['nip'],
                    'kode_layanan'  => $data['layanan_id'],
                    'tanggal'       => now(),
                    'kode_ukerja'   => Auth::user()->kode_ukerja,
                    'no_hp'         => $request->no_hp ?? null,
                    'email'         => $data['email'] ?? null,
                    'nama_penerima' => Auth::user()->username,
                    'archives'      => 0,
                    'data_baru'     => 1,
                    'diambil'       => 0,
                    'diperbaiki'    => 0,
                    'dihapus'       => 0,
                ]);

                $syaratList = Syarat::where('kode_layanan', $data['layanan_id'])->get();

                foreach ($syaratList as $s) {
                    DetailTiket::create([
                        'no_tiket' => $noTiket,
                        'id_syarat' => $s->id,
                        'status' => 1,
                        'comment' => null
                    ]);
                }

                Tahap::create([
                    'no_tiket' => $noTiket,
                    'tanggal' => now(),
                    'status' => 20000,
                    'operator' => Auth::user()->username,
                    'comment' => '-'
                ]);

                DB::commit();

                session([
                    'pengajuan.no_tiket' => $noTiket
                ]);

                return redirect()->route('adminOpd.tiket.create', ['step' => 4, 'no_tiket' => $noTiket])
                    ->with('success', 'Tiket berhasil dibuat dengan No: ' . $noTiket);
            } catch (\Exception $e) {

                DB::rollBack();

                return back()->with('error', 'Gagal simpan tiket: ' . $e->getMessage());
            }
        }
    }

    private function checkSessionExpired()
    {
        $started = session('pengajuan.started_at');

        if ($started && now()->diffInMinutes($started) > 30) {
            session()->forget('pengajuan');
            return true;
        }

        return false;
    }

    public function reset()
    {
        session()->forget('pengajuan');

        return redirect()->route('adminOpd.tiket.create', ['step' => 1]);
    }

    public function getLayanan($id)
    {
        return Layanan::where('kode_bidang', $id)->get();
    }

    public function getSyarat($id)
    {
        return Syarat::where('kode_layanan', $id)->get();
    }

    public function cetak($no_tiket)
    {
        $tiket = Regtiket::with('layanan')
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        $syarat = Syarat::where('kode_layanan', $tiket->kode_layanan)->get();

        $data = session('pengajuan') ?? [
            'nama' => '-',
            'golongan' => '-',
            'unit' => '-'
        ];

        $url = route('tiket.public', $tiket->no_tiket);

        // signed URL
        // $url = URL::signedRoute('tiket.public', [
        //     'no_tiket' => $tiket->no_tiket
        // ]);

        $renderer = new ImageRenderer(
            new RendererStyle(120),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);

        $qrString = $writer->writeString($url);

        $qr = base64_encode($qrString);

        $pdf = Pdf::loadView('pages.opd.tiket.export.pdf', [
            'tiket' => $tiket,
            'syarat' => $syarat,
            'data' => $data,
            'qr' => $qr
        ])->setPaper('A4', 'portrait');

        return $pdf->stream('Tiket-' . $no_tiket . '.pdf');
    }

    public function getHistory($no_tiket)
    {
        $data = Tahap::with('statusRel')
            ->where('no_tiket', $no_tiket)
            ->orderBy('tanggal', 'asc')
            ->get();

        return response()->json($data);
    }

    // Cek Tiket Public
    public function formCek()
    {
        return view('pages.public.cek_tiket');
    }

    public function cekTiket(Request $request)
    {
        $request->validate([
            'no_tiket' => 'required'
        ]);

        return redirect()->route('tiket.public', $request->no_tiket);
    }

    public function showPublic($no_tiket)
    {
        $tiket = Regtiket::with([
            'layanan.bidang',
            'tahap' => function ($q) {
                $q->orderBy('tanggal', 'asc');
            },
            'tahap.statusRel'
        ])->where('no_tiket', $no_tiket)->firstOrFail();

        $syarat = Syarat::where('kode_layanan', $tiket->kode_layanan)->get();

        $detail = DetailTiket::where('no_tiket', $no_tiket)->get()->keyBy('id_syarat');

        $syaratGabung = $syarat->map(function ($s) use ($detail) {
            $d = $detail[$s->id] ?? null;

            $s->status = $d->status ?? null;
            $s->comment = $d->comment ?? null;

            return $s;
        });

        $url = route('tiket.public', $tiket->no_tiket);

        // $url = URL::signedRoute('tiket.public', [
        //     'no_tiket' => $tiket->no_tiket
        // ]);

        $renderer = new ImageRenderer(
            new RendererStyle(120),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);

        $qrString = $writer->writeString($url);

        $qr = base64_encode($qrString);

        return view('pages.public.tiket', [
            'tiket' => $tiket,
            'syarat' => $syaratGabung,
            'qr' => $qr
        ]);
    }

    // CETAK ULANG TIKET
    public function formCetak(Request $request)
    {
        $keyword = $request->keyword;

        $data = collect();

        if ($keyword) {
            $data = Regtiket::with([
                'layanan',
                'tahapTerakhir.statusRel'
            ])
                ->where('kode_ukerja', Auth::user()->kode_ukerja)
                ->where(function ($q) use ($keyword) {
                    $q->where('no_tiket', 'like', "%$keyword%")
                        ->orWhere('nip', 'like', "%$keyword%");
                })
                ->get();
        }

        return view('pages.opd.tiket.cetak', compact('data'));
    }

    // CETAK ULANG TIKET ADMIN BAWAH
    public function formCetakAdminBawah(Request $request)
    {
        $keyword = $request->keyword;

        $data = collect();

        if ($keyword) {
            $data = Regtiket::with([
                'layanan',
                'tahapTerakhir.statusRel'
            ])
                ->where('kode_ukerja', Auth::user()->kode_ukerja)
                ->where(function ($query) use ($keyword) {
                    $query->where('no_tiket', 'like', "%$keyword%")
                        ->orWhere('nip', 'like', "%$keyword%");
                })
                ->get();
        }

        return view('pages.admin-bawah.tiket.cetak', compact('data'));
    }
}
