<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_user_id',
        'sender_guest_id',
        'message',
    ];

    public function conversation()
    {
        return $this->belongsTo(
            ChatConversation::class,
            'conversation_id'
        );
    }

    public function senderUser()
    {
        return $this->belongsTo(
            User::class,
            'sender_user_id'
        );
    }

    public function senderGuest()
    {
        return $this->belongsTo(
            ChatGuest::class,
            'sender_guest_id'
        );
    }

    public function sender()
    {
        return $this->belongsTo(
            User::class,
            'sender_user_id'
        );
    }

    public function getSenderNameAttribute()
    {
        if ($this->senderUser) {
            return $this->senderUser->nama;
        }

        if ($this->senderGuest) {
            return $this->senderGuest->nama;
        }

        return 'Unknown';
    }
}
