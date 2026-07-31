<?php

namespace Database\Seeders;

use App\Models\Layanan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LayananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Layanan::create([
            'id' => '2Ag1v9ZbSo',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'PENSIUN MUDA/DINI',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => '3WISwdJT8U',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'PENAMBAHAN MASA KERJA',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 TAHUN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => '5Jhg1OYtDB',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN DALAM JABATAN FUNGSIONAL MELALUI PERPINDAHAN DARI JABATAN LAIN',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => '5tLW1DNq3N',
            'kode_bidang' => 'ASwVnVYkyD',
            'nama_layanan' => 'TUGAS BELAJAR',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 1,
            'deskripsi' => 'Tugas belajar adalah penugasan yang diberikan oleh instansi pemerintah kepada Pegawai Negeri Sipil (PNS) untuk melanjutkan pendidikan ke jenjang yang lebih tinggi atau setara, baik di dalam maupun di luar negeri',
        ]);

        Layanan::create([
            'id' => '5UPlIbSFfe',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN KEMBALI DALAM JABATAN FUNGSIONAL NON KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => '6OUgvp9KXn',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PERPINDAHAN JABATAN FUNGSIONAL KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => '6UGYcNfEJi',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PERMOHONAN REKOMENDASI PINDAH TUGAS',
            'rangkap' => '',
            'waktu_penyelesaian' => '3 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'BzaT5vVqTz',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN PERTAMA KALI DALAM JABATAN FUNGSIONAL NON KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'C46GFlhoG0',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'KARTU TASPEN',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'c7bU7ov0H8',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PERMOHONAN CUTI TAHUNAN KEPALA SKPD, CUTI BESAR, CUTI DI LUAR TANGGUNGAN NEGARA',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'cCATb6JLOn',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'PPPK - PERPANJANGAN MASA HUBUNGAN PERJANJIAN KERJA PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA',
            'rangkap' => '',
            'waktu_penyelesaian' => '1',
            'aktif' => 0,
            'deskripsi' => 'Perpanjangan Masa Hubungan Perjanjian Kerja Pegawai Pemerintah Dengan Perjanjian Kerja',
        ]);

        Layanan::create([
            'id' => 'FV6h4VBrh8',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'PENSIUN MASA PERSIAPAN PENSIUN(MPP)',
            'rangkap' => '',
            'waktu_penyelesaian' => '3 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'Gq8rI3Hcib',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'KENAIKAN PANGKAT ANUMERTA',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'H2uOrDhMnj',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'PENGUSULAN CPNS MENJADI PNS',
            'rangkap' => '',
            'waktu_penyelesaian' => '3 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'jFexFzRcG9',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN PERTAMA KALI JABATAN FUNGSIONAL KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'jmnd8ih6by',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'JKK / JKM (JAMINAN KECELAKAAN KERJA / JAMINAN KEMATIAN)',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'k1RHcTH0aA',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'KENAIKAN JABATAN FUNGSIONAL KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'Kdgab4ZDpx',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'PENSIUN BATAS USIA PENSIUN (BUP)',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 TAHUN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'kX46MoHpe9',
            'kode_bidang' => 'ASwVnVYkyD',
            'nama_layanan' => 'PENGUSULAN UJIAN KP PENYESUAIAN IJAZAH',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'LJVvG0ZYnZ',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PEMBERHENTIAN DARI JABATAN FUNGSIONAL',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'lnJhUrFBCt',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'KENAIKAN PANGKAT FUNGSIONAL GURU TK/SD/SMP',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'Mtg8e2XHos',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'PENETAPAN ANGKA KREDIT (PAK) GOL II FUNGSIONAL GURU',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'MtYVLIT3Lr',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'PENSIUN JANDA/DUDA/YATIM PIATU',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'nK6N8bGil4',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'KENAIKAN PANGKAT FUNGSIONAL TERTENTU LAINNYA',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'o1UlI7ktMK',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'KENAIKAN PANGKAT PILIHAN STRUKTURAL / PENYESUAIAN IJAZAH',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'OqT75ssYkD',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'KENAIKAN JENJANG JABATAN FUNGSIONAL',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'OYe6fWTURY',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN PERTAMA KALI DALAM JABATAN FUNGSIONAL (FORMASI CPNS)',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'pxEljSVnQS',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PEMBERHENTIAN DALAM JABATAN FUNGSIONAL KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'Q1HPpjQouK',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'PENGUSULAN NIP ASN',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'qrbuIyHTnw',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'IMPASSING GAJI/BERKALA KEPALA PERANGKAT DAERAH',
            'rangkap' => '',
            'waktu_penyelesaian' => '3 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'r2cJtfMTMO',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN KEMBALI DALAM JABATAN FUNGSIONAL',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'rBgifNUhh2',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'PENCANTUMAN GELAR AKADEMIK',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'RBYQjyJX4V',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'PERMOHONAN PERBAIKAN SK KONVERSI NIP',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'RGep3B5GAb',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'PERBAIKAN DATABASE KEPEGAWAIAN',
            'rangkap' => '1',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 1,
            'deskripsi' => 'Perbaikan data pada SIASN, Simpeg atau aplikasi kepegawaian lainnya',
        ]);

        Layanan::create([
            'id' => 'rpuee7aUjQ',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN DALAM JABATAN FUNGSIONAL NON KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'SdNjpSa0EI',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN KEMBALI JABATAN FUNGSIONAL KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'tFb7NOC9IK',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'KARTU PEGAWAI',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'TkDIHV4Gsl',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'SURAT PERNYATAAN TIDAK SEDANG DALAM HUKUMAN DISIPLIN DAN TIDAK SEDANG TUGAS BELAJAR',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'ub9wXNvA8P',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'TAMBAHAN SYARAT KLAIM KE PT. TASPEN',
            'rangkap' => '',
            'waktu_penyelesaian' => '2 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'ULpUeamIrZ',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PENGANGKATAN DALAM JABATAN FUNGSIONAL MELALUI INPASSING/PENYESUAIAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'VfL4f2KVjc',
            'kode_bidang' => 'Eo2Cgh3csg',
            'nama_layanan' => 'PEMBERHENTIAN DARI JABATAN FUNGSIONAL NON KEPENDIDIKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

         Layanan::create([
            'id' => 'VMerK0VQXR',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'KENAIKAN PANGKAT REGULER (STAF/PELAKSANA/FUNGSIONAL UMUM)',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'wdz3DBms5p',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'LAYANAN SUDAH TIDAK DIGUNAKAN',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

         Layanan::create([
            'id' => 'xwFWTzrdbq',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'PENGUSULAN NIP CPNS (FORMASI HONORER)',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'YDFe1MnT6V',
            'kode_bidang' => 'ASwVnVYkyD',
            'nama_layanan' => 'SURAT REKOMENDASI SELEKSI PENDIDIKAN/BEASISWA',
            'rangkap' => '',
            'waktu_penyelesaian' => '1 MINGGU',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'yrUPs9CUiN',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'KARTU ISTRI/KARTU SUAMI',
            'rangkap' => '',
            'waktu_penyelesaian' => '2 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'zjxxYT0Vx1',
            'kode_bidang' => 'Bfz7DwpULw',
            'nama_layanan' => 'SATYA LENCANA KARYA SATYA (SLKS)',
            'rangkap' => '',
            'waktu_penyelesaian' => '',
            'aktif' => 1,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'ZMh6FB0JjQ',
            'kode_bidang' => 'ASwVnVYkyD',
            'nama_layanan' => 'PENGUSULAN UJIAN DINAS',
            'rangkap' => '',
            'waktu_penyelesaian' => '6 BULAN',
            'aktif' => 0,
            'deskripsi' => '',
        ]);

        Layanan::create([
            'id' => 'Zvi7jGS5Mg',
            'kode_bidang' => 'tGH3dXB2a0',
            'nama_layanan' => 'PPPK - PEMUTUSAN MASA HUBUNGAN PERJANJIAN KERJA PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA',
            'rangkap' => '',
            'waktu_penyelesaian' => '2 BULAN',
            'aktif' => 1,
            'deskripsi' => '',
        ]);
    }
}
