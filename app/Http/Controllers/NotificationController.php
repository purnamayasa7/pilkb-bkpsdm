<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Auth::user()->notifications()->latest();

        if ($request->filter === 'unread') {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate(15)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'type' => $item->data['type'] ?? 'default',
                    'title' => $item->data['title'] ?? 'Pemberitahuan',
                    'message' => $item->data['message'] ?? '',
                    'no_tiket' => $item->data['no_tiket'] ?? null,
                    'nama_layanan' => $item->data['nama_layanan'] ?? null,
                    'url' => $item->data['url'] ?? '#',
                    'read_at' => $item->read_at ? $item->read_at->toIso8601String() : null,
                    'is_read' => !is_null($item->read_at),
                    'created_at' => $item->created_at->format('d M Y H:i'),
                    'time_ago' => $item->created_at->diffForHumans(),
                ];
            });

        $totalCount = Auth::user()->notifications()->count();
        $unreadCount = Auth::user()->unreadNotifications()->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'totalCount' => $totalCount,
            'unreadCount' => $unreadCount,
            'currentFilter' => $request->filter ?? 'all',
        ]);
    }

    public function read($id)
    {
        $notification = Auth::user()
            ->notifications()
            ->findOrFail($id);

        if (is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return redirect($notification->data['url'] ?? '/dashboard');
    }

    public function readAll()
    {
        Auth::user()
            ->unreadNotifications
            ->markAsRead();

        return back()->with('success', 'Semua notifikasi berhasil ditandai telah dibaca.');
    }

    public function deleteAll()
    {
        Auth::user()
            ->notifications()
            ->delete();

        return back()->with(
            'success',
            'Semua notifikasi berhasil dihapus.'
        );
    }

    public function destroy($id)
    {
        Auth::user()
            ->notifications()
            ->where('id', $id)
            ->delete();

        return back()->with(
            'success',
            'Notifikasi berhasil dihapus.'
        );
    }
}
