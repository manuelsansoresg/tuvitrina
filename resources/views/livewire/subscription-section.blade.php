<div>
    @if (session()->has('message'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('message') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif
    
    @if (session()->has('error'))
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if($isSuperAdmin)
        <!-- Vista para SuperAdmin: Todas las suscripciones -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Gestión de Suscripciones - Todas las Cuentas</h5>
            </div>
            <div class="card-body">
                @if($allUsers->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Plan</th>
                                    <th>Estado</th>
                                    <th>Fecha Vencimiento</th>
                                    <th>Último Pago</th>
                                    <th>Historial de Pagos</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($allUsers as $userItem)
                                    <tr>
                                        <td>
                                            <strong>{{ $userItem->first_name }} {{ $userItem->paternal_last_name }}</strong><br>
                                            <small class="text-muted">ID: {{ $userItem->id }}</small>
                                        </td>
                                        <td>{{ $userItem->email }}</td>
                                        <td>
                                            <span class="badge bg-info">
                                                {{ $userItem->selected_plan === 'monthly' ? 'Mensual' : 'Anual' }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge bg-{{ $userItem->subscription_status === 'active' ? 'success' : ($userItem->subscription_status === 'expired' ? 'danger' : 'warning') }}">
                                                @if($userItem->subscription_status === 'active')
                                                    Activo
                                                @elseif($userItem->subscription_status === 'expired')
                                                    Vencido
                                                @elseif($userItem->subscription_status === 'pending')
                                                    Pendiente
                                                @elseif($userItem->subscription_status === 'pending_approval')
                                                    Pendiente de Aprobación
                                                @else
                                                    {{ ucfirst($userItem->subscription_status) }}
                                                @endif
                                            </span>
                                        </td>
                                        <td>
                                            {{ $userItem->subscription_expires_at ? $userItem->subscription_expires_at->format('d/m/Y') : 'No definida' }}
                                        </td>
                                        <td>
                                            {{ $userItem->last_payment_date ? $userItem->last_payment_date->format('d/m/Y') : 'Sin pagos' }}
                                        </td>
                                        <td>
                                            @if($userItem->subscriptionPayments->count() > 0)
                                                <button class="btn btn-sm btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#payments-{{ $userItem->id }}" aria-expanded="false">
                                                    Ver {{ $userItem->subscriptionPayments->count() }} pago(s)
                                                </button>
                                                <div class="collapse mt-2" id="payments-{{ $userItem->id }}">
                                                    <div class="card card-body">
                                                        @foreach($userItem->subscriptionPayments->take(5) as $payment)
                                                            <div class="border-bottom pb-2 mb-2">
                                                                <div class="d-flex justify-content-between">
                                                                    <small class="text-muted">{{ $payment->created_at->format('d/m/Y H:i') }}</small>
                                                                    <span class="badge bg-{{ $payment->status === 'completed' ? 'success' : ($payment->status === 'pending' ? 'warning' : ($payment->status === 'incomplete' ? 'info' : 'danger')) }}">
                                                                        {{ $payment->status_label }}
                                                                    </span>
                                                                </div>
                                                                <p class="mb-1">{{ $payment->plan_type_label }}</p>
                                                                <p class="mb-1 text-muted">${{ number_format($payment->amount, 2) }}</p>
                                                                @if($payment->payment_reference)
                                                                    <small class="text-muted d-block">Ref: {{ $payment->payment_reference }}</small>
                                                                @endif
                                                                
                                                                <div class="mt-2">
                                                                    @if($payment->payment_proof_path)
                                                                        <a href="{{ asset('subscription-proofs/' . $payment->payment_proof_path) }}" 
                                                                           target="_blank" class="btn btn-sm btn-outline-info me-1">
                                                                            <i class="fas fa-eye"></i> Ver Comprobante
                                                                        </a>
                                                                    @endif
                                                                    
                                                                    @if(in_array($payment->status, ['pending', 'incomplete']))
                                                                        <button wire:click="approvePayment({{ $payment->id }})" 
                                                                                class="btn btn-sm btn-success me-1"
                                                                                onclick="return confirm('¿Aprobar este pago?')">
                                                                            <i class="fas fa-check"></i> Aprobar
                                                                        </button>
                                                                        <button wire:click="rejectPayment({{ $payment->id }})" 
                                                                                class="btn btn-sm btn-danger"
                                                                                onclick="return confirm('¿Rechazar este pago?')">
                                                                            <i class="fas fa-times"></i> Rechazar
                                                                        </button>
                                                                    @endif
                                                                </div>
                                                            </div>
                                                        @endforeach
                                                    </div>
                                                </div>
                                            @else
                                                <span class="text-muted">Sin pagos</span>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="text-muted">No hay usuarios con suscripciones registradas.</p>
                @endif
            </div>
        </div>
    @else
        <!-- Vista para usuarios normales -->
        <!-- Información de Suscripción -->
        <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Estado de Suscripción</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Plan Actual:</strong> {{ $this->getPlanTypeLabel($user->selected_plan) }}</p>
                            <p><strong>Estado:</strong> 
                                <span class="badge bg-{{ $user->subscription_status === 'active' ? 'success' : ($user->subscription_status === 'expired' ? 'danger' : 'warning') }}">
                                    @if($user->subscription_status === 'active')
                                        Activo
                                    @elseif($user->subscription_status === 'expired')
                                        Vencido
                                    @elseif($user->subscription_status === 'pending')
                                        Pendiente
                                    @elseif($user->subscription_status === 'pending_approval')
                                        Pendiente de Aprobación
                                    @else
                                        {{ ucfirst($user->subscription_status) }}
                                    @endif
                                </span>
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Fecha de Vencimiento:</strong> 
                                {{ $user->subscription_expires_at ? $user->subscription_expires_at->format('d/m/Y') : 'No definida' }}
                            </p>
                            @if($user->subscription_expires_at)
                                <p><strong>Días Restantes:</strong> 
                                    <span class="badge bg-{{ $this->getDaysUntilExpiration() <= 5 ? 'danger' : ($this->getDaysUntilExpiration() <= 15 ? 'warning' : 'info') }}">
                                        {{ $this->getDaysUntilExpiration() }} días
                                    </span>
                                </p>
                            @endif
                        </div>
                    </div>
                    
                    @if(!$isSuperAdmin)
                        @if(in_array($user->subscription_status, ['pending', 'pending_approval']))
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-clock"></i>
                                @if($user->subscription_status === 'pending')
                                    <strong>En proceso de verificación.</strong> Estamos verificando tu pago. Tu cuenta será activada pronto. ¡Gracias por tu paciencia!.
                                @elseif($user->subscription_status === 'pending_approval')
                                    <strong>En proceso de verificación.</strong> Tu comprobante de pago está siendo verificado por nuestro equipo. Te notificaremos una vez que sea aprobado.
                                @endif
                            </div>
                        @elseif($this->isSubscriptionExpiringSoon() || $this->isSubscriptionExpired())
                            <div class="alert alert-warning mt-3">
                                <i class="fas fa-exclamation-triangle"></i>
                                @if($this->isSubscriptionExpired())
                                    Tu suscripción ha vencido. Renueva ahora para continuar usando todos los servicios.
                                @else
                                    Tu suscripción vence en {{ $this->getDaysUntilExpiration() }} días. Te recomendamos renovar para evitar interrupciones.
                                @endif
                            </div>
                        @endif
                        
                        @if(!$showRenewalForm && !in_array($user->subscription_status, ['pending', 'pending_approval']) && $user->subscription_expires_at)
                            <button wire:click="showRenewalOptions" class="btn btn-primary">
                                <i class="fas fa-sync-alt"></i> Renovar Suscripción
                            </button>
                        @endif
                    @endif
                </div>
            </div>

            <!-- Formulario de Renovación -->
            @if(!$isSuperAdmin && $showRenewalForm)
                <div class="card mt-4">
                    <div class="card-header">
                        <h5 class="mb-0">Renovar Suscripción</h5>
                    </div>
                    <div class="card-body">
                        <form wire:submit.prevent="submitRenewal">
                            <div class="mb-3">
                                <label class="form-label">Seleccionar Plan</label>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="card {{ $selectedPlan === 'monthly' ? 'border-primary' : '' }}">
                                            <div class="card-body text-center">
                                                <input type="radio" wire:model="selectedPlan" value="monthly" id="monthly" class="form-check-input">
                                                <label for="monthly" class="form-check-label d-block">
                                                    <h6>Plan Mensual</h6>
                                                    <p class="text-muted">$29.99/mes</p>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card {{ $selectedPlan === 'yearly' ? 'border-primary' : '' }}">
                                            <div class="card-body text-center">
                                                <input type="radio" wire:model="selectedPlan" value="yearly" id="yearly" class="form-check-input">
                                                <label for="yearly" class="form-check-label d-block">
                                                    <h6>Plan Anual</h6>
                                                    <p class="text-muted">$299.99/año</p>
                                                    <small class="text-success">¡Ahorra 2 meses!</small>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                @error('selectedPlan') <span class="text-danger">{{ $message }}</span> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="paymentProof" class="form-label">Comprobante de Pago</label>
                                <input type="file" wire:model="paymentProof" class="form-control" id="paymentProof" accept="image/*">
                                @error('paymentProof') <span class="text-danger">{{ $message }}</span> @enderror
                            </div>

                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-paper-plane"></i> Enviar Solicitud
                                </button>
                                <button type="button" wire:click="hideRenewalForm" class="btn btn-secondary">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            @endif
        </div>
        </div>

        <!-- Historial de Pagos -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Historial de Pagos</h5>
                    </div>
                    <div class="card-body">
                        @if($subscriptionPayments->count() > 0)
                            <div class="row">
                                @foreach($subscriptionPayments as $payment)
                                    <div class="col-md-6 col-lg-4 mb-3">
                                        <div class="card h-100">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <small class="text-muted">{{ $payment->created_at->format('d/m/Y H:i') }}</small>
                                                    <span class="badge bg-{{ $payment->status === 'completed' ? 'success' : ($payment->status === 'pending' ? 'warning' : ($payment->status === 'incomplete' ? 'info' : 'danger')) }}">
                                                        {{ $payment->status_label }}
                                                    </span>
                                                </div>
                                                <h6 class="card-title">{{ $payment->plan_type_label }}</h6>
                                                <p class="card-text">
                                                    <strong>${{ number_format($payment->amount, 2) }}</strong>
                                                </p>
                                                @if($payment->payment_method)
                                                    <p class="card-text">
                                                        <small class="text-muted">Método: {{ ucfirst($payment->payment_method) }}</small>
                                                    </p>
                                                @endif
                                                @if($payment->verified_at)
                                                    <p class="card-text">
                                                        <small class="text-success">Verificado: {{ $payment->verified_at->format('d/m/Y') }}</small>
                                                    </p>
                                                @endif
                                                @if($payment->expires_at)
                                                    <p class="card-text">
                                                        <small class="text-info">Vence: {{ $payment->expires_at->format('d/m/Y') }}</small>
                                                    </p>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <div class="text-center py-4">
                                <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                                <p class="text-muted">No hay pagos registrados.</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
    @endif
</div>
