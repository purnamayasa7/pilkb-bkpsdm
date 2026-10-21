<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserActivationController extends Controller
{
    /**
     * Tampilkan halaman aktivasi akun & atur password baru.
     */
    public function showActivationForm(string $token)
    {
        $user = User::where('activation_token', $token)->first();

        // Cek validitas token dan waktu kedaluwarsa
        if (!$user) {
            return Inertia::render('Auth/ActivateAccount', [
                'invalidToken' => true,
                'errorMessage' => 'Tautan aktivasi tidak valid atau akun telah diaktifkan sebelumnya.',
                'user'         => null,
                'token'        => $token,
            ]);
        }

        if ($user->activation_token_expires_at && Carbon::parse($user->activation_token_expires_at)->isPast()) {
            return Inertia::render('Auth/ActivateAccount', [
                'invalidToken' => true,
                'errorMessage' => 'Tautan aktivasi telah kedaluwarsa (berlaku 24 jam). Silakan hubungi Administrator BKPSDM untuk mengirimkan tautan aktivasi baru.',
                'user'         => [
                    'username' => $user->username,
                    'nama'     => $user->nama,
                    'email'    => $user->email,
                ],
                'token'        => $token,
            ]);
        }

        return Inertia::render('Auth/ActivateAccount', [
            'invalidToken' => false,
            'errorMessage' => null,
            'user'         => [
                'username'  => $user->username,
                'nama'      => $user->nama,
                'email'     => $user->email,
                'nama_role' => $user->nama_role ?? 'Pengguna PILKB',
            ],
            'token'        => $token,
        ]);
    }

    /**
     * Proses aktivasi akun dan atur kata sandi baru.
     */
    public function activateAccount(Request $request, string $token)
    {
        $user = User::where('activation_token', $token)->first();

        if (!$user || ($user->activation_token_expires_at && Carbon::parse($user->activation_token_expires_at)->isPast())) {
            return back()->withErrors([
                'password' => 'Tautan aktivasi tidak valid atau telah kedaluwarsa.'
            ]);
        }

        $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ], [
            'password.required'  => 'Kata sandi baru wajib diisi.',
            'password.min'       => 'Kata sandi baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
            'password'           => 'Kata sandi minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol khusus.',
        ]);

        $user->password = Hash::make($request->password);
        $user->activation_token = null;
        $user->activation_token_expires_at = null;
        $user->email_verified_at = now();
        $user->aktif = 1;
        $user->must_change_password = false;
        $user->save();

        ActivityLogService::log(
            'Manajemen Data User',
            'ACTIVATE_ACCOUNT',
            'Aktivasi akun mandiri oleh user: ' . $user->username,
            [],
            ['username' => $user->username, 'email' => $user->email]
        );

        session()->flash('status', 'Akun Anda (' . $user->username . ') berhasil diaktifkan! Silakan masuk menggunakan kata sandi baru Anda.');
        session()->flash('success', 'Akun Anda (' . $user->username . ') berhasil diaktifkan! Silakan masuk menggunakan kata sandi baru Anda.');

        return Inertia::location(route('login'));
    }
}
