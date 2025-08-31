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

Auth::routes();

Route::get('/home', [App\Http\Livewire\Admin\Dashboard::class, 'dashboard'])->name('home');

// Admin Routes
Route::prefix('admin')->middleware('auth')->group(function () {
    Route::get('/', App\Http\Livewire\Admin\Dashboard::class)->name('admin.dashboard');
    Route::get('/profile', App\Http\Livewire\Admin\Profile::class)->name('admin.profile');
    Route::get('/business', App\Http\Livewire\Admin\BusinessInfo::class)->name('admin.business');
    Route::get('/products', App\Http\Livewire\Admin\Products::class)->name('admin.products');
    Route::get('/sales', App\Http\Livewire\Admin\SalesReports::class)->name('admin.sales');
});
