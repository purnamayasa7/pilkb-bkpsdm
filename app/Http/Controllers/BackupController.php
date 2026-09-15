<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    // Tampilkan manajemen backup database
    public function index()
    {
        $disk = Storage::disk('backup');
        $allFiles = $disk->allFiles();

        $backups = collect($allFiles)
            ->filter(fn($file) => str_ends_with(strtolower($file), '.zip'))
            ->map(function ($filePath) use ($disk) {
                $lastModifiedTimestamp = $disk->lastModified($filePath);
                $sizeInBytes = $disk->size($filePath);
                $filename = basename($filePath);

                // Prioritaskan waktu asli dari nama file Spatie (format: Y-m-d-H-i-s)
                $createdAt = null;
                $filenameWithoutExt = preg_replace('/\.zip$/i', '', $filename);
                try {
                    $createdAt = Carbon::createFromFormat('Y-m-d-H-i-s', $filenameWithoutExt, config('app.timezone', 'Asia/Makassar'));
                } catch (\Throwable $e) {
                    $createdAt = Carbon::createFromTimestamp($lastModifiedTimestamp)->timezone(config('app.timezone', 'Asia/Makassar'));
                }

                return [
                    'path' => $filePath,
                    'filename' => $filename,
                    'size' => $this->formatBytes($sizeInBytes),
                    'size_bytes' => $sizeInBytes,
                    'created_at' => $createdAt,
                    'timestamp' => $createdAt->timestamp,
                ];
            })
            ->sortByDesc('timestamp')
            ->values();

        $now = Carbon::now(config('app.timezone', 'Asia/Makassar'));
        $startOfDay = Carbon::today(config('app.timezone', 'Asia/Makassar'))->startOfDay();
        $hasBackupToday = $backups->contains(fn($b) => $b['created_at']->greaterThanOrEqualTo($startOfDay));
        $isMissedToday = !$hasBackupToday && ($now->hour >= 1 && ($now->hour > 1 || $now->minute >= 30));

        $totalSizeBytes = $backups->sum('size_bytes');
        $latest = $backups->first();

        $stats = [
            'total_backups' => $backups->count(),
            'total_size' => $this->formatBytes($totalSizeBytes),
            'latest_backup' => $latest ? [
                'formatted' => $latest['created_at']->isoFormat('D MMMM Y, HH:mm') . ' WITA',
                'time_ago' => $latest['created_at']->diffForHumans(),
                'filename' => $latest['filename'],
            ] : null,
            'has_backup_today' => $hasBackupToday,
            'is_missed_today' => $isMissedToday,
        ];

        // Format data untuk serialisasi JSON Inertia yang bersih dan terstandarisasi
        $serializedBackups = $backups->map(function ($b) {
            return [
                'filename' => $b['filename'],
                'path' => $b['path'],
                'size' => $b['size'],
                'size_bytes' => $b['size_bytes'],
                'created_at' => $b['created_at']->isoFormat('D MMMM Y, HH:mm:ss') . ' WITA',
                'time_ago' => $b['created_at']->diffForHumans(),
                'timestamp' => $b['timestamp'],
            ];
        })->values();

        return inertia('Root/Backup/Index', [
            'backups' => $serializedBackups,
            'stats' => $stats,
        ]);
    }

    // Buat backup database
    public function createBackup()
    {
        // Berikan waktu eksekusi yang cukup untuk dump database
        @set_time_limit(300);
        @ini_set('max_execution_time', '300');

        $this->fixWindowsEnvironment();

        try {
            $exitCode = Artisan::call('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => true,
            ]);

            $output = Artisan::output();

            if ($exitCode !== 0) {
                Log::error('Backup Database Gagal', [
                    'exit_code' => $exitCode,
                    'output' => $output,
                ]);

                // Bersihkan output untuk pesan flash yang lebih informatif jika ada pesan kesalahan spesifik
                $errorMessage = 'Proses backup gagal dijalankan.';
                if (preg_match('/mysqldump:\s*(.+)/i', $output, $matches)) {
                    $errorMessage .= ' (' . trim($matches[1]) . ')';
                }

                return redirect()->route('root.backup.index')->with(
                    'error',
                    $errorMessage
                );
            }

            ActivityLogService::log(
                'Backup Database',
                'CREATE',
                'Membuat backup database baru berhasil'
            );

            return redirect()->route('root.backup.index')->with(
                'success',
                'Backup database berhasil dibuat!'
            );
        } catch (\Throwable $e) {
            Log::error('Backup Database Exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->route('root.backup.index')->with(
                'error',
                'Terjadi kesalahan saat membuat backup: ' . $e->getMessage()
            );
        }
    }

    // Download file backup
    public function download(string $filename)
    {
        // Cegah path traversal
        $safeFilename = basename($filename);
        $disk = Storage::disk('backup');

        $filePath = $this->findBackupFilePath($disk, $safeFilename);

        if (!$filePath || !$disk->exists($filePath)) {
            return redirect()->route('root.backup.index')->with(
                'error',
                'File backup tidak ditemukan atau sudah dihapus.'
            );
        }

        ActivityLogService::log(
            'Backup Database',
            'READ',
            'Mengunduh file backup database: ' . $safeFilename
        );

        return response()->download($disk->path($filePath), $safeFilename);
    }

    // Hapus file backup
    public function destroy(string $filename)
    {
        // Cegah path traversal
        $safeFilename = basename($filename);
        $disk = Storage::disk('backup');

        $filePath = $this->findBackupFilePath($disk, $safeFilename);

        if (!$filePath || !$disk->exists($filePath)) {
            return redirect()->route('root.backup.index')->with(
                'error',
                'File backup tidak ditemukan.'
            );
        }

        $disk->delete($filePath);

        ActivityLogService::log(
            'Backup Database',
            'DELETE',
            'Menghapus file backup database: ' . $safeFilename
        );

        return redirect()->route('root.backup.index')->with(
            'success',
            'File backup ' . $safeFilename . ' berhasil dihapus.'
        );
    }

    // Fallback route lama
    public function runBackup()
    {
        @set_time_limit(300);
        @ini_set('max_execution_time', '300');

        $this->fixWindowsEnvironment();

        try {
            $exitCode = Artisan::call('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => true,
            ]);

            if ($exitCode !== 0) {
                return redirect()->route('root.backup.index')->with(
                    'error',
                    'Backup database gagal dibuat.'
                );
            }

            $disk = Storage::disk('backup');
            $files = collect($disk->allFiles())
                ->filter(fn($file) => str_ends_with(strtolower($file), '.zip'));

            if ($files->isEmpty()) {
                return redirect()->route('root.backup.index')->with(
                    'error',
                    'File backup tidak ditemukan.'
                );
            }

            $latestFile = $files->sortByDesc(
                fn($file) => $disk->lastModified($file)
            )->first();

            ActivityLogService::log(
                'Backup Database',
                'CREATE',
                'Menjalankan backup dan mengunduh file terbaru'
            );

            return response()->download($disk->path($latestFile), basename($latestFile));
        } catch (\Throwable $e) {
            return redirect()->route('root.backup.index')->with(
                'error',
                'Terjadi kesalahan saat memproses backup: ' . $e->getMessage()
            );
        }
    }

    // Cari relative path file backup
    protected function findBackupFilePath($disk, string $safeFilename): ?string
    {
        $allFiles = $disk->allFiles();
        foreach ($allFiles as $file) {
            if (basename($file) === $safeFilename) {
                return $file;
            }
        }

        return null;
    }

    // Format byte
    protected function formatBytes($bytes, $precision = 2): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    // Penyesuaian environment Windows untuk mysqldump
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
