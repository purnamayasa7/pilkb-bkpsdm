# PEDOMAN & ARSITEKTUR SISTEM CHAT (PILKB BKPSDM)

> **DOKUMEN INI ADALAH PEDOMAN TETAP (IMMUTABLE BASELINE)**  
> Dilarang merombak, menghapus, atau mengubah alur logika dasar yang telah teruji tanpa menganalisis dampaknya terhadap poin-poin di bawah ini.

---

## 1. STRUKTUR & PEMBAGIAN TUGAS
- **Frontend**: Menggunakan React (Inertia.js) di file [`resources/js/pages/Chat/Index.jsx`](file:///c:/laragon/www/pilkb/resources/js/pages/Chat/Index.jsx).
- **Backend Controller**: [`app/Http/Controllers/ChatController.php`](file:///c:/laragon/www/pilkb/app/Http/Controllers/ChatController.php).
- **Realtime Layer**: Firebase Realtime Database (WebSocket dua arah).
- **Fallback Layer**: Polling inkremental cerdas (12 detik, hanya mengambil pesan baru `WHERE id > last_message_id`).

---

## 2. ATURAN WAJIB (JANGAN DIUBAH / JANGAN DIRUSAK)

### A. In-Memory Room Caching (`roomCacheRef`) & Scroll Position (`roomScrollPosRef`)
1. **Dilarang Reload Semua Pesan Saat Berpindah Room**:
   - Ketika user mengklik room yang sudah pernah dibuka sebelumnya, data pesan HARUS langsung diambil dari `roomCacheRef.current.get(nextId)`.
   - Tidak boleh memanggil API `loadRoom` / `/chat/{id}/messages` lagi yang memicu spinner loading.
   - Panggilan yang diizinkan saat berpindah ke room yang sudah ada di cache HANYALAH `silentSyncRoom(nextId)` (yaitu `/poll?last_message_id=...` untuk mengecek selisih pesan baru jika ada).
2. **Preservasi Posisi Scroll**:
   - `handleMessagesScroll` mencatat `target.scrollTop` ke dalam `roomScrollPosRef.current.set(activeId, scrollTop)` tanpa memicu re-render (`setState`).
   - Saat masuk kembali ke room, posisi scroll dipulihkan menggunakan `requestAnimationFrame` dan `setTimeout(..., 30)`.

### B. Tracking Pesan Baru & Tombol Arrow WhatsApp (`scrollBtnRef`)
1. **Bentuk & Posisi Tombol**:
   - Ukuran HARUS tetap lingkaran kecil WhatsApp: `w-9 h-9 rounded-full` (36px × 36px), bayangan `shadow-md`, posisi `absolute bottom-20 right-5 z-30`.
   - **PENTING**: JANGAN menambahkan class `relative` pada tombol `<button>` ini karena akan menimpa `absolute` dan merusak layout menjadi melebar 100%.
2. **Pencegahan False Unread Badge (`knownMessageIdsRef`)**:
   - Seluruh ID pesan yang di-load saat membuka room (dari cache maupun database) dicatat ke dalam `knownMessageIdsRef.current`.
   - Saat Firebase mengirimkan *initial snapshot* pesan terakhir, sistem memeriksa `knownMessageIdsRef.current.has(msgId)`. Jika sudah ada, **DILARANG** menaikkan counter unread badge arrow.
   - Badge counter unread pada arrow HANYA bertambah jika ada pesan baru yang ID-nya belum ada di `knownMessageIdsRef` dan posisi scroll user sedang tidak di bawah (`!isAtBottomRef.current`).
   - Tombol dan badge unread otomatis di-reset ke 0 ketika user scroll ke bawah (`isNear = true`) atau menekan tombol arrow (`scrollToBottom`).

### C. Listener Firebase Realtime Database
1. **User Event Listener (`users/{id}/last_event`)**:
   - Dependency array pada `useEffect` user listener HANYA boleh `[currentUser?.id, firebaseConfig]`.
   - **DILARANG KERAS** memasukkan `activeId` ke dependency array ini. Jika `activeId` dimasukkan, setiap perpindahan room akan memutus dan menyambung ulang listener, memicu replay event snapshot lama dan membuat pesan yang sudah dibaca kembali menjadi unread!
   - Snapshot awal wajib dilindungi dengan pengecekan batas waktu (15 detik) untuk mengabaikan event basi dari sesi sebelumnya.
2. **Room Event Listener (`conversations/{activeId}/last_message`)**:
   - Hanya terhubung pada room yang sedang aktif dibuka (`activeId`).
   - Saat meninggalkan room, listener wajib dibersihkan via `roomMsgRef.off('value')`.

### D. Status Terbaca / Unread Protection (`readRoomIdsRef`)
1. **Perlindungan Terbaca di Sisi Klien**:
   - Saat user memilih percakapan, ID percakapan dimasukkan ke `readRoomIdsRef.current.add(nextId)`.
   - Background polling `fetchConversations` memeriksa `readRoomIdsRef`. Jika room sudah ditandai dibaca di sesi ini, unread badge tetap 0 meskipun database server belum selesai commit update `last_read_message_id`.
   - Jika ada pesan baru dari lawan bicara untuk room tersebut saat sedang tidak dibuka, `readRoomIdsRef.current.delete(convId)` dipanggil agar badge unread di list percakapan dapat muncul kembali secara wajar.
2. **Perhitungan di Sisi Backend**:
   - `markConversationRead` menghitung `$lastMessageId = (int) max($conversation->last_message_id, $conversation->messages()->max('id'))` untuk menjamin tidak ada pesan yang terlewat.

### E. LILI AI Virtual Assistant
1. **Suara Greeting (`playLiliVoice`)**:
   - Dibatasi oleh ref `liliVoicePlayedRef.current`.
   - Suara sambutan hanya diputar 1 kali saat user pertama kali membuka LILI dalam satu sesi.
   - Saat berpindah antara tiket dan LILI, riwayat chat LILI (`liliMessages`) TIDAK BOLEH di-reset dan suara greeting TIDAK BOLEH diputar ulang.
   - Suara greeting hanya boleh diputar ulang jika user secara sadar menekan tombol "Mulai Baru" (`handleResetLiliChat`).

---

## 3. CHECKLIST SEBELUM MENERAPKAN PERUBAHAN BARU
Sebelum menyetujui atau menjalankan perubahan pada modul Chat, pastikan:
- [ ] Apakah ada perubahan pada dependency `useEffect` Firebase? (Pastikan `activeId` tidak masuk ke user listener).
- [ ] Apakah `roomCacheRef` dan `knownMessageIdsRef` masih berfungsi?
- [ ] Apakah tombol floating scroll tetap berukuran `w-9 h-9` lingkaran dan tidak melebar?
- [ ] Jalankan pengujian `npm run build` untuk memastikan tidak ada kesalahan kompilasi JSX/CSS.
