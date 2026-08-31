<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Laporan-Perbaikan-Usulan</title>
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
        <div class="doc-title">LAPORAN PERBAIKAN USULAN (BTL)</div>
    </div>

    <!-- KARTU INFORMASI -->
    <div class="card-info">
        <table class="data-table">
            <tr>
                <td class="data-label">Kategori Laporan</td>
                <td class="data-sep">:</td>
                <td class="data-val">Daftar Usulan Perlu Perbaikan Berkas (BTL)</td>
                <td style="width: 30px;"></td>
                <td class="data-label" style="width: 80px;">Total Usulan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $data->count() }} Usulan</td>
            </tr>
        </table>
    </div>

    <!-- TABEL DATA LAPORAN -->
    <table class="laporan-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 12%;">No. Tiket</th>
                <th style="width: 22%;">Pegawai (NIP &amp; Nama)</th>
                <th style="width: 20%;">Unit Kerja</th>
                <th style="width: 22%;">Jenis Layanan</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 10%;">Jumlah BTL</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ $item->no_tiket }}</td>
                    <td class="cell-break">
                        <div class="pegawai-nip">{{ $item->nip }}</div>
                        <div class="pegawai-nama">{{ $pegawaiList[$item->nip]['nama_lengkap'] ?? '-' }}</div>
                    </td>
                    <td class="cell-break">{{ $pegawaiList[$item->nip]['ket_ukerja'] ?? '-' }}</td>
                    <td class="cell-break">{{ $item->layanan->nama_layanan ?? '-' }}</td>
                    <td class="text-center">{{ $item->is_belum ? 'Belum' : 'Sudah' }}</td>
                    <td class="text-center">{{ $item->jumlah_btl }} Dokumen</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center" style="color: #64748b; padding: 12px;">
                        Tidak ada data usulan perbaikan (BTL).
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