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
use App\Services\PegawaiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

    public function startTicketConversation(Request $request)
    {
        $request->validate([
            'no_tiket' => 'required'
        ]);

        $user = Auth::user();

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

        $lastMessageId = $conversation
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


        return response()->json([
            'ticket_number' => $conversation->no_tiket,
            'status'        => $conversation->status,
            'messages'      => $messages
        ]);
        // return response()->json($messages);
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
            'creator',
            'guest',
            'participants',
            'messages' => function ($q) {
                $q->latest();
            }
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

                return [
                    'id' => $c->id,

                    'last_message_id' => $c->last_message_id,

                    'nama_pengirim' =>
                    $c->guest?->nama
                        ?? $c->creator?->nama
                        ?? '-',

                    'last_message' =>
                    optional($c->messages->first())->message,

                    'unread' =>
                    $c->unreadCount($user->id),

                    'need_reply' =>
                    $c->need_reply,

                    'type' =>
                    $c->type,
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
            'nip'        => 'required|string|size:18',
            'nama'       => 'required|string|max:100',
            'email'      => 'required|email|max:100',
            'bidang_id'  => 'required|exists:tb_bidang,id',
            'layanan_id' => 'required|exists:tb_layanan,id',
        ]);

        $guest = ChatGuest::updateOrCreate(
            [
                'email' => $request->email
            ],
            [
                'nip'  => $request->nip,
                'nama' => $request->nama
            ]
        );

        $conversation = ChatConversation::create([
            'guest_id'   => $guest->id,
            'bidang_id'  => $request->bidang_id,
            'layanan_id' => $request->layanan_id,
            'type'       => 'guest',
            'status'     => 'open',
            'need_reply' => false,
            'no_tiket'   => $this->generateGuestTicketNumber(),
        ]);

        $adminBidang = User::where(
            'bidang_id',
            $request->bidang_id
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

        return response()->json([
            'success'         => true,
            'conversation_id' => $conversation->id,
            'no_tiket'        => $conversation->no_tiket,
        ]);
    }

    public function getPegawaiByNip($nip)
    {
        $pegawai = $this->pegawaiService->getPegawaiByNip($nip);

        if (!$pegawai) {

            return response()->json([
                'success' => false,
                'message' => 'Pegawai tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'nip' => $pegawai['nip'],
            'nama' => $pegawai['nama_lengkap'] ?? $pegawai['nama'],
            'unit_kerja' => $pegawai['ket_ukerja']
        ]);
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
            'message' => 'required|string'
        ]);

        if ($conversation->status === 'closed') {

            return response()->json([
                'message' => 'Chat sudah ditutup'
            ], 422);
        }

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_guest_id' => $conversation->guest_id,
            'message'         => $request->message,
        ]);

        $conversation->update([
            'last_message_id' => $message->id,
            'need_reply' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
            'message_id' => $message->id,
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

        return response()->json([
            'success' => true,
            'status' => 'open'
        ]);
    }

    public function unreadCount()
    {
        $user = Auth::user();

        $count = 0;

        $participants = ChatParticipant::where(
            'user_id',
            $user->id
        )->get();

        foreach ($participants as $participant) {

            $lastReadId =
                $participant->last_read_message_id ?? 0;

            $count += ChatMessage::where(
                'conversation_id',
                $participant->conversation_id
            )
                ->where('id', '>', $lastReadId)
                ->where(function ($q) use ($user) {

                    $q->whereNull('sender_user_id')
                        ->orWhere(
                            'sender_user_id',
                            '!=',
                            $user->id
                        );
                })
                ->count();
        }

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
            'creator',
            'guest',
            'participants',
            'messages' => function ($q) {
                $q->latest();
            }
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

                return [

                    'id' => $c->id,

                    'last_message_id' =>
                    $c->last_message_id,

                    'nama_pengirim' =>
                    $c->guest?->nama
                        ?? $c->creator?->nama
                        ?? '-',

                    'last_message' =>
                    optional($c->messages->first())->message,

                    'unread' =>
                    $c->unreadCount($user->id),

                    'need_reply' =>
                    $c->need_reply,

                    'type' =>
                    $c->type,

                ];
            })

        );
    }
}
