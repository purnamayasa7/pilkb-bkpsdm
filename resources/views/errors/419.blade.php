<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>419 - Sesi Berakhir | PILKB BKPSDM</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        :root {
            --primary: #0d6efd;
            --primary-dark: #0a58ca;
            --bg-gradient: linear-gradient(135deg, #f0f4ff 0%, #e2e8f0 100%);
        }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-gradient);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            color: #1e293b;
        }
        .error-card {
            background: #ffffff;
            border-radius: 1.25rem;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1);
            max-width: 480px;
            width: 100%;
            padding: 2.5rem 2rem;
            text-align: center;
        }
        .icon-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #fff7ed;
            color: #ea580c;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 8px 16px -4px rgba(234, 88, 12, 0.15);
        }
        .error-code {
            font-size: 0.875rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #ea580c;
            margin-bottom: 0.5rem;
        }
        .error-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 0.75rem;
        }
        .error-desc {
            font-size: 0.925rem;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .btn-custom-primary {
            background: #2563eb;
            color: #fff;
            font-weight: 600;
            border-radius: 0.75rem;
            padding: 0.75rem 1.25rem;
            border: none;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-decoration: none;
        }
        .btn-custom-primary:hover {
            background: #1d4ed8;
            color: #fff;
            transform: translateY(-1px);
        }
        .btn-custom-secondary {
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
            border-radius: 0.75rem;
            padding: 0.75rem 1.25rem;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-decoration: none;
        }
        .btn-custom-secondary:hover {
            background: #e2e8f0;
            color: #1e293b;
        }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="icon-circle">
            <i class="bi bi-clock-history"></i>
        </div>
        <div class="error-code">Error 419 • Sesi Berakhir</div>
        <h1 class="error-title">Halaman Kedaluwarsa</h1>
        <p class="error-desc">
            Sesi browser Anda telah berakhir karena tidak ada aktivitas dalam waktu lama atau token keamanan telah diperbarui. Silakan masuk kembali untuk melanjutkan.
        </p>

        <div class="d-grid gap-2">
            <a href="{{ route('login') }}" class="btn-custom-primary">
                <i class="bi bi-box-arrow-in-right"></i>
                Masuk Kembali
            </a>
        </div>
    </div>
</body>
</html>
