<!DOCTYPE html>
<html>

<head>
    <title>Cek Tiket</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<style>
    .feather {
        width: 14px;
        height: 14px;
    }
</style>

<body class="bg-light">

    <div class="container mt-4">

        <!-- CARD DATA -->
        <div class="card shadow-sm mb-4">
            <div class="card-body">

                <div class="row">

                    <!-- KIRI -->
                    <div class="col-md-8">

                        <h6 class="fw-bold mb-3">Data Diri</h6>

                        <div class="row mb-2">
                            <div class="col-md-6">
                                <small class="fw-semibold">NIP</small>
                                <div class="form-label">{{ $tiket->nip }}</div>
                            </div>
                            <div class="col-md-6">
                                <small class="fw-semibold">Bidang</small>
                                <div class="form-label">
                                    {{ $tiket->layanan->bidang->nama_bidang ?? '-' }}
                                </div>
                            </div>
                        </div>

                        <div class="row mb-2">
                            <div class="col-md-6">
                                <small class="fw-semibold">Nama</small>
                                <div class="form-label">{{ $data['nama'] ?? '-' }}</div>
                            </div>
                            <div class="col-md-6">
                                <small class="fw-semibold">Nama Layanan</small>
                                <div class="form-label">
                                    {{ $tiket->layanan->nama_layanan ?? '-' }}
                                </div>
                            </div>
                        </div>

                        <div class="row mb-2">
                            <div class="col-md-6">
                                <small class="fw-semibold">Golongan</small>
                                <div class="form-label">{{ $data['golongan'] ?? '-' }}</div>
                            </div>
                            <div class="col-md-6">
                                <small class="fw-semibold">Unit Kerja</small>
                                <div class="form-label">{{ $data['unit'] ?? '-' }}</div>
                            </div>
                        </div>

                    </div>

                    <!-- KANAN -->
                    <div class="col-md-4 text-center border-start">

                        <div class="mb-2">
                            <small class="fw-semibold">No Tiket</small>
                            <div class="fw-bold text-primary fs-5">
                                {{ $tiket->no_tiket }}
                            </div>
                        </div>

                        <div class="mb-2">
                            <img src="data:image/svg+xml;base64,{{ $qr }}" width="120">
                        </div>

                        <hr class="my-2">

                        <small class="fw-semibold">Tanggal</small>
                        <div class="form-label">
                            {{ \Carbon\Carbon::parse($tiket->tanggal)->format('d M Y') }}
                        </div>

                    </div>

                </div>

            </div>
        </div>

        <!-- SYARAT -->
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Syarat</th>
                            <th>Comment</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($syarat as $i => $s)
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>{{ $s->syarat }}</td>
                                <td>{{ $s->comment ?? '-' }}</td>
                                <td>
                                    @if ($s->status == 1)
                                        <span
                                            class="badge bg-light text-success border d-inline-flex align-items-center">
                                            <i data-feather="check-circle" class="me-1"></i>Valid</span>
                                    @elseif ($s->status == 2)
                                        <span
                                            class="badge bg-light text-danger border d-inline-flex align-items-center">
                                            <i data-feather="x" class="me-1"></i>Tidak Valid</span>
                                    @else
                                        <span class="badge bg-secondary">Belum</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

            </div>
        </div>

        <!-- TAHAP -->
        <div class="card shadow-sm mb-4">
            <div class="card-body">

                <h6 class="fw-bold mb-3">Tahap Tiket</h6>

                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Operator</th>
                            <th>Status</th>
                            <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($tiket->tahap as $t)
                            <tr>
                                <td>{{ $t->tanggal }}</td>
                                <td>{{ $t->operator }}</td>
                                <td>{{ $t->statusRel->status ?? $t->status }}</td>
                                <td>{{ $t->comment }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

            </div>
        </div>

        <!-- BUTTON -->
        <div class="text-end mb-4">
            <a href="{{ route('tiket.cetak', $tiket->no_tiket) }}" target="_blank" class="btn btn-primary">
                <i data-feather="printer" class="me-1"></i>
                Cetak
            </a>
        </div>

    </div>
</body>

<script src="https://unpkg.com/feather-icons"></script>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        feather.replace();
    });
</script>

</html>
