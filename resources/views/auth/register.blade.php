@extends('layouts.auth')

@section('title', 'Registro')

@section('content')
<div class="text-center mb-4">
    <h2 class="fw-bold text-dark mb-2">Crear Cuenta</h2>
    <p class="text-muted">Únete a TuVitrina y comienza a vender tus productos</p>
</div>

<form method="POST" action="{{ route('register') }}">
    @csrf
    
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="first_name" class="form-label">
                <i class="fas fa-user me-2"></i>Nombre
            </label>
            <input id="first_name" type="text" class="form-control @error('first_name') is-invalid @enderror" 
                   name="first_name" value="{{ old('first_name') }}" required autocomplete="given-name" autofocus 
                   placeholder="Tu nombre">
            @error('first_name')
                <div class="invalid-feedback">
                    <strong>{{ $message }}</strong>
                </div>
            @enderror
        </div>
        
        <div class="col-md-6 mb-3">
            <label for="paternal_last_name" class="form-label">
                <i class="fas fa-user me-2"></i>Apellido Paterno
            </label>
            <input id="paternal_last_name" type="text" class="form-control @error('paternal_last_name') is-invalid @enderror" 
                   name="paternal_last_name" value="{{ old('paternal_last_name') }}" required autocomplete="family-name" 
                   placeholder="Apellido paterno">
            @error('paternal_last_name')
                <div class="invalid-feedback">
                    <strong>{{ $message }}</strong>
                </div>
            @enderror
        </div>
    </div>
    
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="maternal_last_name" class="form-label">
                <i class="fas fa-user me-2"></i>Apellido Materno
            </label>
            <input id="maternal_last_name" type="text" class="form-control @error('maternal_last_name') is-invalid @enderror" 
                   name="maternal_last_name" value="{{ old('maternal_last_name') }}" autocomplete="family-name" 
                   placeholder="Apellido materno (opcional)">
            @error('maternal_last_name')
                <div class="invalid-feedback">
                    <strong>{{ $message }}</strong>
                </div>
            @enderror
        </div>
        
        <div class="col-md-6 mb-3">
            <label for="phone" class="form-label">
                <i class="fas fa-phone me-2"></i>Teléfono Celular
            </label>
            <input id="phone" type="tel" class="form-control @error('phone') is-invalid @enderror" 
                   name="phone" value="{{ old('phone') }}" required autocomplete="tel" 
                   placeholder="Ej: 5551234567">
            @error('phone')
                <div class="invalid-feedback">
                    <strong>{{ $message }}</strong>
                </div>
            @enderror
        </div>
    </div>
    
    <div class="mb-3">
        <label for="email" class="form-label">
            <i class="fas fa-envelope me-2"></i>Correo Electrónico
        </label>
        <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" 
               name="email" value="{{ old('email') }}" required autocomplete="email" 
               placeholder="tu@email.com">
        @error('email')
            <div class="invalid-feedback">
                <strong>{{ $message }}</strong>
            </div>
        @enderror
    </div>
    
    <div class="row">
        <div class="col-md-6 mb-3">
            <label for="password" class="form-label">
                <i class="fas fa-lock me-2"></i>Contraseña
            </label>
            <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" 
                   name="password" required autocomplete="new-password" 
                   placeholder="Mínimo 8 caracteres">
            @error('password')
                <div class="invalid-feedback">
                    <strong>{{ $message }}</strong>
                </div>
            @enderror
        </div>
        
        <div class="col-md-6 mb-3">
            <label for="password-confirm" class="form-label">
                <i class="fas fa-lock me-2"></i>Confirmar Contraseña
            </label>
            <input id="password-confirm" type="password" class="form-control" 
                   name="password_confirmation" required autocomplete="new-password" 
                   placeholder="Repite tu contraseña">
        </div>
    </div>
    
    <div class="d-grid mb-3">
        <button type="submit" class="btn btn-primary btn-lg">
            <i class="fas fa-user-plus me-2"></i>Crear Mi Cuenta
        </button>
    </div>
    
    <div class="auth-links">
        <p class="mb-0">¿Ya tienes una cuenta? 
            <a href="{{ route('login') }}">Inicia sesión aquí</a>
        </p>
    </div>
</form>
@endsection
