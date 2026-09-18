<?php

namespace App\Http\Controllers;

use App\Models\Bidang;
use App\Models\Pengumuman;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PengumumanController extends Controller
{
    /**
     * Memastikan hanya role Root (1), Bidang (4), dan Pimpinan (5) yang dapat mengelola pengumuman.
     */
    protected function checkAccess()
    {
        $user = Auth::user();
        if (!$user || !in_array((int) $user->role_id, [1, 4, 5])) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengelola pengumuman.');
        }
        return $user;
    }

    /**
     * Menampilkan daftar pengumuman (Index)
     */
    public function index(Request $request)
    {
        $currentUser = $this->checkAccess();

        $search  = trim((string) $request->input('search', ''));
        $status  = $request->input('status', 'semua');
        $perPage = (int) $request->input('per_page', 10);
        if (!in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $now = now();

        // Otomatis nonaktifkan pengumuman yang periode tayangnya telah berakhir
        Pengumuman::autoNonaktifkanExpired();

        $bidangFilter = $request->input('bidang_id', 'semua');

        $query = Pengumuman::with(['author:id,nama,username', 'bidang:id,nama_bidang'])
            ->orderByDesc('created_at');

        $baseMetrics = Pengumuman::query();

        // =========================================================================
        // SCOPE HAK AKSES DATA BERDASARKAN ROLE:
        // - Admin Bidang (role 4): HANYA melihat informasi dari bidangnya sendiri
        // - Root (role 1) & Pimpinan (role 5): Melihat SEMUA informasi dari seluruh bidang
        // =========================================================================
        if ((int) $currentUser->role_id === 4) {
            $userBidangId = $currentUser->bidang_id;
            $query->where(function ($q) use ($userBidangId, $currentUser) {
                if ($userBidangId) {
                    $q->where('bidang_id', $userBidangId)
                      ->orWhere('user_id', $currentUser->id);
                } else {
                    $q->where('user_id', $currentUser->id);
                }
            });

            $baseMetrics->where(function ($q) use ($userBidangId, $currentUser) {
                if ($userBidangId) {
                    $q->where('bidang_id', $userBidangId)
                      ->orWhere('user_id', $currentUser->id);
                } else {
                    $q->where('user_id', $currentUser->id);
                }
            });
        } elseif (in_array((int) $currentUser->role_id, [1, 5])) {
            // Root dan Pimpinan: Default melihat SEMUA bidang, atau filter spesifik jika dipilih
            if (!empty($bidangFilter) && $bidangFilter !== 'semua') {
                $query->where('bidang_id', $bidangFilter);
                $baseMetrics->where('bidang_id', $bidangFilter);
            }
        }

        // Filter Pencarian
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('pesan', 'like', "%{$search}%");
            });
        }

        // Filter Status
        if ($status === 'aktif') {
            $query->where('aktif', true)
                  ->where('mulai_pada', '<=', $now)
                  ->where('selesai_pada', '>=', $now);
        } elseif ($status === 'mendatang') {
            $query->where('aktif', true)
                  ->where('mulai_pada', '>', $now);
        } elseif ($status === 'berakhir') {
            $query->where(function ($q) use ($now) {
                $q->where('aktif', false)
                  ->orWhere('selesai_pada', '<', $now);
            });
        }

        $pengumumans = $query->paginate($perPage)->withQueryString();

        // Hitung Ringkasan Statistik (Metric Cards sesuai scope role)
        $totalSemua  = (clone $baseMetrics)->count();
        $totalAktif  = (clone $baseMetrics)->where('aktif', true)
            ->where('mulai_pada', '<=', $now)
            ->where('selesai_pada', '>=', $now)
            ->count();
        $totalMendatang = (clone $baseMetrics)->where('aktif', true)
            ->where('mulai_pada', '>', $now)
            ->count();
        $totalBerakhir = (clone $baseMetrics)->where(function ($q) use ($now) {
            $q->where('aktif', false)
              ->orWhere('selesai_pada', '<', $now);
        })->count();

        $metrics = [
            'total'     => $totalSemua,
            'aktif'     => $totalAktif,
            'mendatang' => $totalMendatang,
            'berakhir'  => $totalBerakhir,
        ];

        $daftarBidang = Bidang::where('aktif', 1)->select('id', 'nama_bidang')->get();
        $userBidangNama = null;
        if ($currentUser->bidang_id) {
            $userBidangNama = optional(Bidang::find($currentUser->bidang_id))->nama_bidang;
        }

        return Inertia::render('Pengumuman/Index', [
            'pengumumans' => $pengumumans,
            'metrics'     => $metrics,
            'filters'     => [
                'search'    => $search,
                'status'    => $status,
                'per_page'  => $perPage,
                'bidang_id' => $bidangFilter,
            ],
            'bidangs'        => $daftarBidang,
            'canManage'      => in_array((int) $currentUser->role_id, [1, 4, 5]),
            'currentRoleId'  => (int) $currentUser->role_id,
            'currentUserId'  => (int) $currentUser->id,
            'userBidangId'   => $currentUser->bidang_id,
            'userBidangNama' => $userBidangNama,
        ]);
    }

    /**
     * Menyimpan data pengumuman baru
     */
    public function store(Request $request)
    {
        $currentUser = $this->checkAccess();

        $validated = $request->validate([
            'judul'        => 'required|string|max:100',
            'pesan'        => 'required|string|max:255',
            'tipe'         => 'required|in:info,warning,danger,success',
            'mulai_pada'   => 'required|date',
            'selesai_pada' => 'required|date|after_or_equal:mulai_pada',
            'tautan'       => 'nullable|url|max:255',
            'bidang_id'    => 'nullable|string|exists:tb_bidang,id',
        ], [
            'judul.required'        => 'Judul pengumuman wajib diisi.',
            'judul.max'             => 'Judul pengumuman maksimal 100 karakter.',
            'pesan.required'        => 'Pesan pengumuman wajib diisi.',
            'pesan.max'             => 'Pesan pengumuman maksimal 255 karakter.',
            'selesai_pada.after_or_equal' => 'Waktu selesai harus sama atau setelah waktu mulai.',
            'tautan.url'            => 'Format tautan tidak valid (harus diawali http:// atau https://).',
        ]);

        // Tentukan bidang_id
        $bidangId = $currentUser->bidang_id;
        // Jika Root / Pimpinan memilih bidang tertentu secara manual
        if (in_array((int) $currentUser->role_id, [1, 5]) && !empty($validated['bidang_id'])) {
            $bidangId = $validated['bidang_id'];
        }

        Pengumuman::create([
            'user_id'      => $currentUser->id,
            'bidang_id'    => $bidangId,
            'judul'        => trim($validated['judul']),
            'pesan'        => trim($validated['pesan']),
            'tipe'         => $validated['tipe'],
            'mulai_pada'   => Carbon::parse($validated['mulai_pada']),
            'selesai_pada' => Carbon::parse($validated['selesai_pada']),
            'aktif'        => true,
            'tautan'       => !empty($validated['tautan']) ? trim($validated['tautan']) : null,
        ]);

        return redirect()->back()->with('success', 'Pengumuman baru berhasil diterbitkan.');
    }

    /**
     * Memperbarui pengumuman yang sudah ada
     */
    public function update(Request $request, $id)
    {
        $currentUser = $this->checkAccess();
        $pengumuman = Pengumuman::findOrFail($id);

        // Otorisasi: Admin bidang hanya bisa kelola pengumuman bidangnya sendiri / miliknya
        if ((int) $currentUser->role_id === 4) {
            $isSameBidang = $currentUser->bidang_id && ($pengumuman->bidang_id === $currentUser->bidang_id);
            $isOwner = (int) $pengumuman->user_id === (int) $currentUser->id;
            if (!$isSameBidang && !$isOwner) {
                abort(403, 'Anda hanya dapat mengubah pengumuman dari bidang Anda sendiri.');
            }
        }

        $validated = $request->validate([
            'judul'        => 'required|string|max:100',
            'pesan'        => 'required|string|max:255',
            'tipe'         => 'required|in:info,warning,danger,success',
            'mulai_pada'   => 'required|date',
            'selesai_pada' => 'required|date|after_or_equal:mulai_pada',
            'tautan'       => 'nullable|url|max:255',
            'bidang_id'    => 'nullable|string|exists:tb_bidang,id',
            'aktif'        => 'boolean',
        ], [
            'judul.required'        => 'Judul pengumuman wajib diisi.',
            'judul.max'             => 'Judul pengumuman maksimal 100 karakter.',
            'pesan.required'        => 'Pesan pengumuman wajib diisi.',
            'pesan.max'             => 'Pesan pengumuman maksimal 255 karakter.',
            'selesai_pada.after_or_equal' => 'Waktu selesai harus sama atau setelah waktu mulai.',
            'tautan.url'            => 'Format tautan tidak valid (harus diawali http:// atau https://).',
        ]);

        $updateData = [
            'judul'        => trim($validated['judul']),
            'pesan'        => trim($validated['pesan']),
            'tipe'         => $validated['tipe'],
            'mulai_pada'   => Carbon::parse($validated['mulai_pada']),
            'selesai_pada' => Carbon::parse($validated['selesai_pada']),
            'tautan'       => !empty($validated['tautan']) ? trim($validated['tautan']) : null,
        ];

        if (isset($validated['aktif'])) {
            $updateData['aktif'] = (bool) $validated['aktif'];
        }

        if (in_array((int) $currentUser->role_id, [1, 5]) && array_key_exists('bidang_id', $validated)) {
            $updateData['bidang_id'] = $validated['bidang_id'];
        }

        $pengumuman->update($updateData);

        return redirect()->back()->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Mengubah status aktif / nonaktif pengumuman (toggle)
     */
    public function toggleAktif($id)
    {
        $currentUser = $this->checkAccess();
        $pengumuman = Pengumuman::findOrFail($id);

        if ((int) $currentUser->role_id === 4) {
            $isSameBidang = $currentUser->bidang_id && ($pengumuman->bidang_id === $currentUser->bidang_id);
            $isOwner = (int) $pengumuman->user_id === (int) $currentUser->id;
            if (!$isSameBidang && !$isOwner) {
                abort(403, 'Anda hanya dapat mengubah status pengumuman dari bidang Anda sendiri.');
            }
        }

        $pengumuman->aktif = !$pengumuman->aktif;
        $pengumuman->save();

        $statusTeks = $pengumuman->aktif ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Pengumuman berhasil {$statusTeks}.");
    }

    /**
     * Menghapus pengumuman
     */
    public function destroy($id)
    {
        $currentUser = $this->checkAccess();
        $pengumuman = Pengumuman::findOrFail($id);

        if ((int) $currentUser->role_id === 4) {
            $isSameBidang = $currentUser->bidang_id && ($pengumuman->bidang_id === $currentUser->bidang_id);
            $isOwner = (int) $pengumuman->user_id === (int) $currentUser->id;
            if (!$isSameBidang && !$isOwner) {
                abort(403, 'Anda hanya dapat menghapus pengumuman dari bidang Anda sendiri.');
            }
        }

        $pengumuman->delete();

        return redirect()->back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
