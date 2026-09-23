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
        Schema::create('tb_ai_knowledge', function (Blueprint $table) {
            $table->id();

            // Kategori pengetahuan
            $table->string('kategori', 60)->default('lainnya')->comment(
                'regulasi|se_bupati|disiplin|cuti|pangkat|pensiun|pns_pppk|asn_umum|lainnya'
            );

            // Judul / topik pengetahuan
            $table->string('topik', 255);

            // Kata kunci untuk pencocokan (JSON array: ["jam kerja","ramadhan","jadwal"])
            $table->text('kata_kunci');

            // Konten jawaban LILI (Markdown supported)
            $table->longText('konten_jawaban');

            // Nomor referensi / dasar hukum (opsional)
            $table->string('nomor_referensi', 200)->nullable();

            // File PDF lampiran
            $table->string('file_path', 500)->nullable();
            $table->string('file_original_name', 255)->nullable();

            // Saran pertanyaan lanjutan (JSON array maks 4 item)
            $table->text('saran_pertanyaan')->nullable();

            // Status & statistik
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('hit_count')->default(0)->comment('Counter penggunaan oleh LILI AI');

            // Creator
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');

            $table->timestamps();

            // Index untuk performa query
            $table->index('kategori');
            $table->index('is_active');
            $table->index(['is_active', 'hit_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_ai_knowledge');
    }
};
