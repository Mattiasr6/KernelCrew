<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordBase;

class ResetPasswordNotification extends ResetPasswordBase implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable)
    {
        $url = config('app.frontend_url') . '/auth/reset-password/' . $this->token . '?email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Restablecer Contraseña - EduPortal')
            ->line('Recibiste este correo porque solicitaste restablecer tu contraseña.')
            ->action('Restablecer Contraseña', $url)
            ->line('Este enlace de recuperación expirará en 60 minutos.')
            ->line('Si no realizaste esta solicitud, no es necesario realizar ninguna otra acción.');
    }
}
