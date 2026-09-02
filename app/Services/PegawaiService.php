<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PegawaiService
{
    /**
     * Cache data pegawai selama 1 hari.
     */
    private const PEGAWAI_CACHE_TTL = 86400;

    /**
     * Circuit breaker selama 1 menit.
     */
    private const OFFLINE_CACHE_TTL = 60;

    protected function isOffline(): bool
    {
        return Cache::has('simpeg:offline');
    }

    protected function setOffline(): void
    {
        Cache::put(
            'simpeg:offline',
            true,
            now()->addSeconds(self::OFFLINE_CACHE_TTL)
        );
    }

    protected function clearOffline(): void
    {
        Cache::forget('simpeg:offline');
    }

    /**
     * Ambil data pegawai berdasarkan NIP.
     */
    public function getPegawaiByNip(?string $nip): ?array
    {
        if (blank($nip)) {
            return null;
        }

        $cacheKey = "pegawai:{$nip}";

        // Ambil dari cache
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Circuit breaker
        if ($this->isOffline()) {

            Log::info('SIMPEG sedang offline (circuit breaker aktif).', [
                'nip' => $nip,
            ]);

            return null;
        }

        $url = rtrim((string) config('services.simpeg.url'), '/');
        $token = (string) config('services.simpeg.token');

        // Validasi konfigurasi
        if (blank($url) || blank($token)) {

            Log::error('Konfigurasi SIMPEG belum lengkap.', [
                'url' => $url,
            ]);

            return null;
        }

        try {

            $response = Http::withoutVerifying()
                ->connectTimeout(2)
                ->timeout(3)
                ->retry(1, 200, throw: false)
                ->acceptJson()
                ->withToken($token)
                ->get("{$url}/pegawai/{$nip}");

            // Hanya 5xx dianggap server bermasalah
            if ($response->serverError()) {

                $this->setOffline();

                Log::warning('SIMPEG Server Error.', [
                    'url'    => "{$url}/pegawai/{$nip}",
                    'status' => $response->status(),
                    'nip'    => $nip,
                ]);

                return null;
            }

            // Error selain 5xx (401,403,404,422,dll)
            if (! $response->successful()) {

                Log::warning('SIMPEG Request Gagal.', [
                    'url'    => "{$url}/pegawai/{$nip}",
                    'status' => $response->status(),
                    'nip'    => $nip,
                    'body'   => $response->body(),
                ]);

                return null;
            }

            // Hilangkan BOM UTF-8 jika ada
            $body = preg_replace('/^\xEF\xBB\xBF/', '', $response->body());

            $json = json_decode($body, true);

            if (json_last_error() !== JSON_ERROR_NONE) {

                Log::error('JSON SIMPEG tidak valid.', [
                    'nip'   => $nip,
                    'error' => json_last_error_msg(),
                ]);

                return null;
            }

            if (
                ! isset($json['success']) ||
                $json['success'] !== true ||
                empty($json['data'])
            ) {

                Log::warning('Data pegawai tidak ditemukan.', [
                    'nip' => $nip,
                ]);

                return null;
            }

            // Pastikan foto_url tersedia di response data pegawai
            if (empty($json['data']['foto_url']) && !empty($json['data']['nip'])) {
                $baseUrl = preg_replace('/\/api.*$/i', '', $url);
                $json['data']['foto_url'] = "{$baseUrl}/pegawai/foto/{$json['data']['nip']}";
            }

            // SIMPEG kembali normal
            $this->clearOffline();

            // Simpan cache pegawai
            Cache::put(
                $cacheKey,
                $json['data'],
                now()->addSeconds(self::PEGAWAI_CACHE_TTL)
            );

            return $json['data'];
        } catch (\Throwable $e) {

            $this->setOffline();

            Log::error('Exception SIMPEG.', [
                'nip'     => $nip,
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return null;
        }
    }

    /**
     * Dapatkan URL foto pegawai dari SIMPEG.
     */
    public function getFotoUrl(?string $nip): string
    {
        if (blank($nip)) {
            return asset('templatepro/assets/img/demo/user-placeholder.svg');
        }

        $url = rtrim((string) config('services.simpeg.url'), '/');
        if ($url) {
            $baseUrl = preg_replace('/\/api.*$/i', '', $url);
            return "{$baseUrl}/pegawai/foto/{$nip}";
        }

        return "https://simpegdev.bllkom.site/pegawai/foto/{$nip}";
    }

    /**
     * Ambil beberapa data pegawai sekaligus.
     */
    public function getPegawaiByNips(array|Collection $nips): array
    {
        return collect($nips)
            ->filter()
            ->unique()
            ->mapWithKeys(function ($nip) {

                $nip = (string) $nip;

                return [
                    $nip => $this->getPegawaiByNip($nip)
                ];
            })
            ->all();
    }

    /**
     * Status SIMPEG.
     */
    public function isSimpegAvailable(): bool
    {
        return ! $this->isOffline();
    }

    /**
     * Hapus cache satu pegawai.
     */
    public function clearPegawaiCache(string $nip): void
    {
        Cache::forget("pegawai:{$nip}");
    }

    /**
     * Reset circuit breaker.
     */
    public function resetOfflineStatus(): void
    {
        $this->clearOffline();
    }
}
