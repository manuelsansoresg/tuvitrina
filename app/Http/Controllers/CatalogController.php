<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\PaymentProof;
use App\Notifications\NewOrderNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class CatalogController extends Controller
{
    public function show($slug)
    {
        $business = Business::where('slug', $slug)->firstOrFail();
        
        $products = Product::where('user_id', $business->user_id)
            ->active()
            ->inStock()
            ->orderBy('created_at', 'desc')
            ->get();

        return view('catalog.show', compact('business', 'products'));
    }

    public function checkout($slug, Request $request)
    {
        $business = Business::where('slug', $slug)->firstOrFail();
        
        // Decodificar datos del carrito
        $cartData = json_decode(urldecode($request->get('cart')), true);
        
        if (!$cartData || empty($cartData)) {
            return redirect()->route('catalog.show', $slug)->with('error', 'El carrito está vacío');
        }
        
        // Validar productos y calcular total
        $cartItems = [];
        $total = 0;
        
        foreach ($cartData as $item) {
            $product = Product::where('id', $item['id'])
                ->where('user_id', $business->user_id)
                ->active()
                ->inStock()
                ->first();
                
            if (!$product) {
                continue; // Saltar productos no válidos
            }
            
            if ($product->stock < $item['quantity']) {
                return redirect()->route('catalog.show', $slug)
                    ->with('error', "No hay suficiente stock de {$product->name}");
            }
            
            $cartItems[] = [
                'product' => $product,
                'quantity' => $item['quantity'],
                'subtotal' => $product->price * $item['quantity']
            ];
            
            $total += $product->price * $item['quantity'];
        }
        
        if (empty($cartItems)) {
            return redirect()->route('catalog.show', $slug)->with('error', 'No hay productos válidos en el carrito');
        }
        
        return view('catalog.checkout', compact('business', 'cartItems', 'total'));
    }

    public function processOrder($slug, Request $request)
    {
        $business = Business::where('slug', $slug)->firstOrFail();
        
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'cart_data' => 'required|string',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        // Decodificar datos del carrito
        $cartData = json_decode($request->cart_data, true);
        
        if (!$cartData || empty($cartData)) {
            return back()->with('error', 'Error en los datos del carrito');
        }
        
        // Crear la orden
        $order = Order::create([
            'business_id' => $business->id,
            'customer_name' => $request->customer_name,
            'customer_email' => $request->customer_email,
            'customer_phone' => $request->customer_phone,
            'total_amount' => 0, // Se calculará después
            'status' => 'pending',
            'notes' => $request->notes,
        ]);
        
        $total = 0;
        
        // Crear items de la orden
        foreach ($cartData as $item) {
            $product = Product::where('id', $item['id'])
                ->where('user_id', $business->user_id)
                ->active()
                ->inStock()
                ->first();
                
            if (!$product || $product->stock < $item['quantity']) {
                $order->delete();
                return back()->with('error', "Error con el producto: {$item['name']}");
            }
            
            $subtotal = $product->price * $item['quantity'];
            
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'total_price' => $subtotal,
            ]);
            
            $total += $subtotal;
        }
        
        // Actualizar total de la orden
        $order->update(['total_amount' => $total]);
        
        // Enviar notificación al propietario del negocio
        $businessOwner = User::find($business->user_id);
        if ($businessOwner) {
            $businessOwner->notify(new NewOrderNotification($order));
        }
        
        return redirect()->route('catalog.order-confirmation', [$slug, $order->order_number])
            ->with('success', 'Orden creada exitosamente');
    }

    public function orderConfirmation($slug, $orderNumber)
    {
        $business = Business::where('slug', $slug)->firstOrFail();
        $order = Order::where('order_number', $orderNumber)
            ->where('business_id', $business->id)
            ->with(['items.product', 'paymentProof'])
            ->firstOrFail();
            
        return view('catalog.order-confirmation', compact('business', 'order'));
    }
    
    public function uploadPaymentProof(Request $request, $slug, $orderNumber)
    {
        $business = Business::where('slug', $slug)->firstOrFail();
        $order = Order::where('order_number', $orderNumber)
            ->where('business_id', $business->id)
            ->firstOrFail();
            
        $request->validate([
            'payment_proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
        ]);
        
        // Verificar si ya existe un comprobante
        if ($order->paymentProof) {
            return back()->with('error', 'Ya se ha subido un comprobante para esta orden');
        }
        
        $file = $request->file('payment_proof');
        $filename = time() . '_' . $order->order_number . '.' . $file->getClientOriginalExtension();
        
        // Obtener información del archivo antes de moverlo
        $originalFilename = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();
        
        // Crear directorio si no existe
        $destinationPath = public_path('payment-proofs');
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }
        
        // Mover archivo directamente a public
        $file->move($destinationPath, $filename);
        $path = 'payment-proofs/' . $filename;
        
        PaymentProof::create([
            'order_id' => $order->id,
            'file_path' => $path,
            'original_filename' => $originalFilename,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'uploaded_at' => now(),
            'status' => 'pending'
        ]);
        
        return back()->with('success', 'Comprobante de pago subido exitosamente');
    }
}
