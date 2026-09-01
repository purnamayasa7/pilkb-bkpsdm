<table>
    <thead>
        <tr>
            <th colspan="8" style="text-align:center; font-weight:bold; font-size: 14px;">
                LAPORAN PERMINTAAN LAYANAN KEPEGAWAIAN
            </th>
        </tr>
        @if($bidang)
        <tr>
            <th colspan="8" style="text-align:center; font-weight:bold;">
                Bidang: {{ $bidang->nama_bidang }}
            </th>
        </tr>
        @endif
        @if($start && $end)
        <tr>
            <th colspan="8" style="text-align:center;">
                Periode: {{ \Carbon\Carbon::parse($start)->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($end)->translatedFormat('d F Y') }}
            </th>
        </tr>
        @endif
        <tr></tr>
        <tr>
            <th>No</th>
            <th>No. Tiket</th>
            <th>NIP</th>
            <th>Nama Pegawai</th>
            <th>Unit Kerja</th>
            <th>Layanan</th>
            <th>Tanggal Masuk</th>
            <th>Status Terakhir</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($data as $item)
        <tr>
            <td style="text-align:center;">{{ $loop->iteration }}</td>
            <td style="text-align:center;">'{{ $item->no_tiket }}</td>
            <td style="text-align:center;">'{{ $item->nip }}</td>
            <td>{{ $item->nama ?? '-' }}</td>
            <td>{{ $item->nama_ukerja ?? '-' }}</td>
            <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
            <td style="text-align:center;">{{ \Carbon\Carbon::parse($item->tanggal)->translatedFormat('d-m-Y H:i') }}</td>
            <td style="text-align:center;">{{ $item->tahapTerakhir->statusRel->status ?? '-' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
