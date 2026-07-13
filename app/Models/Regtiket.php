<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Regtiket extends Model
{
    protected $primaryKey = 'no_tiket';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'tb_regtiket';

    protected $fillable = [
        'no_tiket',
        'nip',
        'kode_layanan',
        'tanggal',
        'kode_ukerja',
        'no_hp',
        'email',
        'nama_penerima',
        'archives',
        'operator_archives',
        'data_baru',
        'diambil',
        'diperbaiki',
        'diperbaiki_tgl',
        'dihapus',
        'dihapus_tgl',
    ];

    /**
     * Scope data tiket berdasarkan hak akses user.
     */
    public function scopeVisibleBy($query, User $user)
    {
        switch ($user->role_id) {

            // Root & Admin Bawah
            case 1:
            case 2:
                return $query;

                // Admin OPD
            case 3:
                return $query->where(
                    'kode_ukerja',
                    $user->kode_ukerja
                );

                // Admin Bidang
            case 4:
                return $query->whereHas('layanan', function ($q) use ($user) {

                    $q->where(
                        'kode_bidang',
                        $user->bidang_id
                    );
                });

            default:
                return $query->whereRaw('1 = 0');
        }
    }

    public function layanan()
    {
        return $this->belongsTo(Layanan::class, 'kode_layanan', 'id');
    }

    public function tahap()
    {
        return $this->hasMany(Tahap::class, 'no_tiket', 'no_tiket');
    }

    public function tahapTerakhir()
    {
        return $this->hasOne(Tahap::class, 'no_tiket', 'no_tiket')
            ->latestOfMany('tanggal');
    }

    public function detail()
    {
        return $this->hasMany(DetailTiket::class, 'no_tiket', 'no_tiket');
    }

    public function operatorArchives()
    {
        return $this->belongsTo(User::class, 'operator_archives');
    }

    public function conversation()
    {
        return $this->hasOne(
            ChatConversation::class,
            'no_tiket',
            'no_tiket'
        );
    }
}
