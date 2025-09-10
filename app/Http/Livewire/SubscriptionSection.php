<?php

namespace App\Http\Livewire;

use Livewire\Component;
use Livewire\WithFileUploads;
use App\Models\SubscriptionPayment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SubscriptionSection extends Component
{
    use WithFileUploads;
    public $user;
    public $showRenewalForm = false;
    public $selectedPlan = 'monthly';
    public $paymentProof;
    
    public function mount()
    {
        $this->user = Auth::user();
    }
    
    public function showRenewalOptions()
    {
        $this->showRenewalForm = true;
    }
    
    public function hideRenewalForm()
    {
        $this->showRenewalForm = false;
    }
    
    public function submitRenewal()
    {
        try {
            $this->validate([
                'selectedPlan' => 'required|in:monthly,yearly',
                'paymentProof' => 'required|image|max:2048'
            ], [
                'selectedPlan.required' => 'Debe seleccionar un plan.',
                'selectedPlan.in' => 'El plan seleccionado no es válido.',
                'paymentProof.required' => 'El comprobante de pago es obligatorio.',
                'paymentProof.image' => 'El comprobante debe ser una imagen válida.',
                'paymentProof.max' => 'La imagen no puede ser mayor a 2MB.'
            ]);
        } catch (\Exception $e) {
            session()->flash('error', 'Error en la validación: ' . $e->getMessage());
            return;
        }
        
        try {
            // Calcular monto según el plan
            $amount = $this->selectedPlan === 'monthly' ? 29.99 : 299.99;
            $planName = $this->selectedPlan === 'monthly' ? 'mensual' : 'anual';
            
            // Crear orden de renovación
            $order = \App\Models\Order::create([
                'order_number' => 'REN-' . strtoupper(uniqid()),
                'customer_name' => $this->user->first_name . ' ' . $this->user->last_name,
                'customer_email' => $this->user->email,
                'customer_phone' => $this->user->phone ?? '',
                'total_amount' => $amount,
                'status' => 'payment_uploaded',
                'notes' => 'Renovación de suscripción ' . $planName . ' - Usuario ID: ' . $this->user->id,
                'order_date' => now(),
            ]);
            
            // Guardar comprobante de pago
            $fileName = 'payment_proof_' . $order->id . '_' . time() . '.' . $this->paymentProof->getClientOriginalExtension();
            $this->paymentProof->storeAs('payment_proofs', $fileName, 'public');
            
            // Crear registro del comprobante
            \App\Models\PaymentProof::create([
                'order_id' => $order->id,
                'file_path' => 'payment_proofs/' . $fileName,
                'original_name' => $this->paymentProof->getClientOriginalName(),
                'file_size' => $this->paymentProof->getSize(),
                'mime_type' => $this->paymentProof->getMimeType(),
                'status' => 'pending',
                'uploaded_at' => now(),
            ]);
            
            session()->flash('message', 'Solicitud de renovación enviada. Será procesada en las próximas 24 horas.');
            $this->hideRenewalForm();
            $this->reset(['selectedPlan', 'paymentProof']);
        } catch (\Exception $e) {
            session()->flash('error', 'Error al procesar la renovación: ' . $e->getMessage());
            \Log::error('Error en renovación de suscripción: ' . $e->getMessage(), [
                'user_id' => $this->user->id,
                'selected_plan' => $this->selectedPlan,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
    
    public function getPlanTypeLabel($planType)
    {
        return $planType === 'monthly' ? 'Mensual' : 'Anual';
    }
    
    public function isSubscriptionExpiringSoon()
    {
        // Los usuarios en proceso de registro/verificación no muestran advertencias de vencimiento
        if (in_array($this->user->subscription_status, ['pending', 'pending_approval'])) {
            return false;
        }
        
        // Los usuarios que nunca han tenido una suscripción activa no muestran advertencias
        if (!$this->user->subscription_expires_at && !$this->user->last_payment_date) {
            return false;
        }
        
        if (!$this->user->subscription_expires_at) {
            return false;
        }
        
        $expirationDate = Carbon::parse($this->user->subscription_expires_at);
        $fiveDaysFromNow = Carbon::now()->addDays(5);
        
        return $expirationDate->lte($fiveDaysFromNow) && $expirationDate->gt(Carbon::now());
    }
    
    public function isSubscriptionExpired()
    {
        // Los usuarios en proceso de registro/verificación no se consideran vencidos
        if (in_array($this->user->subscription_status, ['pending', 'pending_approval'])) {
            return false;
        }
        
        // Los usuarios que nunca han tenido una suscripción activa no se consideran vencidos
        if (!$this->user->subscription_expires_at && !$this->user->last_payment_date) {
            return false;
        }
        
        if (!$this->user->subscription_expires_at) {
            return true;
        }
        
        return Carbon::parse($this->user->subscription_expires_at)->lt(Carbon::now());
    }
    
    public function getDaysUntilExpiration()
    {
        if (!$this->user->subscription_expires_at) {
            return 0;
        }
        
        $expirationDate = Carbon::parse($this->user->subscription_expires_at);
        return max(0, Carbon::now()->diffInDays($expirationDate, false));
    }
    
    public function render()
    {
        $isSuperAdmin = $this->user->hasRole('superadmin');
        
        if ($isSuperAdmin) {
            // Para superadmin: mostrar todas las suscripciones con usuarios
            $allUsers = \App\Models\User::with(['subscriptionPayments' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->whereNotNull('subscription_status')
            ->orderBy('created_at', 'desc')
            ->get();
            
            return view('livewire.subscription-section', [
                'allUsers' => $allUsers,
                'subscriptionPayments' => collect(),
                'isSuperAdmin' => $isSuperAdmin
            ]);
        } else {
            // Para usuarios normales: mostrar solo su información
            $subscriptionPayments = $this->user->subscriptionPayments()
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();
                
            return view('livewire.subscription-section', [
                'subscriptionPayments' => $subscriptionPayments,
                'allUsers' => collect(),
                'isSuperAdmin' => $isSuperAdmin
            ]);
        }
    }
    
    public function approvePayment($paymentId)
    {
        $payment = \App\Models\SubscriptionPayment::findOrFail($paymentId);
        $user = $payment->user;
        
        // Calcular nueva fecha de vencimiento
        $currentExpiration = $user->subscription_expires_at ? 
            \Carbon\Carbon::parse($user->subscription_expires_at) : 
            \Carbon\Carbon::now();
            
        // Si la suscripción ya venció, empezar desde hoy
        if ($currentExpiration->lt(\Carbon\Carbon::now())) {
            $currentExpiration = \Carbon\Carbon::now();
        }
        
        // Agregar tiempo según el plan
        $newExpiration = $payment->plan_type === 'monthly' ? 
            $currentExpiration->addMonth() : 
            $currentExpiration->addYear();
            
        // Actualizar usuario
        $user->update([
            'subscription_expires_at' => $newExpiration,
            'subscription_status' => 'active',
            'last_payment_date' => \Carbon\Carbon::now(),
            'selected_plan' => $payment->plan_type
        ]);
        
        // Marcar pago como completado
        $payment->update([
            'status' => 'completed',
            'verified_at' => \Carbon\Carbon::now()
        ]);
        
        session()->flash('message', 'Pago aprobado exitosamente. La suscripción del usuario ha sido actualizada.');
    }
    
    public function rejectPayment($paymentId)
    {
        $payment = \App\Models\SubscriptionPayment::findOrFail($paymentId);
        
        $payment->update([
            'status' => 'failed',
            'verified_at' => \Carbon\Carbon::now()
        ]);
        
        session()->flash('message', 'Pago rechazado exitosamente.');
    }
}
