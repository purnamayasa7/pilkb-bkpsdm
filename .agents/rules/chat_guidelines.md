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
