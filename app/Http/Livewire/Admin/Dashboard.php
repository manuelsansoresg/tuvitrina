<?php

namespace App\Http\Livewire\Admin;

use Livewire\Component;
use App\Models\Product;
use App\Models\Sale;
use Carbon\Carbon;

class Dashboard extends Component
{
    public function render()
    {
        $user = auth()->user();
        
        // Estadísticas generales
        $totalProducts = $user->products()->count();
        $activeProducts = $user->products()->active()->count();
        $totalSales = $user->sales()->completed()->count();
        $monthlyRevenue = $user->sales()->completed()->thisMonth()->sum('total_amount');
        $yearlyRevenue = $user->sales()->completed()->thisYear()->sum('total_amount');
        
        // Productos con bajo stock
        $lowStockProducts = $user->products()->where('stock', '<=', 5)->where('stock', '>', 0)->get();
        
        // Ventas recientes
        $recentSales = $user->sales()->with('product')
            ->orderBy('sale_date', 'desc')
            ->limit(5)
            ->get();
        
        // Productos más vendidos
        $topProducts = $user->products()
            ->withCount(['sales as total_sold' => function($query) {
                $query->where('status', 'completed');
            }])
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();
        
        return view('livewire.admin.dashboard', [
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'totalSales' => $totalSales,
            'monthlyRevenue' => $monthlyRevenue,
            'yearlyRevenue' => $yearlyRevenue,
            'lowStockProducts' => $lowStockProducts,
            'recentSales' => $recentSales,
            'topProducts' => $topProducts,
        ])->layout('layouts.admin');
    }
}
