<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TiketNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $title;
    protected $message;
    protected $url;
    protected $noTiket;
    protected $type;
    protected $namaLayanan;
    protected $namaPegawai;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        string $title,
        string $message,
        string $url,
        string $noTiket = '',
        string $type = 'default',
        ?string $namaLayanan = null,
        ?string $namaPegawai = null
    ) {
        $this->title       = $title;
        $this->message     = $message;
        $this->url         = $url;
        $this->noTiket     = $noTiket;
        $this->type        = $type;
        $this->namaLayanan = $namaLayanan;
        $this->namaPegawai = $namaPegawai;

        // Auto-resolve nama layanan & nama pegawai jika belum terisi tapi ada nomor tiket
        if (empty($this->namaLayanan) && !empty($this->noTiket)) {
            try {
                $tiket = \App\Models\Regtiket::with('layanan')->where('no_tiket', $this->noTiket)->first();
                if ($tiket) {
                    $this->namaLayanan = $tiket->layanan?->nama_layanan;
                    if (empty($this->namaPegawai)) {
                        $this->namaPegawai = $tiket->nama;
                    }
                }
            } catch (\Throwable $e) {
                // Ignore fallback resolution error
            }
        }
    }

    public function via(object $notifiable): array
    {
        if ($notifiable instanceof \Illuminate\Notifications\AnonymousNotifiable) {
            return ['mail'];
        }

        $channels = ['database'];
        if (!empty($notifiable->email)) {
            $channels[] = 'mail';
        }
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subjectNo = !empty($this->noTiket) ? ' – No. ' . $this->noTiket : '';

        return (new MailMessage)
            ->from(
                config('mail.from.address', 'notifikasi.pilkb@gmail.com'),
                config('mail.from.name', 'PILKB BKPSDM')
            )
            ->replyTo('noreply@pilkb.bkpsdm.go.id', 'PILKB – No Reply')
            ->subject('[PILKB] ' . $this->title . $subjectNo)
            ->view('emails.tiket', [
                'no_tiket'     => $this->noTiket,
                'url'          => $this->url,
                'title'        => $this->title,
                'pesan'        => $this->message,
                'nama_layanan' => $this->namaLayanan,
                'nama_pegawai' => $this->namaPegawai,
            ])
            ->text('emails.tiket_plain', [
                'no_tiket'     => $this->noTiket,
                'url'          => $this->url,
                'title'        => $this->title,
                'pesan'        => $this->message,
                'nama_layanan' => $this->namaLayanan,
                'nama_pegawai' => $this->namaPegawai,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'        => $this->title,
            'message'      => $this->message,
            'url'          => $this->url,
            'no_tiket'     => $this->noTiket,
            'type'         => $this->type,
            'nama_layanan' => $this->namaLayanan,
            'nama_pegawai' => $this->namaPegawai,
        ];
    }
}
