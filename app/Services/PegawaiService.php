<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class PegawaiService
{
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

            $json = $response->json();

            if (!$json || empty($json['success'])) {
                return null;
            }

            return $json['data'] ?? null;
        });
    }
}
