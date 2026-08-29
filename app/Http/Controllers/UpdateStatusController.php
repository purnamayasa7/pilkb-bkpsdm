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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class UpdateStatusController extends Controller
{
    public function __construct(
        protected PegawaiService $pegawaiService,
        protected KelengkapanService $kelengkapanService
    ) {}

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

    public function index(Request $request)
    {
        $keyword = $request->keyword;

        $user = Auth::user();

        $data = collect();

        if ($keyword) {

            $data = Regtiket::with([
                'layanan.bidang',
                'tahapTerakhir.statusRel'
            ])
                // FILTER NO TIKET / NIP
                ->where(function ($q) use ($keyword) {
                    $q->where('no_tiket', 'like', "%{$keyword}%")
                        ->orWhere('nip', 'like', "%{$keyword}%");
                })

                // FILTER SESUAI BIDANG
                ->whereHas('layanan', function ($q) use ($user) {
                    $q->where('kode_bidang', $user->bidang_id);
                })

                ->where('archives', 0)

                ->orderByDesc('tanggal')

                ->get();
        }

        return view('pages.bidang.update-status.index', compact(
            'data'
        ));
    }

    public function edit($no_tiket)
    {
        $user = Auth::user();

        $tiket = Regtiket::with([
            'layanan.bidang'
        ])
            ->where('no_tiket', $no_tiket)
            ->whereHas('layanan', function ($query) use ($user) {
                $query->where('kode_bidang', $user->bidang_id);
            })
            ->firstOrFail();

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();

        $pegawai = $this->pegawaiService->getPegawaiByNip($tiket->nip);

        $dataPegawai = [
            'nama' => $tiket->nama ?? ($pegawai['nama_lengkap'] ?? '-'),
            'golongan' => $pegawai['ket_gol'] ?? '-',
            'unit' => $tiket->nama_ukerja ?? ($pegawai['ket_ukerja'] ?? '-'),
        ];

        // E-FILE & DOKUMEN REVIEW
        foreach ($detail as $d) {
            $syarat = $d->syarat;

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

            $disk = Storage::disk('pilkb_efile');
            $fileManualTersedia = !empty($d->file_path) && $disk->exists($d->file_path);

            if ($fileManualTersedia) {
                $urlManual = route('adminBidang.permintaan.dokumen', ['id' => $d->id]);
                $namaManual = $d->file_name ?? 'Dokumen';

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
                            'tanggal' => $d->uploaded_at ? $d->uploaded_at->format('d/m/Y H:i') : null,
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

            if ($syarat->metode === 'simpeg') {
                $hasil = $this->kelengkapanService->getSyaratDokumen($tiket->nip, $syarat);
                $dokumen = $hasil['dokumen'] ?? [];

                $dokumenTerformat = collect($dokumen)
                    ->map(function ($item) {
                        return [
                            'nama' => $item['nama_file'] ?? $item['nama'] ?? $item['file_name'] ?? $item['nama_dokumen'] ?? 'Dokumen',
                            'url' => $item['preview_url'] ?? $item['url'] ?? null,
                            'tanggal' => $item['tanggal'] ?? $item['created_at'] ?? $item['tgl_dokumen'] ?? null,
                            'urutan' => $item['urutan'] ?? null,
                            'status' => $item['status'] ?? null,
                            'ref_table' => $item['ref_table'] ?? null,
                            'sumber' => 'simpeg',
                            'raw' => $item,
                        ];
                    })
                    ->sortByDesc(function ($item) {
                        return (int) ($item['urutan'] ?? 0);
                    })
                    ->values()
                    ->all();

                $d->dokumen_review = [
                    'metode' => 'simpeg',
                    'kode_efile' => $syarat->kode_efile,
                    'tersedia' => !empty($dokumenTerformat),
                    'nama' => !empty($dokumenTerformat) ? ($dokumenTerformat[0]['nama'] ?? null) : null,
                    'url' => !empty($dokumenTerformat) ? ($dokumenTerformat[0]['url'] ?? null) : null,
                    'dokumen' => $dokumenTerformat,
                ];
                continue;
            }

            $d->dokumen_review = [
                'metode' => $syarat->metode,
                'kode_efile' => $syarat->kode_efile,
                'tersedia' => false,
                'nama' => null,
                'url' => null,
                'dokumen' => [],
            ];
        }

        $url = route('tiket.public', ['no_tiket' => $tiket->no_tiket]);
        $qr = $this->generateQr($url);

        $statusList = Status::where('kode_layanan', $tiket->kode_layanan)->get();

        return view('pages.bidang.update-status.edit', compact(
            'tiket',
            'detail',
            'dataPegawai',
            'statusList',
            'qr'
        ));
    }

    public function update(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {
            $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();
            $semuaValid = true;

            foreach ($detailList as $detail) {
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

            if ($semuaValid) {
                $tahap = Tahap::create([
                    'no_tiket' => $no_tiket,
                    'tanggal' => now(),
                    'status' => $request->status_tahap,
                    'operator' => Auth::user()->username,
                    'comment' => $request->catatan ?? '-'
                ]);

                DB::commit();

                ActivityLogService::log(
                    'Manajemen Data Tiket',
                    'CREATE',
                    'Menambah Tahap Tiket ID: ' . $tahap->no_tiket,
                    [],
                    $tahap->toArray()
                );

                // Ambil tiket untuk mendapatkan kode_ukerja
                $tiket = Regtiket::where('no_tiket', $no_tiket)->firstOrFail();

                // Kirim Notifikasi ke Admin OPD pemilik tiket
                $adminOpd = User::where('role_id', 3)
                    ->where('kode_ukerja', $tiket->kode_ukerja)
                    ->get();

                foreach ($adminOpd as $user) {
                    $user->notify(
                        new TiketNotification(
                            'Status Usulan Diperbarui',
                            'No Tiket: ' . $tahap->no_tiket .
                                ' status sudah diperbarui menjadi ' .
                                $tahap->statusRel->status,
                            route('adminOpd.tiket.indexProses'),
                            $tahap->no_tiket
                        )
                    );
                }

                // Notifikasi Email langsung ke ASN bersangkutan (email dari input Step 1)
                if (!empty($tiket->email)) {
                    Notification::route('mail', $tiket->email)
                        ->notify(
                            new TiketNotification(
                                'Status Usulan Diperbarui',
                                'Halo ' . ($tiket->nama ?? 'Bapak/Ibu') . ', status usulan layanan Anda dengan No Tiket: ' . $tahap->no_tiket . ' telah diperbarui menjadi ' . ($tahap->statusRel->status ?? 'Sedang Diproses') . '.',
                                route('tiket.public', $tahap->no_tiket),
                                $tahap->no_tiket,
                                'status_update'
                            )
                        );
                }

                return redirect()
                    ->route('adminBidang.status.index')
                    ->with('success', 'Status usulan berhasil dirubah.');
            }

            // Jika ada dokumen tidak valid — tandai tiket perlu perbaikan dan notifikasi Admin OPD
            $tiket = Regtiket::where('no_tiket', $no_tiket)->firstOrFail();

            $tiket->update(['diperbaiki' => 0]);

            DB::commit();

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'UPDATE',
                'Update Status Tiket - Dokumen Tidak Lengkap: ' . $no_tiket,
                [],
                ['no_tiket' => $no_tiket, 'status' => 'tidak_lengkap']
            );

            // Notifikasi ke Admin OPD bahwa ada dokumen tidak valid
            $adminOpd = User::where('role_id', 3)
                ->where('kode_ukerja', $tiket->kode_ukerja)
                ->get();

            foreach ($adminOpd as $user) {
                $user->notify(
                    new TiketNotification(
                        'Berkas Tidak Lengkap',
                        'No Tiket: ' . $no_tiket .
                            ' terdapat dokumen yang tidak valid dan memerlukan perbaikan.',
                        route('adminOpd.tiket.indexProses'),
                        $no_tiket,
                        'berkas_tidak_lengkap'
                    )
                );
            }

            // Notifikasi Email langsung ke ASN bersangkutan (email dari input Step 1)
            if (!empty($tiket->email)) {
                Notification::route('mail', $tiket->email)
                    ->notify(
                        new TiketNotification(
                            'Perbaikan Berkas Diperlukan',
                            'Halo ' . ($tiket->nama ?? 'Bapak/Ibu') . ', usulan layanan Anda dengan No Tiket: ' . $no_tiket . ' terdapat dokumen yang tidak valid dan memerlukan perbaikan. Silakan hubungi Admin OPD Anda.',
                            route('tiket.public', $no_tiket),
                            $no_tiket,
                            'berkas_tidak_lengkap'
                        )
                    );
            }

            return redirect()
                ->route('adminBidang.status.index')
                ->with('warning', 'Terdapat dokumen tidak valid. Admin OPD telah dinotifikasi.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
