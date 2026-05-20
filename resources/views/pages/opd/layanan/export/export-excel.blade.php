<table>
    <thead>
        <tr>
            <th colspan="5" style="text-align:center; font-weight:bold;">
                LAPORAN PROSES PENGAJUAN
            </th>
        </tr>
        <tr>
            <th colspan="5" style="text-align:center;">
                Bulan {{ \Carbon\Carbon::create()->month((int) $month)->translatedFormat('F') }} {{ $year }}
            </th>
        </tr>
        <tr></tr>
        <tr>
            <th>No Tiket</th>
            <th>NIP</th>
            <th>Layanan</th>
            <th>Tanggal</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($data as $d)
            <tr>
                <td>{{ $d->no_tiket }}</td>
                <td>'{{ $d->nip }}</td>
                <td>{{ $d->layanan->nama_layanan ?? '-' }}</td>
                <td>{{ $d->tanggal }}</td>
                <td>{{ $d->tahapTerakhir->statusRel->status ?? '-' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>