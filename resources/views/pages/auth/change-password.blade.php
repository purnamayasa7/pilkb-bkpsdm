<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ganti Password</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.29.0/feather.min.js"></script>
</head>

<body class="bg-light">
    <div class="modal fade" id="successModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">

                <div class="modal-body text-center p-5">

                    <div class="mb-4">
                        <i data-feather="check-circle" class="text-success" style="width: 70px; height: 70px;"></i>
                    </div>

                    <h4 class="fw-bold mb-2">
                        Password Berhasil Diganti!
                    </h4>

                    <p class="text-muted">
                        Silahkan lanjut masuk ke sistem.
                    </p>

                    <a href="{{ route('dashboard') }}"
                        class="btn btn-primary px-4">
                        <i data-feather="log-in" class="me-1"></i> Masuk ke Sistem
                    </a>

                </div>

            </div>
        </div>
    </div>

    <div class="container">

        <div class="row justify-content-center align-items-center min-vh-100">

            <div class="col-md-5">

                <div class="card border-0 shadow-lg rounded-4">

                    <div class="card-body p-5">

                        <div class="text-center mb-4">
                            <h3 class="fw-bold text-primary">
                                Ganti Password
                            </h3>

                            <p class="text-muted small">
                                Demi keamanan akun, Anda wajib mengganti password sebelum menggunakan sistem.
                            </p>
                        </div>

                        <form id="formPassword" method="POST" action="{{ route('password.update') }}">
                            @csrf

                            {{-- Password Lama --}}
                            <div class="mb-3">
                                <label class="form-label">Password Sekarang</label>

                                <input type="password"
                                    name="current_password"
                                    class="form-control @error('current_password') is-invalid @enderror" required>

                                @error('current_password')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            {{-- Password Baru --}}
                            <div class="mb-3">
                                <label class="form-label">Password Baru</label>

                                <input type="password"
                                    name="password"
                                    class="form-control @error('password') is-invalid @enderror" required>

                                @error('password')
                                <div class="invalid-feedback">
                                    {{ $message }}
                                </div>
                                @enderror
                            </div>

                            {{-- Konfirmasi --}}
                            <div class="mb-4">
                                <label class="form-label">Konfirmasi Password</label>

                                <input type="password"
                                    name="password_confirmation"
                                    class="form-control" required>
                            </div>

                            <div class="d-grid gap-2">

                                <button type="submit" class="btn btn-primary" id="btnSubmitPassword">
                                    <span class="btn-text">
                                        <i data-feather="key" class="me-1"></i> Ganti Password
                                    </span>
                                    <span class="btn-loading d-none">
                                        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Menyimpan...
                                    </span>
                                </button>

                            </div>

                        </form>

                        {{-- Batal --}}
                        <form method="POST"
                            action="{{ route('logout') }}"
                            class="mt-3">

                            @csrf

                            <div class="d-grid">
                                <button class="btn btn-light border" type="submit">
                                    <i data-feather="log-out" class="me-1"></i> Batal & Logout
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            feather.replace();

            const formPassword = document.getElementById('formPassword');
            const btnSubmitPassword = document.getElementById('btnSubmitPassword');

            formPassword.addEventListener('submit', function() {
                btnSubmitPassword.disabled = true;
                btnSubmitPassword.querySelector('.btn-text')?.classList.add('d-none');
                btnSubmitPassword.querySelector('.btn-loading')?.classList.remove('d-none');
            });
        });
    </script>
    @if(session('password_changed'))
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            let modal = new bootstrap.Modal(
                document.getElementById('successModal')
            );
            modal.show();
        });
    </script>
    @endif

</body>
</html>