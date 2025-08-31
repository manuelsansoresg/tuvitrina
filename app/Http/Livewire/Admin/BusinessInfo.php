<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use Livewire\WithFileUploads;
use App\Models\Business;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BusinessInfo extends Component
{
    use WithFileUploads;
    
    public $business_name;
    public $about;
    public $cover_image;
    public $current_cover_image;
    public $facebook_url;
    public $instagram_url;
    public $twitter_url;
    public $accepts_bank_transfer = false;
    public $bank_name;
    public $account_number;
    public $account_holder;
    public $clabe;
    
    protected $rules = [
        'business_name' => 'required|string|max:255',
        'about' => 'nullable|string|max:2000',
        'cover_image' => 'nullable|image|max:2048', // 2MB Max
        'facebook_url' => 'nullable|url|max:255',
        'instagram_url' => 'nullable|url|max:255',
        'twitter_url' => 'nullable|url|max:255',
        'accepts_bank_transfer' => 'boolean',
        'bank_name' => 'nullable|string|max:255',
        'account_number' => 'nullable|string|max:50',
        'account_holder' => 'nullable|string|max:255',
        'clabe' => 'nullable|string|size:18',
    ];
    
    protected $messages = [
        'business_name.required' => 'El nombre del negocio es obligatorio.',
        'business_name.max' => 'El nombre del negocio no puede exceder 255 caracteres.',
        'about.max' => 'La descripción no puede exceder 2000 caracteres.',
        'cover_image.image' => 'El archivo debe ser una imagen.',
        'cover_image.max' => 'La imagen no puede ser mayor a 2MB.',
        'facebook_url.url' => 'La URL de Facebook debe ser válida.',
        'instagram_url.url' => 'La URL de Instagram debe ser válida.',
        'twitter_url.url' => 'La URL de Twitter debe ser válida.',
        'clabe.size' => 'La CLABE debe tener exactamente 18 dígitos.',
    ];
    
    public function mount()
    {
        $business = auth()->user()->business;
        
        if ($business) {
            $this->business_name = $business->business_name;
            $this->about = $business->about;
            $this->current_cover_image = $business->cover_image;
            $this->facebook_url = $business->facebook_url;
            $this->instagram_url = $business->instagram_url;
            $this->twitter_url = $business->twitter_url;
            $this->accepts_bank_transfer = $business->accepts_bank_transfer;
            $this->bank_name = $business->bank_name;
            $this->account_number = $business->account_number;
            $this->account_holder = $business->account_holder;
            $this->clabe = $business->clabe;
        }
    }
    
    public function saveBusiness()
    {
        $this->validate();
        
        $user = auth()->user();
        $business = $user->business ?: new Business();
        
        // Manejar subida de imagen
        $coverImagePath = $this->current_cover_image;
        if ($this->cover_image) {
            // Eliminar imagen anterior si existe
            if ($this->current_cover_image) {
                $fullPath = public_path($this->current_cover_image);
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }
            
            // Guardar nueva imagen
            $filename = Str::random(20) . '.' . $this->cover_image->getClientOriginalExtension();
            $destinationPath = public_path('images/business');
            $this->cover_image->move($destinationPath, $filename);
            $coverImagePath = 'images/business/' . $filename;
        }
        
        // Preparar datos para guardar
        $businessData = [
            'user_id' => $user->id,
            'business_name' => $this->business_name,
            'about' => $this->about,
            'cover_image' => $coverImagePath,
            'facebook_url' => $this->facebook_url,
            'instagram_url' => $this->instagram_url,
            'twitter_url' => $this->twitter_url,
            'accepts_bank_transfer' => $this->accepts_bank_transfer,
            'bank_name' => $this->accepts_bank_transfer ? $this->bank_name : null,
            'account_number' => $this->accepts_bank_transfer ? $this->account_number : null,
            'account_holder' => $this->accepts_bank_transfer ? $this->account_holder : null,
            'clabe' => $this->accepts_bank_transfer ? $this->clabe : null,
        ];
        
        if ($business->exists) {
            $business->update($businessData);
        } else {
            Business::create($businessData);
        }
        
        // Actualizar imagen actual para la vista
        $this->current_cover_image = $coverImagePath;
        $this->cover_image = null;
        
        session()->flash('message', 'Información del negocio guardada correctamente.');
    }
    
    public function removeCoverImage()
    {
        if ($this->current_cover_image) {
            $fullPath = public_path($this->current_cover_image);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            $business = auth()->user()->business;
            if ($business) {
                $business->update(['cover_image' => null]);
            }
            
            $this->current_cover_image = null;
            session()->flash('message', 'Imagen de portada eliminada correctamente.');
        }
    }
    
    public function render()
    {
        return view('livewire.admin.business-info')->layout('layouts.admin');
    }
}
