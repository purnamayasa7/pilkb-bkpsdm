<table>
    <thead>
        <tr>
            <th colspan="8" style="text-align:center; font-weight:bold; font-size: 14px;">
                LAPORAN PERBAIKAN USULAN (BTL)
            </th>
        </tr>
        <tr></tr>
        <tr>
            <th style="font-weight:bold; text-align:center;">No</th>
            <th style="font-weight:bold; text-align:center;">No. Tiket</th>
            <th style="font-weight:bold; text-align:center;">NIP</th>
            <th style="font-weight:bold;">Nama Pegawai</th>
            <th style="font-weight:bold;">Unit Kerja</th>
            <th style="font-weight:bold;">Jenis Layanan</th>
            <th style="font-weight:bold; text-align:center;">Status</th>
            <th style="font-weight:bold; text-align:center;">Jumlah BTL</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($data as $item)
            <tr>
                <td style="text-align:center;">{{ $loop->iteration }}</td>
                <td style="text-align:center;">{{ $item->no_tiket }}</td>
                <td style="text-align:center;">'{{ $item->nip }}</td>
                <td>{{ $item->nama ?? '-' }}</td>
                <td>{{ $item->nama_ukerja ?? '-' }}</td>
                <td>{{ $item->layanan->nama_layanan ?? '-' }}</td>
                <td style="text-align:center;">{{ $item->is_belum ? 'Belum' : 'Sudah' }}</td>
                <td style="text-align:center;">{{ $item->jumlah_btl }} Dokumen</td>
            </tr>
        @empty
            <tr>
                <td colspan="8" style="text-align:center; color:#64748b;">Tidak ada data usulan perbaikan (BTL).</td>
            </tr>
        @endforelse
    </tbody>
</table>
