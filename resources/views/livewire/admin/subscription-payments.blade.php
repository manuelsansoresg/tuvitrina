<div>
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">Gestión de Comprobantes de Registro</h4>
        <div class="d-flex gap-2">
            <select wire:model="statusFilter" class="form-select form-select-sm" style="width: auto;">
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completados</option>
                <option value="failed">Fallidos</option>
                <option value="refunded">Reembolsados</option>
                <option value="incomplete">Incompletos</option>
            </select>
        </div>
    </div>

    @if (session()->has('message'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('message') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card">
        <div class="card-body">
            @if($payments->count() > 0)
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Plan</th>
                                <th>Monto</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Comprobante</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($payments as $payment)
                                <tr>
                                    <td>
                                        <div>
                                            <strong>{{ $payment->user->name }}</strong><br>
                                            <small class="text-muted">{{ $payment->user->email }}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-{{ $payment->plan_type === 'monthly' ? 'primary' : 'warning' }}">
                                            {{ $payment->plan_type === 'monthly' ? 'Mensual' : 'Anual' }}
                                        </span>
                                    </td>
                                    <td>${{ number_format($payment->amount, 2) }}</td>
                                    <td>{{ $payment->payment_date->format('d/m/Y H:i') }}</td>
                                    <td>
                                        <span class="badge bg-{{ $payment->status === 'completed' ? 'success' : ($payment->status === 'pending' ? 'warning' : 'danger') }}">
                                            {{ $payment->status_label }}
                                        </span>
                                    </td>
                                    <td>
                                        @if($payment->payment_proof_path)
                                            <a href="{{ asset('subscription-proofs/' . $payment->payment_proof_path) }}" 
                                               target="_blank" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-eye"></i> Ver
                                            </a>
                                        @else
                                            <span class="text-muted">Sin comprobante</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($payment->status === 'pending' || $payment->status === 'incomplete')
                                            <div class="btn-group" role="group">
                                                <button type="button" 
                                                        wire:click="approvePayment({{ $payment->id }})" 
                                                        class="btn btn-sm btn-success"
                                                        onclick="return confirm('¿Aprobar este comprobante?')">
                                                    <i class="fas fa-check"></i> Aprobar
                                                </button>
                                                <button type="button" 
                                                        wire:click="rejectPayment({{ $payment->id }})" 
                                                        class="btn btn-sm btn-danger"
                                                        onclick="return confirm('¿Rechazar este comprobante?')">
                                                    <i class="fas fa-times"></i> Rechazar
                                                </button>
                                            </div>
                                        @else
                                            <span class="text-muted">Procesado</span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>


            @else
                <div class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay comprobantes de pago</h5>
                    <p class="text-muted">Los comprobantes de registro aparecerán aquí cuando los usuarios se registren.</p>
                </div>
            @endif
        </div>
    </div>
</div>