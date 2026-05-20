<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Layanan extends Model
{
    protected $table = 'tb_layanan';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kode_bidang',
        'nama_layanan',
        'rangkap',
        'waktu_penyelesaian',
        'aktif',
        'no_wa',
        'deskripsi',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Generate ID random 10 karakter
            do {
                $id = Str::random(10);
            } while (self::where('id', $id)->exists());

            $model->id = $id;
        });
    }

    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'kode_bidang');
    }

    public function syarat()
    {
        return $this->hasMany(Syarat::class, 'kode_layanan', 'id');
    }

    public function status()
    {
        return $this->hasMany(Status::class, 'kode_layanan', 'id');
    }

    public function regtiket()
    {
        return $this->hasMany(Regtiket::class, 'kode_layanan', 'id');
    }
}
