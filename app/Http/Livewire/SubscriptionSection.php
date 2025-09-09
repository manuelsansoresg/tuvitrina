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
        if (!$this->user->subscription_expires_at) {
            return false;
        }
        
        $expirationDate = Carbon::parse($this->user->subscription_expires_at);
        $fiveDaysFromNow = Carbon::now()->addDays(5);
        
        return $expirationDate->lte($fiveDaysFromNow) && $expirationDate->gt(Carbon::now());
    }
    
    public function isSubscriptionExpired()
    {
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
        $subscriptionPayments = $this->user->subscriptionPayments()
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
            
        return view('livewire.subscription-section', [
            'subscriptionPayments' => $subscriptionPayments,
            'isSuperAdmin' => $this->user->hasRole('superadmin')
        ]);
    }
}
