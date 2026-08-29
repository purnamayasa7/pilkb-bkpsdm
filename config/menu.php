<?php

return [
    // Role ID = 1 -> Root (Administrator Utama)
    1 => [
        // Heading
        [
            'type' => 'heading',
            'title' => 'Dashboard',
        ],

        [
            'type' => 'item',
            'title' => 'Dashboard',
            'path' => 'dashboard',
            'icon' => 'home',
            'active_key' => 'dashboard-root',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Master Data',
        ],

        [
            'type' => 'item',
            'title' => 'Data Pengguna',
            'path' => 'root/user',
            'icon' => 'users',
            'active_key' => 'users',
        ],

        [
            'type' => 'item',
            'title' => 'Data Bidang',
            'path' => 'root/bidang',
            'icon' => 'layers',
            'active_key' => 'bidang',
        ],

        [
            'type' => 'item',
            'title' => 'Data Layanan',
            'path' => 'root/layanan',
            'icon' => 'briefcase',
            'active_key' => 'layanan',
        ],

        [
            'type' => 'item',
            'title' => 'Persyaratan Layanan',
            'path' => 'root/syarat',
            'icon' => 'check-square',
            'active_key' => 'syarat',
        ],

        [
            'type' => 'item',
            'title' => 'Status Layanan',
            'path' => 'root/status',
            'icon' => 'info',
            'active_key' => 'status',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Manajemen Layanan',
        ],

        [
            'type' => 'item',
            'title' => 'Permintaan Layanan',
            'path' => 'root/tiket',
            'icon' => 'clipboard',
            'active_key' => 'permintaanLayanan',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Lainnya',
        ],

        [
            'type' => 'item',
            'title' => 'Percakapan',
            'path' => 'chat',
            'icon' => 'message-square',
            'active_key' => 'chat-center',
        ],

        [
            'type' => 'item',
            'title' => 'Log Aktivitas',
            'path' => 'log-aktivitas',
            'icon' => 'activity',
            'active_key' => 'aktivitas',
        ],

        [
            'type' => 'item',
            'title' => 'Laporan',
            'path' => 'root/laporan',
            'icon' => 'bar-chart-2',
            'active_key' => 'laporan',
        ],

        [
            'type' => 'item',
            'title' => 'Backup Database',
            'path' => 'root/backup/database',
            'icon' => 'database',
            'active_key' => 'backup',
        ],

        [
            'type' => 'item',
            'title' => 'FAQ',
            'path' => 'root/faq',
            'icon' => 'message-circle',
            'active_key' => 'faq',
        ],
    ],

    // Role ID = 2 -> Admin Bawah (Front Office / Loket Pelayanan)
    2 => [
        // Heading
        [
            'type' => 'heading',
            'title' => 'Dashboard',
        ],

        [
            'type' => 'item',
            'title' => 'Dashboard',
            'path' => 'dashboard',
            'icon' => 'home',
            'active_key' => 'dashboard-admin_bawah',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Manajemen Layanan',
        ],

        [
            'type' => 'item',
            'title' => 'Registrasi SKPD',
            'path' => 'adminBawah/permintaan',
            'icon' => 'globe',
            'active_key' => 'reg-skpd',
        ],

        [
            'type' => 'item',
            'title' => 'Pengambilan Berkas',
            'path' => 'adminBawah/pengambilan',
            'icon' => 'download',
            'active_key' => 'pengambilan',
        ],

        [
            'type' => 'item',
            'title' => 'Arsip Layanan',
            'path' => 'adminBawah/archives',
            'icon' => 'archive',
            'active_key' => 'archives',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Manajemen Tiket',
        ],

        [
            'type' => 'item',
            'title' => 'Daftar Tiket',
            'path' => 'adminBawah/tiket',
            'icon' => 'list',
            'active_key' => 'list-tiket',
        ],

        [
            'type' => 'item',
            'title' => 'Cetak Ulang Tiket',
            'path' => 'adminBawah/tiket/cetak-form',
            'icon' => 'printer',
            'active_key' => 'cetak-ulang',
        ],

        [
            'type' => 'item',
            'title' => 'Perbaikan Berkas',
            'path' => 'adminBawah/perbaikan',
            'icon' => 'edit',
            'active_key' => 'update-perbaikan',
        ],

        [
            'type' => 'item',
            'title' => 'Pindah Data Tiket',
            'path' => 'adminBawah/pindah',
            'icon' => 'shuffle',
            'active_key' => 'pindah-tiket',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Lainnya',
        ],

        [
            'type' => 'item',
            'title' => 'Percakapan',
            'path' => 'chat',
            'icon' => 'message-square',
            'active_key' => 'chat-center',
        ],

        [
            'type' => 'item',
            'title' => 'Aktivitas Anda',
            'path' => 'log-aktivitas',
            'icon' => 'activity',
            'active_key' => 'aktivitas',
        ],

        [
            'type' => 'item',
            'title' => 'Laporan',
            'path' => 'adminBawah/laporan',
            'icon' => 'bar-chart-2',
            'active_key' => 'laporan',
        ],

        [
            'type' => 'item',
            'title' => 'Cetak Syarat',
            'path' => 'adminBawah/cetakSyarat',
            'icon' => 'file-text',
            'active_key' => 'cetak-syarat',
        ],
    ],

    // Role ID = 3 -> Admin OPD (Pemohon Usulan)
    3 => [
        // Heading
        [
            'type' => 'heading',
            'title' => 'Dashboard',
        ],

        [
            'type' => 'item',
            'title' => 'Dashboard',
            'path' => 'dashboard',
            'icon' => 'home',
            'active_key' => 'dashboard-admin_opd',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Manajemen Layanan',
        ],

        [
            'type' => 'item',
            'title' => 'Pengajuan Layanan',
            'path' => 'adminOpd/tiket/create',
            'icon' => 'file-plus',
            'active_key' => 'register',
        ],

        [
            'type' => 'item',
            'title' => 'Daftar Pengajuan',
            'path' => 'adminOpd/tiket',
            'icon' => 'clipboard',
            'active_key' => 'list-permintaan',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Manajemen Tiket',
        ],

        [
            'type' => 'item',
            'title' => 'Daftar Perbaikan Usulan',
            'path' => 'adminOpd/perbaikan',
            'icon' => 'edit',
            'active_key' => 'list-perbaikan',
        ],

        [
            'type' => 'item',
            'title' => 'Cetak Ulang Tiket',
            'path' => 'adminOpd/tiket/cetak-form',
            'icon' => 'printer',
            'active_key' => 'cetak-ulang',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Lainnya',
        ],

        [
            'type' => 'item',
            'title' => 'Percakapan',
            'path' => 'chat',
            'icon' => 'message-square',
            'active_key' => 'chat-center',
        ],

        [
            'type' => 'item',
            'title' => 'Aktivitas Instansi',
            'path' => 'log-aktivitas',
            'icon' => 'activity',
            'active_key' => 'aktivitas',
        ],

        [
            'type' => 'item',
            'title' => 'Laporan',
            'path' => 'adminOpd/laporan',
            'icon' => 'bar-chart-2',
            'active_key' => 'laporan',
        ],

        [
            'type' => 'item',
            'title' => 'Cetak Syarat',
            'path' => 'adminOpd/cetakSyarat',
            'icon' => 'file-text',
            'active_key' => 'cetak-syarat',
        ],
    ],

    // Role ID = 4 -> Admin Bidang (Verifikator / Teknis)
    4 => [
        // Heading
        [
            'type' => 'heading',
            'title' => 'Dashboard',
        ],

        [
            'type' => 'item',
            'title' => 'Dashboard',
            'path' => 'dashboard',
            'icon' => 'home',
            'active_key' => 'dashboard-admin_bidang',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Master Data',
        ],

        [
            'type' => 'item',
            'title' => 'Data Layanan',
            'path' => 'adminBidang/layanan',
            'icon' => 'briefcase',
            'active_key' => 'adminBidanglayanan',
        ],

        [
            'type' => 'item',
            'title' => 'Persyaratan Layanan',
            'path' => 'adminBidang/syarat',
            'icon' => 'check-square',
            'active_key' => 'adminBidangsyarat',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Manajemen Layanan',
        ],

        [
            'type' => 'item',
            'title' => 'Daftar Permintaan',
            'path' => 'adminBidang/permintaan',
            'icon' => 'clipboard',
            'active_key' => 'list-permintaan',
        ],

        [
            'type' => 'item',
            'title' => 'Update Status',
            'path' => 'adminBidang/status',
            'icon' => 'edit',
            'active_key' => 'update-status',
        ],

        [
            'type' => 'item',
            'title' => 'Daftar Perbaikan Usulan',
            'path' => 'adminBidang/perbaikan',
            'icon' => 'tool',
            'active_key' => 'list-permintaan_data',
        ],

        // Heading
        [
            'type' => 'heading',
            'title' => 'Lainnya',
        ],

        [
            'type' => 'item',
            'title' => 'Percakapan',
            'path' => 'chat',
            'icon' => 'message-square',
            'active_key' => 'chat-center',
        ],

        [
            'type' => 'item',
            'title' => 'Aktivitas Bidang',
            'path' => 'log-aktivitas',
            'icon' => 'activity',
            'active_key' => 'aktivitas',
        ],

        [
            'type' => 'item',
            'title' => 'Laporan',
            'path' => 'adminBidang/laporan',
            'icon' => 'bar-chart-2',
            'active_key' => 'laporan',
        ],

        [
            'type' => 'item',
            'title' => 'Cetak Syarat',
            'path' => 'adminBidang/cetakSyarat',
            'icon' => 'file-text',
            'active_key' => 'cetak-syarat',
        ],
    ],
];
