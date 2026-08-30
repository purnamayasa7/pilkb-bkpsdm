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
    if (!$user) {
        return false;
    }

    $roleName = $user->role?->name;
    if (in_array($roleName, ['admin_bawah', 'root'])) {
        return true;
    }

    $isParticipant = \App\Models\ChatParticipant::where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->exists();

    if ($isParticipant) {
        return true;
    }

    $isCreator = \App\Models\ChatConversation::where('id', $conversationId)
        ->where('created_by', $user->id)
        ->exists();

    if ($isCreator) {
        return true;
    }

    if ($roleName === 'bidang') {
        $conv = \App\Models\ChatConversation::find($conversationId);
        if ($conv && $conv->bidang_id && (int) $conv->bidang_id === (int) $user->bidang_id) {
            return true;
        }
    }

    return false;
});
