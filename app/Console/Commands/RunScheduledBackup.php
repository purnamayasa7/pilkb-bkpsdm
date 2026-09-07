<?php

namespace App\Console\Commands;

use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RunScheduledBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:schedule-run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Jalankan backup database otomatis harian pada jam 01:00 WITA dengan pencatatan log aktivitas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai proses backup database terjadwal...');

        // Set batas waktu eksekusi yang leluasa untuk dumping database
        @set_time_limit(600);
        @ini_set('max_execution_time', '600');

        $this->fixWindowsEnvironment();

        try {
            $exitCode = Artisan::call('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => true,
            ]);

            $output = Artisan::output();

            if ($exitCode !== 0) {
                $errorMsg = 'Backup otomatis gagal dijalankan (Exit code: ' . $exitCode . ')';
                if (preg_match('/mysqldump:\s*(.+)/i', $output, $matches)) {
                    $errorMsg .= ': ' . trim($matches[1]);
                }

                $this->error($errorMsg);
                Log::error('Backup Otomatis Gagal', ['output' => $output]);

                ActivityLogService::log(
                    'Backup Database',
                    'ERROR',
                    $errorMsg,
                    [],
                    ['output' => $output]
                );

                return Command::FAILURE;
            }

            // Catat log sukses
            ActivityLogService::log(
                'Backup Database',
                'CREATE',
                'Backup otomatis harian berhasil dijalankan pada ' . Carbon::now()->isoFormat('D MMMM Y, HH:mm:ss') . ' WITA'
            );

            // Simpan tanggal backup terakhir ke cache
            Cache::forever('last_successful_backup_at', Carbon::now()->toDateTimeString());

            $this->info('Backup otomatis database berhasil dibuat.');

            // Jalankan cleanup berkas lama secara otomatis
            try {
                Artisan::call('backup:clean', [
                    '--disable-notifications' => true,
                ]);
                $this->info('Pembersihan berkas backup lama selesai.');
            } catch (\Throwable $cleanEx) {
                Log::warning('Backup cleanup warning: ' . $cleanEx->getMessage());
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $msg = 'Terjadi kesalahan sistem saat backup otomatis: ' . $e->getMessage();
            $this->error($msg);
            Log::error($msg, ['trace' => $e->getTraceAsString()]);

            ActivityLogService::log(
                'Backup Database',
                'ERROR',
                $msg
            );

            return Command::FAILURE;
        }
    }

    /**
     * Penyesuaian environment Windows jika command dijalankan di Windows.
     */
    protected function fixWindowsEnvironment(): void
    {
        if (PHP_OS_FAMILY === 'Windows') {
            $systemRoot = getenv('SystemRoot') ?: getenv('windir') ?: 'C:\Windows';
            $systemDrive = getenv('SystemDrive') ?: substr($systemRoot, 0, 2);

            putenv("SystemRoot={$systemRoot}");
            putenv("windir={$systemRoot}");
            putenv("SystemDrive={$systemDrive}");

            $_ENV['SystemRoot'] = $systemRoot;
            $_ENV['windir'] = $systemRoot;
            $_ENV['SystemDrive'] = $systemDrive;

            $_SERVER['SystemRoot'] = $systemRoot;
            $_SERVER['windir'] = $systemRoot;
            $_SERVER['SystemDrive'] = $systemDrive;

            $currentPath = getenv('PATH') ?: ($_SERVER['PATH'] ?? '');
            $requiredPaths = [
                "{$systemRoot}\\system32",
                $systemRoot,
                "{$systemRoot}\\system32\\Wbem",
                'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin',
            ];

            foreach ($requiredPaths as $reqPath) {
                if (file_exists($reqPath) && !str_contains($currentPath, $reqPath)) {
                    $currentPath = $reqPath . ';' . $currentPath;
                }
            }

            putenv("PATH={$currentPath}");
            $_ENV['PATH'] = $currentPath;
            $_SERVER['PATH'] = $currentPath;
        }
    }
}
