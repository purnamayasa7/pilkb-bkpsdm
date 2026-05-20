<table>
    <tr>
        <td colspan="7" style="text-align: center;">
            PEMERINTAH KABUPATEN BULELENG
        </td>
    </tr>
    <tr>
        <td colspan="7" style="text-align: center; font-weight: bold;">
            BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA
        </td>
    </tr>
    <tr>
        <td colspan="7" style="text-align: center;">
            Laporan Permintaan Layanan
        </td>
    </tr>

    <tr>
        <td colspan="7" style="text-align: right;">
            Periode:
            {{ \Carbon\Carbon::parse(request('start_date'))->format('d-m-Y') }}
            s/d
            {{ \Carbon\Carbon::parse(request('end_date'))->format('d-m-Y') }}
        </td>
    </tr>

    <tr>
        <td colspan="7"></td>
    </tr> {{-- spasi --}}

    <thead>
        <tr style="font-weight: bold;">
            <th>No</th>
            <th>No Tiket</th>
            <th>NIP</th>
            <th>Nama</th>
            <th>Layanan</th>
            <th>Tanggal</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        @foreach ($data as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $item->no_tiket }}</td>
                <td>'{{ $item->regtiket->nip ?? '-' }}</td>
                <td>-</td>
                <td>{{ $item->regtiket->layanan->nama_layanan ?? '-' }}</td>
                <td>{{ $item->tanggal }}</td>
                <td>{{ $item->statusRel->status ?? '-' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
