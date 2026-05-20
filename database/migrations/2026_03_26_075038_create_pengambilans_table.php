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
        Schema::create('tb_pengambilan', function (Blueprint $table) {
            $table->id();
            $table->string('no_tiket', 15);
            $table->date('tanggal_pengambilan');
            $table->string('nama_pengambil', 100);
            $table->string('no_hp', 13)->nullable();

            $table->foreign('no_tiket')
            ->references('no_tiket')
            ->on('tb_regtiket')
            ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_pengambilan');
    }
};
