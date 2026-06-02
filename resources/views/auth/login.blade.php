<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="PILKB">
    <title>PILKB</title>

    {{-- <link rel="stylesheet" href="{{ asset('resources/css/login.css') }}"> --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
</head>

<body>
    <div class="card login-card border-0">
        <div class="row g-0">

            <!-- LEFT -->
            <div class="col-md-6 left-box">
                <div class="left-content">

                    <!-- HEADER -->
                    <div class="d-flex align-items-center mb-3">
                        <img src="{{ asset('images/KabBuleleng.png') }}" class="logo me-3">
                        <div>
                            <h6 class="mb-0 fw-semibold text-uppercase small; brand-text">
                                BKPSDM Kabupaten Buleleng
                            </h6>
                            <small class="opacity-75">Sistem Layanan Kepegawaian</small>
                        </div>
                    </div>

                    <!-- TITLE -->
                    <h1 class="fw-bold display-6 mb-2">PILKB</h1>

                    <!-- ACCENT LINE -->
                    <div class="accent-line mb-2"></div>

                    <!-- TAGLINE -->
                    <p class="lead mb-3">Pusat Informasi Layanan Kepegawaian BKPSDM Buleleng</p>

                    {{-- <div class="badge bg-light text-dark px-3 py-2 rounded-pill">
                        Versi 2.0
                    </div> --}}

                </div>
            </div>

            <!-- RIGHT -->
            <div class="col-md-6 right-box">
                <div class="slider-wrapper">
                    <div class="form-slider" id="formSlider">

                        <!-- LOGIN -->
                        <div class="form-slide">
                            <div class="form-content">
                                <h4 class="text-primary fw-bold">Login</h4>
                                <p class="text-muted mb-4">Masukkan akun anda</p>

                                <form id="formLogin" class="user" method="POST" action="{{ route('login') }}">
                                    @csrf
                                    <div class="form-floating mb-3">
                                        <input type="text" id="username" name="username"
                                            class="form-control @error('username') is-invalid
                                        @enderror"
                                            value="{{ old('username') }}" placeholder="Username" required autofocus>
                                        @error('username')
                                            <div class="invalid-feedback">
                                                {{ $message }}
                                            </div>
                                        @enderror
                                        <label>NIP</label>
                                    </div>

                                    <div class="form-floating mb-3 position-relative">
                                        <input type="password" id="password" name="password" class="form-control pe-5"
                                            placeholder="Password" required>
                                        <label>Password</label>

                                        <!-- ICON MATA -->
                                        <i class="bi bi-eye toggle-password" onclick="togglePassword()"></i>
                                    </div>

                                    <button type="submit" class="btn btn-primary w-100 btn-login mb-3">
                                        LOGIN
                                    </button>

                                    <button type="button" onclick="showRegister()"
                                        class="btn btn-light border border-primary text-primary w-100 btn-login mb-3">

                                        <span>Cek Tiket & Lainnya</span>
                                        <i class="bi bi-arrow-right"></i>

                                    </button>

                                    {{-- <p class="text-center small">
                                        Belum punya akun?
                                        <a href="javascript:void(0)" onclick="showRegister()">Daftar</a>
                                    </p> --}}
                                </form>
                            </div>
                        </div>

                        <!-- REGISTER -->
                        <div class="form-slide">
                            <div class="form-content">
                                <h4 class="text-primary fw-bold">Cek Tiket</h4>

                                <form action="{{ route('tiket.cek') }}" method="POST">
                                    @csrf
                                    
                                    <div class="form-floating mb-3">
                                        <input type="text" name="no_tiket" class="form-control" placeholder="Nama">
                                        <label>Masukkan No Tiket</label>
                                    </div>

                                    <button class="btn btn-primary w-100 btn-login mb-3">
                                        Cek Tiket
                                    </button>

                                    <button
                                        class="btn btn-light border border-primary text-primary w-100 btn-login mb-3">
                                        Tanya Jawab (FaQ)
                                    </button>

                                    <button
                                        class="btn btn-light border border-primary text-primary w-100 btn-login mb-3">
                                        Lihat Syarat Layanan
                                    </button>

                                    <p class="text-center small">
                                        <i class="bi bi-arrow-left"></i>
                                        Kembali ke
                                        <a href="javascript:void(0)" onclick="showLogin()">Login</a>
                                    </p>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>

    <script>
        function showRegister() {
            document.getElementById('formSlider').classList.add('active');
        }

        function showLogin() {
            document.getElementById('formSlider').classList.remove('active');
        }

        function togglePassword() {
            const input = document.getElementById('password');
            const icon = document.querySelector('.toggle-password');

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                input.type = "password";
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        }
    </script>

</body>

<footer class="footer">
    © 2026 BKPSDM Kabupaten Buleleng
</footer>

</html>
