<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $table = 'tb_status';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'kode_layanan',
        'status',
    ];

    public function layanan()
    {
        return $this->belongsTo(Layanan::class, 'kode_layanan', 'id');
    }
}
