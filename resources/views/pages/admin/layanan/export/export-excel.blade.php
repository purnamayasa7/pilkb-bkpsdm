    <table>
        <thead>
            <tr>
                <th colspan="5" style="text-align:center; font-weight:bold;">
                    LAPORAN LIST LAYANAN
                </th>
            </tr>
            <tr></tr>
            <tr>
                <th>No</th>
                <th>Nama Bidang</th>
                <th>Nama Layanan</th>
                <th>Rangkap</th>
                <th>Waktu Penyelesaian</th>
                <th>Status</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($data as $item)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $item->bidang->nama_bidang }}</td>
                <td>{{ $item->nama_layanan }}</td>
                <td>{{ $item->rangkap }}</td>
                <td>{{ $item->waktu_penyelesaian }}</td>
                <td>
                    @if ($item->aktif === 1)
                    <span>Aktif</span>
                    @elseif ($item->aktif === 0)
                    <span>Tidak Aktif</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>