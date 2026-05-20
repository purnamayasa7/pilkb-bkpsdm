<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Status::create([
            'id' => '1',
            'kode_layanan' => '00',
            'status' => 'Berkas Sudah Diterima',
        ]);

        Status::create([
            'id' => '9999',
            'kode_layanan' => '00',
            'status' => 'Kelengkapan Berkas Sudah Diterima',
        ]);

        Status::create([
            'id' => '999',
            'kode_layanan' => '000',
            'status' => 'SK/Dokumen Sudah Diambil',
        ]);
    }
}
