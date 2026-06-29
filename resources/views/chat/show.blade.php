@extends('layouts.app')

@section('content')

<style>
    .chat-bubble {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 12px;
        margin-bottom: 10px;
        display: inline-block;
        clear: both;
        word-break: break-word;
    }

    .chat-right {
        background: #0061f2;
        color: white;
        float: right;
        text-align: right;
    }

    .chat-left {
        background: #e9ecef;
        float: left;
    }
</style>

<div class="container py-3">

    <div class="card" style="height: 80vh; display:flex; flex-direction:column;">

        <!-- HEADER -->
        <div class="card-header">
            <strong>Tiket: {{ $conversation->no_tiket ?? 'Global Chat' }}</strong>
        </div>

        <!-- CHAT BOX -->
        <div id="chat-box"
             style="flex:1; overflow-y:auto; padding:15px; background:#f8f9fa;">
        </div>

        <!-- INPUT -->
        <div class="card-footer">
            <div class="input-group">
                <input type="text"
                       id="message-input"
                       class="form-control"
                       placeholder="Tulis pesan...">

                <button class="btn btn-primary" id="send-btn">
                    Kirim
                </button>
            </div>
        </div>

    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {

    const conversationId = "{{ $conversation->id }}";

    window.ChatAuth = {
        id: {{ Auth::id() }},
        name: @json(optional(Auth::user())->nama)
    };

    console.log("CHAT LOADED:", conversationId);

    // =========================
    // LOAD MESSAGE
    // =========================
    function loadMessages() {
        $.ajax({
            url: `/chat/${conversationId}/messages`,
            method: "GET",
            success: function (data) {

                $('#chat-box').html('');

                data.forEach(msg => {
                    appendMessage(msg);
                });

                scrollBottom();
            },
            error: function (xhr) {
                console.log("LOAD ERROR:", xhr.responseText);
            }
        });
    }

    // =========================
    // APPEND MESSAGE
    // =========================
    function appendMessage(msg) {

        let isMe = msg.sender_id == window.ChatAuth.id;

        let senderName = msg.sender?.nama ?? 'User';

        let html = `
            <div class="chat-bubble ${isMe ? 'chat-right' : 'chat-left'}">
                <small><b>${senderName}</b></small><br>
                ${msg.message}
            </div>
        `;

        $('#chat-box').append(html);
    }

    // =========================
    // SCROLL
    // =========================
    function scrollBottom() {
        let box = $('#chat-box');
        box.scrollTop(box[0].scrollHeight);
    }

    // =========================
    // SEND MESSAGE (IMPORTANT FIX)
    // =========================
    $(document).on('click', '#send-btn', function () {

        console.log("SEND CLICKED");

        let message = $('#message-input').val();

        if (!message.trim()) return;

        $.ajax({
            url: `/chat/${conversationId}/message`,
            method: "POST",
            data: {
                message: message,
                _token: "{{ csrf_token() }}"
            },
            success: function (res) {

                console.log("SEND SUCCESS:", res);

                $('#message-input').val('');

                appendMessage(res.message);

                scrollBottom();
            },
            error: function (xhr) {

                console.log("SEND ERROR:", xhr.status);
                console.log(xhr.responseText);

                alert("Gagal kirim pesan (cek console)");
            }
        });

    });

    // =========================
    // ENTER SEND
    // =========================
    $(document).on('keypress', '#message-input', function (e) {
        if (e.which === 13) {
            $('#send-btn').click();
        }
    });

    // =========================
    // INIT
    // =========================
    loadMessages();

});
</script>

@endsection