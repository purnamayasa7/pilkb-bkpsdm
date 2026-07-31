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
            'aktif' => 1,
            'kode_ukerja' => '75010203',
            'role_id' => '1',
            'must_change_password' => 0
        ]);

        User::create([
            'username' => '199508112025061001',
            'nama' => 'Kadek Purnamayasa, S.Kom',
            'password' => 'Purnamayasa',
            'bidang_id' => 'Admin OPD',
            'aktif' => 1,
            'kode_ukerja' => '75010203',
            'role_id' => '3',
            'must_change_password' => 0
        ]);
    }
}
