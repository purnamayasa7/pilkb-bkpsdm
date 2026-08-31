<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Tiket-{{ $tiket->no_tiket }}</title>

    <style>
        @page {
            margin: 25px 32px 25px 32px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* ===== KOP SURAT RESMI (PERSIS LAPORAN) ===== */
        .header {
            text-align: center;
        }

        .header img {
            width: 60px;
        }

        .title-header {
            font-size: 14px;
        }

        hr {
            border: 0;
            border-top: 1.5px solid #000;
            margin-top: 6px;
            margin-bottom: 14px;
        }

        /* ===== JUDUL DOKUMEN ===== */
        .doc-title-container {
            text-align: center;
            margin-bottom: 14px;
        }

        .doc-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin: 0;
            text-decoration: underline;
        }

        /* ===== 2 KOLOM KARTU INFORMASI (SAMA TINGGI & FLEKSIBEL) ===== */
        .info-layout-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 14px;
        }

        .card-box {
            border-radius: 6px;
            padding: 9px 12px;
        }

        .card-left {
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            vertical-align: top;
        }

        .card-right {
            border: 1px solid #bfdbfe;
            background-color: #eff6ff;
            text-align: center;
            vertical-align: middle;
        }

        .card-header-title {
            font-size: 10.5px;
            font-weight: bold;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table td {
            border: none;
            padding: 2.5px 0;
            font-size: 10.5px;
            vertical-align: top;
        }

        .data-label {
            color: #64748b;
            width: 80px;
        }

        .data-sep {
            width: 10px;
            color: #64748b;
            text-align: center;
        }

        .data-val {
            color: #0f172a;
            font-weight: bold;
        }

        .ticket-box {
            background-color: #ffffff;
            border: 1.5px solid #3b82f6;
            border-radius: 5px;
            padding: 4px 6px;
            margin-bottom: 8px;
        }

        .ticket-label {
            font-size: 8.5px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1px;
        }

        .ticket-number {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 1px;
        }

        .qr-wrapper {
            background: #ffffff;
            display: inline-block;
            padding: 3px;
            border: 1px solid #dbeafe;
            border-radius: 4px;
        }

        .ticket-label {
            font-size: 8.5px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1px;
        }

        .ticket-number {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 1px;
        }

        .qr-wrapper {
            background: #ffffff;
            display: inline-block;
            padding: 3px;
            border: 1px solid #dbeafe;
            border-radius: 4px;
            margin-bottom: 3px;
        }

        .qr-caption {
            font-size: 8px;
            color: #64748b;
            line-height: 1.2;
            margin: 0;
        }

        /* ===== TABEL SYARAT LAYANAN ===== */
        .section-header {
            font-size: 10.5px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .syarat-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 12px;
        }

        .syarat-table th {
            background-color: #1e40af;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 6px 8px;
            border: 1px solid #1e40af;
            text-align: center;
        }

        .syarat-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            font-size: 10px;
            vertical-align: middle;
        }

        .syarat-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .text-center {
            text-align: center;
        }

        .syarat-name {
            word-wrap: break-word;
            word-break: break-word;
            color: #1e293b;
            line-height: 1.35;
        }

        /* STATUS BADGE */
        .badge-status-valid {
            color: #15803d;
            background-color: #dcfce7;
            border: 1px solid #bbf7d0;
            font-weight: bold;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
        }

        .badge-status-invalid {
            color: #b91c1c;
            background-color: #fee2e2;
            border: 1px solid #fecaca;
            font-weight: bold;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
        }

        .badge-status-pending {
            color: #475569;
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            font-weight: bold;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
        }

        .badge-efile {
            color: #1e40af;
            background-color: #dbeafe;
            border: 1px solid #bfdbfe;
            font-weight: bold;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
        }

        /* ===== NOTICE BOX & FOOTER ===== */
        .notice-box {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 5px;
            padding: 7px 10px;
            margin-bottom: 10px;
        }

        .notice-title {
            font-size: 9px;
            font-weight: bold;
            color: #92400e;
            text-transform: uppercase;
            margin: 0 0 2px 0;
        }

        .notice-list {
            margin: 0;
            padding-left: 14px;
            font-size: 8.5px;
            color: #78350f;
            line-height: 1.35;
        }

        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }

        .footer-table td {
            border: none;
            padding: 0;
            font-size: 8.5px;
            color: #94a3b8;
        }
    </style>
