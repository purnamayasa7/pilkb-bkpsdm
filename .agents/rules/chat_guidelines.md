# ATURAN SISTEM CHAT (PILKB BKPSDM)

Setiap agen AI yang bekerja pada repository ini WAJIB mematuhi aturan berikut saat menyentuh `resources/js/pages/Chat/Index.jsx` atau `app/Http/Controllers/ChatController.php`:

1. **In-Memory Caching**: Dilarang me-reload seluruh riwayat pesan jika room sudah ada di `roomCacheRef`. Perpindahan room harus memanfaatkan cache dan hanya menyinkronkan pesan baru via `silentSyncRoom` (`/poll?last_message_id=...`).
2. **Scroll Restoration**: Posisi scroll wajib dipulihkan dari `roomScrollPosRef` tanpa memicu re-render react saat scroll (`handleMessagesScroll` tidak boleh menggunakan `setState`).
3. **Floating WhatsApp Arrow**:
   - Class tombol scroll down HARUS tetap `absolute bottom-20 right-5 z-30 w-9 h-9 rounded-full`.
   - Dilarang menambahkan class `relative` pada tombol `<button>` ini agar tidak melebar 100%.
4. **Pencegahan False Unread**:
   - `knownMessageIdsRef` wajib menyimpan seluruh ID pesan yang sudah dimuat.
   - Event snapshot awal Firebase dilarang menaikkan counter unread badge arrow jika ID pesannya sudah ada di `knownMessageIdsRef`.
5. **Firebase User Listener**:
   - Dependency array pada `useEffect` listener user (`users/{id}/last_event`) HANYA boleh `[currentUser?.id, firebaseConfig]`.
   - DILARANG memasukkan `activeId` ke dependency ini karena akan menyebabkan reconnect dan merusak status terbaca.
6. **LILI AI Voice**:
   - `liliVoicePlayedRef.current` harus dijaga agar suara greeting LILI hanya diputar 1x saat pertama kali dibuka dalam satu sesi.
7. **Literasi & Pengetahuan Umum Kepegawaian LILI**:
   - LILI (*Layanan Informasi & Literasi Kepegawaian Interaktif*) wajib menguasai konsep makro dan regulasi kepegawaian ASN nasional (UU No. 20/2023, Perbedaan PNS & PPPK, Sistem Merit, Core Values BerAKHLAK, Asas Netralitas, Struktur Jabatan, Hak/Kewajiban ASN, Disiplin PP 94/2021, Cuti BKN 24/2017, Kenaikan Pangkat 6 Periode BKN 4/2023, Batas Usia Pensiun, Tugas Belajar vs Izin Belajar, Evaluasi Kinerja SKP PermenPAN-RB 6/2022, dan TPP).
   - Dilarang membatasi LILI hanya untuk cek tiket atau cek syarat layanan saja.
   - Ketahanan Dual-Layer: HTTP timeout pada Gemini disetel ke `connect_timeout => 5` dan `timeout => 15`, serta wajib menyediakan basis pengetahuan fallback deterministik komprehensif di `handleFallbackResponse()` pada `app/Services/KepegawaianAiService.php` agar LILI tidak pernah memberikan jawaban penolakan kosong atau deflective saat offline/timeout.

