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
            $table->string('id_syarat', 15);
            $table->string('status', 10)->nullable();
            $table->text('comment')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamp('retention_until')->nullable();
            $table->timestamp('deleted_file_at')->nullable();
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
