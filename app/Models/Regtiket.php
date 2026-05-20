<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
