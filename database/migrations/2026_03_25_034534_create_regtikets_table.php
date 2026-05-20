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
        Schema::create('tb_regtiket', function (Blueprint $table) {
            $table->string('no_tiket', 15)->primary();
            $table->string('nip', 20);
            $table->string('kode_layanan', 10);
            $table->date('tanggal');
            $table->string('kode_ukerja', 30)->nullable();
            $table->string('no_hp', 12)->nullable();
            $table->string('email', 255);
            $table->string('nama_penerima', 100);
            $table->integer('archives');
            $table->string('operator_archives', 100)->nullable();
            $table->integer('data_baru');
            $table->string('diambil', 10)->nullable();
            $table->integer('diperbaiki')->nullable();
            $table->dateTime('diperbaiki_tgl')->nullable();
            $table->integer('dihapus')->nullable();
            $table->dateTime('dihapus_tgl')->nullable();
            $table->timestamps();

            $table->foreign('kode_layanan')
                ->references('id')
                ->on('tb_layanan')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_regtiket');
    }
};
