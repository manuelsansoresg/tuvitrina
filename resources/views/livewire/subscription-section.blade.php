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

    <div class="row">
        <!-- Información de Suscripción -->
        <div class="col-md-8">
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
                                    {{ ucfirst($user->subscription_status) }}
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
                    
                    @if(!$isSuperAdmin && ($this->isSubscriptionExpiringSoon() || $this->isSubscriptionExpired()))
                        <div class="alert alert-warning mt-3">
                            <i class="fas fa-exclamation-triangle"></i>
                            @if($this->isSubscriptionExpired())
                                Tu suscripción ha vencido. Renueva ahora para continuar usando todos los servicios.
                            @else
                                Tu suscripción vence en {{ $this->getDaysUntilExpiration() }} días. Te recomendamos renovar para evitar interrupciones.
                            @endif
                        </div>
                        
                        @if(!$showRenewalForm)
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

        <!-- Historial de Pagos -->
        <div class="col-md-4">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Historial de Pagos</h5>
                </div>
                <div class="card-body">
                    @if($subscriptionPayments->count() > 0)
                        @foreach($subscriptionPayments as $payment)
                            <div class="border-bottom pb-2 mb-2">
                                <div class="d-flex justify-content-between">
                                    <small class="text-muted">{{ $payment->created_at->format('d/m/Y') }}</small>
                                    <span class="badge bg-{{ $payment->status === 'completed' ? 'success' : ($payment->status === 'pending' ? 'warning' : 'danger') }}">
                                        {{ $payment->status_label }}
                                    </span>
                                </div>
                                <p class="mb-1">{{ $payment->plan_type_label }}</p>
                                <p class="mb-0 text-muted">${{ number_format($payment->amount, 2) }}</p>
                            </div>
                        @endforeach
                    @else
                        <p class="text-muted">No hay pagos registrados.</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
