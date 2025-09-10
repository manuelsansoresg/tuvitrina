<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\PaymentProof;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CompleteRegistrationController extends Controller
{
    /**
     * Mostrar la página de finalización de registro
     */
    public function show($token)
    {
        $user = User::find($token);
        
        if (!$user) {
            abort(404, 'Usuario no encontrado');
        }
        
        // Verificar si ya tiene una suscripción activa
        if ($user->subscription_status === 'active') {
            return redirect()->route('home')->with('info', 'Tu suscripción ya está activa.');
        }
        
        // Verificar si ya subió el comprobante
        if ($user->subscription_status === 'pending_approval') {
            return redirect()->route('home')->with('info', 'Tu comprobante ya fue enviado y está siendo verificado.');
        }
        
        return view('auth.complete-registration', compact('user'));
    }
    
    /**
     * Procesar la subida del comprobante de pago
     */
    public function store(Request $request, $token)
    {
        $user = User::find($token);
        
        if (!$user) {
            abort(404, 'Usuario no encontrado');
        }
        
        $request->validate([
            'payment_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
        ], [
            'payment_proof.required' => 'El comprobante de pago es obligatorio.',
            'payment_proof.file' => 'Debe subir un archivo válido.',
            'payment_proof.mimes' => 'El archivo debe ser JPG, JPEG, PNG o PDF.',
            'payment_proof.max' => 'El archivo no debe superar los 5MB.',
        ]);
        
        try {
            // Subir el archivo
            $file = $request->file('payment_proof');
            $filename = 'payment_proof_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('payment_proofs', $filename, 'public');
            
            // Crear la orden de suscripción usando la estructura existente
            $amount = $user->selected_plan === 'monthly' ? 29.99 : 299.99;
            $orderNumber = 'ORD-' . strtoupper(Str::random(8));
            
            // Crear la orden principal
            $order = Order::create([
                'order_number' => $orderNumber,
                'business_id' => 1, // ID del negocio principal de TuVitrina
                'customer_name' => $user->first_name . ' ' . $user->last_name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone ?? '',
                'total_amount' => $amount,
                'status' => 'payment_uploaded',
                'notes' => 'Suscripción ' . ($user->selected_plan === 'monthly' ? 'mensual' : 'anual') . ' - Usuario ID: ' . $user->id,
                'order_date' => now(),
            ]);
            
            // Crear el registro del comprobante de pago
            PaymentProof::create([
                'order_id' => $order->id,
                'file_path' => $path,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_at' => now(),
                'status' => 'pending',
            ]);
            
            // Actualizar el estado del usuario
            $user->update([
                'subscription_status' => 'pending_approval',
                'payment_proof' => $path,
            ]);
            
            return redirect()->route('register.confirmation')
                ->with('success', 'Tu comprobante de pago ha sido enviado correctamente. Recibirás una confirmación por email una vez que sea aprobado por nuestro equipo.');
                
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Hubo un error al procesar tu comprobante. Por favor, inténtalo de nuevo.']);
        }
    }
}