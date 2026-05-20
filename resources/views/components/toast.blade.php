@if (session('success') || session('error') || session('warning'))
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">

        {{-- SUCCESS --}}
        @if (session('success'))
            <div class="toast" role="alert" style="opacity: 1;">
                <div class="toast-header text-success">
                    <i data-feather="check-circle" class="me-2"></i>

                    <strong class="me-auto">Sukses</strong>

                    <button class="btn-close ms-2 mb-1" type="button" data-bs-dismiss="toast">
                    </button>
                </div>

                <div class="toast-body">
                    {{ session('success') }}
                </div>
            </div>
        @endif

        {{-- SUCCESS --}}
        {{-- @if (session('success'))
            <div class="toast" role="alert">
                <div class="toast-header bg-success text-white">
                    <i data-feather="check-circle" class="me-2"></i>
                    <strong class="me-auto">Sukses</strong>
                    <button class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    {{ session('success') }}
                </div>
            </div>
        @endif --}}

        {{-- ERROR --}}
        @if (session('error'))
            <div class="toast" role="alert" style="opacity: 1;">
                <div class="toast-header text-danger">
                    <i data-feather="x-circle" class="me-2"></i>

                    <strong class="me-auto">Error</strong>

                    <button class="btn-close ms-2 mb-1" type="button" data-bs-dismiss="toast">
                    </button>
                </div>

                <div class="toast-body">
                    {{ session('error') }}
                </div>
            </div>
        @endif

        {{-- WARNING --}}
        @if (session('warning'))
            <div class="toast" role="alert" style="opacity: 1;">
                <div class="toast-header text-danger">
                    <i data-feather="alert-circle" class="me-2"></i>

                    <strong class="me-auto">Warning</strong>

                    <button class="btn-close ms-2 mb-1" type="button" data-bs-dismiss="toast">
                    </button>
                </div>

                <div class="toast-body">
                    {{ session('warning') }}
                </div>
            </div>
        @endif
    </div>
@endif
