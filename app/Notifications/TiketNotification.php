<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TiketNotification extends Notification
{
    use Queueable;

    protected $title;
    protected $message;
    protected $url;
    protected $noTiket;
    protected $type;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        string $title,
        string $message,
        string $url,
        string $noTiket = '',
        string $type = 'default'
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->url = $url;
        $this->noTiket = $noTiket;
        $this->type = $type;
    }


    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Notifikasi Usulan Baru - PILKB')
            ->view('emails.tiket', [
                'no_tiket' => $this->noTiket,
                'url' => $this->url,
            ]);
    }


    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
            'no_tiket' => $this->noTiket,
            'type' => $this->type,
        ];
    }
}
