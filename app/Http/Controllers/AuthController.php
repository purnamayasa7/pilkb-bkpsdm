<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login()
    {
        if (Auth::check()) {
            return redirect('/dashboard');
        }

        return view('pages.auth.login');
    }

    public function authenticate(Request $request)
    {
        if (Auth::check()) {
            return back();
        }

        $credentials = $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $credential['aktif'] = true;

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'username' => 'Terjadi kesalahan, periksa kembali username atau password anda.',
        ])->onlyInput('username');
    }

    public function registerView()
    {
        // return view('pages.auth.register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required',
            'nama' => 'required',
            'password' => 'required',
            'bidang_id' => 'required',
            'role_id' => 'required',
            'jabatan' => 'required',
        ]);

        $user = new User();
        $user->username = $request->username;
        $user->nama = $request->nama;
        $user->password = Hash::make($request->password);
        $user->bidang_id = $request->bidang_id;
        $user->jabatan = $request->jabatan;
        $user->role_id = $request->role_id;
        $user->aktif = true;
        $user->kode_ukerja = $request->kode_ukerja;
        $user->no_wa = $request->no_wa;
        $user->email = $request->email;
        $user->save();


        return redirect()->route('root.user')
            ->with('success', 'Berhasil mendaftarkan akun');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
