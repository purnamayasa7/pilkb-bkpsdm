# Standar Pengembangan & Panduan Desain PILKB

Dokumen ini adalah pedoman wajib bagi AI Agent maupun Pengembang dalam modernisasi front-end aplikasi PILKB. Seluruh pengerjaan antarmuka (untuk semua role: Admin OPD, Admin BKPSDM, Kasubag, Verifikator, dll) **wajib mematuhi standar di bawah ini**.

---

## 1. Prinsip Utama Backend & Integritas Data (Strict Backend Scope)
1. **Fokus 100% Front-End**: Dilarang mengubah logika backend, alur controller, service, route, query/database, maupun API responses yang sudah berjalan sebelumnya.
2. **Pertahankan Business Process & Fitur yang Sudah Work**:
   - Fitur atau proses yang sudah berjalan normal (seperti alur pengiriman email notifikasi tiket/usulan ke email ASN yang diusulkan saat create tiket) **TIDAK BOLEH** diubah, dirusak, atau dihilangkan.
   - Jika suatu halaman/fitur sudah berfungsi benar setelah perbaikan, jangan dirombak kembali.
3. **Penyelarasan Field API**: Field data dan parameter yang dikirim atau diterima melalui Controller/API harus disamakan dengan implementasi sebelumnya (misal: query parameter `month`, `year`, `start_date`, `end_date`, dll).
4. **Data List / Tabel Wajib dari Database Lokal (Anti-Lag & Zero External API Bottleneck)**:
   - Seluruh data teks untuk kebutuhan tabel (terutama **Nama Pegawai**, **NIP**, dan **Unit Kerja / OPD**) **WAJIB diambil langsung dari kolom database lokal** (`tb_regtiket.nama`, `tb_regtiket.nip`, `tb_regtiket.nama_ukerja`).
   - **Dilarang keras melakukan loop HTTP request ke API eksternal (seperti SIMPEG `getPegawaiByNips`) pada halaman tabel/list data**. Loop API eksternal menyebabkan latensi puluhan detik (N+1 HTTP calls) dan berisiko *504 Gateway Timeout*.
   - Panggilan ke API eksternal (SIMPEG) hanya diperbolehkan secara *lazy / on-demand* (misalnya ketika user membuka modal rincian spesifik satu orang atau saat proses pembuatan tiket baru).

---

## 2. Standar Desain, Warna, & Tipografi
1. **Font Standar**: Wajib menggunakan font **Plus Jakarta Sans** (`font-sans` bawaan konfigurasi PILKB).
2. **Palet Warna Utama**:
   - Warna Brand: PILKB Blue (`#2563eb` / `blue-600` untuk elemen aktif, tombol utama, dan fokus).
   - Card Border: Setiap card/kontainer wajib memiliki **border halus** (`border border-slate-200 dark:border-slate-800`) agar ada batas pemisah yang jelas dan elegan.
   - Background Halaman: `bg-slate-50 dark:bg-slate-950`.
   - Background Card/Modal: `bg-white dark:bg-slate-900`.
3. **Murni Tailwind CSS**: Dilarang menggunakan inline styles `style={{ ... }}`. Semua styling wajib menggunakan Tailwind utility classes agar konsisten dan ringan.

---

## 3. Struktur Layout & Responsivitas (Desktop, iPad, & Mobile)
1. **Struktur Tabel Tunggal (Zero Duplication)**:
   - Data tabel **HANYA menggunakan 1 elemen `<table>`** yang dibungkus dengan container responsif `<div className="overflow-x-auto">`.
   - **Dilarang keras menduplikasi data** ke card list khusus mobile (`md:hidden` / di luar tabel) karena membebani DOM, memperlambat render, dan membingungkan pengguna.
