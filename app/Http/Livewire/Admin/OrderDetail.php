<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use App\Models\Order;
use App\Models\Sale;
use App\Models\PaymentProof;
use Illuminate\Support\Facades\Auth;

class OrderDetail extends Component
{
    public $order;
    public $showApproveModal = false;
    public $showRejectModal = false;
    public $rejectionReason = '';
    public $adminNotes = '';

    public function mount(Order $order)
    {
        $user = Auth::user();
        
        // Verificar permisos según el rol
        if ($user->hasRole('admin')) {
            // Admin solo puede ver órdenes de su empresa
            if (!$user->business || $order->business->user_id !== $user->id) {
                abort(403);
            }
        } elseif (!$user->hasRole('superadmin')) {
            // Otros roles no tienen acceso
            abort(403);
        }
        // Los superadmin pueden ver todas las órdenes
        
        $this->order = $order;
    }

    public function approveOrder()
    {
        $this->order->update([
            'status' => 'approved',
            'approved_at' => now()
        ]);

        session()->flash('message', 'Orden aprobada exitosamente.');
        $this->showApproveModal = false;
        $this->order->refresh();
    }

    public function rejectOrder()
    {
        $this->validate([
            'rejectionReason' => 'required|min:10'
        ], [
            'rejectionReason.required' => 'Debe proporcionar una razón para el rechazo.',
            'rejectionReason.min' => 'La razón debe tener al menos 10 caracteres.'
        ]);

        $this->order->update([
            'status' => 'rejected',
            'rejection_reason' => $this->rejectionReason,
            'rejected_at' => now()
        ]);

        session()->flash('message', 'Orden rechazada.');
        $this->showRejectModal = false;
        $this->rejectionReason = '';
        $this->order->refresh();
    }

    public function completeOrder()
    {
        // Crear registro de venta
        $sale = Sale::create([
            'business_id' => $this->order->business_id,
            'total_amount' => $this->order->total_amount,
            'sale_date' => now(),
            'payment_method' => 'transfer',
            'notes' => 'Venta generada desde orden #' . $this->order->order_number
        ]);

        // Actualizar estado de la orden
        $this->order->update([
            'status' => 'completed',
            'completed_at' => now(),
            'sale_id' => $sale->id
        ]);

        session()->flash('message', 'Orden completada y registrada en ventas.');
        $this->order->refresh();
    }

    public function approvePayment($paymentProofId)
    {
        $paymentProof = PaymentProof::findOrFail($paymentProofId);
        $paymentProof->update([
            'status' => 'approved',
            'admin_notes' => $this->adminNotes
        ]);

        // Actualizar estado de la orden
        $paymentProof->order->update(['status' => 'confirmed']);

        // Verificar si es una orden de suscripción y activar la suscripción
        $this->activateSubscriptionIfNeeded($paymentProof->order);

        session()->flash('message', 'Comprobante aprobado y orden confirmada.');
        $this->adminNotes = '';
        $this->order->refresh();
    }

    private function activateSubscriptionIfNeeded($order)
    {
        // Verificar si es una orden de suscripción (contiene "Usuario ID:" en las notas)
        if (strpos($order->notes, 'Usuario ID:') !== false) {
            // Extraer el ID del usuario de las notas
            preg_match('/Usuario ID: (\d+)/', $order->notes, $matches);
            if (isset($matches[1])) {
                $userId = $matches[1];
                $user = \App\Models\User::find($userId);
                
                if ($user) {
                    // Determinar el tipo de plan desde las notas
                    $isMonthly = strpos($order->notes, 'mensual') !== false;
                    $planType = $isMonthly ? 'monthly' : 'annual';
                    $isRenewal = strpos($order->notes, 'Renovación') !== false;
                    
                    if ($isRenewal) {
                        // Para renovaciones, extender la suscripción existente
                        $currentEnd = $user->subscription_end ? \Carbon\Carbon::parse($user->subscription_end) : now();
                        
                        // Si la suscripción ya venció, empezar desde hoy
                        if ($currentEnd->lt(now())) {
                            $currentEnd = now();
                        }
                        
                        // Extender la suscripción
                        $newEndDate = $isMonthly ? $currentEnd->copy()->addMonth() : $currentEnd->copy()->addYear();
                        
                        $user->update([
                            'subscription_status' => 'active',
                            'subscription_end' => $newEndDate,
                            'selected_plan' => $planType,
                            'last_payment_date' => now(),
                        ]);
                        
                        // Enviar notificación de renovación
                        $user->notify(new \App\Notifications\SubscriptionRenewedNotification($planType, $newEndDate));
                    } else {
                        // Para nuevas suscripciones
                        if ($user->subscription_status !== 'active') {
                            // Calcular fechas de suscripción
                            $startDate = now();
                            $endDate = $isMonthly ? $startDate->copy()->addMonth() : $startDate->copy()->addYear();
                            
                            // Activar la suscripción
                            $user->update([
                                'subscription_status' => 'active',
                                'subscription_start' => $startDate,
                                'subscription_end' => $endDate,
                                'selected_plan' => $planType,
                            ]);
                            
                            // Enviar notificación de activación
                            $user->notify(new \App\Notifications\SubscriptionActivatedNotification($planType, $endDate));
                        }
                    }
                }
            }
        }
    }

    public function rejectPayment($paymentProofId)
    {
        $paymentProof = PaymentProof::findOrFail($paymentProofId);
        $paymentProof->update([
            'status' => 'rejected',
            'admin_notes' => $this->adminNotes
        ]);

        session()->flash('message', 'Comprobante rechazado.');
        $this->adminNotes = '';
        $this->order->refresh();
    }

    public function render()
    {
        return view('livewire.admin.order-detail')
            ->layout('layouts.admin');
    }
}