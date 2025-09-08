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
        
        session()->flash('message', 'Comprobante aprobado y orden confirmada.');
        $this->closeModal();
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
