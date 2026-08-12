<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KelengkapanService
{
    /**
     * KelengkapanService constructor.
     */
    public function __construct(
        protected PegawaiService $pegawaiService
    ) {}

    /**
     * =========================================================
     * AMBIL SELURUH DATA KELENGKAPAN DARI SIMPEG
     * =========================================================
     *
     * Endpoint:
     *
     * /pegawai/{nip}/dokumen
     *
     * Service ini hanya bertugas mengambil data dari SIMPEG.
     *
     * Tidak memproses:
     * - kewajiban
     * - wajib
     * - kondisional
     * - ada sebagai jumlah
     * - belum_ada
     * - persen_lengkap
     */
    public function getKelengkapanByNip(string $nip): ?array
    {
        if (blank($nip)) {
            return null;
        }

        /*
         * Konfigurasi SIMPEG.
         */
        $url = rtrim(
            (string) config('services.simpeg.url'),
            '/'
        );

        $token = (string) config('services.simpeg.token');

        /*
         * Pastikan konfigurasi tersedia.
         */
        if (blank($url) || blank($token)) {

            Log::error('Konfigurasi SIMPEG belum lengkap.', [
                'url' => $url,
            ]);

            return null;
        }

        $endpoint = "{$url}/pegawai/{$nip}/dokumen";

        try {

            /*
             * Request ke SIMPEG.
             */
            $response = Http::withoutVerifying()
                ->connectTimeout(2)
                ->timeout(5)
                ->retry(1, 200, throw: false)
                ->acceptJson()
                ->withToken($token)
                ->get($endpoint);

            /*
             * Request gagal.
             */
            if (! $response->successful()) {

                Log::warning(
                    'Request kelengkapan SIMPEG gagal.',
                    [
                        'nip' => $nip,
                        'status' => $response->status(),
                        'url' => $endpoint,
                        'body' => $response->body(),
                    ]
                );

                return null;
            }

            /*
             * Hilangkan BOM UTF-8 jika ada.
             */
            $body = preg_replace(
                '/^\xEF\xBB\xBF/',
                '',
                $response->body()
            );

            /*
             * Decode JSON.
             */
            $json = json_decode(
                $body,
                true
            );

            /*
             * Pastikan JSON valid.
             */
            if (json_last_error() !== JSON_ERROR_NONE) {

                Log::error(
                    'JSON kelengkapan SIMPEG tidak valid.',
                    [
                        'nip' => $nip,
                        'error' => json_last_error_msg(),
                    ]
                );

                return null;
            }

            /*
             * Pastikan API mengembalikan success = true
             * dan data tersedia.
             */
            if (
                ! isset($json['success']) ||
                $json['success'] !== true ||
                ! isset($json['data']) ||
                ! is_array($json['data'])
            ) {

                Log::warning(
                    'Data kelengkapan SIMPEG tidak tersedia.',
                    [
                        'nip' => $nip,
                        'response' => $json,
                    ]
                );

                return null;
            }

            $data = $json['data'];

            return $data;
        } catch (\Throwable $e) {

            Log::error(
                'Exception saat mengambil kelengkapan SIMPEG.',
                [
                    'nip' => $nip,
                    'url' => $endpoint,
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            );

            return null;
        }
    }


    /**
     * =========================================================
     * CARI JENIS DOKUMEN
     * =========================================================
     *
     * Contoh:
     *
     * getDokumenByJenis($nip, 'ijazah')
     *
     * akan mencari:
     *
     * data.dokumen[].jenis = ijazah
     */
    public function getDokumenByJenis(
        string $nip,
        string $jenis
    ): ?array {

        if (blank($nip) || blank($jenis)) {
            return null;
        }

        $data = $this->getKelengkapanByNip($nip);

        if (! $data) {
            return null;
        }

        $dokumen = collect(
            $data['dokumen'] ?? []
        )->firstWhere(
            'jenis',
            $jenis
        );

        return $dokumen ?: null;
    }


    /**
     * =========================================================
     * AMBIL DOKUMEN BERDASARKAN SYARAT PILKB
     * =========================================================
     *
     * Sumber konfigurasi:
     *
     * tb_syarat
     *
     * Yang digunakan:
     *
     * - metode
     * - kode_efile
     * - mode_efile
     *
     * Yang sengaja DIABAIKAN:
     *
     * - kewajiban dari API
     * - ada
     * - belum_ada
     * - total
     */
    public function getSyaratDokumen(
        string $nip,
        $syarat
    ): array {

        /*
         * Jika metode bukan SIMPEG,
         * service ini tidak memprosesnya.
         *
         * Contoh:
         *
         * metode = upload
         */
        if ($syarat->metode !== 'simpeg') {

            return [
                'tersedia' => false,
                'jenis' => null,
                'mode' => null,
                'dokumen' => [],
            ];
        }

        /*
         * kode_efile wajib tersedia
         * untuk mapping ke SIMPEG.
         */
        if (blank($syarat->kode_efile)) {

            return [
                'tersedia' => false,
                'jenis' => null,
                'mode' => $syarat->mode_efile,
                'dokumen' => [],
            ];
        }

        /*
         * Cari jenis dokumen di SIMPEG.
         */
        $dokumen = $this->getDokumenByJenis(
            $nip,
            $syarat->kode_efile
        );

        /*
         * Jenis dokumen tidak ditemukan
         * di response SIMPEG.
         */
        if (! $dokumen) {

            return [
                'tersedia' => false,
                'jenis' => $syarat->kode_efile,
                'mode' => $syarat->mode_efile,
                'dokumen' => [],
            ];
        }

        /*
         * =====================================================
         * AMBIL HANYA RIWAYAT DENGAN STATUS "ADA"
         * =====================================================
         *
         * Contoh:
         *
         * urutan 1 -> belum_ada
         * urutan 2 -> belum_ada
         * urutan 3 -> ada
         * urutan 4 -> ada
         *
         * Yang kita proses hanya:
         *
         * urutan 3
         * urutan 4
         */
        $dokumenAda = collect(
            $dokumen['riwayat'] ?? []
        )
            ->filter(function ($item) {

                return ($item['status'] ?? null) === 'ada';
            })
            ->values();

        /*
         * Tidak ada dokumen yang tersedia.
         */
        if ($dokumenAda->isEmpty()) {

            return [
                'tersedia' => false,
                'jenis' => $dokumen['jenis'] ?? $syarat->kode_efile,
                'mode' => $syarat->mode_efile,
                'dokumen' => [],
            ];
        }


        /**
         * =====================================================
         * MODE LATEST
         * =====================================================
         *
         * Ambil dokumen dengan:
         *
         * status = ada
         * DAN
         * urutan terbesar.
         *
         * Contoh:
         *
         * urutan 1 -> ada
         * urutan 2 -> ada
         * urutan 3 -> ada
         * urutan 4 -> ada
         * urutan 5 -> ada
         * urutan 6 -> ada
         *
         * Yang dipilih:
         *
         * urutan 6
         */
        if ($syarat->mode_efile === 'latest') {

            $terbaru = $dokumenAda
                ->sortByDesc(function ($item) {

                    return (int) (
                        $item['urutan'] ?? 0
                    );
                })
                ->first();

            return [
                'tersedia' => true,
                'jenis' => $dokumen['jenis'],
                'mode' => 'latest',
                'dokumen' => [
                    $terbaru
                ],
            ];
        }


        /**
         * =====================================================
         * MODE ALL
         * =====================================================
         *
         * Ambil semua dokumen dengan:
         *
         * status = ada
         *
         * Dokumen yang:
         *
         * status = belum_ada
         *
         * tidak ikut ditampilkan.
         *
         * Kita urutkan berdasarkan urutan terkecil
         * ke terbesar agar tampilannya rapi.
         */
        if ($syarat->mode_efile === 'all') {

            $semuaDokumen = $dokumenAda
                ->sortBy(function ($item) {

                    return (int) (
                        $item['urutan'] ?? 0
                    );
                })
                ->values()
                ->all();

            return [
                'tersedia' => true,
                'jenis' => $dokumen['jenis'],
                'mode' => 'all',
                'dokumen' => $semuaDokumen,
            ];
        }


        /**
         * =====================================================
         * MODE TIDAK DIKENAL
         * =====================================================
         *
         * Untuk keamanan, jangan menampilkan semua dokumen
         * jika mode_efile tidak sesuai konfigurasi.
         */
        Log::warning(
            'Mode e-file tidak dikenali.',
            [
                'nip' => $nip,
                'syarat_id' => $syarat->id ?? null,
                'kode_efile' => $syarat->kode_efile,
                'mode_efile' => $syarat->mode_efile,
            ]
        );

        return [
            'tersedia' => false,
            'jenis' => $dokumen['jenis'],
            'mode' => $syarat->mode_efile,
            'dokumen' => [],
        ];
    }

}
