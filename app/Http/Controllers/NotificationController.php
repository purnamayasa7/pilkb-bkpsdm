<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Auth::user()
            ->notifications()
            ->latest()
            ->paginate(20);

        return view('notifications.index', compact('notifications'));
    }

    public function read($id)
    {
        $notification = Auth::user()
            ->notifications()
            ->findOrFail($id);

        if (is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return redirect($notification->data['url']);
    }

    public function readAll()
    {
        Auth::user()
            ->unreadNotifications
            ->markAsRead();

        return back();
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
}
