<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Tiket-{{ $tiket->no_tiket }}</title>
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
        <div class="doc-title">BUKTI PENDAFTARAN &amp; TIKET USULAN LAYANAN</div>
    </div>

    <!-- 2 KOLOM KARTU: DATA DIRI & TIKET QR (SAMA TINGGI & SIMETRIS) -->
    <table class="info-layout-table">
        <tr>
            <!-- KARTU DATA PEMOHON (KIRI) -->
            <td width="64%" class="card-box card-left">
                <div class="card-header-title">Informasi Pegawai &amp; Layanan</div>
                <table class="data-table">
                    <tr>
                        <td class="data-label">NIP</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $tiket->nip }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Nama</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $data['nama'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Golongan</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $data['ket_gol'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Unit Kerja</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $data['unit'] ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Layanan</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ $tiket->layanan->nama_layanan ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="data-label">Tgl. Pengajuan</td>
                        <td class="data-sep">:</td>
                        <td class="data-val">{{ \Carbon\Carbon::parse($tiket->tanggal)->translatedFormat('d-m-Y') }}</td>
                    </tr>
                </table>
            </td>

            <!-- SPACER KOLOM -->
            <td width="2%"></td>

            <!-- KARTU NOMOR TIKET & QR (KANAN) -->
            <td width="34%" class="card-box card-right">
                <div class="ticket-box">
                    <div class="ticket-label">Nomor Tiket</div>
                    <div class="ticket-number">{{ $tiket->no_tiket }}</div>
                </div>

                <div class="qr-wrapper">
                    <img src="data:image/svg+xml;base64,{{ $qr }}" width="90" height="90">
                </div>
            </td>
        </tr>
    </table>

    <!-- TABEL SYARAT LAYANAN -->
    <div class="section-header">Kelengkapan Syarat Dokumen</div>

    <table class="syarat-table">
        <thead>
            <tr>
                <th style="width: 6%;">No</th>
                <th style="width: 62%;">Dokumen Syarat Layanan</th>
                <th style="width: 14%;">E-File</th>
                <th style="width: 18%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($syarat as $i => $s)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td class="syarat-name">{{ $s->syarat->syarat ?? ($s->syarat ?? '-') }}</td>
                    <td class="text-center">
                        <span class="badge-efile">Ada</span>
                    </td>
                    <td class="text-center">
                        @if ($s->status == 1)
                            <span class="badge-status-valid">Valid</span>
                        @elseif ($s->status == 2)
                            <span class="badge-status-invalid">Tidak Valid</span>
                        @else
                            <span class="badge-status-pending">Sedang Verifikasi</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center" style="color: #64748b; padding: 10px;">
                        Tidak ada data dokumen syarat.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- CATATAN PENTING -->
    <div class="notice-box">
        <div class="notice-title">Catatan:</div>
        <ol class="notice-list">
            <li>Simpan lembar bukti pendaftaran tiket ini sebagai tanda bukti pengajuan layanan kepegawaian.</li>
            <li>Perkembangan proses verifikasi berkas dan tindak lanjut layanan dapat dipantau melalui QR Code di atas.</li>
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