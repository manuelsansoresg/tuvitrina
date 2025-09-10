<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Verificar si el usuario está autenticado
        if (!Auth::check()) {
            return redirect()->route('login');
        }
        
        $user = Auth::user();
        
        // Los usuarios superadmin no se ven afectados por la validación de suscripción
        if ($user->hasRole('superadmin')) {
            return $next($request);
        }
        
        // Permitir acceso a la página de suscripción siempre
        if ($request->routeIs('subscription') || $request->routeIs('subscription.*')) {
            return $next($request);
        }
        
        // Permitir acceso a usuarios en proceso de verificación pero con mensaje informativo
        if (in_array($user->subscription_status, ['pending', 'pending_approval'])) {
            if ($user->subscription_status === 'pending') {
                session()->flash('info', 'Tu registro está pendiente. Por favor, completa el proceso subiendo tu comprobante de pago.');
            } elseif ($user->subscription_status === 'pending_approval') {
                session()->flash('info', 'Tu comprobante está siendo verificado. Te notificaremos cuando sea aprobado.');
            }
            return $next($request);
        }
        
        // Verificar si la suscripción está vencida
        if ($user->isSubscriptionExpired()) {
            // Actualizar el estado de suscripción si está vencida
            $user->update(['subscription_status' => 'expired']);
            
            return redirect()->route('admin.subscription')
                ->with('error', 'Tu suscripción ha vencido. Por favor, renueva tu plan para continuar.');
        }
        
        // Mostrar advertencia si la suscripción vence pronto (pero permitir acceso)
        // Solo para usuarios que ya han tenido una suscripción activa
        if ($user->isSubscriptionExpiringSoon()) {
            session()->flash('warning', 'Tu suscripción vence en ' . $user->days_until_expiration . ' días. Te recomendamos renovar pronto.');
        }
        
        return $next($request);
    }
}
