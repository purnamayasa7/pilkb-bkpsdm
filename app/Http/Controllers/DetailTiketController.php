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
use App\Services\PegawaiService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class DetailTiketController extends Controller
{
    public function __construct(
        protected PegawaiService $pegawaiService
    ) {}

    private function getData($request, $isAdminBawah = false)
    {
        $query = Regtiket::with([
            'layanan',
            'tahap'
        ])->whereHas('detail', function ($q) {
            $q->where('status', 2);
        });

        // ADMIN OPD
        if (!$isAdminBawah) {
            $query->where('kode_ukerja', Auth::user()->kode_ukerja);
        }

        // ADMIN BAWAH, TAHAP TIKET LEBIH DARI 1
        if ($isAdminBawah) {
            $query->has('tahap', '>', 1);
        }

        if ($request->layanan) {
            $query->where('kode_layanan', $request->layanan);
        }

        if ($request->btl) {
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
            'layananList' => \App\Models\Layanan::where('aktif', 1)->get()
        ]);
    }

    // Index Admin Bawah
    public function indexAdminBawah(Request $request)
    {
        $data = $this->getData($request, true);

        return view('pages.admin-bawah.perbaikan.index', [
            'data' => $data,
            'layananList' => \App\Models\Layanan::where('aktif', 1)->get()
        ]);
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

        if ($request->layanan) {
            $query->where('kode_layanan', $request->layanan);
        }

        $tiket = $query
            ->orderByDesc('tanggal')
            ->get();

        return view('pages.admin-bawah.registrasi.index', [
            'tiket' => $tiket,
            'layananList' => Layanan::where('aktif', 1)->get()
        ]);
    }

    // Tampil Review
    public function review($no_tiket)
    {
        $tiket = Regtiket::with(['layanan.bidang'])
            ->where('no_tiket', $no_tiket)
            ->firstOrFail();

        $detail = DetailTiket::with('syarat')
            ->where('no_tiket', $no_tiket)
            ->get();

        $dataPegawai = [
            'nama' => '-',
            'golongan' => '-',
            'unit' => 'BKPSDM Kabupaten Buleleng'
        ];

        return view('pages.admin-bawah.perbaikan.edit', [
            'tiket' => $tiket,
            'detail' => $detail,
            'dataPegawai' => $dataPegawai
        ]);
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

        $pegawai = $this->pegawaiService->getPegawaiByNip($tiket->nip);

        $dataPegawai = [
            'nama' => $pegawai['nama_lengkap'] ?? '-',
            'golongan' => $pegawai['ket_gol'] ?? '-',
            'unit' => $pegawai['ket_ukerja'] ?? '-',
        ];

        return view('pages.admin-bawah.registrasi.edit', [
            'tiket' => $tiket,
            'detail' => $detail,
            'dataPegawai' => $dataPegawai
        ]);
    }

    // Simpan review
    public function submitReview(Request $request, $no_tiket)
    {
        DB::beginTransaction();

        try {

            $detailList = DetailTiket::where('no_tiket', $no_tiket)->get();

            // DATA TIKET UNTUK NOTIFIKASI
            $tiket = Regtiket::with('layanan')
                ->where('no_tiket', $no_tiket)
                ->firstOrFail();

            $semuaValid = true;

            foreach ($detailList as $detail) {
                // if checkbox checked
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
                    'status' => 20000,
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
                            'No Tiket ' . $tiket->no_tiket .
                                ' usulan telah diterima BKPSDM dan sedang diproses.',
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
                                ' usulan perlu ditindaklanjuti.',
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

            DB::commit();

            ActivityLogService::log(
                'Manajemen Data Tiket',
                'CREATE',
                'Submit Review Tiket',
                [],
                $tahap->toArray()
            );

            return redirect()
                ->route('adminBawah.perbaikan.indexAdminBawah')
                ->with('success', 'Review berhasil disimpan.');
        } catch (\Exception $e) {

            DB::rollBack();

            return back()->with('error', $e->getMessage());
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
                ->route('adminBawah.permintaan.indexPermintaan');
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
        $data = $this->getData($request);

        return Excel::download(new ListPerbaikanUsulanExport($data), 'perbaikan_usulan.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $data = $this->getData($request);

        $pdf = Pdf::loadView('pages.opd.perbaikan.export.export-pdf', [
            'data' => $data
        ]);

        return $pdf->steam('perbaikan_usulan.pdf');
    }

    // EXPORT PDF LIST PERMINTAAN LAYANAN SKPD
    public function exportPermintaanPdf(Request $request)
    {
        $query = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            // HANYA TAHAP 1
            ->has('tahap', '=', 1);

        // FILTER LAYANAN
        if ($request->layanan) {
            $query->where('kode_layanan', $request->layanan);
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
}
