<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan Master Data Layanan</title>

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

        .text-center {
            text-align: center;
        }

        .mb-3 {
            margin-bottom: 15px;
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
                <td class="title-header"
                    style="border:none; text-align:center; line-height:1.5;">
                    <div>
                        <strong>PEMERINTAH KABUPATEN BULELENG</strong>
                    </div>

                    <div>
                        <strong>
                            BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA
                        </strong>
                    </div>

                    <div>
                        Alamat: Jalan Laksamana (LC) Baktiseraga, Singaraja, Bali
                    </div>
                </td>

            </tr>
        </table>
    </div>

    <hr>

    <div class="title">
        MASTER DATA LAYANAN
    </div>

    <br>

    <div class="mb-3">
        <table class="table-no-border">

            <tr>
                <td width="80">
                    <strong>Bidang</strong>
                </td>

                <td width="5">:</td>

                <td>
                    {{ $bidang->nama_bidang ?? '-' }}
                </td>
            </tr>

            <tr>
                <td>
                    <strong>Jumlah Layanan</strong>
                </td>

                <td>:</td>

                <td>
                    {{ $layanan->count() }} layanan
                </td>
            </tr>

        </table>
    </div>

    <table>

        <thead>
            <tr>
                <th width="6%">No</th>
                <th>Nama Layanan</th>
                <th width="18%">Waktu Penyelesaian</th>
                <th width="12%">Status</th>
                <th>Deskripsi</th>
            </tr>
        </thead>

        <tbody>

            @forelse ($layanan as $item)

            <tr>

                <td class="text-center">
                    {{ $loop->iteration }}
                </td>

                <td>
                    {{ $item->nama_layanan }}
                </td>

                <td class="text-center">
                    {{ $item->waktu_penyelesaian ?? '-' }}
                </td>

                <td class="text-center">
                    {{ $item->aktif ? 'Aktif' : 'Nonaktif' }}
                </td>

                <td>
                    {{ $item->deskripsi ?? '-' }}
                </td>

            </tr>

            @empty

            <tr>
                <td colspan="5" class="text-center">
                    Belum ada data layanan.
                </td>
            </tr>

            @endforelse

        </tbody>

    </table>

</body>

</html>