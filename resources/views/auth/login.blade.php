@extends('layouts.auth')

@section('title', 'Iniciar Sesión')

@section('content')
<div class="text-center mb-4">
    <h2 class="fw-bold text-dark mb-2">Bienvenido de Vuelta</h2>
    <p class="text-muted">Inicia sesión para acceder a tu vitrina digital</p>
</div>

<form method="POST" action="{{ route('login') }}">
    @csrf
    
    <div class="mb-3">
        <label for="email" class="form-label">
            <i class="fas fa-envelope me-2"></i>Correo Electrónico
        </label>
        <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" 
               name="email" value="{{ old('email') }}" required autocomplete="email" autofocus 
               placeholder="tu@email.com">
        @error('email')
            <div class="invalid-feedback">
                <strong>{{ $message }}</strong>
            </div>
        @enderror
    </div>
    
    <div class="mb-3">
        <label for="password" class="form-label">
            <i class="fas fa-lock me-2"></i>Contraseña
        </label>
        <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" 
               name="password" required autocomplete="current-password" 
               placeholder="Tu contraseña">
        @error('password')
            <div class="invalid-feedback">
                <strong>{{ $message }}</strong>
            </div>
        @enderror
    </div>
    
    <div class="mb-3">
        <div class="form-check">
            <input class="form-check-input" type="checkbox" name="remember" id="remember" 
                   {{ old('remember') ? 'checked' : '' }}>
            <label class="form-check-label" for="remember">
                Recordarme
            </label>
        </div>
    </div>
    
    <div class="d-grid mb-3">
        <button type="submit" class="btn btn-primary btn-lg">
            <i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
        </button>
    </div>
    
    <div class="auth-links">
        @if (Route::has('password.request'))
            <p class="mb-2">
                <a href="{{ route('password.request') }}">¿Olvidaste tu contraseña?</a>
            </p>
        @endif
        
        <p class="mb-0">¿No tienes una cuenta? 
            <a href="{{ route('register') }}">Regístrate aquí</a>
        </p>
    </div>
</form>
@endsection
