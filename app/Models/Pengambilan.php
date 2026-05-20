<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengambilan extends Model
{
    protected $table = 'tb_pengambilan';

    protected $fillable = [
        'no_tiket',
        'tanggal_pengambilan',
        'nama_pengambil',
        'no_hp',
    ];

    public function tiket()
    {
        return $this->belongsTo(Regtiket::class, 'no_tiket', 'no_tiket');
    }
}
