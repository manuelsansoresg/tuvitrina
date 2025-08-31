<div>
    <!-- Estadísticas Generales -->
    <div class="row mb-4">
        <div class="col-md-3 mb-3">
            <div class="card stat-card bg-primary text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 class="mb-0">{{ $totalProducts }}</h3>
                            <p class="mb-0">Total Productos</p>
                        </div>
                        <i class="fas fa-box fa-2x opacity-75"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3 mb-3">
            <div class="card stat-card bg-success text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 class="mb-0">{{ $activeProducts }}</h3>
                            <p class="mb-0">Productos Activos</p>
                        </div>
                        <i class="fas fa-check-circle fa-2x opacity-75"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3 mb-3">
            <div class="card stat-card bg-info text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 class="mb-0">{{ $totalSales }}</h3>
                            <p class="mb-0">Total Ventas</p>
                        </div>
                        <i class="fas fa-shopping-cart fa-2x opacity-75"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3 mb-3">
            <div class="card stat-card bg-warning text-white">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 class="mb-0">${{ number_format($monthlyRevenue, 2) }}</h3>
                            <p class="mb-0">Ingresos del Mes</p>
                        </div>
                        <i class="fas fa-dollar-sign fa-2x opacity-75"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Ingresos Anuales -->
    <div class="row mb-4">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-chart-line me-2"></i>Ingresos del Año
                    </h5>
                </div>
                <div class="card-body text-center">
                    <h2 class="text-success mb-0">${{ number_format($yearlyRevenue, 2) }}</h2>
                    <p class="text-muted">Total {{ date('Y') }}</p>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>Productos con Bajo Stock
                    </h5>
                </div>
                <div class="card-body">
                    @if($lowStockProducts->count() > 0)
                        @foreach($lowStockProducts as $product)
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <strong>{{ $product->name }}</strong>
                                    <small class="text-muted d-block">SKU: {{ $product->sku }}</small>
                                </div>
                                <span class="badge bg-danger">{{ $product->stock }} unidades</span>
                            </div>
                            @if(!$loop->last)<hr class="my-2">@endif
                        @endforeach
                    @else
                        <p class="text-muted mb-0">No hay productos con bajo stock</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
    
    <!-- Ventas Recientes y Productos Más Vendidos -->
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-clock me-2"></i>Ventas Recientes
                    </h5>
                </div>
                <div class="card-body">
                    @if($recentSales->count() > 0)
                        @foreach($recentSales as $sale)
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <strong>{{ $sale->customer_name }}</strong>
                                    <small class="text-muted d-block">{{ $sale->product->name ?? 'Producto eliminado' }}</small>
                                    <small class="text-muted">{{ $sale->sale_date->format('d/m/Y H:i') }}</small>
                                </div>
                                <div class="text-end">
                                    <span class="fw-bold">${{ number_format($sale->total_amount, 2) }}</span>
                                    <small class="d-block">
                                        <span class="badge bg-{{ $sale->status === 'completed' ? 'success' : ($sale->status === 'pending' ? 'warning' : 'secondary') }}">
                                            {{ ucfirst($sale->status) }}
                                        </span>
                                    </small>
                                </div>
                            </div>
                            @if(!$loop->last)<hr class="my-2">@endif
                        @endforeach
                    @else
                        <p class="text-muted mb-0">No hay ventas registradas</p>
                    @endif
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-star me-2"></i>Productos Más Vendidos
                    </h5>
                </div>
                <div class="card-body">
                    @if($topProducts->count() > 0)
                        @foreach($topProducts as $product)
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <strong>{{ $product->name }}</strong>
                                    <small class="text-muted d-block">SKU: {{ $product->sku }}</small>
                                    <small class="text-success">${{ number_format($product->price, 2) }}</small>
                                </div>
                                <div class="text-end">
                                    <span class="badge bg-primary">{{ $product->sales_count }} ventas</span>
                                    <small class="text-muted d-block">Stock: {{ $product->stock }}</small>
                                </div>
                            </div>
                            @if(!$loop->last)<hr class="my-2">@endif
                        @endforeach
                    @else
                        <p class="text-muted mb-0">No hay datos de ventas</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
