<table>
    <thead>
        <tr>
            <th colspan="7" style="text-align:center; font-weight:bold;">
                LAPORAN PERBAIKAN USULAN
            </th>
        </tr>
        <tr></tr>
        <tr>
            <th>No</th>
            <th>Diperbaiki</th>
            <th>No Tiket</th>
            <th>NIP</th>
            <th>Nama</th>
            <th>Layanan</th>
            <th>Syarat BTL</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($data as $d)
        <tr>
            <td>{{ $loop->iteration }}</td>
            <td>{{ $d->is_belum ? 'Belum' : 'Sudah' }}</td>
            <td>{{ $d->no_tiket }}</td>
            <td>'{{ $d->nip }}</td>
            <td>{{ $pegawaiList[$d->nip]['nama_lengkap'] ?? '-' }}</td>
            <td>{{ $d->layanan->nama_layanan ?? '-' }}</td>
            <td>{{ $d->jumlah_btl }}</td>
        </tr>
        @endforeach
    </tbody>
</table>