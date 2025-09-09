@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header text-center">
                    <h4 class="mb-0">¡Registro Exitoso!</h4>
                </div>

                <div class="card-body">
                    <div class="text-center mb-4">
                        <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        <h5 class="mt-3">Tu cuenta ha sido creada exitosamente</h5>
                        <p class="text-muted">Hemos enviado un correo electrónico con las instrucciones para completar tu registro.</p>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-header">
                                    <h6 class="mb-0"><i class="fas fa-user"></i> Datos de la Cuenta</h6>
                                </div>
                                <div class="card-body">
                                    <p><strong>Nombre:</strong> {{ $userData['name'] }}</p>
                                    <p><strong>Email:</strong> {{ $userData['email'] }}</p>
                                    <p><strong>Teléfono:</strong> {{ $userData['phone'] }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card bg-light">
                                <div class="card-header">
                                    <h6 class="mb-0"><i class="fas fa-credit-card"></i> Plan Seleccionado</h6>
                                </div>
                                <div class="card-body">
                                    <p><strong>Plan:</strong> {{ $userData['plan_name'] }}</p>
                                    <p><strong>Duración:</strong> {{ $userData['duration'] }}</p>
                                    <p><strong>Monto:</strong> 
                                        <span class="h5 text-primary">${{ number_format($userData['amount'], 2) }} MXN</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="alert alert-info mt-4">
                        <h6><i class="fas fa-info-circle"></i> Próximos Pasos:</h6>
                        <ol class="mb-0">
                            <li>Revisa tu correo electrónico (incluyendo la carpeta de spam)</li>
                            <li>Haz clic en el enlace del correo para completar tu registro</li>
                            <li>Sube tu comprobante de pago por el monto de <strong>${{ number_format($userData['amount'], 2) }} MXN</strong></li>
                            <li>Espera la aprobación de nuestro equipo (24-48 horas)</li>
                        </ol>
                    </div>

                    <div class="alert alert-warning">
                        <h6><i class="fas fa-exclamation-triangle"></i> Importante:</h6>
                        <p class="mb-0">Tu cuenta permanecerá inactiva hasta que completes el proceso de verificación de pago. Una vez aprobado tu comprobante, tu suscripción se activará automáticamente.</p>
                    </div>

                    <div class="text-center mt-4">
                        <a href="{{ route('admin.dashboard') }}" class="btn btn-primary">
                            <i class="fas fa-tachometer-alt"></i> Ir al Panel de Control
                        </a>
                        <a href="{{ route('logout') }}" class="btn btn-outline-secondary ml-2"
                           onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </a>
                        <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
                            @csrf
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.text-success {
    color: #28a745 !important;
}

.text-primary {
    color: #007bff !important;
}

.alert {
    border-radius: 0.375rem;
}

.btn {
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
}
</style>
@endsection