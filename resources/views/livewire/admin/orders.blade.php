<div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Gestión de Órdenes</h1>
    </div>

    <!-- Flash Messages -->
    @if (session()->has('message'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('message') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <!-- Filters -->
    <div class="card mb-4">
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Buscar</label>
                    <input type="text" wire:model="search" class="form-control" placeholder="Número de orden, cliente, email...">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Estado</label>
                    <select wire:model="statusFilter" class="form-select">
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                </div>
                @if(auth()->user()->hasRole('superadmin'))
                <div class="col-md-3">
                    <label class="form-label">Empresa</label>
                    <select wire:model="businessFilter" class="form-select">
                        <option value="all">Todas las empresas</option>
                        @foreach($businesses as $business)
                            <option value="{{ $business->id }}">{{ $business->business_name }}</option>
                        @endforeach
                    </select>
                </div>
                @endif
                <div class="col-md-2">
                    <label class="form-label">Por página</label>
                    <select wire:model="perPage" class="form-select">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <!-- Orders Table -->
    <div class="card">
        <div class="card-body">
            @if($orders->count() > 0)
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Orden</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Comprobante</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($orders as $order)
                                <tr>
                                    <td>
                                        <strong>#{{ $order->order_number }}</strong>
                                        <br>
                                        <small class="text-muted">{{ $order->items->count() }} productos</small>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{{ $order->customer_name }}</strong>
                                            <br>
                                            <small class="text-muted">{{ $order->customer_email }}</small>
                                            @if($order->customer_phone)
                                                <br>
                                                <small class="text-muted">{{ $order->customer_phone }}</small>
                                            @endif
                                        </div>
                                    </td>
                                    <td>
                                        {{ $order->order_date->format('d/m/Y') }}
                                        <br>
                                        <small class="text-muted">{{ $order->order_date->format('H:i') }}</small>
                                    </td>
                                    <td>
                                        <strong>${{ number_format($order->total_amount, 2) }}</strong>
                                    </td>
                                    <td>
                                        @if($order->status === 'pending')
                                            <span class="badge bg-warning">Pendiente</span>
                                        @elseif($order->status === 'confirmed')
                                            <span class="badge bg-info">Confirmada</span>
                                        @elseif($order->status === 'completed')
                                            <span class="badge bg-success">Completada</span>
                                        @else
                                            <span class="badge bg-danger">Cancelada</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($order->paymentProof)
                                            @if($order->paymentProof->status === 'pending')
                                                <span class="badge bg-warning">Pendiente</span>
                                            @elseif($order->paymentProof->status === 'approved')
                                                <span class="badge bg-success">Aprobado</span>
                                            @else
                                                <span class="badge bg-danger">Rechazado</span>
                                            @endif
                                        @else
                                            <span class="text-muted">Sin comprobante</span>
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.orders.show', $order->id) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i> Ver
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        Mostrando {{ $orders->firstItem() }} a {{ $orders->lastItem() }} de {{ $orders->total() }} resultados
                    </div>
                    {{ $orders->links() }}
                </div>
            @else
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay órdenes</h5>
                    <p class="text-muted">Las órdenes de tu negocio aparecerán aquí.</p>
                </div>
            @endif
        </div>
    </div>

    <!-- Order Detail Modal -->
    @if($showOrderModal && $selectedOrder)
        <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Orden #{{ $selectedOrder->order_number }}</h5>
                        <button type="button" class="btn-close" wire:click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Customer Info -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6><i class="fas fa-user me-2"></i>Información del Cliente</h6>
                                <p class="mb-1"><strong>Nombre:</strong> {{ $selectedOrder->customer_name }}</p>
                                <p class="mb-1"><strong>Email:</strong> {{ $selectedOrder->customer_email }}</p>
                                @if($selectedOrder->customer_phone)
                                    <p class="mb-1"><strong>Teléfono:</strong> {{ $selectedOrder->customer_phone }}</p>
                                @endif
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fas fa-info-circle me-2"></i>Detalles de la Orden</h6>
                                <p class="mb-1"><strong>Fecha:</strong> {{ $selectedOrder->order_date->format('d/m/Y H:i') }}</p>
                                <p class="mb-1"><strong>Estado:</strong> 
                                    @if($selectedOrder->status === 'pending')
                                        <span class="badge bg-warning">Pendiente</span>
                                    @elseif($selectedOrder->status === 'confirmed')
                                        <span class="badge bg-info">Confirmada</span>
                                    @elseif($selectedOrder->status === 'completed')
                                        <span class="badge bg-success">Completada</span>
                                    @else
                                        <span class="badge bg-danger">Cancelada</span>
                                    @endif
                                </p>
                                <p class="mb-1"><strong>Total:</strong> ${{ number_format($selectedOrder->total_amount, 2) }}</p>
                            </div>
                        </div>

                        <!-- Order Items -->
                        <h6><i class="fas fa-list me-2"></i>Productos Ordenados</h6>
                        <div class="table-responsive mb-4">
                            <table class="table table-sm">
                                <thead class="table-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($selectedOrder->items as $item)
                                        <tr>
                                            <td>{{ $item->product->name ?? 'Producto eliminado' }}</td>
                                            <td>{{ $item->quantity }}</td>
                                            <td>${{ number_format($item->unit_price, 2) }}</td>
                                            <td>${{ number_format($item->total_price, 2) }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                                <tfoot class="table-light">
                                    <tr>
                                        <th colspan="3">Total</th>
                                        <th>${{ number_format($selectedOrder->total_amount, 2) }}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Payment Proof -->
                        @if($selectedOrder->paymentProof)
                            <h6><i class="fas fa-receipt me-2"></i>Comprobante de Pago</h6>
                            <div class="card mb-3">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-8">
                                            <p class="mb-1"><strong>Archivo:</strong> {{ $selectedOrder->paymentProof->original_filename }}</p>
                                            <p class="mb-1"><strong>Subido:</strong> {{ $selectedOrder->paymentProof->uploaded_at->format('d/m/Y H:i') }}</p>
                                            <p class="mb-1"><strong>Estado:</strong> 
                                                @if($selectedOrder->paymentProof->status === 'pending')
                                                    <span class="badge bg-warning">Pendiente de revisión</span>
                                                @elseif($selectedOrder->paymentProof->status === 'approved')
                                                    <span class="badge bg-success">Aprobado</span>
                                                @else
                                                    <span class="badge bg-danger">Rechazado</span>
                                                @endif
                                            </p>
                                            @if($selectedOrder->paymentProof->admin_notes)
                                                <p class="mb-1"><strong>Notas:</strong> {{ $selectedOrder->paymentProof->admin_notes }}</p>
                                            @endif
                                        </div>
                                        <div class="col-md-4 text-end">
                                            <a href="{{ asset($selectedOrder->paymentProof->file_path) }}" target="_blank" class="btn btn-sm btn-outline-primary">
                                                <i class="fas fa-download"></i> Ver Archivo
                                            </a>
                                        </div>
                                    </div>
                                    
                                    @if($selectedOrder->paymentProof->status === 'pending')
                                        <hr>
                                        <div class="row">
                                            <div class="col-12">
                                                <label class="form-label">Notas administrativas (opcional)</label>
                                                <textarea wire:model="adminNotes" class="form-control mb-3" rows="2" placeholder="Agregar notas sobre la decisión..."></textarea>
                                                <div class="d-flex gap-2">
                                                    <button wire:click="approvePayment({{ $selectedOrder->paymentProof->id }})" class="btn btn-success btn-sm">
                                                        <i class="fas fa-check"></i> Aprobar
                                                    </button>
                                                    <button wire:click="rejectPayment({{ $selectedOrder->paymentProof->id }})" class="btn btn-danger btn-sm">
                                                        <i class="fas fa-times"></i> Rechazar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @else
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                El cliente aún no ha subido el comprobante de pago.
                            </div>
                        @endif

                        <!-- Notes -->
                        @if($selectedOrder->notes)
                            <h6><i class="fas fa-sticky-note me-2"></i>Notas del Cliente</h6>
                            <div class="alert alert-light">
                                {{ $selectedOrder->notes }}
                            </div>
                        @endif
                    </div>
                    <div class="modal-footer">
                        @if($selectedOrder->status === 'confirmed')
                            <button wire:click="completeOrder({{ $selectedOrder->id }})" class="btn btn-success">
                                <i class="fas fa-check-circle"></i> Marcar como Completada
                            </button>
                        @endif
                        <button type="button" class="btn btn-secondary" wire:click="closeModal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    @endif
</div>

<style>
.modal {
    z-index: 1050;
}

.table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
}

.badge {
    font-size: 0.75em;
}

.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    border: 1px solid rgba(0, 0, 0, 0.125);
}

.btn-outline-primary:hover {
    transform: translateY(-1px);
    transition: all 0.2s;
}
</style>
