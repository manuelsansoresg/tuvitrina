<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class WelcomeSubscriptionNotification extends Notification
{
    use Queueable;
    
    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $planLabel = $notifiable->selected_plan === 'monthly' ? 'Plan Mensual' : 'Plan Anual';
        $amount = $notifiable->selected_plan === 'monthly' ? '$29.99' : '$299.99';
        
        return (new MailMessage)
                    ->subject('¡Bienvenido a TuVitrina! - Completa tu registro')
                    ->greeting('¡Hola ' . $notifiable->first_name . '!')
                    ->line('¡Bienvenido a TuVitrina! Tu cuenta ha sido creada exitosamente.')
                    ->line('')
                    ->line('**Detalles de tu registro:**')
                    ->line('• Plan seleccionado: **' . $planLabel . '**')
                    ->line('• Monto a pagar: **' . $amount . ' MXN**')
                    ->line('')
                    ->line('**Para activar tu suscripción, necesitas completar los siguientes pasos:**')
                    ->line('1. Realiza el pago por el monto indicado')
                    ->line('2. Sube tu comprobante de pago usando el enlace de abajo')
                    ->line('3. Espera la aprobación de nuestro equipo (24-48 horas)')
                    ->line('')
                    ->line('Una vez aprobado tu comprobante, tu suscripción se activará automáticamente.')
                    ->action('Completar mi Registro', route('complete.registration', ['token' => $notifiable->id]))
                    ->line('Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.')
                    ->line('¡Gracias por confiar en TuVitrina!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
