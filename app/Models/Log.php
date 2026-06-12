<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $table = 'tb_log';

    protected $fillable = [
        'user_id',
        'kode_ukerja',
        'module',
        'action',
        'description',
        'url',
        'method',
        'ip_address',
        'user_agent',
        'old_data',
        'new_data',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
