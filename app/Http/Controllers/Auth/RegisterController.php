<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\Models\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
        return User::create([
            'name' => $data['first_name'] . ' ' . $data['paternal_last_name'],
            'first_name' => $data['first_name'],
            'paternal_last_name' => $data['paternal_last_name'],
            'maternal_last_name' => $data['maternal_last_name'] ?? null,
            'phone' => $data['phone'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'selected_plan' => $data['selected_plan'],
        ]);
    }
}
