<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $user = User::with('role')
            ->orderBy('created_at', 'asc')
            ->get();

        return view('pages.admin.user.index', compact('user'));
    }

    public function create()
    {
        $bidang = Bidang::all();

        return view('pages.admin.user.register', compact('bidang'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'nama' => 'required',
            'password' => 'required',
            'bidang_id' => 'required',
            'jabatan' => 'required',
        ]);

        $bidangId = $request->bidang_id;

        $roleMap = [
            'admin_bawah' => 2,
            'admin_opd' => 3,
        ];

        if (array_key_exists($bidangId, $roleMap)) {

            User::create([
                'username' => $request->username,
                'nama' => $request->nama,
                'password' => Hash::make($request->password),
                'bidang_id' => $bidangId,
                'role_id' => $roleMap[$bidangId],
                'jabatan' => $request->jabatan,
                'aktif' => true,
                'kode_ukerja' => $request->kode_ukerja,
                'email' => $request->email,
            ]);
        } else {

            $bidang = Bidang::with('role')->find($bidangId);

            if (!$bidang || !$bidang->role) {
                return back()->withErrors([
                    'bidang_id' => 'Bidang belum memiliki role'
                ])->withInput();
            }

            User::create([
                'username' => $request->username,
                'nama' => $request->nama,
                'password' => Hash::make($request->password),
                'bidang_id' => $bidang->id,
                'role_id' => $bidang->role_id,
                'jabatan' => $request->jabatan,
                'aktif' => true,
                'kode_ukerja' => $request->kode_ukerja,
                'email' => $request->email,
            ]);
        }

        return redirect()->route('root.user')
            ->with('success', 'User berhasil ditambahkan');
    }

    public function update(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'nama' => 'required',
            'password' => 'nullable',
            'bidang_id' => 'required',
            'jabatan' => 'required',
        ]);

        $roleMap = [
            'admin_bawah' => 2,
            'admin_opd' => 3,
        ];

        if (isset($roleMap[$request->bidang_id])) {
            $role_id = $roleMap[$request->bidang_id];
        } else {
            $bidang = Bidang::find($request->bidang_id);
            $role_id = $bidang->role_id ?? null;
        }

        if (!$role_id) {
            return back()->withErrors([
                'bidang_id' => 'Role tidak ditemukan'
            ])->withInput();
        }

        $user->nama = $request->nama;
        $user->email = $request->email;
        $user->bidang_id = $request->bidang_id;
        $user->role_id = $role_id;
        $user->jabatan = $request->jabatan;
        $user->kode_ukerja = $request->kode_ukerja;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->route('root.user')
            ->with('success', 'User berhasil diupdate');
    }

    public function edit($id)
    {
        $profile = User::findOrFail($id);
        $bidang = Bidang::all();

        return view('pages.admin.user.edit', compact('profile', 'bidang'));
    }

    //Aktif/Nonaktif User
    public function toggleAktif($id)
    {
        $user = User::findOrFail($id);

        $user->aktif = !$user->aktif;
        $user->save();

        return redirect()->back()->with('success', 'Status user berhasil diubah');
    }

    //Tampilkan halaman profile
    public function profile()
    {
        $user = Auth::user();
        $bidang = Bidang::all();

        return view('profile.index', compact('user', 'bidang'));
    }

    //Update profile
    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'nama' => 'required',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'jabatan' => 'required',
            'kode_ukerja' => 'required',
            'password' => 'nullable|min:6',
        ]);

        $user->nama = $request->nama;
        $user->jabatan = $request->jabatan;
        $user->kode_ukerja = $request->kode_ukerja;
        $user->email = $request->email;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect('/dashboard')->with('success', 'Profil berhasil diperbarui');
    }
}
