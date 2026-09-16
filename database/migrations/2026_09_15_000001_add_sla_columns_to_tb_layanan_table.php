<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Menambahkan kolom SLA (target_waktu & satuan_waktu) ke tb_layanan.
     * Kolom waktu_penyelesaian (string) TETAP DIPERTAHANKAN agar modul yang
     * sudah berjalan tidak rusak. Kolom ini akan diisi ulang secara otomatis
     * oleh LayananController saat create/update layanan.
     */
    public function up(): void
    {
        Schema::table('tb_layanan', function (Blueprint $table) {
            $table->unsignedInteger('target_waktu')->nullable()->after('rangkap');
            $table->enum('satuan_waktu', ['hari', 'bulan'])
                  ->default('hari')
                  ->after('target_waktu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_layanan', function (Blueprint $table) {
            $table->dropColumn(['target_waktu', 'satuan_waktu']);
        });
    }
};
