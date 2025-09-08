<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Rutas del catálogo público
Route::get('/catalogo/{slug}', [App\Http\Controllers\CatalogController::class, 'show'])->name('catalog.show');
Route::get('/catalogo/{slug}/checkout', [App\Http\Controllers\CatalogController::class, 'checkout'])->name('catalog.checkout');
Route::post('/catalogo/{slug}/order', [App\Http\Controllers\CatalogController::class, 'processOrder'])->name('catalog.process-order');
Route::get('/catalogo/{slug}/orden/{orderNumber}', [App\Http\Controllers\CatalogController::class, 'orderConfirmation'])->name('catalog.order-confirmation');
Route::post('/catalogo/{slug}/upload-payment-proof/{orderNumber}', [App\Http\Controllers\CatalogController::class, 'uploadPaymentProof'])->name('catalog.upload-payment-proof');

// Ruta personalizada para registro con parámetro de plan (debe ir antes de Auth::routes())
Route::get('/register/{plan?}', [App\Http\Controllers\Auth\RegisterController::class, 'showRegistrationForm'])->name('register');

Auth::routes(['register' => false]);

Route::get('/home', [App\Http\Livewire\Admin\Dashboard::class, 'dashboard'])->name('home');

// Admin Routes
Route::prefix('admin')->middleware('auth')->group(function () {
    Route::get('/', App\Http\Livewire\Admin\Dashboard::class)->name('admin.dashboard');
    Route::get('/profile', App\Http\Livewire\Admin\Profile::class)->name('admin.profile');
    Route::get('/business', App\Http\Livewire\Admin\BusinessInfo::class)->name('admin.business');
    Route::get('/products', App\Http\Livewire\Admin\Products::class)->name('admin.products');
    Route::get('/orders', App\Http\Livewire\Admin\Orders::class)->name('admin.orders');
    Route::get('/orders/{order}', App\Http\Livewire\Admin\OrderDetail::class)->name('admin.orders.show');
    Route::get('/sales', App\Http\Livewire\Admin\SalesReports::class)->name('admin.sales');
});
