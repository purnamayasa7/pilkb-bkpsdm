<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="id" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Notifikasi Tiket PILKB</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        /* Prevent blue links in iOS */
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        /* Fix for Gmail */
        u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    </style>
</head>
<body id="body" style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">

    {{-- Preheader teks tersembunyi (muncul di preview email client) --}}
    <div style="display: none; font-size: 1px; color: #f0f4f8; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Terdapat usulan baru (No. {{ $no_tiket }}) yang memerlukan tindak lanjut di sistem PILKB BKPSDM.
    </div>

    {{-- Outer Wrapper --}}
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f4f8;">
        <tr>
            <td align="center" style="padding: 40px 16px;">

                {{-- Email Container --}}
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px;">

                    {{-- ===== HEADER ===== --}}
                    <tr>
                        <td align="center" style="background-color: #1e40af; border-radius: 12px 12px 0 0; padding: 32px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 12px;">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="background-color: rgba(255,255,255,0.15); border-radius: 50px; padding: 6px 18px;">
                                                    <span style="color: rgba(255,255,255,0.9); font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif;">
                                                        Sistem PILKB
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">
                                            {{ $title ?? 'Notifikasi Layanan PILKB' }}
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 8px;">
                                        <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 13px; font-family: Arial, Helvetica, sans-serif;">
                                            BKPSDM &ndash; Badan Kepegawaian dan Pengembangan SDM
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- ===== BODY ===== --}}
                    <tr>
                        <td style="background-color: #ffffff; padding: 36px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                {{-- Salam --}}
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="margin: 0; font-size: 15px; color: #374151; font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
                                            Yth. <strong>Bapak/Ibu</strong>,
                                        </p>
                                    </td>
                                </tr>

                                {{-- Intro / Pesan --}}
                                <tr>
                                    <td style="padding-bottom: 28px;">
                                        <p style="margin: 0; font-size: 15px; color: #4b5563; font-family: Arial, Helvetica, sans-serif; line-height: 1.7;">
                                            {{ $pesan ?? 'Terdapat pembaruan usulan layanan pada sistem PILKB yang memerlukan perhatian Anda.' }}
                                        </p>
                                    </td>
                                </tr>

                                {{-- Detail Tiket Card --}}
                                <tr>
                                    <td style="padding-bottom: 28px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8faff; border: 1px solid #dbeafe; border-radius: 10px;">
                                            {{-- Card Header --}}
                                            <tr>
                                                <td style="padding: 12px 20px; background-color: #eff6ff; border-radius: 10px 10px 0 0; border-bottom: 1px solid #dbeafe;">
                                                    <span style="font-size: 11px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; font-family: Arial, Helvetica, sans-serif;">
                                                        Detail Tiket
                                                    </span>
                                                </td>
                                            </tr>
                                            {{-- Card Body --}}
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td style="padding: 6px 0; color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif; width: 140px; vertical-align: top;">
                                                                Nomor Tiket
                                                            </td>
                                                            <td style="padding: 6px 0; vertical-align: top;">
                                                                <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 13px; font-weight: bold; padding: 3px 14px; border-radius: 20px; font-family: Arial, Helvetica, sans-serif;">
                                                                    {{ $no_tiket }}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        @if(!empty($nama_layanan))
                                                        <tr>
                                                            <td style="padding: 6px 0; color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                Nama Usulan
                                                            </td>
                                                            <td style="padding: 6px 0; color: #111827; font-size: 13px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                {{ $nama_layanan }}
                                                            </td>
                                                        </tr>
                                                        @endif
                                                        @if(!empty($nama_pegawai))
                                                        <tr>
                                                            <td style="padding: 6px 0; color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                Nama ASN / Pegawai
                                                            </td>
                                                            <td style="padding: 6px 0; color: #374151; font-size: 13px; font-weight: 600; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                {{ $nama_pegawai }}
                                                            </td>
                                                        </tr>
                                                        @endif
                                                        <tr>
                                                            <td style="padding: 6px 0; color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                Status / Perihal
                                                            </td>
                                                            <td style="padding: 6px 0; color: #374151; font-size: 13px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                {{ $title ?? 'Pembaruan Layanan' }}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 6px 0; color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                Waktu Notifikasi
                                                            </td>
                                                            <td style="padding: 6px 0; color: #374151; font-size: 13px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; vertical-align: top;">
                                                                {{ now()->format('d-m-Y H:i') }} WITA
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                {{-- CTA Text --}}
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <p style="margin: 0; font-size: 14px; color: #4b5563; font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
                                            Silakan akses sistem PILKB untuk melihat detail dan melakukan proses verifikasi:
                                        </p>
                                    </td>
                                </tr>

                                {{-- CTA Button --}}
                                <tr>
                                    <td align="center" style="padding-bottom: 28px;">
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $url }}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="18%" stroke="f" fillcolor="#1e40af">
                                            <w:anchorlock/>
                                            <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">Lihat Detail Usulan</center>
                                        </v:roundrect>
                                        <![endif]-->
                                        <!--[if !mso]><!-->
                                        <a href="{{ $url }}" target="_blank" style="display: inline-block; background-color: #1e40af; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 13px 32px; border-radius: 8px; font-family: Arial, Helvetica, sans-serif; letter-spacing: 0.3px;">
                                            Lihat Detail Usulan &rarr;
                                        </a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>

                                {{-- Fallback URL --}}
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 14px 16px;">
                                                    <p style="margin: 0 0 4px; font-size: 11px; color: #9ca3af; font-family: Arial, Helvetica, sans-serif;">
                                                        Jika tombol tidak berfungsi, salin tautan berikut ke browser:
                                                    </p>
                                                    <p style="margin: 0; font-size: 12px; color: #2563eb; word-break: break-all; font-family: Arial, Helvetica, sans-serif;">
                                                        {{ $url }}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                {{-- Warning notice --}}
                                <tr>
                                    <td>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
                                            <tr>
                                                <td style="padding: 12px 16px;">
                                                    <p style="margin: 0; font-size: 12px; color: #92400e; font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
                                                        Email ini dikirim secara otomatis oleh sistem PILKB. Mohon untuk <strong>tidak membalas</strong> email ini.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    {{-- ===== FOOTER ===== --}}
                    <tr>
                        <td style="background-color: #1e293b; border-radius: 0 0 12px 12px; padding: 24px 40px; text-align: center;">
                            <p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8; font-family: Arial, Helvetica, sans-serif;">
                                Hormat kami,
                            </p>
                            <p style="margin: 0 0 12px; font-size: 15px; font-weight: bold; color: #e2e8f0; font-family: Arial, Helvetica, sans-serif;">
                                Sistem PILKB &ndash; BKPSDM
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #475569; font-family: Arial, Helvetica, sans-serif;">
                                &copy; {{ now()->year }} Badan Kepegawaian dan Pengembangan SDM. Seluruh hak cipta dilindungi.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>