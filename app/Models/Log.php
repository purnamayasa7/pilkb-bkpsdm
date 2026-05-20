<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $table = 'tb_log';

    protected $fillable = [
        'admin_id',
        'bidang',
        'module',
        'action',
        'description',
        'ip_address',
        'user_agent',
    ];
}
