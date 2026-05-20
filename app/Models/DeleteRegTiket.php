<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeleteRegTiket extends Model
{
    protected $table = 'tb_deleted_reg_tiket';

    protected $fillable = [
        'no_tiket',
        'nip',
        'kode_layanan',
        'tanggal',
        'no_hp',
        'nama_penerima',
        'archives',
        'operator_archives',
        'data_baru',
        'diambil',
        'diperbaiki',
        'diperbaiki_tgl',
        'dihapus',
        'dihapus_tgl',
    ];
}
