<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - {{ $business->name }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .checkout-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
        }
        .order-summary {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 1.5rem;
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
            background: #e9ecef;
            padding: 1rem;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1.2rem;
        }
        .customer-form {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
        }
        .btn-secondary {
            border-radius: 25px;
            padding: 12px 30px;
        }
    </style>
</head>
<body>
    <div class="checkout-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1><i class="fas fa-shopping-cart me-2"></i>Finalizar Compra</h1>
                    <p class="mb-0">{{ $business->name }}</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <a href="{{ route('catalog.show', $business->slug) }}" class="btn btn-light">
                        <i class="fas fa-arrow-left me-2"></i>Volver al Catálogo
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="container my-5">
        @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif

        <div class="row">
            <!-- Resumen de la Orden -->
            <div class="col-lg-5">
                <div class="order-summary">
                    <h4 class="mb-3"><i class="fas fa-list-alt me-2"></i>Resumen de tu Orden</h4>
                    
                    @foreach($cartItems as $item)
                        <div class="product-item">
                            <div class="row align-items-center">
                                <div class="col-8">
                                    <h6 class="mb-1">{{ $item['product']->name }}</h6>
                                    <small class="text-muted">Cantidad: {{ $item['quantity'] }}</small>
                                    <br>
                                    <small class="text-muted">${{ number_format($item['product']->price, 2) }} c/u</small>
                                </div>
                                <div class="col-4 text-end">
                                    <strong>${{ number_format($item['subtotal'], 2) }}</strong>
                                </div>
                            </div>
                        </div>
                    @endforeach
                    
                    <div class="total-section mt-3">
                        <div class="d-flex justify-content-between">
                            <span>Total:</span>
                            <span>${{ number_format($total, 2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Información de Pago -->
                @if($business->bank_transfer_enabled)
                    <div class="order-summary">
                        <h5 class="mb-3"><i class="fas fa-university me-2"></i>Información de Transferencia</h5>
                        <div class="payment-info">
                            @if($business->bank_name)
                                <p><strong>Banco:</strong> {{ $business->bank_name }}</p>
                            @endif
                            @if($business->account_holder)
                                <p><strong>Titular:</strong> {{ $business->account_holder }}</p>
                            @endif
                            @if($business->account_number)
                                <p><strong>Número de Cuenta:</strong> {{ $business->account_number }}</p>
                            @endif
                            @if($business->clabe)
                                <p><strong>CLABE:</strong> {{ $business->clabe }}</p>
                            @endif
                        </div>
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>Después de realizar tu transferencia, podrás subir el comprobante en la página de confirmación.</small>
                        </div>
                    </div>
                @endif
            </div>

            <!-- Formulario de Cliente -->
            <div class="col-lg-7">
                <div class="customer-form">
                    <h4 class="mb-4"><i class="fas fa-user me-2"></i>Información del Cliente</h4>
                    
                    <form action="{{ route('catalog.process-order', $business->slug) }}" method="POST">
                        @csrf
                        <input type="hidden" name="cart_data" value="{{ json_encode(collect($cartItems)->map(function($item) { return ['id' => $item['product']->id, 'name' => $item['product']->name, 'quantity' => $item['quantity']]; })) }}">
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="customer_name" class="form-label">Nombre Completo *</label>
                                <input type="text" class="form-control" id="customer_name" name="customer_name" required value="{{ old('customer_name') }}">
                                @error('customer_name')
                                    <div class="text-danger small">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="customer_email" class="form-label">Correo Electrónico *</label>
                                <input type="email" class="form-control" id="customer_email" name="customer_email" required value="{{ old('customer_email') }}">
                                @error('customer_email')
                                    <div class="text-danger small">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="customer_phone" class="form-label">Teléfono</label>
                            <input type="tel" class="form-control" id="customer_phone" name="customer_phone" value="{{ old('customer_phone') }}">
                            @error('customer_phone')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-4">
                            <label for="notes" class="form-label">Notas Adicionales</label>
                            <textarea class="form-control" id="notes" name="notes" rows="3" placeholder="Instrucciones especiales, comentarios, etc.">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                            <a href="{{ route('catalog.show', $business->slug) }}" class="btn btn-secondary me-md-2">
                                <i class="fas fa-arrow-left me-2"></i>Cancelar
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-check me-2"></i>Crear Orden
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>