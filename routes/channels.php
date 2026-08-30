<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel otorisasi untuk user inbox & badge notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Channel otorisasi untuk room chat percakapan
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    return \App\Models\ChatParticipant::where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->exists();
});
