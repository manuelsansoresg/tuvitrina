<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Business;
use Carbon\Carbon;

class Dashboard extends Component
{
    public $businessFilter = 'all';
    
    public function updatingBusinessFilter()
    {
        // Reset any cached data when filter changes
    }
    
    public function render()
    {
        $user = auth()->user();
        
        if ($user->hasRole('superadmin')) {
            // Estadísticas globales para superadmin con filtro opcional por empresa
            $productQuery = Product::query();
            $saleQuery = Sale::query();
            
            if ($this->businessFilter !== 'all') {
                $productQuery->whereHas('user.business', function($q) {
                    $q->where('id', $this->businessFilter);
                });
                $saleQuery->whereHas('product.user.business', function($q) {
                    $q->where('id', $this->businessFilter);
                });
            }
            
            $totalProducts = $productQuery->count();
            $activeProducts = (clone $productQuery)->active()->count();
            $totalSales = (clone $saleQuery)->completed()->count();
            $monthlyRevenue = (clone $saleQuery)->completed()->thisMonth()->sum('total_amount');
            $yearlyRevenue = (clone $saleQuery)->completed()->thisYear()->sum('total_amount');
            
            // Productos con bajo stock
            $lowStockProducts = (clone $productQuery)->where('stock', '<=', 5)->where('stock', '>', 0)->with('user.business')->get();
            
            // Ventas recientes
            $recentSales = (clone $saleQuery)->with(['product', 'product.user.business'])
                ->orderBy('sale_date', 'desc')
                ->limit(5)
                ->get();
            
            // Productos más vendidos
            $topProducts = (clone $productQuery)->withCount(['sales as total_sold' => function($query) {
                    $query->where('status', 'completed');
                }])
                ->with('user.business')
                ->orderBy('total_sold', 'desc')
                ->limit(5)
                ->get();
        } elseif ($user->hasRole('admin')) {
            // Estadísticas de la empresa para admin
            $totalProducts = $user->products()->count();
            $activeProducts = $user->products()->active()->count();
            $totalSales = $user->sales()->completed()->count();
            $monthlyRevenue = $user->sales()->completed()->thisMonth()->sum('total_amount');
            $yearlyRevenue = $user->sales()->completed()->thisYear()->sum('total_amount');
            
            // Productos con bajo stock de su empresa
            $lowStockProducts = $user->products()->where('stock', '<=', 5)->where('stock', '>', 0)->get();
            
            // Ventas recientes de su empresa
            $recentSales = $user->sales()->with('product')
                ->orderBy('sale_date', 'desc')
                ->limit(5)
                ->get();
            
            // Productos más vendidos de su empresa
            $topProducts = $user->products()
                ->withCount(['sales as total_sold' => function($query) {
                    $query->where('status', 'completed');
                }])
                ->orderBy('total_sold', 'desc')
                ->limit(5)
                ->get();
        } else {
            // Sin acceso para otros roles
            $totalProducts = 0;
            $activeProducts = 0;
            $totalSales = 0;
            $monthlyRevenue = 0;
            $yearlyRevenue = 0;
            $lowStockProducts = collect();
            $recentSales = collect();
            $topProducts = collect();
        }
        
        // Obtener todas las empresas para el filtro (solo para superadmin)
        $businesses = collect();
        if ($user->hasRole('superadmin')) {
            $businesses = Business::orderBy('business_name')->get();
        }
        
        return view('livewire.admin.dashboard', [
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'totalSales' => $totalSales,
            'monthlyRevenue' => $monthlyRevenue,
            'yearlyRevenue' => $yearlyRevenue,
            'lowStockProducts' => $lowStockProducts,
            'recentSales' => $recentSales,
            'topProducts' => $topProducts,
            'businesses' => $businesses,
        ])->layout('layouts.admin');
    }
}
