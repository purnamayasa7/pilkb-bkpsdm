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
        Schema::create('tb_syarat', function (Blueprint $table) {
            $table->string('id', 5)->primary()->unique();
            $table->string('kode_layanan', 10);
            $table->text('syarat');
            $table->string('efile', 255)->nullable();
            $table->text('deskripsi')->nullable();
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
        Schema::dropIfExists('tb_syarat');
    }
};
