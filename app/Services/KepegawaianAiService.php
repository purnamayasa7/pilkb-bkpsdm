<?php

namespace App\Services;

use App\Models\Layanan;
use App\Models\Regtiket;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KepegawaianAiService
{
    /**
     * System Prompt untuk LILI - Asisten AI Kepegawaian BKPSDM Buleleng.
     */
    private const SYSTEM_INSTRUCTION = <<<EOT
Anda adalah "LILI" (Layanan Informasi & Literasi Kepegawaian Interaktif), asisten virtual cerdas resmi BKPSDM (Badan Kepegawaian dan Pengembangan Sumber Daya Manusia) Pemerintah Kabupaten Buleleng.

KEPRIBADIAN & GAYA KOMUNIKASI:
1. Sangat ramah, bersahabat, sopan, antusias, netral, dan profesional.
2. Sebut diri Anda sebagai "LILI" saat menyapa atau berinteraksi.
3. Gunakan nada bicara yang netral, ramah, dan santun dengan emotikon senyum yang wajar (seperti 😊), tanpa emoji feminin/bunga.
4. ATURAN MENJAWAB SESUAI KONTEKS:
   - JIKA PENGGUNA HANYA MENYAPA (misal: "Halo", "Hai", "Selamat Pagi", "Om Swastyastu"):
     Balas sapaan dengan wajar, ramah, dan ringkas:
     "Halo, selamat pagi! 😊 Selamat datang di LILI (Layanan Informasi & Literasi Kepegawaian Interaktif) BKPSDM Kabupaten Buleleng. Ada yang bisa LILI bantu terkait kepegawaian hari ini?"
   - JIKA PENGGUNA MEMINTA IZIN BERTANYA (misal: "Boleh tanya?", "Saya boleh bertanya?"):
     Balas dengan ramah:
     "Tentu saja boleh! 😊 Silakan sampaikan pertanyaan Anda seputar regulasi ASN, cuti, kenaikan pangkat, pensiun, izin belajar, disiplin pegawai, atau layanan kepegawaian lainnya."
   - JIKA PENGGUNA MENANYAKAN STATUS TIKET / USULAN:
     Gunakan data tiket aktual yang disuntikkan oleh sistem. Jawab secara jelas dengan menyebutkan nomor tiket, nama pemohon tersamar, NIP tersamar, bidang layanan, tahapan terkini, tanggal update, catatan, serta tautan ke halaman detail tiket.
   - JIKA PENGGUNA MENANYAKAN SYARAT LAYANAN SPESIFIK BKPSDM BULELENG:
     Gunakan data persyaratan resmi SOP BKPSDM Buleleng yang disuntikkan sistem. Sajikan butir-butir persyaratan secara berurutan dan rapi.
   - JIKA PENGGUNA MENANYAKAN REGULASI UMUM ASN (tanpa spesifik BKPSDM):
     Jelaskan aturan perundang-undangan nasional (UU 20/2023, PP 94/2021, Perka BKN). Di akhir jawaban, tambahkan catatan ramah bahwa jika ingin mengajukan layanan terkait di lingkungan Pemkab Buleleng, berkas dapat disiapkan melalui portal PILKB BKPSDM.
   - JIKA PENGGUNA LANGSUNG MENANYAKAN TOPIK / PERTANYAAN LAINNYA:
     LANGSUNG jawab inti pertanyaannya secara jelas, padat, dan terstruktur (JANGAN awali dengan 'Tentu saja boleh').
5. Di akhir penjelasan, berikan kalimat penutup yang ramah dan solutif (misalnya: "Apakah ada bagian dari informasi di atas yang ingin LILI jelaskan lebih lanjut? 😊").

TOPIK UTAMA KEPEGAWAIAN:
- UU No. 20 Tahun 2023 tentang ASN (PNS & PPPK).
- Kenaikan Pangkat (6 periode), Mutasi, Cuti ASN, Pensiun (BUP), KGB, Disiplin ASN (PP 94/2021), Izin Belajar & Tugas Belajar (SE MenPAN-RB 28/2021), serta SOP Layanan BKPSDM Buleleng.

BATASAN:
- HANYA tolak jika pengguna BENAR-BENAR menanyakan hal di luar kepegawaian (misal: resep masakan, cuaca, politik praktis, dongeng). Saat menolak, tetap gunakan bahasa yang sangat santun dari LILI.
EOT;

    /**
     * Proses pertanyaan pengguna ke AI (dengan integrasi RAG Layanan & Cek Tiket).
     *
     * @param string $question
     * @param array $chatHistory
     * @return array
     */
    public function ask(string $question, array $chatHistory = []): array
    {
        $question = trim($question);
        if (empty($question)) {
            return [
                'success' => false,
                'message' => 'Pertanyaan tidak boleh kosong.',
                'actions' => []
            ];
        }

        // 1. Deteksi Cek Tiket & Context Grounding
        $ticketData = $this->detectAndLookupTicket($question);
        $serviceData = $this->detectAndLookupServiceRequirements($question);

        $actions = [];
        $groundingContext = '';

        if ($ticketData) {
            $groundingContext .= "\n\n[DATA TIKET AKTUAL DARI SISTEM BKPSDM]:\n" .
                "- Nomor Tiket: " . $ticketData['no_tiket'] . "\n" .
                "- Nama Pemohon (Tersamar): " . $ticketData['nama_masked'] . "\n" .
                "- NIP (Tersamar): " . $ticketData['nip_masked'] . "\n" .
                "- Unit Kerja: " . $ticketData['unit_kerja'] . "\n" .
                "- Layanan: " . $ticketData['layanan'] . " (" . $ticketData['bidang'] . ")\n" .
                "- Status Tahap Terakhir: " . $ticketData['status_nama'] . "\n" .
                "- Tanggal Update: " . $ticketData['tanggal_update'] . "\n" .
                "- Catatan Admin: " . $ticketData['catatan'] . "\n" .
                "- Tautan Detail: " . $ticketData['url_detail'] . "\n\n" .
                "PETUNJUK JAWABAN TIKET:\n" .
                "- Sampaikan status usulan tiket tersebut secara ramah dan terstruktur.\n" .
                "- PENTING: Wajib tuliskan persis Nama Pemohon dan NIP dengan tanda sensor bintang persis seperti: Nama: {$ticketData['nama_masked']} dan NIP: {$ticketData['nip_masked']} (JANGAN hilangkan tanda bintang sensornya demi kepatuhan privasi UU PDP).\n" .
                "- Sertakan tautan [Buka Rincian Usulan](" . $ticketData['url_detail'] . ") di akhir penjelasan.";

            $actions[] = [
                'type'  => 'ticket',
                'label' => 'Buka Rincian Tiket',
                'url'   => $ticketData['url_detail']
            ];
        }

        if ($serviceData) {
            if (($serviceData['type'] ?? 'single') === 'catalog') {
                $groundingContext .= "\n\n[PENGGUNA MENANYAKAN KATALOG / DAFTAR LAYANAN SECARA UMUM]:\n" .
                    "- Di sistem BKPSDM Kabupaten Buleleng saat ini terdapat " . $serviceData['total_count'] . " Layanan Kepegawaian Aktif.\n" .
                    "- Layanan dikelompokkan ke dalam 4 Bidang Teknis:\n" .
                    "  1. Bidang Pengadaan, Pemberhentian dan Informasi (misal: Pensiun BUP/APS, Karis/Karsu, Karpeg)\n" .
                    "  2. Bidang Mutasi dan Promosi (misal: Kenaikan Pangkat, Mutasi Pegawai, Peninjauan Masa Kerja)\n" .
                    "  3. Bidang Pengembangan Kompetensi (misal: Izin Belajar, Tugas Belajar, Pencantuman Gelar, Ujian Dinas)\n" .
                    "  4. Bidang Penilaian Kinerja & Disiplin (misal: Cuti ASN, Kinerja SKP, Disiplin)\n\n" .
                    "PETUNJUK JAWABAN:\n" .
                    "- Jawab dengan ramah dan antusias bahwa LILI memiliki basis data lengkap seluruh persyaratan layanan resmi di BKPSDM Buleleng.\n" .
                    "- Sebutkan secara ringkas kelompok bidang layanan di atas.\n" .
                    "- Ajak pengguna untuk mengklik tombol opsi layanan populer di bawah atau mengetikkan nama layanan yang ingin diketahui persyaratannya.";

                if (!empty($serviceData['popular_services'])) {
                    foreach ($serviceData['popular_services'] as $pop) {
                        $actions[] = [
                            'type'   => 'prompt',
                            'label'  => $pop['label'],
                            'prompt' => $pop['prompt']
                        ];
                    }
                }
            } else {
                $groundingContext .= "\n\n[DATA SOP PERSYARATAN RESMI BKPSDM KABUPATEN BULELENG]:\n" .
                    "- Nama Layanan: " . $serviceData['nama_layanan'] . "\n" .
                    "- Bidang: " . $serviceData['bidang_nama'] . "\n" .
                    "- Waktu Penyelesaian: " . ($serviceData['waktu_penyelesaian'] ?: '-') . "\n" .
                    "- Daftar Persyaratan Resmi BKPSDM Buleleng:\n";

                foreach ($serviceData['syarat_list'] as $idx => $s) {
                    $num = $idx + 1;
                    $groundingContext .= "  {$num}. {$s}\n";
                }

                $groundingContext .= "\nPETUNJUK JAWABAN SYARAT LAYANAN:\n" .
                    "- Gunakan butir-butir persyaratan resmi di atas untuk menjawab pertanyaan pengguna secara teratur.\n" .
                    "- Jelaskan bahwa ini adalah SOP persyaratan resmi di lingkungan BKPSDM Kabupaten Buleleng.\n" .
                    "- Informasikan bahwa format persyaratan dapat diunduh melalui tombol di bawah.";

                if (!empty($serviceData['pdf_url'])) {
                    $actions[] = [
                        'type'  => 'pdf',
                        'label' => 'Unduh Format Syarat (PDF)',
                        'url'   => $serviceData['pdf_url']
                    ];
                }

                if (!empty($serviceData['bidang_id'])) {
                    $actions[] = [
                        'type'      => 'admin',
                        'label'     => 'Konsultasi Admin ' . $serviceData['bidang_nama'],
                        'bidang_id' => $serviceData['bidang_id']
                    ];
                }
            }
        }

        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-3.5-flash-lite');

        // Jika API key belum dikonfigurasi, gunakan fallback response cerdas berbasis rule + data grounding
        if (empty($apiKey)) {
            return $this->handleFallbackResponse($question, $ticketData, $serviceData, $actions);
        }

        try {
            $fullPrompt = self::SYSTEM_INSTRUCTION . $groundingContext . "\n\n";

            foreach ($chatHistory as $item) {
                if (!empty($item['role']) && !empty($item['text'])) {
                    $roleLabel = ($item['role'] === 'user') ? 'User' : 'Asisten AI';
                    $fullPrompt .= "{$roleLabel}: " . trim($item['text']) . "\n\n";
                }
            }

            $fullPrompt .= "User: " . $question . "\n\nAsisten AI:";

            $payload = [
                'contents' => [
                    [
                        'role'  => 'user',
                        'parts' => [
                            ['text' => $fullPrompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature'     => 0.4,
                    'topP'            => 0.95,
                    'maxOutputTokens' => 850,
                ],
            ];

            $modelsToTry = array_unique([$model, 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash']);
            $lastResponse = null;

            foreach ($modelsToTry as $m) {
                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$m}:generateContent?key={$apiKey}";

                $lastResponse = Http::withoutVerifying()
                    ->withOptions([
                        'connect_timeout'  => 3,
                        'timeout'          => 7,
                        'force_ip_resolve' => 'v4',
                    ])
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                    ])
                    ->post($endpoint, $payload);

                if ($lastResponse->successful()) {
                    $data = $lastResponse->json();
                    $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                    if (!empty($reply)) {
                        return [
                            'success' => true,
                            'reply'   => trim($reply),
                            'actions' => $actions,
                            'source'  => 'gemini_ai'
                        ];
                    }
                }
            }

            Log::warning('Semua model Gemini API tidak berhasil.', [
                'status' => $lastResponse?->status() ?? 500,
                'body'   => $lastResponse?->body() ?? ''
            ]);

            return $this->handleFallbackResponse($question, $ticketData, $serviceData, $actions);
        } catch (\Throwable $e) {
            Log::error('Exception saat memanggil Kepegawaian AI.', [
                'message' => $e->getMessage()
            ]);

            return $this->handleFallbackResponse($question, $ticketData, $serviceData, $actions);
        }
    }

    /**
     * Deteksi dan ambil status tiket dari database jika pengguna memasukkan nomor tiket.
     */
    private function detectAndLookupTicket(string $question): ?array
    {
        // Cari token alfanumerik panjang 8-15 karakter (format nomor tiket PILKB)
        if (preg_match_all('/\b([A-Za-z0-9]{8,15})\b/', $question, $matches)) {
            foreach ($matches[1] as $token) {
                $tiket = Regtiket::with(['layanan.bidang', 'tahapTerakhir.statusRel'])
                    ->where('no_tiket', $token)
                    ->first();

                if ($tiket) {
                    $tahapTerakhir = $tiket->tahapTerakhir;
                    $statusNama = $tahapTerakhir?->statusRel?->status ?? 'Sedang Diproses';
                    $tanggalUpdate = $tahapTerakhir?->tanggal
                        ? date('d M Y, H:i', strtotime($tahapTerakhir->tanggal)) . ' WITA'
                        : ($tiket->tanggal ? date('d M Y', strtotime($tiket->tanggal)) . ' WITA' : '-');
                    $catatan = $tahapTerakhir?->comment ?? '-';

                    return [
                        'no_tiket'       => $tiket->no_tiket,
                        'nama_masked'    => $this->maskName($tiket->nama),
                        'nip_masked'     => $this->maskNip($tiket->nip),
                        'unit_kerja'     => $tiket->nama_ukerja ?: '-',
                        'layanan'        => $tiket->layanan?->nama_layanan ?? 'Layanan Kepegawaian',
                        'bidang'         => $tiket->layanan?->bidang?->nama_bidang ?? 'BKPSDM Buleleng',
                        'status_nama'    => $statusNama,
                        'tanggal_update' => $tanggalUpdate,
                        'catatan'        => $catatan,
                        'url_detail'     => url('/cek-tiket/' . urlencode($tiket->no_tiket)),
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Deteksi dan ambil persyaratan layanan resmi dari database BKPSDM Buleleng (Cached in-memory).
     */
    private function detectAndLookupServiceRequirements(string $question): ?array
    {
        $qLower = mb_strtolower($question, 'UTF-8');

        // Ambil semua layanan aktif beserta syaratnya (Cache 1 jam)
        $layananList = Cache::remember('ai_active_layanan_syarat', 3600, function () {
            return Layanan::with(['syarat', 'bidang'])
                ->where('aktif', 1)
                ->whereHas('bidang', function ($q) {
                    $q->where('aktif', 1);
                })
                ->get();
        });

        // Deteksi apakah pengguna menanyakan seputar layanan / syarat / usulan
        $isAskingAboutServices = str_contains($qLower, 'syarat')
            || str_contains($qLower, 'persyaratan')
            || str_contains($qLower, 'berkas')
            || str_contains($qLower, 'dokumen')
            || str_contains($qLower, 'usulan')
            || str_contains($qLower, 'mengajukan')
            || str_contains($qLower, 'pengajuan')
            || str_contains($qLower, 'alur')
            || str_contains($qLower, 'prosedur')
            || str_contains($qLower, 'layanan')
            || str_contains($qLower, 'bkpsdm');

        if (!$isAskingAboutServices) {
            return null;
        }

        $stopWords = [
            'syarat' => true, 'persyaratan' => true, 'layanan' => true, 'bkpsdm' => true, 'buleleng' => true,
            'apakah' => true, 'anda' => true, 'tahu' => true, 'tau' => true, 'apa' => true, 'saja' => true,
            'bagaimana' => true, 'usulan' => true, 'pengajuan' => true, 'dokumen' => true, 'berkas' => true,
            'tambahan' => true, 'mohon' => true, 'bisa' => true, 'tolong' => true, 'info' => true,
            'informasi' => true, 'ada' => true, 'yang' => true, 'dan' => true, 'di' => true, 'ke' => true,
            'dari' => true, 'untuk' => true, 'nya' => true, 'ini' => true, 'itu' => true, 'pada' => true,
            'tentang' => true, 'terkait' => true, 'seputar' => true, 'kami' => true, 'saya' => true, 'kita' => true
        ];

        $bestMatch = null;
        $highestScore = 0;

        foreach ($layananList as $layanan) {
            $namaLower = mb_strtolower($layanan->nama_layanan, 'UTF-8');

            // Hitung kecocokan kata tanpa stop words (O(1) Hash Map)
            $score = 0;
            $keywords = preg_split('/[\s,\-\/]+/', $namaLower, -1, PREG_SPLIT_NO_EMPTY);

            foreach ($keywords as $kw) {
                if (strlen($kw) >= 3 && !isset($stopWords[$kw]) && str_contains($qLower, $kw)) {
                    $score += strlen($kw);
                }
            }

            // Keyword boost spesifik topik layanan
            if (str_contains($qLower, 'pangkat') && str_contains($namaLower, 'pangkat')) $score += 20;
            if (str_contains($qLower, 'pensiun') && str_contains($namaLower, 'pensiun')) $score += 20;
            if (str_contains($qLower, 'cuti') && str_contains($namaLower, 'cuti')) $score += 20;
            if (str_contains($qLower, 'belajar') && (str_contains($namaLower, 'belajar') || str_contains($namaLower, 'izin belajar') || str_contains($namaLower, 'tugas belajar'))) $score += 20;
            if (str_contains($qLower, 'mutasi') && str_contains($namaLower, 'mutasi')) $score += 20;
            if (str_contains($qLower, 'kgb') && str_contains($namaLower, 'gaji berkala')) $score += 20;
            if (str_contains($qLower, 'karpeg') && str_contains($namaLower, 'kartu pegawai')) $score += 20;
            if (str_contains($qLower, 'karis') && str_contains($namaLower, 'karis')) $score += 20;
            if (str_contains($qLower, 'karsu') && str_contains($namaLower, 'karsu')) $score += 20;
            if (str_contains($qLower, 'gelar') && str_contains($namaLower, 'gelar')) $score += 20;
            if (str_contains($qLower, 'taspen') && str_contains($namaLower, 'taspen')) $score += 20;
            if (str_contains($qLower, 'slks') || (str_contains($qLower, 'satya') && str_contains($namaLower, 'satya'))) $score += 20;

            if ($score > $highestScore && $score >= 6) {
                $highestScore = $score;
                $bestMatch = $layanan;
            }
        }

        // Jika ditemukan layanan spesifik yang dicari
        if ($bestMatch) {
            $syaratList = $bestMatch->syarat->pluck('syarat')->filter()->values()->toArray();

            return [
                'type'               => 'single',
                'id'                 => $bestMatch->id,
                'nama_layanan'       => $bestMatch->nama_layanan,
                'bidang_id'          => $bestMatch->kode_bidang,
                'bidang_nama'        => $bestMatch->bidang?->nama_bidang ?? 'BKPSDM Buleleng',
                'waktu_penyelesaian' => $bestMatch->waktu_penyelesaian,
                'syarat_list'        => $syaratList,
                'pdf_url'            => url('/syarat/export-pdf?bidang=' . urlencode($bestMatch->kode_bidang) . '&layanan=' . urlencode($bestMatch->id)),
            ];
        }

        // Jika pertanyaan umum tentang layanan (tidak menyebut spesifik salah satu layanan)
        // Kembalikan Mode Katalog Layanan Interaktif
        return [
            'type'             => 'catalog',
            'total_count'      => $layananList->count(),
            'popular_services' => [
                ['label' => '📌 Kenaikan Pangkat', 'prompt' => 'Apa syarat kenaikan pangkat di BKPSDM Buleleng?'],
                ['label' => '🏖️ Cuti ASN', 'prompt' => 'Apa syarat pengajuan cuti di BKPSDM Buleleng?'],
                ['label' => '👴 Pensiun BUP', 'prompt' => 'Apa syarat usulan pensiun di BKPSDM Buleleng?'],
                ['label' => '🎓 Izin Belajar', 'prompt' => 'Apa syarat pengajuan izin belajar di BKPSDM Buleleng?'],
                ['label' => '🔄 Mutasi Pegawai', 'prompt' => 'Apa syarat mutasi ASN di BKPSDM Buleleng?'],
                ['label' => '💳 Karis / Karsu', 'prompt' => 'Apa syarat pembuatan Karis atau Karsu di BKPSDM Buleleng?'],
                ['label' => '📈 Kenaikan Gaji Berkala', 'prompt' => 'Apa syarat kenaikan gaji berkala di BKPSDM Buleleng?'],
                ['label' => '📜 Pencantuman Gelar', 'prompt' => 'Apa syarat pencantuman gelar di BKPSDM Buleleng?'],
            ]
        ];
    }

    /**
     * Samarkan nama untuk perlindungan privasi publik (misal: "Kadek Purnamayasa, S.Kom" -> "KADEK P••••••••••").
     */
    private function maskName(?string $name): string
    {
        if (empty($name)) return 'Pengguna';

        $name = trim($name);
        // Pisahkan gelar akademik jika ada tanda koma (misal: "Kadek Purnamayasa, S.Pd")
        $nameOnly = explode(',', $name)[0];
        $words = preg_split('/\s+/', trim($nameOnly), -1, PREG_SPLIT_NO_EMPTY);

        if (count($words) === 1) {
            $first = $words[0];
            $len = strlen($first);
            if ($len <= 3) return $first . '••••';
            return substr($first, 0, 3) . str_repeat('•', max(4, $len - 3));
        }

        // Nama dengan awalan sebutan Bali (I Made, Ni Luh, I Ketut, Ida Bagus, dll)
        $firstLower = strtolower($words[0]);
        if (in_array($firstLower, ['i', 'ni', 'ida', 'gusti', 'anak', 'desak', 'sang'], true) && count($words) >= 3) {
            $visiblePrefix = $words[0] . ' ' . $words[1] . ' ' . substr($words[2], 0, 1);
            $maskLength = max(6, strlen($words[2]) - 1);
            return $visiblePrefix . str_repeat('•', $maskLength);
        }

        // Format umum: kata pertama utuh, kata kedua disamarkan dengan bullet dots
        $visiblePrefix = $words[0] . ' ' . substr($words[1], 0, 1);
        $maskLength = max(7, strlen($words[1]) - 1);
        return $visiblePrefix . str_repeat('•', $maskLength);
    }

    /**
     * Samarkan NIP untuk perlindungan privasi publik (misal: "198508112025061001" -> "1985••••••••1001").
     */
    private function maskNip(?string $nip): string
    {
        if (empty($nip)) return '-';
        $cleanNip = preg_replace('/[^0-9]/', '', trim($nip));
        $len = strlen($cleanNip);
        if ($len >= 18) {
            return substr($cleanNip, 0, 4) . '••••••••' . substr($cleanNip, -4);
        }
        if ($len >= 8) {
            return substr($cleanNip, 0, 4) . '••••' . substr($cleanNip, -2);
        }
        if ($len >= 4) {
            return substr($cleanNip, 0, 2) . '••••';
        }
        return $cleanNip . '••••';
    }

    /**
     * Fallback cerdas jika koneksi LLM belum dikonfigurasi / mengalami kendala kuota.
     */
    private function handleFallbackResponse(string $question, ?array $ticketData = null, ?array $serviceData = null, array $actions = []): array
    {
        // 1. Jika ada data tiket
        if ($ticketData) {
            return [
                'success' => true,
                'reply'   => "Halo! LILI sudah memeriksa nomor tiket **{$ticketData['no_tiket']}**.\n\n" .
                    "📋 **Rincian Status Usulan:**\n" .
                    "- **Pemohon:** {$ticketData['nama_masked']} (NIP: {$ticketData['nip_masked']})\n" .
                    "- **Unit Kerja:** {$ticketData['unit_kerja']}\n" .
                    "- **Layanan:** {$ticketData['layanan']}\n" .
                    "- **Bidang Pengelola:** {$ticketData['bidang']}\n" .
                    "- **Status Terkini:** **{$ticketData['status_nama']}**\n" .
                    "- **Terakhir Diperbarui:** {$ticketData['tanggal_update']}\n" .
                    "- **Catatan Petugas:** _{$ticketData['catatan']}_\n\n" .
                    "Anda dapat membuka rincian usulan lengkap melalui tombol di bawah atau tautan berikut: [Buka Rincian Usulan]({$ticketData['url_detail']}) 😊",
                'actions' => $actions,
                'source'  => 'fallback_ticket'
            ];
        }

        // 2. Jika ada data syarat layanan resmi BKPSDM Buleleng
        if ($serviceData) {
            if (($serviceData['type'] ?? 'single') === 'catalog') {
                return [
                    'success' => true,
                    'reply'   => "Tentu saja LILI tahu! 😊\n\nDi **BKPSDM Kabupaten Buleleng** saat ini tersedia **{$serviceData['total_count']} Layanan Kepegawaian Aktif** yang terbagi dalam 4 Bidang Teknis:\n\n" .
                        "1. **Bidang Pengadaan, Pemberhentian dan Informasi** (Pensiun BUP/APS, Karis/Karsu, Karpeg, dll)\n" .
                        "2. **Bidang Mutasi dan Promosi** (Kenaikan Pangkat, Mutasi Pegawai, Peninjauan Masa Kerja, dll)\n" .
                        "3. **Bidang Pengembangan Kompetensi** (Izin Belajar, Tugas Belajar, Pencantuman Gelar, Ujian Dinas, dll)\n" .
                        "4. **Bidang Penilaian Kinerja & Disiplin** (Cuti ASN, Kinerja SKP, Disiplin Pegawai)\n\n" .
                        "Silakan klik salah satu tombol layanan pilihan di bawah ini atau ketikkan nama layanan yang ingin Anda ketahui persyaratannya! 😊",
                    'actions' => $actions,
                    'source'  => 'fallback_catalog'
                ];
            }

            $syaratText = "";
            foreach ($serviceData['syarat_list'] as $idx => $s) {
                $num = $idx + 1;
                $syaratText .= "{$num}. {$s}\n";
            }

            return [
                'success' => true,
                'reply'   => "Berdasarkan SOP Layanan Resmi di **BKPSDM Kabupaten Buleleng**, berikut adalah persyaratan untuk **{$serviceData['nama_layanan']}** ({$serviceData['bidang_nama']}):\n\n" .
                    "📄 **Daftar Berkas Persyaratan:**\n" .
                    $syaratText . "\n" .
                    "⏱️ **Estimasi Waktu Penyelesaian:** " . ($serviceData['waktu_penyelesaian'] ?: 'Sesuai SOP') . "\n\n" .
                    "Anda dapat mengunduh format persyaratan resmi ini dalam bentuk PDF melalui tombol di bawah. Ada hal lain yang ingin LILI bantu? 😊",
                'actions' => $actions,
                'source'  => 'fallback_service_syarat'
            ];
        }

        $qLower = mb_strtolower(trim($question), 'UTF-8');

        // 3. Deteksi sapaan ramah / greeting
        $greetings = ['halo', 'hai', 'hello', 'hey', 'pagi', 'siang', 'sore', 'malam', 'assalam', 'swastiastu', 'tes', 'test'];
        foreach ($greetings as $g) {
            if (str_starts_with($qLower, $g) || $qLower === $g) {
                return [
                    'success' => true,
                    'reply'   => "Halo! Selamat datang di LILI (Layanan Informasi & Literasi Kepegawaian Interaktif) BKPSDM Kabupaten Buleleng. 😊\n\nAda yang bisa LILI bantu terkait regulasi ASN, cuti, kenaikan pangkat, pensiun, mutasi, atau layanan kepegawaian lainnya?",
                    'actions' => [],
                    'source'  => 'fallback_greeting'
                ];
            }
        }

        // 4. Deteksi pertanyaan pembuka / kesediaan
        if (str_contains($qLower, 'boleh') || str_contains($qLower, 'bertanya') || str_contains($qLower, 'nanya') || str_contains($qLower, 'tanya') || str_contains($qLower, 'bisa bantu') || str_contains($qLower, 'bantu saya')) {
            return [
                'success' => true,
                'reply'   => "Tentu saja boleh! Halo, saya LILI (Layanan Informasi & Literasi Kepegawaian Interaktif) BKPSDM Kabupaten Buleleng. 😊\n\nAnda dapat berkonsultasi mengenai:\n- **Cek Status Usulan & Progres Tiket Layanan**\n- **Syarat Layanan Resmi di BKPSDM Buleleng**\n- **Disiplin & Kode Etik ASN** (PP 94/2021)\n- **Syarat & Periode Kenaikan Pangkat**\n- **Jenis & Tata Cara Pengajuan Cuti**\n- **Usia Pensiun & Berkas Pengusulannya**\n- **Izin Belajar vs Tugas Belajar**.\n\nAda topik yang ingin Anda tanyakan kepada LILI?",
                'actions' => [],
                'source'  => 'fallback_scope'
            ];
        }

        // 5. Topik DISIPLIN ASN & HAK KEWAJIBAN (PP 94/2021)
        if (str_contains($qLower, 'disiplin') || str_contains($qLower, 'hukuman') || str_contains($qLower, 'sanksi') || str_contains($qLower, 'kewajiban') || str_contains($qLower, 'larangan') || str_contains($qLower, 'absen')) {
            return [
                'success' => true,
                'reply'   => "Berdasarkan **PP No. 94 Tahun 2021 tentang Disiplin PNS**, penegakan disiplin ASN mencakup:\n\n" .
                    "📌 **Tingkat Hukuman Disiplin:**\n" .
                    "1. **Hukuman Ringan:** Teguran lisan, teguran tertulis, dan pernyataan tidak puas secara tertulis.\n" .
                    "2. **Hukuman Sedang:** Pemotongan Tunjangan Kinerja (Tukin) sebesar 25% selama 6 bulan, 9 bulan, atau 12 bulan.\n" .
                    "3. **Hukuman Berat:** Penurunan jabatan setingkat lebih rendah (12 bulan), pembebasan dari jabatan menjadi pelaksana (12 bulan), hingga Pemberhentian Dengan Hormat Tidak Atas Permintaan Sendiri (PTDH).\n\n" .
                    "⏱️ **Kewajiban Jam Kerja:**\n" .
                    "Pelanggaran jam kerja tanpa alasan sah secara kumulatif dihitung hariannya dan dapat dikenai sanksi sedang hingga berat.\n\n" .
                    "Apakah ada ketentuan disiplin tertentu yang ingin Anda tanyakan lebih lanjut? 😊",
                'actions' => [],
                'source'  => 'fallback_disiplin'
            ];
        }

        // 6. Topik CUTI ASN
        if (str_contains($qLower, 'cuti')) {
            return [
                'success' => true,
                'reply'   => "Berdasarkan Peraturan BKN No. 24/2017 jo No. 7/2021 dan UU ASN, terdapat beberapa jenis cuti ASN:\n\n" .
                    "1. **Cuti Tahunan:** Hak 12 hari kerja per tahun setelah bekerja minimal 1 tahun terus-menerus.\n" .
                    "2. **Cuti Sakit:** Wajib melampirkan surat keterangan dokter.\n" .
                    "3. **Cuti Melahirkan:** Diberikan selama 3 bulan untuk kelahiran anak pertama s.d. ketiga.\n" .
                    "4. **Cuti Alasan Penting:** Untuk musibah keluarga, perkawinan pertama, dll.\n" .
                    "5. **Cuti Besar & Cuti di Luar Tanggungan Negara (CLTN).**\n\n" .
                    "Untuk pengajuan cuti di lingkungan Pemkab Buleleng, berkas dapat disiapkan melalui pengelola kepegawaian OPD masing-masing. Ada jenis cuti yang ingin ditanyakan detailnya? 😊",
                'actions' => [],
                'source'  => 'fallback_cuti'
            ];
        }

        // 7. Topik KENAIKAN PANGKAT
        if (str_contains($qLower, 'pangkat') || str_contains($qLower, 'golongan') || str_contains($qLower, 'kp')) {
            return [
                'success' => true,
                'reply'   => "Sesuai Peraturan BKN No. 4 Tahun 2023, Kenaikan Pangkat (KP) PNS kini berlaku **6 periode dalam setahun** (Februari, April, Juni, Agustus, Oktober, dan Desember).\n\n" .
                    "📌 **Jenis Kenaikan Pangkat:**\n" .
                    "- **KP Reguler:** Minimal 4 tahun dalam pangkat terakhir dengan SKP minimal Baik 2 tahun terakhir.\n" .
                    "- **KP Pilihan / Fungsional:** Mengacu pada angka kredit dan jenjang jabatan fungsional.\n" .
                    "- **KP Penyesuaian Ijazah:** Telah lulus ujian penyesuaian ijazah dan terdapat formasi.\n\n" .
                    "Apakah Anda ingin menanyakan persyaratan spesifik untuk salah satu jenis kenaikan pangkat di atas? 😊",
                'actions' => [],
                'source'  => 'fallback_pangkat'
            ];
        }

        // 8. Topik PENSIUN
        if (str_contains($qLower, 'pensiun') || str_contains($qLower, 'bup')) {
            return [
                'success' => true,
                'reply'   => "Batas Usia Pensiun (BUP) bagi ASN:\n\n" .
                    "- **58 Tahun:** Pejabat Administrasi, Pelaksana, dan Fungsional Ahli Pertama & Muda.\n" .
                    "- **60 Tahun:** Pejabat Pimpinan Tinggi dan Fungsional Ahli Madya.\n" .
                    "- **65 Tahun:** Fungsional Ahli Utama.\n\n" .
                    "📌 **Pensiun Atas Permintaan Sendiri (APS):** Minimal berusia 50 tahun dan memiliki masa kerja minimal 20 tahun.\n\n" .
                    "Pengusulan pensiun di BKPSDM Buleleng disarankan dilakukan 6 s.d. 12 bulan sebelum BUP. Ada yang ingin ditanyakan mengenai berkas pensiun? 😊",
                'actions' => [],
                'source'  => 'fallback_pensiun'
            ];
        }

        // 9. Topik TUGAS BELAJAR & IZIN BELAJAR
        if (str_contains($qLower, 'belajar') || str_contains($qLower, 'tubel') || str_contains($qLower, 'ijin belajar') || str_contains($qLower, 'izin belajar')) {
            return [
                'success' => true,
                'reply'   => "Perbedaan utama **Izin Belajar (IB)** dan **Tugas Belajar (TB)** (SE MenPAN-RB No. 28/2021):\n\n" .
                    "1. **Tugas Belajar (TB):**\n" .
                    "- Dibiayai oleh APBN/APBD atau Beasiswa resmi.\n" .
                    "- Dibebaskan sepenuhnya dari tugas jabatan sehari-hari.\n\n" .
                    "2. **Izin Belajar (IB):**\n" .
                    "- Biaya mandiri / pribadi.\n" .
                    "- Tidak dibebaskan dari tugas jabatan (kuliah di luar jam dinas).\n\n" .
                    "Keduanya sah diakui untuk pencantuman gelar / penyesuaian ijazah setelah lulus di BKPSDM Buleleng. 😊",
                'actions' => [],
                'source'  => 'fallback_belajar'
            ];
        }

        // 10. Filter topik non-kepegawaian spesifik (guardrail)
        $irrelevantKeywords = ['resep', 'makanan', 'masak', 'cuaca', 'film', 'lagu', 'game', 'presiden', 'politik', 'bola', 'sepatu', 'mobil', 'motor', 'hotel', 'wisata'];
        foreach ($irrelevantKeywords as $irr) {
            if (str_contains($qLower, $irr)) {
                return [
                    'success' => true,
                    'reply'   => "Mohon maaf, saya adalah Asisten AI Virtual Khusus Kepegawaian BKPSDM Kabupaten Buleleng. Saya hanya dapat melayani pertanyaan seputar regulasi ASN, aturan PNS/PPPK, dan prosedur layanan kepegawaian.",
                    'actions' => [],
                    'source'  => 'fallback_guardrail'
                ];
            }
        }

        return [
            'success' => true,
            'reply'   => "Terima kasih atas pertanyaannya. 😊\n\nUntuk konsultasi lebih lanjut terkait pertanyaan Anda, Anda dapat langsung mengetikkan pertanyaan spesifik atau terhubung langsung dengan petugas kami melalui opsi **Tanya Admin BKPSDM**.",
            'actions' => [],
            'source'  => 'fallback_general'
        ];
    }
}
