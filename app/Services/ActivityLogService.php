<?php

namespace App\Services;

use App\Models\Log;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    public static function log(
        string $module,
        string $action,
        string $description,
        array $oldData = [],
        array $newData = []
    ) {
        $isConsole = app()->runningInConsole();

        Log::create([
            'user_id' => Auth::id() ?? 1,
            'kode_ukerja' => Auth::user()?->kode_ukerja ?? '75010203',

            'module' => $module,
            'action' => $action,
            'description' => $description,

            'url' => $isConsole ? 'CLI/Scheduler' : request()->fullUrl(),
            'method' => $isConsole ? 'COMMAND' : request()->method(),

            'ip_address' => $isConsole ? '127.0.0.1' : request()->ip(),
            'user_agent' => $isConsole ? 'System Scheduler' : request()->userAgent(),

            'old_data' => $oldData,
            'new_data' => $newData,
        ]);
    }
}
