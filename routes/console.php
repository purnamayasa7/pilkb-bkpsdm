<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Pembersihan notifikasi lama setiap jam 01:00 WITA
Schedule::command('notifications:cleanup')
    ->dailyAt('01:00');

// Backup otomatis database harian pada jam 01:00 WITA
Schedule::command('backup:schedule-run')
    ->dailyAt('01:00');

// Pengecekan berkala (setiap jam): jika server mati/offline pada jam 01:00 WITA,
// sistem mencatat error jadwal terlewat dan mengeksekusi backup susulan saat server menyala kembali
Schedule::command('backup:check-missed')
    ->hourly();
