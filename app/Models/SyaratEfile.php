<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyaratEfile extends Model
{
    protected $table = 'tb_syarat_efile';

    protected $fillable = [
        'syarat',
        'efile',
    ];
}
