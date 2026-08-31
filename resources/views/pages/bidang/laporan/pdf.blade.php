<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Laporan-Usulan-Layanan</title>

    <style>
        @page {
            margin: 24px 30px 24px 30px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: sans-serif;
            font-size: 10.5px;
            color: #1e293b;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }

        /* ===== KOP SURAT RESMI ===== */
        .header {
            text-align: center;
        }

        .header img {
            width: 55px;
        }

        .title-header {
            font-size: 13.5px;
        }

        hr {
            border: 0;
            border-top: 1.5px solid #000;
            margin-top: 5px;
            margin-bottom: 12px;
        }

        /* ===== JUDUL DOKUMEN ===== */
        .doc-title-container {
            text-align: center;
            margin-bottom: 10px;
        }

        .doc-title {
            font-size: 12.5px;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin: 0;
            text-decoration: underline;
        }

        /* ===== KARTU INFORMASI PERIODE ===== */
        .card-info {
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-radius: 5px;
            padding: 7px 12px;
            margin-bottom: 12px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table td {
            border: none;
            padding: 1.5px 0;
            font-size: 10px;
            vertical-align: middle;
        }

        .data-label {
            color: #64748b;
            width: 95px;
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

        /* ===== TABEL DATA LAPORAN ===== */
        .laporan-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 10px;
        }

        .laporan-table th {
            background-color: #1e40af;
            color: #ffffff;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            padding: 6px 6px;
            border: 1px solid #1e40af;
            text-align: center;
        }

        .laporan-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 6px;
            font-size: 9.5px;
            vertical-align: middle;
        }

        .laporan-table tr:nth-child(even) {
            background-color: #f8fafc;
        }

        .text-center {
            text-align: center;
        }

        .cell-break {
            word-wrap: break-word;
            word-break: break-word;
            line-height: 1.3;
        }

        /* ===== FOOTER ===== */
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
        <div class="doc-title">LAPORAN REKAPITULASI USULAN LAYANAN</div>
    </div>

    <!-- KARTU INFORMASI PERIODE & UNIT KERJA -->
    <div class="card-info">
        <table class="data-table">
            <tr>
                <td class="data-label">Periode Tanggal</td>
                <td class="data-sep">:</td>
                <td class="data-val">
                    {{ \Carbon\Carbon::parse($start)->translatedFormat('d F Y') }}
                    s/d
                    {{ \Carbon\Carbon::parse($end)->translatedFormat('d F Y') }}
                </td>
                <td style="width: 30px;"></td>
                <td class="data-label" style="width: 80px;">Total Usulan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $data->count() }} Permohonan</td>
            </tr>
        </table>
    </div>

    <!-- TABEL DATA LAPORAN -->
    <table class="laporan-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 12%;">No. Tiket</th>
                <th style="width: 14%;">NIP</th>
                <th style="width: 18%;">Nama Pegawai</th>
                <th style="width: 17%;">Layanan</th>
                <th style="width: 16%;">Unit Kerja</th>
                <th style="width: 9%;">Tgl. Usulan</th>
                <th style="width: 10%;">Status</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($data as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ $item->no_tiket }}</td>
                    <td class="text-center cell-break">{{ $item->nip }}</td>
                    <td class="cell-break">{{ $item->nama ?? '-' }}</td>
                    <td class="cell-break">{{ $item->layanan->nama_layanan ?? '-' }}</td>
                    <td class="cell-break">{{ $item->nama_ukerja ?? '-' }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d-m-Y') }}</td>
                    <td class="text-center">{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="color: #64748b; padding: 12px;">
                        Tidak ada data usulan layanan pada rentang periode yang dipilih.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- FOOTER CETAK -->
    <table class="footer-table">
        <tr>
            <td width="60%">Dicetak secara elektronik melalui Sistem PILKB</td>
            <td width="40%" style="text-align: right;">{{ now()->translatedFormat('d-m-Y H:i') }} WITA</td>
        </tr>
    </table>

</body>

</html>