2. **Kerapian & Konsistensi Form & Halaman (Lebar Konten Penuh)**:
   - Lebar konten form, padding, dan struktur form disamakan di semua halaman dengan menggunakan kontainer standar **`<div className="space-y-6">`** (lebar penuh mengikuti wrapper `<main className="flex-1 p-4 sm:p-6 lg:p-8">`), konsisten dengan Card ber-border halus (`border border-slate-200 dark:border-slate-800`).
   - **Dilarang membatasi lebar halaman form dengan class pembatas sempit seperti `max-w-4xl mx-auto` atau `max-w-5xl mx-auto`** agar tampilan antarmuka selalu selaras, membentang proporsional, dan serasi dengan halaman Index.
   - Label form, dropdown, input date, dan feedback error dibuat seragam.

---

## 4. Standar Struktur Halaman Index (Urutan Komponen) & Filter Toolbar Terpadu
Seluruh halaman utama (Index) data tabel (acuan resmi: `Opd/Tiket/Index.jsx`) **wajib mengikuti urutan posisi komponen vertikal berikut**:

1. **Komponen 1 - Header Halaman (Page Header)**:
   - Sisi Kiri: Icon modul di dalam box biru halus (`p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40`), Judul `h1` (`text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white`), serta Sub-deskripsi periode pengajuan (`text-xs text-slate-500 dark:text-slate-400 mt-1 pl-11`).
   - Sisi Kanan: Tombol aksi global tingkat halaman (*Tambah Usulan Baru*, *Export Data Dropdown*, tombol reset periode, atau tombol kembali).
   - **Standar Baku Ukuran & Desain Button Header (Wajib Seragam di Seluruh Halaman - Acuan Resmi: `Bidang/Layanan/Index.jsx`)**:
     1. **Ketinggian & Tipografi Seragam**: Seluruh tombol di header wajib menggunakan padding vertikal **`py-2.5`** dengan ukuran font **murni `text-xs font-semibold`** (Dilarang keras menggunakan `text-sm`, `sm:text-sm`, atau `font-medium` agar ukuran teks tombol tidak membesar pada breakpoint iPad/desktop).
     2. **Tombol Primer / Aksi Utama (Solid Blue)**:
        - Class baku: `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer`.
        - Icon pendukung berukuran `w-4 h-4`.
     3. **Tombol Sekunder / Outline / Dropdown (White / Slate Outline)**:
        - Class baku: `inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer`.
        - Icon pendukung berukuran `w-4 h-4` (misal: icon Excel hijau `text-emerald-600`, PDF merah `text-rose-600`, download, dll) dipadukan dengan icon chevron `w-3.5 h-3.5 text-slate-400`.
     4. **Jarak Antar Tombol Header**: Menggunakan kontainer pembungkus `flex items-center gap-2.5 flex-wrap` (atau `self-start md:self-auto`).
2. **Komponen 2 - Kartu Ringkasan Statistik (Stats Metric Cards)**:
   - Diletakkan **tepat di bawah Page Header** sebelum toolbar filter.
   - Format: `grid grid-cols-2 sm:grid-cols-4 gap-3`.
