<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\Business;

class Orders extends Component
{
    use WithPagination;
    
    public $search = '';
    public $statusFilter = 'all';
    public $businessFilter = 'all';
    public $perPage = 10;
    public $selectedOrder = null;
    public $showOrderModal = false;
    public $adminNotes = '';
    
    protected $paginationTheme = 'bootstrap';
    
    public function updatingSearch()
    {
        $this->resetPage();
    }
    
    public function updatingStatusFilter()
    {
        $this->resetPage();
    }
    
    public function updatingBusinessFilter()
    {
        $this->resetPage();
    }
    
    public function viewOrder($orderId)
    {
        $user = auth()->user();
        $query = Order::with(['items.product', 'paymentProof', 'business']);
        
        // Aplicar filtro según rol
        if ($user->hasRole('admin') && $user->business) {
            $query->where('business_id', $user->business->id);
        }
        // Los superadmin pueden ver todas las órdenes
        
        $this->selectedOrder = $query->findOrFail($orderId);
        $this->showOrderModal = true;
    }
    
    public function closeModal()
    {
        $this->showOrderModal = false;
        $this->selectedOrder = null;
        $this->adminNotes = '';
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
        $this->closeModal();
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
                        $currentEnd = $user->subscription_expires_at ? \Carbon\Carbon::parse($user->subscription_expires_at) : now();
                        
                        // Si la suscripción ya venció, empezar desde hoy
                        if ($currentEnd->lt(now())) {
                            $currentEnd = now();
                        }
                        
                        // Extender la suscripción
                        $newEndDate = $isMonthly ? $currentEnd->copy()->addMonth() : $currentEnd->copy()->addYear();
                        
                        $user->update([
                            'subscription_status' => 'active',
                            'subscription_expires_at' => $newEndDate,
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
                                'subscription_expires_at' => $endDate,
                                'selected_plan' => $planType,
                                'last_payment_date' => $startDate,
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
        $this->closeModal();
    }
    
    public function completeOrder($orderId)
    {
        $user = auth()->user();
        $query = Order::query();
        
        // Aplicar filtro según rol
        if ($user->hasRole('admin') && $user->business) {
            $query->where('business_id', $user->business->id);
        }
        // Los superadmin pueden completar cualquier orden
        
        $order = $query->findOrFail($orderId);
        $order->update(['status' => 'completed']);
        
        session()->flash('message', 'Orden marcada como completada.');
        $this->closeModal();
    }
    
    public function render()
    {
        $user = auth()->user();
        $query = Order::with(['items.product', 'paymentProof', 'business']);
        
        // Aplicar filtros según rol
        if ($user->hasRole('superadmin')) {
            // Los superadmin ven todas las órdenes, pero pueden filtrar por empresa
            if ($this->businessFilter !== 'all') {
                $query->where('business_id', $this->businessFilter);
            }
        } elseif ($user->hasRole('admin')) {
            // Los admin solo ven órdenes de su empresa
            if (!$user->business) {
                return view('livewire.admin.orders', [
                    'orders' => collect()
                ])->layout('layouts.admin');
            }
            $query->where('business_id', $user->business->id);
        } else {
            // Otros roles no tienen acceso
            return view('livewire.admin.orders', [
                'orders' => collect()
            ])->layout('layouts.admin');
        }
        
        $orders = $query->when($this->search, function($query) {
                $query->where(function($q) {
                    $q->where('order_number', 'like', '%' . $this->search . '%')
                      ->orWhere('customer_name', 'like', '%' . $this->search . '%')
                      ->orWhere('customer_email', 'like', '%' . $this->search . '%');
                });
            })
            ->when($this->statusFilter !== 'all', function($query) {
                $query->where('status', $this->statusFilter);
            })
            // Excluir órdenes de suscripción (que contienen 'Usuario ID:' en las notas)
            ->where(function($query) {
                $query->whereNull('notes')
                      ->orWhere('notes', 'not like', '%Usuario ID:%');
            })
            ->orderBy('created_at', 'desc')
            ->paginate($this->perPage);
        
        // Obtener todas las empresas para el filtro (solo para superadmin)
        $businesses = collect();
        if ($user->hasRole('superadmin')) {
            $businesses = Business::orderBy('business_name')->get();
        }
            
        return view('livewire.admin.orders', [
            'orders' => $orders,
            'businesses' => $businesses
        ])->layout('layouts.admin');
    }
}
