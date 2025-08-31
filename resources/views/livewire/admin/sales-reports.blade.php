<div class="sales-reports-container">
    <!-- Header -->
    <div class="page-header">
        <h1 class="page-title">Reportes de Ventas</h1>
        <div class="header-actions">
            <button wire:click="exportReport('csv')" class="btn btn-secondary">
                <i class="fas fa-download"></i> Exportar CSV
            </button>
            <button wire:click="exportReport('pdf')" class="btn btn-secondary">
                <i class="fas fa-file-pdf"></i> Exportar PDF
            </button>
        </div>
    </div>

    <!-- Flash Messages -->
    @if (session()->has('message'))
        <div class="alert alert-info">
            {{ session('message') }}
        </div>
    @endif

    <!-- Statistics Cards -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon sales">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-content">
                <h3>{{ number_format($statistics['total_sales']) }}</h3>
                <p>Total de Ventas</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon revenue">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
                <h3>${{ number_format($statistics['total_revenue'], 2) }}</h3>
                <p>Ingresos Totales</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon average">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-content">
                <h3>${{ number_format($statistics['average_sale'], 2) }}</h3>
                <p>Venta Promedio</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon products">
                <i class="fas fa-box"></i>
            </div>
            <div class="stat-content">
                <h3>{{ $statistics['top_products']->count() }}</h3>
                <p>Productos Vendidos</p>
            </div>
        </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
        <div class="filter-group">
            <h4>Filtros de Fecha</h4>
            <div class="date-filters">
                <div class="quick-filters">
                    <button wire:click="setDateRange('today')" class="filter-btn {{ $dateFrom == date('Y-m-d') && $dateTo == date('Y-m-d') ? 'active' : '' }}">Hoy</button>
                    <button wire:click="setDateRange('yesterday')" class="filter-btn">Ayer</button>
                    <button wire:click="setDateRange('this_week')" class="filter-btn">Esta Semana</button>
                    <button wire:click="setDateRange('this_month')" class="filter-btn">Este Mes</button>
                    <button wire:click="setDateRange('last_month')" class="filter-btn">Mes Pasado</button>
                    <button wire:click="setDateRange('this_year')" class="filter-btn">Este Año</button>
                </div>
                <div class="custom-date-range">
                    <div class="date-input-group">
                        <label>Desde:</label>
                        <input type="date" wire:model="dateFrom" class="date-input">
                    </div>
                    <div class="date-input-group">
                        <label>Hasta:</label>
                        <input type="date" wire:model="dateTo" class="date-input">
                    </div>
                </div>
            </div>
        </div>

        <div class="filter-group">
            <h4>Filtros Adicionales</h4>
            <div class="additional-filters">
                <div class="filter-input-group">
                    <label>Producto:</label>
                    <input type="text" wire:model="productFilter" placeholder="Buscar por producto..." class="filter-input">
                </div>
                <div class="filter-input-group">
                    <label>Mostrar:</label>
                    <select wire:model="perPage" class="filter-select">
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <!-- Report Type Tabs -->
    <div class="report-tabs">
        <button wire:click="setReportType('daily')" class="tab-btn {{ $reportType === 'daily' ? 'active' : '' }}">
            <i class="fas fa-calendar-day"></i> Diario
        </button>
        <button wire:click="setReportType('weekly')" class="tab-btn {{ $reportType === 'weekly' ? 'active' : '' }}">
            <i class="fas fa-calendar-week"></i> Semanal
        </button>
        <button wire:click="setReportType('monthly')" class="tab-btn {{ $reportType === 'monthly' ? 'active' : '' }}">
            <i class="fas fa-calendar-alt"></i> Mensual
        </button>
        <button wire:click="setReportType('yearly')" class="tab-btn {{ $reportType === 'yearly' ? 'active' : '' }}">
            <i class="fas fa-calendar"></i> Anual
        </button>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
        <div class="chart-container">
            <h4>Ventas por Período ({{ ucfirst($reportType) }})</h4>
            <div class="chart-placeholder">
                @if($statistics['sales_by_period']->count() > 0)
                    <div class="simple-chart">
                        @foreach($statistics['sales_by_period'] as $period)
                            <div class="chart-bar">
                                <div class="bar" style="height: {{ ($period->revenue / $statistics['sales_by_period']->max('revenue')) * 100 }}%"></div>
                                <div class="bar-label">
                                    <small>{{ $period->period }}</small>
                                    <strong>${{ number_format($period->revenue, 0) }}</strong>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="no-data">
                        <i class="fas fa-chart-bar"></i>
                        <p>No hay datos para mostrar en el período seleccionado</p>
                    </div>
                @endif
            </div>
        </div>

        <div class="top-products-container">
            <h4>Productos Más Vendidos</h4>
            @if($statistics['top_products']->count() > 0)
                <div class="top-products-list">
                    @foreach($statistics['top_products'] as $index => $topProduct)
                        <div class="top-product-item">
                            <div class="product-rank">{{ $index + 1 }}</div>
                            <div class="product-info">
                                <strong>{{ $topProduct->product->name ?? 'Producto eliminado' }}</strong>
                                <div class="product-stats">
                                    <span class="quantity">{{ $topProduct->total_quantity }} unidades</span>
                                    <span class="revenue">${{ number_format($topProduct->total_revenue, 2) }}</span>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="no-data">
                    <i class="fas fa-box-open"></i>
                    <p>No hay productos vendidos en el período seleccionado</p>
                </div>
            @endif
        </div>
    </div>

    <!-- Sales Table -->
    <div class="sales-table-section">
        <h4>Detalle de Ventas</h4>
        <div class="table-container">
            <table class="sales-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Total</th>
                        <th>Cliente</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($sales as $sale)
                        <tr>
                            <td>{{ $sale->sale_date->format('d/m/Y H:i') }}</td>
                            <td>
                                <div class="product-cell">
                                    <strong>{{ $sale->product->name ?? 'Producto eliminado' }}</strong>
                                </div>
                            </td>
                            <td class="quantity-cell">{{ $sale->quantity }}</td>
                            <td class="price-cell">${{ number_format($sale->unit_price, 2) }}</td>
                            <td class="total-cell">${{ number_format($sale->total_amount, 2) }}</td>
                            <td>{{ $sale->customer_name ?? 'Cliente anónimo' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="no-sales">
                                <div class="empty-state">
                                    <i class="fas fa-receipt"></i>
                                    <p>No hay ventas registradas en el período seleccionado</p>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($sales->hasPages())
            <div class="pagination-wrapper">
                {{ $sales->links() }}
            </div>
        @endif
    </div>
</div>

<style>
.sales-reports-container {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.page-title {
    font-size: 28px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.stat-icon.sales { background: #3b82f6; }
.stat-icon.revenue { background: #10b981; }
.stat-icon.average { background: #f59e0b; }
.stat-icon.products { background: #8b5cf6; }

.stat-content h3 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 4px 0;
}

.stat-content p {
    color: #6b7280;
    margin: 0;
    font-size: 14px;
}

.filters-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
    margin-bottom: 24px;
}

.filter-group:last-child {
    margin-bottom: 0;
}

.filter-group h4 {
    margin: 0 0 16px 0;
    color: #1f2937;
    font-weight: 600;
}

.date-filters {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.quick-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    background: #f3f4f6;
}

.filter-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.custom-date-range {
    display: flex;
    gap: 16px;
}

.date-input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.date-input-group label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

.date-input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.additional-filters {
    display: flex;
    gap: 20px;
}

.filter-input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.filter-input, .filter-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.report-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    background: white;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.tab-btn:hover {
    background: #f3f4f6;
    color: #374151;
}

.tab-btn.active {
    background: #3b82f6;
    color: white;
}

.charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    margin-bottom: 30px;
}

.chart-container, .top-products-container {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container h4, .top-products-container h4 {
    margin: 0 0 20px 0;
    color: #1f2937;
    font-weight: 600;
}

.simple-chart {
    display: flex;
    align-items: end;
    gap: 12px;
    height: 200px;
    padding: 20px 0;
}

.chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.bar {
    width: 100%;
    background: linear-gradient(to top, #3b82f6, #60a5fa);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: all 0.3s;
}

.bar-label {
    text-align: center;
    font-size: 12px;
}

.bar-label small {
    color: #6b7280;
    display: block;
}

.bar-label strong {
    color: #1f2937;
}

.top-products-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.top-product-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
}

.product-rank {
    width: 32px;
    height: 32px;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
}

.product-info {
    flex: 1;
}

.product-info strong {
    color: #1f2937;
    display: block;
    margin-bottom: 4px;
}

.product-stats {
    display: flex;
    gap: 16px;
    font-size: 12px;
}

.quantity {
    color: #6b7280;
}

.revenue {
    color: #10b981;
    font-weight: 600;
}

.sales-table-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sales-table-section h4 {
    margin: 0 0 20px 0;
    color: #1f2937;
    font-weight: 600;
}

.table-container {
    overflow-x: auto;
}

.sales-table {
    width: 100%;
    border-collapse: collapse;
}

.sales-table th {
    background: #f9fafb;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
}

.sales-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 14px;
}

.product-cell strong {
    color: #1f2937;
}

.quantity-cell {
    text-align: center;
    font-weight: 600;
}

.price-cell, .total-cell {
    text-align: right;
    font-weight: 600;
}

.total-cell {
    color: #10b981;
}

.no-sales {
    text-align: center;
    padding: 40px 20px;
}

.no-data {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
}

.no-data i {
    font-size: 48px;
    margin-bottom: 16px;
    color: #d1d5db;
}

.empty-state i {
    font-size: 48px;
    color: #d1d5db;
    margin-bottom: 16px;
}

.empty-state p {
    color: #6b7280;
    margin: 0;
}

.pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.alert-info {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
}

@media (max-width: 1024px) {
    .charts-section {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .date-filters {
        flex-direction: column;
    }
    
    .custom-date-range {
        flex-direction: column;
    }
    
    .additional-filters {
        flex-direction: column;
    }
    
    .report-tabs {
        flex-direction: column;
    }
    
    .simple-chart {
        height: 150px;
    }
    
    .sales-table {
        font-size: 12px;
    }
    
    .sales-table th,
    .sales-table td {
        padding: 8px 12px;
    }
}
</style>
