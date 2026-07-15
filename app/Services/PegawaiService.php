<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class PegawaiService
{
    /**
     * Mengambil data pegawai dari SIMPEG.
     */
    public function getPegawaiByNip(?string $nip): ?array
    {
        if (blank($nip)) {
            return null;
        }

        return Cache::remember(
            "pegawai:{$nip}",
            now()->addDay(),
            function () use ($nip) {

                try {

                    $response = Http::withoutVerifying()
                        ->connectTimeout(5)
                        ->timeout(10)
                        ->retry(2, 300, throw: false)
                        ->acceptJson()
                        ->withToken(config('services.simpeg.token'))
                        ->get(
                            config('services.simpeg.url') . "/pegawai/{$nip}"
                        );

                    if (! $response->successful()) {

                        Log::warning('SIMPEG API gagal.', [
                            'nip' => $nip,
                            'status' => $response->status(),
                        ]);

                        return null;
                    }

                    // Hilangkan UTF-8 BOM
                    $body = preg_replace(
                        '/^\xEF\xBB\xBF/',
                        '',
                        $response->body()
                    );

                    $json = json_decode($body, true);

                    if (json_last_error() !== JSON_ERROR_NONE) {

                        Log::error('JSON SIMPEG tidak valid.', [
                            'nip' => $nip,
                            'error' => json_last_error_msg(),
                        ]);

                        return null;
                    }

                    if (
                        !isset($json['success']) ||
                        $json['success'] !== true ||
                        empty($json['data'])
                    ) {

                        Log::warning('Data pegawai tidak ditemukan.', [
                            'nip' => $nip,
                        ]);

                        return null;
                    }

                    return $json['data'];
                } catch (\Throwable $e) {

                    Log::error('Exception SIMPEG.', [
                        'nip' => $nip,
                        'message' => $e->getMessage(),
                    ]);

                    return null;
                }
            }
        );
    }

    /**
     * Mengambil beberapa data pegawai berdasarkan daftar NIP.
     *
     * @param array|Collection $nips
     * @return array
     */
    public function getPegawaiByNips(array|Collection $nips): array
    {
        return collect($nips)

            // hilangkan null
            ->filter()

            // hilangkan duplikat
            ->unique()

            ->mapWithKeys(function ($nip) {

                return [
                    $nip => $this->getPegawaiByNip($nip)
                ];
            })

            ->all();
    }
}
