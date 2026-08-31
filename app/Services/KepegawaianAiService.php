<?php

namespace App\Services;

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
   - JIKA PENGGUNA LANGSUNG MENANYAKAN TOPIK / PERTANYAAN:
     LANGSUNG jawab inti pertanyaannya secara jelas, padat, dan terstruktur (JANGAN awali dengan 'Tentu saja boleh').
5. Di akhir penjelasan, berikan kalimat penutup yang ramah dan mengajak berinteraksi (misalnya: "Apakah ada bagian dari informasi di atas yang ingin LILI jelaskan lebih lanjut? 😊").

TOPIK UTAMA KEPEGAWAIAN:
- UU No. 20 Tahun 2023 tentang ASN (PNS & PPPK).
- Kenaikan Pangkat (6 periode), Mutasi, Cuti ASN, Pensiun (BUP), KGB, Disiplin ASN (PP 94/2021), Izin Belajar & Tugas Belajar (SE MenPAN-RB 28/2021), serta SOP Layanan BKPSDM Buleleng.

BATASAN:
- HANYA tolak jika pengguna BENAR-BENAR menanyakan hal di luar kepegawaian (misal: resep masakan, cuaca, politik praktis, dongeng). Saat menolak, tetap gunakan bahasa yang sangat santun dari LILI.
EOT;

    /**
     * Proses pertanyaan pengguna ke AI.
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
                'message' => 'Pertanyaan tidak boleh kosong.'
            ];
        }

        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-3.5-flash-lite');

        // Jika API key belum dikonfigurasi, gunakan fallback response cerdas berbasis rule
        if (empty($apiKey)) {
            return $this->handleFallbackResponse($question);
        }

        try {
            $fullPrompt = self::SYSTEM_INSTRUCTION . "\n\n";

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
                    'temperature'     => 0.5,
                    'topP'            => 0.95,
                    'maxOutputTokens' => 800,
                ],
            ];

            $modelsToTry = array_unique([$model, 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash']);

            foreach ($modelsToTry as $m) {
                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$m}:generateContent?key={$apiKey}";

                $response = Http::withoutVerifying()
                    ->withOptions([
                        'connect_timeout'  => 3,
                        'timeout'          => 7,
                        'force_ip_resolve' => 'v4',
                    ])
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                    ])
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                    if (!empty($reply)) {
                        return [
                            'success' => true,
                            'reply'   => trim($reply),
                            'source'  => 'gemini_ai'
                        ];
                    }
                }
            }

            Log::warning('Semua model Gemini API tidak berhasil.', [
                'status' => $response->status() ?? 500,
                'body'   => $response->body() ?? ''
            ]);

            return $this->handleFallbackResponse($question);
        } catch (\Throwable $e) {
            Log::error('Exception saat memanggil Kepegawaian AI.', [
                'message' => $e->getMessage()
            ]);

            return $this->handleFallbackResponse($question);
        }
    }

    /**
     * Fallback cerdas jika koneksi LLM belum dikonfigurasi / mengalami kendala kuota.
     */
    private function handleFallbackResponse(string $question): array
    {
        $qLower = strtolower($question);

        // 1. Deteksi sapaan ramah / greeting
        $greetings = ['halo', 'hai', 'hello', 'hey', 'pagi', 'siang', 'sore', 'malam', 'assalam', 'swastiastu', 'tes', 'test'];
        foreach ($greetings as $g) {
            if (str_starts_with($qLower, $g) || $qLower === $g) {
                return [
                    'success' => true,
                    'reply'   => "Halo! Selamat datang di LILI (Layanan Informasi & Literasi Kepegawaian Interaktif) BKPSDM Kabupaten Buleleng.\n\nAda yang bisa LILI bantu terkait regulasi ASN, cuti, kenaikan pangkat, pensiun, mutasi, atau layanan kepegawaian lainnya?",
                    'source'  => 'fallback_greeting'
                ];
            }
        }

        // 2. Deteksi pertanyaan pembuka / kesediaan
        if (str_contains($qLower, 'boleh') || str_contains($qLower, 'bertanya') || str_contains($qLower, 'nanya') || str_contains($qLower, 'tanya') || str_contains($qLower, 'bisa bantu') || str_contains($qLower, 'bantu saya')) {
            return [
                'success' => true,
                'reply'   => "Tentu saja boleh! Halo, saya LILI (Layanan Informasi & Literasi Kepegawaian Interaktif) BKPSDM Kabupaten Buleleng.\n\nAnda dapat berkonsultasi mengenai:\n- **Disiplin & Kode Etik ASN** (PP 94/2021)\n- **Syarat & Periode Kenaikan Pangkat**\n- **Jenis & Tata Cara Pengajuan Cuti**\n- **Usia Pensiun & Berkas Pengusulannya**\n- **Izin Belajar vs Tugas Belajar**\n- **Layanan Kepegawaian di BKPSDM Buleleng**.\n\nAda topik yang ingin Anda tanyakan kepada LILI?",
                'source'  => 'fallback_scope'
            ];
        }

        // 3. Topik DISIPLIN ASN & HAK KEWAJIBAN (PP 94/2021)
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
                    "Apakah ada ketentuan disiplin tertentu yang ingin Anda tanyakan lebih lanjut?",
                'source'  => 'fallback_disiplin'
            ];
        }

        // 4. Topik CUTI ASN
        if (str_contains($qLower, 'cuti')) {
            return [
                'success' => true,
                'reply'   => "Berdasarkan Peraturan BKN No. 24/2017 jo No. 7/2021 dan UU ASN, terdapat beberapa jenis cuti ASN:\n\n" .
                    "1. **Cuti Tahunan:** Hak 12 hari kerja per tahun setelah bekerja minimal 1 tahun terus-menerus.\n" .
                    "2. **Cuti Sakit:** Wajib melampirkan surat keterangan dokter.\n" .
                    "3. **Cuti Melahirkan:** Diberikan selama 3 bulan untuk kelahiran anak pertama s.d. ketiga.\n" .
                    "4. **Cuti Alasan Penting:** Untuk musibah keluarga, perkawinan pertama, dll.\n" .
                    "5. **Cuti Besar & Cuti di Luar Tanggungan Negara (CLTN).**\n\n" .
                    "Pengajuan dilakukan melalui pengelola kepegawaian OPD masing-masing.",
                'source'  => 'fallback_cuti'
            ];
        }

        // 5. Topik KENAIKAN PANGKAT
        if (str_contains($qLower, 'pangkat') || str_contains($qLower, 'golongan') || str_contains($qLower, 'kp')) {
            return [
                'success' => true,
                'reply'   => "Sesuai Peraturan BKN No. 4 Tahun 2023, Kenaikan Pangkat (KP) PNS kini berlaku **6 periode dalam setahun** (Februari, April, Juni, Agustus, Oktober, dan Desember).\n\n" .
                    "📌 **Jenis Kenaikan Pangkat:**\n" .
                    "- **KP Reguler:** Minimal 4 tahun dalam pangkat terakhir dengan SKP minimal Baik 2 tahun terakhir.\n" .
                    "- **KP Pilihan / Fungsional:** Mengacu pada angka kredit dan jenjang jabatan fungsional.\n" .
                    "- **KP Penyesuaian Ijazah:** Telah lulus ujian penyesuaian ijazah dan terdapat formasi.\n\n" .
                    "Apakah Anda ingin menanyakan syarat untuk salah satu jenis kenaikan pangkat di atas?",
                'source'  => 'fallback_pangkat'
            ];
        }

        // 6. Topik PENSIUN
        if (str_contains($qLower, 'pensiun') || str_contains($qLower, 'bup')) {
            return [
                'success' => true,
                'reply'   => "Batas Usia Pensiun (BUP) bagi ASN:\n\n" .
                    "- **58 Tahun:** Pejabat Administrasi, Pelaksana, dan Fungsional Ahli Pertama & Muda.\n" .
                    "- **60 Tahun:** Pejabat Pimpinan Tinggi dan Fungsional Ahli Madya.\n" .
                    "- **65 Tahun:** Fungsional Ahli Utama.\n\n" .
                    "📌 **Pensiun Atas Permintaan Sendiri (APS):** Minimal berusia 50 tahun dan memiliki masa kerja minimal 20 tahun.\n\n" .
                    "Pengusulan pensiun disarankan dilakukan 6 s.d. 12 bulan sebelum BUP.",
                'source'  => 'fallback_pensiun'
            ];
        }

        // 7. Topik TUGAS BELAJAR & IZIN BELAJAR
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
                    "Keduanya sah diakui untuk pencantuman gelar / penyesuaian ijazah setelah lulus.",
                'source'  => 'fallback_belajar'
            ];
        }

        // 8. Filter topik non-kepegawaian spesifik (guardrail)
        $irrelevantKeywords = ['resep', 'makanan', 'masak', 'cuaca', 'film', 'lagu', 'game', 'presiden', 'politik', 'bola', 'sepatu', 'mobil', 'motor', 'hotel', 'wisata'];
        foreach ($irrelevantKeywords as $irr) {
            if (str_contains($qLower, $irr)) {
                return [
                    'success' => true,
                    'reply'   => "Mohon maaf, saya adalah Asisten AI Virtual Khusus Kepegawaian BKPSDM Kabupaten Buleleng. Saya hanya dapat melayani pertanyaan seputar regulasi ASN, aturan PNS/PPPK, dan prosedur layanan kepegawaian.",
                    'source'  => 'fallback_guardrail'
                ];
            }
        }

        return [
            'success' => true,
            'reply'   => "Terima kasih atas pertanyaannya. 😊\n\nUntuk konsultasi lebih lanjut terkait pertanyaan Anda, Anda dapat langsung mengetikkan pertanyaan spesifik atau terhubung langsung dengan petugas kami melalui opsi **Tanya Admin BKPSDM**.",
            'source'  => 'fallback_general'
        ];
    }
}
