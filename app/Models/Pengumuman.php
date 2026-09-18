<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    use HasFactory;

    protected $table = 'tb_pengumuman';

    protected $fillable = [
        'user_id',
        'bidang_id',
        'judul',
        'pesan',
        'tipe',
        'mulai_pada',
        'selesai_pada',
        'aktif',
        'tautan',
        'label_tautan',
    ];

    protected $casts = [
        'mulai_pada'   => 'datetime',
        'selesai_pada' => 'datetime',
        'aktif'        => 'boolean',
    ];

    /**
     * Relasi ke User pembuat pengumuman
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relasi ke Bidang (jika dibuat oleh admin bidang)
     */
    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'bidang_id', 'id');
    }

    /**
     * Scope untuk mengambil pengumuman yang sedang aktif tayang saat ini.
     * Diurutkan dari yang paling terbaru (created_at DESC).
     */
    public function scopeSedangTayang($query)
    {
        $now = now();

        return $query->where('aktif', true)
                     ->where('mulai_pada', '<=', $now)
                     ->where('selesai_pada', '>=', $now)
                     ->orderByDesc('created_at');
    }

    /**
     * Otomatis nonaktifkan pengumuman yang periode tayangnya telah terlewati (selesai_pada < now())
     */
    public static function autoNonaktifkanExpired()
    {
        return self::where('aktif', true)
            ->where('selesai_pada', '<', now())
            ->update(['aktif' => false]);
    }
}
