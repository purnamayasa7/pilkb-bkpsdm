<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\BidangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DetailTiketController;
use App\Http\Controllers\FaQController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LayananController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PengambilanController;
use App\Http\Controllers\PerbaikanController;
use App\Http\Controllers\PermintaanController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\SyaratController;
use App\Http\Controllers\TiketController;
use App\Http\Controllers\UpdateStatusController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/* Public */

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/cek-tiket', [TiketController::class, 'formCek'])->name('tiket.form');
Route::post('/cek-tiket', [TiketController::class, 'cekTiket'])->middleware('throttle:10,1')->name('tiket.cek');
Route::get('/cek-tiket/{no_tiket}', [TiketController::class, 'showPublic'])->name('tiket.public');
Route::get('/get-layanan-syarat/{bidang}', [SyaratController::class, 'getLayanan'])->name('getLayanan');
Route::get('/syarat/export-pdf', [SyaratController::class, 'exportPdf'])->name('exportPdf');

//Cetak PDF
Route::get('/tiket/cetak/{no_tiket}', [TiketController::class, 'cetak'])->name('tiket.cetak');


/* Authenticated */

Route::middleware(['auth', 'force.password'])->group(function () {

    /* Dashboard */
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('role:admin_bawah,admin_opd,root,bidang')
        ->name('dashboard');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    /* Profile */
    // Tampil profil
    Route::get('/profile', [UserController::class, 'profile'])->name('profile');
    //Update profil
    Route::put('/profil', [UserController::class, 'updateProfile'])->name('profile.update');

    // Change Password
    Route::get('/change-password', [UserController::class, 'changePasswordForm'])->name('password.change');
    Route::post('/change-password', [UserController::class, 'changePassword'])->name('password.update');

    // Notification
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/read/{id}', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.readAll');
    Route::post('/notifications/delete-all', [NotificationController::class, 'deleteAll'])->name('notifications.deleteAll');

    // Notification Index
    Route::get('/log-aktivitas', [LogController::class, 'index'])->middleware('role:root,admin_bawah,admin_opd,bidang')->name('log.index');
    Route::get('/log-aktivitas/export-excel', [LogController::class, 'exportExcel'])->middleware('role:root,admin_bawah,admin_opd,bidang')->name('log.exportExcel');
});

/* ROOT */

