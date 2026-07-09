<!doctype html>
<html>
<head>

<meta charset="utf-8">

<title>QR {{ $tiket->no_tiket }}</title>

<style>

body{
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    background:#f5f7fa;
}

img{
    width:600px;
}

</style>

</head>

<body>

<img
src="data:image/svg+xml;base64,{{ $qr }}"
alt="QR">

</body>

</html>