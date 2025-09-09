<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class SubscriptionActivatedNotification extends Notification
{
    use Queueable;

    protected $planType;
    protected $endDate;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($planType, $endDate)
    {
        $this->planType = $planType;
        $this->endDate = $endDate;
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
        $planName = $this->planType === 'monthly' ? 'Plan Mensual' : 'Plan Anual';
        $endDateFormatted = Carbon::parse($this->endDate)->format('d/m/Y');
        
        return (new MailMessage)
                    ->subject('¡Tu suscripción ha sido activada!')
                    ->greeting('¡Hola ' . $notifiable->name . '!')
                    ->line('Tu comprobante de pago ha sido aprobado y tu suscripción ha sido activada exitosamente.')
                    ->line('**Detalles de tu suscripción:**')
                    ->line('• Plan: ' . $planName)
                    ->line('• Fecha de vencimiento: ' . $endDateFormatted)
                    ->action('Acceder a tu cuenta', url('/dashboard'))
                    ->line('¡Gracias por confiar en TuVitrina! Ahora puedes disfrutar de todos los beneficios de tu plan.')
                    ->salutation('Saludos,\nEl equipo de TuVitrina');
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
            'plan_type' => $this->planType,
            'end_date' => $this->endDate,
            'message' => 'Tu suscripción ha sido activada exitosamente'
        ];
    }
}