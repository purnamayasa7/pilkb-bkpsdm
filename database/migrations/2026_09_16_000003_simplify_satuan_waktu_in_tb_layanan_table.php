<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menyederhanakan satuan_waktu di tb_layanan menjadi 'hari' dan 'bulan'.
     */
    public function up(): void
    {
        // 1. Ubah kolom enum agar sementara menampung nilai lama dan baru
        DB::statement("ALTER TABLE tb_layanan MODIFY COLUMN satuan_waktu ENUM('hari', 'bulan', 'hari_kerja', 'hari_kalender') NOT NULL DEFAULT 'hari'");

        // 2. Normalisasi data lama ke 'hari'
        DB::table('tb_layanan')
            ->whereIn('satuan_waktu', ['hari_kerja', 'hari_kalender'])
            ->update(['satuan_waktu' => 'hari']);

        // 3. Normalisasi teks waktu_penyelesaian (misal "3 Hari Kerja" -> "3 Hari")
        DB::table('tb_layanan')
            ->where('waktu_penyelesaian', 'like', '%Hari Kerja%')
            ->update([
                'waktu_penyelesaian' => DB::raw("REPLACE(waktu_penyelesaian, 'Hari Kerja', 'Hari')")
            ]);

        DB::table('tb_layanan')
            ->where('waktu_penyelesaian', 'like', '%Hari Kalender%')
            ->update([
                'waktu_penyelesaian' => DB::raw("REPLACE(waktu_penyelesaian, 'Hari Kalender', 'Hari')")
            ]);

        // 4. Kunci enum hanya ke 'hari', 'minggu', dan 'bulan'
        DB::statement("ALTER TABLE tb_layanan MODIFY COLUMN satuan_waktu ENUM('hari', 'minggu', 'bulan') NOT NULL DEFAULT 'hari'");

        // 5. Pastikan role 5 (pimpinan) terdaftar di tabel roles
        if (Schema::hasTable('roles')) {
            DB::table('roles')->updateOrInsert(
                ['id' => 5],
                [
                    'name'       => 'pimpinan',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE tb_layanan MODIFY COLUMN satuan_waktu ENUM('hari_kerja', 'hari_kalender', 'bulan') NOT NULL DEFAULT 'hari_kerja'");
    }
};
