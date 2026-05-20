<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailTiket extends Model
{
    protected $table = 'tb_det_tiket';

    protected $fillable = [
        'no_tiket',
        'id_syarat',
        'status',
        'comment',
    ];

    public function syarat()
    {
        return $this->belongsTo(Syarat::class, 'id_syarat', 'id');
    }

    public function regtiket()
    {
        return $this->belongsTo(Regtiket::class, 'no_tiket', 'no_tiket');
    }
}