Route::prefix('root')
    ->name('root.')
    ->middleware(['auth', 'role:root'])
    ->group(function () {

        // MASTER DATA USER
        Route::get('user', [UserController::class, 'index'])->name('user');
        // Tampil Tambah Data
        Route::get('user/create', [UserController::class, 'create'])->name('create');
        // GET Pegawai Data
        Route::get('/api/pegawai/{nip}', [UserController::class, 'getPegawai'])->name('pegawai.getPegawai');
        // Tambah Data
        Route::post('user', [UserController::class, 'store'])->name('store');
        // Tampil Edit Data
        Route::get('user/{id}/edit', [UserController::class, 'edit'])->name('edit');
        // Update Data
        Route::put('user/{id}', [UserController::class, 'update'])->name('update');
        Route::put('user/{id}/toggle-aktif', [UserController::class, 'toggleAktif'])->name('toggle-aktif');
        // Export
        Route::get('user/export-excel', [UserController::class, 'exportExcel'])->name('user.exportExcel');
        Route::get('user/export-pdf', [UserController::class, 'exportPdf'])->name('user.exportPdf');

        // MASTER DATA BIDANG
        Route::get('bidang', [BidangController::class, 'index'])->name('bidang');
        Route::get('bidang/create', [BidangController::class, 'create'])->name('bidang.create');
        Route::post('bidang', [BidangController::class, 'store'])->name('bidang.store');
        Route::get('bidang/{id}', [BidangController::class, 'edit'])->name('bidang.edit');
        Route::put('bidang/{id}', [BidangController::class, 'update'])->name('bidang.update');
        Route::put('bidang/{id}/toggle-aktif', [BidangController::class, 'toggleAktif'])->name('bidang.toggle-aktif');

        // MASTER DATA LAYANAN
        Route::get('layanan', [LayananController::class, 'index'])->name('layanan');
        Route::get('layanan/create', [LayananController::class, 'create'])->name('layanan.create');
        Route::post('layanan', [LayananController::class, 'store'])->name('layanan.store');
        Route::get('layanan/export-excel', [LayananController::class, 'exportExcelList'])->name('layanan.exportExcelList');
        Route::get('layanan/{id}', [LayananController::class, 'edit'])->name('layanan.edit');
        Route::put('layanan/{id}', [LayananController::class, 'update'])->name('layanan.update');
        Route::put('layanan/{id}/toggle-aktif', [LayananController::class, 'toggleAktif'])->name('layanan.toggle-aktif');

        // MASTER DATA STATUS
        Route::get('status', [StatusController::class, 'index'])->name('status');
        Route::get('status/create', [StatusController::class, 'create'])->name('status.create');
        Route::post('status', [StatusController::class, 'store'])->name('status.store');
        Route::get('status/{id}', [StatusController::class, 'edit'])->name('status.edit');
        Route::put('status/{id}', [StatusController::class, 'update'])->name('status.update');
        Route::delete('status/{id}', [StatusController::class, 'destroy'])->name('status.destroy');
        Route::get('/get-layanan-status/{bidang}', [StatusController::class, 'getLayanan'])->name('status.getLayanan');

        // MASTER DATA SYARAT
        Route::get('syarat', [SyaratController::class, 'index'])->name('syarat');
        Route::get('syarat/create', [SyaratController::class, 'create'])->name('syarat.create');
        Route::post('syarat', [SyaratController::class, 'store'])->name('syarat.store');
        Route::get('syarat/{id}', [SyaratController::class, 'edit'])->name('syarat.edit');
        Route::put('syarat/{id}', [SyaratController::class, 'update'])->name('syarat.update');
        Route::delete('syarat/{id}', [SyaratController::class, 'destroy'])->name('syarat.destroy');
        Route::get('/get-layanan-syarat/{bidang}', [SyaratController::class, 'getLayanan'])->name('syarat.getLayanan');

        // TIKET
        Route::get('tiket', [TiketController::class, 'index'])->name('tiket');
        Route::get('filter', [TiketController::class, 'filter'])->name('filter');

        // LAPORAN
        Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::get('laporan/layanan', [LaporanController::class, 'getLayananByBidang'])->name('laporan.getLayananByBidang');
        Route::get('laporan/export-pdf', [LaporanController::class, 'exportPdf'])->name('laporan.exportPdf');

        //FAQ
        Route::get('faq', [FaQController::class, 'index'])->name('faq.index');
        Route::get('faq/create', [FaQController::class, 'create'])->name('faq.create');
        Route::post('faq/store', [FaQController::class, 'store'])->name('faq.store');
        Route::get('faq/{id}', [FaQController::class, 'edit'])->name('faq.edit');
        Route::put('faq/{id}', [FaQController::class, 'update'])->name('faq.update');
        Route::delete('faq/{id}', [FaQController::class, 'destroy'])->name('faq.destroy');

        // Backup Database
        Route::get('backup/database', [BackupController::class, 'runBackup'])->name('backup.database');
    });

