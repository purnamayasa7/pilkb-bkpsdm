<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create([
            'id' => '1',
            'name' => 'root',
        ]);

        Role::create([
            'id' => '2',
            'name' => 'admin_bawah',
        ]);

        Role::create([
            'id' => '3',
            'name' => 'admin_opd',
        ]);

        Role::create([
            'id' => '4',
            'name' => 'bidang',
        ]);
    }
}
