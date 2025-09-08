<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $business->business_name }} - Catálogo</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- Styles -->
    <link href="{{ mix('css/app.css') }}" rel="stylesheet">
    
    <style>
        .hero-bg {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            position: relative;
            overflow: hidden;
        }
        
        .hero-bg::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
        }
        
        .business-cover {
            height: 300px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }
        
        .product-card {
            transition: all 0.3s ease;
            border: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .product-image {
            height: 200px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }
        
        .price-tag {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
        }
        
        .social-links a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: white;
            text-decoration: none;
            margin: 0 5px;
            transition: all 0.3s ease;
        }
        
        .social-links .facebook { background: #1877f2; }
        .social-links .instagram { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); }
        .social-links .twitter { background: #1da1f2; }
        
        .social-links a:hover {
            transform: scale(1.1);
        }
        
        .payment-info {
            background: #f8f9fa;
            border-left: 4px solid #6366f1;
            padding: 20px;
            border-radius: 8px;
        }
        
        .no-products {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }
        
        .btn-primary-custom {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            color: white;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-primary-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
            color: white;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top" style="background: rgba(99, 102, 241, 0.95); backdrop-filter: blur(10px);">
        <div class="container">
            <a class="navbar-brand fw-bold fs-3" href="{{ url('/') }}">
                <i class="fas fa-store text-warning me-2"></i>TuVitrina
            </a>
            <div class="ms-auto">
                <a href="{{ url('/') }}" class="btn btn-outline-light btn-sm">
                    <i class="fas fa-home me-2"></i>Inicio
                </a>
            </div>
        </div>
    </nav>

    <!-- Business Header -->
    <section class="hero-bg pt-5">
        <div class="container pt-5">
            <div class="row align-items-center py-5">
                <div class="col-lg-8">
                    <h1 class="display-4 fw-bold text-white mb-3">{{ $business->business_name }}</h1>
                    @if($business->about)
                        <p class="lead text-white mb-4">{{ $business->about }}</p>
                    @endif
                    
                    <!-- Social Links -->
                    @if($business->facebook_url || $business->instagram_url || $business->twitter_url)
                        <div class="social-links mb-4">
                            @if($business->facebook_url)
                                <a href="{{ $business->facebook_url }}" target="_blank" class="facebook">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                            @endif
                            @if($business->instagram_url)
                                <a href="{{ $business->instagram_url }}" target="_blank" class="instagram">
                                    <i class="fab fa-instagram"></i>
                                </a>
                            @endif
                            @if($business->twitter_url)
                                <a href="{{ $business->twitter_url }}" target="_blank" class="twitter">
                                    <i class="fab fa-twitter"></i>
                                </a>
                            @endif
                        </div>
                    @endif
                </div>
                <div class="col-lg-4 text-center">
                    @if($business->cover_image)
                        <div class="business-cover rounded-circle mx-auto" 
                             style="width: 200px; height: 200px; background-image: url('{{ asset('images/business/' . $business->cover_image) }}');"></div>
                    @else
                        <div class="bg-white bg-opacity-20 rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                             style="width: 200px; height: 200px;">
                            <i class="fas fa-store text-white" style="font-size: 4rem;"></i>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </section>

    <!-- Payment Information -->
    @if($business->accepts_bank_transfer)
        <section class="py-4 bg-light">
            <div class="container">
                <div class="payment-info">
                    <h5 class="fw-bold mb-3"><i class="fas fa-credit-card me-2"></i>Información de Pago</h5>
                    <div class="row">
                        @if($business->bank_name)
                            <div class="col-md-4 mb-2">
                                <strong>Banco:</strong> {{ $business->bank_name }}
                            </div>
                        @endif
                        @if($business->account_number)
                            <div class="col-md-4 mb-2">
                                <strong>Cuenta:</strong> {{ $business->account_number }}
                            </div>
                        @endif
                        @if($business->account_holder)
                            <div class="col-md-4 mb-2">
                                <strong>Titular:</strong> {{ $business->account_holder }}
                            </div>
                        @endif
                        @if($business->clabe)
                            <div class="col-md-4 mb-2">
                                <strong>CLABE:</strong> {{ $business->clabe }}
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </section>
    @endif

    <!-- Products Catalog -->
    <section class="py-5">
        <div class="container">
            <div class="row mb-5">
                <div class="col-12 text-center">
                    <h2 class="display-5 fw-bold mb-3">Nuestros Productos</h2>
                    <p class="lead text-muted">Descubre nuestra selección de productos disponibles</p>
                </div>
            </div>
            
            @if($products->count() > 0)
                <div class="row g-4">
                    @foreach($products as $product)
                        <div class="col-lg-4 col-md-6">
                            <div class="card product-card h-100">
                                @if($product->images && count($product->images) > 0)
                                    <div class="product-image" style="background-image: url('{{ asset('images/products/' . $product->images[0]) }}');"></div>
                                @else
                                    <div class="product-image bg-light d-flex align-items-center justify-content-center">
                                        <i class="fas fa-image text-muted" style="font-size: 3rem;"></i>
                                    </div>
                                @endif
                                
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title fw-bold mb-2">{{ $product->name }}</h5>
                                    @if($product->description)
                                        <p class="card-text text-muted mb-3">{{ Str::limit($product->description, 100) }}</p>
                                    @endif
                                    
                                    <div class="mt-auto">
                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <span class="price-tag">${{ number_format($product->price, 2) }}</span>
                                            @if($product->stock > 0)
                                                <small class="text-success">
                                                    <i class="fas fa-check-circle me-1"></i>{{ $product->stock }} disponibles
                                                </small>
                                            @endif
                                        </div>
                                        
                                        @if($product->category)
                                            <span class="badge bg-secondary mb-2">{{ $product->category }}</span>
                                        @endif
                                        
                                        @if($product->sku)
                                            <small class="text-muted d-block mb-3">SKU: {{ $product->sku }}</small>
                                        @endif
                                        
                                        @if($product->stock > 0)
                                            <div class="d-flex align-items-center gap-2">
                                                <div class="input-group" style="max-width: 120px;">
                                                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick="decreaseQuantity({{ $product->id }})">
                                                        <i class="fas fa-minus"></i>
                                                    </button>
                                                    <input type="number" class="form-control form-control-sm text-center" 
                                                           id="quantity-{{ $product->id }}" value="1" min="1" max="{{ $product->stock }}">
                                                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick="increaseQuantity({{ $product->id }}, {{ $product->stock }})">
                                                        <i class="fas fa-plus"></i>
                                                    </button>
                                                </div>
                                                <button class="btn btn-primary-custom btn-sm flex-grow-1" 
                                                        onclick="addToCart({{ $product->id }}, '{{ $product->name }}', {{ $product->price }}, {{ $product->stock }})">
                                                    <i class="fas fa-cart-plus me-1"></i>Agregar
                                                </button>
                                            </div>
                                        @else
                                            <button class="btn btn-secondary btn-sm w-100" disabled>
                                                <i class="fas fa-times me-1"></i>Sin Stock
                                            </button>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <div class="no-products">
                    <i class="fas fa-box-open" style="font-size: 4rem; color: #dee2e6; margin-bottom: 20px;"></i>
                    <h4 class="mb-3">No hay productos disponibles</h4>
                    <p>Este negocio aún no ha agregado productos a su catálogo.</p>
                </div>
            @endif
        </div>
    </section>

    <!-- Contact Section -->
    <section class="py-5 bg-light">
        <div class="container text-center">
            <h3 class="fw-bold mb-4">¿Interesado en nuestros productos?</h3>
            <p class="lead mb-4">Contáctanos para más información o para realizar tu pedido</p>
            
            @if($business->facebook_url || $business->instagram_url || $business->twitter_url)
                <div class="social-links">
                    @if($business->facebook_url)
                        <a href="{{ $business->facebook_url }}" target="_blank" class="facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                    @endif
                    @if($business->instagram_url)
                        <a href="{{ $business->instagram_url }}" target="_blank" class="instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                    @endif
                    @if($business->twitter_url)
                        <a href="{{ $business->twitter_url }}" target="_blank" class="twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                    @endif
                </div>
            @endif
        </div>
    </section>

    <!-- Carrito Flotante -->
    <div class="cart-float" id="cartFloat" style="display: none;">
        <div class="cart-header">
            <h5 class="mb-0"><i class="fas fa-shopping-cart me-2"></i>Mi Carrito</h5>
            <button class="btn-close" onclick="toggleCart()"></button>
        </div>
        <div class="cart-body" id="cartItems">
            <!-- Items del carrito se agregan aquí -->
        </div>
        <div class="cart-footer">
            <div class="cart-total mb-3">
                <strong>Total: $<span id="cartTotal">0.00</span></strong>
            </div>
            <button class="btn btn-primary-custom w-100" onclick="proceedToCheckout()" id="checkoutBtn" disabled>
                <i class="fas fa-credit-card me-2"></i>Proceder al Pago
            </button>
        </div>
    </div>

    <!-- Botón del Carrito -->
    <div class="cart-button" id="cartButton" onclick="toggleCart()" style="display: none;">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count" id="cartCount">0</span>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p class="mb-2">&copy; 2024 {{ $business->business_name }}. Todos los derechos reservados.</p>
            <p class="mb-0">Powered by <strong>TuVitrina</strong></p>
        </div>
    </footer>

    <style>
        .cart-float {
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            width: 350px;
            max-height: 80vh;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1050;
            display: flex;
            flex-direction: column;
        }
        
        .cart-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border-radius: 15px 15px 0 0;
        }
        
        .cart-body {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            max-height: 400px;
        }
        
        .cart-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            background: #f8f9fa;
            border-radius: 0 0 15px 15px;
        }
        
        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .cart-item:last-child {
            border-bottom: none;
        }
        
        .cart-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            z-index: 1040;
            transition: all 0.3s ease;
        }
        
        .cart-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }
        
        .cart-count {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .cart-total {
            font-size: 1.2rem;
            text-align: center;
        }
        
        .item-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .quantity-control {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .quantity-control button {
            width: 25px;
            height: 25px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        
        .quantity-control input {
            width: 40px;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 2px;
        }
    </style>

    <!-- Scripts -->
    <script src="{{ mix('js/app.js') }}"></script>
    <script>
        let cart = [];
        let businessSlug = '{{ $business->slug }}';
        
        function increaseQuantity(productId, maxStock) {
            const input = document.getElementById(`quantity-${productId}`);
            const currentValue = parseInt(input.value);
            if (currentValue < maxStock) {
                input.value = currentValue + 1;
            }
        }
        
        function decreaseQuantity(productId) {
            const input = document.getElementById(`quantity-${productId}`);
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
            }
        }
        
        function addToCart(productId, productName, price, stock) {
            const quantityInput = document.getElementById(`quantity-${productId}`);
            const quantity = parseInt(quantityInput.value);
            
            // Verificar si el producto ya está en el carrito
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity <= stock) {
                    existingItem.quantity = newQuantity;
                } else {
                    alert(`Solo hay ${stock} unidades disponibles de ${productName}`);
                    return;
                }
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: price,
                    quantity: quantity,
                    stock: stock
                });
            }
            
            updateCartDisplay();
            quantityInput.value = 1; // Reset quantity
            
            // Mostrar mensaje de éxito
            showToast(`${productName} agregado al carrito`);
        }
        
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartDisplay();
        }
        
        function updateCartQuantity(productId, newQuantity) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                if (newQuantity <= 0) {
                    removeFromCart(productId);
                } else if (newQuantity <= item.stock) {
                    item.quantity = newQuantity;
                    updateCartDisplay();
                } else {
                    alert(`Solo hay ${item.stock} unidades disponibles`);
                }
            }
        }
        
        function updateCartDisplay() {
            const cartItems = document.getElementById('cartItems');
            const cartCount = document.getElementById('cartCount');
            const cartTotal = document.getElementById('cartTotal');
            const cartButton = document.getElementById('cartButton');
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="text-muted text-center">Tu carrito está vacío</p>';
                cartButton.style.display = 'none';
                checkoutBtn.disabled = true;
            } else {
                cartButton.style.display = 'flex';
                checkoutBtn.disabled = false;
                
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small class="text-muted">$${item.price.toFixed(2)} c/u</small>
                        </div>
                        <div class="item-controls">
                            <div class="quantity-control">
                                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" value="${item.quantity}" min="1" max="${item.stock}" 
                                       onchange="updateCartQuantity(${item.id}, parseInt(this.value))">
                                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            cartCount.textContent = totalItems;
            cartTotal.textContent = totalAmount.toFixed(2);
        }
        
        function toggleCart() {
            const cartFloat = document.getElementById('cartFloat');
            cartFloat.style.display = cartFloat.style.display === 'none' ? 'flex' : 'none';
        }
        
        function proceedToCheckout() {
            if (cart.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            
            // Crear URL con los datos del carrito
            const cartData = encodeURIComponent(JSON.stringify(cart));
            const checkoutUrl = `/catalogo/${businessSlug}/checkout?cart=${cartData}`;
            
            window.location.href = checkoutUrl;
        }
        
        function showToast(message) {
            // Crear toast notification
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    ${message}
                </div>
            `;
            
            // Estilos del toast
            toast.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1060;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            
            document.body.appendChild(toast);
            
            // Animar entrada
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            // Remover después de 3 segundos
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }
        
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Inicializar carrito al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            updateCartDisplay();
        });
    </script>
</body>
</html>