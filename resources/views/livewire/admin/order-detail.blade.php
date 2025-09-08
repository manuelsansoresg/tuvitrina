<div>
    <div class="main-content">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>Detalle de Orden #{{ $order->order_number }}</h2>
                        <a href="{{ route('admin.orders') }}" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Volver a Órdenes
                        </a>
                    </div>

                    @if (session()->has('message'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('message') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <div class="row">
                        <!-- Información de la Orden -->
                        <div class="col-md-8">
                            <div class="card mb-4">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Información de la Orden</h5>
                                    <span class="badge 
                                        @if($order->status === 'pending') badge-warning
                                        @elseif($order->status === 'approved') badge-info
                                        @elseif($order->status === 'completed') badge-success
                                        @elseif($order->status === 'rejected') badge-danger
                                        @endif">
                                        {{ ucfirst($order->status) }}
                                    </span>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p><strong>Número de Orden:</strong> {{ $order->order_number }}</p>
                                            <p><strong>Cliente:</strong> {{ $order->customer_name }}</p>
                                            <p><strong>Email:</strong> {{ $order->customer_email }}</p>
                                            <p><strong>Teléfono:</strong> {{ $order->customer_phone }}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <p><strong>Fecha de Orden:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
                                            <p><strong>Total:</strong> ${{ number_format($order->total_amount, 0, ',', '.') }}</p>
                                            @if($order->notes)
                                                <p><strong>Notas:</strong> {{ $order->notes }}</p>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Productos de la Orden -->
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5 class="mb-0">Productos</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Precio</th>
                                                    <th>Cantidad</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach($order->items as $item)
                                                <tr>
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            @if($item->product->image)
                                                                <img src="{{ asset('images/products/' . $item->product->image) }}" 
                                                                     alt="{{ $item->product->name }}" 
                                                                     class="me-3" 
                                                                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                                                            @endif
                                                            <div>
                                                                <strong>{{ $item->product_name }}</strong>
                                                                @if($item->product->description)
                                                                    <br><small class="text-muted">{{ Str::limit($item->product->description, 50) }}</small>
                                                                @endif
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${{ number_format($item->price, 0, ',', '.') }}</td>
                                                    <td>{{ $item->quantity }}</td>
                                                    <td>${{ number_format($item->subtotal, 0, ',', '.') }}</td>
                                                </tr>
                                                @endforeach
                                            </tbody>
                                            <tfoot>
                                                <tr class="table-active">
                                                    <th colspan="3">Total</th>
                                                    <th>${{ number_format($order->total_amount, 0, ',', '.') }}</th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Panel de Acciones -->
                        <div class="col-md-4">
                            <!-- Comprobante de Pago -->
                            @if($order->paymentProof)
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5 class="mb-0">Comprobante de Pago</h5>
                                </div>
                                <div class="card-body">
                                    <p><strong>Archivo:</strong> {{ $order->paymentProof->original_filename }}</p>
                                    <p><strong>Subido:</strong> {{ $order->paymentProof->uploaded_at->format('d/m/Y H:i') }}</p>
                                    <p><strong>Estado:</strong> 
                                        @if($order->paymentProof->status === 'pending')
                                            <span class="badge bg-warning">Pendiente</span>
                                        @elseif($order->paymentProof->status === 'approved')
                                            <span class="badge bg-success">Aprobado</span>
                                        @else
                                            <span class="badge bg-danger">Rechazado</span>
                                        @endif
                                    </p>
                                    @if($order->paymentProof->admin_notes)
                                        <p><strong>Notas:</strong> {{ $order->paymentProof->admin_notes }}</p>
                                    @endif
                                    <a href="{{ asset($order->paymentProof->file_path) }}" 
                                       target="_blank" 
                                       class="btn btn-primary btn-sm mb-2">
                                        <i class="fas fa-eye"></i> Ver Comprobante
                                    </a>
                                    
                                    @if($order->paymentProof->status === 'pending')
                                        <hr>
                                        <div class="mt-3">
                                            <label class="form-label">Notas administrativas (opcional)</label>
                                            <textarea wire:model="adminNotes" class="form-control mb-3" rows="2" placeholder="Agregar notas sobre la decisión..."></textarea>
                                            <div class="d-flex gap-2">
                                                <button wire:click="approvePayment({{ $order->paymentProof->id }})" class="btn btn-success btn-sm">
                                                    <i class="fas fa-check"></i> Aprobar
                                                </button>
                                                <button wire:click="rejectPayment({{ $order->paymentProof->id }})" class="btn btn-danger btn-sm">
                                                    <i class="fas fa-times"></i> Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    @endif
                                </div>
                            </div>
                            @endif

                            <!-- Acciones -->
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Acciones</h5>
                                </div>
                                <div class="card-body">
                                    @if($order->status === 'pending')
                                        <button wire:click="$set('showApproveModal', true)" 
                                                class="btn btn-success btn-sm mb-2 w-100">
                                            <i class="fas fa-check"></i> Aprobar Orden
                                        </button>
                                        <button wire:click="$set('showRejectModal', true)" 
                                                class="btn btn-danger btn-sm mb-2 w-100">
                                            <i class="fas fa-times"></i> Rechazar Orden
                                        </button>
                                    @elseif($order->status === 'approved')
                                        <button wire:click="completeOrder" 
                                                class="btn btn-primary btn-sm mb-2 w-100"
                                                onclick="return confirm('¿Está seguro de completar esta orden? Se creará un registro de venta.')">
                                            <i class="fas fa-flag-checkered"></i> Completar Orden
                                        </button>
                                    @elseif($order->status === 'completed')
                                        <div class="alert alert-success">
                                            <i class="fas fa-check-circle"></i> Orden Completada
                                            <br><small>{{ $order->completed_at->format('d/m/Y H:i') }}</small>
                                        </div>
                                    @elseif($order->status === 'rejected')
                                        <div class="alert alert-danger">
                                            <i class="fas fa-times-circle"></i> Orden Rechazada
                                            <br><small>{{ $order->rejected_at->format('d/m/Y H:i') }}</small>
                                            @if($order->rejection_reason)
                                                <br><strong>Razón:</strong> {{ $order->rejection_reason }}
                                            @endif
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

    <!-- Modal de Aprobación -->
    @if($showApproveModal)
    <div class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Aprobar Orden</h5>
                    <button type="button" class="btn-close" wire:click="$set('showApproveModal', false)"></button>
                </div>
                <div class="modal-body">
                    <p>¿Está seguro de que desea aprobar la orden #{{ $order->order_number }}?</p>
                    <p class="text-muted">Una vez aprobada, el cliente será notificado y podrá proceder con el pago.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" wire:click="$set('showApproveModal', false)">Cancelar</button>
                    <button type="button" class="btn btn-success" wire:click="approveOrder">Aprobar Orden</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show"></div>
    @endif

    <!-- Modal de Rechazo -->
    @if($showRejectModal)
    <div class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Rechazar Orden</h5>
                    <button type="button" class="btn-close" wire:click="$set('showRejectModal', false)"></button>
                </div>
                <div class="modal-body">
                    <p>¿Está seguro de que desea rechazar la orden #{{ $order->order_number }}?</p>
                    <div class="mb-3">
                        <label for="rejectionReason" class="form-label">Razón del rechazo *</label>
                        <textarea wire:model="rejectionReason" 
                                  class="form-control @error('rejectionReason') is-invalid @enderror" 
                                  id="rejectionReason" 
                                  rows="3" 
                                  placeholder="Explique por qué se rechaza esta orden..."></textarea>
                        @error('rejectionReason')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" wire:click="$set('showRejectModal', false)">Cancelar</button>
                    <button type="button" class="btn btn-danger" wire:click="rejectOrder">Rechazar Orden</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show"></div>
    @endif

    <style>
        .badge {
            padding: 0.5em 0.75em;
            font-size: 0.875em;
            border-radius: 0.375rem;
        }
        .badge-warning {
            background-color: #ffc107;
            color: #000;
        }
        .badge-info {
            background-color: #0dcaf0;
            color: #000;
        }
        .badge-success {
            background-color: #198754;
            color: #fff;
        }
        .badge-danger {
            background-color: #dc3545;
            color: #fff;
        }
    </style>
</div>