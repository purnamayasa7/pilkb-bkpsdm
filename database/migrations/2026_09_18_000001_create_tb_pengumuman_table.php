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
        Schema::create('tb_pengumuman', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('bidang_id', 10)->nullable();
            
            // Konten Banner
            $table->string('judul', 100);
            $table->string('pesan', 255);
            $table->enum('tipe', ['info', 'warning', 'danger', 'success'])->default('info');
            
            // Periode Tayang
            $table->dateTime('mulai_pada');
            $table->dateTime('selesai_pada');
            $table->boolean('aktif')->default(true);
            
            // Tautan Opsional
            $table->string('tautan', 255)->nullable();
            $table->string('label_tautan', 40)->nullable();
            
            $table->timestamps();

            // Foreign Keys
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('bidang_id')
                  ->references('id')
                  ->on('tb_bidang')
                  ->onDelete('set null');

            // Indeks komposit untuk performa query cepat di dashboard
            $table->index(['aktif', 'mulai_pada', 'selesai_pada', 'created_at'], 'idx_pengumuman_dashboard');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_pengumuman');
    }
};
