<?php

namespace App\Console\Commands;

use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CheckMissedBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:check-missed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Periksa apakah jadwal backup jam 01:00 WITA terlewat karena server mati, catat log error, dan jalankan backup susulan';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $todayStr = $now->toDateString();

        // Jadwal backup adalah jam 01:00 WITA. Berikan toleransi 30 menit.
        // Jika jam sekarang belum melewati 01:30 WITA, jangan anggap terlewat.
        if ($now->hour < 1 || ($now->hour === 1 && $now->minute < 30)) {
            $this->info('Belum melewati batas toleransi jadwal backup (01:30 WITA).');
            return Command::SUCCESS;
        }

        $disk = Storage::disk('backup');
        $allFiles = $disk->allFiles();

        $startOfDayTimestamp = Carbon::today()->startOfDay()->timestamp;

        // Cari apakah ada file zip backup yang dibuat hari ini
        $hasBackupToday = collect($allFiles)
            ->filter(fn($file) => str_ends_with(strtolower($file), '.zip'))
            ->contains(fn($file) => $disk->lastModified($file) >= $startOfDayTimestamp);

        if ($hasBackupToday) {
            $this->info('Backup untuk hari ini (' . $todayStr . ') sudah ada.');
            return Command::SUCCESS;
        }

        // Jika sampai lewat jam 01:30 belum ada backup hari ini, berarti server mati/offline saat jam 01:00
        $cacheKey = 'missed_backup_logged_' . $todayStr;

        if (!Cache::has($cacheKey)) {
            $msg = "Peringatan: Jadwal backup otomatis harian pukul 01:00 WITA tidak berjalan pada tanggal {$now->isoFormat('D MMMM Y')} (Kemungkinan server mati atau scheduler tidak aktif saat jadwal tiba). Sistem akan menjalankan backup susulan.";

            $this->warn($msg);
            Log::warning($msg);

            // Catat record error ke dalam Log aktivitas database
            ActivityLogService::log(
                'Backup Database',
                'ERROR',
                $msg,
                [],
                ['missed_schedule' => '01:00:00 WITA', 'detected_at' => $now->toDateTimeString()]
            );

            Cache::put($cacheKey, true, $now->copy()->endOfDay());

            // Jalankan backup susulan otomatis
            $this->info('Menjalankan backup susulan otomatis...');
            $exitCode = $this->call('backup:schedule-run');

            if ($exitCode === Command::SUCCESS) {
                ActivityLogService::log(
                    'Backup Database',
                    'CREATE',
                    "Pencadangan susulan berhasil dilakukan pada {$now->isoFormat('D MMMM Y, HH:mm:ss')} WITA setelah server menyala kembali."
                );
                $this->info('Backup susulan berhasil selesai.');
            } else {
                $this->error('Backup susulan gagal dilakukan.');
            }
        } else {
            $this->info('Log jadwal terlewat hari ini sudah tercatat sebelumnya.');
        }

        return Command::SUCCESS;
    }
}
