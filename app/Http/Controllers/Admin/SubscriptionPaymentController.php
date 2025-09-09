<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Carbon\Carbon;

class SubscriptionPaymentController extends Controller
{
    public function index()
    {
        $payments = SubscriptionPayment::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return view('admin.subscription-payments.index', compact('payments'));
    }
    
    public function show(SubscriptionPayment $payment)
    {
        $payment->load('user');
        return view('admin.subscription-payments.show', compact('payment'));
    }
    
    public function approve(SubscriptionPayment $payment)
    {
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Solo se pueden aprobar pagos pendientes.');
        }
        
        $user = $payment->user;
        
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
            
        // Actualizar usuario
        $user->update([
            'subscription_expires_at' => $newExpiration,
            'subscription_status' => 'active',
            'last_payment_date' => Carbon::now(),
            'selected_plan' => $payment->plan_type
        ]);
        
        // Marcar pago como completado
        $payment->update([
            'status' => 'completed',
            'verified_at' => Carbon::now()
        ]);
        
        return back()->with('success', 'Pago aprobado exitosamente. La suscripción del usuario ha sido actualizada.');
    }
    
    public function reject(Request $request, SubscriptionPayment $payment)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);
        
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Solo se pueden rechazar pagos pendientes.');
        }
        
        $payment->update([
            'status' => 'failed',
            'rejection_reason' => $request->rejection_reason,
            'verified_at' => Carbon::now()
        ]);
        
        return back()->with('success', 'Pago rechazado exitosamente.');
    }
    
    public function addNotes(Request $request, SubscriptionPayment $payment)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000'
        ]);
        
        $payment->update([
            'admin_notes' => $request->admin_notes
        ]);
        
        return back()->with('success', 'Notas agregadas exitosamente.');
    }
}
