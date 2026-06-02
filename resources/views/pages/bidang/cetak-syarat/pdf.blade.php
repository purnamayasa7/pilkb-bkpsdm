
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Cetak Syarat</title>
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
        SYARAT LAYANAN
    </div>

    <br>

    <div class="mb-3">
        <table class="table-no-border">
            <tr>
                <td width="35"><strong>Bidang</strong></td>
                <td width="5">:</td>
                <td>{{ $bidang->nama_bidang ?? '-' }}</td>
            </tr>
            <tr>
                <td><strong>Layanan</strong></td>
                <td>:</td>
                <td>{{ $layanan->nama_layanan ?? '-' }}</td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th>Syarat</th>
                <th width="8%">Rangkap</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($syarat as $item)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $item->syarat }}</td>
                    <td>{{ $item->rangkap }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>

</html>
