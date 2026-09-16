<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE tb_layanan MODIFY COLUMN satuan_waktu ENUM('hari', 'minggu', 'bulan') NOT NULL DEFAULT 'hari'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE tb_layanan MODIFY COLUMN satuan_waktu ENUM('hari', 'bulan') NOT NULL DEFAULT 'hari'");
    }
};
