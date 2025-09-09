@extends('layouts.auth')

@section('title', 'Registro')

@section('content')
<div class="text-center mb-4">
    <h2 class="fw-bold text-dark mb-2">Crear Cuenta</h2>
    <p class="text-muted">Únete a TuVitrina y comienza a vender tus productos</p>
</div>

<form method="POST" action="{{ route('register') }}" enctype="multipart/form-data">
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
    
    <!-- Plan Selection -->
    <div class="mb-4">
        <label class="form-label fw-bold">
            <i class="fas fa-crown me-2"></i>Selecciona tu Plan
        </label>
        <p class="text-muted small mb-3">Debes seleccionar un plan para continuar con el registro</p>
        
        <div class="row g-3">
            <div class="col-md-6">
                <div class="plan-option">
                    <input type="radio" class="btn-check" name="selected_plan" id="plan_monthly" value="monthly" required {{ (old('selected_plan', $plan ?? '') == 'monthly') ? 'checked' : '' }}>
                    <label class="btn btn-outline-primary w-100 p-3" for="plan_monthly">
                        <div class="d-flex flex-column align-items-center">
                            <i class="fas fa-rocket fs-4 mb-2"></i>
                            <strong>Plan Mensual</strong>
                            <span class="text-muted small">$100/mes</span>
                            <span class="badge bg-success mt-1">¡3 meses gratis!</span>
                        </div>
                    </label>
                </div>
            </div>
            <div class="col-md-6">
                <div class="plan-option">
                    <input type="radio" class="btn-check" name="selected_plan" id="plan_annual" value="annual" required {{ (old('selected_plan', $plan ?? '') == 'annual') ? 'checked' : '' }}>
                    <label class="btn btn-outline-warning w-100 p-3" for="plan_annual">
                        <div class="d-flex flex-column align-items-center">
                            <i class="fas fa-crown fs-4 mb-2"></i>
                            <strong>Plan Anual</strong>
                            <span class="text-muted small">$1,000/año</span>
                            <span class="badge bg-warning text-dark mt-1">¡Más popular!</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        
        @error('selected_plan')
            <div class="text-danger mt-2">
                <small><strong>{{ $message }}</strong></small>
            </div>
        @enderror
    </div>



    <!-- Información del proceso -->
    <div class="alert alert-info mb-4">
        <h6><i class="fas fa-info-circle me-2"></i>Proceso de Registro</h6>
        <p class="mb-0">Después de crear tu cuenta, recibirás un correo electrónico con las instrucciones para completar tu registro y activar tu suscripción.</p>
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
