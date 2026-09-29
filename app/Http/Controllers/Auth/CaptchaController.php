<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CaptchaController extends Controller
{
    /**
     * Generate dynamic local CAPTCHA image and store code in session.
     */
    public function generate(Request $request): Response
    {
        // Karakter mudah dibaca manusia (tanpa angka/huruf ambigu: 0, O, 1, I, L)
        $characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $length = 5;
        $maxIdx = strlen($characters) - 1;
        $code = '';

        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $maxIdx)];
        }

        // Simpan kode uppercase ke session
        $request->session()->put('login_captcha', $code);

        $width = 120;
        $height = 44;

        $image = imagecreatetruecolor($width, $height);

        // Palet warna yang serasi dengan tema form PILKB
        $bgColor = imagecolorallocate($image, 241, 245, 249);    // Slate 100 (#f1f5f9)
        $textColor = imagecolorallocate($image, 15, 68, 120);     // PILKB Blue Darkest (#0f4478)
        $noiseColor = imagecolorallocate($image, 203, 213, 225);  // Slate 300 (#cbd5e1)
        $lineColor = imagecolorallocate($image, 186, 214, 242);   // Soft PILKB Blue (#bad6f2)

        // Background
        imagefilledrectangle($image, 0, 0, $width, $height, $bgColor);

        // Noise dots (ringan & tidak membebani CPU)
        for ($i = 0; $i < 35; $i++) {
            imagesetpixel($image, random_int(0, $width), random_int(0, $height), $noiseColor);
        }

        // Garis pengaman tipis
        imageline($image, 0, random_int(8, $height - 8), $width, random_int(8, $height - 8), $lineColor);
        imageline($image, 0, random_int(8, $height - 8), $width, random_int(8, $height - 8), $lineColor);

        // Built-in GD font 5 (tanpa ketergantungan file font eksternal)
        $font = 5;
        $fontHeight = imagefontheight($font);

        // Spasi horizontal proporsional
        $step = (int) (($width - 24) / $length);
        $startX = 16;

        for ($i = 0; $i < $length; $i++) {
            $char = $code[$i];
            $x = $startX + ($i * $step);
            $y = (int) (($height - $fontHeight) / 2 + random_int(-3, 3));
            imagechar($image, $font, $x, $y, $char, $textColor);
        }

        try {
            ob_start();
            // Tingkat kompresi level 2: proses sangat cepat, hemat CPU, ukuran file tetap kecil (<1.5 KB)
            imagepng($image, null, 2);
            $imageData = ob_get_clean();
        } finally {
            if (is_resource($image) || $image instanceof \GdImage) {
                imagedestroy($image);
            }
        }

        return response($imageData, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
            'Pragma' => 'no-cache',
            'Expires' => 'Sat, 26 Jul 1997 05:00:00 GMT',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
