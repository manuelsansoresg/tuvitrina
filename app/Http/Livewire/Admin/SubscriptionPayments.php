<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use App\Models\SubscriptionPayment;
use App\Models\User;
use App\Notifications\WelcomeSubscriptionNotification;
use Carbon\Carbon;

class SubscriptionPayments extends Component
{
    public $selectedPayment = null;
    public $adminNotes = '';
    public $showModal = false;
    public $statusFilter = 'all';

    public function selectPayment($paymentId)
    {
        $this->selectedPayment = SubscriptionPayment::with('user')->findOrFail($paymentId);
        $this->showModal = true;
    }

    public function closeModal()
    {
        $this->selectedPayment = null;
        $this->adminNotes = '';
        $this->showModal = false;
    }

    public function approvePayment($paymentId)
    {
        $payment = SubscriptionPayment::findOrFail($paymentId);
        $user = $payment->user;
        
        // Calcular fechas de suscripción
        $startDate = Carbon::now();
        $endDate = $payment->plan_type === 'monthly' 
            ? $startDate->copy()->addMonth() 
            : $startDate->copy()->addYear();
        
        // Calcular nueva fecha de vencimiento
        $currentExpiration = $user->subscription_expires_at ? 
            Carbon::parse($user->subscription_expires_at) : 
            Carbon::now();
            
        // Si la suscripción ya venció, empezar desde hoy
        if ($currentExpiration->lt(Carbon::now())) {
            $currentExpiration = Carbon::now();
        }
        
        // Agregar tiempo según el plan
        $newExpiration = $payment->plan_type === 'monthly' ? 
            $currentExpiration->addMonth() : 
            $currentExpiration->addYear();
        
        // Actualizar estado del pago
        $payment->update([
            'status' => 'completed',
            'verified_at' => $startDate,
            'expires_at' => $newExpiration,
        ]);
        
        // Activar suscripción del usuario
        $user->update([
            'subscription_status' => 'active',
            'subscription_expires_at' => $newExpiration,
            'selected_plan' => $payment->plan_type,
            'last_payment_date' => $startDate,
        ]);
        
        // Enviar notificación de activación
        $user->notify(new \App\Notifications\SubscriptionActivatedNotification($payment->plan_type, $endDate));
        
        session()->flash('message', 'Pago aprobado y suscripción activada.');
        $this->closeModal();
    }

    public function rejectPayment($paymentId)
    {
        $payment = SubscriptionPayment::findOrFail($paymentId);
        
        $payment->update([
            'status' => 'failed',
            'admin_notes' => $this->adminNotes,
        ]);
        
        session()->flash('message', 'Pago rechazado.');
        $this->closeModal();
    }

    public function render()
    {
        $query = SubscriptionPayment::with('user');
        
        if ($this->statusFilter !== 'all') {
            $query->where('status', $this->statusFilter);
        }
        
        $payments = $query->orderBy('created_at', 'desc')->get();

        return view('livewire.admin.subscription-payments', [
            'payments' => $payments,
        ])->layout('layouts.admin');
    }
}