<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Bidang;
use App\Models\Faq;
use App\Services\ActivityLogService;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    // Tampil halaman login
    public function create(): View
    {
        $faq = Faq::orderBy('pertanyaan')->get();

        $bidang = Bidang::orderBy('nama_bidang')->get();
        
        return view('auth.login', compact('faq', 'bidang'));
    }

    // Proses login autentikasi dengan proteksi brute-force (maksimal 3 kali gagal) dan CAPTCHA
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'captcha' => ['required', 'string', 'size:5'],
        ], [
            'username.required' => 'NIP wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'captcha.required' => 'Kode keamanan (CAPTCHA) wajib diisi.',
            'captcha.size' => 'Kode keamanan (CAPTCHA) harus terdiri dari 5 karakter.',
        ]);

        $throttleKey = Str::lower(trim($request->input('username'))) . '|' . $request->ip();

        // 1. Cek apakah akun/IP saat ini sedang dalam status terkunci
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            event(new Lockout($request));
            $seconds = RateLimiter::availableIn($throttleKey);

            ActivityLogService::log(
                'Autentikasi',
                'LOGIN_BLOCKED',
                'Percobaan login ditolak karena akun/IP terkunci (brute-force lockout). NIP: ' . $request->input('username')
            );

            return back()
                ->withErrors([
                    'username' => "Akun/IP Anda dikunci sementara karena 3 kali gagal login.",
                ])
                ->with('lockout_seconds', $seconds)
                ->onlyInput('username');
        }

        // 2. Verifikasi CAPTCHA (Atomic pull: langsung dihapus dari session untuk mencegah serangan replay)
        $sessionCaptcha = $request->session()->pull('login_captcha');
        $inputCaptcha = strtoupper(trim((string) $request->input('captcha')));

        if (!$sessionCaptcha || $inputCaptcha !== strtoupper(trim((string) $sessionCaptcha))) {
            return back()
                ->withErrors([
                    'captcha' => 'Kode keamanan (CAPTCHA) salah atau sudah kedaluwarsa.',
                ])
                ->onlyInput('username');
        }

        $loginCredentials = [
            'username' => $request->input('username'),
            'password' => $request->input('password'),
            'aktif' => true,
        ];

        // 3. Coba autentikasi
        if (!Auth::attempt($loginCredentials)) {
            // Catat 1 kegagalan dengan batas waktu penguncian 180 detik (3 menit)
            RateLimiter::hit($throttleKey, 180);

            // Audit log: Percobaan login gagal
            ActivityLogService::log(
                'Autentikasi',
                'LOGIN_FAILED',
                'Gagal login (kredensial salah) untuk NIP: ' . $request->input('username') . ' (Percobaan ke-' . RateLimiter::attempts($throttleKey) . ')'
            );

            // Jika tepat mencapai 3 kali kegagalan, langsung aktifkan penguncian
            if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
                event(new Lockout($request));
                $seconds = RateLimiter::availableIn($throttleKey);

                ActivityLogService::log(
                    'Autentikasi',
                    'LOCKOUT',
                    'Akun/IP dikunci sementara selama 3 menit karena 3 kali berturut-turut gagal login. NIP: ' . $request->input('username')
                );

                return back()
                    ->withErrors([
                        'username' => "Akun/IP Anda dikunci sementara selama 3 menit karena 3 kali gagal login.",
                    ])
                    ->with('lockout_seconds', $seconds)
                    ->onlyInput('username');
            }

            // Pesan error standar untuk percobaan ke-1 dan ke-2
            return back()->withErrors([
                'username' => 'Username atau password salah.',
            ])->onlyInput('username');
        }

        // 4. Login sukses: bersihkan counter kegagalan
        RateLimiter::clear($throttleKey);

        $request->session()->regenerate();

        $user = Auth::user();

        // Audit log: Login berhasil
        ActivityLogService::log(
            'Autentikasi',
            'LOGIN_SUCCESS',
            'Pengguna berhasil login: ' . $user->nama . ' (NIP: ' . $user->username . ')'
        );

        if ($user->must_change_password) {
            return redirect()->route('password.change');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    // Logout sesi pengguna
    public function destroy(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();
            ActivityLogService::log(
                'Autentikasi',
                'LOGOUT',
                'Pengguna keluar (logout) dari sistem: ' . $user->nama . ' (NIP: ' . $user->username . ')'
            );
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return Inertia::location(route('login'));
    }
}
