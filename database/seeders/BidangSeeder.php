<?php

namespace Database\Seeders;

use App\Models\Bidang;
use Illuminate\Database\Seeder;

class BidangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Bidang::create([
            'id' => 'ASwVnVYkyD',
            'nama_bidang' => 'Bidang Pengembangan Kompetensi Aparatur',
            'role_id' => 4,
        ]);

        Bidang::create([
            'id' => 'Bfz7DwpULw',
            'nama_bidang' => 'Bidang Mutasi dan Penghargaan',
            'role_id' => 4,
        ]);

        Bidang::create([
            'id' => 'Eo2Cgh3csg',
            'nama_bidang' => 'Bidang Penilaian Kinerja Aparatur dan Promosi',
            'role_id' => 4,
        ]);

        Bidang::create([
            'id' => 'tGH3dXB2a0',
            'nama_bidang' => 'Bidang Pengadaan, Pemberhentian, dan Informasi',
            'role_id' => 4,
        ]);
    }
}
