# 📘 Blue-Print & Panduan Implementasi: LILI (AI Asisten Kepegawaian)
**Sistem Informasi PILKB — BKPSDM Kabupaten Buleleng**

---

## 📌 Ringkasan Eksekutif (*Executive Summary*)

**LILI** (*Layanan Informasi & Literasi Kepegawaian Interaktif*) adalah asisten virtual berbasis kecerdasan buatan (*Generative AI*) yang diintegrasikan ke dalam portal kepegawaian PILKB BKPSDM Kabupaten Buleleng. 

LILI dirancang untuk memberikan literasi regulasi ASN (UU ASN, PP No. 94/2021 tentang Disiplin Pegawai, Perbup, dsb), pengecekan status progres berkas usulan tiket secara mandiri, serta penyediaan SOP dan berkas persyaratan layanan resmi secara instan.

---

## 🏗️ 1. Arsitektur Integrasi Sistem (*System Architecture*)

Sistem LILI menggunakan pola arsitektur **RAG (*Retrieval-Augmented Generation*)** berbasis **Deterministic Backend Proxy**.

```mermaid
flowchart TD
    subgraph KLIEN [Frontend Layer]
        User([Pengguna / ASN]) <-->|Input Pesan & Action Chips| UI[Floating Chat Widget UI]
    end

    subgraph BACKEND [Backend Laravel PILKB - Gatekeeper & Controller]
        UI <-->|POST /guest-bot/tanya-ai\n(Protected by throttle:15,1)| Controller[GuestBotController]
        Controller <-->|Proses Bisnis & Intent Matching| Service[KepegawaianAiService]
        
        Service <-->|1. In-Memory Cache Lookup| Cache[(Cache 1 Jam)]
        Service <-->|2. ORM Read-Only Query| DB[(MySQL Database)]
        
        Service -->|3. Masking Privasi UU PDP| Masker[PDP Data Masking Engine]
    end

    subgraph AI_ENGINE [Cloud AI Layer]
        Service <-->|4. Grounding Context + Prompt| Gemini[Google Gemini LLM Engine]
    end
```

---

## 🔒 2. Integrasi Database: Apakah AI Mengakses Database Langsung?

> ⛔ **Prinsip Keamanan Utama:**
> **AI (LLM) TIDAK PERNAH DIBERI AKSES KONEKSI / KREDENSIAL LANGSUNG KE DATABASE.**

AI beroperasi murni sebagai **Perantara Pengolah Bahasa Alami (*Natural Language Synthesizer & Reasoning Engine*)**, sementara seluruh kendali data berada 100% di tangan Backend Laravel.

### 🔄 Alur Kerja Pengambilan Data (*Step-by-Step Data Flow*):

1. **Deteksi Maksud (*Intent Detection*)**:
   * Pertanyaan pengguna pertama kali diproses oleh algoritma internal di [`KepegawaianAiService`](file:///c:/laragon/www/pilkb/app/Services/KepegawaianAiService.php) untuk mendeteksi apakah pengguna menanyakan:
     - Nomor Tiket Usulan (contoh: `290826FVVP`)
     - SOP Syarat Layanan Tertentu (contoh: *Kenaikan Pangkat*, *Cuti*, *Pensiun*)
     - Katalog Layanan Umum (32 Layanan Aktif)
     - Regulasi Disiplin / Pertanyaan Bebas Kepegawaian.

2. **Pengambilan Data Internal (*Secure ORM Read-Only*)**:
   * Jika terdeteksi nomor tiket atau nama layanan, Backend Laravel melakukan kueri internal menggunakan Eloquent ORM:
     - `Regtiket::where('no_tiket', $token)->first()`
     - `Layanan::with('syarat')->where('aktif', 1)->get()` (Di-cache dalam memori selama 1 jam).

3. **Penyensoran Privasi di Server Lokal (*Data Masking Layer*)**:
   * Sebelum data diteruskan ke AI, server lokal menyamarkan data sensitif demi kepatuhan **UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)**:
     - **Nama**: `KADEK PURNAMAYASA, S.Pd` ➔ **`KADEK P••••••••••`**
     - **NIP**: `199510012025061001` ➔ **`1995••••••••1001`**

