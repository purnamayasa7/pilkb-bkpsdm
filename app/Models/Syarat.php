<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Syarat extends Model
{
    protected $table = 'tb_syarat';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kode_layanan',
        'syarat',
        'efile',
        'deskripsi',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Generate ID random 5 karakter
            do {
                $id = Str::random(5);
            } while (self::where('id', $id)->exists());

            $model->id = $id;
        });
    }

    public function layanan()
    {
        return $this->belongsTo(Layanan::class, 'kode_layanan', 'id');
    }
}
