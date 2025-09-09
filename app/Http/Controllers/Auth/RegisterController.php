<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\Models\User;
use App\Notifications\WelcomeSubscriptionNotification;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Show the application registration form with optional plan parameter.
     *
     * @param  string|null  $plan
     * @return \Illuminate\Http\Response
     */
    public function showRegistrationForm($plan = null)
    {
        // Validar que el plan sea válido si se proporciona
        if ($plan && !in_array($plan, ['monthly', 'annual'])) {
            $plan = null;
        }

        return view('auth.register', compact('plan'));
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'first_name' => ['required', 'string', 'max:255'],
            'paternal_last_name' => ['required', 'string', 'max:255'],
            'maternal_last_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:15'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'selected_plan' => ['required', 'string', 'in:monthly,annual'],
        ], [
            'selected_plan.required' => 'Debes seleccionar un plan para continuar con el registro.',
            'selected_plan.in' => 'El plan seleccionado no es válido.',
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\Models\User
     */
    protected function create(array $data)
    {
        // Crear usuario con estado de registro incompleto
        $user = User::create([
            'name' => $data['first_name'] . ' ' . $data['paternal_last_name'],
            'first_name' => $data['first_name'],
            'paternal_last_name' => $data['paternal_last_name'],
            'maternal_last_name' => $data['maternal_last_name'] ?? null,
            'phone' => $data['phone'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'selected_plan' => $data['selected_plan'],
            'subscription_expires_at' => null,
            'subscription_status' => 'incomplete', // Estado inicial hasta completar registro
            'last_payment_date' => null,
        ]);
        
        // Crear orden pendiente (sin comprobante aún)
        $amount = $data['selected_plan'] === 'monthly' ? 29.99 : 299.99;
        
        // Calcular fecha de expiración temporal
        $expiresAt = $data['selected_plan'] === 'monthly' ? 
            Carbon::now()->addMonth() : 
            Carbon::now()->addYear();
            
        \App\Models\SubscriptionPayment::create([
            'user_id' => $user->id,
            'plan_type' => $data['selected_plan'] === 'annual' ? 'yearly' : $data['selected_plan'], // Convertir annual a yearly
            'amount' => $amount,
            'status' => 'incomplete', // Estado inicial hasta subir comprobante
            'payment_method' => 'transfer',
            'payment_proof_path' => null, // Se llenará cuando suban el comprobante
            'payment_date' => null, // Se llenará cuando suban el comprobante
            'expires_at' => $expiresAt, // Campo requerido
        ]);
        
        return $user;
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function register(Request $request)
    {
        $this->validator($request->all())->validate();

        $user = $this->create($request->all());

        // Autenticar al usuario
        Auth::login($user);

        // Enviar email de bienvenida con enlace para completar registro
        $user->notify(new WelcomeSubscriptionNotification());

        // Redirigir a página de confirmación con datos del registro
        return redirect()->route('register.confirmation')
            ->with('user_data', [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'plan' => $user->selected_plan,
                'amount' => $user->selected_plan === 'monthly' ? 29.99 : 299.99
            ]);
    }
}
