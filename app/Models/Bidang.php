<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Bidang extends Model
{
    protected $table = 'tb_bidang';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nama_bidang',
        'aktif',
        'role_id',
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

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function layanan()
    {
        return $this->hasMany(Layanan::class, 'kode_bidang', 'id');
    }
}
