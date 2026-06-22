<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeleteOldNotifications extends Command
{
    protected $signature = 'notifications:cleanup';

    protected $description = 'Hapus notifikasi yang berumur lebih dari 90 hari';

    public function handle()
    {
        $deleted = DB::table('notifications')
            ->where(
                'created_at',
                '<',
                Carbon::now()->subDays(90)
            )
            ->delete();

        $this->info(
            "{$deleted} notifikasi berhasil dihapus."
        );

        return Command::SUCCESS;
    }
}
