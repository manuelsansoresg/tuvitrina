<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RegistrationConfirmationController extends Controller
{
    /**
     * Show the registration confirmation page.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\View\View
     */
    public function show(Request $request)
    {
        // Verificar que el usuario esté autenticado
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // Verificar que el usuario tenga estado 'incomplete'
        if ($user->subscription_status !== 'incomplete') {
            return redirect()->route('admin.dashboard');
        }

        // Obtener datos del usuario y plan
        $userData = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'plan' => $user->selected_plan,
            'amount' => $user->selected_plan === 'monthly' ? 29.99 : 299.99,
            'plan_name' => $user->selected_plan === 'monthly' ? 'Plan Mensual' : 'Plan Anual',
            'duration' => $user->selected_plan === 'monthly' ? '1 mes' : '1 año'
        ];

        return view('auth.registration-confirmation', compact('userData'));
    }
}