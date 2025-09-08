<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Order;

class NewOrderNotification extends Notification
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Nueva Orden de Compra - #' . $this->order->order_number)
                    ->greeting('¡Hola!')
                    ->line('Has recibido una nueva orden de compra en tu catálogo.')
                    ->line('**Detalles de la Orden:**')
                    ->line('Número de Orden: #' . $this->order->order_number)
                    ->line('Cliente: ' . $this->order->customer_name)
                    ->line('Email: ' . $this->order->customer_email)
                    ->line('Total: $' . number_format($this->order->total_amount, 2))
                    ->line('Fecha: ' . $this->order->order_date->format('d/m/Y H:i'))
                    ->action('Ver Orden', route('admin.orders.show', $this->order->id))
                    ->line('Por favor, revisa la orden y procesa el pago cuando recibas el comprobante de transferencia.')
                    ->salutation('Saludos, ' . config('app.name'));
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
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->customer_name,
            'customer_email' => $this->order->customer_email,
            'total_amount' => $this->order->total_amount,
            'order_date' => $this->order->order_date->toISOString(),
            'message' => 'Nueva orden de compra recibida: #' . $this->order->order_number,
        ];
    }
}
