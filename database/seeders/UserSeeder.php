<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'username' => 'root@bkd123',
            'nama' => 'Root',
            'password' => '##r00tpilkb123##',
            'bidang_id' => 'Root',
            'jabatan' => 'Root',
            'aktif' => 1,
            'kode_ukerja' => '7501',
            'role_id' => '1'
        ]);
    }
}
