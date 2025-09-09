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
        
        // Actualizar estado del pago
        $payment->update([
            'status' => 'approved',
            'admin_notes' => $this->adminNotes,
            'approved_at' => $startDate,
        ]);
        
        // Activar suscripción del usuario
        $user->update([
            'subscription_status' => 'active',
            'subscription_start' => $startDate,
            'subscription_end' => $endDate,
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
            'status' => 'rejected',
            'admin_notes' => $this->adminNotes,
        ]);
        
        session()->flash('message', 'Pago rechazado.');
        $this->closeModal();
    }

    public function render()
    {
        $pendingPayments = SubscriptionPayment::with('user')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $recentPayments = SubscriptionPayment::with('user')
            ->whereIn('status', ['approved', 'rejected'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        return view('livewire.admin.subscription-payments', [
            'pendingPayments' => $pendingPayments,
            'recentPayments' => $recentPayments,
        ])->layout('layouts.admin');
    }
}