</head>

<body>

    <!-- KOP HEADER (PERSIS SESUAI LAPORAN PDF) -->
    <div class="header">
        <table style="border:none; width:auto; margin:0 auto;">
            <tr>
                {{-- LOGO --}}
                <td style="border:none; vertical-align:middle;">
                    <img src="{{ public_path('images/KabBuleleng.png') }}">
                </td>

                {{-- TEXT --}}
                <td class="title-header" style="border:none; text-align:center; line-height:1.5;">
                    <div><strong>PEMERINTAH KABUPATEN BULELENG</strong></div>
                    <div><strong>BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA</strong></div>
                    <div style="font-size: 11px; font-weight: normal;">Alamat: Jalan Laksamana (LC) Baktiseraga, Singaraja, Bali</div>
                </td>
            </tr>
        </table>
    </div>

    <hr>

    <!-- JUDUL DOKUMEN -->
    <div class="doc-title-container">
        <div class="doc-title">BUKTI PENDAFTARAN &amp; TIKET USULAN LAYANAN</div>
    </div>

    <!-- 2 KOLOM KARTU: DATA DIRI & TIKET QR (SAMA TINGGI & SIMETRIS) -->
    <table class="info-layout-table">
        <tr>
            <!-- KARTU DATA PEMOHON (KIRI) -->
            <td width="64%" class="card-box card-left">
                <div class="card-header-title">Informasi Pegawai &amp; Layanan</div>
                <table class="data-table">
                    <tr>
                        <td class="data-label">NIP</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $tiket->nip }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Nama</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $data['nama'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Golongan</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $data['ket_gol'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Unit Kerja</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $data['unit'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Layanan</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $tiket->layanan->nama_layanan ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Tgl. Pengajuan</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ \Carbon\Carbon::parse($tiket->tanggal)->translatedFormat('d-m-Y') }}</td>
                    </tr>
                </table>
            </td>

            <!-- SPACER KOLOM -->
            <td width="2%"></td>

            <!-- KARTU NOMOR TIKET & QR (KANAN) -->
            <td width="34%" class="card-box card-right">
                <div class="ticket-box">
                    <div class="ticket-label">Nomor Tiket</div>
                    <div class="ticket-number">{{ $tiket->no_tiket }}</div>
                </div>

                <div class="qr-wrapper">
                    <img src="data:image/svg+xml;base64,{{ $qr }}" width="90" height="90">
                </div>
            </td>
        </tr>
    </table>

    <!-- TABEL SYARAT LAYANAN -->
    <div class="section-header">Kelengkapan Syarat Dokumen</div>

    <table class="syarat-table">
        <thead>
            <tr>
                <th style="width: 6%;">No</th>
                <th style="width: 62%;">Dokumen Syarat Layanan</th>
                <th style="width: 14%;">E-File</th>
                <th style="width: 18%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($syarat as $i => $s)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td class="syarat-name">{{ $s->syarat->syarat ?? ($s->syarat ?? '-') }}</td>
                    <td class="text-center">
                        <span class="badge-efile">Ada</span>
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
                    <td colspan="4" class="text-center" style="color: #64748b; padding: 10px;">
                        Tidak ada data dokumen syarat.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- CATATAN PENTING -->
    <div class="notice-box">
        <div class="notice-title">Catatan:</div>
        <ol class="notice-list">
            <li>Simpan lembar bukti pendaftaran tiket ini sebagai tanda bukti pengajuan layanan kepegawaian.</li>
            <li>Perkembangan proses verifikasi berkas dan tindak lanjut layanan dapat dipantau melalui QR Code di atas.</li>
        </ol>
    </div>

    <!-- FOOTER CETAK -->
    <table class="footer-table">
        <tr>
            <td width="60%">Dicetak secara elektronik melalui Sistem PILKB</td>
            <td width="40%" style="text-align: right;">{{ now()->translatedFormat('d-m-Y H:i') }} WITA</td>
        </tr>
    </table>

</body>

</html>