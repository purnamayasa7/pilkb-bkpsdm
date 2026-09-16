<?php

namespace App\Console\Commands;

use App\Services\ActivityLogService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncTiketArchivesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tiket:sync-archives
                            {--dry-run : Jalankan simulasi tanpa mengubah data di database}
                            {--batch=1000 : Jumlah data yang diproses per batch}
                            {--force : Jalankan langsung tanpa konfirmasi interaktif}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi nilai archives = 1 untuk tiket yang tahap terakhirnya berstatus Selesai';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = (bool) $this->option('dry-run');
        $batchSize = max(100, (int) $this->option('batch'));
        $force = (bool) $this->option('force');

        $this->newLine();
        $this->info('======================================================');
        $this->info('      SINKRONISASI STATUS ARSIP TIKET (SELESAI)       ');
        $this->info('======================================================');
        $this->newLine();

        if ($isDryRun) {
            $this->warn(' [PERHATIAN] Mode DRY-RUN aktif. Tidak ada perubahan data yang akan disimpan.');
            $this->newLine();
        }

        $this->line('Menganalisis tiket berstatus Selesai dengan archives = 0...');
        $startTime = microtime(true);

        // Query tiket dengan archives = 0 dan tahap terakhir berstatus 'selesai'
        $records = DB::table('tb_tahap as t')
            ->select([
                'r.no_tiket',
                'r.nama',
                'r.operator_archives',
                't.operator',
                't.tanggal',
                's.status as nama_status'
            ])
            ->join(DB::raw('(
                SELECT t1.no_tiket, MAX(t1.id) as max_id
                FROM tb_tahap t1
                JOIN (
                    SELECT no_tiket, MAX(tanggal) as max_tanggal
                    FROM tb_tahap
                    GROUP BY no_tiket
                ) t2 ON t1.no_tiket = t2.no_tiket AND t1.tanggal = t2.max_tanggal
                GROUP BY t1.no_tiket
            ) as latest'), 't.id', '=', 'latest.max_id')
            ->join('tb_status as s', 't.status', '=', 's.id')
            ->join('tb_regtiket as r', 'r.no_tiket', '=', 't.no_tiket')
            ->where('r.archives', 0)
            ->whereRaw('LOWER(TRIM(s.status)) = ?', ['selesai'])
            ->get();

        $queryDuration = round(microtime(true) - $startTime, 2);
        $total = $records->count();

        if ($total === 0) {
            $this->info('✓ Semua tiket dengan status terakhir "Selesai" sudah memiliki archives = 1.');
            $this->line('  Tidak ada data yang perlu disinkronkan.');
            return Command::SUCCESS;
        }

        $this->info("✓ Ditemukan {$total} tiket yang memenuhi kriteria (Waktu analisis: {$queryDuration} detik).");
        $this->newLine();

        // Tampilkan sampel 5 data pertama
        $this->line('Contoh 5 data tiket yang akan diperbarui:');
        $sampleData = $records->take(5)->map(function ($item) {
            return [
                'No Tiket' => $item->no_tiket,
                'Pemohon' => $item->nama ?? '-',
                'Status' => $item->nama_status,
                'Operator Tahap' => $item->operator ?? '-',
                'Tanggal Tahap' => $item->tanggal,
            ];
        })->toArray();

        $this->table(['No Tiket', 'Pemohon', 'Status', 'Operator Tahap', 'Tanggal Tahap'], $sampleData);
        $this->newLine();

        // Hitung statistik operator_archives
        $hasOperatorCount = $records->filter(function ($item) {
            return !empty(trim((string) $item->operator_archives));
        })->count();
        $needOperatorCount = $total - $hasOperatorCount;

        $this->line("Rincian pengisian operator_archives:");
        $this->line(" - Sudah memiliki operator_archives : {$hasOperatorCount} tiket (akan dipertahankan)");
        $this->line(" - Akan diisi dari operator tahap  : {$needOperatorCount} tiket");
        $this->newLine();

        if ($isDryRun) {
            $this->warn('Simulasi selesai. Jalankan perintah tanpa flag --dry-run untuk mengeksekusi pembaruan.');
            return Command::SUCCESS;
        }

        // Konfirmasi jika tidak ada flag --force
        if (!$force) {
            if (!$this->confirm("Apakah Anda yakin ingin memperbarui {$total} tiket di atas menjadi archives = 1?", false)) {
                $this->warn('Operasi dibatalkan oleh pengguna.');
                return Command::SUCCESS;
            }
        }

        $this->line("Memproses pembaruan data dalam batch @{$batchSize} tiket...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $updatedTotal = 0;
        $execStart = microtime(true);

        try {
            foreach ($records->chunk($batchSize) as $chunk) {
                DB::transaction(function () use ($chunk, &$updatedTotal, $bar) {
                    foreach ($chunk->groupBy('operator') as $operator => $items) {
                        $ticketNos = $items->pluck('no_tiket')->all();

                        // 1. Update tiket yang belum memiliki operator_archives (isi operator_archives)
                        $u1 = DB::table('tb_regtiket')
                            ->whereIn('no_tiket', $ticketNos)
                            ->where(function ($q) {
                                $q->whereNull('operator_archives')
                                  ->orWhere('operator_archives', '');
                            })
                            ->update([
                                'archives' => 1,
                                'operator_archives' => $operator ?: null,
                            ]);

                        // 2. Update tiket yang sudah punya operator_archives (pertahankan operator_archives yang lama)
                        $u2 = DB::table('tb_regtiket')
                            ->whereIn('no_tiket', $ticketNos)
                            ->whereNotNull('operator_archives')
                            ->where('operator_archives', '!=', '')
                            ->update([
                                'archives' => 1,
                            ]);

                        $updatedTotal += ($u1 + $u2);
                    }
                    $bar->advance($chunk->count());
                });
            }

            $bar->finish();
            $this->newLine(2);

            $execDuration = round(microtime(true) - $execStart, 2);

            // Log aktivitas ke ActivityLogService jika tersedia
            try {
                ActivityLogService::log(
                    'Sinkronisasi Arsip Tiket',
                    'UPDATE',
                    "Sinkronisasi manual CLI: {$updatedTotal} tiket berstatus Selesai diubah ke archives = 1.",
                    [],
                    [
                        'total_updated' => $updatedTotal,
                        'duration_seconds' => $execDuration,
                    ]
                );
            } catch (\Throwable $e) {
                // Jangan gagalkan command jika hanya log error
            }

            $this->info("✓ BERHASIL! {$updatedTotal} tiket telah diperbarui menjadi archives = 1.");
            $this->line("  Waktu eksekusi: {$execDuration} detik.");
            $this->newLine();

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            $this->newLine();
            $this->error("Terjadi kesalahan saat memproses data: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
