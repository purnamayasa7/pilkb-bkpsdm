<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class PegawaiService
{
    protected bool $simpegAvailable = true;

    protected function isOffline(): bool
    {
        return Cache::has('simpeg:offline');
    }

    protected function setOffline(): void
    {
        Cache::put(
            'simpeg:offline',
            true,
            now()->addMinutes(5)
        );

        $this->simpegAvailable = false;
    }

    protected function clearOffline(): void
    {
        Cache::forget('simpeg:offline');

        $this->simpegAvailable = true;
    }

    /**
     * Mengambil data pegawai dari SIMPEG.
     */
    public function getPegawaiByNip(?string $nip): ?array
    {
        if (blank($nip)) {
            return null;
        }

        $cacheKey = "pegawai:{$nip}";

        // 1. Ambil dari cache terlebih dahulu
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Jika SIMPEG sedang offline, jangan call API
        if ($this->isOffline()) {
            return null;
        }

        try {

            $response = Http::withoutVerifying()
                ->connectTimeout(2)
                ->timeout(3)
                ->retry(1, 200, throw: false)
                ->acceptJson()
                ->withToken(config('services.simpeg.token'))
                ->get(
                    config('services.simpeg.url') . "/pegawai/{$nip}"
                );

            if (! $response->successful()) {

                $this->setOffline();

                Log::warning('SIMPEG API gagal.', [
                    'nip' => $nip,
                    'status' => $response->status(),
                ]);

                return null;
            }

            $body = preg_replace('/^\xEF\xBB\xBF/', '', $response->body());

            $json = json_decode($body, true);

            if (json_last_error() !== JSON_ERROR_NONE) {

                $this->setOffline();

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

            // SIMPEG kembali normal
            $this->clearOffline();

            // Simpan cache pegawai
            Cache::put(
                $cacheKey,
                $json['data'],
                now()->addDay()
            );

            return $json['data'];
        } catch (\Throwable $e) {

            $this->setOffline();

            Log::error('Exception SIMPEG.', [
                'nip' => $nip,
                'message' => $e->getMessage(),
            ]);

            return null;
        }
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

    public function isSimpegAvailable(): bool
    {
        return ! Cache::has('simpeg:offline');
    }
}
