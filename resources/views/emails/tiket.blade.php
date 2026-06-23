<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
</head>

<body style="font-family: Arial, sans-serif; color:#222; line-height:1.6;">

    <p>Yth. Bapak/Ibu,</p>

    <p>
        Terdapat usulan baru pada sistem PILKB yang memerlukan tindak lanjut/verifikasi.
    </p>

    <p>
        Berikut detailnya:
    </p>

    <p>
        No Tiket: <b>{{ $no_tiket }}</b><br>
        Waktu: {{ now()->format('d-m-Y H:i') }}
    </p>

    <p>
        Untuk melihat detail usulan, silakan akses melalui sistem PILKB:
    </p>

    <p>
        {{ $url }}
    </p>

    <p>
        Mohon untuk tidak membalas email ini karena dikirim otomatis oleh sistem.
    </p>

    <br>

    <p>Hormat kami,<br>
        Sistem PILKB</p>

</body>

</html>