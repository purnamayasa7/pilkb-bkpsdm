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
        <tr>
            <th>Tanggal</th>
            <th>Username</th>
            <th>Nama</th>
            <th>Module</th>
            <th>Action</th>
            <th>Description</th>
            <th>URL</th>
            <th>Method</th>
            <th>IP Address</th>
        </tr>
    </thead>

    <tbody>
        @foreach($data as $log)
        <tr>
            <td>{{ $log->created_at }}</td>
            <td>{{ $log->user->username ?? '-' }}</td>
            <td>{{ $log->user->nama ?? '-' }}</td>
            <td>{{ $log->module }}</td>
            <td>{{ $log->action }}</td>
            <td>{{ $log->description }}</td>
            <td>{{ $log->url }}</td>
            <td>{{ $log->method }}</td>
            <td>{{ $log->ip_address }}</td>
        </tr>
        @endforeach
    </tbody>
</table>