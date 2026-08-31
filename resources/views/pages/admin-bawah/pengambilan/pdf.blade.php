<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Laporan-Pengambilan-Dokumen</title>
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
        <div class="doc-title">LAPORAN PENGAMBILAN DOKUMEN LAYANAN</div>
    </div>

    <!-- KARTU INFORMASI PERIODE -->
    <div class="card-info">
        <table class="data-table">
            <tr>
                <td class="data-label">Periode Tahun</td>
                <td class="data-sep">:</td>
                <td class="data-val">Tahun {{ $year }}</td>
                <td style="width: 30px;"></td>
                <td class="data-label" style="width: 110px;">Total Pengambilan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $pengambilan->count() }} Dokumen</td>
            </tr>
        </table>
    </div>

    <!-- TABEL DATA LAPORAN PENGAMBILAN -->
    <table class="laporan-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 12%;">No. Tiket</th>
                <th style="width: 22%;">Pegawai Pemohon (NIP &amp; Nama)</th>
                <th style="width: 20%;">Unit Kerja</th>
                <th style="width: 20%;">Jenis Layanan</th>
                <th style="width: 11%;">Tgl. Pengambilan</th>
                <th style="width: 11%;">Nama Pengambil</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($pengambilan as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ $item->tiket->no_tiket ?? '-' }}</td>
                    <td class="cell-break">
                        <div class="pegawai-nip">{{ $item->tiket->nip ?? '-' }}</div>
                        <div class="pegawai-nama">{{ $pegawaiList[$item->tiket->nip ?? '']['nama_lengkap'] ?? ($item->tiket->nama ?? '-') }}</div>
                    </td>
                    <td class="cell-break">{{ $pegawaiList[$item->tiket->nip ?? '']['ket_ukerja'] ?? ($item->tiket->nama_ukerja ?? '-') }}</td>
                    <td class="cell-break">{{ $item->tiket->layanan->nama_layanan ?? '-' }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->tanggal_pengambilan)->translatedFormat('d-m-Y') }}</td>
                    <td class="cell-break">{{ $item->nama_pengambil ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="color: #64748b; padding: 12px;">
                        Tidak ada data pengambilan dokumen pada tahun {{ $year }}.
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