<?php

namespace App\Notifications;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserActivationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;
    protected $token;
    protected $activationUrl;
    protected $expiresAt;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $user, string $token)
    {
        $this->user = $user;
        $this->token = $token;
        $this->activationUrl = route('account.activate', ['token' => $token]);
        $this->expiresAt = $user->activation_token_expires_at
            ? Carbon::parse($user->activation_token_expires_at)->format('d-m-Y H:i')
            : now()->addHours(24)->format('d-m-Y H:i');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->from(
                config('mail.from.address', 'notifikasi.pilkb@gmail.com'),
                config('mail.from.name', 'PILKB BKPSDM')
            )
            ->replyTo('noreply@pilkb.bkpsdm.go.id', 'PILKB – No Reply')
            ->subject('[PILKB] Aktivasi Akun Pengguna Baru - ' . ($this->user->nama ?? $this->user->username))
            ->view('emails.aktivasi_akun', [
                'user'           => $this->user,
                'activation_url' => $this->activationUrl,
                'expires_at'     => $this->expiresAt,
            ])
            ->text('emails.aktivasi_akun_plain', [
                'user'           => $this->user,
                'activation_url' => $this->activationUrl,
                'expires_at'     => $this->expiresAt,
            ]);
    }
}
