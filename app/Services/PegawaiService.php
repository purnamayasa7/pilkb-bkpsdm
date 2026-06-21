<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PegawaiService
{
    // Sementara
    public function getPegawaiByNip($nip)
    {
        return Cache::remember("pegawai_$nip", 3600, function () use ($nip) {

            $response = Http::withoutVerifying()
                ->withToken(env('SIMPEG_API_TOKEN'))
                ->get(env('SIMPEG_API_URL') . '/pegawai/' . $nip);

            if ($response->failed()) {

                Log::error($response->body());

                return null;
            }

            $body = $response->body();

            // Hilangkan BOM dari response SIMPEG
            $body = preg_replace('/^\xEF\xBB\xBF/', '', $body);

            $json = json_decode($body, true);

            if (json_last_error() !== JSON_ERROR_NONE) {

                Log::error('JSON Decode Error: ' . json_last_error_msg(), [
                    'body' => $body
                ]);

                return null;
            }

            if (!$json || empty($json['success'])) {
                return null;
            }

            return $json['data'] ?? null;
        });
    }
    // public function getPegawaiByNip($nip)
    // {
    //     return Cache::remember("pegawai_$nip", 3600, function () use ($nip) {

    //         $response = Http::withoutVerifying()
    //             ->withToken(env('SIMPEG_API_TOKEN'))
    //             ->get(env('SIMPEG_API_URL') . '/pegawai/' . $nip);

    //         if ($response->failed()) {

    //             Log::error($response->body());

    //             return null;
    //         }

    //         $json = $response->json();

    //         if (!$json || empty($json['success'])) {
    //             return null;
    //         }

    //         return $json['data'] ?? null;
    //     });
    // }
}
