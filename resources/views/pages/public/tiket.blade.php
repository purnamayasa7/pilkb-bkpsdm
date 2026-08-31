<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Detail Tiket #{{ $tiket->no_tiket }} - PILKB</title>

    <!-- Bootstrap 5, Font & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        :root {
            --primary-blue: #1e40af;
            --primary-blue-hover: #1e3a8a;
            --bg-body: #f8fafc;
            --card-bg: #ffffff;
            --border-subtle: #e2e8f0;
            --text-main: #0f172a;
            --text-muted: #64748b;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            margin: 0;
            padding: 0;
        }

        /* ===== NAVBAR ===== */
        .portal-navbar {
            background-color: #ffffff;
            border-bottom: 1px solid var(--border-subtle);
            padding: 0.75rem 0;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .portal-logo {
            height: 38px;
            width: auto;
        }

        .brand-title {
            font-size: 1rem;
            font-weight: 800;
            color: var(--text-main);
            line-height: 1.1;
        }

        .brand-subtitle {
            font-size: 0.72rem;
            color: var(--text-muted);
        }

        /* ===== CARDS ===== */
        .portal-card {
            background: var(--card-bg);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            margin-bottom: 1.25rem;
            overflow: hidden;
        }

        .portal-card-header {
            padding: 0.85rem 1.25rem;
            background-color: #ffffff;
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .portal-card-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-main);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .portal-card-body {
            padding: 1.25rem;
        }

        /* ===== DATA LIST TABLE ===== */
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            border: none;
            padding: 0.35rem 0;
            font-size: 0.875rem;
            vertical-align: top;
        }

        .info-label {
            color: var(--text-muted);
            width: 130px;
        }

        .info-sep {
            width: 15px;
            color: var(--text-muted);
            text-align: center;
        }

        .info-val {
            color: var(--text-main);
            font-weight: 600;
        }

        /* ===== STICKY TICKET BOX ===== */
        .ticket-sticky-card {
            background: #ffffff;
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 1.25rem;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            position: sticky;
            top: 1rem;
        }

        .ticket-code-box {
            background-color: #f8fafc;
            border: 1.5px dashed #93c5fd;
            border-radius: 8px;
            padding: 0.75rem;
            margin-bottom: 1rem;
        }

        .ticket-number {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--primary-blue);
            letter-spacing: 1.5px;
            font-family: 'Courier New', Courier, monospace;
        }

        .qr-container {
            background: #ffffff;
            padding: 6px;
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            display: inline-block;
            margin-bottom: 0.85rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .btn-cetak-pdf {
            background-color: var(--primary-blue);
            border-color: var(--primary-blue);
            color: #ffffff;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            width: 100%;
            transition: all 0.2s ease;
        }

        .btn-cetak-pdf:hover {
            background-color: var(--primary-blue-hover);
            border-color: var(--primary-blue-hover);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
        }

        /* ===== DATA TABLES ===== */
        .table-custom {
            width: 100%;
            margin-bottom: 0;
            border-collapse: collapse;
        }

        .table-custom th {
            background-color: var(--primary-blue);
            color: #ffffff;
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 0.65rem 0.85rem;
            border: 1px solid var(--primary-blue);
            text-align: center;
        }

        .table-custom td {
            border: 1px solid var(--border-subtle);
            padding: 0.65rem 0.85rem;
            font-size: 0.84rem;
            vertical-align: middle;
        }

        .table-custom tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* ===== BADGES ===== */
        .badge-status-valid {
            color: #15803d;
            background-color: #dcfce7;
            border: 1px solid #bbf7d0;
            font-weight: 600;
            font-size: 0.75rem;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            display: inline-block;
        }

        .badge-status-invalid {
            color: #b91c1c;
            background-color: #fee2e2;
            border: 1px solid #fecaca;
            font-weight: 600;
            font-size: 0.75rem;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            display: inline-block;
        }

        .badge-status-pending {
            color: #475569;
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            font-weight: 600;
            font-size: 0.75rem;
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            display: inline-block;
        }

        /* ===== FOOTER ===== */
        .portal-footer {
            margin-top: auto;
            background-color: #ffffff;
            border-top: 1px solid var(--border-subtle);
            padding: 1.25rem 0;
            font-size: 0.8rem;
            color: var(--text-muted);
            text-align: center;
        }
    </style>
</head>

<body>

    <!-- NAVBAR RESMI -->
    <nav class="portal-navbar">
        <div class="container d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
                <img src="{{ asset('images/KabBuleleng.png') }}" alt="Logo Kab Buleleng" class="portal-logo">
                <div>
                    <div class="brand-title">PILKB</div>
                    <div class="brand-subtitle">Pusat Informasi Layanan Kepegawaian BKPSDM Buleleng</div>
                </div>
            </div>
            <div>
                <a href="{{ route('tiket.cetak', $tiket->no_tiket) }}" target="_blank" class="btn btn-sm btn-cetak-pdf px-3">
                    <i class="fa-solid fa-print me-1"></i> Cetak Bukti PDF
                </a>
            </div>
        </div>
    </nav>

    <!-- CONTENT WRAPPER -->
    <main class="container my-4">

        <!-- HEADER JUDUL HALAMAN -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-2 border-bottom">
            <div>
                <h4 class="fw-bold mb-1" style="color: var(--text-main);">Detail Tiket Usulan Layanan</h4>
            </div>
            <div>
                @php
                    $latestTahap = $tiket->tahap->last();
                    $statusName = $latestTahap->statusRel->status ?? ($latestTahap->status ?? 'Diajukan');
                @endphp
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-semibold" style="font-size: 0.82rem;">
                    <i class="fa-solid fa-clock-rotate-left me-1"></i> Status: {{ $statusName }}
                </span>
            </div>
        </div>

        <div class="row g-4">

            <!-- KOLOM UTAMA (KIRI) -->
            <div class="col-lg-8">

                <!-- KARTU INFORMASI PEGAWAI & LAYANAN -->
                <div class="portal-card">
                    <div class="portal-card-header">
                        <h6 class="portal-card-title">
                            <i class="fa-solid fa-id-card" style="color: var(--primary-blue);"></i>
                            Informasi Pegawai &amp; Layanan
                        </h6>
                    </div>
                    <div class="portal-card-body">
                        <table class="info-table">
                            <tr>
                                <td class="info-label">NIP</td>
                                <td class="info-sep">:</td>
                                <td class="info-val">{{ $tiket->nip }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Nama Pegawai</td>
                                <td class="info-sep">:</td>
                                <td class="info-val">{{ $data['nama'] ?? ($tiket->nama ?? '-') }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Golongan</td>
                                <td class="info-sep">:</td>
                                <td class="info-val">{{ $data['golongan'] ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Unit Kerja</td>
                                <td class="info-sep">:</td>
                                <td class="info-val">{{ $data['unit'] ?? ($tiket->nama_ukerja ?? '-') }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Jenis Layanan</td>
                                <td class="info-sep">:</td>
                                <td class="info-val">{{ $tiket->layanan->nama_layanan ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Bidang Pengampu</td>
                                <td class="info-sep">:</td>
                                <td class="info-val">{{ $tiket->layanan->bidang->nama_bidang ?? '-' }}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Tgl. Pengajuan</td>
                                <td class="info-sep">:</td>
                                <td class="info-val">{{ \Carbon\Carbon::parse($tiket->tanggal)->translatedFormat('d F Y, H:i') }} WITA</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- KARTU KELENGKAPAN SYARAT DOKUMEN -->
                <div class="portal-card">
                    <div class="portal-card-header">
                        <h6 class="portal-card-title">
                            <i class="fa-solid fa-file-circle-check" style="color: var(--primary-blue);"></i>
                            Kelengkapan Syarat Dokumen
                        </h6>
                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2 py-1" style="font-size: 0.72rem;">
                            {{ $syarat->count() }} Dokumen
                        </span>
                    </div>
                    <div class="table-responsive">
                        <table class="table-custom">
                            <thead>
                                <tr>
                                    <th style="width: 6%;">No</th>
                                    <th style="width: 54%;">Dokumen Syarat Layanan</th>
                                    <th style="width: 22%;">Catatan / Keterangan</th>
                                    <th style="width: 18%;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($syarat as $i => $s)
                                    <tr>
                                        <td class="text-center">{{ $i + 1 }}</td>
                                        <td>{{ $s->syarat }}</td>
                                        <td>
                                            @if(!empty($s->comment))
                                                <span class="text-danger fw-semibold">{{ $s->comment }}</span>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        </td>
                                        <td class="text-center">
                                            @if ($s->status == 1)
                                                <span class="badge-status-valid">Valid</span>
                                            @elseif ($s->status == 2)
                                                <span class="badge-status-invalid">Tidak Valid</span>
                                            @else
                                                <span class="badge-status-pending">Sedang Verifikasi</span>
                                            @endif
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="text-center text-muted py-3">
                                            Tidak ada data dokumen syarat.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- KARTU RIWAYAT TAHAP USULAN -->
                <div class="portal-card">
                    <div class="portal-card-header">
                        <h6 class="portal-card-title">
                            <i class="fa-solid fa-list-timeline" style="color: var(--primary-blue);"></i>
                            Riwayat Tahap Usulan
                        </h6>
                    </div>
                    <div class="table-responsive">
                        <table class="table-custom">
                            <thead>
                                <tr>
                                    <th style="width: 20%;">Tanggal &amp; Waktu</th>
                                    <th style="width: 22%;">Operator</th>
                                    <th style="width: 24%;">Status Tahap</th>
                                    <th style="width: 34%;">Catatan / Komentar</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($tiket->tahap as $t)
                                    <tr>
                                        <td class="text-center">{{ \Carbon\Carbon::parse($t->tanggal)->translatedFormat('d-m-Y H:i') }} WITA</td>
                                        <td>{{ $t->operator ?? '-' }}</td>
                                        <td>
                                            <span class="fw-semibold">{{ $t->statusRel->status ?? $t->status }}</span>
                                        </td>
                                        <td>{{ $t->comment ?? '-' }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="text-center text-muted py-3">
                                            Belum ada riwayat tahap usulan.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <!-- KOLOM SAMPING (KANAN) -->
            <div class="col-lg-4">
                <div class="ticket-sticky-card">
                    <div class="ticket-code-box">
                        <small class="text-muted fw-bold d-block text-uppercase mb-1" style="font-size: 0.72rem; letter-spacing: 0.5px;">Nomor Tiket</small>
                        <div class="ticket-number">{{ $tiket->no_tiket }}</div>
                        <button class="btn btn-link btn-sm text-decoration-none p-0 mt-1 fw-semibold text-primary" style="font-size: 0.78rem;" onclick="copyTicket('{{ $tiket->no_tiket }}')">
                            <i class="fa-regular fa-copy me-1"></i> <span id="copyText">Salin Nomor Tiket</span>
                        </button>
                    </div>

                    <div class="qr-container">
                        <img src="data:image/svg+xml;base64,{{ $qr }}" width="110" height="110" alt="QR Code Tiket">
                    </div>

                    <p class="text-muted small mb-3" style="font-size: 0.78rem;">
                        Pindai QR Code ini untuk mengecek progres usulan secara realtime kapan saja.
                    </p>

                    <a href="{{ route('tiket.cetak', $tiket->no_tiket) }}" target="_blank" class="btn btn-cetak-pdf">
                        <i class="fa-solid fa-print me-1"></i> Cetak Bukti PDF
                    </a>
                </div>
            </div>

        </div>

    </main>

    <!-- FOOTER -->
    <footer class="portal-footer">
        <div class="container">
            <p class="mb-0">
                &copy; {{ date('Y') }} <strong>Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM)</strong> Kabupaten Buleleng.
            </p>
            <small class="text-muted">Sistem Informasi Pelayanan Kepegawaian (PILKB)</small>
        </div>
    </footer>

    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function copyTicket(text) {
            navigator.clipboard.writeText(text).then(function() {
                const copyText = document.getElementById('copyText');
                copyText.innerText = 'Tersalin!';
                setTimeout(() => {
                    copyText.innerText = 'Salin Nomor Tiket';
                }, 2000);
            });
        }
    </script>
</body>

</html>
