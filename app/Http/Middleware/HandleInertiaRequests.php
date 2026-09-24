<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'username' => $user->username,
                    'nip' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'role' => $user->role ? (is_object($user->role) ? $user->role->name : $user->role) : null,
                    'foto' => $user->foto,
                    'instansi' => $user->instansi ? [
                        'id' => $user->instansi->id ?? null,
                        'nama' => $user->instansi->nama_instansi ?? $user->instansi->nama ?? null,
                    ] : null,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'broadcast_announcements' => function () use ($user) {
                if (!$user) {
                    return [];
                }
                try {
                    \App\Models\Pengumuman::autoNonaktifkanExpired();

                    return \App\Models\Pengumuman::with(['bidang:id,nama_bidang', 'author:id,nama,username'])
                        ->sedangTayang()
                        ->get()
                        ->map(function ($item) {
                            return [
                                'id'           => $item->id,
                                'judul'        => $item->judul,
                                'pesan'        => $item->pesan,
                                'tipe'         => $item->tipe,
                                'mulai_pada'   => $item->mulai_pada ? $item->mulai_pada->format('Y-m-d H:i') : null,
                                'selesai_pada' => $item->selesai_pada ? $item->selesai_pada->format('Y-m-d H:i') : null,
                                'tautan'       => $item->tautan,
                                'label_tautan' => $item->label_tautan,
                                'bidang_nama'  => $item->bidang?->nama_bidang,
                                'author_nama'  => $item->author?->nama ?? $item->author?->username,
                                'created_at'   => $item->created_at ? $item->created_at->toISOString() : null,
                            ];
                        })
                        ->toArray();
                } catch (\Throwable $e) {
                    return [];
                }
            },
            'notifications' => function () use ($user) {
                if (!$user) {
                    return [
                        'unread_count' => 0,
                        'list'         => [],
                    ];
                }

                try {
                    $unreadCount = $user->unreadNotifications()->count();
                    $list = $user->notifications()
                        ->latest()
                        ->take(5)
                        ->get()
                        ->map(function ($n) {
                            return [
                                'id'         => $n->id,
                                'data'       => $n->data,
                                'read_at'    => $n->read_at,
                                'is_read'    => !is_null($n->read_at),
                                'time_ago'   => $n->created_at ? $n->created_at->diffForHumans() : '',
                                'url'        => $n->data['url'] ?? ('/notifications/read/' . $n->id),
                            ];
                        });

                    return [
                        'unread_count' => $unreadCount,
                        'list'         => $list,
                    ];
                } catch (\Throwable $e) {
                    return [
                        'unread_count' => 0,
                        'list'         => [],
                    ];
                }
            },
            'unread_messages' => function () use ($user) {
                if (!$user) {
                    return [
                        'unread_count' => 0,
                        'list'         => [],
                    ];
                }

                try {
                    $conversations = \App\Models\ChatConversation::with([
                        'creator.role',
                        'guest',
                        'tiket.layanan.bidang',
                        'layanan.bidang',
                        'bidang',
                        'participants.user.role',
                        'lastMessage',
                    ])
                        ->whereHas('participants', function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        })
                        ->orderByDesc('last_message_id')
                        ->get();

                    $activeRoomParam = request()->query('room') ?? request()->query('id');
                    $totalUnreadMessages = 0;
                    $formattedList = [];

                    foreach ($conversations as $conv) {
                        $isBeingOpened = ($activeRoomParam && (int) $conv->id === (int) $activeRoomParam);
                        $unread = $isBeingOpened ? 0 : (int) $conv->unreadCount($user->id);
                        if ($unread > 0) {
                            $totalUnreadMessages += $unread;
                        }

                        if (count($formattedList) < 5) {
                            $lastMsg = $conv->lastMessage;
                            $partnerName = 'Pengguna';
                            $roleLabel = 'User';

                            $isCreator = ((int) $conv->created_by === (int) $user->id);
                            if ($isCreator) {
                                $otherUser = $conv->participants->where('user_id', '!=', $user->id)->first()?->user;
                                if ($otherUser) {
                                    $partnerName = $otherUser->nama ?: $otherUser->name;
                                    $roleLabel = $otherUser->role?->name ?? 'User';
                                } else {
                                    $bidangNama = $conv->bidang?->nama_bidang ?? $conv->tiket?->layanan?->bidang?->nama_bidang ?? null;
                                    $partnerName = 'Admin ' . ($bidangNama ?? 'Bidang');
                                    $roleLabel = 'bidang';
                                }
                            } else {
                                if ($conv->guest) {
                                    $partnerName = $conv->guest->nama;
                                    $roleLabel = 'Tamu';
                                } elseif ($conv->creator) {
                                    $partnerName = $conv->creator->nama ?: $conv->creator->name;
                                    $roleLabel = $conv->creator->role?->name ?? 'User';
                                } else {
                                    $otherUser = $conv->participants->where('user_id', '!=', $user->id)->first()?->user;
                                    if ($otherUser) {
                                        $partnerName = $otherUser->nama ?: $otherUser->name;
                                        $roleLabel = $otherUser->role?->name ?? 'User';
                                    }
                                }
                            }

                            $formattedList[] = [
                                'id' => $conv->id,
                                'no_tiket' => $conv->no_tiket,
                                'nama_pengirim' => $partnerName,
                                'role_label' => $roleLabel,
                                'last_message' => optional($lastMsg)->message ?? 'Belum ada pesan',
                                'time_ago' => $lastMsg ? $lastMsg->created_at->diffForHumans() : ($conv->updated_at ? $conv->updated_at->diffForHumans() : ''),
                                'unread' => $unread,
                                'url' => '/chat?room=' . $conv->id,
                            ];
                        }
                    }

                    return [
                        'unread_count' => $totalUnreadMessages,
                        'list'         => $formattedList,
                    ];
                } catch (\Throwable $e) {
                    return [
                        'unread_count' => 0,
                        'list'         => [],
                    ];
                }
            },
            'menu' => function () use ($user) {
                if (!$user) {
                    return [];
                }

                $menuItems = config("menu.{$user->role_id}", []);

                // Admin OPD (role_id = 3): Hitung total usulan tiket yang ada di Daftar Perbaikan
                if ($user->role_id == 3) {
                    try {
                        $btlCount = \App\Models\Regtiket::where('kode_ukerja', $user->kode_ukerja)
                            ->whereExists(function ($q) {
                                $q->select(\Illuminate\Support\Facades\DB::raw(1))
                                    ->from('tb_det_tiket')
                                    ->whereColumn('tb_det_tiket.no_tiket', 'tb_regtiket.no_tiket')
                                    ->where(function ($sub) {
                                        $sub->where('tb_det_tiket.status', 2)
                                            ->orWhere(function ($s) {
                                                $s->where('tb_regtiket.diperbaiki', 1)
                                                  ->whereNull('tb_det_tiket.status');
                                            });
                                    });
                            })
                            ->count();

                        foreach ($menuItems as &$item) {
                            if (isset($item['title']) && str_contains(strtolower($item['title']), 'perbaikan')) {
                                $item['badge_count'] = $btlCount;
                            }
                        }
                    } catch (\Throwable $e) {
                        // Fallback aman jika query bermasalah
                    }
                }

                // Admin Bidang (role_id = 4): Hitung badge Daftar Perbaikan & Daftar Permintaan (Bulan Ini)
                if ($user->role_id == 4) {
                    try {
                        $layananIds = !empty($user->bidang_id)
                            ? \App\Models\Layanan::where('kode_bidang', $user->bidang_id)->pluck('id')
                            : collect();

                        // 1. Badge Daftar Perbaikan (Usulan Tiket BTL / Perbaikan)
                        $btlQuery = \App\Models\Regtiket::query();
                        if ($layananIds->isNotEmpty()) {
                            $btlQuery->whereIn('kode_layanan', $layananIds);
                        }
                        $btlCount = $btlQuery->whereExists(function ($q) {
                            $q->select(\Illuminate\Support\Facades\DB::raw(1))
                                ->from('tb_det_tiket')
                                ->whereColumn('tb_det_tiket.no_tiket', 'tb_regtiket.no_tiket')
                                ->where(function ($sub) {
                                    $sub->where('tb_det_tiket.status', 2)
                                        ->orWhere(function ($s) {
                                            $s->where('tb_regtiket.diperbaiki', 1)
                                              ->whereNull('tb_det_tiket.status');
                                        });
                                });
                        })->count();

                        // 2. Badge Daftar Permintaan (Bulan Sekarang sesuai Index PermintaanController via B-INDEX)
                        $startOfMonth = \Carbon\Carbon::now()->startOfMonth()->toDateTimeString();
                        $endOfMonth   = \Carbon\Carbon::now()->endOfMonth()->toDateTimeString();

                        $permintaanQuery = \App\Models\Regtiket::whereBetween('tanggal', [$startOfMonth, $endOfMonth])
                            ->has('tahap', '>', 1)
                            ->has('detail');

                        if ($layananIds->isNotEmpty()) {
                            $permintaanQuery->whereIn('kode_layanan', $layananIds);
                        }
                        $permintaanCount = $permintaanQuery->count();

                        foreach ($menuItems as &$item) {
                            if (isset($item['title'])) {
                                $lowerTitle = strtolower($item['title']);
                                if (str_contains($lowerTitle, 'perbaikan')) {
                                    $item['badge_count'] = $btlCount;
                                    $item['badge_variant'] = 'warning';
                                } elseif (str_contains($lowerTitle, 'permintaan')) {
                                    $item['badge_count'] = $permintaanCount;
                                    $item['badge_variant'] = 'info';
                                }
                            }
                        }
                    } catch (\Throwable $e) {
                        // Fallback aman jika query bermasalah
                    }
                }

                return $menuItems;
            },
            'firebase' => [
                'apiKey' => config('services.firebase.api_key'),
                'authDomain' => config('services.firebase.auth_domain'),
                'databaseURL' => config('services.firebase.database_url'),
                'projectId' => config('services.firebase.project_id'),
                'storageBucket' => config('services.firebase.storage_bucket'),
                'messagingSenderId' => config('services.firebase.messaging_sender_id'),
                'appId' => config('services.firebase.app_id'),
            ],
        ];
    }
}
