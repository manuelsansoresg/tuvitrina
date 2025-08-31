<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Sale;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesReports extends Component
{
    use WithPagination;

    public $dateFrom;
    public $dateTo;
    public $productFilter = '';
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
        $query = Sale::where('user_id', auth()->id())
            ->when($this->dateFrom, function ($q) {
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

    public function getStatistics()
    {
        $salesQuery = $this->getSalesData();
        
        $totalSales = $salesQuery->count();
        $totalRevenue = $salesQuery->sum('total_amount');
        $averageSale = $totalSales > 0 ? $totalRevenue / $totalSales : 0;
        
        // Top selling products
        $topProducts = $salesQuery->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(total_amount) as total_revenue'))
            ->with('product')
            ->groupBy('product_id')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->get();

        // Sales by period
        $salesByPeriod = $this->getSalesByPeriod();

        return [
            'total_sales' => $totalSales,
            'total_revenue' => $totalRevenue,
            'average_sale' => $averageSale,
            'top_products' => $topProducts,
            'sales_by_period' => $salesByPeriod
        ];
    }

    private function getSalesByPeriod()
    {
        $salesQuery = $this->getSalesData();
        
        switch ($this->reportType) {
            case 'daily':
                return $salesQuery->select(
                    DB::raw('DATE(sale_date) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                
            case 'weekly':
                return $salesQuery->select(
                    DB::raw('YEARWEEK(sale_date) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                
            case 'monthly':
                return $salesQuery->select(
                    DB::raw('DATE_FORMAT(sale_date, "%Y-%m") as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                
            case 'yearly':
                return $salesQuery->select(
                    DB::raw('YEAR(sale_date) as period'),
                    DB::raw('COUNT(*) as sales_count'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->groupBy('period')
                ->orderBy('period')
                ->get();
                
            default:
                return collect();
        }
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
            ->paginate($this->perPage);

        $statistics = $this->getStatistics();
        $products = Product::where('user_id', auth()->id())->get();

        return view('livewire.admin.sales-reports', compact('sales', 'statistics', 'products'))
            ->layout('layouts.admin');
    }
}
