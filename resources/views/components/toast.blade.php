@if (
session()->has('success') ||
session()->has('error') ||
session()->has('warning') ||
$errors->any() ||
(isset($simpegAvailable) && !$simpegAvailable)
)

<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">

    {{-- SUCCESS --}}
    @if (session('success'))
    <div class="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-bs-delay="5000">

        <div class="toast-header text-success">
            <i data-feather="check-circle" class="me-2"></i>

            <strong class="me-auto">Sukses</strong>

            <button
                class="btn-close"
                type="button"
                data-bs-dismiss="toast">
            </button>
        </div>

        <div class="toast-body">
            {{ session('success') }}
        </div>
    </div>
    @endif


    {{-- ERROR --}}
    @if (session('error'))
    <div class="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-bs-delay="5000">

        <div class="toast-header text-danger">
            <i data-feather="x-circle" class="me-2"></i>

            <strong class="me-auto">Error</strong>

            <button
                class="btn-close"
                type="button"
                data-bs-dismiss="toast">
            </button>
        </div>

        <div class="toast-body">
            {{ session('error') }}
        </div>
    </div>
    @endif

    {{-- VALIDATION ERROR --}}
    @if ($errors->any())
    <div class="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-bs-delay="7000">

        <div class="toast-header text-danger">
            <i data-feather="alert-circle" class="me-2"></i>

            <strong class="me-auto">
                Validasi Gagal
            </strong>

            <button
                class="btn-close"
                type="button"
                data-bs-dismiss="toast">
            </button>
        </div>

        <div class="toast-body">

            @foreach ($errors->all() as $error)
            <div class="mb-1">
                • {{ $error }}
            </div>
            @endforeach

        </div>
    </div>
    @endif

    {{-- WARNING --}}
    @if (session('warning'))
    <div class="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-bs-delay="5000">

        <div class="toast-header text-warning">
            <i data-feather="alert-circle" class="me-2"></i>

            <strong class="me-auto">Warning</strong>

            <button
                class="btn-close"
                type="button"
                data-bs-dismiss="toast">
            </button>
        </div>

        <div class="toast-body">
            {{ session('warning') }}
        </div>
    </div>
    @endif


    {{-- SIMPEG OFFLINE --}}
    @if (isset($simpegAvailable) && !$simpegAvailable)
    <div class="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-bs-delay="7000">

        <div class="toast-header text-warning">
            <i data-feather="alert-triangle" class="me-2"></i>

            <strong class="me-auto">
                SIMPEG Offline
            </strong>

            <button
                class="btn-close"
                type="button"
                data-bs-dismiss="toast">
            </button>
        </div>

        <div class="toast-body">
            Data nama pegawai dan unit kerja dari SIMPEG sedang tidak dapat diambil.
            Data tiket tetap dapat digunakan.
        </div>
    </div>
    @endif

</div>

@endif