<?php

namespace App\Http\Controllers;

use App\Models\DetailTiket;
use App\Models\Regtiket;
use App\Models\Status;
use App\Models\Tahap;
use App\Models\User;
use App\Notifications\TiketNotification;
use App\Services\ActivityLogService;
use App\Services\KelengkapanService;
use App\Services\PegawaiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PermintaanController extends Controller
{
    public function __construct(
        protected PegawaiService $pegawaiService,
        protected KelengkapanService $kelengkapanService
    ) {}

    public function index(Request $request)
    {
        $month = $request->month ?? Carbon::now()->month;
        $year = $request->year ?? Carbon::now()->year;

        $user = Auth::user();

        $tiket = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ])
            ->whereMonth('tanggal', $month)
            ->whereYear('tanggal', $year)
            ->has('tahap', '>', 1)
            ->has('detail')

            // FILTER BIDANG USER LOGIN
            ->whereHas('layanan', function ($q) use ($user) {
                $q->where('kode_bidang', $user->bidang_id);
            })

            ->orderByDesc('tanggal')
            ->get();

        return view('pages.bidang.permintaan.index', compact(
            'tiket',
            'month',
            'year'
        ));
    }

    private function generateQr($url)
    {
        $renderer = new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(120),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
        );

        $writer = new \BaconQrCode\Writer($renderer);

        return base64_encode(
            $writer->writeString($url)
        );
    }

    public function editPermintaan($no_tiket)
    {
        $user = Auth::user();

        $tiket = Regtiket::with([
            'layanan.bidang'
        ])
            ->where('no_tiket', $no_tiket)
            ->whereHas('layanan', function ($query) use ($user) {
                $query->where(
                    'kode_bidang',
                    $user->bidang_id
                );
            })
            ->firstOrFail();


        /*
     * ========================================================
     * DETAIL TIKET
     * ========================================================
     */

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();


        /*
     * ========================================================
     * DATA PEGAWAI
     * ========================================================
     */

        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($tiket->nip);

        $dataPegawai = [
            'nama' =>
            $tiket->nama ?? '-',

            'golongan' =>
            $pegawai['ket_gol'] ?? '-',

            'unit' =>
            $tiket->nama_ukerja ?? '-',
        ];


        /*
     * ========================================================
     * DATA DOKUMEN REVIEW
     * ========================================================
     */

        foreach ($detail as $d) {

            $syarat = $d->syarat;


            /*
         * ----------------------------------------------------
         * SYARAT TIDAK DITEMUKAN
         * ----------------------------------------------------
         */

            if (!$syarat) {

                $d->dokumen_review = [
                    'metode' => null,
                    'kode_efile' => null,
                    'tersedia' => false,
                    'nama' => null,
                    'url' => null,
                    'dokumen' => [],
                ];

                continue;
            }


            /*
         * ----------------------------------------------------
         * CEK FILE MANUAL
         * ----------------------------------------------------
         *
         * Ini berlaku untuk:
         *
         * - metode upload
         * - metode simpeg tetapi kemudian
         *   ada file manual hasil perbaikan.
         */

            $disk = \Illuminate\Support\Facades\Storage::disk(
                'pilkb_efile'
            );

            $fileManualTersedia =
                !empty($d->file_path) &&
                $disk->exists($d->file_path);


            /*
         * ----------------------------------------------------
         * FILE MANUAL TERSEDIA
         * ----------------------------------------------------
         */

            if ($fileManualTersedia) {

                $urlManual = route(
                    'adminBidang.permintaan.dokumen',
                    [
                        'id' => $d->id
                    ]
                );

                $namaManual =
                    $d->file_name ?? 'Dokumen';

                $d->dokumen_review = [

                    'metode' =>
                    'upload',

                    'kode_efile' =>
                    $syarat->kode_efile,

                    'tersedia' =>
                    true,

                    'nama' =>
                    $namaManual,

                    'url' =>
                    $urlManual,

                    'dokumen' => [
                        [
                            'nama' =>
                            $namaManual,

                            'url' =>
                            $urlManual,

                            'tanggal' =>
                            $d->uploaded_at
                                ? $d->uploaded_at
                                ->format('d/m/Y H:i')
                                : null,

                            'urutan' =>
                            null,

                            'status' =>
                            'upload',

                            'ref_table' =>
                            null,

                            'sumber' =>
                            'upload',

                            'raw' =>
                            null,
                        ]
                    ],
                ];

                continue;
            }


            /*
         * ----------------------------------------------------
         * METODE SIMPEG
         * ----------------------------------------------------
         */

            if ($syarat->metode === 'simpeg') {

                $hasil =
                    $this->kelengkapanService
                    ->getSyaratDokumen(
                        $tiket->nip,
                        $syarat
                    );

                $dokumen =
                    $hasil['dokumen'] ?? [];


                /*
             * FORMAT DATA SIMPEG
             */

                $dokumenTerformat = collect($dokumen)
                    ->map(function ($item) {

                        return [

                            'nama' =>
                            $item['nama_file']
                                ?? $item['nama']
                                ?? $item['file_name']
                                ?? $item['nama_dokumen']
                                ?? 'Dokumen',

                            'url' =>
                            $item['preview_url']
                                ?? $item['url']
                                ?? null,

                            'tanggal' =>
                            $item['tanggal']
                                ?? $item['created_at']
                                ?? $item['tgl_dokumen']
                                ?? null,

                            'urutan' =>
                            $item['urutan']
                                ?? null,

                            'status' =>
                            $item['status']
                                ?? null,

                            'ref_table' =>
                            $item['ref_table']
                                ?? null,

                            'sumber' =>
                            'simpeg',

                            'raw' =>
                            $item,
                        ];
                    })
                    ->sortByDesc(function ($item) {

                        return (int) (
                            $item['urutan'] ?? 0
                        );
                    })
                    ->values()
                    ->all();


                /*
             * DATA UNTUK BLADE
             */

                $d->dokumen_review = [

                    'metode' =>
                    'simpeg',

                    'kode_efile' =>
                    $syarat->kode_efile,

                    'tersedia' =>
                    count($dokumenTerformat) > 0,

                    'nama' =>
                    $dokumenTerformat[0]['nama']
                        ?? null,

                    'url' =>
                    $dokumenTerformat[0]['url']
                        ?? null,

                    'dokumen' =>
                    $dokumenTerformat,
                ];

                continue;
            }


            /*
         * ----------------------------------------------------
         * METODE UPLOAD TANPA FILE
         * ----------------------------------------------------
         */

            if ($syarat->metode === 'upload') {

                $d->dokumen_review = [

                    'metode' =>
                    'upload',

                    'kode_efile' =>
                    null,

                    'tersedia' =>
                    false,

                    'nama' =>
                    null,

                    'url' =>
                    null,

                    'dokumen' =>
                    [],
                ];

                continue;
            }


            /*
         * ----------------------------------------------------
         * METODE TIDAK DIKENAL
         * ----------------------------------------------------
         */

            $d->dokumen_review = [

                'metode' =>
                $syarat->metode,

                'kode_efile' =>
                $syarat->kode_efile,

                'tersedia' =>
                false,

                'nama' =>
                null,

                'url' =>
                null,

                'dokumen' =>
                [],
            ];
        }


        /*
     * ========================================================
     * QR TIKET
     * ========================================================
     */

        $url = route(
            'tiket.public',
            [
                'no_tiket' =>
                $tiket->no_tiket
            ]
        );

        /*
     * Kalau generateQr belum ada di PermintaanController,
     * tambahkan private function generateQr() yang sama
     * seperti DetailTiketController.
     */

        $qr = $this->generateQr($url);


        return view(
            'pages.bidang.permintaan.edit',
            [
                'tiket' =>
                $tiket,

                'detail' =>
                $detail,

                'dataPegawai' =>
                $dataPegawai,

                'statusList' =>
                Status::where(
                    'kode_layanan',
                    $tiket->kode_layanan
                )->get(),

                'qr' =>
                $qr,
            ]
        );
    }

    public function updatePermintaan(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            $request->validate([
                'status_tahap' => 'required'
            ]);

            $detailList = DetailTiket::where(
                'no_tiket',
                $no_tiket
            )->get();

            $semuaValid = true;

            foreach ($detailList as $detail) {
                $checked = isset($request->status[$detail->id]);

                if ($checked) {

                    $detail->update([
                        'status' => 1,
                        'comment' => null
                    ]);
                } else {
                    $detail->update([
                        'status' => 2,
                        'comment' => $request->comment[$detail->id] ?? null
                    ]);

                    $semuaValid = false;
                }
            }

            // Get Data Tiket
            $tiket = Regtiket::with('layanan')
                ->where('no_tiket', $no_tiket)
                ->firstOrFail();

            $tahap = Tahap::create([
                'no_tiket' => $no_tiket,
                'tanggal' => now(),

                'status' => $request->status_tahap,

                'operator' => Auth::user()->username,
                'comment' => $request->catatan ?? '-'
            ]);

            Regtiket::where('no_tiket', $no_tiket)
                ->update([
                    'data_baru' => 0,
                    'diperbaiki_tgl' => now()
                ]);

            DB::commit();

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'CREATE',
                'Submit Review Tiket',
                [],
                $tahap->toArray()
            );

            // Get Tiket
            $tiket = Regtiket::where('no_tiket', $no_tiket)
                ->firstOrFail();

            // Kirim Notifikasi ke Admin OPD
            $adminOpd = User::where('role_id', 3)
                ->where('kode_ukerja', $tiket->kode_ukerja)
                ->get();

            foreach ($adminOpd as $user) {

                if ($semuaValid) {
                    $user->notify(
                        new TiketNotification(
                            'Status Usulan Diperbarui',
                            'No Tiket: ' . $tahap->no_tiket .
                                ' status sudah diperbarui menjadi ' .
                                $tahap->statusRel->status,
                            route('adminOpd.tiket.indexProses'),
                            $tahap->no_tiket,
                            'status_update'
                        )
                    );
                } else {
                    $user->notify(
                        new TiketNotification(
                            'Berkas Tidak Lengkap',
                            'No Tiket: ' . $tahap->no_tiket .
                                ' memerlukan perbaikan dokumen.',
                            route(
                                'adminOpd.perbaikan.index',
                            ),
                            $tahap->no_tiket,
                            'berkas_tidak_lengkap'
                        )
                    );
                }
            }

            return redirect()
                ->route('adminBidang.permintaan.index')
                ->with('success', 'Review berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with(
                'error',
                $e->getMessage()
            );
        }
    }

    public function selesaiPermintaan($no_tiket)
    {
        try {
            $tiket = Regtiket::where(
                'no_tiket',
                $no_tiket
            )->firstOrFail();

            $olddata = [
                'archives' => $tiket->archives,
            ];

            $tiket->update([
                'archives' => 1,
                'operator_archives' => Auth::user()->username
            ]);

            $newdata = [
                'archives' => $tiket->fresh()->archives,
            ];

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'UPDATE',
                'Submit Proses Selesai Tiket',
                $olddata,
                $newdata
            );

            $adminOpd = User::where('role_id', 3)
                ->where('kode_ukerja', $tiket->kode_ukerja)
                ->get();

            foreach ($adminOpd as $user) {

                $user->notify(
                    new TiketNotification(
                        'Usulan Selesai Diproses',
                        'No Tiket: ' . $tiket->no_tiket .
                            ' telah selesai diproses.',
                        route('adminOpd.tiket.indexProses'),
                        $tiket->no_tiket,
                        'selesai'
                    )
                );
            }

            return redirect()
                ->route('adminBidang.permintaan.index')
                ->with('success', 'Pengajuan Layanan berhasil diselesaikan.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function viewDokumen($id)
    {
        /*
     * ========================================================
     * AMBIL DETAIL TIKET
     * ========================================================
     */

        $detail = DetailTiket::with([
            'regtiket.layanan'
        ])
            ->where('id', $id)
            ->firstOrFail();


        /*
     * ========================================================
     * PASTIKAN USER ADMIN BIDANG
     * ========================================================
     */

        if (Auth::user()->role_id != 4) {
            abort(403);
        }


        /*
     * ========================================================
     * PASTIKAN TIKET MILIK BIDANG USER LOGIN
     * ========================================================
     *
     * Relasi:
     *
     * tb_reg_tiket
     *     kode_layanan
     *
     * tb_layanan
     *     kode_bidang
     *
     * User:
     *     bidang_id
     */

        $kodeBidangUser = Auth::user()->bidang_id;

        if (
            !$detail->regtiket ||
            !$detail->regtiket->layanan ||
            $detail->regtiket->layanan->kode_bidang != $kodeBidangUser
        ) {
            abort(403);
        }


        /*
     * ========================================================
     * PASTIKAN FILE TERSEDIA DI DATABASE
     * ========================================================
     */

        if (empty($detail->file_path)) {
            abort(
                404,
                'Dokumen belum tersedia.'
            );
        }


        /*
     * ========================================================
     * GUNAKAN DISK E-FILE PILKB
     * ========================================================
     */

        $disk = \Illuminate\Support\Facades\Storage::disk(
            'pilkb_efile'
        );


        /*
     * ========================================================
     * PASTIKAN FILE FISIK ADA
     * ========================================================
     */

        if (!$disk->exists($detail->file_path)) {
            abort(
                404,
                'File dokumen tidak ditemukan.'
            );
        }


        /*
     * ========================================================
     * AMBIL PATH FISIK
     * ========================================================
     */

        $path = $disk->path(
            $detail->file_path
        );


        /*
     * ========================================================
     * TAMPILKAN FILE PDF
     * ========================================================
     *
     * Tidak menggunakan response()->download()
     * karena dokumen ingin ditampilkan di browser/PDF viewer.
     */

        return response()->file(
            $path,
            [
                'Content-Type' =>
                'application/pdf',

                'Content-Disposition' =>
                'inline; filename="' .
                    ($detail->file_name ?? 'dokumen.pdf') .
                    '"',

                /*
             * Jangan gunakan cache.
             *
             * Karena file dengan ID detail yang sama
             * bisa diganti ketika dilakukan perbaikan.
             */

                'Cache-Control' =>
                'no-store, no-cache, must-revalidate, max-age=0',

                'Pragma' =>
                'no-cache',

                'Expires' =>
                '0',
            ]
        );
    }
}
