<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Tiket</title>

    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
        }

        .title {
            text-align: center;
            margin-bottom: 15px;
        }

        .header-table {
            width: 100%;
            margin-bottom: 20px;
        }

        .header-table td {
            vertical-align: top;
        }

        .no-tiket {
            font-size: 18px;
            font-weight: bold;
            border: 2px dashed #000;
            padding: 8px;
            text-align: center;
            margin-bottom: 10px;
        }

        .section {
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        table,
        th,
        td {
            border: 1px solid #c2c6cc;
        }

        th,
        td {
            padding: 6px;
        }

        .no-border td {
            border: none;
            padding: 3px;
        }

        .text-center {
            text-align: center;
        }
    </style>
</head>

<body>

    <div class="title">
        <h3>DETAIL TIKET LAYANAN</h3>
    </div>

    <table class="header-table">
        <tr>
            <td width="65%">
                <strong>Data Diri</strong>
                <table class="">
                    <tr>
                        <td width="30%">NIP</td>
                        <td>: {{ $tiket->nip }}</td>
                    </tr>
                    <tr>
                        <td>Nama</td>
                        <td>: {{ $data['nama'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Golongan</td>
                        <td>: {{ $data['ket_gol'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Unit</td>
                        <td>: {{ $data['unit'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Layanan</td>
                        <td>: {{ $tiket->layanan->nama_layanan ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Tanggal</td>
                        <td>: {{ $tiket->tanggal }}</td>
                    </tr>
                </table>
            </td>

            <td width="35%" class="text-center">
                <div class="">
                    No Tiket
                </div>

                <div class="no-tiket">
                    {{ $tiket->no_tiket }}
                </div>

                <img src="data:image/svg+xml;base64,{{ $qr }}" width="120">
            </td>
        </tr>
    </table>

    <div class="section">
        <strong>Syarat Layanan</strong>

        <table>
            <thead>
                <tr>
                    <th width="50">No</th>
                    <th>Syarat</th>
                    <th>E-File</th>
                    <th width="50">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($syarat as $i => $s)
                    <tr>
                        <td class="text-center">{{ $i + 1 }}</td>
                        <td>{{ $s->syarat }}</td>
                        <td class="text-center">Belum Ada</td>
                        <td class="text-center">Sudah Diverifikasi</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

</body>

</html>