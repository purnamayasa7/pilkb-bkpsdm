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
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();

            $table->string('no_tiket')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('guest_id')
                ->nullable()
                ->constrained('chat_guests')
                ->cascadeOnDelete();

            $table->foreignId('last_message_id')->nullable();

            $table->string('bidang_id', 10)->nullable();
            $table->string('layanan_id')->nullable();

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('type', [
                'ticket',
                'admin',
                'guest'
            ]);

            $table->boolean('need_reply')->default(false);

            $table->enum('status', [
                'open',
                'closed'
            ])->default('open');

            $table->timestamp('claimed_at')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_conversations');
    }
};
