<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogViewerAccessTest extends TestCase
{
    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/log-viewer');
        $response->assertRedirect('/login');
    }

    public function test_non_root_user_is_forbidden(): void
    {
        $user = new User([
            'id' => 999,
            'role_id' => 2, // Admin Bawah
            'username' => 'testuser',
            'nama' => 'Test User',
        ]);

        $response = $this->actingAs($user)->get('/log-viewer');
        $response->assertForbidden();
    }

    public function test_root_user_can_access_log_viewer(): void
    {
        $rootUser = new User([
            'id' => 1,
            'role_id' => 1, // Root
            'username' => 'rootuser',
            'nama' => 'Root User',
        ]);

        $response = $this->actingAs($rootUser)->get('/log-viewer');
        $response->assertOk();
    }
}
