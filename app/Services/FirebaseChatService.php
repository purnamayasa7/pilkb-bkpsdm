<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\ChatConversation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseChatService
{
    protected string $databaseUrl;

    public function __construct()
    {
        $url = config('services.firebase.database_url', env('FIREBASE_DATABASE_URL', 'https://pilkb-bkpsdm-default-rtdb.asia-southeast1.firebasedatabase.app'));
        $this->databaseUrl = rtrim($url, '/');
    }

    /**
     * Broadcast a new chat message to Firebase Realtime Database
     */
    public function broadcastMessage(ChatMessage $message): void
    {
        try {
            $message->loadMissing(['senderUser.role', 'senderGuest', 'conversation.participants']);
            $conversation = $message->conversation;
            if (!$conversation) {
                return;
            }

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

            $messageData = [
                'id'                => $message->id,
                'conversation_id'   => $message->conversation_id,
                'sender_user_id'    => $message->sender_user_id,
                'sender_guest_id'   => $message->sender_guest_id,
                'sender_name'       => $senderName,
                'sender_role'       => $senderRole,
                'sender_role_label' => $senderRoleLabel,
                'message'           => $message->message,
                'created_at'        => $message->created_at ? $message->created_at->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s'),
                'timestamp'         => (int) (microtime(true) * 1000),
            ];

            $conversationData = [
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
                'last_message_time' => $messageData['created_at'],
                'need_reply'        => (bool) $conversation->need_reply,
                'type'              => $conversation->type,
            ];

            $payload = [
                'messageData'      => $messageData,
                'conversationData' => $conversationData,
                'sent_at'          => (int) (microtime(true) * 1000),
            ];

            // 1. Update room node di Firebase
            Http::timeout(3)->put("{$this->databaseUrl}/conversations/{$conversation->id}/last_message.json", $payload);

            // 2. Jika guest tiket ada, update guest node
            if (!empty($conversation->no_tiket)) {
                Http::timeout(3)->put("{$this->databaseUrl}/guest_conversations/{$conversation->no_tiket}/last_message.json", $payload);
            }

            // 3. Update notification untuk setiap user peserta
            $participantUserIds = $conversation->participants->pluck('user_id')->filter()->unique()->values()->toArray();
            foreach ($participantUserIds as $userId) {
                Http::timeout(3)->put("{$this->databaseUrl}/users/{$userId}/last_event.json", $payload);
            }
        } catch (\Throwable $e) {
            Log::warning('Firebase broadcastMessage failed: ' . $e->getMessage());
        }
    }

    /**
     * Broadcast status change (open/closed) to Firebase Realtime Database
     */
    public function broadcastStatusChange(ChatConversation $conversation, string $status): void
    {
        try {
            $payload = [
                'conversationId' => $conversation->id,
                'no_tiket'       => $conversation->no_tiket,
                'status'         => $status,
                'updated_at'     => (int) (microtime(true) * 1000),
            ];

            Http::timeout(3)->put("{$this->databaseUrl}/conversations/{$conversation->id}/status.json", $payload);

            if (!empty($conversation->no_tiket)) {
                Http::timeout(3)->put("{$this->databaseUrl}/guest_conversations/{$conversation->no_tiket}/status.json", $payload);
            }
        } catch (\Throwable $e) {
            Log::warning('Firebase broadcastStatusChange failed: ' . $e->getMessage());
        }
    }
}
