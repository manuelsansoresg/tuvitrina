<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class Profile extends Component
{
    public $name;
    public $last_name;
    public $email;
    public $phone;
    public $current_password;
    public $password;
    public $password_confirmation;
    
    public $showPasswordForm = false;
    
    protected function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore(auth()->id())],
            'phone' => 'nullable|string|max:20',
        ];
        
        if ($this->showPasswordForm) {
            $rules['current_password'] = 'required|string';
            $rules['password'] = 'required|string|min:8|confirmed';
        }
        
        return $rules;
    }
    
    protected $messages = [
        'name.required' => 'El nombre es obligatorio.',
        'last_name.required' => 'El apellido es obligatorio.',
        'email.required' => 'El correo electrónico es obligatorio.',
        'email.email' => 'El correo electrónico debe ser válido.',
        'email.unique' => 'Este correo electrónico ya está en uso.',
        'current_password.required' => 'La contraseña actual es obligatoria.',
        'password.required' => 'La nueva contraseña es obligatoria.',
        'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        'password.confirmed' => 'La confirmación de contraseña no coincide.',
    ];
    
    public function mount()
    {
        $user = auth()->user();
        $this->name = $user->name;
        $this->last_name = $user->last_name;
        $this->email = $user->email;
        $this->phone = $user->phone;
    }
    
    public function updateProfile()
    {
        $this->validate();
        
        $user = auth()->user();
        
        // Verificar contraseña actual si se está cambiando la contraseña
        if ($this->showPasswordForm) {
            if (!Hash::check($this->current_password, $user->password)) {
                $this->addError('current_password', 'La contraseña actual es incorrecta.');
                return;
            }
        }
        
        // Actualizar datos del perfil
        $user->update([
            'name' => $this->name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
        ]);
        
        // Actualizar contraseña si se proporcionó
        if ($this->showPasswordForm && $this->password) {
            $user->update([
                'password' => Hash::make($this->password)
            ]);
            
            // Limpiar campos de contraseña
            $this->current_password = '';
            $this->password = '';
            $this->password_confirmation = '';
            $this->showPasswordForm = false;
        }
        
        session()->flash('message', 'Perfil actualizado correctamente.');
    }
    
    public function togglePasswordForm()
    {
        $this->showPasswordForm = !$this->showPasswordForm;
        
        // Limpiar campos de contraseña al ocultar el formulario
        if (!$this->showPasswordForm) {
            $this->current_password = '';
            $this->password = '';
            $this->password_confirmation = '';
        }
    }
    
    public function render()
    {
        return view('livewire.admin.profile')->layout('layouts.admin');
    }
}
