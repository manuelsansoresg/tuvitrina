<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden Confirmada - {{ $business->name }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .success-header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 3rem 0;
            text-align: center;
        }
        .order-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            padding: 2rem;
            margin-top: -2rem;
            position: relative;
            z-index: 1;
        }
        .order-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 2rem;
        }
        .product-item {
            border-bottom: 1px solid #dee2e6;
            padding: 1rem 0;
        }
        .product-item:last-child {
            border-bottom: none;
        }
        .total-section {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            margin: 1.5rem 0;
        }
        .payment-info {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .upload-section {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 10px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
        }
        .btn-success {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
        }
        .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="success-header">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 text-center">
                    <i class="fas fa-check-circle fa-4x mb-3"></i>
                    <h1>¡Orden Creada Exitosamente!</h1>
                    <p class="lead">Tu orden ha sido registrada y está pendiente de confirmación</p>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="order-card">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    @endif

                    <!-- Número de Orden -->
                    <div class="order-number">
                        <h3 class="mb-2">Orden #{{ $order->order_number }}</h3>
                        <p class="mb-0">{{ $order->order_date->format('d/m/Y H:i') }}</p>
                    </div>

                    <!-- Estado de la Orden -->
                    <div class="text-center mb-4">
                        <span class="status-badge status-pending">
                            <i class="fas fa-clock me-2"></i>{{ $order->status_label }}
                        </span>
                    </div>

                    <!-- Información del Cliente -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h5><i class="fas fa-user me-2"></i>Información del Cliente</h5>
                            <p class="mb-1"><strong>Nombre:</strong> {{ $order->customer_name }}</p>
                            <p class="mb-1"><strong>Email:</strong> {{ $order->customer_email }}</p>
                            @if($order->customer_phone)
                                <p class="mb-1"><strong>Teléfono:</strong> {{ $order->customer_phone }}</p>
                            @endif
                        </div>
                        <div class="col-md-6">
                            <h5><i class="fas fa-store me-2"></i>Negocio</h5>
                            <p class="mb-1"><strong>{{ $business->name }}</strong></p>
                            @if($business->email)
                                <p class="mb-1"><i class="fas fa-envelope me-2"></i>{{ $business->email }}</p>
                            @endif
                            @if($business->phone)
                                <p class="mb-1"><i class="fas fa-phone me-2"></i>{{ $business->phone }}</p>
                            @endif
                        </div>
                    </div>

                    <!-- Productos Ordenados -->
                    <h5 class="mb-3"><i class="fas fa-shopping-bag me-2"></i>Productos Ordenados</h5>
                    @foreach($order->items as $item)
                        <div class="product-item">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h6 class="mb-1">{{ $item->product->name }}</h6>
                                    <small class="text-muted">
                                        Cantidad: {{ $item->quantity }} × ${{ number_format($item->unit_price, 2) }}
                                    </small>
                                    @if($item->product->description)
                                        <br><small class="text-muted">{{ Str::limit($item->product->description, 100) }}</small>
                                    @endif
                                </div>
                                <div class="col-md-4 text-md-end">
                                    <strong>${{ number_format($item->total_price, 2) }}</strong>
                                </div>
                            </div>
                        </div>
                    @endforeach

                    <!-- Total -->
                    <div class="total-section">
                        <div class="row">
                            <div class="col-6">
                                <h4>Total a Pagar:</h4>
                            </div>
                            <div class="col-6 text-end">
                                <h4 class="text-primary">${{ number_format($order->total_amount, 2) }}</h4>
                            </div>
                        </div>
                    </div>

                    @if($order->notes)
                        <div class="mb-4">
                            <h6><i class="fas fa-sticky-note me-2"></i>Notas:</h6>
                            <p class="text-muted">{{ $order->notes }}</p>
                        </div>
                    @endif

                    <!-- Información de Pago -->
                    @if($business->bank_transfer_enabled)
                        <div class="payment-info">
                            <h5 class="mb-3"><i class="fas fa-university me-2"></i>Información para Transferencia</h5>
                            <div class="row">
                                <div class="col-md-6">
                                    @if($business->bank_name)
                                        <p><strong>Banco:</strong> {{ $business->bank_name }}</p>
                                    @endif
                                    @if($business->account_holder)
                                        <p><strong>Titular:</strong> {{ $business->account_holder }}</p>
                                    @endif
                                </div>
                                <div class="col-md-6">
                                    @if($business->account_number)
                                        <p><strong>Número de Cuenta:</strong> {{ $business->account_number }}</p>
                                    @endif
                                    @if($business->clabe)
                                        <p><strong>CLABE:</strong> {{ $business->clabe }}</p>
                                    @endif
                                </div>
                            </div>
                            <div class="alert alert-info mt-3 mb-0">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Importante:</strong> Realiza la transferencia por el monto exacto de ${{ number_format($order->total_amount, 2) }} y sube tu comprobante abajo.
                            </div>
                        </div>
                    @endif

                    <!-- Sección de Subir Comprobante -->
                    <div class="upload-section">
                        <h5 class="mb-3"><i class="fas fa-upload me-2"></i>Comprobante de Pago</h5>
                        
                        @if($order->paymentProof)
                            <!-- Comprobante ya subido -->
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle me-2"></i>
                                <strong>Comprobante subido exitosamente</strong>
                                <p class="mb-1">Archivo: {{ $order->paymentProof->original_filename }}</p>
                                <p class="mb-1">Fecha: {{ $order->paymentProof->uploaded_at->format('d/m/Y H:i') }}</p>
                                <p class="mb-0">Estado: 
                                    @if($order->paymentProof->status === 'pending')
                                        <span class="badge bg-warning">Pendiente de revisión</span>
                                    @elseif($order->paymentProof->status === 'approved')
                                        <span class="badge bg-success">Aprobado</span>
                                    @else
                                        <span class="badge bg-danger">Rechazado</span>
                                    @endif
                                </p>
                            </div>
                        @else
                            <!-- Formulario para subir comprobante -->
                            <p class="mb-3">Una vez que hayas realizado la transferencia, sube tu comprobante para que podamos procesar tu orden.</p>
                            
                            @if(session('error'))
                                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                    {{ session('error') }}
                                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            @endif
                            
                            <form action="{{ route('catalog.upload-payment-proof', [$business->slug, $order->order_number]) }}" method="POST" enctype="multipart/form-data" id="uploadForm">
                                @csrf
                                <div class="mb-3">
                                    <input type="file" class="form-control @error('payment_proof') is-invalid @enderror" id="payment_proof" name="payment_proof" accept="image/*,.pdf" required>
                                    <small class="text-muted">Formatos aceptados: JPG, PNG, PDF (máximo 5MB)</small>
                                    @error('payment_proof')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                                <button type="submit" class="btn btn-success">
                                    <i class="fas fa-upload me-2"></i>Subir Comprobante
                                </button>
                            </form>
                        @endif
                    </div>

                    <!-- Acciones -->
                    <div class="text-center mt-4">
                        <a href="{{ route('catalog.show', $business->slug) }}" class="btn btn-primary me-3">
                            <i class="fas fa-arrow-left me-2"></i>Volver al Catálogo
                        </a>
                        <button onclick="window.print()" class="btn btn-outline-secondary">
                            <i class="fas fa-print me-2"></i>Imprimir Orden
                        </button>
                    </div>

                    <!-- Información Adicional -->
                    <div class="alert alert-warning mt-4">
                        <h6><i class="fas fa-exclamation-triangle me-2"></i>Información Importante:</h6>
                        <ul class="mb-0">
                            <li>Tu orden está pendiente de confirmación</li>
                            <li>El vendedor será notificado automáticamente</li>
                            <li>Una vez que subas el comprobante, el vendedor verificará el pago</li>
                            <li>Recibirás una confirmación cuando tu orden sea procesada</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="py-5"></div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>