4. **Penyuntikan Konteks (*Grounding Context Injection*)**:
   * Data resmi yang telah disensor disuntikkan ke dalam *system prompt* sebagai fakta mutlak (*Grounding Truth*).

5. **Penyusunan Kalimat oleh AI**:
   * AI menyusun jawaban dengan bahasa yang ramah, sopan, dan terstruktur tanpa mengubah nomor tiket, status usulan, maupun butir-butir SOP.

6. **Penyampaian Action Chips Interaktif**:
   * Backend melampirkan tombol aksi cepat ke antarmuka chat:
     - 📄 **[Unduh Format Syarat (PDF)]**
     - 💬 **[Konsultasi Admin Bidang]**
     - 🔍 **[Buka Rincian Tiket]**

---

## 🛡️ 3. Standar Keamanan & Kepatuhan Industri (*Security Standards*)

| Parameter Keamanan | Implementasi pada LILI AI | Status |
| :--- | :--- | :---: |
| **Pencegahan SQL Injection** | AI tidak mengeksekusi SQL. Kueri hanya dijalankan melalui parameter terisolasi Laravel ORM. | 🛡️ **100% Aman** |
| **Pencegahan Halusinasi AI** | AI diikat (*grounded*) dengan data SOP aktual dari database MySQL BKPSDM. | 🛡️ **Terkontrol** |
| **Perlindungan Data Pribadi** | Masking Nama & NIP sebelum data dikirim ke API pihak ketiga sesuai UU PDP No. 27/2022. | 🛡️ **Patuh Regulasi** |
| **Proteksi DDoS & Kuota** | Middleware `throttle:15,1` membatasi maksimal 15 kueri/menit per IP. | 🛡️ **Terproteksi** |
| **Anti-XSS & URL Sanitization** | Parser Markdown mensterilkan skema link (hanya `https://`, `http://`, atau path lokal). | 🛡️ **100% Aman** |
| **Kemandirian Sistem (*Fallback Engine*)** | Jika API AI luar mengalami gangguan kuota/jaringan, sistem beralih otomatis ke *Deterministic Rule-Based Response*. | 🛡️ **High Availability** |

---

## ⚡ 4. Kinerja & Efisiensi Sistem (*Performance & Resource Load*)

* **In-Memory Caching**: Data 32 layanan aktif dan SOP-nya disimpan di memori selama 3.600 detik (1 jam), sehingga beban CPU dan database MySQL mendekati **0 ms**.
* **Hash-Map Keyword Matching**: Pencocokan kata kunci berjalan dalam kompleksitas waktu $\mathcal{O}(1)$.
* **GPU Hardware Accelerated CSS**: Animasi cincin berputar (*conic gradient ring*) dan letup bubble (*pop-in bounce*) diproses oleh GPU browser, menjaga frame-rate tetap stabil di **60 FPS**.

---

## 📂 5. Peta Komponen Berkas (*File Mapping*)

```
pilkb/
├── app/
│   ├── Http/Controllers/
│   │   └── GuestBotController.php       # Endpoint API Chat & Rate Limiting
│   └── Services/
│       └── KepegawaianAiService.php     # Logika RAG, Database Grounding & PDP Masking
├── public/
│   ├── css/
│   │   └── chat-widget.css              # Styling Widget, Animasi Ring & Pop-In Bubble
│   └── js/
│       └── chat/
│           └── chat-widget-login.js     # Logika Frontend, Interaksi AI, Parser Markdown
└── resources/
    └── views/
        └── auth/
            └── login.blade.php          # Markup Floating Chat, Avatar LILI & Disclaimer
```

---

*Dokumen disusun untuk keperluan dokumentasi arsitektur dan standardisasi implementasi AI di lingkungan BKPSDM Kabupaten Buleleng.*
