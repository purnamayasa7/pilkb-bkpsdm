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
        Schema::create('tb_deleted_reg_tiket', function (Blueprint $table) {
            $table->string('no_tiket', 15)->primary();
            $table->string('nip', 20);
            $table->string('kode_layanan', 10);
            $table->string('tanggal');
            $table->string('no_hp', 12);
            $table->string('nama_penerima', 100);
            $table->integer('archives');
            $table->string('operator_archives', 100);
            $table->integer('data_baru');
            $table->string('diambil', 10);
            $table->integer('diperbaiki');
            $table->dateTime('diperbaiki_tgl');
            $table->integer('dihapus');
            $table->dateTime('dihapus_tgl');
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
        Schema::dropIfExists('tb_deleted_reg_tiket');
    }
};
