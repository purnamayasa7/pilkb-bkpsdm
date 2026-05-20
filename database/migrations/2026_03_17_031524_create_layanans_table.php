<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tb_layanan', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->string('kode_bidang', 10);
            $table->text('nama_layanan');
            $table->string('rangkap', 10)->nullable();
            $table->string('waktu_penyelesaian', 50);
            $table->boolean('aktif')->default(true);
            $table->string('no_wa', 50)->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();

            $table->foreign('kode_bidang')
            ->references('id')
            ->on('tb_bidang')
            ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_layanan');
    }
};
