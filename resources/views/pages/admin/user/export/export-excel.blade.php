    <table>
        <thead>
            <tr>
                <th colspan="5" style="text-align:center; font-weight:bold;">
                    LAPORAN DATA PENGGUNA PILKB
                </th>
            </tr>
            <tr></tr>
            <tr>
                <th>No</th>
                <th>Username</th>
                <th>Nama</th>
                <th>Bidang</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($data as $item)
            <tr>
                <td class="text-center">{{ $loop->iteration }}</td>
                <td>'{{ $item->username }}</td>
                <td>{{ $item->nama }}</td>
                <td>{{ $item->nama_bidang }}</td>
                <td>{{ $item->role->nama_role ?? '-' }}</td>
                <td>{{ $item->email ?? '-' }}</td>
                <td>{{ $item->aktif == 1 ? 'Aktif' : 'Tidak Aktif' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>