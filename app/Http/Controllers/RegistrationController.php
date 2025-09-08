<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RegistrationLead;
use App\Models\TransferSetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RegistrationController extends Controller
{
    public function showRegistrationForm()
    {
        $transferSettings = TransferSetting::first();
        
        return view('auth.register-business', compact('transferSettings'));
    }
    
    public function submitRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'paternal_last_name' => 'required|string|max:255',
            'maternal_last_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:15',
            'email' => 'required|string|email|max:255|unique:registration_leads',
            'business_name' => 'required|string|max:255',
            'business_description' => 'nullable|string|max:1000',
            'plan_type' => 'required|in:monthly,annual',
            'payment_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Subir comprobante de pago
        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store('registration-proofs', 'public');
        }
        
        // Crear lead de registro
        $lead = RegistrationLead::create([
            'first_name' => $request->first_name,
            'paternal_last_name' => $request->paternal_last_name,
            'maternal_last_name' => $request->maternal_last_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'business_name' => $request->business_name,
            'business_description' => $request->business_description,
            'plan_type' => $request->plan_type,
            'payment_proof_path' => $paymentProofPath,
            'status' => 'pending'
        ]);
        
        return redirect()->route('registration.success')
            ->with('success', 'Tu solicitud de registro ha sido enviada. Te contactaremos pronto para activar tu cuenta.');
    }
    
    public function registrationSuccess()
    {
        return view('auth.registration-success');
    }
}