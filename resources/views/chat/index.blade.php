@extends('layouts.app')

@section('content')

<div class="container py-3">

    <h5>Daftar Chat</h5>

    @foreach($conversations as $conv)

    @php
    $participant = $conv->participants
    ->where('user_id', auth()->id())
    ->first();

    $lastRead = $participant->last_read_message_id ?? 0;

    $unread = $conv->messages
    ->where('id', '>', $lastRead)
    ->count();
    @endphp

    <a href="{{ route('chat.show', $conv->id) }}" class="text-decoration-none">

        <div class="card mb-2 p-2">

            <div class="d-flex justify-content-between">

                <div>
                    <strong>{{ $conv->no_tiket }}</strong>
                </div>

                @if($unread > 0)
                <span class="badge bg-danger">
                    {{ $unread }}
                </span>
                @endif

            </div>

        </div>

    </a>

    @endforeach

</div>

@endsection