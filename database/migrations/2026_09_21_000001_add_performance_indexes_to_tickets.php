<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Mendaftarkan indeks pencarian untuk mempercepat kueri baca (SELECT) Dashboard
     * Tanpa menambah kolom dan tanpa memanipulasi data yang ada.
     */
    public function up(): void
    {
        // 1. Tambahkan indeks pada kolom yang sudah ada di tb_regtiket
        Schema::table('tb_regtiket', function (Blueprint $table) {
            $table->index(['tanggal', 'kode_ukerja'], 'idx_regtiket_tanggal_ukerja');
            $table->index(['tanggal', 'archives'], 'idx_regtiket_tanggal_archives');
        });

        // 2. Tambahkan indeks pada kolom yang sudah ada di tb_det_tiket
        Schema::table('tb_det_tiket', function (Blueprint $table) {
            $table->index('status', 'idx_det_tiket_status');
        });
    }

    /**
     * Pembatalan indeks (Rollback) jika sewaktu-waktu ingin dicabut
     */
    public function down(): void
    {
        Schema::table('tb_regtiket', function (Blueprint $table) {
            $table->dropIndex('idx_regtiket_tanggal_ukerja');
            $table->dropIndex('idx_regtiket_tanggal_archives');
        });

        Schema::table('tb_det_tiket', function (Blueprint $table) {
            $table->dropIndex('idx_det_tiket_status');
        });
    }
};
