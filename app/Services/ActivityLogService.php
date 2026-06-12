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
        Log::create([
            'user_id' => Auth::id(),
            'kode_ukerja' => Auth::user()->kode_ukerja,

            'module' => $module,
            'action' => $action,
            'description' => $description,

            'url' => request()->fullUrl(),
            'method' => request()->method(),

            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),

            'old_data' => $oldData,
            'new_data' => $newData,
        ]);
    }
}
