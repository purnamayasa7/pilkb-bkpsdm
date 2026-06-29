<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatParticipant extends Model
{
    protected $fillable = [
        'conversation_id',
        'user_id',
        'role',
        'last_read_message_id',
    ];

    public function conversation()
    {
        return $this->belongsTo(ChatConversation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
