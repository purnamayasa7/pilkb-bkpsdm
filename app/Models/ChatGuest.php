<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatGuest extends Model
{
    protected $fillable = [
        'nama',
        'email',
    ];

    public function conversations()
    {
        return $this->hasMany(
            ChatConversation::class,
            'guest_id'
        );
    }

    public function messages()
    {
        return $this->hasMany(
            ChatMessage::class,
            'sender_guest_id'
        );
    }
}
