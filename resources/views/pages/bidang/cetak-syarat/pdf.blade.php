<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Syarat-{{ \Illuminate\Support\Str::slug($layanan->nama_layanan ?? 'Layanan') }}</title>

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

        /* ===== KOP SURAT RESMI (PERSIS LAPORAN & TIKET) ===== */
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

        /* ===== KARTU INFORMASI LAYANAN ===== */
        .card-info {
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 14px;
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
            width: 110px;
        }

        .data-sep {
            width: 12px;
            color: #64748b;
            text-align: center;
        }

        .data-val {
            color: #0f172a;
            font-weight: bold;
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
            margin-bottom: 14px;
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
            padding: 6px 8px;
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

        /* ===== NOTICE BOX & FOOTER ===== */
        .notice-box {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 5px;
            padding: 8px 12px;
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

    <!-- KOP HEADER (PERSIS SESUAI STANDAR INSTANSI) -->
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
        <div class="doc-title">DAFTAR PERSYARATAN LAYANAN KEPEGAWAIAN</div>
    </div>

    <!-- KARTU INFORMASI LAYANAN -->
    <div class="card-info">
        <div class="card-header-title">Informasi Layanan Kepegawaian</div>
        <table class="data-table">
            <tr>
                <td class="data-label">Bidang Pengampu</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $bidang->nama_bidang ?? '-' }}</td>
            </tr>
            <tr>
                <td class="data-label">Nama Layanan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $layanan->nama_layanan ?? '-' }}</td>
            </tr>
            <tr>
                <td class="data-label">Total Persyaratan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $syarat->count() }} Dokumen Syarat</td>
            </tr>
        </table>
    </div>

    <!-- TABEL SYARAT LAYANAN -->
    <div class="section-header">Rincian Dokumen Persyaratan</div>

    <table class="syarat-table">
        <thead>
            <tr>
                <th style="width: 6%;">No</th>
                <th style="width: 94%;">Dokumen Persyaratan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($syarat as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="syarat-name">{{ $item->syarat }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="2" class="text-center" style="color: #64748b; padding: 10px;">
                        Tidak ada data dokumen persyaratan untuk layanan ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- CATATAN PENTING -->
    <div class="notice-box">
        <div class="notice-title">Catatan &amp; Petunjuk Pengajuan:</div>
        <ol class="notice-list">
            <li>Pastikan seluruh berkas persyaratan di atas disiapkan dengan lengkap (*dokumen asli atau salinan legalisir*).</li>
            <li>Pengajuan usulan layanan kepegawaian dapat diproses secara online melalui portal Sistem PILKB BKPSDM.</li>
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
