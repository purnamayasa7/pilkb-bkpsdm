<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Laporan-Master-Layanan</title>
    <link rel="stylesheet" href="{{ public_path('css/pdf.css') }}">
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
        <div class="doc-title">LAPORAN MASTER DATA LAYANAN KEPEGAWAIAN</div>
    </div>

    <!-- KARTU INFORMASI -->
    <div class="card-info">
        <table class="data-table">
            <tr>
                <td class="data-label">Kategori Laporan</td>
                <td class="data-sep">:</td>
                <td class="data-val">Seluruh Master Layanan BKPSDM Kab. Buleleng</td>
                <td style="width: 30px;"></td>
                <td class="data-label" style="width: 90px;">Total Layanan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $data->count() }} Layanan Terdaftar</td>
            </tr>
        </table>
    </div>

    <!-- TABEL DATA MASTER LAYANAN -->
    <table class="laporan-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 24%;">Bidang Pengampu</th>
                <th style="width: 26%;">Nama Layanan</th>
                <th style="width: 14%;">Waktu Penyelesaian</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 22%;">Deskripsi Layanan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="cell-break">{{ $item->bidang->nama_bidang ?? '-' }}</td>
                    <td class="cell-break">{{ $item->nama_layanan }}</td>
                    <td class="text-center">{{ $item->waktu_penyelesaian ?? '-' }}</td>
                    <td class="text-center">{{ $item->aktif ? 'Aktif' : 'Nonaktif' }}</td>
                    <td class="cell-break">{{ $item->deskripsi ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="color: #64748b; padding: 12px;">
                        Belum ada data master layanan.
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
