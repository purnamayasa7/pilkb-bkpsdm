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
        Schema::create('tb_tahap', function (Blueprint $table) {
            $table->id();
            $table->string('no_tiket', 10);
            $table->dateTime('tanggal');
            $table->string('status', 50);
            $table->string('operator', 50);
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('no_tiket')
            ->references('no_tiket')
            ->on('tb_regtiket')
            ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_tahap');
    }
};
