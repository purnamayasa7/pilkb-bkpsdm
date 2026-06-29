<?php

namespace App\Services;

use App\Models\ChatConversation;
use Illuminate\Support\Str;

class ChatTicketService
{
    public static function generate(): string
    {
        do {
            $ticket =
                'CHT-' .
                now()->format('dmY') .
                '-' .
                strtoupper(Str::random(10));
        } while (
            ChatConversation::where(
                'no_tiket',
                $ticket
            )->exists()
        );
        return $ticket;
    }
}
