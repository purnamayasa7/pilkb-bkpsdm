<?php

namespace App\Http\Controllers;

use App\Exports\ListPerbaikanUsulanExport;
use App\Models\DetailTiket;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\Tahap;
use App\Models\User;
use App\Notifications\TiketNotification;
use App\Services\ActivityLogService;
use App\Services\KelengkapanService;
use App\Services\PegawaiService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class DetailTiketController extends Controller
{
    public function __construct(
        protected PegawaiService $pegawaiService,
        protected KelengkapanService $kelengkapanService
    ) {}

    private function getData($request, $isAdminBawah = false)
    {
        $query = Regtiket::with([
            'layanan',
            'tahap'
        ])
            ->where(function ($query) {

                $query->whereHas('detail', function ($q) {
                    $q->where('status', 2);
                })
                    ->orWhere(function ($q) {
                        $q->where('diperbaiki', 1)
                            ->whereHas('detail', function ($q) {
                                $q->whereNull('status');
                            });
                    });
            });

        if (!$isAdminBawah) {
            $query->where(
                'kode_ukerja',
                Auth::user()->kode_ukerja
            );
        }

        if ($isAdminBawah) {
            $query->has('tahap', '>', 1);
        }

        if ($request->filled('layanan') && $request->layanan !== 'all') {
            $query->where(
                'kode_layanan',
                $request->layanan
            );
        }

        if ($request->filled('btl')) {
            $query->whereHas('detail', function ($q) {
                $q->where('status', 2);
            });
        }

        return $query
            ->withCount([
                'detail as jumlah_btl' => function ($q) {
                    $q->where('status', 2);
                },

                'tahap as jumlah_tahap'
            ])
            ->withExists([
                'detail as is_belum' => function ($q) {
                    $q->where('status', 2);
                }
            ])
            ->orderByDesc('tanggal')
            ->get();
    }

    // Index Admin OPD
    public function index(Request $request)
    {
        $data = $this->getData($request);

        return view('pages.opd.perbaikan.index', [
            'data' => $data,

            'layananList' => Layanan::where('aktif', 1)
                ->orderBy('nama_layanan')
                ->get(),
        ]);
    }

    // Index Admin Bawah - Sudah selesai
    public function indexAdminBawah(Request $request)
    {
        $data = $this->getData($request, true);

        return view('pages.admin-bawah.perbaikan.index', [
            'data' => $data,

            'layananList' => Layanan::where('aktif', 1)
                ->orderBy('nama_layanan')
                ->get(),
        ]);
    }

    // Generate QR
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

    // Index Daftar Penerimaan Layanan
    public function indexPermintaan(Request $request)
    {
        $query = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            // HANYA TAHAP 1
            ->has('tahap', '=', 1);

        // FILTER LAYANAN
        if ($request->filled('layanan')) {
            $query->where(
                'kode_layanan',
                $request->layanan
            );
        }

        $tiket = $query
            ->orderByDesc('tanggal')
            ->get();

        return view('pages.admin-bawah.registrasi.index', [
            'tiket' => $tiket,
            'layananList' => Layanan::where('aktif', 1)->get(),
        ]);
    }

    // Tampil Review - Backup
    // public function review($no_tiket)
    // {
    //     $tiket = Regtiket::with(['layanan.bidang'])
    //         ->where('no_tiket', $no_tiket)
    //         ->firstOrFail();

    //     $detail = DetailTiket::with('syarat')
    //         ->where('no_tiket', $no_tiket)
    //         ->get();

    //     $pegawai = $this->pegawaiService->getPegawaiByNip($tiket->nip);

    //     $dataPegawai = [
    //         'nama'     => $tiket->nama ?? '-',
    //         'golongan' => $pegawai['ket_gol'] ?? '-',
    //         'unit'     => $tiket->nama_ukerja ?? '-',
    //     ];

    //     return view('pages.admin-bawah.perbaikan.edit', [
    //         'tiket' => $tiket,
    //         'detail' => $detail,
    //         'dataPegawai' => $dataPegawai
    //     ]);
    // }

    // Tampil Review Perbaikan Admin Bawah
    public function review($no_tiket)
    {
        /*
    |--------------------------------------------------------------------------
    | DATA TIKET
    |--------------------------------------------------------------------------
    */

        $tiket = Regtiket::with([
            'layanan.bidang'
        ])
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();


        /*
    |--------------------------------------------------------------------------
    | DETAIL SYARAT
    |--------------------------------------------------------------------------
    */

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();


        /*
    |--------------------------------------------------------------------------
    | DATA PEGAWAI
    |--------------------------------------------------------------------------
    */

        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($tiket->nip);

        $dataPegawai = [
            'nama'     => $tiket->nama ?? '-',
            'golongan' => $pegawai['ket_gol'] ?? '-',
            'unit'     => $tiket->nama_ukerja ?? '-',
        ];


        /*
    |--------------------------------------------------------------------------
    | DATA DOKUMEN REVIEW
    |--------------------------------------------------------------------------
    |
    | Tidak menggunakan mode_efile.
    |
    | upload :
    |   mengambil file dari tb_det_tiket
    |
    | simpeg :
    |   mengambil seluruh riwayat e-file dari SIMPEG
    |
    */

        foreach ($detail as $d) {

            $syarat = $d->syarat;


            /*
        |--------------------------------------------------------------------------
        | SYARAT TIDAK DITEMUKAN
        |--------------------------------------------------------------------------
        */

            if (!$syarat) {

                $d->dokumen_review = [
                    'metode'     => null,
                    'kode_efile' => null,
                    'tersedia'   => false,
                    'nama'       => null,
                    'url'        => null,
                    'dokumen'    => [],
                ];

                continue;
            }


            /*
        |--------------------------------------------------------------------------
        | METODE UPLOAD
        |--------------------------------------------------------------------------
        */

            if ($syarat->metode === 'upload') {

                $tersedia = !empty($d->file_path);

                $d->dokumen_review = [

                    'metode' =>
                    'upload',

                    'kode_efile' =>
                    null,

                    'tersedia' =>
                    $tersedia,

                    'nama' =>
                    $tersedia
                        ? ($d->file_name ?? 'Dokumen')
                        : null,

                    'url' =>
                    $tersedia
                        ? route(
                            'adminBawah.permintaan.dokumen',
                            ['id' => $d->id]
                        )
                        : null,

                    'dokumen' =>
                    $tersedia
                        ? [
                            [
                                'nama' =>
                                $d->file_name
                                    ?? 'Dokumen',

                                'url' =>
                                route(
                                    'adminBawah.permintaan.dokumen',
                                    ['id' => $d->id]
                                ),

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
                        ]
                        : [],
                ];

                continue;
            }


            /*
        |--------------------------------------------------------------------------
        | METODE SIMPEG
        |--------------------------------------------------------------------------
        */

            if ($syarat->metode === 'simpeg') {

                /*
            |--------------------------------------------------------------------------
            | CEK FILE MANUAL
            |--------------------------------------------------------------------------
            |
            | Jika metode simpeg tetapi ternyata ada file manual
            | yang tersimpan pada tiket, gunakan file manual tersebut.
            |
            */

                $fileManualTersedia =
                    !empty($d->file_path);


                if ($fileManualTersedia) {

                    $urlManual = route(
                        'adminBawah.permintaan.dokumen',
                        ['id' => $d->id]
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

                        'dokumen' =>
                        [
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
            |--------------------------------------------------------------------------
            | AMBIL E-FILE DARI SIMPEG
            |--------------------------------------------------------------------------
            */

                $hasil = $this->kelengkapanService
                    ->getSyaratDokumen(
                        $tiket->nip,
                        $syarat
                    );

                $dokumen =
                    $hasil['dokumen'] ?? [];


                /*
            |--------------------------------------------------------------------------
            | FORMAT DOKUMEN SIMPEG
            |--------------------------------------------------------------------------
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
            |--------------------------------------------------------------------------
            | SIMPAN KE OBJECT DETAIL
            |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | METODE TIDAK DIKENAL
        |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | QR TIKET
    |--------------------------------------------------------------------------
    */

        $url = route(
            'tiket.public',
            [
                'no_tiket' =>
                $tiket->no_tiket
            ]
        );

        $qr = $this->generateQr($url);


        /*
    |--------------------------------------------------------------------------
    | VIEW
    |--------------------------------------------------------------------------
    */

        return view(
            'pages.admin-bawah.perbaikan.edit',
            [
                'tiket' =>
                $tiket,

                'detail' =>
                $detail,

                'dataPegawai' =>
                $dataPegawai,

                'qr' =>
                $qr,
            ]
        );
    }

    // Tampil Review Permintaan Admin Bawah
    public function reviewPermintaan($no_tiket)
    {
        $tiket = Regtiket::with(['layanan.bidang'])
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();

        /*
    |--------------------------------------------------------------------------
    | DATA PEGAWAI
    |--------------------------------------------------------------------------
    */

        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($tiket->nip);

        $dataPegawai = [
            'nama'     => $tiket->nama ?? '-',
            'golongan' => $pegawai['ket_gol'] ?? '-',
            'unit'     => $tiket->nama_ukerja ?? '-',
        ];

        /*
    |--------------------------------------------------------------------------
    | DATA DOKUMEN REVIEW
    |--------------------------------------------------------------------------
    |
    | Tidak menggunakan mode_efile.
    |
    | upload :
    |   mengambil file dari tb_det_tiket
    |
    | simpeg :
    |   mengambil seluruh riwayat e-file dari SIMPEG
    |
    */

        foreach ($detail as $d) {

            $syarat = $d->syarat;

            /*
    |--------------------------------------------------------------------------
    | SYARAT TIDAK DITEMUKAN
    |--------------------------------------------------------------------------
    */

            if (!$syarat) {

                $d->dokumen_review = [
                    'metode'     => null,
                    'kode_efile' => null,
                    'tersedia'   => false,
                    'nama'       => null,
                    'url'        => null,
                    'dokumen'    => [],
                ];

                continue;
            }


            /*
    |--------------------------------------------------------------------------
    | METODE UPLOAD
    |--------------------------------------------------------------------------
    */

            if ($syarat->metode === 'upload') {

                $tersedia = !empty($d->file_path);

                $d->dokumen_review = [
                    'metode'     => 'upload',
                    'kode_efile' => null,
                    'tersedia'   => $tersedia,

                    'nama' => $tersedia
                        ? ($d->file_name ?? 'Dokumen')
                        : null,

                    'url' => $tersedia
                        ? route(
                            'adminBawah.permintaan.dokumen',
                            ['id' => $d->id]
                        )
                        : null,

                    'dokumen' => $tersedia
                        ? [
                            [
                                'nama' => $d->file_name ?? 'Dokumen',

                                'url' => route(
                                    'adminBawah.permintaan.dokumen',
                                    ['id' => $d->id]
                                ),

                                'tanggal' => $d->uploaded_at
                                    ? $d->uploaded_at->format('d/m/Y H:i')
                                    : null,

                                'urutan' => null,

                                'raw' => null,
                            ]
                        ]
                        : [],
                ];

                continue;
            }


            /*
|--------------------------------------------------------------------------
| METODE SIMPEG
|--------------------------------------------------------------------------
|
| Sumber dokumen:
|
| 1. Jika file manual sudah di-upload ke tb_det_tiket
|    -> gunakan file manual tersebut.
|
| 2. Jika belum ada file manual
|    -> ambil seluruh riwayat e-file dari SIMPEG.
|
| Tidak menggunakan mode_efile.
|--------------------------------------------------------------------------
*/

            if ($syarat->metode === 'simpeg') {

                /*
    |--------------------------------------------------------------------------
    | CEK FILE MANUAL PADA TIKET
    |--------------------------------------------------------------------------
    |
    | Syarat metode simpeg tetap dapat memiliki file manual
    | apabila e-file SIMPEG tidak tersedia.
    |
    */

                $fileManualTersedia = !empty($d->file_path);


                /*
    |--------------------------------------------------------------------------
    | JIKA FILE MANUAL SUDAH ADA
    |--------------------------------------------------------------------------
    |
    | File yang di-upload pada tiket adalah dokumen yang digunakan
    | untuk proses review.
    |
    */

                if ($fileManualTersedia) {

                    $urlManual = route(
                        'adminBawah.permintaan.dokumen',
                        ['id' => $d->id]
                    );

                    $namaManual = $d->file_name
                        ?? 'Dokumen';

                    $d->dokumen_review = [

                        'metode' => 'upload',

                        'kode_efile' =>
                        $syarat->kode_efile,

                        'tersedia' => true,

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
                                    ? $d->uploaded_at->format('d/m/Y H:i')
                                    : null,

                                'urutan' => null,

                                'status' => 'upload',

                                'ref_table' => null,

                                'sumber' => 'upload',

                                'raw' => null,
                            ]
                        ],
                    ];

                    continue;
                }


                /*
    |--------------------------------------------------------------------------
    | BELUM ADA FILE MANUAL
    |--------------------------------------------------------------------------
    |
    | Baru kemudian mengambil dokumen dari SIMPEG.
    |
    */

                $hasil = $this->kelengkapanService
                    ->getSyaratDokumen(
                        $tiket->nip,
                        $syarat
                    );

                $dokumen = $hasil['dokumen'] ?? [];


                /*
    |--------------------------------------------------------------------------
    | FORMAT DATA SIMPEG
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | DATA UNTUK BLADE
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | METODE TIDAK DIKENAL
    |--------------------------------------------------------------------------
    */

            $d->dokumen_review = [
                'metode'     => $syarat->metode,
                'kode_efile' => $syarat->kode_efile,
                'tersedia'   => false,
                'nama'       => null,
                'url'        => null,
                'dokumen'    => [],
            ];
        }

        /*
    |--------------------------------------------------------------------------
    | QR TIKET
    |--------------------------------------------------------------------------
    */

        $url = route('tiket.public', [
            'no_tiket' => $tiket->no_tiket
        ]);

        $qr = $this->generateQr($url);

        return view('pages.admin-bawah.registrasi.edit', [
            'tiket'       => $tiket,
            'detail'      => $detail,
            'dataPegawai' => $dataPegawai,
            'qr'          => $qr,
        ]);
    }

    public function viewDokumen($id)
    {
        $detail = DetailTiket::with('regtiket')
            ->where('id', $id)
            ->firstOrFail();

        /*
    |--------------------------------------------------------------------------
    | CEK HAK AKSES ADMIN OPD
    |--------------------------------------------------------------------------
    */

        if (
            Auth::user()->role_id == 3 &&
            $detail->regtiket?->kode_ukerja !== Auth::user()->kode_ukerja
        ) {
            abort(403);
        }

        /*
    |--------------------------------------------------------------------------
    | PASTIKAN FILE TERSEDIA DI DATABASE
    |--------------------------------------------------------------------------
    */

        if (empty($detail->file_path)) {
            abort(404, 'Dokumen belum tersedia.');
        }

        /*
    |--------------------------------------------------------------------------
    | LOKASI FISIK E-FILE
    |--------------------------------------------------------------------------
    |
    | File disimpan langsung:
    |
    | D:\efile-pilkb\{no_tiket}\{file}
    |
    */

        $basePath = 'D:\\efile-pilkb';

        $path = $basePath . DIRECTORY_SEPARATOR .
            str_replace(
                ['/', '\\'],
                DIRECTORY_SEPARATOR,
                $detail->file_path
            );

        /*
    |--------------------------------------------------------------------------
    | CEK FILE FISIK
    |--------------------------------------------------------------------------
    */

        if (!is_file($path)) {
            abort(
                404,
                'File dokumen tidak ditemukan: ' . $path
            );
        }

        /*
    |--------------------------------------------------------------------------
    | TAMPILKAN PDF
    |--------------------------------------------------------------------------
    |
    | PENTING:
    | Jangan izinkan browser/PDF viewer menggunakan cache
    | karena URL dokumen berdasarkan ID detail tetap sama
    | walaupun file fisiknya sudah diganti.
    |
    */

        return response()->file(
            $path,
            [
                'Content-Type' => 'application/pdf',

                'Content-Disposition' =>
                'inline; filename="' .
                    ($detail->file_name ?? 'dokumen.pdf') .
                    '"',

                'Cache-Control' =>
                'no-store, no-cache, must-revalidate, max-age=0',

                'Pragma' =>
                'no-cache',

                'Expires' =>
                '0',
            ]
        );
    }

    // Simpan review - Backup
    // public function submitReview(Request $request, $no_tiket)
    // {
    //     DB::beginTransaction();

    //     try {

    //         $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();

    //         // DATA TIKET UNTUK NOTIFIKASI
    //         $tiket = Regtiket::with('layanan')
    //             ->where('no_tiket', $no_tiket)
    //             ->firstOrFail();

    //         $semuaValid = true;

    //         foreach ($detailList as $detail) {
    //             // if checkbox checked
    //             $checked = isset($request->status[$detail->id]);

    //             if ($checked) {

    //                 $detail->update([
    //                     'status' => 1,
    //                     'comment' => null
    //                 ]);
    //             } else {

    //                 $semuaValid = false;

    //                 $detail->update([
    //                     'status' => 2,
    //                     'comment' => $request->comment[$detail->id] ?? null
    //                 ]);
    //             }
    //         }

    //         if ($semuaValid) {

    //             $tahap = Tahap::create([
    //                 'no_tiket' => $no_tiket,
    //                 'tanggal' => now(),
    //                 'status' => 20000,
    //                 'operator' => Auth::user()->username,
    //                 'comment' => 'Berkas Sudah Diterima BKPSDM'
    //             ]);

    //             // Notifikasi ke Admin OPD
    //             $adminOpd = User::where('role_id', 3)
    //                 ->where('kode_ukerja', $tiket->kode_ukerja)
    //                 ->get();

    //             foreach ($adminOpd as $user) {

    //                 $user->notify(
    //                     new TiketNotification(
    //                         'Berkas Diterima BKPSDM',
    //                         'No Tiket ' . $tiket->no_tiket .
    //                             ' usulan telah diterima BKPSDM dan sedang diproses.',
    //                         route('adminOpd.tiket.indexProses'),
    //                         $tiket->no_tiket,
    //                         'berkas_diterima'
    //                     )
    //                 );
    //             }

    //             // Notifikasi ke Admin Bidang
    //             $adminBidang = User::where('role_id', 4)
    //                 ->where('bidang_id', $tiket->layanan->kode_bidang)
    //                 ->get();

    //             foreach ($adminBidang as $user) {

    //                 $user->notify(
    //                     new TiketNotification(
    //                         'Usulan Baru',
    //                         'No Tiket: ' . $tiket->no_tiket .
    //                             ' usulan perlu ditindaklanjuti.',
    //                         route(
    //                             'adminBidang.permintaan.editPermintaan',
    //                             ['no_tiket' => $tiket->no_tiket]
    //                         ),
    //                         $tiket->no_tiket,
    //                         'usulan_baru'
    //                     )
    //                 );
    //             }
    //         } else {

    //             // Notifikasi BTL ke Admin OPD
    //             $adminOpd = User::where('role_id', 3)
    //                 ->where('kode_ukerja', $tiket->kode_ukerja)
    //                 ->get();

    //             foreach ($adminOpd as $user) {
    //                 $user->notify(
    //                     new TiketNotification(
    //                         'Berkas Tidak Lengkap',
    //                         'No Tiket: ' . $tiket->no_tiket .
    //                             ' memerlukan perbaikan dokumen.',
    //                         route('adminOpd.tiket.indexProses'),
    //                         $tiket->no_tiket,
    //                         'berkas_tidak_lengkap'
    //                     )
    //                 );
    //             }
    //         }

    //         DB::commit();

    //         ActivityLogService::log(
    //             'Manajemen Data Tiket',
    //             'CREATE',
    //             'Submit Review Tiket',
    //             [],
    //             $tahap->toArray()
    //         );

    //         return redirect()
    //             ->route('adminBawah.perbaikan.indexAdminBawah')
    //             ->with('success', 'Review berhasil disimpan.');
    //     } catch (\Exception $e) {

    //         DB::rollBack();

    //         return back()->with('error', $e->getMessage());
    //     }
    // }

    // Simpan review
    public function submitReview(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            /*
        |--------------------------------------------------------------------------
        | DETAIL TIKET
        |--------------------------------------------------------------------------
        */

            $detailList = DetailTiket::where('no_tiket', $no_tiket)
                ->get();


            /*
        |--------------------------------------------------------------------------
        | DATA TIKET
        |--------------------------------------------------------------------------
        */

            $tiket = Regtiket::with('layanan')
                ->where('no_tiket', $no_tiket)
                ->firstOrFail();


            /*
        |--------------------------------------------------------------------------
        | CEK SEMUA SYARAT
        |--------------------------------------------------------------------------
        */

            $semuaValid = true;


            foreach ($detailList as $detail) {

                /*
            |--------------------------------------------------------------------------
            | CHECKBOX DICENTANG = VALID
            |--------------------------------------------------------------------------
            */

                $checked = isset(
                    $request->status[$detail->id]
                );


                if ($checked) {

                    $detail->update([
                        'status' => 1,
                        'comment' => null,
                    ]);
                } else {

                    /*
                |--------------------------------------------------------------------------
                | TIDAK DICENTANG = BTL
                |--------------------------------------------------------------------------
                */

                    $semuaValid = false;

                    $detail->update([
                        'status' => 2,
                        'comment' =>
                        $request->comment[$detail->id]
                            ?? null,
                    ]);
                }
            }


            /*
        |--------------------------------------------------------------------------
        | SEMUA SYARAT VALID
        |--------------------------------------------------------------------------
        */

            if ($semuaValid) {

                /*
            |--------------------------------------------------------------------------
            | BUAT TAHAP
            |--------------------------------------------------------------------------
            */

                $tahap = Tahap::create([
                    'no_tiket' => $no_tiket,
                    'tanggal' => now(),
                    'status' => 20000,
                    'operator' => Auth::user()->username,
                    'comment' => 'Berkas Sudah Diterima BKPSDM',
                ]);


                /*
            |--------------------------------------------------------------------------
            | NOTIFIKASI ADMIN OPD
            |--------------------------------------------------------------------------
            */

                $adminOpd = User::where('role_id', 3)
                    ->where(
                        'kode_ukerja',
                        $tiket->kode_ukerja
                    )
                    ->get();


                foreach ($adminOpd as $user) {

                    $user->notify(
                        new TiketNotification(
                            'Berkas Diterima BKPSDM',
                            'No Tiket ' . $tiket->no_tiket .
                                ' usulan telah diterima BKPSDM dan sedang diproses.',
                            route('adminOpd.tiket.indexProses'),
                            $tiket->no_tiket,
                            'berkas_diterima'
                        )
                    );
                }


                /*
            |--------------------------------------------------------------------------
            | NOTIFIKASI ADMIN BIDANG
            |--------------------------------------------------------------------------
            */

                $adminBidang = User::where('role_id', 4)
                    ->where(
                        'bidang_id',
                        $tiket->layanan->kode_bidang
                    )
                    ->get();


                foreach ($adminBidang as $user) {

                    $user->notify(
                        new TiketNotification(
                            'Usulan Baru',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' usulan perlu ditindaklanjuti.',
                            route(
                                'adminBidang.permintaan.editPermintaan',
                                [
                                    'no_tiket' =>
                                    $tiket->no_tiket
                                ]
                            ),
                            $tiket->no_tiket,
                            'usulan_baru'
                        )
                    );
                }


                /*
            |--------------------------------------------------------------------------
            | ACTIVITY LOG
            |--------------------------------------------------------------------------
            */

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Submit Review Tiket - Berkas Diterima BKPSDM',
                    [],
                    $tahap->toArray()
                );
            } else {

                /*
            |--------------------------------------------------------------------------
            | MASIH ADA BTL
            |--------------------------------------------------------------------------
            |
            | Jika masih ada syarat yang tidak valid,
            | tiket ditandai masih membutuhkan perbaikan.
            |
            */

                $tiket->update([
                    'diperbaiki' => 0,
                ]);


                /*
            |--------------------------------------------------------------------------
            | NOTIFIKASI BTL KE ADMIN OPD
            |--------------------------------------------------------------------------
            */

                $adminOpd = User::where('role_id', 3)
                    ->where(
                        'kode_ukerja',
                        $tiket->kode_ukerja
                    )
                    ->get();


                foreach ($adminOpd as $user) {

                    $user->notify(
                        new TiketNotification(
                            'Berkas Tidak Lengkap',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' memerlukan perbaikan dokumen.',
                            route('adminOpd.tiket.indexProses'),
                            $tiket->no_tiket,
                            'berkas_tidak_lengkap'
                        )
                    );
                }


                /*
            |--------------------------------------------------------------------------
            | ACTIVITY LOG
            |--------------------------------------------------------------------------
            */

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'UPDATE',
                    'Submit Review Tiket - Berkas Tidak Lengkap',
                    [],
                    [
                        'no_tiket' => $no_tiket,
                        'status' => 2,
                        'diperbaiki' => 0,
                        'comment' => 'Berkas memerlukan perbaikan dokumen.',
                    ]
                );
            }


            /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

            DB::commit();


            /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

            return redirect()
                ->route('adminBawah.perbaikan.indexAdminBawah')
                ->with(
                    'success',
                    'Review berhasil disimpan.'
                );
        } catch (\Exception $e) {

            /*
        |--------------------------------------------------------------------------
        | ROLLBACK
        |--------------------------------------------------------------------------
        */

            DB::rollBack();


            return back()
                ->withInput()
                ->with(
                    'error',
                    $e->getMessage()
                );
        }
    }

    // Simpan review permintaan
    public function submitPermintaan(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();
            $semuaValid = true;

            foreach ($detailList as $detail) {

                // CHECKBOX CHECKED
                $checked = isset($request->status[$detail->id]);

                if ($checked) {
                    $detail->update([
                        'status' => 1,
                        'comment' => null
                    ]);
                } else {
                    $semuaValid = false;

                    $detail->update([
                        'status' => 2,
                        'comment' => $request->comment[$detail->id] ?? null
                    ]);
                }
            }

            // Get Data Tiket
            $tiket = Regtiket::with('layanan')
                ->where('no_tiket', $no_tiket)
                ->firstOrFail();

            if ($semuaValid) {
                $tahap = Tahap::create([
                    'no_tiket' => $no_tiket,
                    'tanggal' => now(),
                    'status' => 1,
                    'operator' => Auth::user()->username,
                    'comment' => 'Berkas Sudah Diterima BKPSDM'
                ]);

                // Notifikasi ke Admin OPD
                $adminOpd = User::where('role_id', 3)
                    ->where('kode_ukerja', $tiket->kode_ukerja)
                    ->get();

                foreach ($adminOpd as $user) {
                    $user->notify(
                        new TiketNotification(
                            'Berkas Diterima BKPSDM',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' telah diterima BKPSDM dan sedang diproses.',
                            route('adminOpd.tiket.indexProses'),
                            $tiket->no_tiket,
                            'berkas_diterima'
                        )
                    );
                }

                // Notifikasi ke Admin Bidang
                $adminBidang = User::where('role_id', 4)
                    ->where('bidang_id', $tiket->layanan->kode_bidang)
                    ->get();

                foreach ($adminBidang as $user) {

                    $user->notify(
                        new TiketNotification(
                            'Usulan Baru',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' yang perlu ditindaklanjuti.',
                            route(
                                'adminBidang.permintaan.editPermintaan',
                                ['no_tiket' => $tiket->no_tiket]
                            ),
                            $tiket->no_tiket,
                            'usulan_baru'
                        )
                    );
                }
            } else {

                // Jika BTL, tandai tiket belum diperbaiki
                $tiket->update([
                    'diperbaiki' => 0
                ]);

                // Notifikasi BTL ke Admin OPD
                $adminOpd = User::where('role_id', 3)
                    ->where('kode_ukerja', $tiket->kode_ukerja)
                    ->get();

                foreach ($adminOpd as $user) {
                    $user->notify(
                        new TiketNotification(
                            'Berkas Tidak Lengkap',
                            'No Tiket: ' . $tiket->no_tiket .
                                ' memerlukan perbaikan dokumen.',
                            route('adminOpd.tiket.indexProses'),
                            $tiket->no_tiket,
                            'berkas_tidak_lengkap'
                        )
                    );
                }
            }

            // Notifikasi Email langsung ke ASN bersangkutan (email dari input Step 1)
            if (!empty($tiket->email)) {
                $pesanAsn = $semuaValid
                    ? 'Berkas usulan layanan Anda dengan No Tiket: ' . $tiket->no_tiket . ' telah diterima dan diverifikasi oleh pihak BKPSDM.'
                    : 'Berkas usulan layanan Anda dengan No Tiket: ' . $tiket->no_tiket . ' memerlukan perbaikan dokumen. Silakan hubungi Admin OPD Anda.';

                Notification::route('mail', $tiket->email)
                    ->notify(
                        new TiketNotification(
                            $semuaValid ? 'Berkas Diterima BKPSDM' : 'Perbaikan Berkas Diperlukan',
                            $pesanAsn,
                            route('tiket.public', $tiket->no_tiket),
                            $tiket->no_tiket,
                            $semuaValid ? 'berkas_diterima' : 'berkas_tidak_lengkap'
                        )
                    );
            }

            DB::commit();

            if ($semuaValid) {
                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Submit Permintaan Usulan',
                    [],
                    $tahap->toArray()
                );

                return redirect()
                    ->route('adminBawah.permintaan.indexPermintaan')
                    ->with('success', 'Berkas berhasil diterima.');
            }

            return redirect()
                ->route('adminBawah.permintaan.indexPermintaan')
                ->with('success', 'Verifikasi berhasil disimpan.');
        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }

    // Update nilai diperbaiki menjadi = 1 pada menu Admin OPD
    public function konfirmasiPerbaikan($no_tiket)
    {
        $tiket = Regtiket::where('no_tiket', $no_tiket)
            ->firstOrFail();

        $oldData = [
            'diperbaiki' => $tiket->diperbaiki,
            'diperbaiki_tgl' => $tiket->diperbaiki_tgl,
        ];

        $tiket->update([
            'diperbaiki' => 1,
            'diperbaiki_tgl' => now()
        ]);

        $newData = [
            'diperbaiki' => $tiket->fresh()->diperbaiki,
            'diperbaiki_tgl' => $tiket->fresh()->diperbaiki_tgl,
        ];

        ActivityLogService::log(
            'Manajemen Data Tiket',
            'UPDATE',
            'Konfirmasi Perbaikan Tiket: ' . $tiket->no_tiket,
            $oldData,
            $newData
        );

        // Kirim Notifikasi ke Admin Bawah
        $adminBawah = User::where('role_id', 2)->get();

        foreach ($adminBawah as $user) {
            $user->notify(
                new TiketNotification(
                    'Konfirmasi Perbaikan',
                    'No Tiket: ' . $tiket->no_tiket .
                        ' perbaikan perlu diverifikasi.',
                    route('adminBawah.permintaan.reviewPermintaan', ['no_tiket' => $tiket->no_tiket]),
                    $tiket->no_tiket,
                    'review_perbaikan'
                )
            );
        }

        // Kirim Notifikasi ke Admin Bidang jika tahap > 1

        $jumlahTahap = $tiket->tahap()->count();

        if ($jumlahTahap > 1) {
            $adminBidang = User::where('role_id', 4)
                ->where('bidang_id', $tiket->layanan->kode_bidang)
                ->get();

            foreach ($adminBidang as $user) {
                $user->notify(
                    new TiketNotification(
                        'Konfirmasi Perbaikan',
                        'No Tiket: ' . $tiket->no_tiket .
                            ' usulan yang sudah dilakukan perbaikan.',
                        route(
                            'adminBidang.permintaan.editPermintaan',
                            ['no_tiket' => $tiket->no_tiket]
                        ),
                        $tiket->no_tiket,
                        'review_perbaikan'
                    )
                );
            }
        }

        return redirect()
            ->back()
            ->with('success', 'Perbaikan berhasil dikonfirmasi.');
    }

    public function detailPerbaikan($no_tiket)
    {
        $data = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->where('status', 2)
            ->get();

        return response()->json($data);
    }

    public function exportExcel(Request $request)
    {
        $isAdminBawah = Auth::user()?->role?->name === 'admin_bawah';
        $data = $this->getData($request, $isAdminBawah);

        $pegawaiList = $this->pegawaiService->getPegawaiByNips(
            $data->pluck('nip')
                ->filter()
                ->unique()
                ->values()
        );

        return Excel::download(new ListPerbaikanUsulanExport($data, $pegawaiList), 'perbaikan_usulan.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $isAdminBawah = Auth::user()?->role?->name === 'admin_bawah';
        $data = $this->getData($request, $isAdminBawah);

        $pegawaiList = $this->pegawaiService->getPegawaiByNips(
            $data->pluck('nip')
                ->filter()
                ->unique()
                ->values()
        );

        $pdf = Pdf::loadView(
            'pages.opd.perbaikan.export.export-pdf',
            compact('data', 'pegawaiList')
        );

        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('perbaikan_usulan.pdf');
    }

    public function exportPerbaikanPdf(Request $request)
    {
        return $this->exportPdf($request);
    }

    // EXPORT PDF LIST PERMINTAAN LAYANAN SKPD
    public function exportPermintaanPdf(Request $request)
    {
        $query = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            ->has('tahap', '=', 1);

        // FILTER LAYANAN
        if ($request->filled('layanan')) {
            $query->where(
                'kode_layanan',
                $request->layanan
            );
        }

        $tiket = $query
            ->orderByDesc('tanggal')
            ->get();

        $pdf = Pdf::loadView(
            'pages.admin-bawah.registrasi.pdf',
            compact('tiket')
        );

        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-permintaan.pdf');
    }

    // Edit Perbaikan Admin OPD
    public function editPerbaikan($no_tiket)
    {
        // AMBIL TIKET

        $tiket = Regtiket::with([
            'layanan.bidang'
        ])
            ->where('no_tiket', $no_tiket)
            ->where(
                'kode_ukerja',
                Auth::user()->kode_ukerja
            )
            ->firstOrFail();

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();

        // DATA PEGAWAI
        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($tiket->nip);

        $dataPegawai = [
            'nama'     => $tiket->nama ?? '-',
            'golongan' => $pegawai['ket_gol'] ?? '-',
            'unit'     => $tiket->nama_ukerja ?? '-',
        ];

        //  DATA DOKUMEN UNTUK TAMPILAN

        foreach ($detail as $d) {

            $syarat = $d->syarat;

            // SYARAT TIDAK DITEMUKAN

            if (!$syarat) {

                $d->dokumen_review = [
                    'metode'     => null,
                    'kode_efile' => null,
                    'tersedia'   => false,
                    'nama'       => null,
                    'url'        => null,
                    'dokumen'    => [],
                ];

                continue;
            }

            $disk = Storage::disk('pilkb_efile');

            $fileManualTersedia =
                !empty($d->file_path) &&
                $disk->exists($d->file_path);

            if ($fileManualTersedia) {

                $urlManual = route(
                    'adminOpd.perbaikan.dokumen',
                    ['id' => $d->id]
                );

                $namaManual = $d->file_name
                    ?? 'Dokumen';

                $d->dokumen_review = [
                    'metode' => 'upload',
                    'kode_efile' => $syarat->kode_efile,
                    'tersedia' => true,
                    'nama' => $namaManual,
                    'url' => $urlManual,

                    'dokumen' => [
                        [
                            'nama' => $namaManual,
                            'url' => $urlManual,
                            'tanggal' =>
                            $d->uploaded_at
                                ? $d->uploaded_at->format('d/m/Y H:i')
                                : null,
                            'urutan' => null,
                            'status' => 'upload',
                            'sumber' => 'upload',
                            'raw' => null,
                        ]
                    ],
                ];

                continue;
            }

            //  METODE SIMPEG

            if ($syarat->metode === 'simpeg') {

                $hasil = $this->kelengkapanService
                    ->getSyaratDokumen(
                        $tiket->nip,
                        $syarat
                    );

                $dokumen = $hasil['dokumen'] ?? [];


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
                            'urutan' => $item['urutan'] ?? null,
                            'status' => $item['status'] ?? null,
                            'ref_table' => $item['ref_table'] ?? null,
                            'sumber' => 'simpeg',
                            'raw' => $item,
                        ];
                    })
                    ->sortByDesc(function ($item) {
                        return (int) (
                            $item['urutan'] ?? 0
                        );
                    })
                    ->values()
                    ->all();

                $d->dokumen_review = [
                    'metode' => 'simpeg',
                    'kode_efile' => $syarat->kode_efile,
                    'tersedia' => count($dokumenTerformat) > 0,
                    'nama' => $dokumenTerformat[0]['nama'] ?? null,
                    'url' => $dokumenTerformat[0]['url'] ?? null,
                    'dokumen' => $dokumenTerformat,
                ];
                continue;
            }

            // METODE UPLOAD
            if ($syarat->metode === 'upload') {
                $d->dokumen_review = [
                    'metode' => 'upload',
                    'kode_efile' => null,
                    'tersedia' => false,
                    'nama' => null,
                    'url' => null,
                    'dokumen' => [],
                ];
                continue;
            }

            //  METODE TIDAK DIKENAL
            $d->dokumen_review = [
                'metode' => $syarat->metode,
                'kode_efile' => $syarat->kode_efile,
                'tersedia' => false,
                'nama' => null,
                'url' => null,
                'dokumen' => [],
            ];
        }

        //  QR TIKET
        $url = route(
            'tiket.public',
            [
                'no_tiket' =>
                $tiket->no_tiket
            ]
        );

        $qr = $this->generateQr($url);

        //  VIEWs
        return view(
            'pages.opd.perbaikan.edit',
            [
                'tiket' => $tiket,
                'detail' => $detail,
                'dataPegawai' => $dataPegawai,
                'qr' => $qr,
            ]
        );
    }

    // Update Perbaikan Admin OPD
    public function updatePerbaikan(Request $request, $no_tiket)
    {
        /*
    |--------------------------------------------------------------------------
    | VALIDASI FILE
    |--------------------------------------------------------------------------
    */

        $request->validate(
            [
                'dokumen' => 'nullable|array',

                'dokumen.*' =>
                'nullable|file|mimes:pdf|max:1024',
            ],
            [
                'dokumen.*.file' =>
                'File dokumen tidak valid.',

                'dokumen.*.mimes' =>
                'Dokumen harus berupa PDF.',

                'dokumen.*.max' =>
                'Ukuran file maksimal 1 MB.',
            ]
        );


        /*
    |--------------------------------------------------------------------------
    | PASTIKAN TIKET MILIK ADMIN OPD
    |--------------------------------------------------------------------------
    */

        $tiket = Regtiket::where(
            'no_tiket',
            $no_tiket
        )
            ->where(
                'kode_ukerja',
                Auth::user()->kode_ukerja
            )
            ->firstOrFail();


        /*
    |--------------------------------------------------------------------------
    | AMBIL FILE YANG DIUPLOAD
    |--------------------------------------------------------------------------
    */

        $dokumenUpload = $request->file('dokumen', []);


        if (empty($dokumenUpload)) {

            return back()
                ->with(
                    'error',
                    'Silakan upload minimal satu dokumen yang diperbaiki.'
                );
        }


        /*
    |--------------------------------------------------------------------------
    | KONFIGURASI DISK E-FILE
    |--------------------------------------------------------------------------
    |
    | Menggunakan:
    |
    | config/filesystems.php
    |
    | 'pilkb_efile'
    |
    | root berasal dari:
    |
    | PILKB_EFILE_PATH
    |
    */

        $efileRoot = config(
            'filesystems.disks.pilkb_efile.root'
        );


        if (empty($efileRoot)) {

            return back()
                ->with(
                    'error',
                    'Konfigurasi PILKB_EFILE_PATH belum tersedia.'
                );
        }


        /*
    |--------------------------------------------------------------------------
    | DISK E-FILE
    |--------------------------------------------------------------------------
    */

        $disk = Storage::disk('pilkb_efile');

        $ticketFolder = $no_tiket;


        /*
    |--------------------------------------------------------------------------
    | BUAT FOLDER TIKET
    |--------------------------------------------------------------------------
    */

        if (!$disk->exists($ticketFolder)) {

            $disk->makeDirectory($ticketFolder);
        }


        /*
    |--------------------------------------------------------------------------
    | MULAI TRANSAKSI DATABASE
    |--------------------------------------------------------------------------
    */

        DB::beginTransaction();


        /*
    |--------------------------------------------------------------------------
    | TRACK FILE BARU
    |--------------------------------------------------------------------------
    */

        $newFiles = [];

        /*
    |--------------------------------------------------------------------------
    | FILE LAMA YANG AKAN DIHAPUS SETELAH DATABASE COMMIT
    |--------------------------------------------------------------------------
    */

        $oldFiles = [];


        try {

            /*
        |--------------------------------------------------------------------------
        | AMBIL DETAIL MILIK TIKET
        |--------------------------------------------------------------------------
        */

            $detailList = DetailTiket::where(
                'no_tiket',
                $no_tiket
            )
                ->get()
                ->keyBy('id');


            /*
        |--------------------------------------------------------------------------
        | PROSES SETIAP FILE
        |--------------------------------------------------------------------------
        */

            foreach ($dokumenUpload as $detailId => $file) {

                /*
            |--------------------------------------------------------------------------
            | PASTIKAN DETAIL ADA
            |--------------------------------------------------------------------------
            */

                $detail = $detailList->get($detailId);


                if (!$detail) {
                    continue;
                }


                /*
            |--------------------------------------------------------------------------
            | PASTIKAN FILE VALID
            |--------------------------------------------------------------------------
            */

                if (!$file || !$file->isValid()) {
                    continue;
                }


                /*
            |--------------------------------------------------------------------------
            | AMBIL INFORMASI FILE SEBELUM MOVE
            |--------------------------------------------------------------------------
            |
            | INI PENTING.
            |
            | Jangan memanggil:
            |
            | $file->getSize()
            |
            | setelah $file->move().
            |
            | Karena file temporary PHP sudah dipindahkan.
            |
            */

                $originalName =
                    $file->getClientOriginalName();

                $fileSize =
                    $file->getSize();


                /*
            |--------------------------------------------------------------------------
            | NAMA FILE FISIK
            |--------------------------------------------------------------------------
            |
            | Nama asli tetap disimpan di database.
            |
            | File fisik dibuat unik agar tidak bentrok.
            |
            */

                $safeOriginalName = preg_replace(
                    '/[^A-Za-z0-9._-]/',
                    '_',
                    $originalName
                );


                $fileName =
                    bin2hex(random_bytes(8)) .
                    '_' .
                    $safeOriginalName;


                /*
            |--------------------------------------------------------------------------
            | PATH FILE BARU
            |--------------------------------------------------------------------------
            |
            | Contoh:
            |
            | 220826ROJ1/7f3a8b2c1d_SK.pdf
            |
            */

                $filePath =
                    $ticketFolder .
                    '/' .
                    $fileName;


                /*
            |--------------------------------------------------------------------------
            | SIMPAN FILE LAMA
            |--------------------------------------------------------------------------
            */

                if (!empty($detail->file_path)) {

                    $oldFiles[] =
                        $detail->file_path;
                }


                /*
            |--------------------------------------------------------------------------
            | SIMPAN FILE BARU
            |--------------------------------------------------------------------------
            */

                $file->storeAs(
                    $ticketFolder,
                    $fileName,
                    'pilkb_efile'
                );


                /*
            |--------------------------------------------------------------------------
            | CATAT FILE BARU
            |--------------------------------------------------------------------------
            */

                $newFiles[] =
                    $filePath;


                /*
            |--------------------------------------------------------------------------
            | PASTIKAN FILE BERHASIL DISIMPAN
            |--------------------------------------------------------------------------
            */

                if (!$disk->exists($filePath)) {

                    throw new \RuntimeException(
                        'File gagal disimpan: ' .
                            $filePath
                    );
                }


                /*
            |--------------------------------------------------------------------------
            | UPDATE DETAIL TIKET
            |--------------------------------------------------------------------------
            */

                $detail->update([

                    'file_name' =>
                    $originalName,

                    'file_path' =>
                    $filePath,

                    'file_size' =>
                    $fileSize,

                    'uploaded_at' =>
                    now(),

                    'retention_until' =>
                    now()->addMonths(3),

                    'deleted_file_at' =>
                    null,

                    'status' =>
                    null,

                    'comment' =>
                    null,
                ]);
            }


            /*
        |--------------------------------------------------------------------------
        | PASTIKAN MINIMAL ADA FILE YANG BERHASIL DIPROSES
        |--------------------------------------------------------------------------
        */

            if (empty($newFiles)) {

                throw new \RuntimeException(
                    'Tidak ada dokumen valid yang berhasil diproses.'
                );
            }


            /*
        |--------------------------------------------------------------------------
        | DATA LAMA UNTUK ACTIVITY LOG
        |--------------------------------------------------------------------------
        */

            $oldData = [

                'diperbaiki' =>
                $tiket->diperbaiki,

                'diperbaiki_tgl' =>
                $tiket->diperbaiki_tgl,
            ];


            /*
        |--------------------------------------------------------------------------
        | UPDATE STATUS PERBAIKAN
        |--------------------------------------------------------------------------
        */

            $tiket->update([

                'diperbaiki' =>
                1,

                'diperbaiki_tgl' =>
                now(),
            ]);


            /*
        |--------------------------------------------------------------------------
        | DATA BARU UNTUK ACTIVITY LOG
        |--------------------------------------------------------------------------
        */

            $freshTiket =
                $tiket->fresh();


            $newData = [

                'diperbaiki' =>
                $freshTiket->diperbaiki,

                'diperbaiki_tgl' =>
                $freshTiket->diperbaiki_tgl,
            ];


            /*
        |--------------------------------------------------------------------------
        | COMMIT DATABASE
        |--------------------------------------------------------------------------
        */

            DB::commit();


            /*
        |--------------------------------------------------------------------------
        | HAPUS FILE LAMA
        |--------------------------------------------------------------------------
        |
        | Dilakukan setelah database berhasil commit.
        |
        */

            foreach ($oldFiles as $oldFile) {

                /*
            |--------------------------------------------------------------------------
            | Jangan hapus jika path lama sama dengan file baru
            |--------------------------------------------------------------------------
            */

                if (
                    !empty($oldFile) &&
                    !in_array($oldFile, $newFiles, true) &&
                    $disk->exists($oldFile)
                ) {

                    $disk->delete($oldFile);
                }
            }

            /*
|--------------------------------------------------------------------------
| NOTIFIKASI KE ADMIN BIDANG
|--------------------------------------------------------------------------
|
| Admin OPD sudah selesai melakukan perbaikan.
| Admin Bidang perlu melakukan review kembali.
|
*/

            $adminBidang = User::where(
                'role_id',
                4
            )
                ->where(
                    'bidang_id',
                    $tiket->layanan->kode_bidang
                )
                ->get();

            foreach ($adminBidang as $user) {

                $user->notify(
                    new TiketNotification(
                        'Perbaikan Usulan Selesai',

                        'No Tiket: ' .
                            $tiket->no_tiket .
                            ' telah diperbaiki oleh Admin OPD dan siap untuk direview kembali.',

                        route(
                            'adminBidang.permintaan.editPermintaan',
                            $tiket->no_tiket
                        ),

                        $tiket->no_tiket,

                        'status_update'
                    )
                );
            }


            /*
        |--------------------------------------------------------------------------
        | ACTIVITY LOG
        |--------------------------------------------------------------------------
        */

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'UPDATE',
                'Perbaikan Dokumen Tiket: ' .
                    $tiket->no_tiket,
                $oldData,
                $newData
            );


            /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

            return redirect()
                ->route(
                    'adminOpd.perbaikan.index'
                )
                ->with(
                    'success',
                    'Perbaikan dokumen berhasil disimpan.'
                );
        } catch (\Throwable $e) {

            /*
        |--------------------------------------------------------------------------
        | ROLLBACK DATABASE
        |--------------------------------------------------------------------------
        */

            DB::rollBack();


            /*
        |--------------------------------------------------------------------------
        | HAPUS FILE BARU JIKA TERJADI ERROR
        |--------------------------------------------------------------------------
        */

            foreach ($newFiles as $newFile) {

                if ($disk->exists($newFile)) {

                    $disk->delete($newFile);
                }
            }


            /*
        |--------------------------------------------------------------------------
        | LOG ERROR DETAIL
        |--------------------------------------------------------------------------
        |
        | Sangat membantu untuk debugging.
        |
        */

            Log::error(
                'Gagal menyimpan perbaikan dokumen PILKB',
                [
                    'no_tiket' =>
                    $no_tiket,

                    'user_id' =>
                    Auth::id(),

                    'efile_root' =>
                    $efileRoot,

                    'ticket_folder' =>
                    $ticketFolder,

                    'new_files' =>
                    $newFiles,

                    'old_files' =>
                    $oldFiles,

                    'exception' =>
                    get_class($e),

                    'message' =>
                    $e->getMessage(),

                    'file' =>
                    $e->getFile(),

                    'line' =>
                    $e->getLine(),

                    'trace' =>
                    $e->getTraceAsString(),
                ]
            );


            /*
        |--------------------------------------------------------------------------
        | KEMBALI DENGAN PESAN ERROR
        |--------------------------------------------------------------------------
        */

            return back()
                ->withInput()
                ->with(
                    'error',
                    'Gagal menyimpan perbaikan dokumen: ' .
                        $e->getMessage()
                );
        }
    }
}
