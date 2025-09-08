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

        session()->flash('message', 'Comprobante aprobado y orden confirmada.');
        $this->adminNotes = '';
        $this->order->refresh();
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