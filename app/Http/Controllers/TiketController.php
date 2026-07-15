<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\DetailTiket;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Syarat;
use App\Models\Tahap;
use App\Models\User;
use App\Notifications\TiketNotification;
use App\Services\ActivityLogService;
use App\Services\PegawaiService;
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
use Illuminate\Support\Facades\Http;

class TiketController extends Controller
{
    public function __construct(
        protected PegawaiService $pegawaiService
    ) {}

    public function index(Request $request)
    {
        $bidang = Bidang::all();

        $bidangId = $request->bidang;
        $start = $request->start_date;
        $end = $request->end_date;

        $tiket = collect();

        $pegawaiList = [];

        if ($bidangId && $start && $end) {

            $tiket = Regtiket::with([
                'layanan',
                'tahapTerakhir.statusRel'
            ])
                ->whereHas('layanan', function ($query) use ($bidangId) {
                    $query->where('kode_bidang', $bidangId);
                })
                ->whereBetween('tanggal', [$start, $end])
                ->orderBy('tanggal', 'desc')
                ->get();

            $pegawaiList = $this->pegawaiService->getPegawaiByNips(
                $tiket->pluck('nip')
            );
        }

        return view('pages.all.layanan.index', compact(
            'tiket',
            'bidang',
            'bidangId',
            'start',
            'end',
            'pegawaiList'
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

        $pegawaiList = $this->pegawaiService->getPegawaiByNips(
            $tiket->pluck('nip')
        );

        return view('pages.admin-bawah.tiket.index', compact(
            'tiket',
            'year',
            'diambil',
            'pegawaiList'
        ));
    }

    private function generateNoTiket()
    {
        return now()->format('dmy') . strtoupper(Str::random(4));
    }

    private function generateQr($url)
    {
        $renderer = new ImageRenderer(
            new RendererStyle(120),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);

        $qrString = $writer->writeString($url);

        return base64_encode($qrString);
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

        $qr = null;

        if ($step == 4 && isset($data['no_tiket'])) {

            $tiket = Regtiket::with('layanan')->find($data['no_tiket']);

            if ($tiket) {

                $url = route('tiket.public', $tiket->no_tiket);

                $renderer = new ImageRenderer(
                    new RendererStyle(120),
                    new SvgImageBackEnd()
                );

                $writer = new Writer($renderer);

                $qrString = $writer->writeString($url);

                $qr = base64_encode($qrString);
            }
        }

        return view('pages.opd.tiket.create', compact(
            'step',
            'bidang',
            'data',
            'syarat',
            'nama_layanan',
            'tiket',
            'qr'
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

            // GET API
            $pegawaiService = app(PegawaiService::class);

            $pegawai = $pegawaiService->getPegawaiByNip($request->nip);

            if (!$pegawai) {
                return back()->with(
                    'error',
                    'Data pegawai tidak ditemukan.'
                );
            }

            if (($pegawai['kode_opd'] ?? null) != Auth::user()->kode_ukerja) {

                return back()->with(
                    'error',
                    'Pegawai yang dipilih bukan berasal dari OPD Anda.'
                );
            }

            session([
                'pengajuan.nip' => $request->nip,
                'pengajuan.email' => $request->email,
                'pengajuan.started_at' => now(),

                // DATA API
                'pengajuan.nama' => $pegawai['nama_lengkap'] ?? null,
                'pengajuan.kode_opd' => $pegawai['kode_opd'] ?? null,
                'pengajuan.foto' => $pegawai['foto_url'] ?? null,
                'pengajuan.ket_gol' => $pegawai['ket_gol'] ?? null,
                'pengajuan.unit' => $pegawai['ket_ukerja'] ?? null,
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

            $dataSession = session('pengajuan');

            $existing = Regtiket::where('nip', $dataSession['nip'])
                ->where('kode_layanan', $request->layanan_id)
                ->where('archives', 0)
                ->exists();

            if ($existing) {

                return back()
                    ->withInput()
                    ->with(
                        'warning',
                        'Data pengajuan dengan NIP dan layanan yang sama masih dalam proses.'
                    );
            }

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

                $regTiket = Regtiket::create([
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

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Menambah Tiket Baru ID: ' . $regTiket->no_tiket,
                    [],
                    $regTiket->toArray()
                );

                $syaratList = Syarat::where('kode_layanan', $data['layanan_id'])->get();

                foreach ($syaratList as $s) {
                    $detailTiket = DetailTiket::create([
                        'no_tiket' => $noTiket,
                        'id_syarat' => $s->id,
                        'status' => 1,
                        'comment' => null
                    ]);
                }

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Menambah Detail Tiket ID: ' . $detailTiket->no_tiket,
                    [],
                    $detailTiket->toArray()
                );

                $tahap = Tahap::create([
                    'no_tiket' => $noTiket,
                    'tanggal' => now(),
                    'status' => 20000,
                    'operator' => Auth::user()->username,
                    'comment' => '-'
                ]);

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Menambah Tahap Pertama Tiket ID: ' . $tahap->no_tiket,
                    [],
                    $detailTiket->toArray()
                );

                // Kirim Notifikasi
                $adminBawah = User::where('role_id', 2)->get();

                foreach ($adminBawah as $user) {
                    $user->notify(
                        new TiketNotification(
                            'Usulan Baru',
                            'No Tiket: ' . $regTiket->no_tiket .
                                ' usulan perlu diverifikasi.',
                            route('adminBawah.permintaan.reviewPermintaan', ['no_tiket' => $regTiket->no_tiket]),
                            $regTiket->no_tiket,
                            'usulan_baru'
                        )
                    );
                }

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

    public function getPegawai($nip, PegawaiService $pegawaiService)
    {
        $pegawai = $pegawaiService->getPegawaiByNip($nip);

        if (!$pegawai) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan'
            ]);
        }

        // VALIDASI OPD
        if (($pegawai['kode_opd'] ?? null) != Auth::user()->kode_ukerja) {

            return response()->json([
                'success' => false,
                'message' => 'Pegawai bukan berasal dari OPD Anda.'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $pegawai
        ]);
    }

    // public function getFotoPegawai($nip)
    // {
    //     try {

    //         $response = Http::withToken(env('API_TOKEN'))
    //             ->get(env('API_URL') . '/admin/pegawai/foto/' . $nip);

    //         if (!$response->successful()) {

    //             return response()->file(
    //                 public_path('templatepro/assets/img/demo/user-placeholder.svg')
    //             );
    //         }

    //         return response(
    //             $response->body(),
    //             200,
    //             [
    //                 'Content-Type' => $response->header('Content-Type')
    //             ]
    //         );
    //     } catch (\Exception $e) {

    //         return response()->file(
    //             public_path('templatepro/assets/img/demo/user-placeholder.svg')
    //         );
    //     }
    // }

    public function cetak($no_tiket)
    {
        $tiket = Regtiket::with('layanan')
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        $syarat = Syarat::where('kode_layanan', $tiket->kode_layanan)->get();

        $pegawai = $this->pegawaiService->getPegawaiByNip($tiket->nip);

        $data = session('pengajuan') ?? [
            'nama'      => $pegawai['nama_lengkap'] ?? '-',
            'ket_gol'   => $pegawai['ket_gol'] ?? '-',
            'unit'      => $pegawai['ket_ukerja'] ?? '-',
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

        $pegawaiList = [];

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

            $pegawaiList = $this->pegawaiService->getPegawaiByNips(
                $data->pluck('nip')
            );
        }

        return view('pages.opd.tiket.cetak', compact('data', 'pegawaiList'));
    }

    // CETAK ULANG TIKET ADMIN BAWAH
    public function formCetakAdminBawah(Request $request)
    {
        $keyword = $request->keyword;

        $data = collect();

        $pegawaiList = [];

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

            $pegawaiList = $this->pegawaiService->getPegawaiByNips(
                $data->pluck('nip')
            );
        }

        return view('pages.admin-bawah.tiket.cetak', compact('data', 'pegawaiList'));
    }

    // PINDAH DATA TIKET
    public function indexPindah(Request $request)
    {
        $keyword = $request->keyword;

        $data = collect();
        $pegawaiList = [];

        if ($keyword) {
            $data = Regtiket::with([
                'layanan',
                'tahapTerakhir.statusRel'
            ])
                ->where(function ($query) use ($keyword) {
                    $query->where('no_tiket', 'like', "%$keyword%");
                })->get();

            $pegawaiList = $this->pegawaiService->getPegawaiByNips(
                $data->pluck('nip')
            );
        }

        return view('pages.admin-bawah.pindah-tiket.index', compact('data', 'pegawaiList'));
    }

    public function editPindah($no_tiket)
    {
        $tiket = Regtiket::with('layanan')
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        $bidang = Bidang::all();

        $layanan = Layanan::where(
            'kode_bidang',
            $tiket->layanan->kode_bidang
        )->get();

        $syarat = Syarat::where(
            'kode_layanan',
            $tiket->kode_layanan
        )->get();

        return view(
            'pages.admin-bawah.pindah-tiket.edit',
            compact(
                'tiket',
                'bidang',
                'layanan',
                'syarat'
            )
        );
    }

    public function getLayananPindah($bidang)
    {
        return Layanan::where(
            'kode_bidang',
            $bidang
        )
            ->where('aktif', 1)
            ->get();
    }

    public function getSyaratPindah($layanan)
    {
        return Syarat::where(
            'kode_layanan',
            $layanan
        )->get();
    }

    public function updatePindah(Request $request, $no_tiket)
    {
        $request->validate([
            'kode_layanan' => 'required'
        ]);

        $jumlahSyarat = Syarat::where(
            'kode_layanan',
            $request->kode_layanan
        )->count();

        if (
            !isset($request->syarat_id) ||
            count($request->syarat_id) != $jumlahSyarat
        ) {
            return back()->with(
                'error',
                'Semua syarat wajib divalidasi.'
            );
        }

        DB::beginTransaction();

        try {

            $tiket = Regtiket::where(
                'no_tiket',
                $no_tiket
            )->firstOrFail();

            // simpan data layanan lama dan baru
            $layananLama = Layanan::with('bidang')
                ->where('kode_layanan', $tiket->kode_layanan)
                ->first();

            $layananBaru = Layanan::with('bidang')
                ->where('kode_layanan', $request->kode_layanan)
                ->first();

            $olddata = [
                'no_tiket' => $tiket->no_tiket,
                'kode_layanan' => $tiket->kode_layanan,
                'diperbaiki' => $tiket->diperbaiki,
                'diperbaiki_tgl' => $tiket->diperbaiki_tgl,
            ];

            $tiket->update([
                'kode_layanan' => $request->kode_layanan,
                'diperbaiki' => 1,
                'diperbaiki_tgl' => now(),
            ]);

            $newdata = [
                'no_tiket' => $tiket->fresh()->no_tiket,
                'kode_layanan' => $tiket->fresh()->kode_layanan,
                'diperbaiki' => $tiket->fresh()->diperbaiki,
                'diperbaiki_tgl' => $tiket->fresh()->diperbaiki_tgl,
            ];

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'UPDATE',
                'Update Pindah Layanan Tiket ID: ' . $tiket->no_tiket,
                $olddata,
                $newdata
            );

            // Delete Old Detail Tiket
            DetailTiket::where(
                'no_tiket',
                $no_tiket
            )->delete();


            foreach ($request->syarat_id ?? [] as $idSyarat) {

                $detailTiket = DetailTiket::create([
                    'no_tiket' => $no_tiket,
                    'id_syarat' => $idSyarat,
                    'status' => 1,
                    'comment' => null
                ]);

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Menambah Detail Tiket ID: ' . $detailTiket->no_tiket,
                    [],
                    $detailTiket->toArray()
                );
            }

            $tahap = Tahap::create([
                'no_tiket' => $no_tiket,
                'tanggal' => now(),
                'status' => 20000, // sesuaikan
                'operator' => Auth::user()->username,
                'comment' => 'Layanan tiket dipindahkan'
            ]);

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'CREATE',
                'Menambah Tahap Tiket ID: ' . $tahap->no_tiket,
                [],
                $tahap->toArray()
            );

            // Notifkasi ke Admin OPD
            $adminOpd = User::where('role_id', 3)
                ->where('kode_ukerja', $tiket->kode_ukerja)
                ->get();

            foreach ($adminOpd as $user) {

                $user->notify(
                    new TiketNotification(
                        'Layanan Dipindahkan',
                        'No Tiket: ' . $tiket->no_tiket .
                            ' telah dipindahkan ke layanan lain dan sedang diproses.',
                        route('adminOpd.tiket.indexProses'),
                        $tiket->no_tiket,
                        'pindah_layanan'
                    )
                );
            }

            // Notifikasi ke Admin Bidang
            if (
                $layananLama &&
                $layananBaru &&
                $layananLama->kode_bidang != $layananBaru->kode_bidang
            ) {

                // BIDANG LAMA
                $adminBidangLama = User::where('role_id', 4)
                    ->where('bidang_id', $layananLama->kode_bidang)
                    ->get();

                foreach ($adminBidangLama as $user) {

                    $user->notify(
                        new TiketNotification(
                            'Tiket Dipindahkan',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' telah dipindahkan ke bidang lain.',
                            route('adminBidang.permintaan.index'),
                            $tiket->no_tiket,
                            'pindah_layanan'
                        )
                    );
                }

                // BIDANG BARU
                $adminBidangBaru = User::where('role_id', 4)
                    ->where('bidang_id', $layananBaru->kode_bidang)
                    ->get();

                foreach ($adminBidangBaru as $user) {

                    $user->notify(
                        new TiketNotification(
                            'Usulan Baru Hasil Pemindahan',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' dipindahkan ke layanan bidang anda dan perlu ditindaklanjuti.',
                            route(
                                'adminBidang.permintaan.editPermintaan',
                                ['no_tiket' => $tiket->no_tiket]
                            ),
                            $tiket->no_tiket
                        )
                    );
                }
            } else {

                // MASIH BIDANG YANG SAMA
                $adminBidang = User::where('role_id', 4)
                    ->where('bidang_id', $layananBaru->kode_bidang)
                    ->get();

                foreach ($adminBidang as $user) {

                    $user->notify(
                        new TiketNotification(
                            'Layanan Dipindahkan',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' dipindahkan ke layanan lain dalam bidang yang sama.',
                            route(
                                'adminBidang.permintaan.editPermintaan',
                                ['no_tiket' => $tiket->no_tiket]
                            ),
                            $tiket->no_tiket
                        )
                    );
                }
            }

            DB::commit();

            return redirect()
                ->route('adminBawah.pindah.indexPindah')->with('success', 'Data tiket berhasil dipindahkan.');
        } catch (\Exception $e) {

            DB::rollBack();

            return back()
                ->with(
                    'error',
                    $e->getMessage()
                );
        }
    }

    public function showQr($no_tiket)
    {
        $tiket = Regtiket::findOrFail($no_tiket);

        $url = route('tiket.public', $tiket->no_tiket);

        $qr = $this->generateQr($url);

        return view('pages.public.qr', compact(
            'qr',
            'tiket'
        ));
    }
}
