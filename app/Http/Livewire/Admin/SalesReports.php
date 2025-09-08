<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Sale;
use App\Models\Product;
use App\Models\Order;
use App\Models\Business;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesReports extends Component
{
    use WithPagination;

    public $dateFrom;
    public $dateTo;
    public $productFilter = '';
    public $businessFilter = 'all';
    public $reportType = 'daily'; // daily, weekly, monthly, yearly
    public $perPage = 15;

    public function mount()
    {
        // Set default date range to current month
        $this->dateFrom = Carbon::now()->startOfMonth()->format('Y-m-d');
        $this->dateTo = Carbon::now()->format('Y-m-d');
    }

    public function updatingDateFrom()
    {
        $this->resetPage();
    }

    public function updatingDateTo()
    {
        $this->resetPage();
    }

    public function updatingProductFilter()
    {
        $this->resetPage();
    }

    public function updatingBusinessFilter()
    {
        $this->resetPage();
    }

    public function setReportType($type)
    {
        $this->reportType = $type;
        $this->resetPage();
    }

    public function setDateRange($range)
    {
        $now = Carbon::now();
        
        switch ($range) {
            case 'today':
                $this->dateFrom = $now->format('Y-m-d');
                $this->dateTo = $now->format('Y-m-d');
                break;
            case 'yesterday':
                $yesterday = $now->subDay();
                $this->dateFrom = $yesterday->format('Y-m-d');
                $this->dateTo = $yesterday->format('Y-m-d');
                break;
            case 'this_week':
                $this->dateFrom = $now->startOfWeek()->format('Y-m-d');
                $this->dateTo = Carbon::now()->format('Y-m-d');
                break;
            case 'this_month':
                $this->dateFrom = $now->startOfMonth()->format('Y-m-d');
                $this->dateTo = Carbon::now()->format('Y-m-d');
                break;
            case 'last_month':
                $lastMonth = $now->subMonth();
                $this->dateFrom = $lastMonth->startOfMonth()->format('Y-m-d');
                $this->dateTo = $lastMonth->endOfMonth()->format('Y-m-d');
                break;
            case 'this_year':
                $this->dateFrom = $now->startOfYear()->format('Y-m-d');
                $this->dateTo = Carbon::now()->format('Y-m-d');
                break;
        }
        
        $this->resetPage();
    }

    public function getSalesData()
    {
        $user = auth()->user();
        
        $query = Sale::query();
        
        // Aplicar filtros según el rol del usuario
        if ($user->hasRole('superadmin')) {
            // Superadmin puede ver todas las ventas o filtrar por empresa
            if ($this->businessFilter !== 'all') {
                $query->whereHas('product.user.business', function($q) {
                    $q->where('id', $this->businessFilter);
                });
            }
        } else {
            // Admin solo puede ver las ventas de su empresa
            if (!$user->business) {
                return Sale::whereRaw('1 = 0'); // Query vacío
            }
            $query->where('business_id', $user->business->id);
        }
        
        $query->when($this->dateFrom, function ($q) {
                $q->whereDate('sale_date', '>=', $this->dateFrom);
            })
            ->when($this->dateTo, function ($q) {
                $q->whereDate('sale_date', '<=', $this->dateTo);
            })
            ->when($this->productFilter, function ($q) {
                $q->whereHas('product', function ($productQuery) {
                    $productQuery->where('name', 'like', '%' . $this->productFilter . '%');
                });
            });

        return $query;
    }

    public function getOrdersData()
    {
        $user = auth()->user();
        
        $query = Order::where('status', 'completed');
        
        // Aplicar filtros según el rol del usuario
        if ($user->hasRole('superadmin')) {
            // Superadmin puede ver todas las órdenes o filtrar por empresa
            if ($this->businessFilter !== 'all') {
                $query->where('business_id', $this->businessFilter);
            }
        } else {
            // Admin solo puede ver las órdenes de su empresa
            if (!$user->business) {
                return Order::whereRaw('1 = 0'); // Query vacío
            }
            $query->where('business_id', $user->business->id);
        }
        
        $query->when($this->dateFrom, function ($q) {
                $q->whereDate('created_at', '>=', $this->dateFrom);
            })
            ->when($this->dateTo, function ($q) {
                $q->whereDate('created_at', '<=', $this->dateTo);
            })
            ->when($this->productFilter, function ($q) {
                $q->whereHas('items.product', function ($productQuery) {
                    $productQuery->where('name', 'like', '%' . $this->productFilter . '%');
                });
            });

        return $query;
    }

    public function getStatistics()
    {
        $salesQuery = $this->getSalesData();
        $ordersQuery = $this->getOrdersData();
        
        // Sales statistics
        $totalSales = $salesQuery->count();
        $totalSalesRevenue = $salesQuery->sum('total_amount');
        
        // Orders statistics
        $totalOrders = $ordersQuery->count();
        $totalOrdersRevenue = $ordersQuery->sum('total_amount');
        
        // Combined statistics
        $totalTransactions = $totalSales + $totalOrders;
        $totalRevenue = $totalSalesRevenue + $totalOrdersRevenue;
        $averageSale = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;
        
        // Top selling products from sales
        $topProductsSales = $salesQuery->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(total_amount) as total_revenue'))
            ->with('product')
            ->groupBy('product_id')
            ->get();
            
        // Top selling products from orders
        $topProductsOrders = $ordersQuery->with('items.product')
            ->get()
            ->flatMap(function ($order) {
                return $order->items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'total_quantity' => $item->quantity,
                        'total_revenue' => $item->total_price,
                        'product' => $item->product
                    ];
                });
            })
            ->groupBy('product_id')
            ->map(function ($items, $productId) {
                return (object) [
                    'product_id' => $productId,
                    'total_quantity' => $items->sum('total_quantity'),
                    'total_revenue' => $items->sum('total_revenue'),
                    'product' => $items->first()['product']
                ];
            })
            ->values();
            
        // Combine and get top products
        $allProducts = $topProductsSales->concat($topProductsOrders)
            ->groupBy('product_id')
            ->map(function ($items) {
                return (object) [
                    'product_id' => $items->first()->product_id,
                    'total_quantity' => $items->sum('total_quantity'),
                    'total_revenue' => $items->sum('total_revenue'),
                    'product' => $items->first()->product
                ];
            })
            ->sortByDesc('total_quantity')
            ->take(5)
            ->values();

        // Sales by period
        $salesByPeriod = $this->getSalesByPeriod();

        return [
            'total_sales' => $totalTransactions,
            'total_revenue' => $totalRevenue,
            'average_sale' => $averageSale,
            'top_products' => $allProducts,
            'sales_by_period' => $salesByPeriod,
            'sales_breakdown' => [
                'traditional_sales' => $totalSales,
                'orders' => $totalOrders,
                'sales_revenue' => $totalSalesRevenue,
                'orders_revenue' => $totalOrdersRevenue
            ]
        ];
    }

    private function getSalesByPeriod()
    {
        $salesQuery = $this->getSalesData();
        $ordersQuery = $this->getOrdersData();
        
        switch ($this->reportType) {
            case 'daily':
                $salesByPeriod = $salesQuery->select(
                    DB::raw('DATE(sale_date) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                
                $ordersByPeriod = $ordersQuery->select(
                    DB::raw('DATE(created_at) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                break;
                
            case 'weekly':
                $salesByPeriod = $salesQuery->select(
                    DB::raw('YEARWEEK(sale_date) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                
                $ordersByPeriod = $ordersQuery->select(
                    DB::raw('YEARWEEK(created_at) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                break;
                
            case 'monthly':
                $salesByPeriod = $salesQuery->select(
                    DB::raw('DATE_FORMAT(sale_date, "%Y-%m") as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                
                $ordersByPeriod = $ordersQuery->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                break;
                
            case 'yearly':
                $salesByPeriod = $salesQuery->select(
                    DB::raw('YEAR(sale_date) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                
                $ordersByPeriod = $ordersQuery->select(
                    DB::raw('YEAR(created_at) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->get();
                break;
                
            default:
                return collect();
        }
        
        // Combine sales and orders by period
        $combinedData = collect();
        $allPeriods = $salesByPeriod->pluck('period')->merge($ordersByPeriod->pluck('period'))->unique()->sort();
        
        foreach ($allPeriods as $period) {
            $salesData = $salesByPeriod->firstWhere('period', $period);
            $ordersData = $ordersByPeriod->firstWhere('period', $period);
            
            $combinedData->push((object) [
                'period' => $period,
                'sales_count' => ($salesData->sales_count ?? 0) + ($ordersData->sales_count ?? 0),
                'revenue' => ($salesData->revenue ?? 0) + ($ordersData->revenue ?? 0)
            ]);
        }
        
        return $combinedData;
    }

    public function exportReport($format = 'csv')
    {
        // This would implement export functionality
        session()->flash('message', 'Funcionalidad de exportación en desarrollo.');
    }

    public function render()
    {
        $sales = $this->getSalesData()
            ->with(['product'])
            ->orderBy('sale_date', 'desc')
            ->get()
            ->map(function ($sale) {
                return (object) [
                    'id' => $sale->id,
                    'type' => 'sale',
                    'date' => $sale->sale_date,
                    'customer_name' => 'Venta directa',
                    'customer_email' => null,
                    'total_amount' => $sale->total_amount,
                    'product_name' => $sale->product->name ?? 'Producto eliminado',
                    'quantity' => $sale->quantity,
                    'unit_price' => $sale->unit_price
                ];
            });
            
        $orders = $this->getOrdersData()
            ->with(['items.product'])
            ->orderBy('order_date', 'desc')
            ->get()
            ->map(function ($order) {
                return (object) [
                    'id' => $order->id,
                    'type' => 'order',
                    'date' => $order->order_date,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'total_amount' => $order->total_amount,
                    'product_name' => $order->items->count() . ' productos',
                    'quantity' => $order->items->sum('quantity'),
                    'unit_price' => null,
                    'order_number' => $order->order_number
                ];
            });
            
        // Combine and paginate
        $allTransactions = $sales->concat($orders)
            ->sortByDesc('date')
            ->values();
            
        // Manual pagination
        $currentPage = request()->get('page', 1);
        $perPage = $this->perPage;
        $offset = ($currentPage - 1) * $perPage;
        $paginatedTransactions = $allTransactions->slice($offset, $perPage);
        
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedTransactions,
            $allTransactions->count(),
            $perPage,
            $currentPage,
            ['path' => request()->url(), 'pageName' => 'page']
        );

        $statistics = $this->getStatistics();
        $products = Product::where('user_id', auth()->id())->get();
        
        // Obtener todas las empresas para el filtro (solo para superadmin)
        $businesses = collect();
        if (auth()->user()->hasRole('superadmin')) {
            $businesses = Business::orderBy('business_name')->get();
        }

        return view('livewire.admin.sales-reports', compact('paginator', 'statistics', 'products', 'businesses'))
            ->layout('layouts.admin');
    }
}
