<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Membuat tabel tb_layanan_review untuk Survei Kepuasan Masyarakat (SKM).
     * Review diberikan oleh Admin OPD saat tiket usulan sudah berstatus Selesai.
     */
    public function up(): void
    {
        Schema::create('tb_layanan_review', function (Blueprint $table) {
            $table->id();
            $table->string('no_tiket', 50)->unique();
            $table->string('kode_layanan', 10);
            $table->unsignedBigInteger('user_id');
            $table->tinyInteger('rating');                   // Skala 1 – 5
            $table->json('aspek_penilaian')->nullable();     // ["Kecepatan", "Keramahan", ...]
            $table->text('komentar')->nullable();
            $table->timestamps();

            $table->foreign('no_tiket')
                  ->references('no_tiket')
                  ->on('tb_regtiket')
                  ->onDelete('cascade');

            $table->foreign('kode_layanan')
                  ->references('id')
                  ->on('tb_layanan')
                  ->onDelete('cascade');

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_layanan_review');
    }
};
