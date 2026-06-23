<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    public function runBackup()
    {
        Artisan::call('backup:run', [
            '--only-db' => true,
        ]);

        $disk = Storage::disk('backup');

        $files = collect($disk->allFiles());

        if ($files->isEmpty()) {
            return back()->with(
                'error',
                'Backup gagal dibuat.'
            );
        }

        $latestFile = $files->sortByDesc(
            fn($file) => $disk->lastModified($file)
        )->first();

        return response()->download(
            $disk->path($latestFile)
        );
    }
}