Route::prefix('adminOpd')
    ->name('adminOpd.')
    ->middleware(['auth', 'role:admin_opd'])
    ->group(function () {
        // REG TIKET
        Route::get('tiket', [TiketController::class, 'indexProses'])->name('tiket.indexProses');
        Route::get('tiket/create', [TiketController::class, 'create'])->name('tiket.create');
        Route::post('tiket/step', [TiketController::class, 'step'])->name('tiket.step');
        Route::get('/tiket/reset', [TiketController::class, 'reset'])->name('tiket.reset');
        Route::get('/tiket/history/{no_tiket}', [TiketController::class, 'getHistory'])->name('tiket.getHistory');
        Route::get('/get-layanan-syarat/{bidang}', [SyaratController::class, 'getLayanan'])->name('syarat.getLayanan');
        Route::get('/get-pegawai/{nip}', [TiketController::class, 'getPegawai'])->name('pegawai.getPegawai');
        // Route::get('/pegawai/foto/{nip}', [TiketController::class, 'getFotoPegawai'])->name('pegawai.foto');

        // EXPORT EXCEL & PDF
        Route::get('/tiket/export-excel', [LayananController::class, 'exportExcel'])->name('tiket.exportExcel');
        Route::get('/tiket/export-pdf', [LayananController::class, 'exportPdf'])->name('tiket.exportPdf');

        // PERBAIKAN USULAN
        Route::get('perbaikan', [DetailTiketController::class, 'index'])->name('perbaikan.index');
        Route::get('perbaikan/detail/{no_tiket}', [DetailTiketController::class, 'detailPerbaikan'])->name('perbaikan.detailPerbaikan');
        Route::post('perbaikan/{no_tiket}/konfirmasi', [DetailTiketController::class, 'konfirmasiPerbaikan'])->name('perbaikan.konfirmasi');
        // EXPORT EXCEL & PDF
        Route::get('perbaikan/export-excel', [DetailTiketController::class, 'exportExcel'])->name('perbaikan.exportExcel');
        Route::get('perbaikan/export-pdf', [DetailTiketController::class, 'exportPdf'])->name('perbaikan.exportPdf');

        //AJAX
        Route::get('get-layanan/{id}', [TiketController::class, 'getLayanan']);
        Route::get('get-syarat/{id}', [TiketController::class, 'getSyarat']);

        // CETAK ULANG TIKET
        Route::get('tiket/cetak-form', [TiketController::class, 'formCetak'])->name('tiket.formCetak');

        // LAPORAN
        Route::get('laporan', [LayananController::class, 'indexLaporan'])->name('laporan.indexLaporan');
        // EXPORT EXCEL
        Route::get('laporan/export', [LayananController::class, 'exportPdfOpd'])->name('laporan.exportPdfOpd');

        // CETAK SYARAT
        Route::get('cetakSyarat', [SyaratController::class, 'indexCetak'])->name('cetakSyarat.index');
        Route::get('get-layanan-syarat/{bidang}', [SyaratController::class, 'getLayanan'])->name('syarat.getLayanan');
        // EXPORT PDF
        Route::get('cetakSyarat/export', [SyaratController::class, 'exportPdf'])->name('cetakSyarat.export');
    });

Route::prefix('adminBidang')
    ->name('adminBidang.')
    ->middleware(['auth', 'role:bidang'])
    ->group(function () {
        // INDEX
        Route::get('permintaan', [PermintaanController::class, 'index'])->name('permintaan.index');
        Route::get('permintaan/{no_tiket}/edit', [PermintaanController::class, 'editPermintaan'])->name('permintaan.editPermintaan');
        Route::post('permintaan/{no_tiket}/update', [PermintaanController::class, 'updatePermintaan'])->name('permintaan.updatePermintaan');
        Route::post('permintaan/{no_tiket}/selesai', [PermintaanController::class, 'selesaiPermintaan'])->name('permintaan.selesaiPermintaan');

        // UPDATE STATUS
        Route::get('status', [UpdateStatusController::class, 'index'])->name('status.index');
        Route::get('status/{no_tiket}/edit', [UpdateStatusController::class, 'edit'])->name('status.edit');
        Route::post('status/{no_tiket}/update', [UpdateStatusController::class, 'update'])->name('status.update');

        // PERBAIKAN
        Route::get('perbaikan', [PerbaikanController::class, 'index'])->name('perbaikan.index');
        Route::get('perbaikan/detail/{no_tiket}', [PerbaikanController::class, 'detail'])->name('perbaikan.detail');

        // LAPORAN
        Route::get('laporan', [LaporanController::class, 'indexBidang'])->name('laporan.indexBidang');
        Route::get('laporan/export-pdf', [LaporanController::class, 'exportPdfBidang'])->name('laporan.exportPdfBidang');

        // CETAK SYARAT
        Route::get('cetakSyarat', [SyaratController::class, 'indexCetakAdminBidang'])->name('cetakSyarat.indexCetakAdminBidang');
        Route::get('get-layanan-syarat/{bidang}', [SyaratController::class, 'getLayanan'])->name('syarat.getLayanan');
        Route::get('cetakSyarat/export', [SyaratController::class, 'exportPdfBidang'])->name('cetakSyarat.exportPdfBidang');
    });

