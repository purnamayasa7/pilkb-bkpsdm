<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\ChatConversation;
use App\Models\ChatGuest;
use App\Models\ChatMessage;
use App\Models\ChatParticipant;
use App\Models\Layanan;
use App\Models\Regtiket;
use App\Models\User;
use App\Notifications\TiketNotification;
use App\Services\PegawaiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class ChatController extends Controller
{
    protected $pegawaiService;

    public function __construct(PegawaiService $pegawaiService)
    {
        $this->pegawaiService = $pegawaiService;
    }

    // OPD, Bidang
    public function index()
    {
        $user = Auth::user();

        $conversationIds = ChatParticipant::where(
            'user_id',
            $user->id
        )->pluck('conversation_id');

        $conversations = ChatConversation::with([
            'creator',
            'messages'
        ])
            ->whereIn('id', $conversationIds)
            ->orderByDesc('last_message_id')
            ->get();

        return view('chat.index', compact('conversations'));
    }

    public function myConversations()
    {
        $user = Auth::user();

        $conversations = ChatConversation::with([
            'creator.role',
            'guest',
            'tiket.layanan.bidang',
            'layanan.bidang',
            'bidang',
            'participants.user',
            'lastMessage'
        ])
            ->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderByDesc('last_message_id')
            ->get();

        return response()->json(
            $conversations->map(function ($conversation) use ($user) {
                $lastMsg = $conversation->lastMessage;

                $responder = $conversation->participants
                    ->where('user_id', '!=', $user->id)
                    ->first()
                    ?->user;

                $layananNama = $conversation->tiket?->layanan?->nama_layanan
                    ?? $conversation->layanan?->nama_layanan
                    ?? null;

                $bidangNama = $conversation->bidang?->nama_bidang
                    ?? $conversation->tiket?->layanan?->bidang?->nama_bidang
                    ?? null;

                $senderName = $responder?->nama
                    ?? $conversation->guest?->nama
                    ?? $conversation->creator?->nama
                    ?? 'Helpdesk BKPSDM';

                $senderRole = 'opd';
                $senderRoleLabel = 'OPD';
                if ($conversation->guest_id || $conversation->type === 'guest' || $conversation->guest) {
                    $senderRole = 'tamu';
                    $senderRoleLabel = 'Tamu';
                } elseif ($conversation->creator) {
                    $roleName = $conversation->creator->role?->name;
                    if ($roleName === 'admin_opd') {
                        $senderRole = 'opd';
                        $senderRoleLabel = 'OPD';
                    } elseif ($roleName === 'bidang') {
                        $senderRole = 'bidang';
                        $senderRoleLabel = 'Bidang';
                    } elseif ($roleName === 'admin_bawah') {
                        $senderRole = 'fo';
                        $senderRoleLabel = 'FO';
                    } else {
                        $senderRole = 'opd';
                        $senderRoleLabel = 'OPD';
                    }
                }

                return [
                    'id' => $conversation->id,
                    'no_tiket' => $conversation->no_tiket,
                    'status' => $conversation->status ?? 'open',
                    'last_message_id' => $conversation->last_message_id,
                    'nama_pengirim' => $senderName,
                    'sender_role' => $senderRole,
                    'sender_role_label' => $senderRoleLabel,
                    'layanan' => $layananNama,
                    'bidang' => $bidangNama,
                    'last_message' => optional($lastMsg)->message ?? 'Belum ada pesan',
                    'last_message_time' => $lastMsg
                        ? $lastMsg->created_at->format('Y-m-d H:i:s')
                        : ($conversation->updated_at ? $conversation->updated_at->format('Y-m-d H:i:s') : null),
                    'is_last_from_me' => $lastMsg ? (int) $lastMsg->sender_user_id === (int) $user->id : false,
                    'unread' => $conversation->unreadCount($user->id),
                    'need_reply' => (bool) $conversation->need_reply,
                    'type' => $conversation->type,
                ];
            })
        );
    }

    public function startTicketConversation(Request $request)
    {
        $user = Auth::user();

        if ($user->role->name === 'bidang') {
            return response()->json([
                'message' => 'Admin Bidang hanya bertindak sebagai penerima/responder percakapan tiket.'
            ], 403);
        }

        $request->validate([
            'no_tiket' => 'required'
        ]);

        $tiket = Regtiket::with('layanan')
            ->where('no_tiket', $request->no_tiket)
            ->first();

        if (!$tiket) {
            return response()->json([
                'message' => 'Tiket tidak ditemukan'
            ], 404);
        }

        $conversation = ChatConversation::firstOrCreate(
            [
                'no_tiket' => $tiket->no_tiket,
                'type' => 'ticket'
            ],

            [
                'created_by' => $user->id,
                'bidang_id' => $tiket->layanan->kode_bidang ?? null,
                'status' => 'open',
                'need_reply' => false,
            ]
        );

        ChatParticipant::updateOrCreate(
            [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
            ],
            [
                'role' => 'creator'
            ]
        );

        $adminBidang = User::where('bidang_id', $conversation->bidang_id)
            ->whereHas('role', function ($q) {
                $q->where('name', 'bidang');
            })
            ->get();

        foreach ($adminBidang as $admin) {

            ChatParticipant::updateOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $admin->id,
                ],
                [
                    'role' => 'responder'
                ]
            );
        }

        return response()->json([
            'conversation_id' => $conversation->id
        ]);
    }


    public function searchTicket(Request $request)
    {
        $user = Auth::user();

        if ($user->role->name === 'bidang') {
            return response()->json([
                'success' => false,
                'message' => 'Pembuatan chat baru hanya dapat dilakukan oleh Admin OPD.'
            ], 403);
        }

        $request->validate([
            'no_tiket' => 'required'
        ]);

        $tiket = Regtiket::with([
            'layanan.bidang',
            'tahapTerakhir.statusRel'
        ])
            ->find($request->no_tiket);

        if (!$tiket) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor tiket tidak ditemukan'
            ]);
        }

        return response()->json([
            'success' => true,
            'tiket' => [
                'no_tiket' => $tiket->no_tiket,
                'nip' => $tiket->nip,
                'layanan' => $tiket->layanan->nama_layanan ?? '-',
                'tanggal' => $tiket->tanggal,
                'status' =>
                $tiket->tahapTerakhir
                    ?->statusRel
                    ?->status ?? '-',
                'bidang' =>
                $tiket->layanan
                    ?->bidang
                    ?->nama_bidang ?? '-',
            ]
        ]);
    }

    public function sendMessage(Request $request, ChatConversation $conversation)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $user = Auth::user();

        if (
            !$this->isParticipant(
                $conversation->id,
                $user->id
            )
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        // CHAT SUDAH DITUTUP
        if ($conversation->status === 'closed') {

            return response()->json([
                'message' => 'Chat sudah ditutup'
            ], 422);
        }

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_user_id'  => $user->id,
            'message'         => $request->message,
        ]);

        ChatParticipant::where(
            'conversation_id',
            $conversation->id
        )
            ->where(
                'user_id',
                $user->id
            )
            ->update([
                'last_read_message_id' => $message->id
            ]);

        $needReply = false;

        // TICKET: Jika yang kirim bukan bidang, maka bidang harus membalas.    
        if ($conversation->type === 'ticket') {
            if ($user->role->name !== 'bidang') {
                $needReply = true;
            }
        }

        $conversation->update([
            'last_message_id' => $message->id,
            'need_reply'      => $needReply
        ]);

        // Pastikan creator terdaftar kembali sebagai participant jika sebelumnya menghapus chat
        if ($conversation->created_by && (int)$user->id !== (int)$conversation->created_by) {
            ChatParticipant::firstOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'user_id'         => $conversation->created_by,
                ],
                [
                    'role' => 'creator'
                ]
            );
        }

        // Pastikan admin bidang / FO terdaftar kembali jika creator mengirim pesan baru
        if ($conversation->type === 'ticket' && $conversation->bidang_id && (int)$user->id === (int)$conversation->created_by) {
            $admins = User::where('bidang_id', $conversation->bidang_id)
                ->whereHas('role', fn($q) => $q->where('name', 'bidang'))
                ->get();

            foreach ($admins as $admin) {
                ChatParticipant::firstOrCreate(
                    [
                        'conversation_id' => $conversation->id,
                        'user_id'         => $admin->id,
                    ],
                    [
                        'role' => 'responder'
                    ]
                );
            }
        }

        try {
            app(\App\Services\FirebaseChatService::class)->broadcastMessage($message);
        } catch (\Throwable $e) {
            Log::warning('Firebase broadcastMessage failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    public function loadMessages(ChatConversation $conversation)
    {
        $user = Auth::user();

        if (
            !$this->isParticipant(
                $conversation->id,
                $user->id
            )
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $lastMessageId = $conversation->last_message_id ?: $conversation
            ->messages()
            ->max('id');

        ChatParticipant::where(
            'conversation_id',
            $conversation->id
        )
            ->where(
                'user_id',
                $user->id
            )
            ->update([
                'last_read_message_id' => $lastMessageId
            ]);

        // $messages = $conversation->messages()
        //     ->with([
        //         'senderUser:id,nama',
        //         'senderGuest:id,nama'
        //     ])
        //     ->orderBy('id')
        //     ->get();

        $messages = $conversation->messages()
            ->with([
                'senderUser:id,nama',
                'senderGuest:id,nama'
            ])
            ->orderBy('id')
            ->get()
            ->map(function ($msg) {

                return [
                    'id' => $msg->id,
                    'message' => $msg->message,

                    'sender_user_id' => $msg->sender_user_id,

                    'sender_name' =>
                    $msg->senderUser?->nama
                        ?? $msg->senderGuest?->nama
                        ?? 'Unknown',

                    'created_at' =>
                    $msg->created_at
                        ->format('Y-m-d H:i:s')
                ];
            });


        $conversation->load(['tiket.layanan.bidang', 'layanan.bidang', 'bidang', 'creator.role', 'guest']);

        $layananNama = $conversation->tiket?->layanan?->nama_layanan
            ?? $conversation->layanan?->nama_layanan
            ?? null;

        $bidangNama = $conversation->bidang?->nama_bidang
            ?? $conversation->tiket?->layanan?->bidang?->nama_bidang
            ?? null;

        $senderRole = 'opd';
        $senderRoleLabel = 'OPD';
        if ($conversation->guest_id || $conversation->type === 'guest' || $conversation->guest) {
            $senderRole = 'tamu';
            $senderRoleLabel = 'Tamu';
        } elseif ($conversation->creator) {
            $roleName = $conversation->creator->role?->name;
            if ($roleName === 'admin_opd') {
                $senderRole = 'opd';
                $senderRoleLabel = 'OPD';
            } elseif ($roleName === 'bidang') {
                $senderRole = 'bidang';
                $senderRoleLabel = 'Bidang';
            } elseif ($roleName === 'admin_bawah') {
                $senderRole = 'fo';
                $senderRoleLabel = 'FO';
            } else {
                $senderRole = 'opd';
                $senderRoleLabel = 'OPD';
            }
        }

        return response()->json([
            'ticket_number'     => $conversation->no_tiket,
            'status'            => $conversation->status ?? 'open',
            'layanan'           => $layananNama,
            'bidang'            => $bidangNama,
            'type'              => $conversation->type,
            'sender_role'       => $senderRole,
            'sender_role_label' => $senderRoleLabel,
            'nama_pengirim'     => $conversation->guest?->nama ?? $conversation->creator?->nama ?? 'Pengguna',
            'messages'          => $messages
        ]);
    }

    public function startGlobalChat()
    {
        $user = Auth::user();

        $admins = User::whereHas('role', function ($q) {
            $q->where('name', 'admin_bawah');
        })->get();

        if ($admins->isEmpty()) {
            return response()->json([
                'message' => 'Admin FO tidak ditemukan'
            ], 422);
        }

        $conversation = ChatConversation::firstOrCreate(
            [
                'created_by' => $user->id,
                'type'       => 'admin',
                'status'     => 'open',
            ],
            [
                'assigned_to' => null,
                'bidang_id'   => null,
            ]
        );

        // creator
        ChatParticipant::firstOrCreate(
            [
                'conversation_id' => $conversation->id,
                'user_id'         => $user->id,
            ],
            [
                'role' => 'creator'
            ]
        );

        // semua admin FO
        foreach ($admins as $admin) {

            ChatParticipant::firstOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'user_id'         => $admin->id,
                ],
                [
                    'role' => 'responder'
                ]
            );
        }

        return response()->json([
            'conversation_id' => $conversation->id
        ]);
    }

    public function adminInbox()
    {
        $user = Auth::user();

        $query = ChatConversation::with([
            'creator.role',
            'guest',
            'tiket.layanan.bidang',
            'layanan.bidang',
            'bidang',
            'participants',
            'lastMessage'
        ])
            ->whereHas('participants', function ($q) use ($user) {

                $q->where(
                    'user_id',
                    $user->id
                );
            });

        if ($user->role->name == 'admin_bawah') {

            $query->where('type', 'admin');
        } elseif ($user->role->name == 'bidang') {

            $query->whereIn('type', [
                'ticket',
                'guest'
            ]);
        }

        $conversations = $query
            ->orderByDesc('last_message_id')
            ->get();

        return response()->json(
            $conversations->map(function ($c) use ($user) {
                $lastMsg = $c->lastMessage;

                $layananNama = $c->tiket?->layanan?->nama_layanan
                    ?? $c->layanan?->nama_layanan
                    ?? null;

                $bidangNama = $c->bidang?->nama_bidang
                    ?? $c->tiket?->layanan?->bidang?->nama_bidang
                    ?? null;

                $senderRole = 'opd';
                $senderRoleLabel = 'OPD';
                if ($c->guest_id || $c->type === 'guest' || $c->guest) {
                    $senderRole = 'tamu';
                    $senderRoleLabel = 'Tamu';
                } elseif ($c->creator) {
                    $roleName = $c->creator->role?->name;
                    if ($roleName === 'admin_opd') {
                        $senderRole = 'opd';
                        $senderRoleLabel = 'OPD';
                    } elseif ($roleName === 'bidang') {
                        $senderRole = 'bidang';
                        $senderRoleLabel = 'Bidang';
                    } elseif ($roleName === 'admin_bawah') {
                        $senderRole = 'fo';
                        $senderRoleLabel = 'FO';
                    } else {
                        $senderRole = 'opd';
                        $senderRoleLabel = 'OPD';
                    }
                }

                return [
                    'id' => $c->id,
                    'no_tiket' => $c->no_tiket,
                    'status' => $c->status ?? 'open',
                    'last_message_id' => $c->last_message_id,
                    'nama_pengirim' => $c->guest?->nama
                        ?? $c->creator?->nama
                        ?? '-',
                    'sender_role' => $senderRole,
                    'sender_role_label' => $senderRoleLabel,
                    'layanan' => $layananNama,
                    'bidang' => $bidangNama,
                    'last_message' => optional($lastMsg)->message ?? 'Belum ada pesan',
                    'last_message_time' => $lastMsg
                        ? $lastMsg->created_at->format('Y-m-d H:i:s')
                        : ($c->updated_at ? $c->updated_at->format('Y-m-d H:i:s') : null),
                    'is_last_from_me' => $lastMsg ? (int) $lastMsg->sender_user_id === (int) $user->id : false,
                    'unread' => $c->unreadCount($user->id),
                    'need_reply' => (bool) $c->need_reply,
                    'type' => $c->type,
                ];
            })
        );
    }

    private function isParticipant($conversationId, $userId)
    {
        return ChatParticipant::where(
            'conversation_id',
            $conversationId
        )
            ->where(
                'user_id',
                $userId
            )
            ->exists();
    }

    // Guest
    public function loadGuestMessages(Request $request, ChatConversation $conversation)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $conversation->load('guest');

        if (
            !$conversation->guest ||
            strtolower($conversation->guest->email)
            !== strtolower($request->email)
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $messages = $conversation->messages()
            ->with([
                'senderUser:id,nama',
                'senderGuest:id,nama'
            ])
            ->orderBy('id')
            ->get();

        return response()->json([
            'status'        => $conversation->status,
            'ticket_number' => $conversation->no_tiket,
            'messages'      => $messages
        ]);
    }

    public function getBidang()
    {
        $bidang = Bidang::query()
            ->where('aktif', 1)
            ->orderBy('nama_bidang')
            ->get([
                'id',
                'nama_bidang'
            ]);

        return response()->json($bidang);
    }

    public function getLayanan($bidangId)
    {
        $layanan = Layanan::query()
            ->where('kode_bidang', $bidangId)
            ->where('aktif', 1)
            ->orderBy('nama_layanan')
            ->get([
                'id',
                'nama_layanan'
            ]);

        return response()->json($layanan);
    }

    public function startGuestChat(Request $request)
    {
        $request->validate([
            'nip'        => 'nullable|string|max:30',
            'nama'       => 'required|string|max:100',
            'email'      => 'required|email|max:100',
            'bidang_id'  => 'nullable',
            'layanan_id' => 'required|exists:tb_layanan,id',
        ]);

        $layanan = \App\Models\Layanan::find($request->layanan_id);
        $bidangId = $request->bidang_id ?: ($layanan?->kode_bidang ?? null);

        $guest = ChatGuest::updateOrCreate(
            [
                'email' => $request->email
            ],
            [
                'nip'  => $request->nip ?: null,
                'nama' => $request->nama
            ]
        );

        $conversation = ChatConversation::create([
            'guest_id'   => $guest->id,
            'bidang_id'  => $bidangId,
            'layanan_id' => $request->layanan_id,
            'type'       => 'guest',
            'status'     => 'open',
            'need_reply' => false,
            'no_tiket'   => $this->generateGuestTicketNumber(),
        ]);

        $adminBidang = User::where(
            'bidang_id',
            $bidangId
        )
            ->whereHas('role', function ($q) {
                $q->where('name', 'bidang');
            })
            ->get();

        foreach ($adminBidang as $admin) {

            ChatParticipant::firstOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'user_id'         => $admin->id,
                ],
                [
                    'role' => 'responder'
                ]
            );
        }

        // Kirim Notifikasi Email ke Pengguna/Tamu berisi Nomor Tiket Obrolan
        if (!empty($guest->email)) {
            try {
                $layananNama = $layanan?->nama_layanan ?? 'Konsultasi Layanan Kepegawaian';
                $pesanNotifikasi = "Halo {$guest->nama}, percakapan bantuan Anda dengan Admin BKPSDM terkait layanan \"{$layananNama}\" telah berhasil dibuat dengan Nomor Tiket: {$conversation->no_tiket}.\n\nSimpan Nomor Tiket ini bersama alamat email Anda ({$guest->email}). Anda dapat menggunakannya sewaktu-waktu di menu \"Sudah Punya Tiket Chat\" pada halaman login PILKB untuk melanjutkan percakapan atau melihat tanggapan dari Admin BKPSDM.";

                Notification::route('mail', $guest->email)
                    ->notify(
                        new TiketNotification(
                            'Tiket Tanya Admin BKPSDM',
                            $pesanNotifikasi,
                            url('/login'),
                            $conversation->no_tiket,
                            'guest_chat_created',
                            $layananNama,
                            $guest->nama
                        )
                    );
            } catch (\Throwable $e) {
                Log::warning('Gagal mengirim email notifikasi tiket chat tamu: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success'         => true,
            'conversation_id' => $conversation->id,
            'no_tiket'        => $conversation->no_tiket,
        ]);
    }

    public function getPegawaiByNip($nip)
    {
        try {
            $pegawai = $this->pegawaiService->getPegawaiByNip($nip);

            if ($this->pegawaiService->isOffline()) {
                return response()->json([
                    'success' => false,
                    'status'  => 'api_offline',
                    'message' => 'Layanan data SIMPEG sedang tidak dapat terhubung. Percakapan hanya dapat dimulai setelah data pegawai terverifikasi. Silakan coba beberapa saat lagi.'
                ], 503);
            }

            if (!$pegawai) {
                return response()->json([
                    'success' => false,
                    'status'  => 'not_found',
                    'message' => 'NIP tidak terdaftar dalam database kepegawaian. Silakan periksa kembali 18 digit NIP Anda.'
                ], 404);
            }

            return response()->json([
                'success'    => true,
                'status'     => 'success',
                'nip'        => $pegawai['nip'] ?? $nip,
                'nama'       => $pegawai['nama_lengkap'] ?? $pegawai['nama'] ?? '',
                'unit_kerja' => $pegawai['ket_ukerja'] ?? '',
                'email'      => $pegawai['email'] ?? $pegawai['email_dinas'] ?? $pegawai['email_resmi'] ?? $pegawai['email_pribadi'] ?? '',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'status'  => 'api_error',
                'message' => 'Gagal terhubung ke server SIMPEG. Percakapan hanya dapat dimulai jika data pegawai terverifikasi.'
            ], 500);
        }
    }

    private function generateGuestTicketNumber()
    {
        do {
            $ticketNumber =
                'CH' .
                now()->format('dmY') .
                '-' .
                strtoupper(
                    \Illuminate\Support\Str::random(8)
                );
        } while (
            ChatConversation::where(
                'no_tiket',
                $ticketNumber
            )->exists()
        );

        return $ticketNumber;
    }

    public function sendGuestMessage(Request $request, ChatConversation $conversation)
    {
        $request->validate([
            'message' => 'required|string|max:3000',
            'email'   => 'nullable|email'
        ]);

        if ($conversation->status === 'closed') {
            return response()->json([
                'message' => 'Chat sudah ditutup'
            ], 422);
        }

        if ($conversation->type !== 'guest') {
            return response()->json([
                'message' => 'Tipe percakapan tidak valid'
            ], 403);
        }

        if ($request->filled('email')) {
            $conversation->loadMissing('guest');
            if ($conversation->guest && strtolower($conversation->guest->email) !== strtolower($request->email)) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }
        }

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_guest_id' => $conversation->guest_id,
            'message'         => trim($request->message),
        ]);

        $conversation->update([
            'last_message_id' => $message->id,
            'need_reply'      => true
        ]);

        try {
            app(\App\Services\FirebaseChatService::class)->broadcastMessage($message);
        } catch (\Throwable $e) {
            Log::warning('Firebase broadcastMessage failed: ' . $e->getMessage());
        }

        return response()->json([
            'success'       => true,
            'message'       => $message,
            'message_id'    => $message->id,
            'ticket_number' => $conversation->no_tiket
        ]);
    }

    public function resumeGuestChat(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'no_tiket' => 'required'
        ]);

        $conversation = ChatConversation::with('guest')
            ->where('no_tiket', $request->no_tiket)
            ->where('type', 'guest')
            ->first();

        if (!$conversation) {

            return response()->json([
                'success' => false,
                'message' => 'Nomor tiket tidak ditemukan'
            ], 404);
        }

        if (
            !$conversation->guest ||
            strtolower($conversation->guest->email)
            !== strtolower($request->email)
        ) {

            return response()->json([
                'success' => false,
                'message' => 'Email tidak sesuai'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'conversation_id' => $conversation->id,
            'guest_name' => $conversation->guest->nama,
            'ticket_number' => $conversation->no_tiket,
            'status'        => $conversation->status
        ]);
    }

    public function closeChat(ChatConversation $conversation)
    {
        $user = Auth::user();

        if (
            !$this->isParticipant(
                $conversation->id,
                $user->id
            )
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $conversation->update([
            'status' => 'closed'
        ]);

        try {
            app(\App\Services\FirebaseChatService::class)->broadcastStatusChange($conversation, 'closed');
        } catch (\Throwable $e) {
            Log::warning('Firebase broadcastStatusChange failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'status' => 'closed'
        ]);
    }

    public function reopenChat(ChatConversation $conversation)
    {
        $user = Auth::user();

        if (
            !$this->isParticipant(
                $conversation->id,
                $user->id
            )
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $conversation->update([
            'status' => 'open'
        ]);

        try {
            app(\App\Services\FirebaseChatService::class)->broadcastStatusChange($conversation, 'open');
        } catch (\Throwable $e) {
            Log::warning('Firebase broadcastStatusChange failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'status' => 'open'
        ]);
    }

    /**
     * Mark a specific conversation as read for the current user.
     * Called via JS when user is inside the room and a new message arrives via WebSocket.
     */
    public function markConversationRead(ChatConversation $conversation)
    {
        $user = Auth::user();

        if (!$this->isParticipant($conversation->id, $user->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $lastMessageId = $conversation->messages()->max('id');

        if ($lastMessageId) {
            ChatParticipant::where('conversation_id', $conversation->id)
                ->where('user_id', $user->id)
                ->update(['last_read_message_id' => $lastMessageId]);
        }

        return response()->json(['success' => true]);
    }

    public function unreadCount()
    {
        $user = Auth::user();

        $count = ChatMessage::query()
            ->join('chat_participants', function ($join) use ($user) {
                $join->on('chat_messages.conversation_id', '=', 'chat_participants.conversation_id')
                    ->where('chat_participants.user_id', '=', $user->id);
            })
            ->whereColumn('chat_messages.id', '>', \Illuminate\Support\Facades\DB::raw('COALESCE(chat_participants.last_read_message_id, 0)'))
            ->where(function ($q) use ($user) {
                $q->whereNull('chat_messages.sender_user_id')
                    ->orWhere('chat_messages.sender_user_id', '!=', $user->id);
            })
            ->count();

        return response()->json([
            'count' => $count
        ]);
    }

    public function pollMessages(Request $request, ChatConversation $conversation)
    {
        $user = Auth::user();

        if (
            !$this->isParticipant(
                $conversation->id,
                $user->id
            )
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $lastMessageId = (int)
        $request->get(
            'last_message_id',
            0
        );

        $newMessages = $conversation->messages()
            ->with([
                'senderUser:id,nama',
                'senderGuest:id,nama'
            ])
            ->where('id', '>', $lastMessageId)
            ->orderBy('id')
            ->get();

        $messages = $this->formatMessages(
            $newMessages
        );

        if ($messages->isNotEmpty()) {
            ChatParticipant::where(
                'conversation_id',
                $conversation->id
            )
                ->where(
                    'user_id',
                    $user->id
                )
                ->update([
                    'last_read_message_id' =>
                    $messages->last()['id']
                ]);
        }

        return response()->json([
            'messages' => $messages,
            'status' => $conversation->status
        ]);
    }

    public function pollGuestMessages(Request $request, ChatConversation $conversation)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $conversation->load('guest');

        if (
            !$conversation->guest ||
            strtolower($conversation->guest->email) !== strtolower($request->email)
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $lastMessageId = (int) $request->get('last_message_id', 0);

        $newMessages = $conversation->messages()
            ->with([
                'senderUser:id,nama',
                'senderGuest:id,nama'
            ])
            ->where('id', '>', $lastMessageId)

            ->whereNotNull('sender_user_id')

            ->orderBy('id')
            ->get();

        $messages = $this->formatMessages($newMessages);

        return response()->json([
            'messages' => $messages,
            'status'   => $conversation->status,
        ]);
    }

    private function formatMessages($messages)
    {
        return $messages->map(function ($msg) {
            return [
                'id' => $msg->id,
                'message' => $msg->message,
                'sender_user_id' => $msg->sender_user_id,
                'sender_name' =>
                $msg->senderUser?->nama
                    ?? $msg->senderGuest?->nama
                    ?? 'Unknown',
                'created_at' =>
                $msg->created_at
                    ->format('Y-m-d H:i:s')
            ];
        });
    }

    public function pollInbox(Request $request)
    {
        $user = Auth::user();

        $lastMessageId = (int) $request->get(
            'last_message_id',
            0
        );

        $query = ChatConversation::with([
            'creator.role',
            'guest',
            'tiket.layanan.bidang',
            'layanan.bidang',
            'bidang',
            'participants',
            'lastMessage'
        ])
            ->whereHas('participants', function ($q) use ($user) {

                $q->where(
                    'user_id',
                    $user->id
                );
            })
            ->where(
                'last_message_id',
                '>',
                $lastMessageId
            );

        if ($user->role->name == 'admin_bawah') {

            $query->where('type', 'admin');
        } elseif ($user->role->name == 'bidang') {

            $query->whereIn('type', [
                'ticket',
                'guest'
            ]);
        }

        $conversations = $query
            ->orderByDesc('last_message_id')
            ->get();

        return response()->json(
            $conversations->map(function ($c) use ($user) {
                $lastMsg = $c->lastMessage;

                $layananNama = $c->tiket?->layanan?->nama_layanan
                    ?? $c->layanan?->nama_layanan
                    ?? null;

                $bidangNama = $c->bidang?->nama_bidang
                    ?? $c->tiket?->layanan?->bidang?->nama_bidang
                    ?? null;

                $senderRole = 'opd';
                $senderRoleLabel = 'OPD';
                if ($c->guest_id || $c->type === 'guest' || $c->guest) {
                    $senderRole = 'tamu';
                    $senderRoleLabel = 'Tamu';
                } elseif ($c->creator) {
                    $roleName = $c->creator->role?->name;
                    if ($roleName === 'admin_opd') {
                        $senderRole = 'opd';
                        $senderRoleLabel = 'OPD';
                    } elseif ($roleName === 'bidang') {
                        $senderRole = 'bidang';
                        $senderRoleLabel = 'Bidang';
                    } elseif ($roleName === 'admin_bawah') {
                        $senderRole = 'fo';
                        $senderRoleLabel = 'FO';
                    } else {
                        $senderRole = 'opd';
                        $senderRoleLabel = 'OPD';
                    }
                }

                return [
                    'id' => $c->id,
                    'no_tiket' => $c->no_tiket,
                    'status' => $c->status ?? 'open',
                    'last_message_id' => $c->last_message_id,
                    'nama_pengirim' => $c->guest?->nama
                        ?? $c->creator?->nama
                        ?? '-',
                    'sender_role' => $senderRole,
                    'sender_role_label' => $senderRoleLabel,
                    'layanan' => $layananNama,
                    'bidang' => $bidangNama,
                    'last_message' => optional($lastMsg)->message ?? 'Belum ada pesan',
                    'last_message_time' => $lastMsg
                        ? $lastMsg->created_at->format('Y-m-d H:i:s')
                        : ($c->updated_at ? $c->updated_at->format('Y-m-d H:i:s') : null),
                    'is_last_from_me' => $lastMsg ? (int) $lastMsg->sender_user_id === (int) $user->id : false,
                    'unread' => $c->unreadCount($user->id),
                    'need_reply' => (bool) $c->need_reply,
                    'type' => $c->type,
                ];
            })
        );
    }

    public function markAllRead(Request $request)
    {
        $user = Auth::user();

        $participants = ChatParticipant::where('user_id', $user->id)->get();

        foreach ($participants as $participant) {
            $lastMsgId = ChatMessage::where('conversation_id', $participant->conversation_id)->max('id');
            if ($lastMsgId) {
                $participant->update([
                    'last_read_message_id' => $lastMsgId
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Semua pesan berhasil ditandai dibaca'
        ]);
    }

    public function deleteConversations(Request $request)
    {
        $request->validate([
            'conversation_ids' => 'required|array',
            'conversation_ids.*' => 'integer'
        ]);

        $user = Auth::user();
        $ids = $request->conversation_ids;

        // Hapus participant hanya untuk user ini (seperti WhatsApp: hapus chat untuk saya)
        // Chat room dan pesan tetap utuh untuk lawan bicara (admin/bidang/pengguna lain)
        ChatParticipant::whereIn('conversation_id', $ids)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Percakapan berhasil dihapus dari daftar Anda'
        ]);
    }
}
