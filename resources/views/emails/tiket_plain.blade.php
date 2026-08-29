Yth. Bapak/Ibu,

Terdapat usulan baru pada sistem PILKB yang memerlukan tindak lanjut dan/atau verifikasi dari Anda.

--------------------------------------------------
DETAIL TIKET
--------------------------------------------------
Nomor Tiket  : {{ $no_tiket }}
@if(!empty($nama_layanan))
Nama Usulan  : {{ $nama_layanan }}
@endif
@if(!empty($nama_pegawai))
Nama Pegawai : {{ $nama_pegawai }}
@endif
Status       : {{ $title ?? 'Usulan Baru' }}
Waktu        : {{ now()->format('d-m-Y H:i') }} WITA

Keterangan:
{{ $pesan ?? '-' }}
--------------------------------------------------

Silakan akses tautan berikut untuk melihat detail:
{{ $url }}

PENTING: Jika tombol atau tautan di atas tidak berfungsi, salin dan tempelkan ke browser Anda.

--------------------------------------------------
Email ini dikirim secara otomatis oleh sistem PILKB BKPSDM.
Mohon untuk TIDAK membalas email ini.
--------------------------------------------------

Hormat kami,
Sistem PILKB - BKPSDM
Badan Kepegawaian dan Pengembangan Sumber Daya Manusia
(c) {{ now()->year }} BKPSDM. Seluruh hak cipta dilindungi.
