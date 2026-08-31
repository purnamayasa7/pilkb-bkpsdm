<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <title>Syarat-{{ \Illuminate\Support\Str::slug($layanan->nama_layanan ?? 'Layanan') }}</title>
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
        <div class="doc-title">DAFTAR PERSYARATAN LAYANAN KEPEGAWAIAN</div>
    </div>

    <!-- KARTU INFORMASI LAYANAN -->
    <div class="card-info">
        <div class="card-header-title">Informasi Layanan Kepegawaian</div>
        <table class="data-table">
            <tr>
                <td class="data-label">Bidang Pengampu</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $bidang->nama_bidang ?? '-' }}</td>
            </tr>
            <tr>
                <td class="data-label">Nama Layanan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $layanan->nama_layanan ?? '-' }}</td>
            </tr>
            <tr>
                <td class="data-label">Total Persyaratan</td>
                <td class="data-sep">:</td>
                <td class="data-val">{{ $syarat->count() }} Dokumen Syarat</td>
            </tr>
        </table>
    </div>

    <!-- TABEL SYARAT LAYANAN -->
    <div class="section-header">Rincian Dokumen Persyaratan</div>

    <table class="syarat-table">
        <thead>
            <tr>
                <th style="width: 6%;">No</th>
                <th style="width: 94%;">Dokumen Persyaratan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($syarat as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td class="syarat-name">{{ $item->syarat }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="2" class="text-center" style="color: #64748b; padding: 10px;">
                        Tidak ada data dokumen persyaratan untuk layanan ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- CATATAN PENTING -->
    <div class="notice-box">
        <div class="notice-title">Catatan &amp; Petunjuk Pengajuan:</div>
        <ol class="notice-list">
            <li>Pastikan seluruh berkas persyaratan di atas disiapkan dengan lengkap (*dokumen asli atau salinan legalisir*).</li>
            <li>Pengajuan usulan layanan kepegawaian dapat diproses secara online melalui portal Sistem PILKB BKPSDM.</li>
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
