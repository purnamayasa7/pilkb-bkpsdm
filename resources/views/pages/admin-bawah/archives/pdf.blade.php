<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Laporan-Arsip-Usulan</title>
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
        <div class="doc-title">LAPORAN ARSIP USULAN LAYANAN</div>
    </div>

    <!-- KARTU INFORMASI PERIODE & REKAPITULASI -->
    <div class="card-info">
        <table class="data-table">
            <tr>
                <td class="data-label">Periode Arsip</td>
                <td class="data-sep">:</td>
                <td class="data-val">
                    @if($tanggal_awal && $tanggal_akhir)
                        {{ \Carbon\Carbon::parse($tanggal_awal)->translatedFormat('d F Y') }}
                        s/d
                        {{ \Carbon\Carbon::parse($tanggal_akhir)->translatedFormat('d F Y') }}
                    @elseif($tanggal_awal)
                        Mulai {{ \Carbon\Carbon::parse($tanggal_awal)->translatedFormat('d F Y') }}
                    @elseif($tanggal_akhir)
                        Sampai {{ \Carbon\Carbon::parse($tanggal_akhir)->translatedFormat('d F Y') }}
                    @else
                        Semua Periode Arsip
                    @endif
                </td>
                <td style="width: 30px;"></td>
                <td class="data-label" style="width: 80px;">Total Arsip</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $data->count() }} Dokumen</td>
            </tr>
        </table>
    </div>

    <!-- TABEL DATA LAPORAN ARSIP -->
    <table class="laporan-table">
        <thead>
            <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 12%;">No. Tiket</th>
                <th style="width: 20%;">Pegawai (NIP &amp; Nama)</th>
                <th style="width: 18%;">Unit Kerja</th>
                <th style="width: 18%;">Jenis Layanan</th>
                <th style="width: 10%;">Tanggal Masuk</th>
                <th style="width: 9%;">Status</th>
                <th style="width: 9%;">Petugas Arsip</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="text-center">{{ $item->no_tiket }}</td>
                    <td class="cell-break">
                        <div class="pegawai-nip">{{ $item->nip }}</div>
                        <div class="pegawai-nama">{{ $pegawaiList[$item->nip]['nama_lengkap'] ?? ($item->nama ?? '-') }}</div>
                    </td>
                    <td class="cell-break">{{ $pegawaiList[$item->nip]['ket_ukerja'] ?? ($item->nama_ukerja ?? '-') }}</td>
                    <td class="cell-break">{{ $item->layanan->nama_layanan ?? '-' }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d-m-Y') }}</td>
                    <td class="text-center">{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
                    <td class="text-center">{{ $item->operatorArchives->nama ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center" style="color: #64748b; padding: 12px;">
                        Tidak ada data arsip usulan pada periode yang dipilih.
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