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

            Log::error(
                'Konfigurasi SIMPEG belum lengkap.',
                [
                    'url' => $url,
                ]
            );

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
             * Pastikan API mengembalikan:
             *
             * success = true
             * data    = array
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

            return $json['data'];
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
     *
     * Yang TIDAK digunakan lagi:
     *
     * - mode_efile
     *
     * =========================================================
     *
     * Untuk metode = simpeg:
     *
     * 1. Cari jenis dokumen berdasarkan kode_efile.
     * 2. Ambil riwayat dengan status = ada.
     * 3. Urutkan berdasarkan urutan.
     *
     * Semua dokumen yang berstatus "ada" dikembalikan.
     *
     * Jika tidak ada dokumen "ada", maka:
     *
     * tersedia = false
     *
     * sehingga pada Step 3 dokumen dapat di-upload manual.
     */
    public function getSyaratDokumen(
        string $nip,
        $syarat
    ): array {

        /*
         * =====================================================
         * SYARAT UPLOAD
         * =====================================================
         *
         * Jika metode bukan simpeg,
         * service ini tidak mengambil data dari SIMPEG.
         */
        if ($syarat->metode !== 'simpeg') {

            return [
                'tersedia' => false,
                'jenis' => null,
                'dokumen' => [],
            ];
        }

        /*
         * =====================================================
         * KODE E-FILE
         * =====================================================
         *
         * kode_efile masih digunakan sebagai mapping
         * sementara antara tb_syarat dengan:
         *
         * data.dokumen[].jenis
         */
        if (blank($syarat->kode_efile)) {

            return [
                'tersedia' => false,
                'jenis' => null,
                'dokumen' => [],
            ];
        }

        /*
         * =====================================================
         * CARI JENIS DOKUMEN DI SIMPEG
         * =====================================================
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
                'dokumen' => [],
            ];
        }

        /*
         * =====================================================
         * AMBIL RIWAYAT DENGAN STATUS "ADA"
         * =====================================================
         *
         * Contoh:
         *
         * urutan 1 -> belum_ada
         * urutan 2 -> belum_ada
         * urutan 3 -> ada
         * urutan 4 -> ada
         *
         * Yang diproses:
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
            ->sortBy(function ($item) {

                return (int) (
                    $item['urutan'] ?? 0
                );
            })
            ->values();

        /*
         * =====================================================
         * TIDAK ADA DOKUMEN
         * =====================================================
         */
        if ($dokumenAda->isEmpty()) {

            return [
                'tersedia' => false,
                'jenis' => $dokumen['jenis']
                    ?? $syarat->kode_efile,
                'dokumen' => [],
            ];
        }

        /*
         * =====================================================
         * DOKUMEN TERSEDIA
         * =====================================================
         *
         * Semua riwayat dengan status "ada"
         * dikembalikan berdasarkan urutan terkecil
         * sampai terbesar.
         *
         * Tidak ada lagi mode:
         *
         * latest
         * all
         */
        return [
            'tersedia' => true,
            'jenis' => $dokumen['jenis']
                ?? $syarat->kode_efile,
            'dokumen' => $dokumenAda->all(),
        ];
    }
}