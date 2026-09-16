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
use Illuminate\Support\Facades\Notification;

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

        return inertia('Bidang/Permintaan/Index', [
            'tiket' => $tiket,
            'month' => (int) $month,
            'year' => (int) $year,
            'namaBidang' => $user->nama_bidang ?? 'Bidang',
        ]);
    }

    public function getData(Request $request)
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
            ->whereHas('layanan', function ($q) use ($user) {
                if ($user && $user->bidang_id) {
                    $q->where('kode_bidang', $user->bidang_id);
                }
            })
            ->orderByDesc('tanggal')
            ->get();

        return response()->json($tiket);
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


        return inertia('Bidang/Permintaan/Edit', [
            'tiket' => $tiket,
            'detail' => $detail,
            'dataPegawai' => $dataPegawai,
            'statusList' => Status::where('kode_layanan', $tiket->kode_layanan)->get(),
            'qr' => $qr,
        ]);
    }

    public function updatePermintaan(Request $request, $no_tiket)
    {
        $user = Auth::user();

        $tiket = Regtiket::with('layanan')
            ->where('no_tiket', $no_tiket)
            ->whereHas('layanan', function ($query) use ($user) {
                $query->where(
                    'kode_bidang',
                    $user->bidang_id
                );
            })
            ->firstOrFail();

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

            $tahap = Tahap::create([
                'no_tiket' => $no_tiket,
                'tanggal' => now(),

                'status' => $request->status_tahap,

                'operator' => Auth::user()->username,
                'comment' => $request->catatan ?? '-'
            ]);

            // Cek apakah status yang dipilih adalah "Selesai"
            $statusObj = Status::find($request->status_tahap);
            $isSelesai = $statusObj && strtolower(trim($statusObj->status)) === 'selesai';

            $updateTiketData = [
                'data_baru' => 0,
                'diperbaiki' => 0,
                'diperbaiki_tgl' => now(),
            ];

            if ($isSelesai) {
                $updateTiketData['archives'] = 1;
                $updateTiketData['operator_archives'] = Auth::user()->username;
            }

            Regtiket::where('no_tiket', $no_tiket)
                ->update($updateTiketData);

            DB::commit();

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'CREATE',
                $isSelesai ? 'Submit Review Tiket - Status Selesai (Diarsipkan)' : 'Submit Review Tiket',
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
                    $judulNotif = $isSelesai ? 'Usulan Selesai Diproses' : 'Status Usulan Diperbarui';
                    $pesanNotif = $isSelesai
                        ? 'No Tiket: ' . $tahap->no_tiket . ' telah selesai diproses.'
                        : 'No Tiket: ' . $tahap->no_tiket . ' status sudah diperbarui menjadi ' . ($tahap->statusRel->status ?? 'Diproses');

                    $user->notify(
                        new TiketNotification(
                            $judulNotif,
                            $pesanNotif,
                            route('adminOpd.tiket.indexProses'),
                            $tahap->no_tiket,
                            $isSelesai ? 'selesai' : 'status_update'
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

            // Notifikasi Email langsung ke ASN bersangkutan (email dari input Step 1)
            if (!empty($tiket->email)) {
                $pesanAsn = $semuaValid
                    ? ($isSelesai
                        ? 'Pengajuan usulan Anda dengan No Tiket: ' . $tahap->no_tiket . ' telah selesai diproses. Silakan hubungi BKPSDM untuk informasi pengambilan dokumen atau tahapan selanjutnya.'
                        : 'Status pengajuan usulan Anda dengan No Tiket: ' . $tahap->no_tiket . ' telah diperbarui menjadi ' . ($tahap->statusRel->status ?? 'Sedang Diproses') . '.')
                    : 'Pengajuan usulan Anda dengan No Tiket: ' . $tahap->no_tiket . ' memerlukan perbaikan dokumen berkas. Silakan koordinasi dengan Admin OPD Anda.';

                Notification::route('mail', $tiket->email)
                    ->notify(
                        new TiketNotification(
                            $semuaValid ? ($isSelesai ? 'Layanan Anda Telah Selesai Diproses' : 'Status Usulan Diperbarui') : 'Perbaikan Berkas Diperlukan',
                            $pesanAsn,
                            route('tiket.public', $tahap->no_tiket),
                            $tahap->no_tiket,
                            $semuaValid ? ($isSelesai ? 'selesai' : 'status_update') : 'berkas_tidak_lengkap'
                        )
                    );
            }

            $successMsg = $isSelesai
                ? 'Review berhasil disimpan dan usulan telah selesai diproses (diarsipkan).'
                : 'Review berhasil disimpan.';

            return redirect()
                ->route('adminBidang.permintaan.index')
                ->with('success', $successMsg);
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
        $user = Auth::user();

        $tiket = Regtiket::with('layanan')
            ->where('no_tiket', $no_tiket)
            ->whereHas('layanan', function ($query) use ($user) {
                $query->where(
                    'kode_bidang',
                    $user->bidang_id
                );
            })
            ->firstOrFail();

        try {

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

            // Notifikasi ke pemohon (user OPD pemilik tiket) bahwa proses selesai
            $pemohon = User::where('role_id', 3)
                ->where('kode_ukerja', $tiket->kode_ukerja)
                ->whereNotNull('email')
                ->get();

            foreach ($pemohon as $user) {
                $user->notify(
                    new TiketNotification(
                        'Layanan Anda Telah Selesai Diproses',
                        'No Tiket: ' . $tiket->no_tiket .
                            ' telah selesai diproses. Silakan hubungi BKPSDM untuk pengambilan dokumen.',
                        route('adminOpd.tiket.indexProses'),
                        $tiket->no_tiket,
                        'selesai'
                    )
                );
            }

            // Notifikasi Email langsung ke ASN bersangkutan (email dari input Step 1)
            if (!empty($tiket->email)) {
                Notification::route('mail', $tiket->email)
                    ->notify(
                        new TiketNotification(
                            'Layanan Anda Telah Selesai Diproses',
                            'Halo ' . ($tiket->nama ?? 'Bapak/Ibu') . ', pengajuan usulan layanan Anda dengan No Tiket: ' . $tiket->no_tiket . ' telah selesai diproses oleh pihak BKPSDM.',
                            route('tiket.public', $tiket->no_tiket),
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
     * VALIDASI KEAMANAN FILE (PATH TRAVERSAL DEFENSE)
     * ========================================================
     */

        $cleanRelativePath = ltrim(str_replace(['\\', "\0"], ['/', ''], $detail->file_path), '/');

        if (str_contains($cleanRelativePath, '..') || str_contains($cleanRelativePath, ':')) {
            abort(403, 'Akses file tidak valid.');
        }

        $disk = \Illuminate\Support\Facades\Storage::disk(
            'pilkb_efile'
        );

        if (!$disk->exists($cleanRelativePath)) {
            abort(
                404,
                'File dokumen tidak ditemukan.'
            );
        }

        $realFilePath = realpath($disk->path($cleanRelativePath));
        $diskRootPath = realpath($disk->path(''));

        if (!$realFilePath || !$diskRootPath || !str_starts_with($realFilePath, $diskRootPath)) {
            abort(403, 'Akses file di luar direktori penyimpanan ditolak.');
        }

        /*
     * ========================================================
     * TAMPILKAN FILE PDF
     * ========================================================
     *
     * Tidak menggunakan response()->download()
     * karena dokumen ingin ditampilkan di browser/PDF viewer.
     */

        $safeDownloadName = str_replace(['"', "\r", "\n"], '', basename($detail->file_name ?? 'dokumen.pdf'));

        return response()->file(
            $realFilePath,
            [
                'Content-Type' =>
                'application/pdf',

                'Content-Disposition' =>
                'inline; filename="' . $safeDownloadName . '"',

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
