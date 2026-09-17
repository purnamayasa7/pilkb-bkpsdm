<?php

namespace App\Console\Commands;

use App\Services\ActivityLogService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncDetTiketStatusCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tiket:sync-det-status
                            {--dry-run : Jalankan simulasi tanpa mengubah data di database}
                            {--batch=500 : Jumlah tiket yang diproses per batch}
                            {--force : Jalankan langsung tanpa konfirmasi interaktif}
                            {--clear-comment : Bersihkan juga kolom comment BTL menjadi NULL}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi status tb_det_tiket menjadi 1 (Valid) untuk tiket yang sudah diarsipkan (archives = 1)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun      = (bool) $this->option('dry-run');
        $batchSize     = max(50, (int) $this->option('batch'));
        $force         = (bool) $this->option('force');
        $clearComment  = (bool) $this->option('clear-comment');

        $this->newLine();
        $this->info('=======================================================');
        $this->info('   SINKRONISASI STATUS SYARAT TIKET (tb_det_tiket)    ');
        $this->info('=======================================================');
        $this->newLine();

        if ($isDryRun) {
            $this->warn(' [PERHATIAN] Mode DRY-RUN aktif. Tidak ada perubahan data yang akan disimpan.');
            $this->newLine();
        }

        $this->line('Menganalisis data tb_det_tiket pada tiket yang sudah diarsipkan (archives = 1)...');

        // =====================================================================
        // ANALISIS DATA YANG TERDAMPAK
        // =====================================================================
        $startTime = microtime(true);

        // Hitung baris det_tiket status=2 pada tiket archived
        $totalBaris = DB::table('tb_det_tiket as d')
            ->join('tb_regtiket as r', 'r.no_tiket', '=', 'd.no_tiket')
            ->where('r.archives', 1)
            ->where('d.status', 2)
            ->count();

        // Hitung tiket unik yang terdampak
        $totalTiket = DB::table('tb_det_tiket as d')
            ->join('tb_regtiket as r', 'r.no_tiket', '=', 'd.no_tiket')
            ->where('r.archives', 1)
            ->where('d.status', 2)
            ->distinct('d.no_tiket')
            ->count('d.no_tiket');

        $queryDuration = round(microtime(true) - $startTime, 2);

        if ($totalBaris === 0) {
            $this->info('✓ Semua baris tb_det_tiket pada tiket yang sudah diarsipkan sudah berstatus 1 (Valid).');
            $this->line('  Tidak ada data yang perlu disinkronkan.');
            return Command::SUCCESS;
        }

        $this->info("✓ Analisis selesai dalam {$queryDuration} detik.");
        $this->newLine();
        $this->line("Rincian data yang terdampak:");
        $this->line("  - Jumlah <fg=red>baris</> det_tiket status=2 (BTL) pada tiket archived : <fg=yellow>{$totalBaris}</>");
        $this->line("  - Jumlah <fg=red>tiket unik</> yang masih punya syarat BTL              : <fg=yellow>{$totalTiket}</>");
        if ($clearComment) {
            $this->line("  - Opsi <fg=cyan>--clear-comment</> aktif: kolom comment BTL akan diset NULL");
        }
        $this->newLine();

        // Tampilkan 5 sample data
        $this->line('Contoh 5 baris yang akan diperbarui:');
        $samples = DB::table('tb_det_tiket as d')
            ->select('d.no_tiket', 'd.id_syarat', 'd.status', 'd.comment')
            ->join('tb_regtiket as r', 'r.no_tiket', '=', 'd.no_tiket')
            ->where('r.archives', 1)
            ->where('d.status', 2)
            ->limit(5)
            ->get();

        $sampleData = $samples->map(function ($row) {
            $comment = $row->comment ? (strlen($row->comment) > 40 ? substr($row->comment, 0, 40) . '...' : $row->comment) : '-';
            return [
                'No Tiket' => $row->no_tiket,
                'ID Syarat' => $row->id_syarat,
                'Status Saat Ini' => $row->status . ' (BTL)',
                'Komentar BTL' => $comment,
            ];
        })->toArray();

        $this->table(['No Tiket', 'ID Syarat', 'Status Saat Ini', 'Komentar BTL'], $sampleData);
        $this->newLine();

        $this->line("Perubahan yang akan dilakukan:");
        $this->line("  <fg=red>status = 2</> (BTL)  →  <fg=green>status = 1</> (Valid)" . ($clearComment ? ", comment = NULL" : ", comment <fg=gray>tetap/tidak berubah</>"));
        $this->newLine();

        if ($isDryRun) {
            $this->warn('Simulasi selesai. Jalankan perintah tanpa flag --dry-run untuk mengeksekusi pembaruan.');
            return Command::SUCCESS;
        }

        // =====================================================================
        // KONFIRMASI INTERAKTIF
        // =====================================================================
        if (!$force) {
            $confirmMsg = "Apakah Anda yakin ingin mengubah {$totalBaris} baris det_tiket (BTL → Valid) pada {$totalTiket} tiket yang sudah diarsipkan?";
            if (!$this->confirm($confirmMsg, false)) {
                $this->warn('Operasi dibatalkan oleh pengguna.');
                return Command::SUCCESS;
            }
        }

        // =====================================================================
        // EKSEKUSI PEMBARUAN (via NO_TIKET, dibatch per tiket)
        // =====================================================================
        $this->line("Mengambil daftar no_tiket yang terdampak...");

        $affectedTicketNos = DB::table('tb_det_tiket as d')
            ->select('d.no_tiket')
            ->join('tb_regtiket as r', 'r.no_tiket', '=', 'd.no_tiket')
            ->where('r.archives', 1)
            ->where('d.status', 2)
            ->distinct()
            ->pluck('d.no_tiket');

        $this->line("Memproses pembaruan dalam batch @{$batchSize} tiket...");
        $bar = $this->output->createProgressBar($affectedTicketNos->count());
        $bar->start();

        $totalUpdatedBaris = 0;
        $execStart = microtime(true);

        try {
            foreach ($affectedTicketNos->chunk($batchSize) as $chunk) {
                DB::transaction(function () use ($chunk, &$totalUpdatedBaris, $clearComment) {
                    $updateData = ['status' => 1];
                    if ($clearComment) {
                        $updateData['comment'] = null;
                    }

                    $updated = DB::table('tb_det_tiket')
                        ->whereIn('no_tiket', $chunk->all())
                        ->where('status', 2)
                        ->update($updateData);

                    $totalUpdatedBaris += $updated;
                });

                $bar->advance($chunk->count());
            }

            $bar->finish();
            $this->newLine(2);

            $execDuration = round(microtime(true) - $execStart, 2);

            // Log aktivitas
            try {
                ActivityLogService::log(
                    'Sinkronisasi Status Syarat Tiket',
                    'UPDATE',
                    "Sinkronisasi manual CLI: {$totalUpdatedBaris} baris det_tiket status BTL (2) diubah ke Valid (1) pada {$totalTiket} tiket archived.",
                    [],
                    [
                        'total_baris_updated' => $totalUpdatedBaris,
                        'total_tiket_affected' => $totalTiket,
                        'clear_comment' => $clearComment,
                        'duration_seconds' => $execDuration,
                    ]
                );
            } catch (\Throwable $e) {
                // Tidak gagalkan command hanya karena log error
            }

            $this->info("✓ BERHASIL! {$totalUpdatedBaris} baris tb_det_tiket telah diperbarui menjadi status = 1 (Valid).");
            $this->line("  Tiket yang terdampak : {$totalTiket} tiket");
            $this->line("  Waktu eksekusi       : {$execDuration} detik");
            $this->newLine();

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            $this->newLine();
            $this->error("Terjadi kesalahan saat memproses data: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
