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
        Schema::create('tb_det_tiket', function (Blueprint $table) {
            $table->id();
            $table->string('no_tiket', 10);
            $table->string('id_syarat', 5);
            $table->string('status', 10);
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('no_tiket')
                ->references('no_tiket')
                ->on('tb_regtiket')
                ->onDelete('cascade');

            $table->foreign('id_syarat')
                ->references('id')
                ->on('tb_syarat')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_det_tiket');
    }
};
