@extends('layouts.app')

@section('content')
<header class="page-header page-header-compact page-header-light border-bottom bg-white mb-4">
    <div class="container-fluid px-4">
        <div class="page-header-content">
            <div class="row align-items-center justify-content-between pt-3">
                <div class="col-auto mb-3">
                    <h1 class="page-header-title">
                        <div class="page-header-icon"><i data-feather="bell"></i></div>
                        Notifikasi
                    </h1>
                </div>
                <div class="col-auto mb-3 d-flex gap-2">
                    <form action="{{ route('notifications.readAll') }}"
                        method="POST">
                        @csrf

                        <button type="submit"
                            class="btn btn-sm btn-light text-primary">
                            <i class="me-1" data-feather="check"></i>
                            Tandai Semua Dibaca
                        </button>
                    </form>

                    <form action="{{ route('notifications.deleteAll') }}"
                        method="POST"
                        onsubmit="return confirm('Hapus semua notifikasi?')">
                        @csrf
                        <button type="submit"
                            class="btn btn-sm btn-light text-danger">
                            <i class="me-1" data-feather="trash"></i>
                            Hapus Semua
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</header>

<div class="container-xl px-4 mt-4">

    <div class="card">

        <div class="card-header bg-gradient-primary-to-secondary text-white">
            Semua Notifikasi
        </div>

        <div class="card-body"

            style="max-height:700px; overflow-y:auto;">

            <div class="small mb-3">
                <i data-feather="clock" class="me-1"></i>
                Notifikasi akan dihapus otomatis setelah 90 hari.
            </div>

            @foreach($notifications as $notification)

            <a href="{{ route('notifications.read', $notification->id) }}"
                class="d-block text-decoration-none text-dark p-3 rounded mb-2 border">

                <div class="d-flex justify-content-between">

                    <strong
                        class="{{ is_null($notification->read_at) ? 'fw-bold' : 'fw-normal' }}">
                        {{ $notification->data['title'] }}
                    </strong>

                    @if(is_null($notification->read_at))
                    <span class="badge bg-red-soft text-danger border d-inline-flex align-items-center">Baru</span>
                    @endif

                </div>

                <div class="small text-muted mt-1">
                    {{ $notification->data['message'] }}
                </div>

                <div class="small text-muted mt-2">
                    {{ $notification->created_at->diffForHumans() }}
                </div>

            </a>

            <hr>

            @endforeach

            {{ $notifications->links() }}

        </div>

    </div>

</div>

@endsection