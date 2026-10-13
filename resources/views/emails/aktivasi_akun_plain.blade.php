AKTIVASI AKUN PENGGUNA BARU - SISTEM PILKB
Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Buleleng
=========================================================================

Yth. {{ $user->nama ?? 'Bapak/Ibu Pegawai' }},

Akun Anda telah didaftarkan ke dalam Pusat Informasi Layanan Kepegawaian Buleleng (PILKB).
Untuk keamanan akun Anda, silakan lakukan aktivasi dan buat kata sandi akun Anda secara mandiri melalui tautan berikut:

{{ $activation_url }}

Informasi Akun:
- NIP / Username : {{ $user->username }}
- Nama Pegawai   : {{ $user->nama }}
- Email          : {{ $user->email }}
- Peranan / Role : {{ $user->nama_role ?? 'Pengguna PILKB' }}
- Masa Berlaku   : 24 Jam (Hingga {{ $expires_at ?? now()->addHours(24)->format('d-m-Y H:i') }} WITA)

Pemberitahuan Keamanan:
Tautan aktivasi ini bersifat rahasia dan berlaku selama 24 jam. Jangan berikan tautan ini kepada siapapun.

---
Email ini dikirim secara otomatis oleh Sistem PILKB BKPSDM. Mohon tidak membalas email ini.
(c) {{ now()->year }} BKPSDM Kabupaten Buleleng.
