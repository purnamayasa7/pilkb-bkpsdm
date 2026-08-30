<?php

namespace App\Events;

use App\Models\ChatMessage;
use App\Models\ChatConversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messageData;
    public $conversationData;
    public $participantUserIds = [];

    /**
     * Create a new event instance.
     */
    public function __construct(ChatMessage $message)
    {
        $message->loadMissing(['senderUser.role', 'senderGuest', 'conversation.participants']);
        $conversation = $message->conversation;
        $conversation->loadMissing(['tiket.layanan.bidang', 'layanan.bidang', 'bidang', 'creator.role', 'guest', 'participants']);

        $senderName = $message->senderUser?->nama
            ?? $message->senderGuest?->nama
            ?? 'Pengguna';

        $senderRole = 'opd';
        $senderRoleLabel = 'OPD';

        if ($message->sender_guest_id || ($conversation && ($conversation->guest_id || $conversation->type === 'guest'))) {
            if ($message->sender_guest_id) {
                $senderRole = 'tamu';
                $senderRoleLabel = 'Tamu';
            } elseif ($message->senderUser) {
                $roleName = $message->senderUser->role?->name;
                if ($roleName === 'bidang') {
                    $senderRole = 'bidang';
                    $senderRoleLabel = 'Bidang';
                } elseif ($roleName === 'admin_bawah') {
                    $senderRole = 'fo';
                    $senderRoleLabel = 'FO';
                }
            }
        } elseif ($message->senderUser) {
            $roleName = $message->senderUser->role?->name;
            if ($roleName === 'admin_opd') {
                $senderRole = 'opd';
                $senderRoleLabel = 'OPD';
            } elseif ($roleName === 'bidang') {
                $senderRole = 'bidang';
                $senderRoleLabel = 'Bidang';
            } elseif ($roleName === 'admin_bawah') {
                $senderRole = 'fo';
                $senderRoleLabel = 'FO';
            }
        }

        $layananNama = $conversation->tiket?->layanan?->nama_layanan
            ?? $conversation->layanan?->nama_layanan
            ?? null;

        $bidangNama = $conversation->bidang?->nama_bidang
            ?? $conversation->tiket?->layanan?->bidang?->nama_bidang
            ?? null;

        $this->messageData = [
            'id'                => $message->id,
            'conversation_id'   => $message->conversation_id,
            'sender_user_id'    => $message->sender_user_id,
            'sender_guest_id'   => $message->sender_guest_id,
            'sender_name'       => $senderName,
            'sender_role'       => $senderRole,
            'sender_role_label' => $senderRoleLabel,
            'message'           => $message->message,
            'created_at'        => $message->created_at ? $message->created_at->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s'),
        ];

        $this->conversationData = [
            'id'                => $conversation->id,
            'no_tiket'          => $conversation->no_tiket,
            'status'            => $conversation->status ?? 'open',
            'last_message_id'   => $message->id,
            'nama_pengirim'     => $senderName,
            'sender_role'       => $senderRole,
            'sender_role_label' => $senderRoleLabel,
            'layanan'           => $layananNama,
            'bidang'            => $bidangNama,
            'last_message'      => $message->message,
            'last_message_time' => $this->messageData['created_at'],
            'need_reply'        => (bool) $conversation->need_reply,
            'type'              => $conversation->type,
        ];

        $this->participantUserIds = $conversation->participants->pluck('user_id')->filter()->unique()->values()->toArray();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // 1. Private channel untuk room percakapan terotentikasi
        $channels[] = new PrivateChannel('chat.' . $this->messageData['conversation_id']);

        // 2. Public channel untuk guest chat (diidentifikasi dengan nomor tiket)
        if (!empty($this->conversationData['no_tiket'])) {
            $channels[] = new Channel('guest-chat.' . $this->conversationData['no_tiket']);
        }

        // 3. Private channels untuk setiap participant user (untuk update inbox list & unread badge)
        foreach ($this->participantUserIds as $userId) {
            $channels[] = new PrivateChannel('user.' . $userId);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ChatMessageSent';
    }
}
