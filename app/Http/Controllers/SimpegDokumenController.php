<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SimpegDokumenController extends Controller
{
    /**
     * Proxy stream dokumen SIMPEG dengan menyertakan Bearer Token backend.
     */
    public function preview(Request $request)
    {
        $rawUrl = $request->query('url') ?? $request->query('file');

        if (blank($rawUrl)) {
            abort(400, 'Parameter dokumen tidak ditemukan.');
        }

        $apiUrl = rtrim((string) config('services.simpeg.url'), '/');
        $token = (string) config('services.simpeg.token');

        if (blank($token)) {
            abort(500, 'Konfigurasi Token SIMPEG belum diatur.');
        }

        // Tentukan endpoint tujuan
        if (str_starts_with($rawUrl, 'http://') || str_starts_with($rawUrl, 'https://')) {
            $parsedHost = parse_url($rawUrl, PHP_URL_HOST);
            $allowedHost = parse_url($apiUrl, PHP_URL_HOST);

            $allowedHosts = array_filter([
                $allowedHost,
                'sso.bllkom.site',
                'simpegdev.bllkom.site',
            ]);

            if (!in_array($parsedHost, $allowedHosts, true)) {
                abort(403, 'Akses ke domain eksternal tidak diizinkan.');
            }

            $targetEndpoint = $rawUrl;
        } else {
            // Jika hanya token_base64 atau path relatif
            $cleanPath = ltrim($rawUrl, '/');
            if (str_starts_with($cleanPath, 'api/v1/')) {
                $baseOrigin = parse_url($apiUrl, PHP_URL_SCHEME) . '://' . parse_url($apiUrl, PHP_URL_HOST);
                $targetEndpoint = $baseOrigin . '/' . $cleanPath;
            } elseif (str_starts_with($cleanPath, 'dokumen/file/')) {
                $targetEndpoint = $apiUrl . '/' . $cleanPath;
            } else {
                $targetEndpoint = $apiUrl . '/dokumen/file/' . $cleanPath;
            }
        }

        try {
            $response = Http::withoutVerifying()
                ->connectTimeout(5)
                ->timeout(20)
                ->withToken($token)
                ->get($targetEndpoint);

            if (!$response->successful()) {
                Log::warning('Gagal mengambil dokumen SIMPEG via proxy.', [
                    'url' => $targetEndpoint,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                abort($response->status() === 404 ? 404 : 502, 'Dokumen SIMPEG tidak dapat diakses atau tidak ditemukan.');
            }

            $contentType = $response->header('Content-Type') ?: 'application/pdf';
            $contentLength = strlen($response->body());

            return response($response->body(), 200, [
                'Content-Type' => $contentType,
                'Content-Disposition' => 'inline; filename="dokumen_simpeg.pdf"',
                'Content-Length' => $contentLength,
                'Cache-Control' => 'private, max-age=3600',
            ]);
        } catch (\Throwable $e) {
            Log::error('Exception pada proxy dokumen SIMPEG.', [
                'url' => $targetEndpoint,
                'error' => $e->getMessage(),
            ]);

            abort(500, 'Terjadi kesalahan saat memuat dokumen dari server SIMPEG.');
        }
    }
}
