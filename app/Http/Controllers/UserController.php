<?php

namespace App\Http\Controllers;

use App\Exports\LaporanUserExport;
use App\Models\Bidang;
use App\Models\Regtiket;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Services\PegawaiService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends Controller
{
    public function changePasswordForm()
    {
        return view('pages.auth.change-password');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = User::find(Auth::id());

        // check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'Password sekarang tidak sesuai.'
            ]);
        }

        // new password cannot be same
        if (Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => 'Password baru tidak boleh sama dengan password lama.'
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->must_change_password = false;

        $user->save();

        ActivityLogService::log(
            'Manajemen Data User',
            'CHANGE_PASSWORD',
            'Mengubah password user: ' . $user->username,
            [],
            []
        );

        return redirect()
            ->route('password.change')
            ->with('password_changed', true);
    }

    public function index()
    {
        $user = User::with('role')
            ->orderBy('created_at', 'asc')
            ->get();

        return view('pages.admin.user.index', compact('user'));
    }

    protected $pegawaiService;

    public function __construct(PegawaiService $pegawaiService)
    {
        $this->pegawaiService = $pegawaiService;
    }

    public function getPegawai($nip)
    {
        try {

            $pegawai = $this->pegawaiService
                ->getPegawaiByNip($nip);

            if (!$pegawai) {

                return response()->json([
                    'status' => false,
                    'message' => 'Data pegawai tidak ditemukan'
                ]);
            }

            $tmp_lahir = $pegawai['tmp_lahir'] ?? null;
            $tgl_lahir = !empty($pegawai['tgl_lahir']) ? Carbon::parse($pegawai['tgl_lahir'])->translatedFormat('d-F-Y') : null;
            $ttl = ($tmp_lahir || $tgl_lahir) ? trim("{$tmp_lahir}" . ($tmp_lahir && $tgl_lahir ? ', ' : '') . "{$tgl_lahir}") : '-';

            return response()->json([
                'status' => true,
                'data' => [
                    'nama_lengkap' => $pegawai['nama_lengkap'] ?? '',
                    'ket_ukerja'   => $pegawai['ket_ukerja'] ?? '',
                    'kode_ukerja'  => $pegawai['kode_opd'] ?? '',
                    'email'        => $pegawai['email'] ?? '',
                    'foto_url'     => $pegawai['foto_url'] ?? $this->pegawaiService->getFotoUrl($nip),
                    'tmp_lahir'    => $pegawai['tmp_lahir'] ?? '',
                    'tgl_lahir'    => $tgl_lahir ?? '',
                    'ttl'          => $ttl,
                    'ket_gol'      => $pegawai['ket_gol'] ?? '-',
                    'nama_jab'     => $pegawai['nama_jab'] ?? '-',
                    'ket_agama'    => $pegawai['ket_agama'] ?? '-',
                ]
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan server'
            ], 500);
        }
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
            'bidang_id' => 'required',
        ]);

        // CHECK API
        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($request->username);

        if (!$pegawai) {

            return back()
                ->withErrors([
                    'username' => 'NIP tidak ditemukan'
                ])
                ->withInput();
        }

        // GET API
        $namaLengkap = $pegawai['nama_lengkap']
            ?? $pegawai['nama']
            ?? '-';

        $kodeUkerja = $pegawai['kode_opd']
            ?? '-';

        $bidangId = $request->bidang_id;

        $roleMap = [
            'admin_bawah' => 2,
            'admin_opd' => 3,
        ];

        $role_id = null;
        $finalBidangId = $bidangId;

        if (array_key_exists($bidangId, $roleMap)) {

            $role_id = $roleMap[$bidangId];
        } else {

            $bidang = Bidang::with('role')->find($bidangId);

            if (!$bidang || !$bidang->role) {

                return back()
                    ->withErrors([
                        'bidang_id' => 'Bidang belum memiliki role'
                    ])
                    ->withInput();
            }

            $role_id = $bidang->role_id;
            $finalBidangId = $bidang->id;
        }

        // PASSWORD = 5 digit terakhir NIP
        $passwordDefault = substr($request->username, -5);

        // dd([
        //     'username' => $request->username,
        //     'must_change_password' => true,
        // ]);

        $user = User::create([
            'username' => $request->username,
            'nama' => $namaLengkap,
            'password' => Hash::make($passwordDefault),
            'bidang_id' => $finalBidangId,
            'role_id' => $role_id,
            'aktif' => true,
            'kode_ukerja' => $kodeUkerja,
            'email' => $request->email,
            'must_change_password' => true,
        ]);

        ActivityLogService::log(
            'Manajemen Data User',
            'CREATE',
            'Menambah User Baru',
            [],
            $user->toArray()
        );

        return redirect()
            ->route('root.user')
            ->with(
                'success',
                'User berhasil ditambahkan.'
            );
    }

    public function update(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable',
            'bidang_id' => 'required',
        ]);

        $oldData = [
            'email' => $user->email,
            'bidang_id' => $user->bidang_id,
            'role_id' => $user->role_id,
        ];

        // Check value changed
        if ($request->has('username') && $request->username != $user->username) {

            return back()->withErrors([
                'username' => 'NIP tidak dapat diubah'
            ]);
        }

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

        $user->email = $request->email;
        $user->bidang_id = $request->bidang_id;
        $user->role_id = $role_id;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        $newData = [
            'email' => $user->email,
            'bidang_id' => $user->bidang_id,
            'role_id' => $user->role_id,
        ];

        ActivityLogService::log(
            'Manajemen Data User',
            'UPDATE',
            'Mengubah data user: ' . $user->username,
            $oldData,
            $newData
        );

        return redirect()->route('root.user')
            ->with('success', 'User berhasil diupdate');
    }

    public function edit($id)
    {
        $profile = User::findOrFail($id);
        $bidang = Bidang::all();

        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($profile->username);

        $nama_lengkap = $pegawai['nama_lengkap'] ?? $profile->nama;
        $ket_ukerja = $pegawai['ket_ukerja'] ?? '-';
        $foto_url = $pegawai['foto_url'] ?? $this->pegawaiService->getFotoUrl($profile->username);

        $tmp_lahir = $pegawai['tmp_lahir'] ?? null;
        $tgl_lahir = !empty($pegawai['tgl_lahir']) ? Carbon::parse($pegawai['tgl_lahir'])->translatedFormat('d-F-Y') : null;
        $ttl = ($tmp_lahir || $tgl_lahir) ? trim("{$tmp_lahir}" . ($tmp_lahir && $tgl_lahir ? ', ' : '') . "{$tgl_lahir}") : '-';
        $ket_gol = $pegawai['ket_gol'] ?? '-';
        $nama_jab = $pegawai['nama_jab'] ?? '-';
        $ket_agama = $pegawai['ket_agama'] ?? '-';

        return view(
            'pages.admin.user.edit',
            compact(
                'profile',
                'bidang',
                'ket_ukerja',
                'nama_lengkap',
                'foto_url',
                'ttl',
                'ket_gol',
                'nama_jab',
                'ket_agama'
            )
        );
    }

    //Aktif/Nonaktif User
    public function toggleAktif($id)
    {
        $user = User::findOrFail($id);

        $oldData = ['aktif' => $user->aktif,];

        $user->aktif = !$user->aktif;
        $user->save();

        $newData = ['aktif' => $user->aktif,];

        ActivityLogService::log(
            'Manajemen Data User',
            'UPDATE',
            $user->aktif
                ? 'Mengaktifkan user: ' . $user->username
                : 'Menonaktifkan user: ' . $user->username,
            $oldData,
            $newData
        );

        return redirect()->back()->with('success', 'Status user berhasil diubah');
    }

    //Tampilkan halaman profile
    public function profile()
    {
        $user = Auth::user();
        $bidang = Bidang::all();

        // GET API
        $pegawai = $this->pegawaiService
            ->getPegawaiByNip($user->username);

        $nama_lengkap = $pegawai['nama_lengkap'] ?? $user->nama;
        $ket_ukerja = $pegawai['ket_ukerja'] ?? '-';
        $foto_url = $pegawai['foto_url'] ?? $this->pegawaiService->getFotoUrl($user->username);

        $tmp_lahir = $pegawai['tmp_lahir'] ?? null;
        $tgl_lahir = !empty($pegawai['tgl_lahir']) ? Carbon::parse($pegawai['tgl_lahir'])->translatedFormat('d-F-Y') : null;
        $ttl = ($tmp_lahir || $tgl_lahir) ? trim("{$tmp_lahir}" . ($tmp_lahir && $tgl_lahir ? ', ' : '') . "{$tgl_lahir}") : '-';
        $ket_gol = $pegawai['ket_gol'] ?? '-';
        $nama_jab = $pegawai['nama_jab'] ?? '-';
        $ket_agama = $pegawai['ket_agama'] ?? '-';

        $tiket = Regtiket::with([
            'layanan',
            'tahapTerakhir.statusRel'
        ])
            ->where('nip', $user->username)
            ->orderBy('tanggal', 'desc')
            ->get();

        return view(
            'profile.index',
            compact(
                'user',
                'bidang',
                'nama_lengkap',
                'ket_ukerja',
                'foto_url',
                'ttl',
                'ket_gol',
                'nama_jab',
                'ket_agama',
                'tiket'
            )
        );
    }

    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:5',
        ]);

        $oldData = [
            'email' => $user->email,
        ];

        if ($request->has('username') && $request->username != $user->username) {

            return back()->withErrors([
                'username' => 'NIP tidak dapat diubah'
            ]);
        }

        $user->email = $request->email;

        if ($request->filled('password')) {

            $user->password = Hash::make($request->password);
        }

        $user->save();

        $newData = [
            'email' => $user->email,
        ];

        ActivityLogService::log(
            'Manajemen Data User',
            'UPDATE',
            'Mengubah Data User: ' . $user->username,
            $oldData,
            $newData
        );

        // REFRESH SESSION
        Auth::login($user);

        return redirect()->route('dashboard')
            ->with('success', 'Profil berhasil diperbarui');
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(new LaporanUserExport($request), 'laporan-user.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $data = User::with(['role', 'bidang'])
            ->orderBy('nama')
            ->get();

        $pdf = Pdf::loadView('pages.admin.user.export.export-pdf', compact('data'))
            ->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-data-user.pdf');
    }
}