Route::prefix('adminBawah')
    ->name('adminBawah.')
    ->middleware(['auth', 'role:admin_bawah'])
    ->group(function () {
        // INDEX
        Route::get('tiket', [TiketController::class, 'indexList'])->name('tiket.indexList');

        // CETAK ULANG TIKET
        Route::get('tiket/cetak-form', [TiketController::class, 'formCetakAdminBawah'])->name('tiket.formCetakAdminBawah');

        // CETAK SYARAT
        Route::get('cetakSyarat', [SyaratController::class, 'indexCetakAdminBawah'])->name('cetakSyarat.indexCetakAdminBawah');
        Route::get('get-layanan-syarat/{bidang}', [SyaratController::class, 'getLayanan'])->name('syarat.getLayanan');
        // EXPORT PDF
        Route::get('cetakSyarat/export', [SyaratController::class, 'exportPdf'])->name('cetakSyarat.export');

        // PERBAIKAN USULAN
        Route::get('perbaikan', [DetailTiketController::class, 'indexAdminBawah'])->name('perbaikan.indexAdminBawah');
        Route::get('perbaikan/review/{no_tiket}', [DetailTiketController::class, 'review'])->name('perbaikan.review');
        Route::post('perbaikan/review/{no_tiket}', [DetailTiketController::class, 'submitReview'])->name('perbaikan.submitReview');
        Route::get('perbaikan/export-pdf', [DetailTiketController::class, 'exportPerbaikanPdf'])->name('perbaikan.exportPerbaikanPdf');

        // PERMINTAAN USULAN
        Route::get('permintaan', [DetailTiketController::class, 'indexPermintaan'])->name('permintaan.indexPermintaan');
        Route::get('permintaan/{no_tiket}/review', [DetailTiketController::class, 'reviewPermintaan'])->name('permintaan.reviewPermintaan');
        Route::post('permintaan/{no_tiket}/submit', [DetailTiketController::class, 'submitPermintaan'])->name('permintaan.submitPermintaan');
        Route::get('permintaan/export-pdf', [DetailTiketController::class, 'exportPermintaanPdf'])->name('permintaan.exportPermintaanPdf');

        // ARCHIVES USULAN
        Route::get('archives', [PengambilanController::class, 'indexArchives'])->name('archives.indexArchives');
        Route::get('archives/export-pdf', [PengambilanController::class, 'exportArchivesPdf'])->name('archives.exportArchivesPdf');

        // EXPORT EXCEL & PDF
        Route::get('perbaikan/export-excel', [DetailTiketController::class, 'exportExcel'])->name('perbaikan.exportExcel');
        Route::get('perbaikan/export-pdf', [DetailTiketController::class, 'exportPdf'])->name('perbaikan.exportPdf');

        // LAPORAN
        Route::get('laporan', [LaporanController::class, 'index'])->name('laporan.index');
        Route::get('laporan/layanan', [LaporanController::class, 'getLayananByBidang'])->name('laporan.getLayananByBidang');
        Route::get('laporan/export-pdf', [LaporanController::class, 'exportPdf'])->name('laporan.exportPdf');

        // PENGAMBILAN
        Route::get('pengambilan', [PengambilanController::class, 'indexPengambilan'])->name('pengambilan.indexPengambilan');
        Route::get('pengambilan/cek-tiket/{no_tiket}', [PengambilanController::class, 'cekTiket'])->name('pengambilan.cekTiket');
        Route::post('pengambilan/store', [PengambilanController::class, 'store'])->name('pengambilan.store');
        Route::get('pengambilan/export-pdf', [PengambilanController::class, 'exportPdf'])->name('pengambilan.exportPdf');

        // PINDAH DATA TIKET
        Route::get('pindah', [TiketController::class, 'indexPindah'])->name('pindah.indexPindah');
        Route::get('pindah/{no_tiket}', [TiketController::class, 'editPindah'])->name('pindah.editPindah');
        Route::post('pindah/{no_tiket}', [TiketController::class, 'updatePindah'])->name('pindah.updatePindah');
        Route::get('pindah/get-layanan/{bidang}', [TiketController::class, 'getLayananPindah'])->name('pindah.getLayanan');
        Route::get('pindah/get-syarat/{layanan}', [TiketController::class, 'getSyaratPindah'])->name('pindah.getSyarat');
    });

/* Auth (Breeze) */
require __DIR__ . '/auth.php';

/* Fallback */
Route::fallback(function () {
    abort(404);
});
