<!DOCTYPE html>
<html>

<head>

    <meta charset="utf-8">
    <title>Laporan Permintaan Layanan</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
        }

        .header {
            text-align: center;
        }

        .header img {
            width: 60px;
        }

        .title-header {
            font-size: 14px;
        }

        .title {
            font-weight: bold;
            text-align: center;
            margin-top: 12px;
            text-decoration: underline;
        }

        .header-table {
            width: 100%;
            margin-bottom: 20px;
        }

        .header-table td {
            vertical-align: top;
        }

        .text-center {
            text-align: center;
        }

        .mb-3 {
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        table,
        th,
        td {
            border: 1px solid #000;
        }

        th,
        td {
            padding: 6px;
        }

        .table-no-border,
        .table-no-border td {
            border: none !important;
        }
    </style>
</head>

<body>
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
                    <div>Alamat: Jalan Laksamana (LC) Baktiseraga, Singaraja, Bali</div>
                </td>
            </tr>
        </table>
    </div>

    <hr>

    <div class="title">
        LAPORAN USULAN LAYANAN
    </div>

    <br>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>No Tiket</th>
                <th>NIP</th>
                <th>Nama</th>
                <th>Layanan</th>
                <th>Unit Kerja</th>
                <th>Tanggal</th>
                <th>Status</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($data as $item)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $item->no_tiket }}</td>
                <td>{{ $item->regtiket->nip }}</td>
                <td>-</td>
                <td>{{ $item->regtiket->layanan->nama_layanan ?? '-' }}</td>
                <td>{{ $item->regtiket->kode_ukerja}}</td>
                <td>{{ $item->tanggal }}</td>
                <td>{{ $item->statusRel->status ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>