<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatConversation extends Model
{
    protected $fillable = [
        'no_tiket',
        'created_by',
        'guest_id',
        'last_message_id',
        'bidang_id',
        'layanan_id',
        'assigned_to',
        'type',
        'need_reply',
        'status',
        'claimed_at',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id');
    }

    public function tiket()
    {
        return $this->belongsTo(
            Regtiket::class,
            'no_tiket',
            'no_tiket'
        );
    }

    public function participants()
    {
        return $this->hasMany(ChatParticipant::class, 'conversation_id');
    }

    public function responders()
    {
        return $this->hasMany(ChatParticipant::class, 'conversation_id')
            ->where('role', 'responder');
    }

    public function unreadCount($userId)
    {
        $participant = $this->participants
            ->where('user_id', $userId)
            ->first();

        if (!$participant) {
            return 0;
        }

        $lastRead = $participant->last_read_message_id ?? 0;

        return $this->messages()
            ->where('id', '>', $lastRead)
            ->count();
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function guest()
    {
        return $this->belongsTo(
            ChatGuest::class,
            'guest_id'
        );
    }

    public function bidang()
    {
        return $this->belongsTo(
            Bidang::class,
            'bidang_id'
        );
    }

    public function layanan()
    {
        return $this->belongsTo(
            Layanan::class,
            'layanan_id'
        );
    }
}
