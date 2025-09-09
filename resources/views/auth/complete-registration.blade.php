@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">{{ __('Completar Registro') }}</h4>
                </div>

                <div class="card-body">
                    <div class="alert alert-info">
                        <h5><i class="fas fa-info-circle"></i> Información Importante</h5>
                        <p class="mb-0">Para activar tu suscripción, necesitas subir tu comprobante de pago. Una vez que nuestro equipo lo apruebe, tu cuenta será activada automáticamente.</p>
                    </div>

                    <!-- Información del usuario y plan -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fas fa-building"></i> Datos de la Empresa</h6>
                                    <p class="mb-1"><strong>Empresa:</strong> {{ $user->business_name }}</p>
                                    <p class="mb-1"><strong>Contacto:</strong> {{ $user->first_name }} {{ $user->last_name }}</p>
                                    <p class="mb-0"><strong>Email:</strong> {{ $user->email }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6 class="card-title"><i class="fas fa-credit-card"></i> Plan Seleccionado</h6>
                                    <p class="mb-1"><strong>Plan:</strong> 
                                        @if($user->selected_plan === 'monthly')
                                            <span class="badge badge-primary">Plan Mensual</span>
                                        @else
                                            <span class="badge badge-success">Plan Anual</span>
                                        @endif
                                    </p>
                                    <p class="mb-0"><strong>Monto a pagar:</strong> 
                                        <span class="h5 text-success">
                                            ${{ $user->selected_plan === 'monthly' ? '29.99' : '299.99' }} MXN
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Instrucciones de pago -->
                    <div class="alert alert-warning">
                        <h6><i class="fas fa-exclamation-triangle"></i> Instrucciones de Pago</h6>
                        <ol class="mb-0">
                            <li>Realiza el pago por el monto indicado a nuestra cuenta bancaria</li>
                            <li>Sube tu comprobante de pago usando el formulario de abajo</li>
                            <li>Espera la aprobación de nuestro equipo (24-48 horas)</li>
                            <li>Recibirás un email de confirmación cuando tu cuenta sea activada</li>
                        </ol>
                    </div>

                    <!-- Formulario de subida de comprobante -->
                    <form method="POST" action="{{ route('complete.registration.store', $user->id) }}" enctype="multipart/form-data">
                        @csrf

                        <div class="form-group">
                            <label for="payment_proof" class="form-label">
                                <i class="fas fa-upload"></i> {{ __('Comprobante de Pago') }} <span class="text-danger">*</span>
                            </label>
                            <input id="payment_proof" type="file" class="form-control @error('payment_proof') is-invalid @enderror" 
                                   name="payment_proof" accept=".jpg,.jpeg,.png,.pdf" required>
                            <small class="form-text text-muted">
                                Formatos permitidos: JPG, JPEG, PNG, PDF. Tamaño máximo: 5MB
                            </small>
                            @error('payment_proof')
                                <span class="invalid-feedback" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                        </div>

                        <div class="form-group mb-0">
                            <button type="submit" class="btn btn-primary btn-lg btn-block">
                                <i class="fas fa-cloud-upload-alt"></i> {{ __('Subir Comprobante y Completar Registro') }}
                            </button>
                        </div>
                    </form>

                    <hr>
                    
                    <div class="text-center">
                        <p class="text-muted mb-0">
                            <i class="fas fa-question-circle"></i> 
                            ¿Tienes problemas? <a href="mailto:soporte@tuvitrina.com">Contáctanos</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: 1px solid rgba(0, 0, 0, 0.125);
}

.alert {
    border-radius: 0.375rem;
}

.btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
}

.badge {
    font-size: 0.875em;
}
</style>
@endsection