<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tahap extends Model
{
    protected $table = 'tb_tahap';

    protected $fillable = [
        'no_tiket',
        'tanggal',
        'status',
        'operator',
        'comment',
    ];

    public function statusRel()
    {
        return $this->belongsTo(Status::class, 'status', 'id');
    }

    public function regtiket()
    {
        return $this->belongsTo(Regtiket::class, 'no_tiket', 'no_tiket');
    }
}