3. **Komponen 3 - Card Toolbar Filter Terpadu (Unified Filter Toolbar Card)**:
   - Diletakkan **di bawah Metric Cards** dan tepat **di atas Card Tabel Data**.
   - Container: `rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5`.
   - Grid Terpadu 12 Kolom (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center`):
     - `lg:col-span-5`: Input pencarian (Live Search) dengan icon `Search` dan tombol reset `X`.
     - `lg:col-span-3`: Dropdown Pemilih Bulan dengan icon `Calendar` dan `ChevronDown`.
     - `lg:col-span-2`: Dropdown Pemilih Tahun dengan icon `ChevronDown`.
     - `lg:col-span-2`: Dropdown Jumlah Data Per Halaman (`10 per hal`, `25 per hal`, `50 per hal`).
    - **Standarisasi Combobox / Dropdown Filter & Layout Toolbar Terpadu (Wajib Selaras & Seragam)**:
      1. **Keseragaman Icon Sisi Kiri (Leading Icon) - Wajib Standar di Seluruh Modul**:
         - **Filter Status** (Status usulan, status akun, status bidang, status layanan, dll): **WAJIB selalu menggunakan icon `Filter`** (outline corong saringan `Filter` dari Lucide).
         - **Filter Jumlah Data Per Halaman**: **WAJIB selalu menggunakan icon `Layers`** (tumpukan layer) dengan label opsi ringkas: `"10 per hal"`, `"25 per hal"`, `"50 per hal"`.
         - **Filter Role / Peranan Pengguna**: **WAJIB selalu menggunakan icon `Shield`** (perisai).
         - **Filter Bulan / Periode**: **WAJIB selalu menggunakan icon `Calendar`** (kalender).
         - **Filter Tahun**: **WAJIB selalu menggunakan icon `Calendar`** atau `CalendarRange`.
         - **Filter Unit Kerja / SKPD / OPD**: **WAJIB selalu menggunakan icon `Building2`** (gedung perkantoran).
         - **Filter Bidang**: **WAJIB selalu menggunakan icon `Layers`** atau `Building2`.
         - **Filter Layanan**: **WAJIB selalu menggunakan icon `FileText`**.
         - Ukuran & penempatan leading icon baku: `w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none`.
      2. **Icon Panah Kanan (Trailing Chevron)**:
         - Seluruh dropdown combobox wajib menyertakan icon panah bawah: `<ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />`.
      3. **Padding Teks Standar (`pl-10 pr-9 py-2.5`)**:
         - Elemen `<select>` wajib dibungkus dalam container `<div className="relative">` dengan class baku:
           `w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer`.
         - Teks opsi berada tepat setelah icon dengan jarak aman 40px (`pl-10`) dan tidak pernah mepet ke garis border.
      4. **Jika Dropdown Tanpa Icon Kiri**: Wajib menggunakan minimal `pl-4 pr-8 py-2.5` (atau class `px-4`) agar teks tidak menempel pada sudut rounded-xl.
      5. **Struktur Grid Layout Toolbar Terpadu (Single Bar Container)**:
         - Seluruh kontrol filter dan pencarian disatukan dalam 1 card terpadu ber-border halus (`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5`).
         - Menggunakan grid responsif proporsional (contoh modul 4 kontrol: `lg:col-span-5` Search, `lg:col-span-3` Role, `lg:col-span-2` Status, `lg:col-span-2` Per Hal; contoh modul 3 kontrol: `lg:col-span-6` Search, `lg:col-span-3` Status, `lg:col-span-3` Per Hal).
         - Dilarang memecah filter ke dalam baris/kartu-kartu terpisah agar tampilan bersih, proporsional, dan elegan.
4. **Komponen 4 - Card Tabel Data Tunggal (Single Data Table Card)**:
   - Container: `rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden`.
   - Membungkus tabel data tunggal responsif (`<div className="overflow-x-auto">`).

---

## 5. Ringkasan Statistik / Metric Cards & Logika Status
1. **Grid & Layout**: Disusun dalam format grid `grid grid-cols-2 sm:grid-cols-4 gap-3`.
2. **Struktur Kartu Metrik**:
   - Container: `cursor-pointer rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all`.
   - Indikator Aktif: Saat filter aktif, menggunakan `border-blue-500 ring-2 ring-blue-500/20 shadow-xs` (atau warna status terkait).
   - Label Atas: Teks kecil tebal abu-abu `text-[11px] font-semibold text-slate-400 uppercase tracking-wider`.
   - Baris Bawah: Angka tebal `text-2xl font-extrabold` dipadukan dengan badge pill status di sisi kanan `text-[11px] px-2 py-0.5 rounded-full font-medium`.
3. **Interaktivitas Filter Cepat**: Setiap kartu dapat diklik langsung untuk memfilter tabel berdasarkan status (*Total*, *Sedang Diproses*, *BTL/Perbaikan*, *Usulan Selesai*).
4. **Ketentuan Status Selesai vs Diproses (Acuan Utama Field `archives`)**:
   - **Usulan Selesai**: Dihitung dari tiket dengan nilai `archives == 1` (layanan telah selesai dan tiket diarsipkan).
   - **Sedang Diproses**: Dihitung dari tiket dengan nilai `archives != 1` (atau `0`/`null`), artinya tiket masih dalam proses berjalan.
   - Dilarang menentukan status usulan selesai hanya berdasarkan pencocokan string teks status tahapan tanpa memeriksa field `archives`.

---

## 6. Standar Tipografi Kolom Tabel
1. **Kolom Pegawai (Nama, NIP, & Avatar Inisial Bulat Slate)**:
   - Data nama dan NIP **wajib dibaca langsung dari kolom database lokal** (`item.nama` dan `item.nip`), dilarang memanggil API eksternal SIMPEG di halaman list/tabel.
   - Nama pegawai menggunakan ukuran kompak: `text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]` dilengkapi atribut `title={namaPegawai}`.
   - NIP di bawah nama menggunakan: `text-[11px] font-mono text-slate-400`.
   - **Avatar Inisial Standar Bulat Slate (Wajib Seragam di Seluruh Tabel)**:
     - Menggunakan inisial 2 huruf (misal: *KP* untuk *Kadek Purnamayasa*) dari fungsi `getInitials(item.nama, 'P')`.
     - Styling baku: `w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[11px] flex-shrink-0`.
     - **Dilarang keras menggunakan bentuk kotak/rounded-xl atau warna beraksen (seperti `rounded-xl bg-blue-50`) pada avatar tabel**, agar seluruh modul di semua role tampil konsisten, serasi, dan bersih dengan bentuk lingkaran abu-abu slate halus.
2. **Kolom Layanan & Unit Kerja (Ukuran Font Normal Kompak & Pembatasan Line Clamping)**:
   - **Ukuran Font Wajib Normal Kompak (`text-xs`)**: Seluruh isi teks kolom Layanan dan Unit Kerja **wajib menggunakan ukuran font normal kompak `text-xs font-medium text-slate-800 dark:text-slate-200`** (dilarang menggunakan `text-sm`, `sm:text-sm`, atau membiarkan teks membesar melebihi kolom Pegawai).
   - **Wajib Line Clamping Maksimal 2 Baris (`line-clamp-2 max-w-[220px]`)**: Teks nama layanan yang panjang **wajib dibatasi maksimal 2 baris** menggunakan class `line-clamp-2 max-w-[200px]` atau `max-w-[220px]` sehingga terpotong elipsis (`...`) secara rapi (acuan resmi: `Bidang/Permintaan/Index.jsx`). Hal ini mencegah baris tabel meregang terlalu tinggi dan menjaga kerapian vertikal seluruh baris tabel.
   - **Unit Kerja**: **Wajib dibaca langsung dari kolom database lokal** (`item.nama_ukerja`), dilarang memanggil API eksternal. Ditampilkan dengan format `text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[180px]` (atau di bawah NIP pada kolom Pemohon: `text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]`).
   - **Tooltip Nama Lengkap**: Wajib menyertakan atribut `title={item.layanan?.nama_layanan || '-'}` pada elemen span agar nama layanan lengkap tetap dapat dibaca saat kursor diarahkan (hover).
   - **Ukuran Font Body Tabel (`<tbody>`)**: Container `<tbody>` pada seluruh tabel data wajib konsisten menggunakan `text-xs text-slate-700 dark:text-slate-300` (dilarang menggunakan `sm:text-sm` yang menyebabkan seluruh teks sel tabel membesar pada layar iPad/desktop).
3. **Standar Warna Icon pada Kolom Aksi Tabel (Wajib Seragam di Seluruh Tabel)**:
   - Seluruh icon aksi pada kolom tabel **wajib memiliki warna semantik yang jelas** (dilarang membiarkan icon berwarna abu-abu polos `text-slate-400`):
     1. **Icon View / Detail / Riwayat / Mata (`Eye`, `History`, `FileText`)**:
        - Warna baku: **Biru** (`text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50`).
     2. **Icon Edit / Ubah / Perbaiki / Pensil (`Edit3`, `Edit`, `Pencil`)**:
        - Warna baku: **Orange / Amber** (`text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50` atau `text-orange-500 dark:text-orange-400`).
     3. **Icon Delete / Hapus / Sampah (`Trash2`, `Trash`)**:
        - Warna baku: **Merah** (`text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50`).
4. **Ketentuan Mutlak Larangan Pengambilan Nilai API pada Seluruh Tabel Index**:
   - Seluruh data yang disajikan pada tabel index di semua role (Admin Bawah, Admin Bidang, Admin OPD, Root) — khususnya **Nama Pemohon**, **NIP**, dan **Unit Kerja / SKPD** — **WAJIB 100% dibaca langsung dari kolom database lokal** (`item.nama`, `item.nip`, dan `item.nama_ukerja` pada model `Regtiket`).
   - **DILARANG KERAS memanggil API eksternal (seperti API SIMPEG, `PegawaiService::getPegawaiByNip`, `PegawaiService::getPegawaiByNips`, HTTP request, atau cURL)** di dalam method `index` controller maupun di sisi frontend saat me-render tabel list/index manapun.
   - **Tujuan**: Menghilangkan bottleneck performa, mencegah loading lambat/timeout saat volume data besar atau koneksi API SIMPEG terganggu, serta menjamin respons tabel tetap instan dan ringan saat paginasi maupun filtering.
   - **Pengecualian**: Pemanggilan API eksternal hanya diperkenankan pada alur spesifik seperti form Create usulan baru (lookup NIP saat input) atau halaman Review/Detail berkas individual jika memang dibutuhkan sinkronisasi data mutakhir.

---

## 7. Pemanfaatan Komponen Bersama (Reusable Components)
Wajib menggunakan komponen yang telah terstandarisasi untuk menjaga performa ringan dan kode tetap DRY:
- **Paginasi (`@/components/Pagination`)**:
  - **Penempatan Mandiri Langsung di Bawah Tabel**: Komponen `<Pagination>` wajib dipanggil langsung di bawah kontainer tabel `<div className="overflow-x-auto">` di dalam Card Tabel Data Tunggal tanpa dibungkus container flex pembatas ganda (`px-6 py-4 flex justify-between`).
  - **Zero Duplicate Counter (Dilarang Menduplikasi Teks Counter)**: Komponen `<Pagination>` secara bawaan sudah membungkus border-top halus (`p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800`), teks counter di sisi kiri (`Menampilkan data X - Y dari Z data`), dan tombol navigasi di sisi kanan (`Sebelumnya`, `Halaman X / Y`, `Berikutnya`). **Dilarang keras menambahkan teks manual "Menampilkan X - Y dari Z" di luar komponen**, karena menyebabkan tampilan teks ganda yang berantakan (seperti counter ganda di sisi kiri dan kanan).
  - **Format Pemanggilan Baku**:
    ```jsx
    <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        perPage={perPage}
        onPageChange={(page) => setCurrentPage(page)}
    />
    ```
    Atau dapat juga menggunakan prop objek terpadu `pagination={paginationMeta}`:
    ```jsx
    <Pagination
        pagination={paginationMeta}
        onPageChange={(page) => setCurrentPage(page)}
    />
    ```
- **Badge Status**: `@/components/StatusBadge` untuk konsistensi status dan warna tahapan usulan.
- **Modal Riwayat**: `@/components/RiwayatTahapanModal` untuk menampilkan modal log perjalanan tiket/usulan. Menggunakan endpoint global `/tiket/history/{no_tiket}` sehingga dapat diakses oleh semua role tanpa kendala hak akses middleware.
- **Optimasi Performa**: Gunakan `useMemo` untuk proses penyaringan (search/filter) data client-side agar respons instan tanpa lag atau re-render yang tidak perlu.

---

## 8. Standar Card State Kosong & Pencarian Awal Tabel (Empty / Initial State Card)
Seluruh halaman modul aplikasi yang menampilkan card state kosong (data tidak ditemukan, belum ada data pada periode terpilih, atau prompt awal sebelum melakukan pencarian/filter) **wajib 100% mematuhi acuan baku berikut**:
1. **Container Wrapper Card**:
   - Berada di dalam wrapper card tabel ber-border halus: `rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden`.
   - Padding vertikal dan perataan tinggi seragam: `py-16 px-4 text-center` (dilarang menggunakan padding pendek `p-8` atau `p-10`).
2. **Icon State**:
   - Menggunakan outline icon Lucide ukuran kompak: `w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3`.
   - **Dilarang keras membungkus icon dengan boks/kontainer background tebal berwarna** (seperti `w-16 h-16` atau `w-14 h-14` dengan background `bg-blue-50` / `bg-slate-100`). Icon harus langsung tampil bersih (clean outline) agar visual tetap minimalis dan elegan.
3. **Tipografi Judul**:
   - Wajib menggunakan elemen heading `h4` kompak: `text-sm font-bold text-slate-800 dark:text-slate-200` (dilarang menggunakan `h3 text-base sm:text-lg`).
4. **Tipografi Sub-Deskripsi**:
   - Wajib menggunakan elemen paragraf `p`: `text-xs text-slate-400 mt-1 max-w-sm mx-auto` agar teks terpusat proporsional dan tidak melebar ke tepi (dilarang menggunakan `text-sm max-w-md`).
5. **Tombol Reset / Aksi Tambahan (Opsional)**:
   - Jika card memiliki tombol reset filter/pencarian, gunakan ukuran kompak: `mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors`.

---

## 9. Standar Card Informasi Pemohon & QR Tiket (Header Form Detail / Edit)
Setiap halaman review, verifikasi, perbaikan, maupun update status tiket yang menampilkan ringkasan data pemohon dan nomor tiket **wajib mengikuti struktur baku 2 kolom grid berikut** (acuan resmi: `Bidang/Status/Edit.jsx` dan `Bidang/Permintaan/Edit.jsx`):

1. **Layout Grid Induk**:
   - `grid grid-cols-1 lg:grid-cols-12 gap-6`.
2. **Card Kiri: Informasi Pemohon & Layanan (`lg:col-span-8`)**:
   - Container: `rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4`.
   - Header Card: Icon `User` dalam boks rounded halus (`p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/40`) dengan judul `h3 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider` bertuliskan **"Informasi Pemohon & Layanan"**.
   - Grid Data 2 Kolom (`grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs`):
     1. `Nomor Induk Pegawai (NIP):` -> `p font-mono font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5`.
     2. `Bidang Pengampu Layanan:` -> `p font-semibold text-slate-800 dark:text-slate-200 mt-0.5`.
     3. `Nama Pegawai:` -> `p font-semibold text-slate-900 dark:text-white text-sm mt-0.5`.
     4. `Nama Layanan:` -> `p font-bold text-blue-600 dark:text-blue-400 mt-0.5`.
     5. `Pangkat / Golongan:` -> `p font-semibold text-slate-800 dark:text-slate-200 mt-0.5`.
     6. `Unit Kerja (OPD):` -> `p font-semibold text-slate-800 dark:text-slate-200 mt-0.5`.
3. **Card Kanan: Nomor Tiket & Barcode/QR Code (`lg:col-span-4`)**:
   - Container: `rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden`.
   - Pill Badge: `Nomor Tiket` dengan icon `QrCode` (`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 text-xs font-bold uppercase tracking-wider mb-2`).
   - Nomor Tiket: `h2 font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight` dilengkapi tombol salin (copy clipboard).
   - Visual QR Code: Gambar QR Code SVG base64 berukuran `w-28 h-28 mx-auto` di dalam box interaktif `p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform` dengan petunjuk teks `Klik QR untuk memperbesar` dan modal zoom.

---

## 10. Standar Tombol "Lihat Dokumen" / Tautan Berkas Persyaratan (Single Button Document Principle)
Seluruh halaman yang menyajikan verifikasi, perbaikan, maupun peninjauan berkas dokumen persyaratan (seperti `Opd/Perbaikan/Edit.jsx`, `Bidang/Permintaan/Edit.jsx`, `Bidang/Status/Edit.jsx`, `AdminBawah/Perbaikan/Review.jsx`, dan `AdminBawah/Permintaan/Review.jsx`) **wajib 100% mematuhi aturan baku berikut**:

1. **Prinsip Tombol Tunggal (Single Button Principle)**:
   - Pada setiap baris berkas persyaratan, **HANYA BOLEH MENAMPILKAN 1 TOMBOL AKSI DOKUMEN**.
   - **Dilarang keras menampilkan 2 tombol berdampingan** (misalnya menampilkan tombol "Berkas Manual" bersamaan dengan tombol "SIMPEG", atau tombol "Lihat Berkas Lama" bersamaan dengan "Lihat Arsip SIMPEG").
2. **Aturan Prioritas Berkas (Manual Upload vs SIMPEG)**:
   - **Jika Dokumen Pernah / Telah Diupload Manual Pengganti (`hasManualUpload` / `file_path` ada)**:
     - Berkas manual tersebut adalah berkas revisi/pengganti yang paling mutakhir.
     - **Tampilkan HANYA SATU tombol link** bertuliskan **"Lihat Dokumen"** yang mengarah langsung ke URL berkas manual tersebut (`/adminOpd/perbaikan/dokumen/{id}` atau `/adminBidang/permintaan/dokumen/{id}`).
     - Tombol arsip SIMPEG **TIDAK PERLU dirender terpisah**, agar verifikator maupun admin langsung fokus pada dokumen hasil perbaikan/unggah terkini.
     - Badge sumber di kolom persyaratan dapat memperjelas: `Sumber: Upload Manual (Pengganti)` atau `Sumber: Upload Manual (Revisi)`.
   - **Jika Dokumen Murni Bersumber dari SIMPEG (Belum Ada Upload Manual)**:
     - **Tepat 1 Dokumen SIMPEG**: Tampilkan 1 tombol link bertuliskan **"Lihat Dokumen"** yang langsung membuka URL dokumen SIMPEG.
     - **Lebih dari 1 Dokumen Riwayat SIMPEG**: Tampilkan 1 tombol bertuliskan **"Lihat Dokumen (N)"** (di mana `N` adalah jumlah riwayat berkas, misal: *Lihat Dokumen (3)*) yang memicu pop-up / modal pemilihan berkas arsip SIMPEG.
   - **Jika Dokumen Belum Diunggah / Tidak Tersedia**:
     - Tampilkan badge status ringkas: `Belum Diunggah` atau `Tidak Tersedia` (`text-rose-600 bg-rose-50 border-rose-200`). Dilarang menampilkan tombol link kosong atau tombol error.
3. **Standar Teks & Tipografi Tombol**:
   - Teks label tombol wajib seragam: **"Lihat Dokumen"** (atau `"Lihat Dokumen (N)"`).
   - Dilarang menggunakan label ambigu atau berbeda-beda seperti "Lihat", "Lihat Berkas Lama", "Berkas Manual", atau "Buka SIMPEG".
4. **Desain & Styling Tombol Baku**:
   - Class baku tombol/link: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs`.
   - Menggunakan icon dokumen (`FileText` ukuran `w-3.5 h-3.5`) dipadukan dengan icon link eksternal (`ExternalLink` ukuran `w-3 h-3 text-blue-400`).
