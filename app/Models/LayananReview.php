<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LayananReview extends Model
{
    protected $table = 'tb_layanan_review';

    protected $fillable = [
        'no_tiket',
        'kode_layanan',
        'user_id',
        'rating',
        'aspek_penilaian',
        'komentar',
    ];

    protected $casts = [
        'aspek_penilaian' => 'array',
        'rating'          => 'integer',
    ];

    public function tiket()
    {
        return $this->belongsTo(Regtiket::class, 'no_tiket', 'no_tiket');
    }

    public function layanan()
    {
        return $this->belongsTo(Layanan::class, 'kode_layanan', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
